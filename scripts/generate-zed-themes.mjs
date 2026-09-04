#!/usr/bin/env node
/**
 * Generates editors/zed/themes/forro.json — a Zed theme family containing
 * all 10 Forró variants, derived from the VS Code theme JSON files.
 *
 * Usage:  node scripts/generate-zed-themes.mjs
 */

import { readFileSync, mkdirSync, writeFileSync } from 'node:fs';
import { join, dirname, relative } from 'node:path';
import { fileURLToPath, pathToFileURL } from 'node:url';

const __dirname = dirname(fileURLToPath(import.meta.url));
const ROOT = join(__dirname, '..');
const VSCODE_THEMES_DIR = join(ROOT, 'editors', 'vscode', 'themes');
const OUT_DIR = join(ROOT, 'editors', 'zed', 'themes');
const OUT_FILE = join(OUT_DIR, 'forro.json');

const FAMILY_NAME = 'Forró';
const AUTHOR = 'Yerko Escalona';

const VARIANTS = [
  { file: 'forro-roots-color-theme.json', name: 'Forró Roots', appearance: 'dark' },
  { file: 'forro-intimo-color-theme.json', name: 'Forró Íntimo', appearance: 'dark' },
  {
    file: 'forro-nordeste-vivo-color-theme.json',
    name: 'Forró Nordeste Vivo',
    appearance: 'dark',
  },
  {
    file: 'forro-pe-de-serra-color-theme.json',
    name: 'Forró Pé de Serra',
    appearance: 'dark',
  },
  { file: 'forro-pd-color-theme.json', name: 'Forró PD', appearance: 'dark' },
  {
    file: 'forro-roots-light-color-theme.json',
    name: 'Forró Roots Light',
    appearance: 'light',
  },
  {
    file: 'forro-intimo-light-color-theme.json',
    name: 'Forró Íntimo Light',
    appearance: 'light',
  },
  {
    file: 'forro-nordeste-vivo-light-color-theme.json',
    name: 'Forró Nordeste Vivo Light',
    appearance: 'light',
  },
  {
    file: 'forro-pe-de-serra-light-color-theme.json',
    name: 'Forró Pé de Serra Light',
    appearance: 'light',
  },
  { file: 'forro-pd-light-color-theme.json', name: 'Forró PD Light', appearance: 'light' },
];

/* ── color helpers ─────────────────────────────────────────────────── */

// Zed colors are RGBA hex (#rrggbbaa). VS Code colors are usually #rrggbb.
function ensureAlpha(hex) {
  const h = hex.replace('#', '');
  return `#${h.length === 6 ? `${h}ff` : h}`;
}

function withAlpha(hex, alphaHex) {
  const h = ensureAlpha(hex).slice(1, 7);
  return `#${h}${alphaHex}`;
}

function vsColor(theme, key) {
  const value = theme.colors[key];
  if (value === undefined) {
    throw new Error(`Theme is missing colors.${key}`);
  }
  return ensureAlpha(value);
}

function fontStyleOf(settings = {}) {
  const fs = (settings.fontStyle || '').toLowerCase();
  return {
    font_style: fs.includes('italic') ? 'italic' : null,
    font_weight: fs.includes('bold') ? 700 : null,
  };
}

// semanticTokenColors entries are either a hex string or
// `{ foreground, italic?, bold? }`.
function semanticStyle(theme, key) {
  const value = theme.semanticTokenColors?.[key];
  if (value === undefined) {
    throw new Error(`Theme is missing semanticTokenColors.${key}`);
  }
  if (typeof value === 'string') {
    return { color: ensureAlpha(value), font_style: null, font_weight: null };
  }
  return {
    color: value.foreground ? ensureAlpha(value.foreground) : null,
    font_style: value.italic ? 'italic' : null,
    font_weight: value.bold ? 700 : null,
  };
}

// Finds the first tokenColors entry whose `name` contains every keyword
// (case-insensitive). Theme `name` fields drift slightly between variants
// (e.g. "Punctuation — brackets" vs "Punctuation — brackets / delimiters"),
// so matching on keywords is more resilient than exact names.
function tokenStyle(theme, ...keywords) {
  const entry = (theme.tokenColors || []).find((tc) => {
    const name = (tc.name || '').toLowerCase();
    return keywords.every((kw) => name.includes(kw.toLowerCase()));
  });
  if (!entry) {
    throw new Error(`No tokenColors entry matching [${keywords.join(', ')}]`);
  }
  return {
    color: entry.settings?.foreground ? ensureAlpha(entry.settings.foreground) : null,
    ...fontStyleOf(entry.settings),
  };
}

/* ── players (collaboration cursors) ─────────────────────────────────── */

const PLAYER_COLOR_KEYS = [
  'terminal.ansiBlue',
  'terminal.ansiRed',
  'terminal.ansiGreen',
  'terminal.ansiYellow',
  'terminal.ansiMagenta',
  'terminal.ansiCyan',
  'terminal.ansiBrightBlue',
  'terminal.ansiBrightGreen',
];

function buildPlayers(theme) {
  return PLAYER_COLOR_KEYS.map((key) => {
    const color = vsColor(theme, key);
    return {
      cursor: color,
      background: color,
      selection: withAlpha(color, '3d'),
    };
  });
}

/* ── status colors (error/warning/.../git statuses) ──────────────────── */

function statusGroup(name, color) {
  return {
    [name]: color,
    [`${name}.background`]: withAlpha(color, '1a'),
    [`${name}.border`]: withAlpha(color, '33'),
  };
}

function buildStatusColors(theme) {
  const c = (key) => vsColor(theme, key);
  return {
    ...statusGroup('error', c('editorError.foreground')),
    ...statusGroup('warning', c('editorWarning.foreground')),
    ...statusGroup('info', c('editorInfo.foreground')),
    ...statusGroup('hint', c('editorHint.foreground')),
    ...statusGroup('success', c('gitDecoration.addedResourceForeground')),
    ...statusGroup('conflict', c('gitDecoration.conflictingResourceForeground')),
    ...statusGroup('created', c('gitDecoration.addedResourceForeground')),
    ...statusGroup('deleted', c('gitDecoration.deletedResourceForeground')),
    ...statusGroup('modified', c('gitDecoration.modifiedResourceForeground')),
    ...statusGroup('renamed', c('gitDecoration.modifiedResourceForeground')),
    ...statusGroup('hidden', c('descriptionForeground')),
    ...statusGroup('ignored', c('gitDecoration.ignoredResourceForeground')),
    ...statusGroup('predictive', c('descriptionForeground')),
    ...statusGroup('unreachable', c('gitDecoration.ignoredResourceForeground')),
  };
}

/* ── UI style ─────────────────────────────────────────────────────────── */

function buildStyle(theme) {
  const c = (key) => vsColor(theme, key);

  return {
    background: c('sideBar.background'),
    'background.appearance': 'opaque',

    border: c('panel.border'),
    'border.variant': c('sideBar.border'),
    'border.focused': c('focusBorder'),
    'border.selected': c('inputOption.activeBorder'),
    'border.transparent': '#00000000',
    'border.disabled': c('editorWhitespace.foreground'),

    'elevated_surface.background': c('dropdown.background'),
    'surface.background': c('sideBar.background'),

    'panel.background': c('sideBar.background'),
    'panel.focused_border': c('focusBorder'),
    'panel.indent_guide': c('editorIndentGuide.background'),
    'panel.indent_guide_active': c('editorIndentGuide.activeBackground'),
    'panel.indent_guide_hover': c('editorIndentGuide.activeBackground'),

    'pane.focused_border': c('focusBorder'),
    'pane_group.border': c('editorGroup.border'),

    'element.background': c('input.background'),
    'element.hover': c('list.hoverBackground'),
    'element.active': c('list.activeSelectionBackground'),
    'element.selected': c('list.activeSelectionBackground'),
    'element.disabled': c('input.background'),

    'ghost_element.background': '#00000000',
    'ghost_element.hover': c('list.hoverBackground'),
    'ghost_element.active': c('list.activeSelectionBackground'),
    'ghost_element.selected': c('list.activeSelectionBackground'),
    'ghost_element.disabled': '#00000000',

    'drop_target.background': c('editorGroup.dropBackground'),

    text: c('foreground'),
    'text.muted': c('descriptionForeground'),
    'text.placeholder': c('input.placeholderForeground'),
    'text.disabled': c('editorWhitespace.foreground'),
    'text.accent': c('textLink.foreground'),

    icon: c('icon.foreground'),
    'icon.muted': c('descriptionForeground'),
    'icon.disabled': c('editorWhitespace.foreground'),
    'icon.placeholder': c('input.placeholderForeground'),
    'icon.accent': c('textLink.foreground'),

    'status_bar.background': c('statusBar.background'),
    'title_bar.background': c('titleBar.activeBackground'),
    'title_bar.inactive_background': c('titleBar.inactiveBackground'),
    'toolbar.background': c('editorGroupHeader.tabsBackground'),
    'tab_bar.background': c('editorGroupHeader.tabsBackground'),
    'tab.active_background': c('tab.activeBackground'),
    'tab.inactive_background': c('tab.inactiveBackground'),

    'search.match_background': c('editor.findMatchHighlightBackground'),

    'scrollbar.thumb.background': c('scrollbarSlider.background'),
    'scrollbar.thumb.hover_background': c('scrollbarSlider.hoverBackground'),
    'scrollbar.thumb.border': c('scrollbarSlider.hoverBackground'),
    'scrollbar.track.background': '#00000000',
    'scrollbar.track.border': c('panel.border'),

    'editor.background': c('editor.background'),
    'editor.foreground': c('editor.foreground'),
    'editor.gutter.background': c('editorGutter.background'),
    'editor.subheader.background': c('sideBarSectionHeader.background'),
    'editor.active_line.background': c('editor.lineHighlightBackground'),
    'editor.highlighted_line.background': c('editor.lineHighlightBackground'),
    'editor.line_number': c('editorLineNumber.foreground'),
    'editor.active_line_number': c('editorLineNumber.activeForeground'),
    'editor.invisible': c('editorWhitespace.foreground'),
    'editor.wrap_guide': c('editorRuler.foreground'),
    'editor.active_wrap_guide': c('editorIndentGuide.activeBackground'),
    'editor.indent_guide': c('editorIndentGuide.background'),
    'editor.indent_guide_active': c('editorIndentGuide.activeBackground'),
    'editor.document_highlight.read_background': c('editor.wordHighlightBackground'),
    'editor.document_highlight.write_background': c('editor.wordHighlightStrongBackground'),
    'editor.document_highlight.bracket_background': c('editorBracketMatch.background'),

    'link_text.hover': c('textLink.activeForeground'),

    'terminal.background': c('terminal.background'),
    'terminal.foreground': c('terminal.foreground'),
    'terminal.bright_foreground': c('terminal.ansiBrightWhite'),
    'terminal.dim_foreground': c('terminal.ansiBrightBlack'),
    'terminal.ansi.black': c('terminal.ansiBlack'),
    'terminal.ansi.bright_black': c('terminal.ansiBrightBlack'),
    'terminal.ansi.dim_black': c('terminal.ansiBlack'),
    'terminal.ansi.red': c('terminal.ansiRed'),
    'terminal.ansi.bright_red': c('terminal.ansiBrightRed'),
    'terminal.ansi.dim_red': c('terminal.ansiRed'),
    'terminal.ansi.green': c('terminal.ansiGreen'),
    'terminal.ansi.bright_green': c('terminal.ansiBrightGreen'),
    'terminal.ansi.dim_green': c('terminal.ansiGreen'),
    'terminal.ansi.yellow': c('terminal.ansiYellow'),
    'terminal.ansi.bright_yellow': c('terminal.ansiBrightYellow'),
    'terminal.ansi.dim_yellow': c('terminal.ansiYellow'),
    'terminal.ansi.blue': c('terminal.ansiBlue'),
    'terminal.ansi.bright_blue': c('terminal.ansiBrightBlue'),
    'terminal.ansi.dim_blue': c('terminal.ansiBlue'),
    'terminal.ansi.magenta': c('terminal.ansiMagenta'),
    'terminal.ansi.bright_magenta': c('terminal.ansiBrightMagenta'),
    'terminal.ansi.dim_magenta': c('terminal.ansiMagenta'),
    'terminal.ansi.cyan': c('terminal.ansiCyan'),
    'terminal.ansi.bright_cyan': c('terminal.ansiBrightCyan'),
    'terminal.ansi.dim_cyan': c('terminal.ansiCyan'),
    'terminal.ansi.white': c('terminal.ansiWhite'),
    'terminal.ansi.bright_white': c('terminal.ansiBrightWhite'),
    'terminal.ansi.dim_white': c('terminal.ansiWhite'),

    players: buildPlayers(theme),

    ...buildStatusColors(theme),
  };
}

/* ── syntax (token) style ─────────────────────────────────────────────── */

function buildSyntax(theme) {
  const c = (key) => vsColor(theme, key);
  const sem = (key) => semanticStyle(theme, key);
  const tok = (...kw) => tokenStyle(theme, ...kw);
  const plain = (hex, extra = {}) => ({
    color: hex,
    font_style: null,
    font_weight: null,
    ...extra,
  });

  return {
    attribute: tok('decorator'),
    boolean: tok('boolean'),
    comment: sem('comment'),
    'comment.doc': tok('documentation'),
    constant: sem('variable.constant'),
    constructor: sem('function'),
    'diff.minus': plain(c('gitDecoration.deletedResourceForeground')),
    'diff.plus': plain(c('gitDecoration.addedResourceForeground')),
    embedded: plain(c('editor.foreground')),
    emphasis: tok('markdown', 'italic'),
    'emphasis.strong': tok('markdown', 'bold'),
    enum: sem('enum'),
    function: sem('function'),
    hint: plain(c('editorHint.foreground')),
    keyword: sem('keyword'),
    label: plain(c('textLink.foreground')),
    link_text: tok('markdown', 'link'),
    link_uri: sem('type'),
    namespace: sem('namespace'),
    number: sem('number'),
    operator: sem('operator'),
    predictive: plain(c('descriptionForeground'), { font_style: 'italic' }),
    preproc: sem('macro'),
    primary: plain(c('editor.foreground')),
    property: sem('property'),
    punctuation: tok('accessor'),
    'punctuation.bracket': tok('brackets'),
    'punctuation.delimiter': tok('accessor'),
    'punctuation.list_marker': tok('brackets'),
    'punctuation.markup': sem('property'),
    'punctuation.special': tok('escape'),
    selector: tok('css', 'selector'),
    'selector.pseudo': plain(c('textLink.foreground')),
    string: sem('string'),
    'string.escape': tok('escape'),
    'string.regex': tok('regular'),
    'string.special': tok('regular'),
    'string.special.symbol': sem('variable.defaultLibrary'),
    tag: tok('html', 'tags'),
    'text.literal': tok('markdown', 'inline'),
    title: tok('markdown', 'heading'),
    type: sem('type'),
    variable: sem('variable'),
    'variable.special': tok('this'),
    variant: sem('interface'),
  };
}

/* ── family assembly ──────────────────────────────────────────────────── */

export function generateFamily() {
  const themes = VARIANTS.map(({ file, name, appearance }) => {
    const theme = JSON.parse(readFileSync(join(VSCODE_THEMES_DIR, file), 'utf8'));
    return {
      name,
      appearance,
      style: {
        ...buildStyle(theme),
        syntax: buildSyntax(theme),
      },
    };
  });

  return {
    $schema: 'https://zed.dev/schema/themes/v0.2.0.json',
    name: FAMILY_NAME,
    author: AUTHOR,
    themes,
  };
}

function main() {
  const family = generateFamily();
  mkdirSync(OUT_DIR, { recursive: true });
  writeFileSync(OUT_FILE, `${JSON.stringify(family, null, 2)}\n`);
  console.log(`Written ${family.themes.length} themes to ${relative(ROOT, OUT_FILE)}`);
}

if (import.meta.url === pathToFileURL(process.argv[1] ?? '').href) {
  main();
}
