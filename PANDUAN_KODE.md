# Peta Kode MYMARKET

Visual hubungan class, use case, sequence, state, dan activity diagram tersedia
di [UML_MYMARKET.md](UML_MYMARKET.md).

Panduan ini menunjukkan file mana yang perlu dibuka saat kamu ingin belajar atau
mengubah sebuah halaman. Frontend memakai **Next.js + TypeScript/TSX** yang berjalan
di Node.js. Backend memakai **Python + FastAPI**. Data disimpan oleh SQLAlchemy
di MySQL/MariaDB.

## Aturan nama file Next.js

Next.js mewajibkan file rute bernama `page.tsx`. Karena itu, `page.tsx` di proyek
ini hanya menunjuk ke file dengan nama halaman yang mudah dibaca. Contoh:

```text
front/app/admin/page.tsx        -> rute /admin
front/app/admin/HalamanAdmin.tsx -> isi halaman admin
```

`layout.tsx` mengatur tampilan atau pemeriksaan login untuk rute di foldernya.
Jangan mengganti nama `page.tsx` dan `layout.tsx` karena Next.js memakainya untuk
menemukan halaman.

## Cari kode berdasarkan halaman

| Yang kamu lihat | File frontend untuk dibaca | File Python yang menerima data |
| --- | --- | --- |
| Login `/login` | `front/app/login/HalamanLogin.tsx` | `back/app/api/operasional_toko.py` (`/auth/...`) |
| Kasir `/pos` | `front/app/HalamanKasir.tsx` | `back/app/api/kasir.py` (produk dan transaksi), `back/app/api/operasional_toko.py` (shift) |
| Menu admin `/admin` | `front/app/admin/HalamanAdmin.tsx` | `back/app/api/admin.py` |
| Ringkasan admin | `front/app/admin/RingkasanAdmin.tsx` | `back/app/api/admin.py` (`/admin/dashboard`), `back/app/api/laporan_penjualan.py` |
| Transaksi Live | `front/app/admin/TransaksiLangsung.tsx` | `back/app/api/transaksi_langsung.py` |
| Master Produk | `front/app/admin/MasterProduk.tsx` | `back/app/api/admin.py` (`/admin/products/...`) |
| Riwayat Penjualan dan Laporan Bisnis | `front/app/admin/PenjualanDanLaporan.tsx` | `back/app/api/laporan_penjualan.py` (`/admin/sales`, `/admin/reports/sales`) |
| Persediaan, Pembelian, Supplier | `front/app/admin/StokDanPembelian.tsx` | `back/app/api/admin.py` dan `back/app/api/operasional_toko.py` |
| Hak Akses | `front/app/admin/PengaturanAkses.tsx` | `back/app/api/admin.py` (`/admin/roles`, `/admin/staff`) |
| Modul shift, stok, pembelian, dan keuangan di admin | `front/app/admin/FiturOperasionalAdmin.tsx` | `back/app/api/operasional_toko.py` |
| Perangkat Authenticator di Pengaturan | `front/app/admin/PerangkatAuthenticator.tsx` | `back/app/api/operasional_toko.py` (`/auth/authenticator/devices`) |
| **Analisis Produk** | `front/app/admin/AnalisisProduk.tsx` | `back/app/api/analisis_produk.py` |
| CEO Copilot `/ceo-chat` | `front/app/ceo-chat/HalamanChatCEO.tsx` | `back/app/api/ceo_chat.py` |

Komponen sidebar dan header admin berada di `front/app/admin/KerangkaAdmin.tsx`.
Pemeriksaan login dan izin halaman ada di `front/app/admin/PemeriksaAksesAdmin.tsx`.
Aturan bersama untuk mengecek role admin, kasir, dan chat CEO ada di
`front/app/PemeriksaPeran.tsx`.

`HalamanAdmin.tsx` menyimpan state, mengambil data, dan memilih menu yang tampil.
File seperti `MasterProduk.tsx`, `StokDanPembelian.tsx`, dan
`PenjualanDanLaporan.tsx` berisi tampilan menunya.
Di React, nilai yang dikirim dari halaman induk ke komponen disebut **props**.
Contoh: `products` adalah daftar untuk digambar, sedangkan `onEdit` adalah fungsi
yang dipanggil ketika tombol Edit diklik. Nama properti API seperti `cost_price`
tetap berbahasa Inggris karena harus sesuai dengan data yang dikirim Python.

## Belajar alur Analisis Produk

Baca file berikut dari atas ke bawah:

1. `front/app/admin/page.tsx`: rute `/admin` menunjuk ke `HalamanAdmin.tsx`.
2. `front/app/admin/HalamanAdmin.tsx`: sidebar memilih menu `product-analysis`.
3. `front/app/admin/AnalisisProduk.tsx`: mengambil daftar produk, menerima bulan
   awal dan akhir, menampilkan ringkasan seluruh periode, grafik harian, serta
   riwayat transaksi. Grafik tidak ditampilkan sebelum ada produk.
4. `front/app/admin/PerbandinganBulananProduk.tsx`: menampilkan grafik dan tabel
   perbandingan omzet, HPP, laba, margin, serta perubahan dari bulan sebelumnya.
5. `front/app/admin/apiAnalisisProduk.ts`: URL API dan bentuk data yang dipakai
   oleh halaman Analisis Produk.
6. `back/app/main.py`: mendaftarkan router Python.
7. `back/app/api/analisis_produk.py`: mengembalikan pilihan produk lalu menghitung
   data harian dan bulanan satu produk. Produk atau bulan tanpa penjualan tetap
   menghasilkan angka nol agar perbandingannya tidak terputus.
8. `back/app/services/periode_laporan.py`: mengubah bulan/tanggal menjadi batas
   waktu query database.
9. `back/app/services/reporting.py`: menghitung jumlah, omzet, HPP, dan margin
   produk dari transaksi selesai.
10. `back/app/models.py`: bentuk tabel `Product`, `Sale`, dan `SaleItem` di database.
   `SaleItem.unit_cost` menyimpan HPP saat barang dijual, sehingga laporan lama
   tidak berubah ketika harga pokok master produk diperbarui.

Data yang dikirim Python ke frontend dijelaskan oleh `back/app/schemas.py`.
Jenis data TypeScript untuk menu ini ada di `front/app/admin/apiAnalisisProduk.ts`.

## File umum yang sering dicari

| File | Isinya |
| --- | --- |
| `front/app/api.ts` | Klien HTTP bersama: alamat backend, token login, dan fungsi API lintas halaman. API khusus Analisis Produk sudah dipisah. |
| `front/app/admin/gambarProdukContoh.ts` | Daftar foto contoh berdasarkan barcode untuk pratinjau produk. |
| `front/app/PilihanCari.tsx` | Select yang bisa diketik untuk mencari pilihan. |
| `front/app/access.ts` | Membaca sesi dan menentukan tujuan setelah login. |
| `front/app/PemeriksaPeran.tsx` | Memastikan token dan permission cocok sebelum halaman dibuka. |
| `back/app/main.py` | Titik awal FastAPI dan pendaftaran semua router. |
| `back/app/api/kasir.py` | URL untuk pencarian produk, voucher, checkout, dan hold kasir. |
| `back/app/api/laporan_penjualan.py` | Filter riwayat transaksi dan angka laporan bisnis. |
| `back/app/api/operasional_toko.py` | URL untuk login, shift, serta modul operasional toko. |
| `back/app/database.py` | Koneksi dan sesi database. |
| `back/app/models.py` | Tabel SQLAlchemy. |
| `back/app/schemas.py` | Format request/response API. |
| `back/app/services/sales.py` | Aturan transaksi penjualan. |
| `back/app/services/reporting.py` | Rumus agregasi laporan penjualan. |
| `back/app/services/access.py` | Permission role dan akses. |

## Jika ingin mengubah sesuatu

- **Teks atau tata letak:** mulai dari file `Halaman...tsx` atau `AnalisisProduk.tsx`.
- **Daftar produk di admin:** buka `MasterProduk.tsx`. Fungsi tambah/edit dan
  pengambilan datanya masih berada di `HalamanAdmin.tsx`.
- **Tabel transaksi atau laporan:** buka `PenjualanDanLaporan.tsx`. Filter
  dikirim dari `HalamanAdmin.tsx` ke API Python.
- **Ringkasan, transaksi live, stok, pembelian, atau hak akses:** buka file
  dengan nama menu yang sama pada tabel di atas. `HalamanAdmin.tsx` mengatur
  kapan menu tersebut ditampilkan dan mengirim datanya.
- **Alamat request atau parameter filter:** buka `front/app/api.ts` atau
  `front/app/admin/apiAnalisisProduk.ts`.
- **Angka laporan salah:** buka endpoint Python, lalu fungsi perhitungan di
  `back/app/services/reporting.py`. Cocokkan dengan tabel di `back/app/models.py`.
- **Hak akses:** lihat sidebar di `HalamanAdmin.tsx` dan pemeriksaan permission
  di router Python. Keduanya harus sesuai.
- **Database berubah:** lihat `back/app/models.py` dan migrasi di `back/alembic/`.

Untuk mencari nama fungsi dari terminal, jalankan `rg -n "nama_fungsi" front/app back/app`
dari folder proyek. Misalnya `rg -n "analisis_produk" front/app back/app`.

## Pemeriksaan setelah mengubah kode

```powershell
cd back
.venv\Scripts\python.exe -m ruff check app
.venv\Scripts\python.exe -m pytest

cd ..\front
npm run lint
npm run typecheck
npm run build
```
