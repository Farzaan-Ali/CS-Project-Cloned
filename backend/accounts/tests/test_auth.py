# tests/test_auth.py
from .base import BaseTestCase
from django.urls import reverse


class LoginViewTest(BaseTestCase):

    def test_login_success(self):
        response = self.client.post("/accounts/login/", {
            "email": "testuser@example.com",
            "password": "TestPass123"
        }, format="json")  # ← tells APIClient to send Content-Type: application/json
        print("Testing demo user with correct info: email=testuser@example.com and pass=TestPass123")
        self.assertEqual(response.status_code, 200)
        self.assertEqual(response.data["detail"], "Logged in")

    def test_login_wrong_password(self):
        response = self.client.post("/accounts/login/", {
            "email": "testuser@example.com",
            "password": "wrongpassword"
        }, format="json")
        print("Testing demo user with wrong password: email=testuser@example.com and pass=wrongPassword")
        self.assertEqual(response.status_code, 400)
        self.assertEqual(response.data["detail"], "Invalid username or password.")

    def test_login_missing_fields(self):
        response = self.client.post("/accounts/login/", {}, format="json")
        self.assertEqual(response.status_code, 400)

    def test_logout(self):
        # first log in
        self.client.post("/accounts/login/", {
            "email": "testuser@example.com",
            "password": "TestPass123"
        }, format="json")
        url = reverse("logout")
        print("Testing Logout...")
        response = self.client.post("/accounts/logout/")
        self.assertEqual(response.status_code, 200)
