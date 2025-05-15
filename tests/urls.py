from django.urls import path

from .test_instance_search_view import site as instance_search_site

urlpatterns = [
    path("test_admin/instance_search/", instance_search_site.urls),
]
