# Forró — Theme for VS Code, Zed & Terminal

A warm theme built from a palette that bridges the Nordeste brasileiro, the Mapuche south, and a Viennese winter. Dark & light variants for every mood — available for **VS Code**, **Zed**, and **xfce4-terminal**.

## Variants

### Dark

| Variant                 | Description                                                 |
| ----------------------- | ----------------------------------------------------------- |
| **Forró Roots**         | The default — earthy terracotta, ochre, forest green, ivory |
| **Forró Íntimo**        | Softer, more muted tones for late-night coding              |
| **Forró Nordeste Vivo** | Vibrant Brazilian Nordeste-inspired palette                 |
| **Forró Pé de Serra**   | The original mountain forró — raw, pure, signature          |
| **Forró PD**            | Cool-toned dark theme with green and blue accents           |

### Light

| Variant                       | Description                                       |
| ----------------------------- | ------------------------------------------------- |
| **Forró Roots Light**         | Warm ivory background with earthy token colors    |
| **Forró Íntimo Light**        | Parchment-toned light variant for daytime coding  |
| **Forró Nordeste Vivo Light** | Vivid Nordeste palette on a clean warm background |
| **Forró Pé de Serra Light**   | Mountain forró palette adapted for light mode     |
| **Forró PD Light**            | Cool slate-white with green and blue accents      |

---

## Accessibility

All ten variants (5 dark + 5 light) meet **WCAG 2.1 AA** contrast minimums:

- Primary tokens (keywords, functions, strings, types): ≥ 4.5:1
- De-emphasised tokens (comments, punctuation, operators): ≥ 3.0:1
- Key UI elements (foreground, sidebar, tabs, status bar): tested against their respective backgrounds

Contrast compliance is enforced by an automated test suite (908 tests) that runs on every commit.

---

## Platforms

### VS Code

#### From the Marketplace

Search for **Forró** in the VS Code Extensions view (`Ctrl+Shift+X`) and click **Install**.

#### From VSIX

```bash
code --install-extension forro-theme-2.0.0.vsix
```

#### Activate

Open the Command Palette (`Ctrl+Shift+P`) → **Preferences: Color Theme** → select any **Forró** variant.

### Zed

The Zed theme family lives in [`editors/zed/`](editors/zed/) and isn't published to the extension registry yet — install it as a dev extension:

1. Open the Command Palette (`Cmd/Ctrl+Shift+P`) → **zed: install dev extension**
2. Select the [`editors/zed/`](editors/zed/) directory from this repo
3. Open the Command Palette → **theme selector: toggle** → choose any **Forró** variant

### xfce4-terminal

Color schemes live in [`terminal/xfce4/`](terminal/xfce4/), one `.theme` file per variant.

```bash
mkdir -p ~/.local/share/xfce4/terminal/colorschemes
cp terminal/xfce4/*.theme ~/.local/share/xfce4/terminal/colorschemes/
```

Then in xfce4-terminal: **Edit → Preferences → Appearance → Color scheme** → select any **Forró** variant.

---

## Development

```bash
npm install
npm test                  # Run all contrast + helper tests (908 tests)
npm run fix:contrast      # Auto-fix failing colors (OKLCH lightness adjustment)
npm run generate:light    # Regenerate light themes from dark variants
npm run generate:zed      # Regenerate the Zed theme family
npm run generate:xfce     # Regenerate xfce4-terminal color schemes
npm run build:site        # Rebuild the GitHub Pages showcase site
```
