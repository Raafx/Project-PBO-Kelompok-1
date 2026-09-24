from __future__ import annotations

from nicegui import ui

from app.bootstrap import create_student_service, seed_demo_data
from app.config import Settings
from app.views import dashboard_page, students_page


settings = Settings.from_env()
student_service = create_student_service(settings.database_path)
seed_demo_data(student_service)


def root() -> None:
    ui.colors(primary="#2563eb", secondary="#0f172a", accent="#0d9488", positive="#16a34a")

    with ui.header().classes("items-center bg-slate-900 px-4 md:px-7 shadow-md"):
        menu_button = ui.button(icon="menu").props("flat round color=white")
        ui.icon("school", color="white").classes("text-3xl")
        ui.label("Sistem Akademik").classes("text-lg font-semibold text-white")
        ui.space()
        ui.badge("NiceGUI + Python", color="primary").props("outline")

    with ui.left_drawer(value=True).classes("bg-slate-50 p-3") as drawer:
        ui.label("MENU UTAMA").classes("px-3 pt-2 text-xs font-bold tracking-wider text-slate-400")
        ui.link("Dashboard", "/").classes(
            "w-full rounded-lg px-3 py-3 text-slate-700 no-underline hover:bg-blue-50"
        )
        ui.link("Data Mahasiswa", "/mahasiswa").classes(
            "w-full rounded-lg px-3 py-3 text-slate-700 no-underline hover:bg-blue-50"
        )
        ui.separator().classes("my-4")
        with ui.card().classes("w-full bg-blue-50 p-4 shadow-none"):
            ui.icon("info", color="primary")
            ui.label("Proyek PBO").classes("font-semibold text-slate-800")
            ui.label("UI, logika bisnis, dan database ditulis dengan Python.").classes("text-xs text-slate-500")

    menu_button.on_click(drawer.toggle)

    with ui.column().classes("w-full max-w-7xl mx-auto p-4 md:p-8"):
        ui.sub_pages(
            {
                "/": lambda: dashboard_page(student_service),
                "/mahasiswa": lambda: students_page(student_service),
            }
        ).classes("w-full")


if __name__ in {"__main__", "__mp_main__"}:
    ui.run(
        root,
        host=settings.host,
        port=settings.port,
        title="Sistem Akademik",
        favicon="🎓",
        reload=settings.reload,
        show=settings.show_browser,
    )
