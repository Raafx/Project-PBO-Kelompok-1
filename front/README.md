# MYMARKET POS Frontend

Frontend kasir berbasis Next.js App Router dan TypeScript. Katalog, member, voucher,
dan checkout terhubung ke FastAPI di folder `../back`. Tanpa `NEXT_PUBLIC_API_URL`,
UI tetap memakai data lokal agar mode demo dan pengujian dapat berjalan mandiri.

## Menjalankan

```powershell
cd front
npm install
npm run dev
```

Buka `http://localhost:3000`.

Halaman admin pengadaan dan persediaan tersedia di `http://localhost:3000/admin`.
Kasir dapat membukanya melalui tombol **Admin** di header.

Salin `.env.example` menjadi `.env.local` bila konfigurasi lokal belum tersedia.
Nilai default backend adalah `http://127.0.0.1:8000/api/v1`.

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
