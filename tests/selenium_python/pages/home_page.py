from selenium.webdriver.common.by import By
from .base_page import BasePage

class HomePage(BasePage):
    WORD_INPUT = (By.ID, "word-input")
    EXPLORE_BTN = (By.ID, "explore-btn")
    THEME_TOGGLE = (By.ID, "theme-toggle")
    # nav-trainer-btn is handled via aria-label in selenium_test.py

    def enter_word(self, word):
        print(f"Entering word: {word}")
        self.send_keys(self.WORD_INPUT, word)

    def click_explore(self):
        print("Clicking Explore...")
        self.click(self.EXPLORE_BTN)

    def select_level(self, level):
        print(f"Selecting level: {level}")
        level_btn = (By.XPATH, f"//button[contains(@class, 'level-btn') and text()='{level}']")
        self.click(level_btn)

    def click_trainer_nav(self):
        print("Navigating to Trainer...")
        self.click(self.NAV_TRAINER_BTN)
