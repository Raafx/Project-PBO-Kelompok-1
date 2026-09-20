from __future__ import annotations

from pathlib import Path

import pytest
from nicegui.testing.user_simulation import user_simulation


@pytest.mark.asyncio
async def test_dashboard_and_student_form(monkeypatch: pytest.MonkeyPatch, tmp_path: Path) -> None:
    monkeypatch.setenv("APP_DATABASE_PATH", str(tmp_path / "ui-test.db"))
    monkeypatch.setenv("APP_RELOAD", "false")
    monkeypatch.setenv("APP_SHOW_BROWSER", "false")

    async with user_simulation(main_file=Path("main.py").resolve()) as user:
        await user.open("/")
        await user.should_see("Dashboard")
        await user.should_see("Total Mahasiswa")

        await user.open("/mahasiswa")
        await user.should_see("Data Mahasiswa")
        user.find("Tambah Mahasiswa").click()
        await user.should_see("Lengkapi data di bawah ini.")

        user.find(marker="nim-input").clear().type("TI-2026-099")
        user.find(marker="name-input").clear().type("Mahasiswa Uji")
        user.find(marker="semester-input").clear().type("3")
        user.find(marker="gpa-input").clear().type("3.9")
        user.find(marker="save-student").click()

        await user.should_see("Mahasiswa berhasil ditambahkan.")
        await user.should_see("Mahasiswa Uji")
