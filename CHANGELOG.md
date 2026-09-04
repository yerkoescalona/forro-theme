# Changelog

All notable changes to the **Forró** VS Code theme will be documented in this file.

The format is based on [Keep a Changelog](https://keepachangelog.com/),
and this project adheres to [Semantic Versioning](https://semver.org/)
with [Conventional Commits](https://www.conventionalcommits.org/).

## [2.2.0] - 2026-09-04

### Added

- **Light variants** for all 5 themes (Roots Light, Íntimo Light, Nordeste Vivo Light, Pé de Serra Light, PD Light)
- `generate:light` script — generates light themes from dark using OKLCH color science
- Dark/light mode toggle on the GitHub Pages showcase site
- Shiki code highlighting for both dark and light themes on the site

### Changed

- `fix-contrast.js` now handles both dark (lighten) and light (darken) backgrounds
- Test suite expanded from 448 to 884 tests (covering all 10 theme variants)

## [2.1.0] - 2026-09-04

### Added

- **Forró PD** variant — cool-toned dark theme with green and blue accents
- WCAG 2.1 contrast ratio test suite (448 tests across all 5 variants)
- Helper unit tests for luminance and contrast functions using culori
- `fix:contrast` script — OKLCH-based lightness adjustment to fix contrast violations
- Pre-commit hook gates commits on contrast test compliance

### Fixed

- 19 foreground colors across 4 themes adjusted to meet WCAG AA contrast minimums
  - Forró Nordeste Vivo: comments, keywords, types, builtins, brackets, tab foreground
  - Forró PD: brackets/delimiters (raised to 4.5:1 for dual-role usage)
  - Forró Pé de Serra: constants
  - Forró Roots: comments, keywords, decorators, brackets, blockquote, horizontal rule, tab foreground

## [2.0.0] - 2026-09-04

### BREAKING CHANGES

- Renamed extension from "Deep Autumn" to "Forró"
- All theme variant labels renamed under the Forró family

### Added

- **Forró Roots** — default variant (formerly "Deep Autumn")
- **Forró Íntimo** — soft muted tones for late-night coding
- **Forró Nordeste Vivo** — vibrant Brazilian Nordeste-inspired palette
- **Forró Pé de Serra** — raw, pure mountain forró (formerly "Signature")

## [1.2.0] - 2026-09-04

### Added

- Forró Íntimo variant
- Signature variant

## [1.1.0] - 2026-09-04

### Added

- Nordeste Vivo variant

## [1.0.0] - 2026-09-04

### Added

- Initial release as "Deep Autumn"
- Warm dark theme with terracotta, ochre, forest green, ivory palette
