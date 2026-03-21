# Link Verification SOP (Layer 1)

## NotebookLM Client Authentication
The backend relies on the `notebooklm_mcp` Python client, which uses Selenium Browser Automation.

### Invariant 1: Persistent Session
The client **must** be run with `use_persistent_session=True` so that the Google authentication cookies are saved locally.

### Invariant 2: First-Time Setup
If the persistent session is empty, the script **will fail** if run with `headless=True`.
**Fix:** The client must be run with `headless=False` on the first setup so that the user can manually pass Google's login checks.

Once authentication is verified manually, standard `tools/` logic can revert to `headless=True`.
