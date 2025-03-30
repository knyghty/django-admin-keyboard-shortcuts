from django import template
from django.contrib.admin.sites import site
from django.urls import reverse

register = template.Library()


@register.simple_tag
def all_apps():
    apps = {}
    for model in site._registry.keys():
        app_label = model._meta.app_label
        model_name = model._meta.model_name
        # model_name is needed for instance search
        # I'm using object_name instead of model_name because it is already present
        #  in get_app_list() context in django admin
        object_name = model._meta.object_name
        changelist_url = reverse(f"admin:{app_label}_{model_name}_changelist")
        model_data = {
            "name": model._meta.verbose_name,
            "url": changelist_url,
            "object_name": object_name,
        }
        if app_label not in apps:
            apps[app_label] = [model_data]
        else:
            apps[app_label].append(model_data)

    return apps
