"""
Seed Firestore with problem definitions and graders.
Usage:
    python scripts/seed_firestore.py [--service-account path/to/key.json] [--dry-run]
"""
import os
import sys
import json
import argparse
from pathlib import Path

# Add backend directory to path if needed
backend_dir = Path(__file__).resolve().parent.parent / "backend"
sys.path.insert(0, str(backend_dir))


def seed_problems(service_account_path: str | None, dry_run: bool = False):
    problems_dir = Path(__file__).resolve().parent.parent / "problems"
    if not problems_dir.exists():
        print(f"Error: Problems directory '{problems_dir}' does not exist.")
        return

    problem_folders = [f for f in problems_dir.iterdir() if f.is_dir()]
    print(f"Found {len(problem_folders)} problem folder(s): {[f.name for f in problem_folders]}")

    db = None
    if not dry_run:
        import firebase_admin
        from firebase_admin import credentials, firestore

        sa_path = service_account_path or os.getenv("FIREBASE_SERVICE_ACCOUNT_PATH", "serviceAccountKey.json")
        # Check backend folder too
        if not os.path.isabs(sa_path) and not Path(sa_path).exists():
            candidate = backend_dir / sa_path
            if candidate.exists():
                sa_path = str(candidate)

        if not Path(sa_path).exists():
            print(f"Warning: Firebase service account key not found at '{sa_path}'.")
            print("Switching to DRY-RUN mode. Validating problem definitions without uploading to Firestore.")
            dry_run = True
        else:
            if not firebase_admin._apps:
                cred = credentials.Certificate(sa_path)
                firebase_admin.initialize_app(cred)
            db = firestore.client()
            print("Connected to Firestore successfully.")

    for folder in problem_folders:
        problem_json_path = folder / "problem.json"
        grader_path = folder / "test_grader.py"

        if not problem_json_path.exists():
            print(f"Skipping {folder.name}: missing problem.json")
            continue
        if not grader_path.exists():
            print(f"Skipping {folder.name}: missing test_grader.py")
            continue

        with open(problem_json_path, "r", encoding="utf-8") as f:
            problem_meta = json.load(f)

        grader_code = grader_path.read_text(encoding="utf-8")
        problem_id = problem_meta.get("id", folder.name)

        print(f"\n[{problem_id}] {problem_meta.get('title')}")
        print(f"  Difficulty: {problem_meta.get('difficulty')}")
        print(f"  Tags: {problem_meta.get('tags')}")
        print(f"  Grader length: {len(grader_code)} characters")

        if dry_run:
            print("  (Dry run: validated successfully, not written to Firestore)")
        else:
            # 1. Write public metadata to 'problems' collection
            public_data = {
                "id": problem_id,
                "title": problem_meta.get("title", ""),
                "difficulty": problem_meta.get("difficulty", "Medium"),
                "tags": problem_meta.get("tags", []),
                "description_markdown": problem_meta.get("description_markdown", ""),
                "starter_code": problem_meta.get("starter_code", ""),
                "constraints": problem_meta.get("constraints", ""),
            }
            db.collection("problems").document(problem_id).set(public_data)
            print("  -> Uploaded to 'problems' collection")

            # 2. Write private grader to 'problem_graders' collection
            grader_data = {
                "problem_id": problem_id,
                "grader_code": grader_code,
            }
            db.collection("problem_graders").document(problem_id).set(grader_data)
            print("  -> Uploaded to 'problem_graders' collection")

    print("\nSeeding complete!")


if __name__ == "__main__":
    parser = argparse.ArgumentParser(description="Seed problems into Firestore")
    parser.add_argument("--service-account", help="Path to serviceAccountKey.json")
    parser.add_argument("--dry-run", action="store_true", help="Validate files without uploading to Firestore")
    args = parser.parse_args()

    seed_problems(args.service_account, dry_run=args.dry_run)
