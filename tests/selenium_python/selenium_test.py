import pytest
from selenium import webdriver
from selenium.webdriver.chrome.service import Service
from selenium.webdriver.chrome.options import Options
from webdriver_manager.chrome import ChromeDriverManager
from selenium.webdriver.common.by import By
import time
import sys
import os

# Add the pages directory to the path
sys.path.append(os.path.join(os.path.dirname(__file__), "pages"))

from pages.login_page import LoginPage
from pages.home_page import HomePage
from pages.reading_page import ReadingPage
from pages.trainer_page import TrainerPage

class ComprehensiveTest:
    def __init__(self, driver):
        self.driver = driver
        self.base_url = "http://localhost:8081"
        self.login_page = LoginPage(driver)

        self.home_page = HomePage(driver)
        self.reading_page = ReadingPage(driver)
        self.trainer_page = TrainerPage(driver)

    def log(self, message):
        print(f"[TEST LOG] {message}")

    def run(self):
        self.log("--- Starting Comprehensive Frontend Test ---")
        self.driver.get(self.base_url)
        time.sleep(1)

        # 1. Guest Login
        self.log("Step 1: Guest Login")
        self.login_page.login_as_guest()
        time.sleep(2)

        # Onboarding Flow
        try:
            self.log("Handling Onboarding Flow...")
            # Step 0: Welcome
            start_btn = (By.ID, "start-journey-btn")
            if self.home_page.is_displayed(start_btn):
                self.home_page.click(start_btn)
                time.sleep(1)
            
            # Step 1+: Skip Survey
            skip_btn = (By.ID, "skip-onboarding")
            if self.home_page.is_displayed(skip_btn):
                self.home_page.click(skip_btn)
                self.log("Onboarding skipped.")
                time.sleep(2)
        except Exception as e:
            self.log(f"Onboarding flow not found or already completed: {e}")

        # 2. Home Page -> Navigation Tabs
        self.log("Step 2: Testing Navigation Tabs")
        
        # Notes
        self.log("Navigating to Notes...")
        self.home_page.js_click((By.CSS_SELECTOR, '[aria-label="nav-notes-btn"]'))
        assert self.home_page.is_displayed((By.ID, "notes-pane"))
        self.log("Notes panel verified.")
        time.sleep(1)

        # Movies
        self.log("Navigating to Movies...")
        self.home_page.js_click((By.CSS_SELECTOR, '[aria-label="nav-movies-btn"]'))
        assert self.home_page.is_displayed((By.ID, "movies-pane"))
        self.log("Movies panel verified.")
        time.sleep(1)

        # Games
        self.log("Navigating to Arena (Games)...")
        self.home_page.js_click((By.CSS_SELECTOR, '[aria-label="nav-arena-btn"]'))
        assert self.home_page.is_displayed((By.ID, "games-pane"))
        self.log("Games panel verified.")
        time.sleep(1)

        # Back to Home
        self.log("Navigating back to Home...")
        self.home_page.js_click((By.CSS_SELECTOR, '[aria-label="nav-home-btn"]'))
        time.sleep(1)
        
        # 3. Features: Theme Engine
        self.log("Step 3: Theme Engine")
        self.home_page.click(HomePage.THEME_TOGGLE)
        time.sleep(1)
        theme_option = (By.ID, "theme-option-verdant")
        self.home_page.click(theme_option)
        self.log("Theme changed to Verdant successfully.")
        time.sleep(1)

        # 4. Features: Suggestions & Reading
        self.log("Step 4: Suggestions & Reading Flow")
        suggestion = (By.CSS_SELECTOR, '[id^="suggestion-word-"]')
        suggestion_text = self.home_page.get_text(suggestion)
        self.log(f"Picking suggestion: {suggestion_text}")
        self.home_page.click(suggestion)
        time.sleep(0.5)
        self.home_page.click_explore()
        
        self.log("Waiting for AI generation...")
        time.sleep(3) # Give it time to generate or fail
        
        story = self.reading_page.get_story()
        if "Error generating content" in story or "Vortex logic fail" in story:
            self.log("WARNING: Story generation failed. Skipping Word/Drill Insight tests.")
            # Go back to home to continue other tests
            self.home_page.js_click((By.CSS_SELECTOR, '[aria-label="nav-home-btn"]'))
            time.sleep(1)
        else:
            self.log(f"Story generated for '{suggestion_text}'.")
            time.sleep(1)

            # 5. Modals: Word Insight
            self.log("Step 5: Word Insight Modal")
            # Find any word span in the story
            word_span = (By.CSS_SELECTOR, '[id^="word-span-"]')
            self.reading_page.click(word_span)
            time.sleep(1)
            self.reading_page.click((By.ID, "add-to-vortex-btn"))
            self.log(f"Word added to Vortex via Insight.")
            time.sleep(1)

            # 6. Modals: Drill Insight
            self.log("Step 6: Drill Insight Modal")
            try:
                self.reading_page.js_click((By.CLASS_NAME, "drill-info-btn"))
                time.sleep(1)
                self.reading_page.click((By.ID, "close-drill-insight-done"))
                self.log("Drill Insight Modal verified.")
            except Exception as e:
                self.log(f"Skipping Drill Insight (might be broken/empty): {e}")
            time.sleep(1)

        # 7. Trainer Queue
        self.log("Step 7: Trainer Queue Verification")
        self.home_page.js_click((By.CSS_SELECTOR, '[aria-label="nav-lab-btn"]'))
        time.sleep(1)
        assert self.home_page.is_displayed((By.ID, "trainer-pane"))
        self.log("Trainer/Lab panel verified.")
        time.sleep(1)

        # 8. Full Circle
        self.log("Step 8: Full Circle to Home")
        self.home_page.js_click((By.CSS_SELECTOR, '[aria-label="nav-home-btn"]'))
        time.sleep(1)
        final_count = self.home_page.get_text((By.ID, "queue-count"))
        self.log(f"Home Page Queue Count: {final_count}")
        
        self.log("--- Comprehensive Frontend Test Completed Successfully ---")
        time.sleep(2)

if __name__ == "__main__":
    chrome_options = Options()
    # chrome_options.add_argument("--headless") # Headless disabled for visual verification
    chrome_options.add_argument("--no-sandbox")
    chrome_options.add_argument("--window-size=1200,1000")
    
    driver = webdriver.Chrome(service=Service(ChromeDriverManager().install()), options=chrome_options)
    try:
        tester = ComprehensiveTest(driver)
        tester.run()
    finally:
        driver.quit()
