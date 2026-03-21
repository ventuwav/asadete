from pathlib import Path
from selenium import webdriver
from selenium.webdriver.chrome.options import Options as ChromeOptions
from notebooklm_mcp.client import NotebookLMClient
from loguru import logger

class PatchedNotebookLMClient(NotebookLMClient):
    """
    B.L.A.S.T Self-Annealing Patch:
    Subclass of NotebookLMClient that fixes a bug in the upstream library
    where use_persistent_session was completely ignored when using regular Selenium
    instead of undetected-chromedriver.
    """
    def _start_regular_chrome(self) -> None:
        opts = ChromeOptions()

        # Anti-detection options
        opts.add_argument("--no-sandbox")
        opts.add_argument("--disable-dev-shm-usage")
        opts.add_argument("--disable-gpu")
        opts.add_argument("--disable-blink-features=AutomationControlled")
        opts.add_experimental_option("excludeSwitches", ["enable-automation"])
        opts.add_experimental_option("useAutomationExtension", False)
        
        # FIX: Add persistent session storage for regular Chrome!
        if getattr(self.config.auth, 'use_persistent_session', False):
            profile_path = Path(self.config.auth.profile_dir).absolute()
            profile_path.mkdir(parents=True, exist_ok=True)
            opts.add_argument(f"--user-data-dir={profile_path}")
            logger.info(f"Patched: Persistent cookies active at {profile_path}")

        opts.add_argument(
            "--user-agent=Mozilla/5.0 (Windows NT 10.0; Win64; x64) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/120.0.0.0 Safari/537.36"
        )

        if self.config.headless:
            opts.add_argument("--headless=new")

        self.driver = webdriver.Chrome(options=opts)
        self.driver.execute_script(
            "Object.defineProperty(navigator, 'webdriver', {get: () => undefined})"
        )
