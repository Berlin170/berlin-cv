# Berlin — CV Y2K

Win98-style desktop CV for Rafiq Ahmed (Berlin), Web3 community moderator.

**Live: https://berlin-cv.pages.dev/**

## Stack

- Astro 5 (static SSG, no SSR)
- 98.css via CDN
- Vanilla JS (no framework runtime)
- Google Fonts: VT323, Press Start 2P
- Hosted on Cloudflare Pages (free tier)

## Dev

```bash
npm install
npm run dev
# http://localhost:4321
```

## Build

```bash
npm run build
# outputs static site to dist/
```

`dist/` is pure static — runs anywhere (Cloudflare Pages, Nginx, Caddy, S3, GH Pages).

## Deploy

Two ways:

### A) Direct upload (manual)

```bash
export CLOUDFLARE_API_TOKEN="cfut_..."   # from dash.cloudflare.com/profile/api-tokens
./deploy.sh
```

### B) Git-connected auto-deploy (recommended)

Connect the GitHub repo to the Cloudflare Pages project — every push to `main` auto-builds and deploys. In Cloudflare dashboard:

1. Pages → `berlin-cv` → Settings → Builds & deployments → Connect to Git
2. Select the GitHub repo
3. Build command: `npm run build`
4. Build output: `dist`

## Custom domain

To wire `berlinportfolio.com` (or any domain):

1. On Cloudflare → Add Site → enter the domain → Free plan
2. Cloudflare gives you 2 nameservers — set those at GoDaddy (or wherever the domain is registered)
3. Wait up to 1 hour for DNS propagation
4. Cloudflare Pages → `berlin-cv` → Custom domains → Add → enter the domain
5. SSL is auto-issued, no other steps

## Structure

```
src/
├── pages/index.astro          # desktop entry
├── layouts/Layout.astro       # HTML shell
├── components/
│   ├── Desktop.astro
│   ├── Taskbar.astro
│   ├── MobileView.astro       # ≤768px fallback
│   └── windows/*.astro
├── data/content.js            # all CV content (edit here)
├── scripts/
│   ├── window-manager.js
│   ├── taskbar.js
│   ├── minesweeper.js
│   └── sound.js
└── styles/
    ├── main.css
    └── windows.css
public/
├── assets/
│   ├── icons/                 # 8 SVG desktop icons
│   ├── logos/                 # project banner logos
│   ├── screenshots/           # community proof images
│   ├── sounds/                # Win98 startup + logoff WAVs
│   └── avatar.png
└── Rafiq-Ahmed-CV.pdf
```

## Editing content

All text + project list is in `src/data/content.js`. Change anything, run `./deploy.sh`, done.

## Sound

Win98 startup chord plays on first interaction. Toggle on/off via 🔊 in the taskbar tray (state persists in localStorage).
