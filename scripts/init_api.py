"""
API Initialization Script.
Connects to Firestore (or local mock), validates all collections,
and initializes seed problems via Pydantic models.

Usage:
    python scripts/init_api.py
"""
import sys
from pathlib import Path

# Add backend directory to sys.path
backend_dir = Path(__file__).resolve().parent.parent / "backend"
sys.path.insert(0, str(backend_dir))

from app.firebase_client import init_firebase
from app.database import db_service


def main():
    print("=" * 60)
    print("ML Code Judge — Initializing API & Firestore Database")
    print("=" * 60)

    # 1. Initialize Firestore client
    print("\n1. Connecting to Firestore...")
    init_firebase()

    # 2. Initialize Database & seed problem catalog
    print("\n2. Initializing database and validating seed problems...")
    db_service.initialize_database()

    # 3. Verify problems are available
    problems = db_service.problems.list_all()
    print(f"\n3. Verification complete! {len(problems)} problem(s) loaded:")
    for p in problems:
        print(f"   • [{p.difficulty}] {p.title} (id: {p.id}, tags: {p.tags})")

    print("\nAPI initialization successful! All collections are ready.")
    print("=" * 60)


if __name__ == "__main__":
    main()
