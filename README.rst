===============================
Django Admin Keyboard Shortcuts
===============================

This is a proof of concept for adding keyboard shortcuts to the Django Admin.

There is no PyPI package and I strongly recommend against using this package
as it's very hacky and really just a proof of concept of the types of shortcuts
we could have in the core admin. Most of the work needs to happen in core because
we'd likely need to add new blocks to the admin template, and would ideally need
changes to the templates.

Setup
-----

You will need a Django project with the admin enabled. The easiest way is to use
https://github.com/knyghty/django-admin-demo

Then clone this repo somewhere and install it in editable mode with pip, e.g.

```
pip install -e ../django-admin-keyboard-shortcuts
```

Then add `django_admin_keyboard_shortcuts` to your `INSTALLED_APPS`. It must go
above the `django.contrib.admin` app so that the template overrides work.

Now you can hack away.

Credits
-------

This package was created with Cookiecutter_ and the `knyghty/cookiecutter-django-package`_ project template.

.. _Cookiecutter: https://github.com/cookiecutter/cookiecutter
.. _`knyghty/cookiecutter-django-package`: https://github.com/knyghty/cookiecutter-django-package
