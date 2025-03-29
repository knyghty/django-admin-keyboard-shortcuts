from functools import update_wrapper

from django.contrib import admin
from django.urls import path
from django.urls import reverse_lazy

from django_admin_keyboard_shortcuts.views.instance_search import InstanceSearchJsonView


# If/when this gets merged into django,
# the contents of this class should be merged into django/contrib/admin/sites.AdminSite
# Snippets based on autocomplete_view logic in django/contrib/admin/sites.py
class KSAdminSite(admin.AdminSite):
    def get_urls(self):
        def wrap(view, cacheable=False):
            def wrapper(*args, **kwargs):
                return self.admin_view(view, cacheable)(*args, **kwargs)

            wrapper.admin_site = self
            # Used by LoginRequiredMiddleware.
            wrapper.login_url = reverse_lazy("admin:login", current_app=self.name)
            return update_wrapper(wrapper, view)

        urls = super().get_urls()
        custom_urls = [
            path(
                "instance_search/",
                wrap(self.instance_search_view),
                name="instance_search",
            ),
        ]
        return custom_urls + urls

    def instance_search_view(self, request):
        return InstanceSearchJsonView.as_view(admin_site=self)(request)
