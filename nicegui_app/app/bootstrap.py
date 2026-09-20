from __future__ import annotations

from pathlib import Path

from app.database import Database
from app.repositories import SQLiteStudentRepository
from app.services import StudentService


def create_student_service(database_path: Path) -> StudentService:
    """Menyusun dependency aplikasi dan memastikan skema database tersedia."""
    database = Database(database_path)
    database.initialize()
    return StudentService(SQLiteStudentRepository(database))


def seed_demo_data(service: StudentService) -> None:
    """Menambahkan data contoh hanya ketika database masih kosong."""
    if service.summary()["total"]:
        return
    service.create(
        nim="TI-2024-001",
        name="Ayu Lestari",
        major="Teknik Informatika",
        semester=4,
        gpa=3.82,
    )
    service.create(
        nim="SI-2023-014",
        name="Bima Pratama",
        major="Sistem Informasi",
        semester=6,
        gpa=3.55,
    )
    service.create(
        nim="TK-2025-008",
        name="Citra Dewi",
        major="Teknik Komputer",
        semester=2,
        gpa=3.74,
    )

