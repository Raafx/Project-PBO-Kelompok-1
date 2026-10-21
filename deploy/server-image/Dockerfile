FROM node:22-trixie-slim AS node-runtime

FROM python:3.11-slim-trixie

ARG DEBIAN_FRONTEND=noninteractive

# Keep the application on Python 3.11 while taking the Node 22 runtime from an
# official image built on the same Debian 13 (Trixie) base. Installing `nodejs`
# from APT would not give us an explicit, reproducible major version.
COPY --from=node-runtime /usr/local/bin/node /usr/local/bin/node
COPY --from=node-runtime /usr/local/lib/node_modules/npm /usr/local/lib/node_modules/npm

RUN ln -s ../lib/node_modules/npm/bin/npm-cli.js /usr/local/bin/npm \
    && ln -s ../lib/node_modules/npm/bin/npx-cli.js /usr/local/bin/npx

# This image is the SSH-accessible server container. The Python base already
# includes pip and venv for Python 3.11; Certbot installs its own system-Python
# dependencies without changing the application interpreter in /usr/local.
RUN printf '#!/bin/sh\nexit 101\n' > /usr/sbin/policy-rc.d \
    && chmod +x /usr/sbin/policy-rc.d \
    && apt-get update \
    && apt-get install -y --no-install-recommends \
        bash \
        build-essential \
        ca-certificates \
        certbot \
        curl \
        git \
        libatomic1 \
        libfreetype6-dev \
        libjpeg62-turbo-dev \
        mariadb-client \
        mariadb-server \
        nano \
        nginx \
        openssh-server \
        python3-certbot-nginx \
        screen \
        sudo \
        supervisor \
        tmux \
        vim \
        zlib1g-dev \
    && rm -f /usr/sbin/policy-rc.d \
    && rm -rf /var/lib/apt/lists/* \
    && node --version \
    && npm --version \
    && python --version \
    && python -m venv /tmp/venv-check \
    && rm -rf /tmp/venv-check

# Keep uid/gid 1000 so mounted files have stable ownership.
RUN groupadd --gid 1000 mymarket \
    && useradd --uid 1000 --gid 1000 --create-home --shell /bin/bash mymarket \
    && usermod --append --groups sudo mymarket \
    && printf 'mymarket ALL=(ALL) NOPASSWD:ALL\n' > /etc/sudoers.d/mymarket \
    && chmod 0440 /etc/sudoers.d/mymarket \
    && mkdir -p \
        /home/mymarket/.ssh \
        /home/mymarket/app \
        /run/sshd \
        /run/mysqld \
        /var/log/supervisor \
    && chmod 0700 /home/mymarket/.ssh \
    && chown -R mymarket:mymarket /home/mymarket \
    && chown mysql:mysql /run/mysqld

COPY sshd_config /etc/ssh/sshd_config
COPY supervisord.conf /etc/supervisor/supervisord.conf
COPY entrypoint.sh /usr/local/sbin/mymarket-entrypoint
RUN chmod 0755 /usr/local/sbin/mymarket-entrypoint

WORKDIR /home/mymarket

EXPOSE 22 80 443

ENTRYPOINT ["/usr/local/sbin/mymarket-entrypoint"]
CMD ["/usr/bin/supervisord", "-c", "/etc/supervisor/supervisord.conf"]
