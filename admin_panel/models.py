from django.contrib.auth.models import AbstractUser, Group, Permission
from django.db import models

class AdminUser(AbstractUser):
    role = models.CharField(max_length=20, choices=[("admin", "Admin"), ("staff", "Staff")])

    groups = models.ManyToManyField(Group, related_name="admin_panel_users", blank=True)
    user_permissions = models.ManyToManyField(Permission, related_name="admin_panel_users_permissions", blank=True)

    def __str__(self):
        return self.username
