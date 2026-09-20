from __future__ import annotations

from abc import ABC, abstractmethod
from datetime import datetime, timezone

from app.database import Database
from app.models import Student


class StudentRepository(ABC):
    """Kontrak penyimpanan mahasiswa agar service tidak bergantung pada SQLite."""

    @abstractmethod
    def list(self, search: str = "", active_only: bool = False) -> list[Student]:
        raise NotImplementedError

    @abstractmethod
    def get(self, student_id: int) -> Student | None:
        raise NotImplementedError

    @abstractmethod
    def nim_exists(self, nim: str, exclude_id: int | None = None) -> bool:
        raise NotImplementedError

    @abstractmethod
    def create(
        self,
        *,
        nim: str,
        name: str,
        major: str,
        semester: int,
        gpa: float,
        active: bool,
    ) -> Student:
        raise NotImplementedError

    @abstractmethod
    def update(
        self,
        student_id: int,
        *,
        nim: str,
        name: str,
        major: str,
        semester: int,
        gpa: float,
        active: bool,
    ) -> Student:
        raise NotImplementedError

    @abstractmethod
    def delete(self, student_id: int) -> bool:
        raise NotImplementedError


class SQLiteStudentRepository(StudentRepository):
    """Implementasi repository mahasiswa menggunakan SQLite."""

    def __init__(self, database: Database) -> None:
        self._database = database

    def list(self, search: str = "", active_only: bool = False) -> list[Student]:
        clauses: list[str] = []
        parameters: list[object] = []

        if search:
            clauses.append("(nim LIKE ? OR name LIKE ? OR major LIKE ?)")
            pattern = f"%{search}%"
            parameters.extend([pattern, pattern, pattern])
        if active_only:
            clauses.append("active = 1")

        where = f" WHERE {' AND '.join(clauses)}" if clauses else ""
        query = f"SELECT * FROM students{where} ORDER BY name COLLATE NOCASE"
        with self._database.connection() as connection:
            rows = connection.execute(query, parameters).fetchall()
        return [Student.from_row(row) for row in rows]

    def get(self, student_id: int) -> Student | None:
        with self._database.connection() as connection:
            row = connection.execute(
                "SELECT * FROM students WHERE id = ?",
                (student_id,),
            ).fetchone()
        return Student.from_row(row) if row else None

    def nim_exists(self, nim: str, exclude_id: int | None = None) -> bool:
        query = "SELECT 1 FROM students WHERE nim = ? COLLATE NOCASE"
        parameters: list[object] = [nim]
        if exclude_id is not None:
            query += " AND id != ?"
            parameters.append(exclude_id)
        with self._database.connection() as connection:
            return connection.execute(query, parameters).fetchone() is not None

    def create(
        self,
        *,
        nim: str,
        name: str,
        major: str,
        semester: int,
        gpa: float,
        active: bool,
    ) -> Student:
        timestamp = datetime.now(timezone.utc).isoformat(timespec="seconds")
        with self._database.connection() as connection:
            cursor = connection.execute(
                """
                INSERT INTO students (nim, name, major, semester, gpa, active, created_at, updated_at)
                VALUES (?, ?, ?, ?, ?, ?, ?, ?)
                """,
                (nim, name, major, semester, gpa, int(active), timestamp, timestamp),
            )
            student_id = int(cursor.lastrowid)
        student = self.get(student_id)
        if student is None:
            raise RuntimeError("Data mahasiswa gagal dibaca setelah disimpan.")
        return student

    def update(
        self,
        student_id: int,
        *,
        nim: str,
        name: str,
        major: str,
        semester: int,
        gpa: float,
        active: bool,
    ) -> Student:
        timestamp = datetime.now(timezone.utc).isoformat(timespec="seconds")
        with self._database.connection() as connection:
            connection.execute(
                """
                UPDATE students
                SET nim = ?, name = ?, major = ?, semester = ?, gpa = ?, active = ?, updated_at = ?
                WHERE id = ?
                """,
                (nim, name, major, semester, gpa, int(active), timestamp, student_id),
            )
        student = self.get(student_id)
        if student is None:
            raise RuntimeError("Data mahasiswa tidak ditemukan setelah diperbarui.")
        return student

    def delete(self, student_id: int) -> bool:
        with self._database.connection() as connection:
            cursor = connection.execute("DELETE FROM students WHERE id = ?", (student_id,))
            return cursor.rowcount > 0

