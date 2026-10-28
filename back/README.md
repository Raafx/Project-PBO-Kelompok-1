# MYMARKET POS Backend

Backend FastAPI untuk frontend kasir MYMARKET. Data disimpan di MySQL/MariaDB
database `kasir-pbo`; nominal uang selalu berupa integer rupiah agar tidak terkena
masalah pembulatan floating-point.

Peta endpoint, perhitungan, dan model tersedia di [PANDUAN_KODE.md](../PANDUAN_KODE.md).

## Setup lokal

Pastikan service MySQL aktif dan file `.env` berisi `DATABASE_URL` yang benar, lalu:

```powershell
cd back
.\scripts\setup-local.ps1
.\scripts\run.ps1
```

API tersedia di `http://127.0.0.1:8000`, dokumentasi interaktif di
`http://127.0.0.1:8000/docs`, dan health check di `/health`.

Akun hasil seed memakai password awal `password`: `kasir@gmail.com` untuk Kasir,
`admin@gmail.com` untuk akses penuh, dan `gudang@gmail.com` untuk Staf Gudang.
Kasir masuk langsung tanpa TOTP. Admin dan Staf Gudang menghubungkan Authenticator
melalui QR pada login pertama.

## CEO Copilot

Pertanyaan angka dijawab dari database tanpa API key: omzet per periode, perbandingan,
tanggal omzet tertinggi, performa/laba produk, stok, dan isi transaksi. Hasilnya memakai
service agregasi yang sama dengan laporan admin. Untuk analisis kualitatif, isi API key
Gemini di `back/.env`. Key hanya dibaca FastAPI dan tidak masuk bundle frontend.

```env
GEMINI_API_KEY=isi_api_key_kamu
GEMINI_MODEL=gemini-3.5-flash-lite
GEMINI_FALLBACK_MODEL=gemini-3.6-flash
GEMINI_TIMEOUT_SECONDS=12
GEMINI_RETRY_ATTEMPTS=1
GOOGLE_CLOUD_PROJECT_NAME=projek-pbo
GOOGLE_CLOUD_PROJECT_NUMBER=69198748984
```

Setelah mengubah `.env`, restart backend. Gemini hanya menerima ringkasan terbatas dari
data read-only. Jawaban model ditampilkan setelah selesai dan lolos pemeriksaan format
serta teks internal. Respons database dikirim segera. Riwayat tersimpan per akun admin;
daftar percakapan hanya memuat judul dan waktu, sedangkan detail pesan diambil saat
percakapan dipilih. Endpoint chat memerlukan permission `admin.ceo_chat`, yang secara
default hanya dimiliki role Pemilik.

## Data demo historis

Untuk mengisi database lokal seolah toko telah beroperasi selama satu tahun:

```powershell
cd back
.venv\Scripts\python.exe -m app.demo_seed
```

Seeder ini menambahkan katalog, kasir, member, transaksi, pembayaran, purchase
order, dan pergerakan stok historis. Prosesnya idempotent sehingga aman dijalankan
ulang tanpa menggandakan data demo.

Katalog 48 produk supermarket Indonesia bisa disinkronkan tersendiri dengan:

```powershell
.venv\Scripts\python.exe -m app.download_catalog_images
.venv\Scripts\python.exe -m app.indonesia_catalog
```

Perintah ini menyiapkan foto lokal, mengaktifkan produk Indonesia, dan mengarsipkan
katalog lama tanpa menghapus referensi produk pada transaksi historis. Untuk mengganti
master produk beserta seluruh data transaksi dan laporan demo secara end-to-end, gunakan:

```powershell
.venv\Scripts\python.exe -m app.demo_seed --reset
```

Perintah reset membuat backup JSON lengkap di `back/backups/`, membersihkan data
operasional lama, lalu membangun satu tahun histori baru memakai produk Indonesia.

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
| `POST` | `/api/v1/auth/login` | Login dan membuat sesi 12 jam |
| `POST` | `/api/v1/auth/forgot-password` | Membuat token reset password |
| `GET/PUT` | `/api/v1/auth/profile` | Lihat/ubah profil akun |
| `POST` | `/api/v1/shifts/open` | Buka shift dengan modal awal |
| `POST` | `/api/v1/shifts/{id}/cash-movements` | Catat kas masuk/keluar |
| `POST` | `/api/v1/shifts/{id}/close` | Tutup shift dan hitung selisih |
| `POST` | `/api/v1/sales/{nomor}/void` | Void dengan PIN supervisor |
| `POST` | `/api/v1/live-transactions/heartbeat` | Kirim snapshot workflow dari POS |
| `GET` | `/api/v1/admin/access/me` | Profil aktor dan permission aktif |
| `GET` | `/api/v1/admin/dashboard` | Ringkasan stok gudang/kasir |
| `GET/POST` | `/api/v1/admin/products` | Daftar/tambah master produk |
| `PUT/DELETE` | `/api/v1/admin/products/{id}` | Edit/nonaktifkan produk |
| `GET/POST` | `/api/v1/admin/suppliers` | Daftar/tambah supplier |
| `GET/POST` | `/api/v1/admin/purchases` | Daftar/catat pembelian langsung ke gudang |
| `GET` | `/api/v1/admin/stock` | Daftar persediaan |
| `POST` | `/api/v1/admin/stock/adjustments` | Koreksi stok manual |
| `POST` | `/api/v1/admin/stock/transfers` | Transfer gudang ↔ kasir |
| `GET` | `/api/v1/admin/operations` | Snapshot operasional lengkap |
| `POST` | `/api/v1/admin/promotions` | Buat promo otomatis POS |
| `POST` | `/api/v1/admin/stock-counts` | Stock opname fisik |
| `POST` | `/api/v1/admin/purchase-orders` | Buat PO tanpa menambah stok |
| `POST` | `/api/v1/admin/purchase-orders/{id}/receive` | Terima barang PO |
| `POST` | `/api/v1/admin/purchase-orders/auto` | PO otomatis dari stok minimum |
| `GET` | `/api/v1/admin/products/export.xlsx` | Ekspor master produk |
| `POST` | `/api/v1/admin/products/import.xlsx` | Import master produk |
| `GET` | `/api/v1/admin/reports/operations` | Laba rugi dan laporan operasional |
| `GET/PUT` | `/api/v1/admin/roles` | Daftar/ubah permission role |
| `GET` | `/api/v1/admin/staff` | Daftar petugas dan role |
| `PUT` | `/api/v1/admin/staff/{id}/role` | Ubah role petugas |
| `GET` | `/api/v1/admin/live-transactions` | Snapshot workflow kasir terkini |
| `GET` | `/api/v1/admin/live-transactions/stream` | Stream NDJSON transaksi realtime |
| `GET` | `/api/v1/admin/reports/sales` | Laporan harian/bulanan, performa produk, dan detail transaksi |
| `GET` | `/api/v1/admin/sales` | Cari transaksi termasuk berdasarkan nama/barcode produk |
| `GET` | `/api/v1/admin/ceo-chat/status` | Mode database/Gemini |
| `GET/POST` | `/api/v1/admin/ceo-chat/conversations` | Ringkasan riwayat/buat chat CEO |
| `GET/DELETE` | `/api/v1/admin/ceo-chat/conversations/{id}` | Detail/hapus percakapan |
| `POST` | `/api/v1/admin/ceo-chat/conversations/{id}/messages` | Jawaban berbasis database atau Gemini melalui NDJSON |

Endpoint admin menerima bearer token dari login dan menolak akses yang tidak dimiliki role.
`X-Actor-Code` masih didukung khusus alur development/test lokal.
Header `X-Idempotency-Key` digunakan pada checkout dan pembelian langsung agar retry
jaringan tidak membuat transaksi atau stok ganda.

Data live tidak menerima harga dari browser. Backend membaca ulang barcode dan harga
dari master produk, menghitung total, lalu menyimpan snapshot sesi kasir. Heartbeat
yang berhenti lebih dari 15 detik otomatis ditampilkan offline. Aktivitas selesai,
hold, dan batal tetap tampil selama 15 menit untuk monitoring operasional.

Pembelian langsung menambah stok gudang dan memperbarui harga pokok rata-rata bergerak.
Hanya transfer gudang ke kasir yang membuat stok tersebut tersedia untuk checkout.
Semua perubahan menyimpan petugas pelaksana di audit persediaan.

Master produk menyimpan nama, SKU, barcode, kategori, lokasi, foto, harga beli,
harga jual, batas minimum, dan status aktif. Produk baru selalu mulai dari stok nol;
saldo stok tetap diubah melalui pembelian, transfer, atau koreksi agar audit tidak
terputus. Penghapusan memakai status nonaktif sehingga transaksi lama tetap aman.

