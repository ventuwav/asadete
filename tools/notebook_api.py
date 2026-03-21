import asyncio
import sys
import json
import re
from loguru import logger
import uuid
import math

from patched_client import PatchedNotebookLMClient
from notebooklm_mcp.config import ServerConfig, AuthConfig

DB_PROMPT = """
You are a strict data extraction tool. Read the current notebook and extract all expenses and participants.
Return ONLY a valid JSON object matching this schema. NO markdown backticks (```json). NO conversational text.

{
  "title": "Asado",
  "participants": ["Name1", "Name2", "Name3"],
  "expenses": [
    {
      "description": "Item description",
      "amount": 1000.0,
      "payer_name": "Name1"
    }
  ]
}
"""

def extract_json_from_text(text: str) -> dict:
    """Attempts to find and load a JSON block from free text."""
    # Sometimes it wraps in ```json ... ```
    match = re.search(r"```json\s*(\{.*?\})\s*```", text, re.DOTALL)
    if match:
        raw = match.group(1)
    else:
        # Greedily search for the first { and last }
        first_brace = text.find('{')
        last_brace = text.rfind('}')
        if first_brace != -1 and last_brace != -1:
            raw = text[first_brace:last_brace+1]
        else:
            raise ValueError("No JSON-like structure found in response.")
    
    return json.loads(raw)

def compute_balances(data: dict) -> dict:
    """
    Computes zero-sum balances based on B.L.A.S.T Layer 1 SOP.
    """
    expenses = data.get("expenses", [])
    participants = data.get("participants", [])
    
    # Auto-add missing participants from the expenses list just in case
    for exp in expenses:
        if exp.get("payer_name") not in participants:
            participants.append(exp.get("payer_name"))
            
    num_participants = len(participants)
    if num_participants == 0:
        return data

    total_pool = sum(float(exp.get("amount", 0)) for exp in expenses)
    per_person = round(total_pool / num_participants, 2)
    
    # Track how much each person paid
    paid_map = {p: 0.0 for p in participants}
    for exp in expenses:
        payer = exp.get("payer_name")
        amt = float(exp.get("amount", 0))
        if payer in paid_map:
            paid_map[payer] += amt
            
    # Compute final balance: (Amount Paid) - (Per Person Share)
    # Positive = Group owes them. Negative = They owe the group.
    balances = {}
    for p in participants:
        bal = round(paid_map[p] - per_person, 2)
        balances[p] = bal

    data["total_pool"] = total_pool
    data["per_person"] = per_person
    data["balances"] = balances
    return data

async def run_extraction():
    config = ServerConfig(
        headless=True,
        timeout=60,
        auth=AuthConfig(use_persistent_session=True)
    )
    client = PatchedNotebookLMClient(config)
    
    logger.info("Connecting to NotebookLM Headlessly...")
    try:
        await client.start()
        is_auth = await client.authenticate()
        if not is_auth:
            raise RuntimeError("Authentication failed. Run handshake.py manually.")
            
        logger.info("Navigating to Asadete Notebook...")
        await client.navigate_to_notebook("b43068a7-f01f-4728-a685-1ce5203757dd")
        
        logger.info("Requesting Ledger JSON from NotebookLM...")
        await client.send_message(DB_PROMPT)
        raw_response = await client.get_response(wait_for_completion=True, max_wait=60)
        
        logger.info("Parsing response...")
        try:
            parsed_data = extract_json_from_text(raw_response)
        except Exception as e:
            logger.error(f"Failed to parse JSON: {e}\nRaw Response:\n{raw_response}")
            sys.exit(1)
            
        logger.info("Computing Balances...")
        final_payload = compute_balances(parsed_data)
        
        # Save securely to .tmp so the frontend can read it later
        import os
        os.makedirs("../.tmp", exist_ok=True)
        out_path = "../.tmp/asadete_payload.json"
        with open(out_path, "w") as f:
            json.dump(final_payload, f, indent=2)
            
        logger.info(f"SUCCESS. Payload written to {out_path}")
        print("\n=== FINAL BALANCES ===")
        for p, b in final_payload["balances"].items():
            print(f"{p}: {'OWED' if b > 0 else 'OWES'} ${abs(b)}")
            
    except Exception as e:
        logger.error(f"Tool failed: {e}")
        sys.exit(1)
    finally:
        await client.close()

if __name__ == "__main__":
    asyncio.run(run_extraction())
