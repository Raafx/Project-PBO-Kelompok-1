# Deployment MYMARKET di Debian

## Instalasi sekali jalan pada server native/container

Jika administrator sudah memasang Node.js, Python, MariaDB, Nginx, Supervisor,
Certbot, Git, dan curl, jalankan dari root repository:

```bash
sudo bash deploy/setup-production.sh \
  --domain mymarket.pbo.web.id \
  --email admin@example.com
```

Script tersebut bersifat idempotent dan menangani virtualenv backend, database,
migrasi, seed awal, build Next.js standalone, Supervisor, Nginx, HTTPS, health
check, serta backup awal. Untuk deployment berikutnya:

```bash
git pull --ff-only
sudo bash deploy/setup-production.sh \
  --domain mymarket.pbo.web.id \
  --email admin@example.com
```

Gunakan `--reset-demo` hanya jika data operasional memang boleh diganti dengan
data demo. Opsi ini tidak dipakai untuk update rutin.

## Alternatif Docker Compose

Stack production menjalankan MariaDB, FastAPI, Next.js standalone, dan Nginx.
Database hanya berada di network internal Docker; port publik yang dibuka hanya HTTP.

## Instalasi pertama

```bash
cd ~/mymarket/deploy
chmod +x server-bootstrap.sh deploy.sh backup.sh
./server-bootstrap.sh
cp .env.production.example .env.production
nano .env.production
./deploy.sh
```

Untuk uji melalui IP, isi `APP_DOMAIN=_` dan `APP_ORIGIN=http://IP_SERVER`.
Jika memakai domain, isi keduanya dengan domain final sebelum build.

## Operasional

```bash
cd ~/mymarket/deploy
sudo docker compose --env-file .env.production ps
sudo docker compose --env-file .env.production logs -f --tail=200
./backup.sh
sudo docker compose --env-file .env.production up -d --build
```

File SQL di `db-init/` hanya diimpor saat volume database masih kosong. Jangan jalankan
`docker compose down -v` pada server berisi data karena opsi `-v` menghapus volume database.
