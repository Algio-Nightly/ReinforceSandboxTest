"""
Pydantic-driven Database Service Layer for Firestore.
Manages all Firestore collections through strongly-typed Pydantic models.
"""
import logging
from typing import List, Optional, Dict, Any
from pathlib import Path
import json

from app.firebase_client import get_db
from app.models import (
    UserInDB,
    ProblemInDB,
    ProblemGraderInDB,
    SubmissionInDB,
    TestResultDoc,
    HiddenSummaryDoc,
)
from app.problems.schemas import ProblemSummary, ProblemDetail

logger = logging.getLogger("ml_judge.db")


class UserService:
    @staticmethod
    def get_by_email(email: str) -> Optional[UserInDB]:
        db = get_db()
        docs = db.collection("users").where("email", "==", email).limit(1).get()
        if not docs:
            return None
        data = docs[0].to_dict()
        data["id"] = docs[0].id
        return UserInDB.model_validate(data)

    @staticmethod
    def get_by_id(user_id: str) -> Optional[UserInDB]:
        db = get_db()
        doc = db.collection("users").document(user_id).get()
        if not doc.exists:
            return None
        data = doc.to_dict()
        data["id"] = doc.id
        return UserInDB.model_validate(data)

    @staticmethod
    def get_by_firebase_uid(uid: str) -> Optional[UserInDB]:
        db = get_db()
        docs = db.collection("users").where("firebase_uid", "==", uid).limit(1).get()
        if not docs:
            return None
        data = docs[0].to_dict()
        data["id"] = docs[0].id
        return UserInDB.model_validate(data)

    @staticmethod
    def create(user: UserInDB) -> UserInDB:
        db = get_db()
        ref = db.collection("users").document()
        user_dict = user.model_dump(exclude={"id"})
        ref.set(user_dict)
        user.id = ref.id
        return user


class ProblemService:
    @staticmethod
    def list_all() -> List[ProblemSummary]:
        db = get_db()
        docs = db.collection("problems").stream()
        results = []
        for doc in docs:
            data = doc.to_dict()
            data["id"] = doc.id
            results.append(ProblemSummary.model_validate(data))
        return results

    @staticmethod
    def get_by_id(problem_id: str) -> Optional[ProblemDetail]:
        db = get_db()
        doc = db.collection("problems").document(problem_id).get()
        if not doc.exists:
            return None
        data = doc.to_dict()
        data["id"] = doc.id
        return ProblemDetail.model_validate(data)

    @staticmethod
    def upsert(problem: ProblemInDB):
        db = get_db()
        data = problem.model_dump(exclude={"id"})
        db.collection("problems").document(problem.id).set(data)


class GraderService:
    @staticmethod
    def get_by_problem_id(problem_id: str) -> Optional[ProblemGraderInDB]:
        db = get_db()
        doc = db.collection("problem_graders").document(problem_id).get()
        if not doc.exists:
            return None
        data = doc.to_dict()
        return ProblemGraderInDB.model_validate(data)

    @staticmethod
    def upsert(grader: ProblemGraderInDB):
        db = get_db()
        data = grader.model_dump()
        db.collection("problem_graders").document(grader.problem_id).set(data)


class SubmissionService:
    @staticmethod
    def create(submission: SubmissionInDB) -> str:
        db = get_db()
        ref = db.collection("submissions").document()
        sub_dict = submission.model_dump(exclude={"id"})
        ref.set(sub_dict)
        return ref.id

    @staticmethod
    def get_by_id(submission_id: str) -> Optional[SubmissionInDB]:
        db = get_db()
        doc = db.collection("submissions").document(submission_id).get()
        if not doc.exists:
            return None
        data = doc.to_dict()
        data["id"] = doc.id
        return SubmissionInDB.model_validate(data)

    @staticmethod
    def update(submission_id: str, updates: Dict[str, Any]):
        db = get_db()
        db.collection("submissions").document(submission_id).update(updates)


class DatabaseService:
    users = UserService
    problems = ProblemService
    graders = GraderService
    submissions = SubmissionService

    @classmethod
    def initialize_database(cls):
        """
        Initializes and validates Firestore collections.
        Seeds local problem catalog from problems/ folder if not yet populated.
        """
        logger.info("Initializing API Database...")
        problems_dir = Path(__file__).resolve().parent.parent.parent / "problems"
        if not problems_dir.exists():
            return

        for p_dir in problems_dir.iterdir():
            if not p_dir.is_dir():
                continue
            meta_file = p_dir / "problem.json"
            grader_file = p_dir / "test_grader.py"
            if meta_file.exists():
                try:
                    data = json.loads(meta_file.read_text(encoding="utf-8"))
                    p_id = data.get("id", p_dir.name)
                    data["id"] = p_id

                    # Validate with Pydantic model
                    problem_model = ProblemInDB.model_validate(data)
                    cls.problems.upsert(problem_model)

                    if grader_file.exists():
                        grader_code = grader_file.read_text(encoding="utf-8")
                        grader_model = ProblemGraderInDB(
                            problem_id=p_id,
                            grader_code=grader_code,
                        )
                        cls.graders.upsert(grader_model)

                    logger.info("Validated & initialized problem: %s", p_id)
                except Exception as err:
                    logger.warning("Failed to initialize problem %s: %s", p_dir.name, err)


db_service = DatabaseService()
