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
        changelist_url = reverse(f"admin:{app_label}_{model_name}_changelist")
        model_data = {"name": model._meta.verbose_name, "url": changelist_url}
        if app_label not in apps:
            apps[app_label] = [model_data]
        else:
            apps[app_label].append(model_data)

    return apps

# To fetch model instances
@register.simple_tag
def get_model_instances(opts):
    if not opts:
        return []
    return opts.model._default_manager.all()
