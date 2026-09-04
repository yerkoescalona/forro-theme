import { styles } from "./styles.mjs";
import { clientScript } from "./script.mjs";

export function html({ themes, lightThemes, languages, blocks, variantDescription }) {
  const variantTabsHtml = themes
    .map(
      (t, i) =>
        `<button class="tab variant-tab${i === 0 ? " active" : ""}" data-variant="${t.id}">${t.label}</button>`,
    )
    .join("\n          ");

  const langTabsHtml = languages
    .map(
      (l, i) =>
        `<button class="tab lang-tab${i === 0 ? " active" : ""}" data-lang="${l.id}">${l.label}</button>`,
    )
    .join("\n          ");

  const darkBlocksHtml = themes
    .map((t) =>
      languages
        .map(
          (l) =>
            `<div class="code-block" data-mode="dark" data-variant="${t.id}" data-lang="${l.id}">${blocks.dark[t.id][l.id]}</div>`,
        )
        .join("\n"),
    )
    .join("\n");

  const lightBlocksHtml = lightThemes
    .map((t) =>
      languages
        .map(
          (l) =>
            `<div class="code-block" data-mode="light" data-variant="${t.id}" data-lang="${l.id}">${blocks.light[t.id][l.id]}</div>`,
        )
        .join("\n"),
    )
    .join("\n");

  const variantVarsDark = themes
    .map(
      (t) =>
        `  [data-active-variant="${t.id}"] { --showcase-bg: ${t.bg}; }`,
    )
    .join("\n");

  const variantVarsLight = lightThemes
    .map(
      (t) =>
        `  .light [data-active-variant="${t.id}"] { --showcase-bg: ${t.bg}; }`,
    )
    .join("\n");

  return `<!DOCTYPE html>
<html lang="en">
<head>
  <meta charset="utf-8">
  <meta name="viewport" content="width=device-width, initial-scale=1">
  <title>Forró — VS Code Theme</title>
  <meta name="description" content="Warm collective memory translated into code. 10 VS Code theme variants for intergenerational forró scenes, dance halls and late-night study.">
  <link href="https://fonts.googleapis.com/css2?family=Playfair+Display:ital,wght@0,400;0,700;1,400&family=DM+Mono:wght@300;400&family=Fraunces:ital,opsz,wght@0,9..144,300;1,9..144,300&family=Space+Grotesk:wght@300;400;500&display=swap" rel="stylesheet">
  <style>
${styles}
${variantVarsDark}
${variantVarsLight}
  </style>
</head>
<body>

  <button class="mode-toggle" aria-label="Toggle dark/light mode">
    <svg class="icon-moon" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2"><path d="M21 12.79A9 9 0 1111.21 3 7 7 0 0021 12.79z"/></svg>
    <svg class="icon-sun" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2"><circle cx="12" cy="12" r="5"/><line x1="12" y1="1" x2="12" y2="3"/><line x1="12" y1="21" x2="12" y2="23"/><line x1="4.22" y1="4.22" x2="5.64" y2="5.64"/><line x1="18.36" y1="18.36" x2="19.78" y2="19.78"/><line x1="1" y1="12" x2="3" y2="12"/><line x1="21" y1="12" x2="23" y2="12"/><line x1="4.22" y1="19.78" x2="5.64" y2="18.36"/><line x1="18.36" y1="5.64" x2="19.78" y2="4.22"/></svg>
    <span class="mode-label">Light</span>
  </button>

  <header>
    <div class="header-label">VS Code Color Theme</div>
    <h1>Forró</h1>
    <div class="subtitle">Theme</div>
    <p class="tagline">
      Warm collective memory translated into code,
      with Black northeastern roots, dance halls, migrant routes
      and intergenerational scenes carried across dark &amp; light variants.
    </p>
    <div class="badges">
      <span class="badge">WCAG 2.1 AA</span>
      <span class="badge">10 Variants</span>
      <span class="badge">884 Tests</span>
      <span class="badge">OKLCH</span>
    </div>
  </header>

  <section class="showcase" id="showcase">
    <div class="container">
      <div class="section-title">
        <h2>See it in action</h2>
        <p>Real syntax highlighting rendered from the actual theme files, with samples rooted in scenes, dancers, songs and communities that keep forró moving.</p>
      </div>
      <div class="tabs variant-tabs-row">
          ${variantTabsHtml}
      </div>
      <div class="tabs lang-tabs-row">
          ${langTabsHtml}
      </div>
      <div class="code-container" data-active-variant="${themes[0].id}">
        ${darkBlocksHtml}
        ${lightBlocksHtml}
      </div>
    </div>
  </section>

  <section class="variants" id="variants">
    <div class="container">
      <div class="section-title">
        <h2>Five variants, shared pulse</h2>
        <p>Each variant carries a different atmosphere — quiet rehearsal rooms, crowded dance floors, radios on the road and the calm after the party.</p>
      </div>
      <div class="variant-list">
        ${themes
          .map(
            (t) => `
        <div class="variant-item">
          <div class="variant-swatch" style="background: ${t.bg};"></div>
          <div>
            <strong>Forró ${t.label}</strong>
            <span>${variantDescription(t.id)}</span>
          </div>
        </div>`,
          )
          .join("")}
      </div>
    </div>
  </section>

  <section class="features" id="features">
    <div class="container">
      <div class="section-title">
        <h2>Crafted with care</h2>
      </div>
      <div class="feature-grid">
        <div class="feature-card">
          <div class="label">Accessibility</div>
          <h3>WCAG 2.1 AA Compliant</h3>
          <p>Every token meets contrast minimums — 4.5:1 for primary tokens, 3:1 for de-emphasised elements. Verified by 884 automated tests.</p>
        </div>
        <div class="feature-card">
          <div class="label">Color Science</div>
          <h3>OKLCH Perceptual Space</h3>
          <p>Contrast fixes are computed in OKLCH, adjusting only lightness to preserve the original hue and chroma of each color.</p>
        </div>
        <div class="feature-card">
          <div class="label">Quality</div>
          <h3>Tested on Every Commit</h3>
          <p>Pre-commit hooks run the full contrast test suite automatically. No regressions ship to the marketplace.</p>
        </div>
        <div class="feature-card">
          <div class="label">Culture</div>
          <h3>A Living Tradition</h3>
          <p>The showcase samples move through pioneers, women bandleaders, contemporary voices, migrant dance floors and collective gatherings instead of a single fixed canon.</p>
        </div>
      </div>
    </div>
  </section>

  <section class="install" id="install">
    <div class="container">
      <div class="section-title">
        <h2>Get started</h2>
      </div>
      <p>Install from the Visual Studio Code Marketplace</p>
      <a class="install-btn" href="https://marketplace.visualstudio.com/items?itemName=yerko-escalona.forro-theme">
        <svg width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2"><path d="M21 15v4a2 2 0 01-2 2H5a2 2 0 01-2-2v-4M7 10l5 5 5-5M12 15V3"/></svg>
        Install Extension
      </a>
      <code>ext install yerko-escalona.forro-theme</code>
    </div>
  </section>

  <footer>
    <div class="container">
      <p>
        MIT License &middot;
        <a href="https://github.com/yerko-escalona/forro-theme">GitHub</a> &middot;
        <a href="https://github.com/yerko-escalona/forro-theme/issues">Issues</a>
      </p>
    </div>
  </footer>

  <script>
${clientScript(themes[0].id, languages[0].id)}
  </script>

</body>
</html>`;
}
