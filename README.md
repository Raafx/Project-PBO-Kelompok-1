# MYMARKET POS

Workspace aplikasi kasir MYMARKET dengan frontend Next.js dan backend FastAPI.
Data operasional disimpan di database MySQL/MariaDB `kasir-pbo`.

**Baru belajar kodenya?** Mulai dari [PANDUAN_KODE.md](PANDUAN_KODE.md)
untuk mencari file halaman, API, rumus laporan, dan model database. Lihat juga
visual class serta alur sistem di [UML_MYMARKET.md](UML_MYMARKET.md).

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

- Login dan pemilihan halaman berdasarkan role: `http://localhost:3000`
- Halaman kasir: `http://localhost:3000/pos`
- Halaman admin operasional: `http://localhost:3000/admin`
- Login akun: `http://localhost:3000/login`
- CEO Copilot: `http://localhost:3000/ceo-chat`

Akun role hasil seed memakai password `password`:

- `kasir@gmail.com` — role Kasir, langsung diarahkan ke `/pos` tanpa TOTP.
- `admin@gmail.com` — akses admin penuh; login pertama menghubungkan Authenticator.
- `superadmin@gmail.com` — akses admin penuh yang sama, tanpa TOTP.
- `gudang@gmail.com` — role Staf Gudang dengan menu stok, pembelian, dan supplier;
  login pertama menghubungkan Authenticator lalu diarahkan ke `/admin`.

Admin dapat menambahkan perangkat Authenticator tanpa batas dari menu Pengaturan.
Pembuatan QR baru wajib disahkan dengan kode dari perangkat yang sudah aktif, dan
perangkat aktif terakhir tidak dapat dicabut.

PIN supervisor demo tetap `123456`. Ganti password dan PIN sebelum aplikasi dipakai
di luar lingkungan lokal.

## CEO Copilot

Chatbot CEO menjawab pertanyaan angka langsung dari database MYMARKET: omzet menurut
tanggal/periode, perbandingan, performa dan laba produk, rincian transaksi, serta stok
total, terbanyak, tersedikit, atau menipis.
Hitungannya memakai agregasi yang sama dengan laporan admin dan tetap berfungsi tanpa
API key. Untuk pertanyaan analisis kualitatif, isi `GEMINI_API_KEY` di `back/.env` lalu
restart backend. Gemini menerima ringkasan data yang dibatasi; API key hanya berada di
backend. Jawaban model diperiksa sebelum ditampilkan agar teks internal atau jawaban
terpotong tidak muncul. Riwayat chat disimpan per akun dan detailnya dimuat saat dipilih.
Akses diberikan melalui permission `admin.ceo_chat`, secara default hanya untuk Pemilik.

## Modul admin

Admin memakai pola twin-sidebar, stat cards, chart cards, recent-order table, dan
filter report dari template Admina. Data contoh template tidak dipakai; seluruh angka
berasal dari database `kasir-pbo`.

- **Ringkasan** — omzet, transaksi, laba kotor, stok, metode bayar, dan aktivitas terbaru.
- **Transaksi Live** — status terminal kasir, kesiapan pelayanan, progress transaksi,
  isi keranjang, metode bayar, dan heartbeat online/offline secara realtime.
- **Master Produk** — katalog berfoto, pencarian, filter, tambah, edit, ekspor, dan nonaktifkan produk.
- **Penjualan** — pencarian nomor transaksi, kasir, pelanggan, nama/barcode produk,
  serta rincian barang dan laba setiap transaksi POS.
- **Laporan** — rentang tanggal, ringkasan harian/bulanan, tren omzet dan laba,
  performa/laba per produk, rincian transaksi dan barang, metode pembayaran, cetak,
  serta ekspor CSV lengkap.
- **Persediaan** — saldo gudang dan kasir, transfer antarlokasi, batas minimum, dan koreksi stok.
- **Pembelian** — pencatatan pembelian langsung yang otomatis menambah stok gudang.
- **Supplier** — direktori pemasok dan form pemasok baru.
- **Role & akses** — pengaturan halaman yang boleh dibuka setiap role dan penempatan role petugas.
- **Pusat Operasional** — shift dan laci kas, promo, kategori/satuan/merek, label barcode,
  Excel produk, kartu stok, opname, kedaluwarsa, PO dan penerimaan, retur pembelian,
  member/loyalty, piutang/hutang, pengeluaran, setoran, rekonsiliasi, laba rugi,
  slow moving, pajak, profil toko, cabang, akun karyawan, audit log, dan backup JSON.
- **POS** — akses langsung kembali ke halaman kasir.

Di layar POS, tombol toko membuka shift dan pencatatan kas masuk/keluar. Tombol
**Hold/Recall** menyimpan keranjang ke database, sedangkan tombol riwayat mendukung
cetak ulang struk serta void dengan PIN supervisor. Penutupan shift membandingkan
uang fisik dengan modal, penjualan tunai, kas masuk, dan kas keluar.

Endpoint laporan utama tersedia pada `GET /api/v1/admin/reports/sales`, sedangkan
riwayat transaksi tersedia pada `GET /api/v1/admin/sales`. Laporan akan otomatis
bertambah setelah transaksi diselesaikan dari halaman POS.

## Alur stok admin

1. Tambahkan atau pilih supplier.
2. Catat pembelian berisi tanggal, produk, jumlah, dan harga beli. Tidak ada tahap
   pengajuan atau persetujuan supplier.
3. Sistem langsung menambah stok gudang, menghitung harga pokok rata-rata bergerak,
   serta menyimpan petugas dan histori mutasinya.
4. Transfer jumlah yang diperlukan dari **Gudang** ke **Kasir** agar dapat dijual.
5. Koreksi stok hanya dipakai untuk stok opname/rusak/selisih dan wajib memiliki alasan.

Checkout hanya menggunakan stok Kasir. Seluruh pembelian, koreksi, transfer, dan
penjualan dijalankan secara atomik serta tidak mengizinkan saldo negatif. Pencatatan
pembelian memakai idempotency key sehingga retry jaringan tidak menggandakan stok.

## Role bawaan

| Role | Akses awal |
| --- | --- |
| Pemilik | Seluruh POS dan admin, termasuk pengaturan role |
| Manajer | POS, ringkasan, transaksi live, master produk, penjualan, laporan, persediaan, pembelian, supplier |
| Staf Gudang | Ringkasan, persediaan, pembelian, supplier |
| Kasir | POS dan riwayat penjualan |

Permission role selain Pemilik dapat diubah dari menu **Role & akses**. Backend tetap
memeriksa permission pada setiap endpoint; menyembunyikan menu di frontend bukan satu-satunya
lapisan pembatasan. Akses normal wajib memakai bearer token hasil login. Header aktor
development dinonaktifkan secara default dan hanya tersedia bila flag frontend serta
backend sengaja diaktifkan untuk pengujian internal.

## Database

Migrasi awal membuat tabel berikut:

- `stores`, `cashiers`, dan `shifts` untuk operasional kasir;
- `products`, `members`, `vouchers`, dan `suppliers` untuk data master;
- `sales`, `sale_items`, dan `payments` untuk transaksi;
- `live_transactions` untuk snapshot workflow dan heartbeat terminal kasir;
- `purchase_orders` dan `purchase_order_items` untuk catatan pembelian langsung;
- `stock_movements` dan `stock_transfers` untuk audit gudang/kasir;
- `cash_movements`, `stock_counts`, dan `product_batches` untuk laci kas, opname,
  kartu stok, dan monitor kedaluwarsa;
- `catalog_options` dan `promotions` untuk master kategori/satuan/merek serta diskon POS;
- `finance_entries`, `sale_returns`, `business_settings`, dan `audit_logs` untuk
  keuangan, retur/void, konfigurasi toko, dan jejak aktivitas;
- `auth_sessions` dan `password_reset_tokens` untuk login dan pemulihan akun;
- `roles` dan `role_permissions` untuk kontrol akses halaman;
- `alembic_version` untuk versi skema.

Semua nominal uang disimpan sebagai integer rupiah. Checkout menghitung ulang harga
dari tabel `products`, tidak mempercayai harga dari browser, dan mendukung header
`X-Idempotency-Key` agar retry jaringan tidak membuat transaksi ganda.

Login memakai bearer token dengan masa aktif 12 jam. Header internal `X-Actor-Code`
tetap tersedia untuk development dan pengujian lokal.

Konfigurasi rahasia berada di `back/.env` dan tidak masuk Git. Template tersedia di
`back/.env.example`. Ganti password user database sebelum dipakai di jaringan atau
production.

Katalog aktif berisi 48 produk yang umum dijual di supermarket Indonesia lengkap
dengan barcode, SKU, kategori, merek, satuan, lokasi, harga demo, stok, dan foto produk.
Identitas serta foto produk berasal dari Open Food Facts dan fotonya disimpan lokal
di frontend agar tampilan kasir tidak bergantung pada hotlink eksternal.
Sinkronisasi katalog tanpa mengubah histori dapat dijalankan dengan
`python -m app.indonesia_catalog` dari folder `back`. Untuk mengganti katalog sekaligus
membangun ulang transaksi, pembelian, stok, dan data laporan demo, jalankan
`python -m app.demo_seed --reset`; snapshot JSON database dibuat otomatis sebelum reset.

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

## Deployment production

Sesudah repository di-clone pada Debian yang dependensinya sudah disiapkan,
seluruh instalasi production dapat dijalankan dengan satu script:

```bash
sudo bash deploy/setup-production.sh \
  --domain mymarket.pbo.web.id \
  --email admin@example.com
```

Petunjuk server image, update, HTTPS, dan reset data tersedia di `deploy/README.md`.
