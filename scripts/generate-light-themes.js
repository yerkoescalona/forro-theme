/**
 * Generate light versions of all dark themes using OKLCH color science.
 * Preserves hue and chroma, adjusts lightness for light backgrounds.
 */

const fs = require('fs');
const path = require('path');
const { parse, formatHex, converter, wcagContrast } = require('culori');

const toOklch = converter('oklch');
const toRgb = converter('rgb');

// === Light theme configurations ===
const LIGHT_CONFIGS = {
  roots: {
    name: 'Forró Roots Light',
    darkFile: 'forro-roots-color-theme.json',
    lightFile: 'forro-roots-light-color-theme.json',
    bg: '#FAF5EC', // warm ivory
    surface: '#F0EBE2', // slightly darker
    surfaceDeep: '#E8E2D8', // deeper surface
    border: '#D4CFC6', // soft border
    fg: '#2A2018', // dark warm brown
    fgMuted: '#5A5040', // muted text
    fgSubtle: '#7A7060', // subtle text
    accent: '#9E4A1A', // darker terracotta for light bg
    accentMuted: '#B86830',
  },
  intimo: {
    name: 'Forró Íntimo Light',
    darkFile: 'forro-intimo-color-theme.json',
    lightFile: 'forro-intimo-light-color-theme.json',
    bg: '#FBF3E8', // warm parchment
    surface: '#F2EADF', // slightly darker
    surfaceDeep: '#E8E0D4', // deeper
    border: '#D8CFC2', // soft border
    fg: '#1E1408', // dark sepia
    fgMuted: '#4A3C28', // muted
    fgSubtle: '#6A5C48', // subtle
    accent: '#9E4A0A', // dark amber
    accentMuted: '#B86218',
  },
  'nordeste-vivo': {
    name: 'Forró Nordeste Vivo Light',
    darkFile: 'forro-nordeste-vivo-color-theme.json',
    lightFile: 'forro-nordeste-vivo-light-color-theme.json',
    bg: '#FAF8F2', // light warm
    surface: '#F0EEE8', // slightly darker
    surfaceDeep: '#E6E4DE', // deeper
    border: '#D2D0CA', // soft border
    fg: '#1A1A18', // near black
    fgMuted: '#4A4840', // muted
    fgSubtle: '#6A6860', // subtle
    accent: '#C82020', // darker vivid red
    accentMuted: '#D43A1A',
  },
  'pe-de-serra': {
    name: 'Forró Pé de Serra Light',
    darkFile: 'forro-pe-de-serra-color-theme.json',
    lightFile: 'forro-pe-de-serra-light-color-theme.json',
    bg: '#F8F3EC', // warm cream
    surface: '#EEE9E0', // slightly darker
    surfaceDeep: '#E4DED5', // deeper
    border: '#D0CAC0', // soft border
    fg: '#1A1510', // dark earth
    fgMuted: '#4A4030', // muted
    fgSubtle: '#6A5E50', // subtle
    accent: '#A04E18', // dark burnt sienna
    accentMuted: '#B86020',
  },
  pd: {
    name: 'Forró PD Light',
    darkFile: 'forro-pd-color-theme.json',
    lightFile: 'forro-pd-light-color-theme.json',
    bg: '#F8FAFC', // cool slate-white
    surface: '#EEF1F5', // slightly darker
    surfaceDeep: '#E2E6EC', // deeper
    border: '#CBD5E1', // slate border
    fg: '#0F172A', // dark navy
    fgMuted: '#334155', // muted slate
    fgSubtle: '#64748B', // subtle slate
    accent: '#059669', // darker emerald
    accentMuted: '#10B981',
  },
};

/**
 * Darken a hex color using OKLCH so it achieves minRatio contrast against bgHex.
 * Preserves hue and chroma, adjusts only lightness.
 */
function darkenForContrast(hexColor, bgHex, minRatio) {
  const color = parse(hexColor);
  const bg = parse(bgHex);
  if (!color || !bg) return hexColor;

  const currentRatio = wcagContrast(color, bg);
  if (currentRatio >= minRatio) return hexColor;

  const oklch = toOklch(color);
  if (!oklch) return hexColor;

  // Binary search for correct lightness
  let lo = 0;
  let hi = oklch.l;
  let bestHex = hexColor;

  for (let i = 0; i < 30; i++) {
    const mid = (lo + hi) / 2;
    const candidate = { mode: 'oklch', l: mid, c: oklch.c, h: oklch.h };
    const rgb = toRgb(candidate);
    if (!rgb) break;

    const ratio = wcagContrast(rgb, bg);
    if (ratio >= minRatio) {
      bestHex = formatHex(rgb);
      lo = mid; // try lighter (less darkening)
    } else {
      hi = mid; // need darker
    }
  }

  return bestHex;
}

/**
 * Check if a color string has alpha (8-digit hex or contains alpha notation)
 */
function hasAlpha(hex) {
  if (!hex || typeof hex !== 'string') return false;
  const clean = hex.replace('#', '');
  return clean.length === 8 || clean.length === 4;
}

/**
 * Extract alpha from an 8-digit hex, return [6-digit hex, alpha 0-1]
 */
function splitAlpha(hex) {
  const clean = hex.replace('#', '');
  if (clean.length === 8) {
    const base = '#' + clean.slice(0, 6);
    const alpha = parseInt(clean.slice(6), 16) / 255;
    return [base, alpha];
  }
  return [hex, 1];
}

/**
 * Combine a 6-digit hex with an alpha value into 8-digit hex
 */
function withAlpha(hex, alpha) {
  const clean = hex.replace('#', '');
  const a = Math.round(alpha * 255)
    .toString(16)
    .padStart(2, '0');
  return '#' + clean.slice(0, 6) + a;
}

/**
 * Transform a UI color key's value for light mode
 */
function transformUIColor(key, value, config) {
  if (!value || value === 'none' || value === '#00000000') return value;

  const lowerKey = key.toLowerCase();

  // Backgrounds: map dark bgs → light bgs
  if (
    lowerKey.includes('background') ||
    lowerKey === 'editor.background' ||
    lowerKey.endsWith('.background')
  ) {
    // Main editor bg
    if (key === 'editor.background' || key === 'editorGutter.background') {
      return config.bg;
    }
    // Deeper backgrounds (sidebar, panel, terminal)
    if (
      key.startsWith('sideBar.') ||
      key.startsWith('panel.') ||
      key.startsWith('terminal.') ||
      key === 'activityBar.background' ||
      key === 'activityBar.activeBackground'
    ) {
      return config.surface;
    }
    // Deepest backgrounds (title bar, status bar)
    if (key.startsWith('titleBar.') || key.startsWith('statusBar.')) {
      return config.surfaceDeep;
    }
    // Tab backgrounds
    if (
      key === 'tab.activeBackground' ||
      key === 'tab.unfocusedActiveBackground'
    ) {
      return config.bg;
    }
    if (
      key === 'tab.inactiveBackground' ||
      key === 'tab.unfocusedInactiveBackground'
    ) {
      return config.surface;
    }
    // Editor group
    if (key.startsWith('editorGroup')) {
      return config.bg;
    }
    if (key.startsWith('editorGroupHeader')) {
      return config.surface;
    }
    // Widgets/suggest/hover
    if (
      key.startsWith('editorSuggestWidget') ||
      key.startsWith('editorWidget') ||
      key.startsWith('editorHoverWidget')
    ) {
      return config.bg;
    }
    // Notification/peek
    if (key.startsWith('notification') || key.startsWith('peekView')) {
      return config.surface;
    }
    // Dropdown/input
    if (key.startsWith('dropdown') || key.startsWith('input')) {
      return config.bg;
    }
    // Checkbox
    if (key.startsWith('checkbox')) return config.bg;
    // Button
    if (key === 'button.background') return config.accent;
    if (key === 'button.secondaryBackground') return config.surfaceDeep;
    // Line highlight
    if (key === 'editor.lineHighlightBackground') return config.surface;
    // Debug toolbar
    if (key === 'debugToolBar.background') return config.surface;
    // Breadcrumb
    if (key.startsWith('breadcrumb')) return config.bg;
    // Menu
    if (key.startsWith('menu.')) return config.bg;
    // List
    if (key.startsWith('list.')) {
      if (hasAlpha(value)) {
        const [, alpha] = splitAlpha(value);
        return withAlpha(config.accent.replace('#', ''), alpha);
      }
      return config.surface;
    }
    // Marker navigation
    if (key.startsWith('editorMarkerNavigation')) return config.surface;
    // Minimap
    if (key.startsWith('minimap.')) return config.surface;
    // Diff editor
    if (key.startsWith('diffEditor.')) {
      if (hasAlpha(value)) return value; // keep alpha tints
      return config.bg;
    }
    // Badge
    if (key === 'badge.background') return config.accent;
    // General: keep alpha overlays, swap solid bgs
    if (hasAlpha(value)) {
      return value; // semi-transparent overlays are usually fine
    }
    return config.surface;
  }

  // Borders: use light border color
  if (lowerKey.includes('border')) {
    if (value === 'none' || value === '#00000000') return value;
    if (hasAlpha(value)) return value;
    // Accent borders keep accent
    if (
      key.includes('active') ||
      key.includes('focus') ||
      key === 'tab.activeBorderTop' ||
      key === 'activityBar.activeBorder' ||
      key === 'panelTitle.activeBorder'
    ) {
      return config.accent;
    }
    return config.border;
  }

  // Foregrounds
  if (lowerKey.includes('foreground')) {
    // Main foreground
    if (key === 'foreground' || key === 'editor.foreground') {
      return config.fg;
    }
    // Button foreground on accent bg
    if (key === 'button.foreground' || key === 'badge.foreground') {
      return '#FFFFFF';
    }
    // Status bar debugging
    if (key === 'statusBar.debuggingForeground') return '#FFFFFF';
    // Activity bar
    if (key === 'activityBar.foreground') return config.accent;
    if (key === 'activityBar.inactiveForeground') return config.fgSubtle;
    // Sidebar
    if (key === 'sideBar.foreground') return config.fgMuted;
    if (key === 'sideBarTitle.foreground') return config.accent;
    if (key === 'sideBarSectionHeader.foreground') return config.accentMuted;
    // Tab
    if (key === 'tab.activeForeground') return config.fg;
    if (key === 'tab.inactiveForeground') return config.fgSubtle;
    if (key.startsWith('tab.unfocused')) return config.fgSubtle;
    // Status bar
    if (key === 'statusBar.foreground') return config.fgMuted;
    if (key === 'statusBar.noFolderForeground') return config.fgSubtle;
    // Title bar
    if (key === 'titleBar.activeForeground') return config.fgMuted;
    if (key === 'titleBar.inactiveForeground') return config.fgSubtle;
    // Terminal
    if (key === 'terminal.foreground') return config.fg;
    // Breadcrumb
    if (key === 'breadcrumb.foreground') return config.fgSubtle;
    if (key === 'breadcrumb.focusForeground') return config.accent;
    if (key === 'breadcrumb.activeSelectionForeground') return config.accent;
    // Panel title
    if (key === 'panelTitle.activeForeground') return config.accent;
    if (key === 'panelTitle.inactiveForeground') return config.fgSubtle;
    // Editor line numbers
    if (key === 'editorLineNumber.foreground') return config.fgSubtle;
    if (key === 'editorLineNumber.activeForeground') return config.accent;
    // Input placeholder
    if (key === 'input.placeholderForeground') return config.fgSubtle;
    // Activity bar badge
    if (key === 'activityBarBadge.foreground') return '#FFFFFF';
    // Menu
    if (key.startsWith('menu.')) return config.fg;
    // Highlight foreground
    if (key === 'list.highlightForeground') return config.accent;
    // Widgets
    if (key === 'editorSuggestWidget.highlightForeground') return config.accent;
    // Description
    if (key === 'descriptionForeground') return config.fgMuted;
    // Charts
    if (key === 'charts.foreground') return config.fg;
    // Git decorations — darken for light bg
    if (key.startsWith('gitDecoration.')) {
      return darkenForContrast(value, config.bg, 4.5);
    }
    // Error/warning/info — darken
    if (
      key.includes('error') ||
      key.includes('Error') ||
      key.includes('warning') ||
      key.includes('Warning')
    ) {
      return darkenForContrast(value, config.bg, 4.5);
    }
    // Default: ensure contrast
    if (!hasAlpha(value)) {
      return darkenForContrast(value, config.bg, 3.0);
    }
    return value;
  }

  // Shadow
  if (lowerKey.includes('shadow')) {
    return '#00000012';
  }

  // Scrollbar
  if (key.startsWith('scrollbar')) {
    if (hasAlpha(value)) {
      return value.replace(
        /[0-9a-f]{2}$/i,
        Math.round(0.3 * 255)
          .toString(16)
          .padStart(2, '0'),
      );
    }
    return config.fgSubtle;
  }

  // Cursor
  if (
    key === 'editorCursor.foreground' ||
    key === 'terminalCursor.foreground'
  ) {
    return config.accent;
  }
  if (
    key === 'editorCursor.background' ||
    key === 'terminalCursor.background'
  ) {
    return config.bg;
  }

  // Selection/highlights — keep with adjusted alpha
  if (
    lowerKey.includes('selection') ||
    lowerKey.includes('highlight') ||
    lowerKey.includes('match')
  ) {
    if (hasAlpha(value)) return value;
    return value;
  }

  // Terminal ANSI colors — darken for light background
  if (key.startsWith('terminal.ansi')) {
    if (key === 'terminal.ansiBlack') return config.fg;
    if (key === 'terminal.ansiWhite') return config.fgSubtle;
    if (key === 'terminal.ansiBrightBlack') return config.fgSubtle;
    if (key === 'terminal.ansiBrightWhite') return config.fg;
    // Darken others for contrast on light bg
    return darkenForContrast(value, config.bg, 4.5);
  }

  // Whitespace/indent guides
  if (
    key.startsWith('editorWhitespace') ||
    key.startsWith('editorIndentGuide')
  ) {
    return config.border;
  }
  if (key === 'editorRuler.foreground') return config.border;

  // Overview ruler — keep accent colors
  if (key.startsWith('editorOverviewRuler.')) {
    if (key === 'editorOverviewRuler.background') return config.surface;
    if (key === 'editorOverviewRuler.border') return config.border;
    return value; // keep colored indicators
  }

  // Charts — keep as-is (usually decorative)
  if (key.startsWith('charts.')) {
    if (key === 'charts.lines') return config.border;
    return darkenForContrast(value, config.bg, 3.0);
  }

  // Diff editor colors with alpha
  if (key.startsWith('diffEditor.')) {
    if (key === 'diffEditor.border') return config.border;
    if (key === 'diffEditor.diagonalFill') return config.border;
    return value;
  }

  // Symbol icons — darken for light bg
  if (key.startsWith('symbolIcon.')) {
    return darkenForContrast(value, config.bg, 4.5);
  }

  // Debug icons
  if (key.startsWith('debugIcon.')) {
    return darkenForContrast(value, config.bg, 3.0);
  }

  // Status bar item
  if (key.startsWith('statusBarItem.')) {
    if (key === 'statusBarItem.remoteForeground') return config.surfaceDeep;
    if (key === 'statusBarItem.remoteBackground') return config.accent;
    if (key === 'statusBarItem.prominentBackground') return config.accent;
    if (key === 'statusBarItem.prominentForeground') return '#FFFFFF';
    if (hasAlpha(value)) return value;
    return value;
  }

  // Keybinding label
  if (key.startsWith('keybindingLabel.')) {
    if (key === 'keybindingLabel.background') return config.surfaceDeep;
    if (key === 'keybindingLabel.foreground') return config.fgMuted;
    return config.border;
  }

  // Bracket match
  if (key.startsWith('editorBracketMatch.')) {
    if (hasAlpha(value)) return value;
    return config.accent;
  }

  // Text block
  if (key.startsWith('text')) {
    if (key === 'textBlockQuote.background') return config.surface;
    if (key === 'textBlockQuote.border') return config.accent;
    if (key === 'textCodeBlock.background') return config.surface;
    if (key === 'textLink.foreground') return config.accent;
    if (key === 'textLink.activeForeground') return config.accentMuted;
    if (key === 'textPreformat.foreground')
      return darkenForContrast(value, config.bg, 4.5);
    if (key === 'textSeparator.foreground') return config.border;
    return value;
  }

  // Progress bar
  if (key === 'progressBar.background') return config.accent;

  // Focus border
  if (key === 'focusBorder') return config.accent;

  // Icon foreground
  if (key === 'icon.foreground') return config.fgMuted;

  // Error foreground
  if (key === 'errorForeground')
    return darkenForContrast(value, config.bg, 4.5);

  // Input validation
  if (key.startsWith('inputValidation.')) {
    if (key.includes('Background')) return config.surface;
    return value;
  }
  if (key.startsWith('inputOption.')) {
    if (hasAlpha(value)) return value;
    if (key.includes('Foreground')) return config.fg;
    return config.accent;
  }

  // Peek view
  if (key.startsWith('peekView')) {
    if (key.includes('background') || key.includes('Background')) {
      return config.surface;
    }
    if (key.includes('foreground') || key.includes('Foreground')) {
      return darkenForContrast(value, config.surface, 4.5);
    }
    if (key === 'peekView.border') return config.accent;
    return value;
  }

  // Notifications
  if (key.startsWith('notification')) {
    if (key.includes('background') || key.includes('Background'))
      return config.surface;
    if (key.includes('foreground') || key.includes('Foreground'))
      return darkenForContrast(value, config.surface, 4.5);
    if (key.includes('border')) return config.border;
    return value;
  }

  // Menubar
  if (key.startsWith('menubar.')) {
    if (hasAlpha(value)) return value;
    if (key.includes('Foreground')) return config.fg;
    return config.accent;
  }

  // List filter widget
  if (key.startsWith('listFilter')) {
    if (key.includes('background') || key.includes('Background'))
      return config.bg;
    return config.accent;
  }

  // Minimap gutter
  if (key.startsWith('minimapGutter.')) {
    return darkenForContrast(value, config.surface, 3.0);
  }

  // Default: return as-is
  return value;
}

/**
 * Transform a token color for light mode
 */
function transformTokenColor(hexColor, config) {
  if (!hexColor || typeof hexColor !== 'string') return hexColor;
  return darkenForContrast(hexColor, config.bg, 4.5);
}

/**
 * Transform a de-emphasised token color (comments, operators, punctuation)
 */
function transformDeEmphasisedToken(hexColor, config) {
  if (!hexColor || typeof hexColor !== 'string') return hexColor;
  return darkenForContrast(hexColor, config.bg, 3.0);
}

const DE_EMPHASISED_RE =
  /comment|punctuation|bracket|separator|accessor|whitespace|indent|operator(?!.*keyword)/i;

/**
 * Generate a light theme from a dark theme
 */
function generateLightTheme(configKey) {
  const config = LIGHT_CONFIGS[configKey];
  const darkPath = path.join(
    __dirname,
    '..',
    'editors',
    'vscode',
    'themes',
    config.darkFile,
  );
  const dark = JSON.parse(fs.readFileSync(darkPath, 'utf8'));

  const light = {
    name: config.name,
    type: 'light',
    colors: {},
    tokenColors: [],
    semanticHighlighting: true,
    semanticTokenColors: {},
  };

  // Transform UI colors
  for (const [key, value] of Object.entries(dark.colors)) {
    light.colors[key] = transformUIColor(key, value, config);
  }

  // Transform tokenColors
  for (const rule of dark.tokenColors) {
    const newRule = { ...rule, settings: { ...rule.settings } };
    if (newRule.settings.foreground) {
      const name = (rule.name || '').toLowerCase();
      const scopes = Array.isArray(rule.scope)
        ? rule.scope.join(' ')
        : rule.scope || '';
      const isDeEmphasised =
        DE_EMPHASISED_RE.test(name) || DE_EMPHASISED_RE.test(scopes);

      if (isDeEmphasised) {
        newRule.settings.foreground = transformDeEmphasisedToken(
          newRule.settings.foreground,
          config,
        );
      } else {
        newRule.settings.foreground = transformTokenColor(
          newRule.settings.foreground,
          config,
        );
      }
    }
    if (newRule.settings.background) {
      // Token backgrounds (like invalid) — use light surface
      if (hasAlpha(newRule.settings.background)) {
        // keep
      } else {
        newRule.settings.background = config.surfaceDeep;
      }
    }
    light.tokenColors.push(newRule);
  }

  // Transform semanticTokenColors
  for (const [key, value] of Object.entries(dark.semanticTokenColors)) {
    const isDeEmphasised = DE_EMPHASISED_RE.test(key);
    if (typeof value === 'string') {
      light.semanticTokenColors[key] = isDeEmphasised
        ? transformDeEmphasisedToken(value, config)
        : transformTokenColor(value, config);
    } else if (typeof value === 'object' && value.foreground) {
      const newValue = { ...value };
      newValue.foreground = isDeEmphasised
        ? transformDeEmphasisedToken(value.foreground, config)
        : transformTokenColor(value.foreground, config);
      light.semanticTokenColors[key] = newValue;
    } else {
      light.semanticTokenColors[key] = value;
    }
  }

  // Write output
  const outPath = path.join(
    __dirname,
    '..',
    'editors',
    'vscode',
    'themes',
    config.lightFile,
  );
  fs.writeFileSync(outPath, JSON.stringify(light, null, 2) + '\n');
  console.log(`✔ Generated ${config.lightFile}`);
}

// Generate all light themes
for (const key of Object.keys(LIGHT_CONFIGS)) {
  generateLightTheme(key);
}
console.log('\nDone! Run tests to verify contrast.');
