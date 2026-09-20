from __future__ import annotations

import flet as ft

from app.bootstrap import create_student_service, seed_demo_data
from app.config import Settings
from app.flet_ui import StudentFletApplication


settings = Settings.from_env()
student_service = create_student_service(settings.database_path)
seed_demo_data(student_service)


def main(page: ft.Page) -> None:
    StudentFletApplication(page, student_service).mount()


if __name__ == "__main__":
    ft.run(
        main,
        host=settings.host,
        port=settings.port,
        view=ft.AppView.WEB_BROWSER if settings.show_browser else None,
    )
