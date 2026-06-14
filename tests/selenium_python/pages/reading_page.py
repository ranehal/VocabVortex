from selenium.webdriver.common.by import By
from .base_page import BasePage

class ReadingPage(BasePage):
    STORY_TEXT = (By.ID, "story-text")
    NEXT_DRILL_BTN = (By.ID, "next-drill-btn")
    BENGALI_DEF = (By.ID, "bengali-definition")

    def get_story(self):
        text = self.get_text(self.STORY_TEXT)
        print(f"Generated Story: {text[:50]}...")
        return text

    def get_bengali_definition(self):
        text = self.get_text(self.BENGALI_DEF)
        print(f"Bengali Definition: {text}")
        return text

    def click_next_drill(self):
        print("Clicking Next Drill...")
        self.click(self.NEXT_DRILL_BTN)
