from __future__ import annotations

import tempfile
import unittest
from pathlib import Path

from app.database import Database
from app.repositories import SQLiteStudentRepository
from app.services import StudentService, ValidationError


class StudentServiceTest(unittest.TestCase):
    def setUp(self) -> None:
        self._temporary_directory = tempfile.TemporaryDirectory()
        database = Database(Path(self._temporary_directory.name) / "test.db")
        database.initialize()
        self.service = StudentService(SQLiteStudentRepository(database))

    def tearDown(self) -> None:
        self._temporary_directory.cleanup()

    def test_create_normalizes_input_and_updates_summary(self) -> None:
        student = self.service.create(
            nim="ti-2025-001",
            name="  ani   saputri ",
            major="teknik informatika",
            semester=2,
            gpa=3.756,
        )

        self.assertEqual(student.nim, "TI-2025-001")
        self.assertEqual(student.name, "Ani Saputri")
        self.assertEqual(student.gpa, 3.76)
        self.assertEqual(self.service.summary()["total"], 1)

    def test_duplicate_nim_is_rejected_case_insensitively(self) -> None:
        values = {
            "nim": "SI-2025-002",
            "name": "Raka Putra",
            "major": "Sistem Informasi",
            "semester": 2,
            "gpa": 3.4,
        }
        self.service.create(**values)

        with self.assertRaisesRegex(ValidationError, "NIM sudah digunakan"):
            self.service.create(**{**values, "nim": "si-2025-002", "name": "Nama Lain"})

    def test_update_and_delete(self) -> None:
        student = self.service.create(
            nim="TK-2024-003",
            name="Dian Prakoso",
            major="Teknik Komputer",
            semester=3,
            gpa=3.1,
        )
        updated = self.service.update(
            student.id,
            nim=student.nim,
            name=student.name,
            major=student.major,
            semester=4,
            gpa=3.35,
            active=False,
        )

        self.assertEqual(updated.semester, 4)
        self.assertFalse(updated.active)
        self.assertEqual(self.service.summary()["inactive"], 1)

        self.service.delete(student.id)
        self.assertEqual(self.service.summary()["total"], 0)

    def test_invalid_gpa_is_rejected(self) -> None:
        with self.assertRaisesRegex(ValidationError, "IPK"):
            self.service.create(
                nim="MI-2025-004",
                name="Eka Putri",
                major="Manajemen Informatika",
                semester=1,
                gpa=4.5,
            )


if __name__ == "__main__":
    unittest.main()
