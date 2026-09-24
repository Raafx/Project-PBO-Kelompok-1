from __future__ import annotations

import tempfile
import unittest
from pathlib import Path
from typing import Any

import flet as ft

from app.database import Database
from app.flet_ui import StudentFletApplication
from app.repositories import SQLiteStudentRepository
from app.services import StudentService


class FakePage:
    def __init__(self) -> None:
        self.controls: list[ft.Control] = []
        self.width = 1200
        self.update_count = 0
        self.title = ""
        self.theme: ft.Theme | None = None
        self.theme_mode: ft.ThemeMode | None = None
        self.bgcolor: Any = None
        self.padding: Any = None
        self.on_resize: Any = None

    def add(self, *controls: ft.Control) -> None:
        self.controls.extend(controls)

    def update(self) -> None:
        self.update_count += 1


class FletUiTest(unittest.TestCase):
    def setUp(self) -> None:
        self._temporary_directory = tempfile.TemporaryDirectory()
        database = Database(Path(self._temporary_directory.name) / "test.db")
        database.initialize()
        self.service = StudentService(SQLiteStudentRepository(database))
        self.service.create(
            nim="TI-2026-001",
            name="Mahasiswa Flet",
            major="Teknik Informatika",
            semester=2,
            gpa=3.8,
        )

    def tearDown(self) -> None:
        self._temporary_directory.cleanup()

    def test_mount_and_switch_views(self) -> None:
        page = FakePage()
        application = StudentFletApplication(page, self.service)  # type: ignore[arg-type]

        application.mount()

        self.assertEqual(application.current_view, "dashboard")
        self.assertEqual(page.title, "Sistem Akademik — Flet")
        self.assertEqual(len(page.controls), 1)

        application.show_students()

        self.assertEqual(application.current_view, "students")
        self.assertEqual(application.navigation.selected_index, 1)
        self.assertGreaterEqual(page.update_count, 2)


if __name__ == "__main__":
    unittest.main()
