from django.apps import apps
from django.contrib.admin.exceptions import NotRegistered
from django.core.exceptions import PermissionDenied
from django.http import Http404
from django.http import JsonResponse
from django.urls import NoReverseMatch
from django.urls import reverse
from django.views.generic.list import BaseListView

# Based on select2's AutocompleteJsonView class
#  in django/contrib/admin/views/autocomplete.py


class InstanceSearchJsonView(BaseListView):
    """Handle InstanceSearchWidget's AJAX requests for model instances."""

    paginate_by = 20
    admin_site = None

    def get(self, request, *args, **kwargs):
        """
        Return a JsonResponse with search results as defined in
        serialize_result(), by default:
        {
            results: [
                {
                    id: "123",
                    text: "foo",
                    admin_url: "/admin/app/model/123/change/"
                },
            ],
            pagination: {more: true}
        }
        """
        (
            self.term,
            self.model_admin,
        ) = self.process_request(request)

        if not self.has_perm(request):
            raise PermissionDenied

        self.object_list = self.get_queryset()
        context = self.get_context_data()
        return JsonResponse(
            {
                "results": [
                    self.serialize_result(obj) for obj in context["object_list"]
                ],
                "pagination": {"more": context["page_obj"].has_next()},
            }
        )

    def serialize_result(self, obj):
        """
        Convert the provided model object to a dictionary that is added to the
        results list.
        """
        return {
            "id": str(obj.pk),
            "text": str(obj),
            "admin_url": self.get_admin_url(obj),
        }

    def get_admin_url(self, obj, action="change"):
        opts = obj._meta
        admin_view_name = (
            f"{self.admin_site.name}:{opts.app_label}_{opts.model_name}_{action}"
        )
        try:
            return reverse(
                admin_view_name,
                args=[obj.pk],
            )
        except NoReverseMatch:
            raise Http404(f"URL for {admin_view_name} not found.")

    def get_paginator(self, *args, **kwargs):
        """Use the ModelAdmin's paginator."""
        return self.model_admin.get_paginator(self.request, *args, **kwargs)

    def get_queryset(self):
        """Return queryset based on ModelAdmin.get_search_results()."""
        qs = self.model_admin.get_queryset(self.request)
        qs, search_use_distinct = self.model_admin.get_search_results(
            self.request, qs, self.term
        )
        if search_use_distinct:
            qs = qs.distinct()
        if not qs.query.order_by:
            qs = qs.order_by("pk")
        return qs

    def process_request(self, request):
        """
        Validate request integrity, extract and return request parameters.

        Since the subsequent view permission check requires the target model
        admin, which is determined here, raise PermissionDenied if the
        requested app, model or field are malformed.

        Raise Http404 if the target model admin is not configured properly with
        search_fields.
        """
        term = request.GET.get("term", "")
        try:
            app_label = request.GET["app_label"]
            model_name = request.GET["model_name"]
        except KeyError as e:
            raise PermissionDenied from e

        # Retrieve objects from parameters.
        try:
            model = apps.get_model(app_label, model_name)
        except LookupError as e:
            raise PermissionDenied from e

        try:
            model_admin = self.admin_site.get_model_admin(model)
        except NotRegistered as e:
            raise PermissionDenied from e

        # Validate suitability of objects.
        if not model_admin.get_search_fields(request):
            raise Http404(
                f"{type(model_admin).__qualname__} must have search_fields"
                " for the instance_search_view."
            )

        return term, model_admin

    def has_perm(self, request, obj=None):
        """Check if user has permission to access the related model."""
        return self.model_admin.has_view_permission(request, obj=obj)
