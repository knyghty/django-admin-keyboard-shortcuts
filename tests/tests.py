import unittest

from selenium import webdriver
from selenium.common.exceptions import NoSuchElementException
from selenium.webdriver.common.by import By


class TestCase(unittest.TestCase):
    def test_addition(self):
        self.assertEqual(1 + 1, 2)


class SeleniumTests(unittest.TestCase):
    @classmethod
    def setUpClass(cls):
        cls.driver = webdriver.Chrome()

    @classmethod
    def tearDownClass(cls):
        cls.driver.quit()

    def test_login_with_correct_password(self):
        self.driver.delete_all_cookies()
        self.driver.get("http://localhost:8000/admin/")
        self.driver.implicitly_wait(1)
        username_input = self.driver.find_element(By.ID, "id_username")
        username_input.send_keys("admin")
        password_input = self.driver.find_element(By.ID, "id_password")
        password_input.send_keys("correcthorsebatterystaple")
        self.driver.find_element(By.CSS_SELECTOR, "input[type='submit']").click()
        try:
            self.driver.find_element(By.CLASS_NAME, "errornote")
        except NoSuchElementException:
            pass

    def test_login_with_wrong_password(self):
        self.driver.delete_all_cookies()
        self.driver.get("http://localhost:8000/admin/")
        self.driver.implicitly_wait(1)
        username_input = self.driver.find_element(By.ID, "id_username")
        username_input.send_keys("admin")
        password_input = self.driver.find_element(By.ID, "id_password")
        password_input.send_keys("wrongpassword")
        self.driver.find_element(By.CSS_SELECTOR, "input[type='submit']").click()
        try:
            self.driver.find_element(By.CLASS_NAME, "errornote")
        except NoSuchElementException:
            raise AssertionError(
                "Expected error note block not found when "
                + "logging in with wrong password"
            )
