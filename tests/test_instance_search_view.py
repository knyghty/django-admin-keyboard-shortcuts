import json
from contextlib import contextmanager

from django.contrib import admin
from django.contrib.admin.exceptions import NotRegistered
from django.contrib.admin.tests import AdminSeleniumTestCase
from django.contrib.auth.models import Permission
from django.contrib.auth.models import User
from django.contrib.contenttypes.models import ContentType
from django.core.exceptions import PermissionDenied
from django.http import Http404
from django.test import RequestFactory
from django.test import TestCase
from django.urls import reverse
from django.urls import reverse_lazy

from django_admin_keyboard_shortcuts.sites import KSAdminSite
from django_admin_keyboard_shortcuts.views.instance_search import InstanceSearchJsonView

from .models import Question

PAGINATOR_SIZE = InstanceSearchJsonView.paginate_by
INSTANCE_SEARCH_SHORTCUT = "gc"

site = KSAdminSite(name="instance_search_admin")


class QuestionAdmin(admin.ModelAdmin):
    search_fields = ["question"]


site.register(Question, QuestionAdmin)


@contextmanager
def model_admin(model, model_admin, admin_site=site):
    try:
        org_admin = admin_site.get_model_admin(model)
    except NotRegistered:
        org_admin = None
    else:
        admin_site.unregister(model)
    admin_site.register(model, model_admin)
    try:
        yield
    finally:
        if org_admin:
            admin_site._registry[model] = org_admin


class AdminViewBasicTestCase(TestCase):
    @classmethod
    def setUpTestData(cls):
        cls.superuser = User.objects.create_superuser(
            username="super", password="secret", email="super@example.com"
        )

    def setUp(self):
        self.client.force_login(self.superuser)


class InstanceSearchJsonViewTests(AdminViewBasicTestCase):
    as_view_args = {"admin_site": site}
    opts = {
        "app_label": Question._meta.app_label,
        "model_name": Question._meta.model_name,
    }
    factory = RequestFactory()
    url = reverse_lazy("instance_search_admin:instance_search")

    @classmethod
    def setUpTestData(cls):
        cls.user = User.objects.create_user(
            username="user",
            password="secret",
            email="user@example.com",
            is_staff=True,
        )
        super().setUpTestData()

    def test_success(self):
        q = Question.objects.create(question="Is this a question?")
        request = self.factory.get(self.url, {**self.opts})
        request.user = self.superuser
        response = InstanceSearchJsonView.as_view(**self.as_view_args)(request)
        self.assertEqual(response.status_code, 200)
        data = json.loads(response.text)
        expected = {
            "results": [
                {
                    "id": str(q.pk),
                    "text": q.question,
                    "admin_url": reverse(
                        "instance_search_admin:tests_question_change", args=[q.pk]
                    ),
                }
            ],
            "pagination": {"more": False},
        }
        self.assertEqual(data, expected)

    def test_permission_denied(self):
        Question.objects.create(question="Is this a question?")
        request = self.factory.get(self.url, {"term": "is", **self.opts})
        request.user = self.user
        with self.assertRaises(PermissionDenied):
            InstanceSearchJsonView.as_view(**self.as_view_args)(request)

    def test_model_does_not_exist(self):
        request = self.factory.get(
            self.url, {"term": "is", **self.opts, "model_name": "does_not_exist"}
        )
        request.user = self.superuser
        with self.assertRaises(PermissionDenied):
            InstanceSearchJsonView.as_view(**self.as_view_args)(request)

    def test_has_view_or_change_permission_required(self):
        """
        Users require the change permission for the related model to the
        autocomplete view for it.
        """
        request = self.factory.get(self.url, {"term": "is", **self.opts})
        request.user = self.user
        with self.assertRaises(PermissionDenied):
            InstanceSearchJsonView.as_view(**self.as_view_args)(request)
        for permission in ("view", "change"):
            with self.subTest(permission=permission):
                self.user.user_permissions.clear()
                p = Permission.objects.get(
                    content_type=ContentType.objects.get_for_model(Question),
                    codename=f"{permission}_question",
                )
                self.user.user_permissions.add(p)
                request.user = User.objects.get(pk=self.user.pk)
                response = InstanceSearchJsonView.as_view(**self.as_view_args)(request)
                self.assertEqual(response.status_code, 200)

    def test_missing_search_fields(self):
        class EmptySearchAdmin(QuestionAdmin):
            search_fields = []

        with model_admin(Question, EmptySearchAdmin):
            msg = (
                "EmptySearchAdmin must have search_fields for the instance_search_view."
            )
            with self.assertRaisesMessage(Http404, msg):
                site.instance_search_view(
                    self.factory.get(self.url, {"term": "", **self.opts})
                )


class SeleniumTests(AdminSeleniumTestCase):
    # use all the installed apps
    available_apps = None

    def setUp(self):
        self.superuser = User.objects.create_superuser(
            username="super",
            password="secret",
            email="super@example.com",
        )
        self.admin_login(
            username="super",
            password="secret",
            login_url=reverse("instance_search_admin:index"),
        )

    @contextmanager
    def select2_ajax_wait(self, timeout=10):
        from selenium.common.exceptions import NoSuchElementException
        from selenium.webdriver.common.by import By
        from selenium.webdriver.support import expected_conditions as ec

        yield
        with self.disable_implicit_wait():
            try:
                loading_element = self.selenium.find_element(
                    By.CSS_SELECTOR, "li.select2-results__option.loading-results"
                )
            except NoSuchElementException:
                pass
            else:
                self.wait_until(ec.staleness_of(loading_element), timeout=timeout)

    @contextmanager
    def url_change_wait(self, timeout=10):
        current_url = self.selenium.current_url
        yield
        with self.disable_implicit_wait():
            self.wait_until(
                lambda driver: driver.current_url != current_url,
                timeout=timeout,
            )

    def test_instance_search(self):
        from selenium.webdriver.common.by import By
        from selenium.webdriver.common.keys import Keys

        model_container = self.selenium.find_element(
            By.ID, "shortcuts-model-select-container"
        )
        instance_container = self.selenium.find_element(
            By.ID, "shortcuts-instance-select-container"
        )

        # open instance search dialog
        self.selenium.find_element(By.TAG_NAME, "body").send_keys(
            INSTANCE_SEARCH_SHORTCUT
        )
        results = model_container.find_element(By.CSS_SELECTOR, ".select2-results")
        self.assertTrue(results.is_displayed())  # results are already being displayed
        # search for Question model
        search = model_container.find_element(By.CSS_SELECTOR, ".select2-search__field")
        search.send_keys("quest")
        option = model_container.find_element(
            By.CSS_SELECTOR, ".select2-results__option--highlighted"
        )
        self.assertIn("Question", option.text)
        # select the Question model
        with self.select2_ajax_wait():
            option.click()
        # search for instances
        results = instance_container.find_element(By.CSS_SELECTOR, ".select2-results")
        self.assertTrue(results.is_displayed())
        option = instance_container.find_element(
            By.CSS_SELECTOR, ".select2-results__option"
        )
        self.assertEqual(option.text, "No results found")  # ensure results empty
        with self.select2_ajax_wait():
            instance_container.click()  # close dropdown
        # create instances
        q1 = Question.objects.create(question="Who am I?")
        Question.objects.bulk_create(
            Question(question=str(i)) for i in range(PAGINATOR_SIZE + 10)
        )
        with self.select2_ajax_wait():
            # Reopen the dropdown now that some objects exist.
            instance_container.click()
        result_container = instance_container.find_element(
            By.CSS_SELECTOR, ".select2-results"
        )
        self.assertTrue(result_container.is_displayed())
        # PAGINATOR_SIZE results and "Loading more results".
        self.assertCountSeleniumElements(
            ".select2-results__option",
            PAGINATOR_SIZE + 1,
            root_element=result_container,
        )
        search = instance_container.find_element(
            By.CSS_SELECTOR, ".select2-search__field"
        )
        # Load next page of results by scrolling to the bottom of the list.
        for _ in range(PAGINATOR_SIZE + 1):
            with self.select2_ajax_wait():
                search.send_keys(Keys.ARROW_DOWN)
        # All objects are now loaded.
        self.assertCountSeleniumElements(
            ".select2-results__option",
            PAGINATOR_SIZE + 11,
            root_element=result_container,
        )
        # Limit the results with the search field.
        with self.select2_ajax_wait():
            search.send_keys("Who")
            # Ajax request is delayed.
            self.assertTrue(result_container.is_displayed())
            self.assertCountSeleniumElements(
                ".select2-results__option",
                PAGINATOR_SIZE + 12,
                root_element=result_container,
            )
        self.assertTrue(result_container.is_displayed())
        self.assertCountSeleniumElements(
            ".select2-results__option", 1, root_element=result_container
        )
        # Select the result.
        with self.url_change_wait():
            with self.select2_ajax_wait():
                search.send_keys(Keys.RETURN)
        self.assertEqual(
            self.selenium.current_url,
            self.live_server_url
            + reverse("instance_search_admin:tests_question_change", args=[q1.pk]),
        )
