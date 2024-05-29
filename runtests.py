#!/usr/bin/env python
import os
import sys

import django
from django.test.runner import DiscoverRunner


def main():
    os.environ["DJANGO_SETTINGS_MODULE"] = "tests.settings"
    django.setup()
    test_runner = DiscoverRunner(verbosity=3)
    failures = test_runner.run_tests([])
    sys.exit(failures)

if __name__ == "__main__":
    main()
