#!/usr/bin/env bash
# Fetches the Diffusion Studio editor (the engine the promo is rendered with)
# at the commit this project was built against, and installs its workspace.
set -euo pipefail
HERE="$(cd "$(dirname "$0")" && pwd)"
REPO="https://github.com/diffusionstudio/editor.git"
COMMIT="fefcde9df7198466bd7cc9f3a9d7eae1575b5b12"

if [ ! -d "$HERE/.editor/.git" ]; then
  git clone "$REPO" "$HERE/.editor"
fi
git -C "$HERE/.editor" fetch --depth 1 origin "$COMMIT" 2>/dev/null || true
git -C "$HERE/.editor" checkout -q "$COMMIT"

# Electron and Playwright browsers are not needed for headless rendering.
(cd "$HERE/.editor" && ELECTRON_SKIP_BINARY_DOWNLOAD=1 PLAYWRIGHT_SKIP_BROWSER_DOWNLOAD=1 npm install --no-audit --no-fund)
echo "Diffusion Studio ready in $HERE/.editor"
