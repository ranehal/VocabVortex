from selenium.webdriver.common.by import By
from .base_page import BasePage

class TrainerPage(BasePage):
    TRAINER_LIST = (By.ID, "trainer-queue-list")
    TRAINER_ITEMS = (By.CLASS_NAME, "trainer-item")

    def get_queue_count(self):
        try:
            self.wait.until(EC.presence_of_element_located(self.TRAINER_ITEMS))
        except:
            pass # No items found within timeout
        items = self.driver.find_elements(*self.TRAINER_ITEMS)
        count = len(items)
        print(f"Trainer Queue count: {count}")
        return count
