from django.db import models

"""
This is all based off of the Budget template in 
WAFFLE/WAFFLE and follows the structure of the 
tables
"""

class Budget(models.Model):
    budget_id = models.IntegerField(unique=True)
    name = models.CharField(max_length=255)
    department_head = models.CharField(max_length=255)
    group = models.CharField(max_length=50, choices=[
        ("department", "Department"),
        ("committee", "Committee"),
    ])

    def __str__(self):
        return self.name


class BudgetItem(models.Model):
    budget = models.ForeignKey(Budget, on_delete=models.CASCADE, related_name="items")
    item_id = models.IntegerField()
    description = models.CharField(max_length=255)
    category = models.CharField(max_length=100, blank=True, null=True)
    gl_account = models.IntegerField(blank=True, null=True)
    gl_description = models.CharField(max_length=255, blank=True, null=True)
    annual_amount = models.DecimalField(max_digits=12, decimal_places=2, blank=True, null=True)
    fiscal_year = models.IntegerField(blank=True, null=True)

    class Meta:
        constraints = [
            models.UniqueConstraint(fields=["budget", "item_id"], name="uniq_budget_item")
        ]

    def __str__(self):
        return f"{self.budget.name} - {self.description}"