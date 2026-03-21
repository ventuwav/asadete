import asyncio
import sys
from patched_client import PatchedNotebookLMClient
from notebooklm_mcp.config import ServerConfig, AuthConfig

async def main():
    print("[*] B.L.A.S.T Protocol: Phase 2 - Link Verification")
    
    # PATCH: Set headless=False so the user can interactively login on the first run.
    config = ServerConfig(
        headless=False,
        timeout=300, # Large timeout for manual login
        auth=AuthConfig(use_persistent_session=True)
    )
    
    client = PatchedNotebookLMClient(config)
    print("[*] Starting NotebookLM Browser Client in GUI mode...")
    
    try:
        await client.start()
        print("[*] Browser started. Please log in to Google if prompted.")
        
        is_auth = await client.authenticate()
        if is_auth:
            print("[+] LINK SUCCESS: Authenticated with NotebookLM!")
        else:
            print("[-] LINK FAILED: You must log in via the browser window that just opened.")
            print("You have 120 seconds to log in to NotebookLM in the opened window...")
            await asyncio.sleep(120)
            print("Time's up. Checking auth again...")
            if await client.authenticate():
                print("[+] LINK SUCCESS: Authenticated with NotebookLM!")
            else:
                print("[-] Login not completed in time.")
            
    except Exception as e:
        print(f"[-] ERROR during handshake: {e}")
    finally:
        await client.close()
        print("[*] Browser closed. Handshake complete.")

if __name__ == "__main__":
    asyncio.run(main())
