# Sistem Akademik — NiceGUI

Aplikasi CRUD mahasiswa berbasis web dengan UI, event handler, logika bisnis,
dan akses SQLite yang seluruhnya ditulis dalam Python.

## Fitur

- Dashboard statistik mahasiswa
- Tambah, ubah, dan hapus data
- Pencarian dan filter mahasiswa aktif
- Validasi NIM, semester, dan IPK
- Arsitektur OOP: model, repository, service, dan view
- Pengujian service serta simulasi UI

## Menjalankan

```powershell
py -3.12 -m venv .venv
.venv\Scripts\Activate.ps1
python -m pip install -r requirements-dev.txt
python main.py
```

Buka <http://localhost:8080>.

## Pengujian

```powershell
python -m pytest -q
```

## Docker

```powershell
docker compose up --build -d
```

