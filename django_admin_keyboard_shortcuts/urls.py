from django.urls import path

from . import views

urlpatterns = [
    path(
        "instances/<str:app_label>/<str:model_name>",
        views.search_model_instances,
        name="search_model_instances",
    ),
]
