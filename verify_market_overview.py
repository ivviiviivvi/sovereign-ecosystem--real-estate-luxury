from playwright.sync_api import sync_playwright
import time

def run():
    with sync_playwright() as p:
        browser = p.chromium.launch()
        context = browser.new_context()
        page = context.new_page()

        page.on("console", lambda msg: print(f"Browser Console: {msg.text}"))
        page.on("pageerror", lambda err: print(f"Browser Error: {err}"))

        print("Navigating to localhost:5001...")
        try:
            page.goto("http://localhost:5001", timeout=10000)
            print("Page loaded.")
        except Exception as e:
            print(f"Error loading page: {e}")
            browser.close()
            return

        # 1. Landing Page
        print("Waiting for 'Client Experience' button...")
        try:
            page.wait_for_selector("text=Client Experience", timeout=5000)
            page.click("text=Client Experience")
            print("Clicked 'Client Experience'.")
        except Exception as e:
            print(f"Failed to find/click role selector: {e}")
            browser.close()
            return

        # 2. Client Auth
        print("Waiting for Invite Code input...")
        try:
            page.wait_for_selector("input#invite-code", timeout=5000)
            time.sleep(0.5)
            page.fill("input#invite-code", "VIPACCESS")
            print("Entered invite code.")
            page.click("button[type='submit']")
            print("Clicked Enter.")
        except Exception as e:
            print(f"Failed during auth: {e}")
            browser.close()
            return

        # 3. Dashboard Wait
        print("Waiting for dashboard...")
        try:
            # Wait for text "Feed" and "Market" which are tabs
            page.wait_for_selector("text=Market", timeout=15000)
            print("Dashboard loaded (found 'Market' tab text).")
        except Exception as e:
            print(f"Failed to load dashboard: {e}")
            print("Body text content (truncated):")
            print(page.inner_text("body")[:500])
            browser.close()
            return

        # 5. Navigate to Market
        print("Clicking 'Market' tab...")
        try:
            page.click("text=Market")
            time.sleep(2) # Animation wait
        except Exception as e:
            print(f"Failed to switch tabs: {e}")
            browser.close()
            return

        # 6. Verify Market Overview
        print("Waiting for 'Market Overview' component...")
        try:
            # Look for the header "Market Overview"
            page.wait_for_selector("h2:has-text('Market Overview')", timeout=10000)
            print("SUCCESS: Found 'Market Overview'.")
            page.screenshot(path="success_market_overview.png")
        except Exception as e:
            print(f"FAILED: Could not find 'Market Overview'.")
            print("Body text content (truncated):")
            print(page.inner_text("body")[:500])
            page.screenshot(path="debug_market_tab.png")

        browser.close()

if __name__ == "__main__":
    run()
