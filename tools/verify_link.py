import asyncio
import sys
from patched_client import PatchedNotebookLMClient
from notebooklm_mcp.config import ServerConfig, AuthConfig

async def main():
    print("[*] B.L.A.S.T Protocol: Phase 2 - Final Headless Verification")
    
    # We now revert to headless=True to ensure automation can run invisibly.
    config = ServerConfig(
        headless=True,
        timeout=30,
        auth=AuthConfig(use_persistent_session=True)
    )
    
    client = PatchedNotebookLMClient(config)
    print("[*] Starting Headless NotebookLM Client...")
    
    try:
        await client.start()
        is_auth = await client.authenticate()
        if is_auth:
            print("[+] SYSTEM LINK SUCCESS: Headless Automation is fully functional.")
        else:
            print("[-] LINK FAILED: Headless automation could not authenticate. Session might not be saved.")
            sys.exit(1)
            
    except Exception as e:
        print(f"[-] ERROR during verification: {e}")
        sys.exit(1)
    finally:
        await client.close()
        print("[*] Verification complete.")

if __name__ == "__main__":
    asyncio.run(main())
