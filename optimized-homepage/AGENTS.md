# Repository Guidelines

## Project Structure & Modules
- Root: `index.html` (homepage), static site (no build step).
- Styles: `css/` (`style.css`, `homepage.css`, `critical.css`). CSS variables use `--pp-*`.
- Scripts: `js/` (`main.js`, `homepage.js`, `sw.js`). Service worker caches core assets.
- Assets: `assets/` (`manifest.json`, `downloads/`, `extra/`), media in `images/`, fonts in `fonts/`.
- Content: `blog/` pages; `hero-section/` contains section-specific assets.

## Build, Test, and Development
- Run locally: `python -m http.server 3000` (serve from repo root; required for the service worker).
- Optional servers: `npx serve .` or VS Code “Live Server”.
- Quick checks: Open `http://localhost:3000/` and verify console is clean.
- Lighthouse: Use Chrome DevTools → Lighthouse to measure Performance/SEO/A11y.

## Coding Style & Naming
- HTML: Semantic tags, accessible labels, lower-kebab-case classes (e.g., `hero-stats`).
- CSS: 4-space indentation; variables prefixed `--pp-`; class names in kebab-case. Keep component styles grouped; avoid inline styles.
- JS: ES6+ with 4-space indentation; prefer named functions; avoid blocking main thread; use `requestAnimationFrame`/passive listeners as in `main.js`.
- Files: kebab-case for new files (e.g., `new-section.css`, `cta-widget.js`).

## Testing Guidelines
- No formal test suite in this repo. Perform manual:
  - Cross-browser smoke test (Chrome, Safari, Firefox, Edge).
  - Accessibility pass (Chrome Lighthouse, keyboard navigation).
  - Performance pass (LCP, CLS, TTI via Lighthouse). Aim 85–95.

## Commit & Pull Requests
- Commits: Prefer Conventional Commits (e.g., `feat: add hero animation`, `fix: correct SW cache list`). Keep diffs focused.
- PRs must include: brief summary, linked issue (if any), before/after screenshots, Lighthouse scores (JSON or screenshot), and test notes.

## Security & Configuration Tips
- Service worker: Update cache names in `js/sw.js` when asset paths change; ensure URLs in `urlsToCache` match `css/` and `js/` paths.
- HTTPS: Required for production SW; keep relative paths for portability.
- Manifest: Keep `assets/manifest.json` icons/paths in sync with actual files.

