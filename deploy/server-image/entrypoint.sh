#!/usr/bin/env bash
set -Eeuo pipefail

install -d -m 0755 /run/sshd /run/mysqld /var/log/supervisor
chown mysql:mysql /run/mysqld

# Host keys must be generated when the container starts, not baked into the
# image and reused by every deployment.
ssh-keygen -A

# Supply the administrator's public key using SSH_PUBLIC_KEY or mount an
# authorized_keys file at /home/mymarket/.ssh/authorized_keys.
if [[ -n "${SSH_PUBLIC_KEY:-}" ]]; then
    install -d -m 0700 -o mymarket -g mymarket /home/mymarket/.ssh
    printf '%s\n' "${SSH_PUBLIC_KEY}" > /home/mymarket/.ssh/authorized_keys
fi

if [[ -f /home/mymarket/.ssh/authorized_keys ]]; then
    chown mymarket:mymarket /home/mymarket/.ssh/authorized_keys
    chmod 0600 /home/mymarket/.ssh/authorized_keys
else
    echo "WARNING: no SSH public key configured for user mymarket" >&2
fi

# A newly attached persistent volume starts empty and therefore needs the
# MariaDB system tables before supervisord can start mariadbd.
if [[ ! -d /var/lib/mysql/mysql ]]; then
    mariadb-install-db --user=mysql --datadir=/var/lib/mysql
fi
chown -R mysql:mysql /var/lib/mysql

exec "$@"
