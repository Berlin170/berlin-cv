#!/usr/bin/env bash
# Deploy berlin-cv to Cloudflare Pages.
# Usage: ./deploy.sh
#
# Requires CLOUDFLARE_API_TOKEN env var. Account ID is auto-detected from token.
# Production URL: https://berlin-cv.pages.dev/

set -euo pipefail

if [ -z "${CLOUDFLARE_API_TOKEN:-}" ]; then
  echo "✗ CLOUDFLARE_API_TOKEN env var not set."
  echo "  Get it from https://dash.cloudflare.com/profile/api-tokens"
  echo "  Use the 'Edit Cloudflare Pages' template."
  exit 1
fi

echo "→ Building..."
npm run build

echo "→ Deploying to Cloudflare Pages..."
npx -y wrangler@latest pages deploy dist \
  --project-name=berlin-cv \
  --branch=main \
  --commit-message="${1:-Manual deploy via deploy.sh}"

echo ""
echo "✓ Deployed."
echo "  Production: https://berlin-cv.pages.dev/"
