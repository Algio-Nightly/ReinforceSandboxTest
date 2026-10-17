"""
Report sanitizer — parses pytest-json-report output and separates
public test details from hidden test summaries.

Public tests: full details (message, stdout, duration) for debugging.
Hidden tests: name + pass/fail only — all output stripped.
"""
from typing import Any


def _extract_short_message(test: dict) -> str | None:
    """Extract a short assertion message from a test's call data."""
    call = test.get("call", {})
    
    # Check for crash/longrepr
    longrepr = call.get("longrepr", "")
    if isinstance(longrepr, str) and longrepr:
        # Take just the last line (the assertion)
        lines = longrepr.strip().split("\n")
        for line in reversed(lines):
            stripped = line.strip()
            if stripped.startswith("AssertionError") or stripped.startswith("assert"):
                return stripped
            if stripped.startswith("E "):
                return stripped[2:].strip()
        # Fallback: last non-empty line
        return lines[-1].strip() if lines else None
    
    return None


def sanitize_report(raw_report: dict) -> dict:
    """
    Parse pytest-json-report output.

    For each test, reads user_properties to find visibility and docstring:
      user_properties: [["visibility", "public"], ["docstring", "Some doc..."]]

    Then:
      - If visibility == "public" → include full details
        (pass/fail, assertion message, stdout, duration)
      - If visibility == "hidden" → include ONLY:
        (docstring/name, "passed"/"failed"/"error")
        Strip ALL stdout, stderr, traceback
    """
    public_tests: list[dict[str, Any]] = []
    hidden_tests: list[dict[str, Any]] = []
    
    for test in raw_report.get("tests", []):
        # Extract user_properties into a dict
        # user_properties comes as: [["visibility", "public"], ["docstring", "..."]]
        props = dict(test.get("user_properties", []))
        visibility = props.get("visibility", "hidden")  # fail-safe: hidden
        docstring = props.get("docstring")
        outcome = test.get("outcome", "error")
        
        # Extract test function name from nodeid (e.g., "test_grader.py::test_output_shape")
        nodeid = test.get("nodeid", "")
        test_name = nodeid.split("::")[-1] if "::" in nodeid else nodeid
        
        if visibility == "public":
            call_data = test.get("call", {})
            public_tests.append({
                "name": test_name,
                "docstring": docstring,
                "status": outcome,
                "duration_ms": round(call_data.get("duration", 0) * 1000),
                "message": _extract_short_message(test),
                "stdout": call_data.get("stdout", ""),
            })
        else:
            # HIDDEN: strip everything except name + pass/fail
            hidden_tests.append({
                "name": test_name,
                "docstring": docstring,
                "status": outcome,
                # No message, no stdout, no traceback — ever
            })
    
    total_passed = sum(
        1 for t in public_tests + hidden_tests if t["status"] == "passed"
    )
    total = len(public_tests) + len(hidden_tests)
    
    return {
        "status": "completed",
        "overall": f"{total_passed}/{total} passed",
        "execution_time_ms": round(
            raw_report.get("duration", 0) * 1000
        ),
        "public_tests": public_tests,
        "hidden_tests": hidden_tests,
        "hidden_summary": {"passed": total_passed, "total": total},
    }
