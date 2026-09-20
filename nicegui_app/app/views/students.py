from __future__ import annotations

from nicegui import events, ui

from app.models import Student
from app.services import StudentService, ValidationError


MAJORS = [
    "Teknik Informatika",
    "Sistem Informasi",
    "Teknik Komputer",
    "Manajemen Informatika",
]


def students_page(service: StudentService) -> None:
    with ui.column().classes("w-full gap-5"):
        with ui.row().classes("w-full items-center justify-between gap-3"):
            with ui.column().classes("gap-0"):
                ui.label("Data Mahasiswa").classes("text-3xl font-bold text-slate-900")
                ui.label("Klik salah satu baris untuk mengubah data").classes("text-slate-500")
            add_button = ui.button("Tambah Mahasiswa", icon="person_add").props("unelevated")

        with ui.card().classes("w-full p-4 shadow-sm"):
            with ui.row().classes("w-full items-center gap-4"):
                search = ui.input(placeholder="Cari NIM, nama, atau jurusan...").props(
                    "outlined dense clearable"
                ).classes("grow min-w-64")
                active_only = ui.switch("Hanya mahasiswa aktif")

        def open_form(student: Student | None = None) -> None:
            editing = student is not None
            with ui.dialog() as dialog, ui.card().classes("w-[min(95vw,36rem)] p-6"):
                ui.label("Ubah Mahasiswa" if editing else "Tambah Mahasiswa").classes(
                    "text-2xl font-bold text-slate-900"
                )
                ui.label("Lengkapi data di bawah ini.").classes("text-sm text-slate-500")

                nim = ui.input("NIM", value=student.nim if student else "").props("outlined").classes("w-full").mark("nim-input")
                name = ui.input("Nama lengkap", value=student.name if student else "").props("outlined").classes("w-full").mark("name-input")
                major = ui.select(
                    MAJORS,
                    label="Jurusan",
                    value=student.major if student else MAJORS[0],
                    with_input=True,
                    new_value_mode="add-unique",
                ).props("outlined").classes("w-full").mark("major-input")
                with ui.row().classes("w-full gap-4"):
                    semester = ui.number(
                        "Semester",
                        value=student.semester if student else 1,
                        min=1,
                        max=14,
                        step=1,
                    ).props("outlined").classes("grow").mark("semester-input")
                    gpa = ui.number(
                        "IPK",
                        value=student.gpa if student else 0.0,
                        min=0,
                        max=4,
                        step=0.01,
                        format="%.2f",
                    ).props("outlined").classes("grow").mark("gpa-input")
                active = ui.switch("Mahasiswa aktif", value=student.active if student else True)

                def save() -> None:
                    try:
                        if student:
                            service.update(
                                student.id,
                                nim=nim.value,
                                name=name.value,
                                major=major.value,
                                semester=semester.value,
                                gpa=gpa.value,
                                active=active.value,
                            )
                            message = "Data mahasiswa berhasil diperbarui."
                        else:
                            service.create(
                                nim=nim.value,
                                name=name.value,
                                major=major.value,
                                semester=semester.value,
                                gpa=gpa.value,
                                active=active.value,
                            )
                            message = "Mahasiswa berhasil ditambahkan."
                    except ValidationError as error:
                        ui.notify(str(error), color="negative", icon="error")
                        return
                    dialog.close()
                    student_table.refresh()
                    ui.notify(message, color="positive", icon="check_circle")

                def confirm_delete() -> None:
                    if student is None:
                        return
                    with ui.dialog() as confirmation, ui.card().classes("w-[min(90vw,28rem)] p-6"):
                        ui.label("Hapus mahasiswa?").classes("text-xl font-bold")
                        ui.label(f"Data {student.name} ({student.nim}) akan dihapus permanen.")
                        with ui.row().classes("w-full justify-end gap-2"):
                            ui.button("Batal", on_click=confirmation.close).props("flat")

                            def remove() -> None:
                                try:
                                    service.delete(student.id)
                                except ValidationError as error:
                                    ui.notify(str(error), color="negative", icon="error")
                                    return
                                confirmation.close()
                                dialog.close()
                                student_table.refresh()
                                ui.notify("Mahasiswa berhasil dihapus.", color="positive", icon="delete")

                            ui.button("Hapus", icon="delete", on_click=remove, color="negative").props("unelevated")
                    confirmation.open()

                with ui.row().classes("w-full items-center justify-between pt-3"):
                    if editing:
                        ui.button("Hapus", icon="delete", on_click=confirm_delete, color="negative").props("flat")
                    else:
                        ui.space()
                    with ui.row().classes("gap-2"):
                        ui.button("Batal", on_click=dialog.close).props("flat")
                        ui.button("Simpan", icon="save", on_click=save).props("unelevated").mark("save-student")
            dialog.open()

        @ui.refreshable
        def student_table() -> None:
            students = service.list(
                search=search.value or "",
                active_only=bool(active_only.value),
            )
            rows = [
                {
                    "id": student.id,
                    "nim": student.nim,
                    "name": student.name,
                    "major": student.major,
                    "semester": student.semester,
                    "gpa": f"{student.gpa:.2f}",
                    "status": "Aktif" if student.active else "Tidak aktif",
                }
                for student in students
            ]
            columns = [
                {"name": "nim", "label": "NIM", "field": "nim", "align": "left", "sortable": True},
                {"name": "name", "label": "Nama", "field": "name", "align": "left", "sortable": True},
                {"name": "major", "label": "Jurusan", "field": "major", "align": "left", "sortable": True},
                {"name": "semester", "label": "Semester", "field": "semester", "align": "center", "sortable": True},
                {"name": "gpa", "label": "IPK", "field": "gpa", "align": "center", "sortable": True},
                {"name": "status", "label": "Status", "field": "status", "align": "center", "sortable": True},
            ]

            with ui.card().classes("w-full p-0 shadow-sm overflow-hidden"):
                if not rows:
                    with ui.column().classes("w-full items-center py-14 text-slate-400"):
                        ui.icon("search_off").classes("text-5xl")
                        ui.label("Data mahasiswa tidak ditemukan")
                else:
                    table = ui.table(
                        columns=columns,
                        rows=rows,
                        row_key="id",
                        pagination=10,
                    ).classes("w-full cursor-pointer").props("flat")

                    def edit_selected(event: events.GenericEventArguments) -> None:
                        row = event.args[1]
                        open_form(service.get(int(row["id"])))

                    table.on("row-click", edit_selected)

        search.on_value_change(lambda _: student_table.refresh())
        active_only.on_value_change(lambda _: student_table.refresh())
        add_button.on_click(lambda: open_form())
        student_table()
