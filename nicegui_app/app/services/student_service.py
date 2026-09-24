from __future__ import annotations

import re
from typing import TypedDict

from app.models import Student
from app.repositories import StudentRepository


class ValidationError(ValueError):
    """Kesalahan input yang aman untuk ditampilkan kepada pengguna."""


class StudentSummary(TypedDict):
    total: int
    active: int
    inactive: int
    average_gpa: float
    majors: int


class StudentService:
    """Menangani aturan bisnis mahasiswa di luar lapisan UI."""

    def __init__(self, repository: StudentRepository) -> None:
        self._repository = repository

    def list(self, search: str = "", active_only: bool = False) -> list[Student]:
        return self._repository.list(search=search.strip(), active_only=active_only)

    def get(self, student_id: int) -> Student:
        student = self._repository.get(student_id)
        if student is None:
            raise ValidationError("Mahasiswa tidak ditemukan.")
        return student

    def create(
        self,
        *,
        nim: str,
        name: str,
        major: str,
        semester: int | float | str,
        gpa: int | float | str,
        active: bool = True,
    ) -> Student:
        values = self._validate(
            nim=nim,
            name=name,
            major=major,
            semester=semester,
            gpa=gpa,
        )
        if self._repository.nim_exists(values["nim"]):
            raise ValidationError("NIM sudah digunakan mahasiswa lain.")
        return self._repository.create(**values, active=bool(active))

    def update(
        self,
        student_id: int,
        *,
        nim: str,
        name: str,
        major: str,
        semester: int | float | str,
        gpa: int | float | str,
        active: bool,
    ) -> Student:
        self.get(student_id)
        values = self._validate(
            nim=nim,
            name=name,
            major=major,
            semester=semester,
            gpa=gpa,
        )
        if self._repository.nim_exists(values["nim"], exclude_id=student_id):
            raise ValidationError("NIM sudah digunakan mahasiswa lain.")
        return self._repository.update(student_id, **values, active=bool(active))

    def delete(self, student_id: int) -> None:
        self.get(student_id)
        if not self._repository.delete(student_id):
            raise ValidationError("Mahasiswa gagal dihapus.")

    def summary(self) -> StudentSummary:
        students = self._repository.list()
        total = len(students)
        return {
            "total": total,
            "active": sum(student.active for student in students),
            "inactive": sum(not student.active for student in students),
            "average_gpa": round(sum(student.gpa for student in students) / total, 2) if total else 0.0,
            "majors": len({student.major.casefold() for student in students}),
        }

    @staticmethod
    def _validate(
        *,
        nim: str,
        name: str,
        major: str,
        semester: int | float | str,
        gpa: int | float | str,
    ) -> dict[str, str | int | float]:
        normalized_nim = str(nim or "").strip().upper()
        normalized_name = " ".join(str(name or "").split()).title()
        normalized_major = " ".join(str(major or "").split()).title()

        if not re.fullmatch(r"[A-Z0-9-]{4,20}", normalized_nim):
            raise ValidationError("NIM harus 4–20 karakter berupa huruf, angka, atau tanda hubung.")
        if len(normalized_name) < 3:
            raise ValidationError("Nama minimal terdiri dari 3 karakter.")
        if len(normalized_major) < 2:
            raise ValidationError("Jurusan wajib diisi.")

        try:
            normalized_semester = int(semester)
        except (TypeError, ValueError):
            raise ValidationError("Semester harus berupa angka.") from None
        if not 1 <= normalized_semester <= 14:
            raise ValidationError("Semester harus berada di antara 1 dan 14.")

        try:
            normalized_gpa = round(float(gpa), 2)
        except (TypeError, ValueError):
            raise ValidationError("IPK harus berupa angka.") from None
        if not 0 <= normalized_gpa <= 4:
            raise ValidationError("IPK harus berada di antara 0.00 dan 4.00.")

        return {
            "nim": normalized_nim,
            "name": normalized_name,
            "major": normalized_major,
            "semester": normalized_semester,
            "gpa": normalized_gpa,
        }

