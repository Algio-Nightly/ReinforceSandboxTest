FROM python:3.11-slim

# Install ML libraries
COPY requirements.txt /tmp/requirements.txt
RUN pip install --no-cache-dir -r /tmp/requirements.txt && rm /tmp/requirements.txt

# Non-root user for security
RUN useradd -m -s /bin/bash runner

# Create mount points and working directory
# /input  → read-only bind mount (submission.py + test_grader.py from host)
# /output → writable bind mount (report.json written here)
# /work   → tmpfs at runtime (pytest working directory)
RUN mkdir -p /input /output /work && chown runner:runner /output /work

USER runner
WORKDIR /work

COPY --chown=runner:runner entrypoint.sh /entrypoint.sh
COPY --chown=runner:runner conftest.py /conftest.py

# Make entrypoint executable
RUN chmod +x /entrypoint.sh

ENTRYPOINT ["/entrypoint.sh"]
