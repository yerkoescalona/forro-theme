#!/usr/bin/env node
/**
 * fix-contrast.js
 *
 * Adjusts foreground colors in all theme files to meet WCAG 2.1 contrast
 * minimums against their background, using perceptually uniform OKLCH space.
 *
 * Strategy:
 *   1. Convert the failing foreground to OKLCH (perceptual lightness, chroma, hue).
 *   2. Binary-search on the L (lightness) channel to find the minimum increase
 *      that meets the required contrast ratio, keeping chroma and hue untouched.
 *   3. Convert back to sRGB hex and replace in the theme JSON.
 *
 * This preserves the designer's intended hue and saturation — only lightness
 * is adjusted, and only the minimum amount needed.
 *
 * Usage:  node scripts/fix-contrast.js [--dry-run]
 */

const fs = require('fs');
const path = require('path');
const { parse, formatHex, converter, wcagContrast } = require('culori');

const toOklch = converter('oklch');
const toRgb = converter('rgb');

// ── Config ──────────────────────────────────────────────────────────

const DE_EMPHASISED =
  /comment|punctuation|bracket|separator|accessor|whitespace|indent|operator(?!.*keyword)/i;

const THEMES_DIR = path.join(__dirname, '..', 'editors', 'vscode', 'themes');
const DRY_RUN = process.argv.includes('--dry-run');

// ── Colour helpers ──────────────────────────────────────────────────

/**
 * Given a foreground hex and a background hex, adjust the OKLCH lightness
 * of the foreground until it meets `minRatio`. Returns the new hex.
 * If it already passes, returns the original hex unchanged.
 * Automatically detects whether to lighten or darken based on bg luminance.
 */
function adjustLightness(fgHex, bgHex, minRatio) {
  const ratio = wcagContrast(fgHex, bgHex);
  if (ratio >= minRatio) return fgHex;

  const fg = toOklch(parse(fgHex));
  const bg = toOklch(parse(bgHex));
  if (!fg || !bg) return fgHex;

  // If bg is light (L > 0.5), darken the foreground; otherwise lighten it
  const bgIsLight = bg.l > 0.5;
  let lo, hi;
  if (bgIsLight) {
    lo = 0;
    hi = fg.l;
  } else {
    lo = fg.l;
    hi = 1.0;
  }

  let best = null;

  for (let i = 0; i < 64; i++) {
    const mid = (lo + hi) / 2;
    const candidate = { ...fg, l: mid };
    const hex = formatHex(toRgb(candidate));
    const r = wcagContrast(hex, bgHex);

    if (r >= minRatio) {
      best = hex;
      if (bgIsLight) {
        lo = mid; // try lighter (minimal darkening)
      } else {
        hi = mid; // try lower lightness (minimal lightening)
      }
    } else {
      if (bgIsLight) {
        hi = mid;
      } else {
        lo = mid;
      }
    }
  }

  return best ?? fgHex;
}

// ── Theme processing ────────────────────────────────────────────────

function extractTokenForegrounds(theme) {
  const entries = [];

  for (const tc of theme.tokenColors ?? []) {
    const fg = tc.settings?.foreground;
    if (fg && /^#[0-9a-fA-F]{3,8}$/.test(fg)) {
      entries.push({
        color: fg.slice(0, 7),
        role: tc.name ?? tc.scope?.[0] ?? 'unnamed',
        path: ['tokenColors', tc],
      });
    }
  }

  for (const [key, val] of Object.entries(theme.semanticTokenColors ?? {})) {
    const fg = typeof val === 'string' ? val : val?.foreground;
    if (fg && /^#[0-9a-fA-F]{3,8}$/.test(fg)) {
      entries.push({
        color: fg.slice(0, 7),
        role: `semantic:${key}`,
        path: ['semanticTokenColors', key],
      });
    }
  }

  return entries;
}

function getEditorBackground(theme) {
  return theme.colors?.['editor.background'] ?? '#1a1a1a';
}

function processTheme(filename) {
  const filePath = path.join(THEMES_DIR, filename);
  let raw = fs.readFileSync(filePath, 'utf8');
  const theme = JSON.parse(raw);
  const bg = getEditorBackground(theme);

  const replacements = new Map(); // old hex → new hex (dedup)
  let fixCount = 0;

  // Token colors — collect the *maximum* required ratio per colour,
  // because the same hex may appear in both de-emphasised and primary roles.
  const tokens = extractTokenForegrounds(theme);
  const colorMaxRatio = new Map(); // lowercase hex → { maxRatio, roles[] }
  for (const { color, role } of tokens) {
    const minRatio = DE_EMPHASISED.test(role) ? 3.0 : 4.5;
    const key = color.toLowerCase();
    const entry = colorMaxRatio.get(key);
    if (!entry) {
      colorMaxRatio.set(key, { maxRatio: minRatio, roles: [role] });
    } else {
      entry.maxRatio = Math.max(entry.maxRatio, minRatio);
      entry.roles.push(role);
    }
  }

  for (const [color, { maxRatio, roles }] of colorMaxRatio) {
    const currentRatio = wcagContrast(color, bg);
    if (currentRatio >= maxRatio) continue;

    const fixed = adjustLightness(color, bg, maxRatio);
    if (fixed !== color && !replacements.has(color)) {
      replacements.set(color, fixed);
      fixCount++;
      console.log(
        `  ${roles[0]}: ${color} (${currentRatio.toFixed(2)}) → ${fixed} (${wcagContrast(fixed, bg).toFixed(2)}) need ≥${maxRatio}`,
      );
    }
  }

  // UI colors
  const uiChecks = [
    ['foreground', 4.5, null],
    ['editor.foreground', 4.5, null],
    ['editorLineNumber.activeForeground', 3.0, null],
    ['sideBar.foreground', 4.5, 'sideBar.background'],
    ['statusBar.foreground', 3.0, 'statusBar.background'],
    ['tab.activeForeground', 4.5, 'tab.activeBackground'],
    [
      'tab.inactiveForeground',
      3.0,
      'tab.activeBackground|editorGroupHeader.tabsBackground',
    ],
  ];

  for (const [key, minRatio, bgKey] of uiChecks) {
    const fg = theme.colors?.[key];
    if (!fg || !/^#[0-9a-fA-F]{3,8}$/.test(fg)) continue;
    let uiBg = bg;
    if (bgKey) {
      for (const k of bgKey.split('|')) {
        if (theme.colors?.[k]) {
          uiBg = theme.colors[k];
          break;
        }
      }
    }
    const fgShort = fg.slice(0, 7);
    const bgShort = uiBg.slice(0, 7);
    const currentRatio = wcagContrast(fgShort, bgShort);
    if (currentRatio >= minRatio) continue;

    const fixed = adjustLightness(fgShort, bgShort, minRatio);
    if (fixed !== fgShort) {
      // UI colors might not share hex with tokens — replace specifically in colors block
      fixCount++;
      console.log(
        `  UI ${key}: ${fgShort} (${currentRatio.toFixed(2)}) → ${fixed} (${wcagContrast(fixed, bgShort).toFixed(2)}) vs ${bgShort} need ≥${minRatio}`,
      );
      // Direct replacement in the JSON for this specific key
      const pattern = new RegExp(
        `("${key.replace(/\./g, '\\.')}"\\s*:\\s*")${fgShort.replace('#', '\\#')}`,
        'gi',
      );
      raw = raw.replace(pattern, `$1${fixed}`);
    }
  }

  // Apply token/semantic replacements globally in the file
  for (const [oldHex, newHex] of replacements) {
    // Case-insensitive global replace of the hex value
    const escaped = oldHex.replace('#', '\\#');
    const re = new RegExp(escaped, 'gi');
    raw = raw.replace(re, newHex);
  }

  if (fixCount > 0 && !DRY_RUN) {
    fs.writeFileSync(filePath, raw, 'utf8');
    console.log(`  ✓ Wrote ${fixCount} fixes to ${filename}\n`);
  } else if (fixCount > 0) {
    console.log(`  [dry-run] Would write ${fixCount} fixes to ${filename}\n`);
  } else {
    console.log(`  ✓ All passing — no changes needed\n`);
  }

  return fixCount;
}

// ── Main ────────────────────────────────────────────────────────────

const themeFiles = fs
  .readdirSync(THEMES_DIR)
  .filter((f) => f.endsWith('-color-theme.json'));

console.log(`Processing ${themeFiles.length} themes…\n`);
let totalFixes = 0;

for (const file of themeFiles) {
  console.log(`▶ ${file} ──────────────────────`);
  totalFixes += processTheme(file);
}

console.log(`Done. ${totalFixes} total fixes${DRY_RUN ? ' (dry-run)' : ''}.`);
