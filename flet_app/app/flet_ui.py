from __future__ import annotations

from collections.abc import Callable
from typing import Any

import flet as ft

from app.models import Student
from app.services import StudentService, ValidationError


MAJORS = [
    "Teknik Informatika",
    "Sistem Informasi",
    "Teknik Komputer",
    "Manajemen Informatika",
]


class StudentFletApplication:
    """Lapisan presentasi Flet untuk Sistem Manajemen Mahasiswa."""

    def __init__(self, page: ft.Page, service: StudentService) -> None:
        self.page = page
        self.service = service
        self.current_view = "dashboard"

        self.content = ft.Column(expand=True, scroll=ft.ScrollMode.AUTO, spacing=20)
        self.search = ft.TextField(
            label="Cari mahasiswa",
            hint_text="NIM, nama, atau jurusan",
            prefix_icon=ft.Icons.SEARCH,
            filled=True,
            fill_color=ft.Colors.WHITE,
            on_change=self._filter_changed,
            expand=True,
        )
        self.active_only = ft.Switch(
            label="Hanya mahasiswa aktif",
            value=False,
            on_change=self._filter_changed,
        )
        self.navigation = ft.NavigationRail(
            selected_index=0,
            extended=True,
            min_width=80,
            min_extended_width=220,
            label_type=ft.NavigationRailLabelType.NONE,
            bgcolor=ft.Colors.WHITE,
            indicator_color=ft.Colors.BLUE_100,
            group_alignment=-0.85,
            destinations=[
                ft.NavigationRailDestination(
                    icon=ft.Icons.DASHBOARD_OUTLINED,
                    selected_icon=ft.Icons.DASHBOARD,
                    label="Dashboard",
                ),
                ft.NavigationRailDestination(
                    icon=ft.Icons.GROUPS_OUTLINED,
                    selected_icon=ft.Icons.GROUPS,
                    label="Mahasiswa",
                ),
            ],
            on_change=self._navigation_changed,
        )

    def mount(self) -> None:
        self.page.title = "Sistem Akademik — Flet"
        self.page.theme = ft.Theme(color_scheme_seed=ft.Colors.BLUE, use_material3=True)
        self.page.theme_mode = ft.ThemeMode.LIGHT
        self.page.bgcolor = ft.Colors.GREY_50
        self.page.padding = 0
        self.page.on_resize = self._window_resized

        header = ft.Container(
            bgcolor=ft.Colors.BLUE_900,
            padding=ft.Padding.symmetric(horizontal=24, vertical=14),
            content=ft.Row(
                controls=[
                    ft.Icon(ft.Icons.SCHOOL, color=ft.Colors.WHITE, size=30),
                    ft.Text(
                        "Sistem Akademik",
                        size=20,
                        weight=ft.FontWeight.BOLD,
                        color=ft.Colors.WHITE,
                    ),
                    ft.Container(expand=True),
                    ft.Container(
                        padding=ft.Padding.symmetric(horizontal=12, vertical=6),
                        bgcolor=ft.Colors.BLUE_700,
                        border_radius=20,
                        content=ft.Text("Flet + Python", color=ft.Colors.WHITE, size=12),
                    ),
                ]
            ),
        )

        body = ft.Row(
            expand=True,
            spacing=0,
            vertical_alignment=ft.CrossAxisAlignment.STRETCH,
            controls=[
                self.navigation,
                ft.VerticalDivider(width=1, color=ft.Colors.GREY_300),
                ft.Container(
                    expand=True,
                    padding=ft.Padding.all(24),
                    content=self.content,
                ),
            ],
        )
        self.page.add(ft.Column([header, body], expand=True, spacing=0))
        self.show_dashboard()

    def show_dashboard(self) -> None:
        self.current_view = "dashboard"
        self.navigation.selected_index = 0
        summary = self.service.summary()
        students = self.service.list()

        self.content.controls = [
            self._page_heading(
                "Dashboard",
                "Ringkasan data akademik saat ini",
                ft.Button(
                    "Kelola Mahasiswa",
                    icon=ft.Icons.GROUPS,
                    bgcolor=ft.Colors.BLUE_700,
                    color=ft.Colors.WHITE,
                    on_click=lambda _: self.show_students(),
                ),
            ),
            ft.ResponsiveRow(
                controls=[
                    self._stat_card("Total Mahasiswa", str(summary["total"]), ft.Icons.GROUPS, ft.Colors.BLUE),
                    self._stat_card("Mahasiswa Aktif", str(summary["active"]), ft.Icons.VERIFIED_USER, ft.Colors.GREEN),
                    self._stat_card("Rata-rata IPK", f'{summary["average_gpa"]:.2f}', ft.Icons.SCHOOL, ft.Colors.TEAL),
                    self._stat_card("Jumlah Jurusan", str(summary["majors"]), ft.Icons.ACCOUNT_TREE, ft.Colors.INDIGO),
                ],
                spacing=16,
                run_spacing=16,
            ),
            self._student_table_card(students[:8], title="Data Mahasiswa Terbaru"),
        ]
        self.page.update()

    def show_students(self) -> None:
        self.current_view = "students"
        self.navigation.selected_index = 1
        students = self.service.list(
            search=self.search.value or "",
            active_only=bool(self.active_only.value),
        )
        self.content.controls = [
            self._page_heading(
                "Data Mahasiswa",
                "Klik ikon edit pada tabel untuk mengubah data",
                ft.Button(
                    "Tambah Mahasiswa",
                    icon=ft.Icons.PERSON_ADD,
                    bgcolor=ft.Colors.BLUE_700,
                    color=ft.Colors.WHITE,
                    on_click=lambda _: self.open_student_form(),
                ),
            ),
            ft.ResponsiveRow(
                controls=[
                    ft.Container(self.search, col={"sm": 12, "md": 8}),
                    ft.Container(self.active_only, col={"sm": 12, "md": 4}, padding=8),
                ],
                spacing=12,
                run_spacing=8,
            ),
            self._student_table_card(students, title=f"{len(students)} mahasiswa ditemukan"),
        ]
        self.page.update()

    def open_student_form(self, student: Student | None = None) -> None:
        editing = student is not None
        nim = ft.TextField(label="NIM", value=student.nim if student else "", autofocus=not editing)
        name = ft.TextField(label="Nama lengkap", value=student.name if student else "")
        major = ft.Dropdown(
            label="Jurusan",
            value=student.major if student else MAJORS[0],
            editable=True,
            enable_filter=True,
            options=[ft.DropdownOption(key=item, text=item) for item in MAJORS],
        )
        semester = ft.TextField(
            label="Semester",
            value=str(student.semester if student else 1),
            keyboard_type=ft.KeyboardType.NUMBER,
            col=6,
        )
        gpa = ft.TextField(
            label="IPK",
            value=f"{student.gpa:.2f}" if student else "0.00",
            keyboard_type=ft.KeyboardType.NUMBER,
            col=6,
        )
        active = ft.Switch(label="Mahasiswa aktif", value=student.active if student else True)

        def save(_: Any) -> None:
            try:
                values = {
                    "nim": nim.value,
                    "name": name.value,
                    "major": major.value or major.text or "",
                    "semester": semester.value,
                    "gpa": gpa.value,
                    "active": active.value,
                }
                if student:
                    self.service.update(student.id, **values)
                    message = "Data mahasiswa berhasil diperbarui."
                else:
                    self.service.create(**values)
                    message = "Mahasiswa berhasil ditambahkan."
            except ValidationError as error:
                self._notify(str(error), error=True)
                return
            self.page.pop_dialog()
            self.show_students()
            self._notify(message)

        actions: list[ft.Control] = []
        if student:
            actions.append(
                ft.TextButton(
                    "Hapus",
                    icon=ft.Icons.DELETE,
                    on_click=lambda _: self._confirm_delete(student),
                )
            )
        actions.extend(
            [
                ft.TextButton("Batal", on_click=lambda _: self.page.pop_dialog()),
                ft.Button(
                    "Simpan",
                    icon=ft.Icons.SAVE,
                    bgcolor=ft.Colors.BLUE_700,
                    color=ft.Colors.WHITE,
                    on_click=save,
                ),
            ]
        )

        self.page.show_dialog(
            ft.AlertDialog(
                modal=True,
                title=ft.Text("Ubah Mahasiswa" if editing else "Tambah Mahasiswa"),
                content=ft.Container(
                    width=520,
                    content=ft.Column(
                        controls=[
                            ft.Text("Lengkapi data di bawah ini.", color=ft.Colors.GREY_600),
                            nim,
                            name,
                            major,
                            ft.ResponsiveRow([semester, gpa]),
                            active,
                        ],
                        tight=True,
                        scroll=ft.ScrollMode.AUTO,
                    ),
                ),
                actions=actions,
                actions_alignment=ft.MainAxisAlignment.END,
                scrollable=True,
            )
        )

    def _navigation_changed(self, event: ft.Event[ft.NavigationRail]) -> None:
        if event.control.selected_index == 0:
            self.show_dashboard()
        else:
            self.show_students()

    def _window_resized(self, _: Any) -> None:
        width = self.page.width or 1200
        self.navigation.extended = width >= 850
        self.navigation.label_type = (
            ft.NavigationRailLabelType.NONE if self.navigation.extended else ft.NavigationRailLabelType.ALL
        )
        self.page.update()

    def _filter_changed(self, _: Any) -> None:
        if self.current_view == "students":
            self.show_students()

    def _page_heading(self, title: str, subtitle: str, action: ft.Control) -> ft.Control:
        return ft.Row(
            alignment=ft.MainAxisAlignment.SPACE_BETWEEN,
            vertical_alignment=ft.CrossAxisAlignment.CENTER,
            wrap=True,
            controls=[
                ft.Column(
                    controls=[
                        ft.Text(title, size=30, weight=ft.FontWeight.BOLD, color=ft.Colors.BLUE_GREY_900),
                        ft.Text(subtitle, color=ft.Colors.GREY_600),
                    ],
                    spacing=2,
                ),
                action,
            ],
        )

    def _stat_card(self, label: str, value: str, icon: ft.IconData, color: ft.ColorValue) -> ft.Control:
        return ft.Container(
            col={"sm": 12, "md": 6, "lg": 3},
            bgcolor=ft.Colors.WHITE,
            padding=20,
            border=ft.Border.all(1, ft.Colors.GREY_200),
            border_radius=16,
            shadow=ft.BoxShadow(blur_radius=12, color=ft.Colors.with_opacity(0.06, ft.Colors.BLACK)),
            content=ft.Row(
                alignment=ft.MainAxisAlignment.SPACE_BETWEEN,
                controls=[
                    ft.Column(
                        controls=[
                            ft.Text(label, size=13, color=ft.Colors.GREY_600),
                            ft.Text(value, size=30, weight=ft.FontWeight.BOLD, color=ft.Colors.BLUE_GREY_900),
                        ],
                        spacing=4,
                    ),
                    ft.Container(
                        width=52,
                        height=52,
                        bgcolor=ft.Colors.with_opacity(0.12, color),
                        border_radius=14,
                        alignment=ft.Alignment.CENTER,
                        content=ft.Icon(icon, color=color, size=28),
                    ),
                ],
            ),
        )

    def _student_table_card(self, students: list[Student], *, title: str) -> ft.Control:
        if not students:
            table_content: ft.Control = ft.Container(
                padding=48,
                alignment=ft.Alignment.CENTER,
                content=ft.Column(
                    horizontal_alignment=ft.CrossAxisAlignment.CENTER,
                    controls=[
                        ft.Icon(ft.Icons.SEARCH_OFF, size=48, color=ft.Colors.GREY_400),
                        ft.Text("Data mahasiswa tidak ditemukan", color=ft.Colors.GREY_500),
                    ],
                ),
            )
        else:
            rows = [self._student_row(student) for student in students]
            table_content = ft.Row(
                scroll=ft.ScrollMode.AUTO,
                controls=[
                    ft.DataTable(
                        heading_row_color=ft.Colors.BLUE_50,
                        border_radius=12,
                        column_spacing=28,
                        columns=[
                            ft.DataColumn("NIM"),
                            ft.DataColumn("Nama"),
                            ft.DataColumn("Jurusan"),
                            ft.DataColumn("Semester", numeric=True),
                            ft.DataColumn("IPK", numeric=True),
                            ft.DataColumn("Status"),
                            ft.DataColumn("Aksi"),
                        ],
                        rows=rows,
                    )
                ],
            )

        return ft.Container(
            bgcolor=ft.Colors.WHITE,
            padding=20,
            border=ft.Border.all(1, ft.Colors.GREY_200),
            border_radius=16,
            content=ft.Column(
                controls=[
                    ft.Text(title, size=18, weight=ft.FontWeight.BOLD, color=ft.Colors.BLUE_GREY_900),
                    ft.Divider(color=ft.Colors.GREY_200),
                    table_content,
                ],
                spacing=12,
            ),
        )

    def _student_row(self, student: Student) -> ft.DataRow:
        edit: Callable[[Any], None] = lambda _: self.open_student_form(student)
        status_color = ft.Colors.GREEN if student.active else ft.Colors.GREY
        return ft.DataRow(
            cells=[
                ft.DataCell(student.nim, on_tap=edit),
                ft.DataCell(student.name, on_tap=edit),
                ft.DataCell(student.major, on_tap=edit),
                ft.DataCell(str(student.semester), on_tap=edit),
                ft.DataCell(f"{student.gpa:.2f}", on_tap=edit),
                ft.DataCell(
                    ft.Container(
                        padding=ft.Padding.symmetric(horizontal=10, vertical=4),
                        border_radius=12,
                        bgcolor=ft.Colors.with_opacity(0.12, status_color),
                        content=ft.Text(
                            "Aktif" if student.active else "Tidak aktif",
                            color=status_color,
                            size=12,
                        ),
                    )
                ),
                ft.DataCell(ft.IconButton(ft.Icons.EDIT, tooltip="Ubah data", on_click=edit)),
            ]
        )

    def _confirm_delete(self, student: Student) -> None:
        def remove(_: Any) -> None:
            try:
                self.service.delete(student.id)
            except ValidationError as error:
                self._notify(str(error), error=True)
                return
            self.page.pop_dialog()
            self.page.pop_dialog()
            self.show_students()
            self._notify("Mahasiswa berhasil dihapus.")

        self.page.show_dialog(
            ft.AlertDialog(
                modal=True,
                title=ft.Text("Hapus mahasiswa?"),
                content=ft.Text(f"Data {student.name} ({student.nim}) akan dihapus permanen."),
                actions=[
                    ft.TextButton("Batal", on_click=lambda _: self.page.pop_dialog()),
                    ft.Button(
                        "Hapus",
                        icon=ft.Icons.DELETE,
                        bgcolor=ft.Colors.RED,
                        color=ft.Colors.WHITE,
                        on_click=remove,
                    ),
                ],
                actions_alignment=ft.MainAxisAlignment.END,
            )
        )

    def _notify(self, message: str, *, error: bool = False) -> None:
        self.page.show_dialog(
            ft.SnackBar(
                ft.Text(message, color=ft.Colors.WHITE),
                bgcolor=ft.Colors.RED_700 if error else ft.Colors.GREEN_700,
                show_close_icon=True,
            )
        )

