from django.apps import apps
from django.contrib.admin.utils import quote
from django.contrib.admin.views.decorators import staff_member_required
from django.db.models import Q
from django.http import JsonResponse


@staff_member_required
def search_model_instances(request, app_label, model_name):
    query = request.GET.get("q", "").strip()
    if not query:
        return JsonResponse([], safe=False)

    limit = int(request.GET.get("limit", "20").strip())

    try:
        model = apps.get_model(app_label, model_name)

        # Dynamic OR filter to search across all CharField and TextField fields
        search_filter = Q()
        for field in model._meta.get_fields():
            if hasattr(field, "attname") and field.get_internal_type() in [
                "CharField",
                "TextField",
            ]:
                search_filter |= Q(**{f"{field.attname}__icontains": query})

        instances = model.objects.filter(search_filter)[:limit]

        data = [
            {"id": quote(instance.pk), "title": str(instance)} for instance in instances
        ]

        return JsonResponse(data, safe=False)

    except Exception as e:
        return JsonResponse({"error": str(e)}, status=400)
