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
        changelist_url = reverse("admin:%s_%s_changelist" % (app_label, model_name))
        model_data = {"name": model._meta.verbose_name, "url": changelist_url}
        if app_label not in apps:
            apps[app_label] = [model_data]
        else:
            apps[app_label].append(model_data)

    return apps
