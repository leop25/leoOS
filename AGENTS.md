# AGENTS.md

This file provides guidance to Codex (Codex.ai/code) when working with code in this repository.

## What this is

Static personal portfolio site that emulates a classic Macintosh desktop. No build step, no framework, no dependencies beyond the bundled Sysfont webfont. A small Vercel Function in `api/visits.js` powers the optional visit counter in production.

## Running locally

```bash
python3 -m http.server 4173
# then open http://localhost:4173
```

Or open `index.html` directly in a browser.

## Architecture

Core files, no frontend modules:

- **`index.html`** — all UI is here. Windows are `<section class="window" data-window="<id>">` elements. Buttons use `data-open`, `data-close`, and `data-zoom` attributes to hook up behavior without any JS selectors on IDs.
- **`styles.css`** — full visual system: CSS custom properties for colors and fonts, pixel-art icons via CSS `::before`/`::after`, window chrome, responsive mobile layout, and modifier classes (`is-zoomed`, `is-inverted`, `is-agent-mode`, `is-watch-mode`, `konami`).
- **`app.js`** — vanilla JS. All windows registered in a `Map<string, Element>`. Key systems:
  - Window manager: `openWindow`, `bringToFront`, `startDrag` (pointer events, clamped to viewport)
  - Terminal: `runCommand` dispatches a static `responses` object; `open <id>` opens any registered window
  - i18n: `i18n` object contains pt/en/es copy and should stay synchronized across languages
  - Visit counter: `initVisitCounter` calls `/api/visits` and falls back to offline state
  - Easter eggs: Konami sequence tracker (`konamiProgress`), 24-char `typedBuffer` for keyword detection, 3-click clock handler
  - Toast notifications via a single `#toast` element
- **`api/visits.js`** — Vercel Function using Upstash Redis REST or legacy Vercel KV env vars.

## Easter eggs (hidden features)

- **Konami code** → toggles `.konami` on `<body>` (retro contrast)
- **Clock ×3** → `.is-watch-mode` on `#desktop`
- **Special menu** → `.is-inverted` on `#desktop`
- **Terminal `claude`/`codex`/`agent`/`agentic`** → `.is-agent-mode`
- **Terminal `doleo`** → passphrase acknowledgement
- **Typed keywords** (outside terminal): `claude`, `codex`, `leop25`, `lookmate`, `fila`, `watch` — each toggles a visual effect and shows a toast notification

## Conventions

- Window IDs (`about`, `resume`, `projects`, `clippings`, `terminal`) must match between `data-window` in HTML and any JS calls to `openWindow`/`windows.get`.
- Pixel icons are pure CSS in `styles.css` — search for `.icon-` to find them.
- User-facing copy is maintained in Portuguese, English, and Spanish in `app.js`; keep the three locales aligned when changing content.
- Keep the app dependency-free unless the architecture is intentionally changed.
