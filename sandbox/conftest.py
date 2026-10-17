"""conftest.py — Placed alongside test_grader.py inside the sandbox.

Injects two fields into each test's JSON report entry via user_properties:
  - ("visibility", "public" | "hidden")  — from @pytest.mark.public / .hidden
  - ("docstring", "...")                 — the test function's docstring

These appear in report.json under each test's "user_properties" array,
allowing the backend sanitizer to distinguish public vs hidden results.
"""
import pytest


# ── Register custom markers so pytest doesn't warn ──
def pytest_configure(config):
    config.addinivalue_line("markers", "public: mark test as visible to the student")
    config.addinivalue_line("markers", "hidden: mark test as hidden from the student")


# ── Attach visibility + docstring to each test's report ──
@pytest.hookimpl(hookwrapper=True)
def pytest_runtest_makereport(item, call):
    outcome = yield
    report = outcome.get_result()

    if report.when == "call":
        markers = {m.name for m in item.iter_markers()}
        visibility = "public" if "public" in markers else "hidden"
        docstring = (item.function.__doc__ or "").strip() or None

        # pytest-json-report reads `report.user_properties` and includes
        # them in the JSON output under each test's "user_properties" key.
        report.user_properties.append(("visibility", visibility))
        report.user_properties.append(("docstring", docstring))
