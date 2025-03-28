from django.apps import AppConfig
from django.contrib import admin

from django_admin_keyboard_shortcuts.sites import KSAdminSite


class AdminKeyboardShortcutsConfig(AppConfig):
    default_auto_field = "django.db.models.BigAutoField"
    name = "django_admin_keyboard_shortcuts"
    label = "admin_keyboard_shortcuts"

    def ready(self):
        # Monkey patch the admin.site with our KSAdminSite
        # Make sure ModelAdmin instances being registered to admin.site
        # are registered with our KSAdminSite instead of the default one.
        ks_admin_site = KSAdminSite()

        def ks_admin_register(model, admin_class=None, **options):
            ks_admin_site.register(model, admin_class, **options)

        admin.site.register = ks_admin_register
        admin.site = ks_admin_site
