from django.apps import AppConfig
from django.contrib.admin.apps import AdminConfig


class AdminKeyboardShortcutsConfig(AppConfig):
    default_auto_field = "django.db.models.BigAutoField"
    name = "django_admin_keyboard_shortcuts"
    label = "admin_keyboard_shortcuts"


class KSAdminConfig(AdminConfig):
    default_site = "django_admin_keyboard_shortcuts.sites.KSAdminSite"
