/**
 * WCAG 2.1 Contrast-Ratio Tests for Forró Theme
 *
 * Ensures every foreground token used in syntax highlighting and UI
 * meets minimum contrast against its background.
 *
 * Thresholds (per WCAG 2.1 §1.4.3 / §1.4.6):
 *   - Normal text  : 4.5 : 1  (AA)
 *   - Large text    : 3.0 : 1  (AA-large)
 *   - Enhanced      : 7.0 : 1  (AAA)
 *
 * For code themes we apply:
 *   - Primary tokens (text, keywords, functions, strings, types): >= 4.5
 *   - De-emphasised tokens (comments, punctuation, operators):    >= 3.0
 *
 * References:
 *   - W3C WCAG 2.1 https://www.w3.org/TR/WCAG21/#contrast-minimum
 *   - Sarkar 2015 "The Impact of Syntax Colouring on Program Comprehension"
 *   - sRGB → linear: IEC 61966-2-1:1999
 *
 * Run with:  node --test tests/contrast.test.js
 */

const { describe, it } = require('node:test');
const assert = require('node:assert/strict');
const fs = require('node:fs');
const path = require('node:path');
const { wcagContrast } = require('culori');

// ── Contrast helper (delegates to culori) ───────────────────────────

function contrastRatio(hex1, hex2) {
  return wcagContrast(hex1, hex2);
}

// ── Theme loader ────────────────────────────────────────────────────

function loadTheme(filename) {
  const raw = fs.readFileSync(
    path.join(__dirname, '..', 'editors', 'vscode', 'themes', filename),
    'utf8',
  );
  return JSON.parse(raw);
}

function getEditorBackground(theme) {
  return theme.colors?.['editor.background'] ?? '#1a1a1a';
}

/**
 * Extract every foreground colour from tokenColors + semanticTokenColors,
 * tagged with a role so failures are easy to locate.
 */
function extractTokenForegrounds(theme) {
  const entries = [];

  // tokenColors (TextMate scopes)
  for (const tc of theme.tokenColors ?? []) {
    const fg = tc.settings?.foreground;
    if (fg && /^#[0-9a-fA-F]{3,8}$/.test(fg)) {
      entries.push({
        color: fg.slice(0, 7),
        role: tc.name ?? tc.scope?.[0] ?? 'unnamed',
      });
    }
  }

  // semanticTokenColors
  for (const [key, val] of Object.entries(theme.semanticTokenColors ?? {})) {
    const fg = typeof val === 'string' ? val : val?.foreground;
    if (fg && /^#[0-9a-fA-F]{3,8}$/.test(fg)) {
      entries.push({ color: fg.slice(0, 7), role: `semantic:${key}` });
    }
  }

  return entries;
}

// ── Which roles are "de-emphasised" (lower threshold) ───────────────

const DE_EMPHASISED =
  /comment|punctuation|bracket|separator|accessor|whitespace|indent|operator(?!.*keyword)/i;

// ── Discover all theme files ────────────────────────────────────────

const themesDir = path.join(__dirname, '..', 'editors', 'vscode', 'themes');
const themeFiles = fs
  .readdirSync(themesDir)
  .filter((f) => f.endsWith('-color-theme.json'));

// ── Tests ───────────────────────────────────────────────────────────

describe('WCAG contrast ratios', () => {
  for (const file of themeFiles) {
    describe(file, () => {
      const theme = loadTheme(file);
      const bg = getEditorBackground(theme);
      const tokens = extractTokenForegrounds(theme);

      // Deduplicate by color+role
      const seen = new Set();
      const unique = tokens.filter((t) => {
        const key = `${t.color}|${t.role}`;
        if (seen.has(key)) return false;
        seen.add(key);
        return true;
      });

      for (const { color, role } of unique) {
        const minRatio = DE_EMPHASISED.test(role) ? 3.0 : 4.5;
        const label = `${role} (${color}) vs bg ${bg} ≥ ${minRatio}:1`;

        it(label, () => {
          const ratio = contrastRatio(color, bg);
          assert.ok(
            ratio >= minRatio,
            `${role}: ${color} on ${bg} → ${ratio.toFixed(2)}:1, need ≥ ${minRatio}:1`,
          );
        });
      }

      // Also test key UI foregrounds
      const uiChecks = [
        ['foreground', 4.5],
        ['editor.foreground', 4.5],
        ['editorLineNumber.activeForeground', 3.0],
        ['sideBar.foreground', 4.5],
        ['statusBar.foreground', 3.0],
        ['tab.activeForeground', 4.5],
        ['tab.inactiveForeground', 3.0],
      ];

      for (const [key, minRatio] of uiChecks) {
        const fg = theme.colors?.[key];
        if (!fg || !/^#[0-9a-fA-F]{3,8}$/.test(fg)) continue;
        const uiBg = key.startsWith('sideBar')
          ? (theme.colors?.['sideBar.background'] ?? bg)
          : key.startsWith('statusBar')
            ? (theme.colors?.['statusBar.background'] ?? bg)
            : key.startsWith('tab')
              ? (theme.colors?.['tab.activeBackground'] ??
                theme.colors?.['editorGroupHeader.tabsBackground'] ??
                bg)
              : bg;

        it(`UI: ${key} (${fg.slice(0, 7)}) vs ${uiBg.slice(0, 7)} ≥ ${minRatio}:1`, () => {
          const ratio = contrastRatio(fg.slice(0, 7), uiBg.slice(0, 7));
          assert.ok(
            ratio >= minRatio,
            `${key}: ${fg} on ${uiBg} → ${ratio.toFixed(2)}:1, need ≥ ${minRatio}:1`,
          );
        });
      }
    });
  }
});
