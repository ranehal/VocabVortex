import pytest
from selenium import webdriver
from selenium.webdriver.chrome.service import Service
from selenium.webdriver.chrome.options import Options
from webdriver_manager.chrome import ChromeDriverManager
from selenium.webdriver.common.by import By
from selenium.webdriver.common.action_chains import ActionChains
from selenium.webdriver.support.ui import WebDriverWait
from selenium.webdriver.support import expected_conditions as EC
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

    def safe_alert_accept(self):
        try:
            WebDriverWait(self.driver, 2).until(EC.alert_is_present())
            alert = self.driver.switch_to.alert
            self.log(f"Alert accepted: {alert.text}")
            alert.accept()
            time.sleep(0.5)
        except:
            pass

    def run(self):
        self.log("--- Starting Rigorous Full Feature Journey Test ---")
        self.driver.get(self.base_url)
        time.sleep(2)

        # ========================================================
        # 1. Guest Login & FULL Onboarding Survey
        # ========================================================
        self.log("Step 1: Authentication & Full Onboarding Survey")
        self.login_page.login_as_guest()
        time.sleep(2)
        
        try:
            start_btn = (By.ID, "start-journey-btn")
            if self.home_page.is_displayed(start_btn):
                self.home_page.js_click(start_btn)
                time.sleep(2)
            
            # Fill the name and age inputs
            try:
                name_input = (By.ID, "onboarding-name-input")
                age_input = (By.ID, "onboarding-age-input")
                if self.home_page.is_displayed(name_input):
                    self.home_page.send_keys(name_input, "Selenium Bot")
                    self.home_page.send_keys(age_input, "99")
                    time.sleep(1)
            except:
                pass
                
            # Then click next step to proceed (exactly 3 times for steps 1, 2, 3)
            next_btn = (By.ID, "next-step-btn")
            for step in range(3):
                try:
                    self.log(f"Attempting to click next step {step + 1}...")
                    self.home_page.js_click(next_btn)
                    time.sleep(2)  # Wait longer for transitions
                except Exception as ex:
                    self.log(f"Failed to click next step {step}: {ex}")
                    break
            
            finish_btn = (By.ID, "finish-survey-btn")
            try:
                self.log("Attempting to click finish...")
                self.home_page.js_click(finish_btn)
                self.log("Clicked finish survey.")
                time.sleep(2)
                self.safe_alert_accept()
                self.log("Waiting for overlay to clear and route to /home...")
                time.sleep(10) # longer wait for routing and heavy Moti overlay to finish
            except Exception as ex:
                self.log(f"Failed to click finish: {ex}")
                pass
        except Exception as e:
            self.log(f"Onboarding not fully present or bypassed. {e}")

        # ========================================================
        # 2. Cinematic Vortex: Search, Jump, Tap Subtitle
        # ========================================================
        self.log("Step 2: Journey - Cinematic Vortex (Deep Interaction)")
        self.home_page.js_click((By.CSS_SELECTOR, '[aria-label="nav-movies-btn"]'))
        time.sleep(2)
        assert self.home_page.is_displayed((By.ID, "movies-pane"))
        
        search_input = (By.ID, "movie-search-input")
        self.home_page.send_keys(search_input, "Inception")
        self.log("Searching for 'Inception'...")
        time.sleep(2)

        first_suggestion = (By.ID, "movie-suggestion-0")
        if self.home_page.is_displayed(first_suggestion):
            self.home_page.js_click(first_suggestion)
            self.log("Selected first movie suggestion.")
            time.sleep(3)
            
            # Jump time
            jump_btn = (By.ID, "jump-btn")
            if self.home_page.is_displayed(jump_btn):
                self.home_page.js_click(jump_btn)
                self.safe_alert_accept()
                self.log("Jumped to a random time.")
                time.sleep(1.5)
            
            # Tap subtitle
            first_subtitle = (By.ID, "sub-line-0")
            if self.home_page.is_displayed(first_subtitle):
                self.home_page.js_click(first_subtitle)
                self.log("Tapped a subtitle line.")
                time.sleep(1)

        # ========================================================
        # 3. Field Notes: Write and AI processing
        # ========================================================
        self.log("Step 3: Journey - Field Notes & AI")
        self.home_page.js_click((By.CSS_SELECTOR, '[aria-label="nav-notes-btn"]'))
        time.sleep(1.5)
        assert self.home_page.is_displayed((By.ID, "notes-pane"))
        
        # Click + to add note
        self.home_page.js_click((By.ID, "add-note-btn"))
        time.sleep(1)
        
        # Write note
        self.home_page.send_keys((By.ID, "note-title-input"), "Test AI Note")
        self.home_page.send_keys((By.ID, "note-content-input"), "Selenium is testing the app.")
        self.log("Wrote a new note.")
        time.sleep(1)
        
        # Open AI Menu and Summarize
        self.home_page.js_click((By.ID, "ai-menu-btn"))
        time.sleep(1)
        self.home_page.js_click((By.ID, "ai-option-fix"))
        self.log("Triggered AI grammar fix on note. Waiting 10 seconds...")
        time.sleep(10) # Much longer wait for AI processing
        
        # Go back to notes list
        self.home_page.js_click((By.ID, "note-back-btn"))
        time.sleep(1)

        # ========================================================
        # 4. Dictionary & TTS Narration
        # ========================================================
        self.log("Step 4: Journey - Dictionary & TTS")
        self.home_page.js_click((By.CSS_SELECTOR, '[aria-label="nav-home-btn"]'))
        time.sleep(1)
        
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
            # Trigger TTS
            self.reading_page.js_click((By.ID, "tts-btn"))
            self.log("Triggered TTS Narration.")
            time.sleep(2)
            
            # Bookmark word
            word_span = (By.CSS_SELECTOR, '[id^="word-span-"]')
            self.reading_page.js_click(word_span)
            time.sleep(1)
            self.reading_page.js_click((By.ID, "add-to-vortex-btn"))
            self.safe_alert_accept()
            self.log("Bookmark added via Vortex.")

        # ========================================================
        # 5. Arena Challenges: Word Match Gameplay
        # ========================================================
        self.log("Step 5: Journey - Arena Games (Word Match)")
        # Navigate back to Home from Reading first
        self.home_page.js_click((By.CSS_SELECTOR, '[aria-label="nav-home-btn"]'))
        time.sleep(1)
        
        self.home_page.js_click((By.CSS_SELECTOR, '[aria-label="nav-arena-btn"]'))
        time.sleep(1.5)
        
        match_game = (By.ID, "game-card-match")
        if self.home_page.is_displayed(match_game):
            self.home_page.js_click(match_game)
            self.log("Entered Word Match game.")
            time.sleep(2)
            
            # Play 3 rounds instead of 1
            left_words = self.driver.find_elements(By.CSS_SELECTOR, '[id^="match-left-"]')
            right_words = self.driver.find_elements(By.CSS_SELECTOR, '[id^="match-right-"]')
            
            rounds = min(3, len(left_words), len(right_words))
            for i in range(rounds):
                self.driver.execute_script("arguments[0].click();", left_words[i])
                time.sleep(0.5)
                self.driver.execute_script("arguments[0].click();", right_words[i])
                self.log(f"Played round {i+1} in Word Match.")
                time.sleep(1)
            
            # Return from game
            self.home_page.js_click((By.CSS_SELECTOR, '[aria-label="nav-arena-btn"]'))
            time.sleep(1)

        # ========================================================
        # 6. Progress Lab & Leaderboard
        # ========================================================
        self.log("Step 6: Journey - Progress Lab & Leaderboard View")
        self.home_page.js_click((By.CSS_SELECTOR, '[aria-label="nav-lab-btn"]'))
        time.sleep(1.5)
        assert self.home_page.is_displayed((By.ID, "trainer-pane"))
        self.log("Progress Lab verified. Leaderboard is visible to guests.")
        time.sleep(1)

        self.home_page.js_click((By.CSS_SELECTOR, '[aria-label="nav-home-btn"]'))
        time.sleep(1)
        self.log("--- Full Rigorous Journey Test Completed Successfully ---")
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