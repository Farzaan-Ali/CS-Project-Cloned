from django.urls import path
from .views import BudgetListView, BudgetSummaryView, BudgetUploadView

urlpatterns = [
    path("list/", BudgetListView.as_view(), name="budget-list"),
    path("<int:budget_id>/", BudgetSummaryView.as_view(), name="budget-summary"),
    path("upload/", BudgetUploadView.as_view(), name="budget-upload"),
]