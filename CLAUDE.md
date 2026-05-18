# CLAUDE.md

This file provides guidance to Claude Code (claude.ai/code) when working with code in this repository.

## What this is

Static personal portfolio site that emulates a classic Macintosh desktop. No build step, no framework, no dependencies beyond the bundled Sysfont webfont.

## Running locally

```bash
python3 -m http.server 4173
# then open http://localhost:4173
```

Or open `index.html` directly in a browser.

## Architecture

Three files, no modules:

- **`index.html`** — all UI is here. Windows are `<section class="window" data-window="<id>">` elements. Buttons use `data-open`, `data-close`, and `data-zoom` attributes to hook up behavior without any JS selectors on IDs.
- **`styles.css`** — full visual system: CSS custom properties for colors and fonts, pixel-art icons via CSS `::before`/`::after`, window chrome, responsive mobile layout, and modifier classes (`is-zoomed`, `is-inverted`, `is-agent-mode`, `is-watch-mode`, `konami`).
- **`app.js`** — vanilla JS. All windows registered in a `Map<string, Element>`. Key systems:
  - Window manager: `openWindow`, `bringToFront`, `startDrag` (pointer events, clamped to viewport)
  - Terminal: `runCommand` dispatches a static `responses` object; `open <id>` opens any registered window
  - Easter eggs: Konami sequence tracker (`konamiProgress`), 24-char `typedBuffer` for keyword detection, 3-click clock handler
  - Toast notifications via a single `#toast` element

## Easter eggs (hidden features)

- **Konami code** → toggles `.konami` on `<body>` (retro contrast)
- **Clock ×3** → `.is-watch-mode` on `#desktop`
- **Special menu** → `.is-inverted` on `#desktop`
- **Terminal `claude`/`agent`/`agentic`** → `.is-agent-mode`
- **Terminal `doleo`** → passphrase acknowledgement
- **Typed keywords** (outside terminal): `claude`, `leop25`, `lookmate`, `fila`, `watch` — each toggles a visual effect and shows a toast notification

## Conventions

- Window IDs (`about`, `resume`, `projects`, `clippings`, `terminal`) must match between `data-window` in HTML and any JS calls to `openWindow`/`windows.get`.
- Pixel icons are pure CSS in `styles.css` — search for `.icon-` to find them.
- All copy is in Portuguese (pt-BR); UI labels and terminal responses follow that pattern.
