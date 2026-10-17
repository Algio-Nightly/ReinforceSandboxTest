"""
Firebase Admin SDK initialization with automatic Local Development Mock fallback.
If a valid Firebase service account JSON key exists, connects to real Firestore.
Otherwise, falls back to a thread-safe in-memory mock pre-seeded with local problems.
"""
import os
import json
import logging
from pathlib import Path
from typing import Any, Dict, List, Optional
import uuid
from app.config import settings

logger = logging.getLogger("ml_judge.firebase")
_db = None


class MockDocumentSnapshot:
    def __init__(self, doc_id: str, data: Optional[Dict[str, Any]]):
        self.id = doc_id
        self._data = data

    @property
    def exists(self) -> bool:
        return self._data is not None

    def to_dict(self) -> Dict[str, Any]:
        return dict(self._data) if self._data else {}


class MockDocumentReference:
    def __init__(self, collection: "MockCollectionReference", doc_id: str):
        self.collection = collection
        self.id = doc_id

    def get(self) -> MockDocumentSnapshot:
        data = self.collection._docs.get(self.id)
        return MockDocumentSnapshot(self.id, data)

    def set(self, data: Dict[str, Any], merge: bool = False):
        if merge and self.id in self.collection._docs:
            self.collection._docs[self.id].update(data)
        else:
            self.collection._docs[self.id] = dict(data)

    def update(self, data: Dict[str, Any]):
        if self.id not in self.collection._docs:
            self.collection._docs[self.id] = {}
        self.collection._docs[self.id].update(data)


class MockQuery:
    def __init__(self, collection: "MockCollectionReference"):
        self.collection = collection
        self._filters = []
        self._limit = None

    def where(self, field: str, op: str, value: Any):
        self._filters.append((field, op, value))
        return self

    def limit(self, count: int):
        self._limit = count
        return self

    def get(self) -> List[MockDocumentSnapshot]:
        results = []
        for doc_id, data in self.collection._docs.items():
            match = True
            for field, op, val in self._filters:
                doc_val = data.get(field)
                if op == "==" and doc_val != val:
                    match = False
                    break
            if match:
                results.append(MockDocumentSnapshot(doc_id, data))
                if self._limit and len(results) >= self._limit:
                    break
        return results


class MockCollectionReference:
    def __init__(self, name: str):
        self.name = name
        self._docs: Dict[str, Dict[str, Any]] = {}

    def document(self, doc_id: Optional[str] = None) -> MockDocumentReference:
        if not doc_id:
            doc_id = str(uuid.uuid4())
        return MockDocumentReference(self, doc_id)

    def where(self, field: str, op: str, value: Any) -> MockQuery:
        query = MockQuery(self)
        return query.where(field, op, value)

    def stream(self):
        for doc_id, data in self.collection_docs_snapshot():
            yield MockDocumentSnapshot(doc_id, data)

    def collection_docs_snapshot(self):
        return list(self._docs.items())


class MockFirestoreClient:
    def __init__(self):
        self._collections: Dict[str, MockCollectionReference] = {}
        self._seed_local_problems()

    def collection(self, name: str) -> MockCollectionReference:
        if name not in self._collections:
            self._collections[name] = MockCollectionReference(name)
        return self._collections[name]

    def _seed_local_problems(self):
        """Auto-seed from ../problems directory for instant local development."""
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
                    self.collection("problems").document(p_id).set(data)
                    if grader_file.exists():
                        self.collection("problem_graders").document(p_id).set({
                            "problem_id": p_id,
                            "grader_code": grader_file.read_text(encoding="utf-8"),
                        })
                except Exception as err:
                    logger.warning("Failed to auto-seed %s: %s", p_dir.name, err)


def init_firebase():
    """Initialize Firebase Admin SDK or fallback to local in-memory mock."""
    global _db
    sa_path = settings.FIREBASE_SERVICE_ACCOUNT_PATH

    # Check relative to backend dir or root
    candidate_paths = [
        Path(sa_path),
        Path(__file__).resolve().parent.parent / sa_path,
        Path(__file__).resolve().parent.parent.parent / sa_path,
    ]

    found_path = next((p for p in candidate_paths if p.is_file()), None)

    if found_path:
        try:
            import firebase_admin
            from firebase_admin import credentials, firestore
            if not firebase_admin._apps:
                cred = credentials.Certificate(str(found_path))
                firebase_admin.initialize_app(cred)
            _db = firestore.client()
            logger.info("Connected to Firestore using service account: %s", found_path)
            return
        except Exception as e:
            logger.warning("Failed to initialize Firebase with %s: %s", found_path, e)

    # Fallback to in-memory mock
    logger.info("Firebase service account not found or invalid; using in-memory Mock Firestore.")
    _db = MockFirestoreClient()


def get_db():
    """Return the Firestore client (real or mock)."""
    global _db
    if _db is None:
        init_firebase()
    return _db
