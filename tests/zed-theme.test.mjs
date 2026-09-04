/**
 * Tests for the generated Zed theme family (editors/zed/themes/forro.json).
 *
 * Run with:  node --test tests/zed-theme.test.mjs
 */

import { describe, it } from 'node:test';
import assert from 'node:assert/strict';
import { readFileSync } from 'node:fs';
import { join, dirname } from 'node:path';
import { fileURLToPath } from 'node:url';
import Ajv from 'ajv';

import { generateFamily } from '../scripts/generate-zed-themes.mjs';

const __dirname = dirname(fileURLToPath(import.meta.url));
const ROOT = join(__dirname, '..');
const THEME_FILE = join(ROOT, 'editors', 'zed', 'themes', 'forro.json');
const SCHEMA_FILE = join(__dirname, '..', 'scripts', 'schemas', 'zed-theme-v0.2.0.json');

const committed = JSON.parse(readFileSync(THEME_FILE, 'utf8'));
const schema = JSON.parse(readFileSync(SCHEMA_FILE, 'utf8'));

describe('Zed theme family', () => {
  it('matches the output of the generator (run `npm run generate:zed` if this fails)', () => {
    const generated = generateFamily();
    assert.deepEqual(committed, generated);
  });

  it('validates against the Zed v0.2.0 theme schema', () => {
    const ajv = new Ajv({ strict: false });
    const validate = ajv.compile(schema);
    const valid = validate(committed);
    assert.equal(valid, true, JSON.stringify(validate.errors, null, 2));
  });

  it('contains all 10 Forró variants with the correct appearance', () => {
    const names = committed.themes.map((t) => t.name);
    const darkCount = committed.themes.filter((t) => t.appearance === 'dark').length;
    const lightCount = committed.themes.filter((t) => t.appearance === 'light').length;

    assert.equal(committed.themes.length, 10);
    assert.equal(darkCount, 5);
    assert.equal(lightCount, 5);
    for (const name of names) {
      const theme = committed.themes.find((t) => t.name === name);
      assert.equal(theme.appearance, name.endsWith('Light') ? 'light' : 'dark');
    }
  });
});
