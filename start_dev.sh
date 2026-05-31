#!/bin/bash
# ── NeoEvent Frontend — Local Dev Startup ─────────────────────────────────────
# Starts the Vite dev server for the neoEventUsers React app.

set -e

SCRIPT_DIR="$(cd "$(dirname "${BASH_SOURCE[0]}")" && pwd)"
cd "$SCRIPT_DIR"

echo ""
echo "╔══════════════════════════════════════════════╗"
echo "║       NeoEvent Frontend — Dev Startup        ║"
echo "╚══════════════════════════════════════════════╝"
echo ""

# Install dependencies if node_modules is missing
if [ ! -d "node_modules" ]; then
  echo "📦  node_modules not found — running npm install..."
  npm install
  echo ""
fi

echo "⚡  Starting Vite dev server"
echo ""

npm run dev
