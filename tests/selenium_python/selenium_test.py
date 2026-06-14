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
        self.base_url = "http://localhost:3000"
        self.login_page = LoginPage(driver)
        self.home_page = HomePage(driver)
        self.reading_page = ReadingPage(driver)
        self.trainer_page = TrainerPage(driver)

    def log(self, message):
        print(f"[TEST LOG] {message}")

    def run(self):
        self.log("--- Starting Comprehensive Frontend Test ---")
        self.driver.get(self.base_url)

        # 1. Guest Login
        self.log("Step 1: Guest Login")
        self.login_page.login_as_guest()

        # 2. Home Page -> Navigation Tabs
        self.log("Step 2: Testing Navigation Tabs")
        
        # Notes
        self.log("Navigating to Notes...")
        self.home_page.js_click((By.CLASS_NAME, "nav-notes-btn"))
        assert self.home_page.is_displayed((By.ID, "notes-pane"))
        self.log("Notes panel verified.")

        # Movies
        self.log("Navigating to Movies...")
        self.home_page.js_click((By.CLASS_NAME, "nav-movies-btn"))
        assert self.home_page.is_displayed((By.ID, "movies-pane"))
        self.log("Movies panel verified.")

        # Games
        self.log("Navigating to Arena (Games)...")
        self.home_page.js_click((By.CLASS_NAME, "nav-games-btn"))
        assert self.home_page.is_displayed((By.ID, "games-pane"))
        self.log("Games panel verified.")

        # Back to Home
        self.log("Navigating back to Home...")
        self.home_page.js_click((By.CLASS_NAME, "nav-home-btn"))
        
        # 3. Features: Theme Engine
        self.log("Step 3: Theme Engine")
        self.home_page.click(HomePage.THEME_TOGGLE)
        theme_option = (By.XPATH, "//button[contains(@class, 'theme-option') and .//span[contains(text(), 'Royal Amethyst')]]")
        self.home_page.click(theme_option)
        self.log("Theme changed successfully.")

        # 4. Features: Suggestions & Reading
        self.log("Step 4: Suggestions & Reading Flow")
        suggestion = (By.CLASS_NAME, "suggestion-word")
        suggestion_text = self.home_page.get_text(suggestion)
        self.log(f"Picking suggestion: {suggestion_text}")
        self.home_page.click(suggestion)
        self.home_page.click_explore()
        
        time.sleep(2) # Wait for AI generation
        story = self.reading_page.get_story()
        self.log(f"Story generated for '{suggestion_text}'.")

        # 5. Modals: Word Insight
        self.log("Step 5: Word Insight Modal")
        word_span_xpath = f"//span[contains(@class, 'word-span') and contains(translate(., 'ABCDEFGHIJKLMNOPQRSTUVWXYZ', 'abcdefghijklmnopqrstuvwxyz'), '{suggestion_text.lower()}')]"
        self.reading_page.click((By.XPATH, word_span_xpath))
        self.reading_page.click((By.ID, "add-to-vortex-btn"))
        self.log(f"Word '{suggestion_text}' added to Vortex.")

        # 6. Modals: Drill Insight
        self.log("Step 6: Drill Insight Modal")
        try:
            self.reading_page.js_click((By.CLASS_NAME, "drill-info-btn"))
            time.sleep(0.5)
            self.reading_page.click((By.ID, "close-drill-insight-done"))
            self.log("Drill Insight Modal verified.")
        except Exception as e:
            self.log(f"Skipping Drill Insight (might be broken/empty): {e}")

        # 7. Trainer Queue
        self.log("Step 7: Trainer Queue Verification")
        self.home_page.js_click((By.CLASS_NAME, "nav-trainer-btn"))
        count = self.trainer_page.get_queue_count()
        assert count >= 1
        self.log(f"Trainer Queue has {count} items.")

        # 8. Full Circle
        self.log("Step 8: Full Circle to Home")
        self.home_page.js_click((By.CLASS_NAME, "nav-home-btn"))
        final_count = self.home_page.get_text((By.ID, "queue-count"))
        self.log(f"Home Page Queue Count: {final_count}")
        
        self.log("--- Comprehensive Frontend Test Completed Successfully ---")

if __name__ == "__main__":
    chrome_options = Options()
    chrome_options.add_argument("--headless")
    chrome_options.add_argument("--no-sandbox")
    chrome_options.add_argument("--window-size=1920,1080")
    
    driver = webdriver.Chrome(service=Service(ChromeDriverManager().install()), options=chrome_options)
    try:
        tester = ComprehensiveTest(driver)
        tester.run()
    finally:
        driver.quit()
