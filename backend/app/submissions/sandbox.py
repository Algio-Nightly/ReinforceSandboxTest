"""
Docker sandbox execution module.
Runs user code + grader in an isolated container with:
  - /input:ro  (submission.py + test_grader.py)
  - /output:rw (report.json)
  - --network none, resource caps, read-only root filesystem
"""
import json
import tempfile
import os
import shutil
from pathlib import Path

import docker
from docker.errors import ContainerError, ImageNotFound, APIError

from app.config import settings


def run_in_sandbox(
    submission_id: str,
    submission_code: str,
    grader_code: str,
    timeout: int | None = None,
    memory_limit: str | None = None,
    cpu_limit: float | None = None,
) -> dict:
    """
    Run user code against a grader in a Docker sandbox.
    
    This function is SYNCHRONOUS and should be called from a background
    thread (via BackgroundTasks + asyncio.to_thread) to avoid blocking
    the FastAPI event loop.
    
    Steps:
        1. Create two temp directories: input_dir/ and output_dir/
        2. Write submission.py and test_grader.py into input_dir/
        3. docker run with /input:ro and /output:rw mounts
        4. Read output_dir/report.json from the HOST filesystem
        5. Clean up both temp dirs
        6. Return parsed report dict
    
    Returns:
        dict: Parsed pytest-json-report JSON, or an error dict if
              the container crashed or report.json is missing.
    """
    timeout = timeout or settings.SANDBOX_TIMEOUT
    memory_limit = memory_limit or settings.SANDBOX_MEMORY_LIMIT
    cpu_limit = cpu_limit or settings.SANDBOX_CPU_LIMIT
    
    # Create temp directories on the host
    input_dir = tempfile.mkdtemp(prefix=f"judge_input_{submission_id}_")
    output_dir = tempfile.mkdtemp(prefix=f"judge_output_{submission_id}_")
    
    try:
        # Write user code and grader to input directory
        Path(input_dir, "submission.py").write_text(submission_code, encoding="utf-8")
        Path(input_dir, "test_grader.py").write_text(grader_code, encoding="utf-8")
        
        # Connect to Docker
        client = docker.from_env()
        
        # Run the sandbox container
        container = client.containers.run(
            image=settings.SANDBOX_IMAGE,
            detach=True,
            network_mode="none",             # No network access
            mem_limit=memory_limit,
            memswap_limit=memory_limit,       # No swap
            nano_cpus=int(cpu_limit * 1e9),   # CPU limit in nanoseconds
            pids_limit=64,                    # Prevent fork bombs
            read_only=True,                   # Read-only root filesystem
            tmpfs={
                "/tmp": "rw,noexec,nosuid,size=64m",
                "/work": "rw,exec,size=128m",
            },
            volumes={
                input_dir: {"bind": "/input", "mode": "ro"},
                output_dir: {"bind": "/output", "mode": "rw"},
            },
            remove=False,  # We remove manually after reading logs
        )
        
        # Wait for container to finish (with timeout)
        result = container.wait(timeout=timeout)
        
        # Capture logs for debugging
        logs = container.logs(stdout=True, stderr=True).decode("utf-8", errors="replace")
        
        # Clean up container
        container.remove(force=True)
        
        # Read report.json from the output directory
        report_path = os.path.join(output_dir, "report.json")
        if os.path.exists(report_path):
            with open(report_path, "r", encoding="utf-8") as f:
                report = json.load(f)
            report["_sandbox_logs"] = logs
            return report
        else:
            # Container ran but didn't produce a report
            return {
                "tests": [],
                "summary": {},
                "_error": "No report.json produced — container may have crashed",
                "_sandbox_logs": logs,
                "_exit_code": result.get("StatusCode", -1),
            }
    
    except docker.errors.ContainerError as e:
        return {
            "tests": [],
            "summary": {},
            "_error": f"Container error: {str(e)}",
        }
    except Exception as e:
        return {
            "tests": [],
            "summary": {},
            "_error": f"Sandbox execution failed: {str(e)}",
        }
    finally:
        # Always clean up temp directories
        shutil.rmtree(input_dir, ignore_errors=True)
        shutil.rmtree(output_dir, ignore_errors=True)
