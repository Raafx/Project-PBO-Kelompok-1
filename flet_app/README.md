# Sistem Akademik — Flet

Aplikasi CRUD mahasiswa berbasis Flet 1.0. UI dan event handler ditulis dalam
Python serta dapat dijalankan sebagai web, desktop, dan dikembangkan menuju
mobile.

## Fitur

- Dashboard responsif
- Navigasi samping adaptif
- Tambah, ubah, dan hapus data
- Pencarian dan filter mahasiswa aktif
- Database SQLite mandiri
- Arsitektur OOP: model, repository, service, dan UI

## Menjalankan sebagai web

```powershell
py -3.12 -m venv .venv
.venv\Scripts\Activate.ps1
python -m pip install -r requirements-dev.txt
python main.py
```

Buka <http://localhost:8080>.

Untuk menggunakan port lain:

```powershell
$env:APP_PORT = "8000"
python main.py
```

## Pengujian

```powershell
python -m pytest -q
```

## Docker

```powershell
docker compose up --build -d
```

