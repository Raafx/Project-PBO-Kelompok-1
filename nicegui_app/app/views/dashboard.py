from __future__ import annotations

from nicegui import ui

from app.services import StudentService


def _stat_card(icon: str, label: str, value: str, color: str) -> None:
    with ui.card().classes("w-full min-w-52 flex-1 p-5 shadow-sm"):
        with ui.row().classes("w-full items-center justify-between"):
            with ui.column().classes("gap-1"):
                ui.label(label).classes("text-sm text-slate-500")
                ui.label(value).classes("text-3xl font-bold text-slate-800")
            ui.icon(icon, color=color).classes("text-4xl")


def dashboard_page(service: StudentService) -> None:
    summary = service.summary()
    students = service.list()

    with ui.column().classes("w-full gap-6"):
        with ui.row().classes("w-full items-center justify-between gap-3"):
            with ui.column().classes("gap-0"):
                ui.label("Dashboard").classes("text-3xl font-bold text-slate-900")
                ui.label("Ringkasan data akademik saat ini").classes("text-slate-500")
            ui.button(
                "Kelola Mahasiswa",
                icon="groups",
                on_click=lambda: ui.navigate.to("/mahasiswa"),
            ).props("unelevated")

        with ui.row().classes("w-full gap-4"):
            _stat_card("groups", "Total Mahasiswa", str(summary["total"]), "primary")
            _stat_card("verified_user", "Mahasiswa Aktif", str(summary["active"]), "positive")
            _stat_card("school", "Rata-rata IPK", f'{summary["average_gpa"]:.2f}', "accent")
            _stat_card("account_tree", "Jumlah Jurusan", str(summary["majors"]), "secondary")

        with ui.card().classes("w-full p-5 shadow-sm"):
            with ui.row().classes("w-full items-center justify-between"):
                ui.label("Data Mahasiswa").classes("text-xl font-semibold text-slate-800")
                ui.badge(f'{summary["active"]} aktif', color="positive")

            if not students:
                with ui.column().classes("w-full items-center py-12 text-slate-400"):
                    ui.icon("person_off").classes("text-5xl")
                    ui.label("Belum ada data mahasiswa")
            else:
                rows = [
                    {
                        "nim": student.nim,
                        "name": student.name,
                        "major": student.major,
                        "semester": student.semester,
                        "gpa": f"{student.gpa:.2f}",
                        "status": "Aktif" if student.active else "Tidak aktif",
                    }
                    for student in students[:8]
                ]
                columns = [
                    {"name": "nim", "label": "NIM", "field": "nim", "align": "left"},
                    {"name": "name", "label": "Nama", "field": "name", "align": "left"},
                    {"name": "major", "label": "Jurusan", "field": "major", "align": "left"},
                    {"name": "semester", "label": "Semester", "field": "semester", "align": "center"},
                    {"name": "gpa", "label": "IPK", "field": "gpa", "align": "center"},
                    {"name": "status", "label": "Status", "field": "status", "align": "center"},
                ]
                ui.table(columns=columns, rows=rows, row_key="nim", pagination=8).classes("w-full").props("flat")

