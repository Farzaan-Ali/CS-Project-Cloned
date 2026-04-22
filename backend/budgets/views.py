from django.shortcuts import render

import pandas as pd
from rest_framework.generics import ListAPIView, RetrieveAPIView
from rest_framework.views import APIView
from rest_framework.response import Response
from rest_framework.permissions import IsAdminUser
from rest_framework.parsers import MultiPartParser
from django.shortcuts import get_object_or_404
from .models import Budget, BudgetItem
from .serializers import BudgetSerializer, BudgetDetailSerializer


class BudgetListView(ListAPIView):
    """Returns all budgets — both departments and committees"""
    permission_classes = [IsAdminUser]
    serializer_class = BudgetSerializer

    def get_queryset(self):
        group = self.request.query_params.get("group")  # filter by ?group=department or ?group=committee
        if group:
            return Budget.objects.filter(group=group).order_by("budget_id")
        return Budget.objects.all().order_by("budget_id")


class BudgetSummaryView(RetrieveAPIView):
    """Returns a single budget with all its line items"""
    permission_classes = [IsAdminUser]
    serializer_class = BudgetDetailSerializer
    queryset = Budget.objects.all()
    lookup_field = "budget_id"  # use budget_id in the URL instead of pk? don't know if this is smart/security risk yet


class BudgetUploadView(APIView):
    """Upload the Excel file and parse it into the database"""
    permission_classes = [IsAdminUser]
    parser_classes = [MultiPartParser]

    def post(self, request):
        file = request.FILES.get("file")
        if not file:
            return Response({"message": "No file provided"}, status=400)

        try:
            # --- parse Budgets sheet ---
            budgets_df = pd.read_excel(file, sheet_name="Budgets", header=None)

            current_group = "department"
            budgets_created = 0

            for _, row in budgets_df.iterrows():
                budget_id = row[0]
                name = row[1]
                head = row[2] if len(row) > 2 else None

                # detect the "Committees" section header
                if pd.isna(budget_id) and str(name).strip() == "Committees":
                    current_group = "committee"
                    continue

                # skip header row and empty rows
                if pd.isna(budget_id) or str(name).strip() in ["Department", ""]:
                    continue

                Budget.objects.update_or_create(
                    budget_id=int(budget_id),
                    defaults={
                        "name": str(name).strip(),
                        "department_head": str(head).strip() if pd.notna(head) else "",
                        "group": current_group,
                    }
                )
                budgets_created += 1

            # --- parse BudgetSummary sheet ---
            summary_df = pd.read_excel(file, sheet_name="BudgetSummary", header=None)

            budget_name = str(summary_df.iloc[0, 1]).strip()
            fiscal_year_raw = summary_df.iloc[3, 1]
            fiscal_year = int(fiscal_year_raw) if pd.notna(fiscal_year_raw) else None
            budget_id_raw = summary_df.iloc[0, 3]
            budget_id = int(budget_id_raw) if pd.notna(budget_id_raw) else None

            budget = get_object_or_404(Budget, budget_id=budget_id)

            # line items start at row 6 (index 6), skip header row at index 5
            items_df = summary_df.iloc[6:].reset_index(drop=True)
            items_created = 0

            for _, row in items_df.iterrows():
                item_id = row[0]
                if pd.isna(item_id):
                    continue

                BudgetItem.objects.update_or_create(
                    budget=budget,
                    item_id=int(item_id),
                    defaults={
                        "description": str(row[1]).strip() if pd.notna(row[1]) else "",
                        "category": str(row[2]).strip() if pd.notna(row[2]) else None,
                        "gl_account": int(row[3]) if pd.notna(row[3]) else None,
                        "gl_description": str(row[4]).strip() if pd.notna(row[4]) else None,
                        "annual_amount": float(row[5]) if pd.notna(row[5]) else None,
                        "fiscal_year": fiscal_year,
                    }
                )
                items_created += 1

            return Response({
                "message": "Upload successful",
                "budgets_created": budgets_created,
                "items_created": items_created,
            })

        except Exception as e:
            return Response({"message": f"Error parsing file: {str(e)}"}, status=400)
