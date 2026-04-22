import io
import pandas as pd
from pathlib import Path
from django.contrib.auth import get_user_model
from django.urls import reverse
from rest_framework.test import APITestCase

from budgets.models import Budget, BudgetItem


class BudgetUploadViewTests(APITestCase):
    """
    Tests for BudgetUploadView:
    - uploads an Excel file with sheets 'Budgets' and 'BudgetSummary'
    - verifies Budget and BudgetItem rows are created/updated as expected
    """


    def setUp(self):
        User = get_user_model()
        # IsAdminUser requires is_staff=True
        self.admin = User.objects.create_user(
            username="admin",
            email="admin@example.com",
            password="AdminPass123",
            is_staff=True,
        )
        self.client.force_authenticate(self.admin)
        self.url = reverse("budget-upload")
        self.fixture_path = Path(__file__).resolve().parent / "fixtures" / "BudgetTemplate.xlsx"


    def test_upload_creates_budgets_and_items(self):
        with self.subTest("Upload successful"):
            self.assertTrue(self.fixture_path.exists(), f"Missing fixture: {self.fixture_path}")
            with self.fixture_path.open("rb") as f:
                resp = self.client.post(self.url, data={"file": f}, format="multipart")

            self.assertEqual(resp.status_code, 200, resp.data)
            self.assertEqual(resp.data["message"], "Upload successful")

        with self.subTest("Budgets created/updated"):
            self.assertTrue(Budget.objects.filter(budget_id=1, name="Accounting/Finance", group="department").exists())
            self.assertTrue(Budget.objects.filter(budget_id=4, name="Operations/Production", department_head="Paul", group="department").exists())
            self.assertTrue(Budget.objects.filter(budget_id=14, name="Technology", department_head="Micah/Chuck", group="committee").exists())

        with self.subTest("Items created for budget id 12"):
            budget = Budget.objects.get(budget_id=12)
            items = BudgetItem.objects.filter(budget=budget).order_by("item_id")
            self.assertEqual(items.count(), 7)

        with self.subTest("Budget Summary for ItemID 1"):
            self.assertEqual(items[0].item_id, 1)
            self.assertEqual(items[0].description, "Payroll w/ Burden")
            self.assertEqual(items[0].category, "OH")
            self.assertEqual(float(items[0].annual_amount), 0)
            self.assertEqual(items[0].fiscal_year, 2025)

        with self.subTest("Budget Summary for ItemID 5"):
            self.assertEqual(items[4].item_id, 5)
            self.assertEqual(items[4].description, "Test… Replace with Budget item")
            self.assertEqual(items[4].category, "Expense")
            self.assertEqual(items[4].gl_account, 6500)
            self.assertEqual(items[4].gl_description, "Training")
            self.assertEqual(float(items[4].annual_amount), 22762.00)
            self.assertEqual(items[4].fiscal_year, 2025) 

    def test_upload_requires_file(self):
        resp = self.client.post(self.url, data={}, format="multipart")
        self.assertEqual(resp.status_code, 400)
        self.assertEqual(resp.data["message"], "No file provided")

    
    