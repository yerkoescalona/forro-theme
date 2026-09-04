/**
 * Tests for the generated xfce4-terminal color schemes (terminal/xfce4/*.theme).
 *
 * Run with:  node --test tests/xfce-theme.test.mjs
 */

import { describe, it } from 'node:test';
import assert from 'node:assert/strict';
import { readFileSync } from 'node:fs';
import { join, dirname } from 'node:path';
import { fileURLToPath } from 'node:url';

import { generateSchemes } from '../scripts/generate-xfce-themes.mjs';

const __dirname = dirname(fileURLToPath(import.meta.url));
const ROOT = join(__dirname, '..');
const THEMES_DIR = join(ROOT, 'terminal', 'xfce4');

describe('xfce4-terminal color schemes', () => {
  const schemes = generateSchemes();

  it('generates 10 schemes', () => {
    assert.equal(schemes.length, 10);
  });

  for (const { out, contents } of schemes) {
    it(`${out} matches the generator output (run \`npm run generate:xfce\` if this fails)`, () => {
      const committed = readFileSync(join(THEMES_DIR, out), 'utf8');
      assert.equal(committed, contents);
    });

    it(`${out} has the required [Scheme] keys`, () => {
      for (const key of [
        '[Scheme]',
        'Name=',
        'ColorForeground=',
        'ColorBackground=',
        'ColorCursor=',
        'ColorCursorForeground=',
        'ColorSelection=',
        'ColorSelectionUseDefault=',
        'ColorBoldUseDefault=',
        'TabActivityColor=',
        'ColorPalette=',
      ]) {
        assert.ok(contents.includes(key), `${out} is missing ${key}`);
      }

      const paletteLine = contents
        .split('\n')
        .find((line) => line.startsWith('ColorPalette='));
      const colors = paletteLine.slice('ColorPalette='.length).split(';');
      assert.equal(
        colors.length,
        16,
        `${out} ColorPalette should have 16 colors`,
      );
      for (const color of colors) {
        assert.match(
          color,
          /^#[0-9a-fA-F]{6}$/,
          `${out} has invalid palette color ${color}`,
        );
      }
    });
  }
});
