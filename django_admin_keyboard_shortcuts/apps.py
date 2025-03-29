from django.apps import AppConfig
from django.contrib import admin

from django_admin_keyboard_shortcuts.sites import ks_admin_site


class AdminKeyboardShortcutsConfig(AppConfig):
    default_auto_field = "django.db.models.BigAutoField"
    name = "django_admin_keyboard_shortcuts"
    label = "admin_keyboard_shortcuts"

    def ready(self):
        # Monkey patch the admin.site with our ks_admin_site
        admin.site._wrapped = ks_admin_site
