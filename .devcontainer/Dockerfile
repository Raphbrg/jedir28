FROM mcr.microsoft.com/devcontainers/javascript-node:1-22-bookworm
RUN apt-get update \
    && apt-get install -y --no-install-recommends chromium ffmpeg \
    && rm -rf /var/lib/apt/lists/*
ENV CHROME_PATH=/usr/bin/chromium
