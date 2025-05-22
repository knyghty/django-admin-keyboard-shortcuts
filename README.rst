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

.. code-block:: console

    pip install -e ../django-admin-keyboard-shortcuts


You would need to replace `django.contrib.admin` with `django_admin_keyboard_shortcuts.apps.KSAdminConfig` in your `INSTALLED_APPS` to override the default admin site. See the `Django docs on overriding the default admin site <https://docs.djangoproject.com/en/5.1/ref/contrib/admin/#overriding-the-default-admin-site>`_. Then add `django_admin_keyboard_shortcuts.apps.AdminKeyboardShortcutsConfig`. It must go
above the `django_admin_keyboard_shortcuts.apps.KSAdminConfig` app so that the template overrides work.

Now you can hack away.

Supported Shortcuts
-----------------------
.. list-table::
   :header-rows: 1

   * - Description
     - Shortcut
     - Scope
     - Status
   * - Show help dialog
     - \?
     - Global
     - Done
   * - Go to the site index
     - g i
     - Global
     - Done
   * - Go to a change list page
     - g l
     - Global
     - Done
   * - Go to the model instance page
     - g c
     - Global
     - `PR#49 <https://github.com/knyghty/django-admin-keyboard-shortcuts/pull/49>`_
   * - Select previous row for action
     - k
     - Change List
     - Done
   * - Select next row for action
     - j
     - Change List
     - Done
   * - Toggle row selection
     - x
     - Change List
     - Done
   * - Focus actions dropdown
     - a
     - Change List
     - Done
   * - Save and go to change list
     - Alt+s
     - Change Form
     - Done
   * - Save and add another
     - Alt+a
     - Change Form
     - Done
   * - Save and continue editing
     - Alt+c
     - Change Form
     - Done
   * - Delete
     - Alt+d
     - Change Form
     - Done
   * - Confirm deletion
     - Alt+y
     - Delete Confirmation
     - Done
   * - Cancel deletion
     - Alt+n
     - Delete Confirmation
     - Done

Linting
-------

This project uses ESLint as its JS linter and uses the same configuration as the
Django repository. To run it, you'll first need to install dependencies

.. code-block:: console

    npm install

and then run

.. code-block:: console

    npm run lint


Credits
-------

This package was created with Cookiecutter_ and the `knyghty/cookiecutter-django-package`_ project template.

.. _Cookiecutter: https://github.com/cookiecutter/cookiecutter
.. _`knyghty/cookiecutter-django-package`: https://github.com/knyghty/cookiecutter-django-package
