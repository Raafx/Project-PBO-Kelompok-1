$ErrorActionPreference = "Stop"
$backendRoot = Split-Path -Parent $PSScriptRoot
Set-Location $backendRoot

if (-not (Test-Path ".venv\Scripts\python.exe")) {
    throw "Virtual environment belum ada. Jalankan .\scripts\setup-local.ps1 terlebih dahulu."
}

& ".venv\Scripts\python.exe" -m uvicorn app.main:app --reload --host 127.0.0.1 --port 8000

