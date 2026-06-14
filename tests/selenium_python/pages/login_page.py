from selenium.webdriver.common.by import By
from .base_page import BasePage

class LoginPage(BasePage):
    GUEST_LOGIN_BTN = (By.ID, "guest-login-btn")

    def login_as_guest(self):
        print("Logging in as Guest...")
        self.click(self.GUEST_LOGIN_BTN)
