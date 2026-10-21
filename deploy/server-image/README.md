# MYMARKET server image

This image is intended for the administrator who provisions the SSH-accessible
Debian 13 container. It includes Node.js 22, Python 3.11, MariaDB, Nginx,
Supervisor, Certbot, Git, and the basic administration tools needed by the
application.

## Build

Run from this directory:

```bash
docker build -t mymarket-server:debian13 .
```

## Required runtime configuration

The server administrator must:

- publish container ports `22`, `80`, and `443`;
- set `SSH_PUBLIC_KEY` to the public key accepted for user `mymarket`, or mount
  `/home/mymarket/.ssh/authorized_keys`;
- mount persistent storage for `/home/mymarket`, `/var/lib/mysql`, and
  `/etc/letsencrypt`;
- point `mymarket.pbo.web.id` to the public address that publishes ports 80/443;
- allow outbound HTTPS for GitHub, npm, pip, Gemini, and Let's Encrypt.

Example runtime command (the administrator should adapt volume and port names
to the hosting platform):

```bash
docker run -d \
  --name mymarket-server \
  --restart unless-stopped \
  -p 22:22 \
  -p 80:80 \
  -p 443:443 \
  -e SSH_PUBLIC_KEY="ssh-ed25519 AAAA..." \
  -v mymarket-home:/home/mymarket \
  -v mymarket-db:/var/lib/mysql \
  -v mymarket-certs:/etc/letsencrypt \
  mymarket-server:debian13
```

Do not put a private SSH key, password, database password, or API key in the
Dockerfile. The `mymarket` account has passwordless sudo, so SSH must remain
public-key-only as configured here.

After startup, verify:

```bash
node --version
python3 --version
sudo supervisorctl status
sudo mariadb-admin ping
nginx -v
```

After cloning the application repository as `mymarket`, install the whole stack
with:

```bash
cd ~/mymarket-app
sudo bash deploy/setup-production.sh \
  --domain mymarket.pbo.web.id \
  --email admin@example.com
```
