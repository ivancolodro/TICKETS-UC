#!/usr/bin/env bash
# Usa Node 20 de Homebrew (keg-only) sin depender de nvm.
set -e

for dir in /opt/homebrew/opt/node@20/bin /usr/local/opt/node@20/bin; do
  if [ -x "$dir/node" ]; then
    export PATH="$dir:$PATH"
    break
  fi
done

NODE_MAJOR="$(node -p "process.versions.node.split('.')[0]")"
if [ "$NODE_MAJOR" -lt 20 ]; then
  echo "Se requiere Node.js 20+ (actual: $(node -v)). Instala con: brew install node@20"
  exit 1
fi

echo "Node $(node -v)"
cd "$(dirname "$0")/.."
exec npx next dev "$@"
