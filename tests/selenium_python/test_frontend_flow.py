import pytest
from selenium import webdriver
from selenium.webdriver.chrome.service import Service
from selenium.webdriver.chrome.options import Options
from webdriver_manager.chrome import ChromeDriverManager
from selenium.webdriver.common.by import By
import time

from pages.login_page import LoginPage
from pages.home_page import HomePage
from pages.reading_page import ReadingPage
from pages.trainer_page import TrainerPage

@pytest.fixture(scope="module")
def driver():
    chrome_options = Options()
    chrome_options.add_argument("--headless")  # Run in headless mode
    chrome_options.add_argument("--no-sandbox")
    chrome_options.add_argument("--disable-dev-shm-usage")
    chrome_options.add_argument("--window-size=1920,1080")
    
    service = Service(ChromeDriverManager().install())
    driver = webdriver.Chrome(service=service, options=chrome_options)
    yield driver
    driver.quit()

def test_full_frontend_flow(driver):
    base_url = "http://localhost:3000"
    
    print("\n--- Starting Full Frontend Flow Test ---")
    driver.get(base_url)
    
    # 1. Guest Login
    login_page = LoginPage(driver)
    login_page.login_as_guest()
    
    # 2. Home Page - Level Selection
    home_page = HomePage(driver)
    home_page.select_level("B1")
    
    # 2b. Theme Selection
    print("Testing Theme Change...")
    home_page.click(HomePage.THEME_TOGGLE)
    theme_option = (By.XPATH, "//button[contains(@class, 'theme-option') and .//span[contains(text(), 'Royal Amethyst')]]")
    home_page.click(theme_option)
    print("Theme changed to Royal Amethyst")

    # 3. Home Page -> Reading via Suggestion
    print("Adding a suggestion to Vortex...")
    suggestion = (By.CLASS_NAME, "suggestion-word")
    suggestion_text = home_page.get_text(suggestion)
    home_page.click(suggestion)
    home_page.click_explore()
    
    # 4. Reading Page - Feature Testing
    reading_page = ReadingPage(driver)
    story = reading_page.get_story()
    print(f"Reading story for: {suggestion_text}")

    # 4a. Word Insight Modal
    print("Testing Word Insight Modal...")
    word_span_xpath = f"//span[contains(@class, 'word-span') and contains(translate(., 'ABCDEFGHIJKLMNOPQRSTUVWXYZ', 'abcdefghijklmnopqrstuvwxyz'), '{suggestion_text.lower()}')]"
    reading_page.click((By.XPATH, word_span_xpath))
    add_btn = (By.ID, "add-to-vortex-btn")
    reading_page.click(add_btn)
    print(f"Word '{suggestion_text}' added to Trainer Queue.")

    # 4b. Drill Insight Modal
    print("Testing Drill Insight Modal...")
    drill_btn = (By.CLASS_NAME, "drill-info-btn")
    reading_page.js_click(drill_btn)
    time.sleep(1)
    # Click 'Done' or X to close
    reading_page.click((By.XPATH, "//button[text()='Done']"))
    print("Drill Insight Modal tested.")

    # 5. Trainer Page via Bottom Nav
    print("Navigating to Trainer via Bottom Nav...")
    home_page.click((By.CLASS_NAME, "nav-trainer-btn"))
    trainer_page = TrainerPage(driver)
    count = trainer_page.get_queue_count()
    assert count >= 1
    
    # 6. Home Page via Bottom Nav
    print("Navigating back to Home via Bottom Nav...")
    home_page.click((By.CLASS_NAME, "nav-home-btn"))
    queue_count_text = home_page.get_text((By.ID, "queue-count"))
    print(f"Final Home Page Queue Count: {queue_count_text}")
    assert int(queue_count_text) >= 1
    
    print("--- Full Frontend Flow Test Completed Successfully ---")

if __name__ == "__main__":
    pytest.main([__file__, "-s"])
