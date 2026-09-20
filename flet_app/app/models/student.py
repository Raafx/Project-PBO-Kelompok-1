from __future__ import annotations

from dataclasses import dataclass
from datetime import datetime
from sqlite3 import Row


@dataclass(frozen=True, slots=True)
class Student:
    """Entitas mahasiswa pada domain aplikasi."""

    id: int
    nim: str
    name: str
    major: str
    semester: int
    gpa: float
    active: bool
    created_at: datetime
    updated_at: datetime

    @classmethod
    def from_row(cls, row: Row) -> "Student":
        return cls(
            id=row["id"],
            nim=row["nim"],
            name=row["name"],
            major=row["major"],
            semester=row["semester"],
            gpa=row["gpa"],
            active=bool(row["active"]),
            created_at=datetime.fromisoformat(row["created_at"]),
            updated_at=datetime.fromisoformat(row["updated_at"]),
        )

