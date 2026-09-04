/**
 * Unit tests for the colour-science helpers used by the contrast tests.
 *
 * Reference values come from the W3C WCAG 2.1 spec examples and
 * the WebAIM contrast checker (https://webaim.org/resources/contrastchecker/).
 *
 * Run with:  node --test tests/helpers.test.js
 */

const { describe, it } = require('node:test');
const assert = require('node:assert/strict');
const { wcagContrast, wcagLuminance } = require('culori');

// ── Helpers (thin wrappers around culori, matching contrast.test.js) ──

function relativeLuminance(hex) {
  return wcagLuminance(hex);
}

function contrastRatio(hex1, hex2) {
  return wcagContrast(hex1, hex2);
}

// ── relativeLuminance (via culori) ───────────────────────────────────

describe('relativeLuminance', () => {
  it('black (#000000) → 0', () => {
    assertClose(relativeLuminance('#000000'), 0.0, 1e-6);
  });

  it('white (#FFFFFF) → 1', () => {
    assertClose(relativeLuminance('#FFFFFF'), 1.0, 1e-6);
  });

  it('pure red (#FF0000) → 0.2126', () => {
    assertClose(relativeLuminance('#FF0000'), 0.2126, 1e-4);
  });

  it('pure green (#00FF00) → 0.7152', () => {
    assertClose(relativeLuminance('#00FF00'), 0.7152, 1e-4);
  });

  it('pure blue (#0000FF) → 0.0722', () => {
    assertClose(relativeLuminance('#0000FF'), 0.0722, 1e-4);
  });

  it('handles short hex (#FFF)', () => {
    assertClose(relativeLuminance('#FFF'), 1.0, 1e-6);
  });

  it('handles no-hash input (FFFFFF)', () => {
    assertClose(relativeLuminance('FFFFFF'), 1.0, 1e-6);
  });
});

// ── contrastRatio ───────────────────────────────────────────────────

describe('contrastRatio', () => {
  it('black vs white → 21:1', () => {
    assertClose(contrastRatio('#000000', '#FFFFFF'), 21.0, 0.01);
  });

  it('white vs black → 21:1 (order independent)', () => {
    assertClose(contrastRatio('#FFFFFF', '#000000'), 21.0, 0.01);
  });

  it('same colour → 1:1', () => {
    assertClose(contrastRatio('#336699', '#336699'), 1.0, 1e-6);
  });

  // WebAIM reference: #767676 on #FFFFFF → 4.54:1 (AA pass threshold)
  it('#767676 on #FFFFFF → ~4.54:1 (WebAIM reference)', () => {
    const ratio = contrastRatio('#767676', '#FFFFFF');
    assert.ok(ratio >= 4.5, `Expected ≥ 4.5, got ${ratio.toFixed(2)}`);
    assertClose(ratio, 4.54, 0.05);
  });

  // WebAIM reference: #595959 on #FFFFFF → 7.0:1 (AAA threshold)
  it('#595959 on #FFFFFF → ~7.0:1 (WebAIM AAA threshold)', () => {
    const ratio = contrastRatio('#595959', '#FFFFFF');
    assert.ok(ratio >= 7.0, `Expected ≥ 7.0, got ${ratio.toFixed(2)}`);
    assertClose(ratio, 7.0, 0.1);
  });
});

// ── Helper ──────────────────────────────────────────────────────────

function assertClose(actual, expected, tolerance) {
  assert.ok(
    Math.abs(actual - expected) <= tolerance,
    `Expected ~${expected}, got ${actual} (tolerance ${tolerance})`,
  );
}
