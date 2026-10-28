# Build from the repository root (the image also serves the static site):
#   docker build -f media-downloader/Dockerfile -t media-downloader .
FROM node:22-bookworm-slim

RUN apt-get update \
 && apt-get install -y --no-install-recommends ffmpeg python3 python3-venv ca-certificates \
 && rm -rf /var/lib/apt/lists/* \
 && python3 -m venv /opt/yt-dlp \
 && /opt/yt-dlp/bin/pip install --no-cache-dir "yt-dlp[default]" \
 && ln -s /opt/yt-dlp/bin/yt-dlp /usr/local/bin/yt-dlp

WORKDIR /app/server
COPY media-downloader/package.json media-downloader/package-lock.json ./
RUN npm ci --omit=dev && npm cache clean --force
COPY media-downloader/src ./src

COPY products.html index.html media-downloader.html /app/site/
COPY css /app/site/css
COPY js /app/site/js

ENV NODE_ENV=production SITE_ROOT=/app/site PORT=8080
USER node
EXPOSE 8080
HEALTHCHECK --interval=30s --timeout=5s CMD node -e "fetch('http://127.0.0.1:8080/api/health').then(r=>process.exit(r.ok?0:1)).catch(()=>process.exit(1))"
CMD ["node", "src/server.js"]
