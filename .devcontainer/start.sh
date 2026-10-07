#!/usr/bin/env bash
set -euo pipefail
cd "$(dirname "$0")/.."
if curl --fail --silent http://localhost:3000/api/health >/dev/null 2>&1; then
  echo "Album Studio est déjà démarré sur le port 3000."
  exit 0
fi
nohup npm run dev >/tmp/album-studio.log 2>&1 </dev/null &
for attempt in $(seq 1 60); do
  if curl --fail --silent http://localhost:3000/api/health >/dev/null 2>&1; then
    echo "Album Studio est prêt. Ouvrir le port 3000 dans l’onglet Ports du Codespace."
    exit 0
  fi
  sleep 1
done
tail -n 40 /tmp/album-studio.log
exit 1
