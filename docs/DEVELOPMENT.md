# Developer Guide

## Prerequisites

- Node.js ≥ 20
- npm

```bash
npm install
```

## Project Structure

```
editors/
  vscode/
    themes/                      VS Code theme JSON files (10 variants) — source of truth
      forro-roots-color-theme.json
      forro-roots-light-color-theme.json
      …
  zed/                            Zed theme family (generated from editors/vscode/themes)
    extension.toml
    themes/
      forro.json
terminal/
  xfce4/                          xfce4-terminal color schemes (generated, 10 variants)
    forro-roots.theme
    forro-roots-light.theme
    …
tests/
  contrast.test.js              WCAG 2.1 AA contrast validation (884 tests)
  helpers.test.js               Unit tests for color helpers
  zed-theme.test.mjs            Sync + schema validation for the Zed theme family
  xfce-theme.test.mjs           Sync + structure validation for xfce4 color schemes
scripts/
  fix-contrast.js               Auto-fix colors failing contrast in OKLCH space
  generate-light-themes.js      Derive light themes from dark variants
  generate-zed-themes.mjs       Derive the Zed theme family from VS Code themes
  generate-xfce-themes.mjs      Derive xfce4-terminal color schemes from VS Code themes
  schemas/
    zed-theme-v0.2.0.json        Vendored Zed theme JSON schema (for offline validation)
  build-site.mjs                Orchestrator — builds the showcase site
  site/
    data.mjs                    Variant metadata, language list, descriptions
    samples/                    Code samples in native files (Python, JS, C++)
      python.py
      javascript.js
      cpp.cpp
    styles.mjs                  CSS for the showcase page
    script.mjs                  Client-side JS (dark/light toggle, tab switching)
    template.mjs                HTML template that assembles the final page
.github/workflows/
  deploy-site.yml               GitHub Actions — builds & deploys to GitHub Pages
```

## Scripts

| Command                  | Description                                                        |
| ------------------------ | ------------------------------------------------------------------ |
| `npm test`               | Run all contrast, helper, Zed, and xfce tests (908 tests)          |
| `npm run fix:contrast`   | Auto-fix failing colors by adjusting OKLCH lightness               |
| `npm run generate:light` | Regenerate all 5 light themes from dark variants                   |
| `npm run generate:zed`   | Regenerate the Zed theme family (`editors/zed/themes/forro.json`)  |
| `npm run generate:xfce`  | Regenerate xfce4-terminal color schemes (`terminal/xfce4/*.theme`) |
| `npm run build:site`     | Build the showcase site to `site/index.html`                       |
| `npm run package`        | Package the extension as `.vsix`                                   |
| `npm run publish`        | Publish to VS Code Marketplace                                     |
| `npm run release`        | Bump version with standard-version                                 |
| `npm run format`         | Format all files with Prettier                                     |

## Workflows

### Adding or Editing a Theme

1. Edit the relevant `editors/vscode/themes/*-color-theme.json` file
2. Run `npm test` — all contrast tests must pass
3. If tests fail, run `npm run fix:contrast` to auto-adjust colors
4. If you edited a dark theme, run `npm run generate:light` to sync light variants
5. Run `npm run generate:zed` and `npm run generate:xfce` to sync the Zed theme family and xfce4-terminal color schemes
6. Re-run `npm test` to confirm

The VS Code theme JSON files in `editors/vscode/themes/` are the source of truth — the Zed theme family (`editors/zed/themes/forro.json`) and xfce4-terminal color schemes (`terminal/xfce4/*.theme`) are generated from them and must never be edited by hand.

### Editing the Showcase Site

The site is built by `scripts/build-site.mjs`, which uses [Shiki](https://shiki.style/) to render code with the actual theme colors.

- **Samples** — Edit the native files in `scripts/site/samples/`. They get proper syntax highlighting in your editor.
- **Styles** — Edit `scripts/site/styles.mjs`
- **Behavior** — Edit `scripts/site/script.mjs` (dark/light toggle, tab switching)
- **Layout** — Edit `scripts/site/template.mjs` (HTML structure)
- **Data** — Edit `scripts/site/data.mjs` (variant metadata, descriptions)

To preview locally:

```bash
npm run build:site
npx serve site
```

### Deployment

The showcase site is deployed automatically via GitHub Actions on every push to `main`. The workflow:

1. Installs Node dependencies
2. Runs `npm run build:site` (Shiki renders code blocks with actual theme JSON)
3. Deploys the `site/` output to GitHub Pages

No generated files are committed to the repository.

## Color Science

Contrast fixes use the [OKLCH](https://oklch.com/) perceptual color space via the [culori](https://culorijs.org/) library. When a token fails WCAG contrast, only the **lightness** channel is adjusted — preserving the original hue and chroma.

## Pre-commit Hooks

[Husky](https://typicode.github.io/husky/) runs on every commit:

- **lint-staged** — Prettier formatting on staged files
- **commitlint** — Enforces [Conventional Commits](https://www.conventionalcommits.org/)
