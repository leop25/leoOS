# Contributing

LeoOS is a personal portfolio, so external contributions are expected to be
small and focused: bug fixes, accessibility improvements, documentation, or
maintenance work.

## Local Workflow

```bash
python3 -m http.server 4173
```

Open `http://localhost:4173` and test changes in desktop and mobile widths.

## Before Opening a PR

Run the lightweight syntax checks:

```bash
node --check app.js
node --check api/visits.js
```

Then manually verify:

- Window open, close, zoom, drag, and resize behavior.
- Terminal commands and `open <window>` routing.
- Language switching for Portuguese, English, and Spanish.
- Mobile layout and scroll behavior.
- Visit counter fallback when `/api/visits` is unavailable.

## Code Style

- Keep the project dependency-free unless there is a strong reason to change
  the architecture.
- Prefer declarative HTML hooks (`data-open`, `data-close`, `data-zoom`,
  `data-action`, `data-language`) over hardcoded element IDs in JavaScript.
- Keep copy changes synchronized across `pt`, `en`, and `es` in `app.js`.
- Preserve the classic Macintosh visual language: crisp borders, simple
  geometry, restrained colors, and pixel-style details.
- Do not commit generated local screenshots unless they are meant to replace
  the canonical preview files in the README.
