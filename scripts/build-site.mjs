#!/usr/bin/env node
/**
 * Generates docs/index.html — a GitHub Pages showcase for Forró theme.
 * Uses Shiki to render syntax-highlighted code with the actual theme colours.
 *
 * Usage:  node scripts/build-site.mjs
 */

import { readFileSync, mkdirSync, writeFileSync } from "node:fs";
import { join, dirname } from "node:path";
import { fileURLToPath } from "node:url";
import { createHighlighter } from "shiki";

import { variants, lightVariants, languages, variantDescription } from "./site/data.mjs";
import { html } from "./site/template.mjs";

const __dirname = dirname(fileURLToPath(import.meta.url));
const ROOT = join(__dirname, "..");
const THEMES_DIR = join(ROOT, "editors", "vscode", "themes");
const SAMPLES_DIR = join(__dirname, "site", "samples");
const OUT_DIR = join(ROOT, "site");

/* ── load samples from native files ────────────────────────────────── */
const samples = {
  python: readFileSync(join(SAMPLES_DIR, "python.py"), "utf-8"),
  javascript: readFileSync(join(SAMPLES_DIR, "javascript.js"), "utf-8"),
  cpp: readFileSync(join(SAMPLES_DIR, "cpp.cpp"), "utf-8"),
};

/* ── load themes ───────────────────────────────────────────────────── */
const themes = variants.map((v) => {
  const raw = JSON.parse(readFileSync(join(THEMES_DIR, v.file), "utf-8"));
  return { ...v, theme: raw, bg: raw.colors?.["editor.background"] ?? "#1A1A1A" };
});

const lightThemes = lightVariants.map((v) => {
  const raw = JSON.parse(readFileSync(join(THEMES_DIR, v.file), "utf-8"));
  return { ...v, theme: raw, bg: raw.colors?.["editor.background"] ?? "#FAF5EC" };
});

/* ── build highlighted code blocks ─────────────────────────────────── */
async function buildCodeBlocks() {
  const allThemeObjects = [
    ...themes.map((t) => t.theme),
    ...lightThemes.map((t) => t.theme),
  ];
  const highlighter = await createHighlighter({
    themes: allThemeObjects,
    langs: ["python", "javascript", "cpp"],
  });

  const blocks = { dark: {}, light: {} };
  for (const t of themes) {
    blocks.dark[t.id] = {};
    for (const lang of languages) {
      blocks.dark[t.id][lang.id] = highlighter.codeToHtml(samples[lang.id], {
        lang: lang.lang,
        theme: t.theme.name,
      });
    }
  }
  for (const t of lightThemes) {
    blocks.light[t.id] = {};
    for (const lang of languages) {
      blocks.light[t.id][lang.id] = highlighter.codeToHtml(samples[lang.id], {
        lang: lang.lang,
        theme: t.theme.name,
      });
    }
  }
  return blocks;
}

/* ── main ──────────────────────────────────────────────────────────── */
async function main() {
  console.log("Building site...");
  const blocks = await buildCodeBlocks();
  const output = html({ themes, lightThemes, languages, blocks, variantDescription });
  mkdirSync(OUT_DIR, { recursive: true });
  writeFileSync(join(OUT_DIR, "index.html"), output, "utf-8");
  console.log(`✔ Written to site/index.html (${(output.length / 1024).toFixed(1)} KB)`);
}

main().catch((err) => {
  console.error(err);
  process.exit(1);
});
