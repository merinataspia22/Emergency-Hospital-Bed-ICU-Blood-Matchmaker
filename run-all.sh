#!/usr/bin/env bash
# GitHub Codespaces / Linux / Mac e shob server ek command e chalu kore.
# Chalan: bash run-all.sh
cd "$(dirname "$0")"

if [ ! -f backend/.env ]; then
  echo ""
  echo "ERROR: backend/.env file nei."
  echo "cp backend/.env.example backend/.env  chalan, tarpor real MONGO_URI ar JWT_SECRET boshan."
  echo "Ei duto team lead er kache private e chan. Sobar value ek hote hobe."
  exit 1
fi

for d in backend backend/member2-donor frontend; do
  if [ ! -d "$d/node_modules" ]; then
    echo "Installing $d packages..."
    (cd "$d" && npm install)
  fi
done

(cd backend && npm run dev) &
(cd backend/member2-donor && npm run dev) &
(cd frontend && npm run dev -- --host) &

echo ""
echo "3 ta server chalu hocche (5000, 5001, 5173). Bondho korte Ctrl+C."
wait