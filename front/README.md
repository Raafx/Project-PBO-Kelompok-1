# MYMARKET POS Frontend

Frontend kasir berbasis Next.js App Router dan TypeScript. Katalog, member, voucher,
dan checkout terhubung ke FastAPI di folder `../back`. Tanpa `NEXT_PUBLIC_API_URL`,
UI tetap memakai data lokal agar mode demo dan pengujian dapat berjalan mandiri.

Peta file dan urutan belajar tersedia di [PANDUAN_KODE.md](../PANDUAN_KODE.md).

## Menjalankan

```powershell
cd front
npm install
npm run dev
```

Buka `http://localhost:3000`. Halaman root mengarah ke login, kemudian akun
diarahkan otomatis ke `/pos` atau `/admin` sesuai permission role-nya.

Login tersedia di `http://localhost:3000/login`. Gunakan password `password` untuk
akun role berikut:

- `kasir@gmail.com` diarahkan langsung ke `/pos` tanpa TOTP.
- `admin@gmail.com` memiliki akses penuh ke `/admin` dan memakai Authenticator.
- `gudang@gmail.com` diarahkan ke `/admin` dengan menu gudang saja dan memakai
  Authenticator.

PIN supervisor demo adalah `123456`.

Halaman kasir tersedia di `http://localhost:3000/pos`, sedangkan halaman admin
tersedia di `http://localhost:3000/admin`. Masing-masing dilindungi oleh permission
role dan sesi yang divalidasi ke backend.

Menu **Master Produk** memakai card, table, modal, badge, dan button dari template
Adminto, sedangkan katalog berisi produk supermarket Indonesia dengan foto lokal
bersumber dari Open Food Facts. Produk
dapat dicari, difilter, ditambah, diedit, diekspor, atau dinonaktifkan tanpa menghapus
histori transaksi.

Menu **Transaksi Live** memakai komponen Adminto yang sama untuk memantau terminal
kasir secara realtime. POS mengirim heartbeat setiap lima detik dan setiap ada
perubahan keranjang, member, metode pembayaran, atau tahap checkout. Dashboard
menampilkan kasir online/offline, siap melayani, progress transaksi, nilai keranjang,
produk yang sedang diproses, dan aktivitas selesai terbaru.

Menu **Pusat Operasional** melengkapi workflow shift, kas masuk/keluar, promo,
master kategori/satuan/merek, label barcode, import/export Excel, kartu stok,
stock opname, kedaluwarsa, PO-penerimaan-retur, member, loyalty, piutang/hutang,
keuangan, laporan laba rugi, pengaturan toko, cabang, audit log, dan backup.

Salin `.env.example` menjadi `.env.local` bila konfigurasi lokal belum tersedia.
Nilai default backend adalah `http://127.0.0.1:8000/api/v1`. Set
`NEXT_PUBLIC_ALLOW_DEV_ACTOR` harus tetap `false` untuk alur normal agar halaman admin
wajib memakai sesi login. `NEXT_PUBLIC_ADMIN_ACTOR_CODE` hanya dipakai bila bypass
development tersebut sengaja diaktifkan untuk pengujian internal bersama
`ALLOW_DEV_ACTOR_HEADER=true` di backend.

Pembelian admin langsung menambah saldo gudang. Stok baru dapat dijual setelah dipindahkan
ke saldo kasir melalui aksi **Transfer**. Menu admin otomatis mengikuti permission role,
sementara API melakukan pemeriksaan izin yang sama pada setiap request.

## Docker

```powershell
docker build --build-arg NEXT_PUBLIC_API_URL=http://127.0.0.1:8000/api/v1 -t mymarket-pos-front .
docker run --rm -p 3000:3000 mymarket-pos-front
```

## Pemeriksaan

```powershell
npm run lint
npm run typecheck
npm run build
```

## Mode kasir

| Pintasan | Aksi |
| --- | --- |
| `F1` | Bantuan pintasan |
| `F2` | Buka katalog |
| `F4` | Fokus pencarian member |
| `F6` | Diskon |
| `F7` | Hold transaksi |
| `F8` | Recall transaksi terakhir |
| `F9` | Kunci kasir |
| `F12` | Validasi atau selesaikan pembayaran |
| `Ctrl+Shift+1…6` | Pilih Tunai, QRIS, Debit, Kredit, E-Wallet, atau Voucher dari area mana pun |
| `1…6` | Pilih metode ketika radiogroup pembayaran sedang fokus |
| `↑` / `↓` pada tunai | Pilih saran nominal |

Kombinasi `Alt+D`, `Alt+E`, `Alt+F`, dan `Alt+1…8` sengaja tidak digunakan karena
bertabrakan dengan shortcut Chrome pada Windows/Linux. Untuk perangkat kasir produksi,
jalankan browser dalam mode kiosk/PWA agar tombol fungsi—khususnya `F12`—tidak diambil
alih oleh DevTools atau fungsi browser lainnya.
