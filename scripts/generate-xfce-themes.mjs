#!/usr/bin/env node
/**
 * Generates terminal/xfce4/*.theme — xfce4-terminal color schemes derived
 * from the `terminal.*` colors in the VS Code theme JSON files.
 *
 * Usage:  node scripts/generate-xfce-themes.mjs
 *
 * Install a generated scheme by copying it to:
 *   ~/.local/share/xfce4/terminal/colorschemes/
 */

import { readFileSync, mkdirSync, writeFileSync, readdirSync } from 'node:fs';
import { join, dirname, relative } from 'node:path';
import { fileURLToPath, pathToFileURL } from 'node:url';

const __dirname = dirname(fileURLToPath(import.meta.url));
const ROOT = join(__dirname, '..');
const VSCODE_THEMES_DIR = join(ROOT, 'editors', 'vscode', 'themes');
const OUT_DIR = join(ROOT, 'terminal', 'xfce4');

const VARIANTS = [
  {
    file: 'forro-roots-color-theme.json',
    out: 'forro-roots.theme',
    name: 'Forró Roots',
  },
  {
    file: 'forro-intimo-color-theme.json',
    out: 'forro-intimo.theme',
    name: 'Forró Íntimo',
  },
  {
    file: 'forro-nordeste-vivo-color-theme.json',
    out: 'forro-nordeste-vivo.theme',
    name: 'Forró Nordeste Vivo',
  },
  {
    file: 'forro-pe-de-serra-color-theme.json',
    out: 'forro-pe-de-serra.theme',
    name: 'Forró Pé de Serra',
  },
  {
    file: 'forro-pd-color-theme.json',
    out: 'forro-pd.theme',
    name: 'Forró PD',
  },
  {
    file: 'forro-roots-light-color-theme.json',
    out: 'forro-roots-light.theme',
    name: 'Forró Roots Light',
  },
  {
    file: 'forro-intimo-light-color-theme.json',
    out: 'forro-intimo-light.theme',
    name: 'Forró Íntimo Light',
  },
  {
    file: 'forro-nordeste-vivo-light-color-theme.json',
    out: 'forro-nordeste-vivo-light.theme',
    name: 'Forró Nordeste Vivo Light',
  },
  {
    file: 'forro-pe-de-serra-light-color-theme.json',
    out: 'forro-pe-de-serra-light.theme',
    name: 'Forró Pé de Serra Light',
  },
  {
    file: 'forro-pd-light-color-theme.json',
    out: 'forro-pd-light.theme',
    name: 'Forró PD Light',
  },
];

// Standard xfce4-terminal ColorPalette order: normal 0-7, then bright 0-7.
const PALETTE_KEYS = [
  'terminal.ansiBlack',
  'terminal.ansiRed',
  'terminal.ansiGreen',
  'terminal.ansiYellow',
  'terminal.ansiBlue',
  'terminal.ansiMagenta',
  'terminal.ansiCyan',
  'terminal.ansiWhite',
  'terminal.ansiBrightBlack',
  'terminal.ansiBrightRed',
  'terminal.ansiBrightGreen',
  'terminal.ansiBrightYellow',
  'terminal.ansiBrightBlue',
  'terminal.ansiBrightMagenta',
  'terminal.ansiBrightCyan',
  'terminal.ansiBrightWhite',
];

function vsColor(theme, key) {
  const value = theme.colors[key];
  if (value === undefined) {
    throw new Error(`Theme is missing colors.${key}`);
  }
  return value;
}

// xfce4-terminal expects plain #rrggbb (no alpha channel).
function stripAlpha(hex) {
  return hex.length > 7 ? hex.slice(0, 7) : hex;
}

function buildScheme(theme, name) {
  const c = (key) => stripAlpha(vsColor(theme, key));
  const palette = PALETTE_KEYS.map(c).join(';');

  // Some light variants define terminal.selectionBackground identical to
  // terminal.background (no highlight visible). In that case fall back to
  // xfce4-terminal's default selection color (inverted fg/bg) instead.
  const selectionUsesDefault =
    c('terminal.selectionBackground') === c('terminal.background');

  return [
    '[Scheme]',
    `Name=${name}`,
    `ColorForeground=${c('terminal.foreground')}`,
    `ColorBackground=${c('terminal.background')}`,
    `ColorCursor=${c('terminalCursor.foreground')}`,
    `ColorCursorForeground=${c('terminalCursor.background')}`,
    `ColorSelection=${c('terminal.selectionBackground')}`,
    `ColorSelectionUseDefault=${selectionUsesDefault ? 'TRUE' : 'FALSE'}`,
    'ColorBoldUseDefault=TRUE',
    `TabActivityColor=${c('terminal.ansiBrightYellow')}`,
    `ColorPalette=${palette}`,
    '',
  ].join('\n');
}

export function generateSchemes() {
  return VARIANTS.map(({ file, out, name }) => {
    const theme = JSON.parse(
      readFileSync(join(VSCODE_THEMES_DIR, file), 'utf8'),
    );
    return { out, contents: buildScheme(theme, name) };
  });
}

function main() {
  const schemes = generateSchemes();
  mkdirSync(OUT_DIR, { recursive: true });

  // Remove stale .theme files from previous runs before writing the current set.
  for (const entry of readdirSync(OUT_DIR)) {
    if (entry.endsWith('.theme') && !schemes.some((s) => s.out === entry)) {
      throw new Error(`Stale generated file ${entry} — remove it manually`);
    }
  }

  for (const { out, contents } of schemes) {
    writeFileSync(join(OUT_DIR, out), contents);
  }
  console.log(
    `Written ${schemes.length} color schemes to ${relative(ROOT, OUT_DIR)}/`,
  );
}

if (import.meta.url === pathToFileURL(process.argv[1] ?? '').href) {
  main();
}
