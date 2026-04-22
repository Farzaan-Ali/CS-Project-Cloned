from rest_framework import serializers
from .models import Budget, BudgetItem

class BudgetItemSerializer(serializers.ModelSerializer):
    class Meta:
        model = BudgetItem
        fields = ["item_id", "description", "category", "gl_account", "gl_description", "annual_amount", "fiscal_year"]


class BudgetSerializer(serializers.ModelSerializer):
    class Meta:
        model = Budget
        fields = ["id", "budget_id", "name", "department_head", "group"]


class BudgetDetailSerializer(serializers.ModelSerializer):
    items = BudgetItemSerializer(many=True, read_only=True)

    class Meta:
        model = Budget
        fields = ["id", "budget_id", "name", "department_head", "group", "items"]