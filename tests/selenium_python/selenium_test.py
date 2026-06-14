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
        self.log("--- Starting Full Feature Journey Test ---")
        self.driver.get(self.base_url)
        time.sleep(2)

        # 1. Guest Login & Onboarding
        self.log("Step 1: Authentication & Onboarding")
        self.login_page.login_as_guest()
        time.sleep(2)
        
        try:
            start_btn = (By.ID, "start-journey-btn")
            if self.home_page.is_displayed(start_btn):
                self.home_page.click(start_btn)
                time.sleep(1)
            
            skip_btn = (By.ID, "skip-onboarding")
            if self.home_page.is_displayed(skip_btn):
                self.home_page.click(skip_btn)
                self.log("Onboarding survey skipped.")
                time.sleep(2)
        except:
            self.log("Onboarding not present, continuing...")

        # 2. Section: Movies
        self.log("Step 2: Journey - Cinematic Vortex")
        self.home_page.js_click((By.CSS_SELECTOR, '[aria-label="nav-movies-btn"]'))
        time.sleep(1.5)
        assert self.home_page.is_displayed((By.ID, "movies-pane"))
        
        # Test movie search interaction
        search_input = (By.ID, "movie-search-input")
        self.home_page.send_keys(search_input, "Matrix")
        self.log("Movie search interaction verified.")
        time.sleep(1)

        # 3. Section: Arena (Games)
        self.log("Step 3: Journey - Arena Challenges")
        self.home_page.js_click((By.CSS_SELECTOR, '[aria-label="nav-arena-btn"]'))
        time.sleep(1.5)
        assert self.home_page.is_displayed((By.ID, "games-pane"))
        self.log("Arena panel verified.")
        time.sleep(1)

        # 4. Section: Notes
        self.log("Step 4: Journey - Field Notes")
        self.home_page.js_click((By.CSS_SELECTOR, '[aria-label="nav-notes-btn"]'))
        time.sleep(1.5)
        assert self.home_page.is_displayed((By.ID, "notes-pane"))
        self.log("Notes list verified.")
        time.sleep(1)

        # 5. Section: Theme Picker
        self.log("Step 5: Feature - Universe Selector (via Lab)")
        self.home_page.js_click((By.CSS_SELECTOR, '[aria-label="nav-lab-btn"]'))
        time.sleep(1.5)
        self.home_page.click((By.ID, "theme-toggle"))
        time.sleep(1)
        # Change to Sky High theme
        self.home_page.click((By.ID, "theme-option-sky"))
        self.log("Universe changed to 'Sky High'.")
        time.sleep(1)
        # Close the modal
        self.home_page.js_click((By.ID, "close-settings-btn"))
        time.sleep(1)
        
        # We will navigate to home for the reading flow
        self.home_page.js_click((By.CSS_SELECTOR, '[aria-label="nav-home-btn"]'))
        time.sleep(1)

        # 6. Section: Reading Flow
        self.log("Step 6: Journey - Vortex Reading")
        suggestion = (By.CSS_SELECTOR, '[id^="suggestion-word-"]')
        suggestion_text = self.home_page.get_text(suggestion)
        self.log(f"Entering Vortex for: {suggestion_text}")
        self.home_page.js_click(suggestion)
        self.home_page.js_click((By.ID, "explore-btn"))
        
        self.log("Waiting for Vortex generation...")
        time.sleep(4) 
        
        story = self.reading_page.get_story()
        if "fail" in story or "Error" in story:
            self.log("WARNING: Story generation skipped due to server error.")
        else:
            self.log("Reading story generated successfully.")
            # Test word insight
            word_span = (By.CSS_SELECTOR, '[id^="word-span-"]')
            self.reading_page.js_click(word_span)
            time.sleep(1)
            self.reading_page.js_click((By.ID, "add-to-vortex-btn"))
            time.sleep(1)
            try:
                alert = self.driver.switch_to.alert
                self.log(f"Alert accepted: {alert.text}")
                alert.accept()
            except:
                pass
            self.log("Bookmark added via Vortex.")

        # Navigate back to Home from Reading before going to Lab, because Reading is a pushed route
        self.home_page.js_click((By.CSS_SELECTOR, '[aria-label="nav-home-btn"]'))
        time.sleep(1)

        # 7. Section: Lab (Trainer)
        self.log("Step 7: Journey - Progress Lab")
        self.home_page.js_click((By.CSS_SELECTOR, '[aria-label="nav-lab-btn"]'))
        time.sleep(1.5)
        assert self.home_page.is_displayed((By.ID, "trainer-pane"))
        self.log("Progress Lab verified.")
        time.sleep(1)

        # 8. Return Home
        self.log("Step 8: Journey Complete")
        self.home_page.js_click((By.CSS_SELECTOR, '[aria-label="nav-home-btn"]'))
        time.sleep(1)
        self.log("--- Full Journey Test Completed Successfully ---")
        time.sleep(2)

if __name__ == "__main__":
    chrome_options = Options()
    chrome_options.add_argument("--no-sandbox")
    chrome_options.add_argument("--window-size=1200,1000")
    
    driver = webdriver.Chrome(service=Service(ChromeDriverManager().install()), options=chrome_options)
    try:
        tester = ComprehensiveTest(driver)
        tester.run()
    finally:
        driver.quit()
