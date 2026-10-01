# MYMARKET POS

Workspace aplikasi kasir MYMARKET dengan frontend Next.js dan backend FastAPI.
Data operasional disimpan di database MySQL/MariaDB `kasir-pbo`.

## Struktur

- `front/` — UI kasir dan admin Next.js, TypeScript, serta pengujian interaksi.
- `back/` — API FastAPI, model SQLAlchemy, migrasi Alembic, seed, dan pengujian API.
- `admina-next-shadcn-typescript/` — sumber pola komponen Admina yang direuse pada admin MYMARKET.
- `nicegui_app/` dan `flet_app/` — prototipe pembanding lama; tidak dipakai oleh aplikasi POS utama.

## Menjalankan lokal

Pastikan service MySQL `mysql` aktif. Database lokal sudah dimigrasikan dan diisi
data awal. Untuk instalasi ulang backend:

```powershell
cd back
.\scripts\setup-local.ps1
.\scripts\run.ps1
```

API berjalan di `http://127.0.0.1:8000`; dokumentasinya tersedia di
`http://127.0.0.1:8000/docs`.

Buka terminal kedua untuk frontend:

```powershell
cd front
npm install
npm run dev
```

Frontend berjalan di `http://localhost:3000`. File `front/.env.local` mengarahkan
frontend ke `http://127.0.0.1:8000/api/v1`.

- Halaman kasir: `http://localhost:3000`
- Halaman admin operasional: `http://localhost:3000/admin`

## Modul admin

Admin memakai pola twin-sidebar, stat cards, chart cards, recent-order table, dan
filter report dari template Admina. Data contoh template tidak dipakai; seluruh angka
berasal dari database `kasir-pbo`.

- **Ringkasan** — omzet, transaksi, laba kotor, stok, metode bayar, dan aktivitas terbaru.
- **Penjualan** — pencarian dan filter seluruh transaksi POS.
- **Laporan** — rentang tanggal, tren omzet, produk/kategori terlaris, metode pembayaran,
  cetak, dan ekspor CSV.
- **Persediaan** — stok aktual, batas minimum, harga pokok, dan koreksi stok.
- **Pembelian** — purchase order, pengiriman PO, dan penerimaan parsial/penuh.
- **Supplier** — direktori pemasok dan form pemasok baru.
- **POS** — akses langsung kembali ke halaman kasir.

Endpoint laporan utama tersedia pada `GET /api/v1/admin/reports/sales`, sedangkan
riwayat transaksi tersedia pada `GET /api/v1/admin/sales`. Laporan akan otomatis
bertambah setelah transaksi diselesaikan dari halaman POS.

## Alur pengadaan admin

1. Tambahkan atau pilih supplier.
2. Buat purchase order berisi produk, jumlah, harga beli, dan estimasi tiba.
3. Kirim PO agar status berubah dari `Draft` menjadi `Dipesan`.
4. Saat barang datang, isi jumlah fisik yang diterima—termasuk penerimaan sebagian.
5. Sistem otomatis menambah stok, menghitung harga pokok rata-rata, dan menyimpan
   histori mutasi.

Checkout kasir juga memeriksa ketersediaan produk, mengurangi stok, dan mencatat
mutasi penjualan dalam transaksi database yang sama.

## Database

Migrasi awal membuat tabel berikut:

- `stores`, `cashiers`, dan `shifts` untuk operasional kasir;
- `products`, `members`, `vouchers`, dan `suppliers` untuk data master;
- `sales`, `sale_items`, dan `payments` untuk transaksi;
- `purchase_orders` dan `purchase_order_items` untuk pembelian stok;
- `stock_movements` untuk audit masuk/keluar persediaan;
- `alembic_version` untuk versi skema.

Semua nominal uang disimpan sebagai integer rupiah. Checkout menghitung ulang harga
dari tabel `products`, tidak mempercayai harga dari browser, dan mendukung header
`X-Idempotency-Key` agar retry jaringan tidak membuat transaksi ganda.

Halaman admin saat ini ditujukan untuk lingkungan lokal/internal. Tambahkan autentikasi
dan pembatasan role sebelum aplikasi dibuka ke jaringan publik.

Konfigurasi rahasia berada di `back/.env` dan tidak masuk Git. Template tersedia di
`back/.env.example`. Ganti password user database sebelum dipakai di jaringan atau
production.

## Pemeriksaan

```powershell
cd back
.venv\Scripts\python.exe -m ruff check .
.venv\Scripts\python.exe -m pytest
.venv\Scripts\python.exe -m alembic check

cd ..\front
npm run lint
npm run typecheck
npm test
npm run build
```

Daftar shortcut kasir dan catatan kiosk mode berada di `front/README.md`.
