#!/bin/bash
set -e

# ── Step 1: Copy files from read-only /input into writable /work ──
# Pytest needs real .py files at module scope to discover test functions.
# We copy (not move) because /input is read-only.
cp /input/submission.py   /work/submission.py
cp /input/test_grader.py  /work/test_grader.py
cp /conftest.py           /work/conftest.py

# ── Step 2: Delete the grader SOURCE from /work so user code can't open() it ──
# We compile to .pyc first, then delete the .py. Pytest can still discover
# and run tests from .pyc files when the .py is absent — it finds test_
# functions via the compiled bytecode in __pycache__.
python -c "
import py_compile, os
py_compile.compile('/work/test_grader.py')
os.remove('/work/test_grader.py')
"
# NOTE: submission.py is left as-is (the student wrote it, nothing to hide).

# ── Step 3: Run pytest ──
# --rootdir=/work tells pytest where to look for tests.
# Results go to /output/report.json (writable volume).
python -m pytest /work/ \
    --rootdir=/work \
    --json-report \
    --json-report-file=/output/report.json \
    --tb=short \
    --timeout=30 \
    -v || true

# Always exit 0; the real pass/fail data is in report.json
exit 0
