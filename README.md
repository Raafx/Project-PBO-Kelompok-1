# Perbandingan NiceGUI dan Flet

Workspace ini berisi dua proyek yang berdiri sendiri:

- `nicegui_app/` — aplikasi web Python menggunakan NiceGUI.
- `flet_app/` — aplikasi web/cross-platform Python menggunakan Flet.

Kedua proyek memiliki salinan model, repository, service, database, dependency,
pengujian, dan konfigurasi Docker masing-masing. Perubahan di satu proyek tidak
memengaruhi proyek lainnya.

## Menjalankan NiceGUI

```powershell
cd nicegui_app
py -3.12 -m venv .venv
.venv\Scripts\Activate.ps1
python -m pip install -r requirements-dev.txt
python main.py
```

## Menjalankan Flet

```powershell
cd flet_app
py -3.12 -m venv .venv
.venv\Scripts\Activate.ps1
python -m pip install -r requirements-dev.txt
python main.py
```

Keduanya memakai port `8080` secara default. Jalankan bergantian, atau ubah
`APP_PORT` jika ingin membandingkannya secara bersamaan.

