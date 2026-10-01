# MYMARKET POS Backend

Backend FastAPI untuk frontend kasir MYMARKET. Data disimpan di MySQL/MariaDB
database `kasir-pbo`; nominal uang selalu berupa integer rupiah agar tidak terkena
masalah pembulatan floating-point.

## Setup lokal

Pastikan service MySQL aktif dan file `.env` berisi `DATABASE_URL` yang benar, lalu:

```powershell
cd back
.\scripts\setup-local.ps1
.\scripts\run.ps1
```

API tersedia di `http://127.0.0.1:8000`, dokumentasi interaktif di
`http://127.0.0.1:8000/docs`, dan health check di `/health`.

## Data demo historis

Untuk mengisi database lokal seolah toko telah beroperasi selama satu tahun:

```powershell
cd back
.venv\Scripts\python.exe -m app.demo_seed
```

Seeder ini menambahkan katalog, kasir, member, transaksi, pembayaran, purchase
order, dan pergerakan stok historis. Prosesnya idempotent sehingga aman dijalankan
ulang tanpa menggandakan data demo.

## Perintah pemeriksaan

```powershell
.venv\Scripts\python.exe -m ruff check .
.venv\Scripts\python.exe -m pytest
.venv\Scripts\python.exe -m alembic check
```

## Endpoint utama

| Method | Endpoint | Fungsi |
| --- | --- | --- |
| `GET` | `/api/v1/products` | Katalog/pencarian produk |
| `GET` | `/api/v1/products/barcode/{barcode}` | Lookup scanner |
| `GET` | `/api/v1/members/by-phone/{phone}` | Lookup member |
| `POST` | `/api/v1/vouchers/validate` | Validasi voucher |
| `POST` | `/api/v1/sales/checkout` | Simpan transaksi selesai |
| `POST` | `/api/v1/sales/hold` | Simpan transaksi hold |
| `GET` | `/api/v1/sales/holds` | Daftar transaksi hold |
| `GET` | `/api/v1/admin/dashboard` | Ringkasan stok dan pengadaan |
| `GET/POST` | `/api/v1/admin/suppliers` | Daftar/tambah supplier |
| `GET/POST` | `/api/v1/admin/purchase-orders` | Daftar/buat purchase order |
| `POST` | `/api/v1/admin/purchase-orders/{id}/submit` | Kirim PO ke supplier |
| `POST` | `/api/v1/admin/purchase-orders/{id}/receive` | Terima stok penuh/sebagian |
| `GET` | `/api/v1/admin/stock` | Daftar persediaan |
| `POST` | `/api/v1/admin/stock/adjustments` | Koreksi stok manual |

Harga checkout selalu dibaca ulang dari tabel `products`. Header
`X-Idempotency-Key` dapat dikirim saat checkout agar retry jaringan tidak membuat
transaksi ganda.

Checkout yang berhasil mengurangi persediaan dan menulis `stock_movements` secara
atomik. Penerimaan PO menambah stok dan memperbarui harga pokok dengan metode rata-rata
bergerak.

