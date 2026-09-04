export const styles = `
    /* ── reset & variables ─────────────────────────────── */
    *, *::before, *::after { box-sizing: border-box; margin: 0; padding: 0; }

    :root {
      --bg: #140e08;
      --surface: #1e1510;
      --border: #3a2a1c;
      --text: #f2ddb0;
      --muted: #b89e7a;
      --accent: #c8622a;
      --accent-hover: #e8620a;
    }

    .light {
      --bg: #FAF5EC;
      --surface: #F0EBE2;
      --border: #D4CFC6;
      --text: #2A2018;
      --muted: #5A5040;
      --accent: #9E4A1A;
      --accent-hover: #c8622a;
    }

    html { scroll-behavior: smooth; }

    body {
      font-family: 'Space Grotesk', sans-serif;
      font-weight: 400;
      background: var(--bg);
      color: var(--text);
      line-height: 1.7;
      min-height: 100vh;
      font-size: 1rem;
    }

    a { color: var(--accent); text-decoration: none; }
    a:hover { text-decoration: underline; }

    /* ── layout ─────────────────────────────────────────── */
    .container { max-width: 1100px; margin: 0 auto; padding: 0 2rem; }

    /* ── header ─────────────────────────────────────────── */
    header {
      padding: 5rem 2rem 3rem;
      text-align: center;
      border-bottom: 1px solid var(--border);
      max-width: 1100px;
      margin: 0 auto;
    }
    .header-label {
      font-family: 'DM Mono', monospace;
      font-size: 0.75rem;
      letter-spacing: 0.2em;
      text-transform: uppercase;
      color: var(--muted);
      margin-bottom: 1rem;
    }
    header h1 {
      font-family: 'Playfair Display', serif;
      font-size: clamp(4rem, 12vw, 8rem);
      font-weight: 400;
      line-height: 1.0;
      color: var(--text);
      letter-spacing: -0.02em;
    }
    header h1 em {
      font-style: italic;
      color: var(--accent);
    }
    .subtitle {
      font-family: 'DM Mono', monospace;
      font-size: 0.85rem;
      letter-spacing: 0.05em;
      color: var(--muted);
      margin-top: 0.5rem;
    }
    header .tagline {
      font-size: 1.05rem;
      color: var(--muted);
      margin-top: 1.25rem;
      max-width: 600px;
      margin-inline: auto;
      line-height: 1.8;
    }

    /* ── badges ─────────────────────────────────────────── */
    .badges {
      display: flex;
      justify-content: center;
      gap: 0.5rem;
      margin-top: 1.75rem;
      flex-wrap: wrap;
    }
    .badge {
      display: inline-flex;
      align-items: center;
      gap: 0.35rem;
      padding: 0.3rem 0.85rem;
      border-radius: 2px;
      font-family: 'DM Mono', monospace;
      font-size: 0.72rem;
      letter-spacing: 0.12em;
      text-transform: uppercase;
      background: #261c12;
      border: 1px solid var(--border);
      color: var(--text);
    }
    .badge svg { width: 12px; height: 12px; flex-shrink: 0; }

    /* ── showcase ───────────────────────────────────────── */
    .showcase { padding: 4rem 0; }

    .section-title {
      text-align: center;
      margin-bottom: 2rem;
    }
    .section-title h2 {
      font-family: 'Playfair Display', serif;
      font-size: clamp(1.8rem, 4vw, 2.4rem);
      font-weight: 400;
      color: var(--text);
      margin-bottom: 0.6rem;
    }
    .section-title p {
      font-size: 1rem;
      color: var(--muted);
      max-width: 600px;
      margin-inline: auto;
      line-height: 1.8;
    }

    .tabs {
      display: flex;
      justify-content: center;
      gap: 0;
      flex-wrap: wrap;
      overflow-x: auto;
      scrollbar-width: none;
    }
    .tabs::-webkit-scrollbar { display: none; }
    .tab {
      padding: 0.8rem 1.4rem;
      font-family: 'DM Mono', monospace;
      font-size: 0.8rem;
      letter-spacing: 0.08em;
      text-transform: uppercase;
      cursor: pointer;
      color: var(--muted);
      border: none;
      border-bottom: 2px solid transparent;
      background: none;
      transition: all 0.2s;
      white-space: nowrap;
    }
    .tab:hover { color: var(--text); }
    .tab.active { color: var(--text); border-bottom-color: var(--accent); }

    .variant-tabs-row {
      margin-bottom: 0.5rem;
      border-bottom: 1px solid var(--border);
    }
    .lang-tabs-row { margin-bottom: 1.5rem; }

    .code-container {
      background: var(--surface);
      border: 1px solid var(--border);
      overflow: hidden;
      transition: background 0.2s ease;
    }
    .code-block { display: none; }
    .code-block.visible { display: block; }
    .code-block pre {
      padding: 2rem !important;
      margin: 0 !important;
      border-radius: 0 !important;
      font-size: 0.9rem;
      line-height: 1.8;
      overflow-x: auto;
    }
    .code-block code {
      font-family: 'DM Mono', "JetBrains Mono", "Fira Code", monospace;
      font-weight: 400;
    }

    /* ── mode toggle ───────────────────────────────────── */
    .mode-toggle {
      position: fixed;
      top: 1.25rem;
      right: 1.25rem;
      z-index: 100;
      display: flex;
      align-items: center;
      gap: 0.5rem;
      padding: 0.5rem 1rem;
      background: var(--surface);
      border: 1px solid var(--border);
      color: var(--text);
      font-family: 'DM Mono', monospace;
      font-size: 0.72rem;
      letter-spacing: 0.1em;
      text-transform: uppercase;
      cursor: pointer;
      transition: all 0.2s;
    }
    .mode-toggle:hover { border-color: var(--accent); }
    .mode-toggle svg { width: 16px; height: 16px; }
    .mode-toggle .icon-sun { display: none; }
    .mode-toggle .icon-moon { display: block; }
    .light .mode-toggle .icon-sun { display: block; }
    .light .mode-toggle .icon-moon { display: none; }

    /* ── features ───────────────────────────────────────── */
    .features { padding: 4rem 0; }

    .feature-grid {
      display: grid;
      grid-template-columns: repeat(auto-fill, minmax(260px, 1fr));
      gap: 1.5rem;
    }
    .feature-card {
      background: var(--surface);
      border: 1px solid var(--border);
      padding: 1.75rem;
      transition: border-color 0.2s;
    }
    .feature-card:hover { border-color: #5a3d28; }
    .feature-card .label {
      font-family: 'DM Mono', monospace;
      font-size: 0.72rem;
      letter-spacing: 0.15em;
      text-transform: uppercase;
      color: var(--accent);
      margin-bottom: 0.75rem;
    }
    .feature-card h3 {
      font-family: 'Playfair Display', serif;
      font-size: 1.2rem;
      font-weight: 400;
      color: var(--text);
      margin-bottom: 0.6rem;
    }
    .feature-card p {
      font-size: 0.95rem;
      color: var(--muted);
      line-height: 1.8;
    }

    /* ── variants list ─────────────────────────────────── */
    .variants { padding: 4rem 0; }

    .variant-list {
      display: grid;
      grid-template-columns: repeat(auto-fill, minmax(300px, 1fr));
      gap: 1rem;
    }
    .variant-item {
      display: flex;
      align-items: center;
      gap: 1.25rem;
      padding: 1.25rem 1.5rem;
      background: var(--surface);
      border: 1px solid var(--border);
      transition: border-color 0.2s;
    }
    .variant-item:hover { border-color: #5a3d28; }
    .variant-swatch {
      width: 44px;
      height: 44px;
      flex-shrink: 0;
      border: 1px solid rgba(255,255,255,0.06);
    }
    .light .variant-swatch {
      border: 1px solid rgba(0,0,0,0.08);
    }
    .variant-item strong {
      font-family: 'Playfair Display', serif;
      font-weight: 400;
      color: var(--text);
      font-size: 1.1rem;
      display: block;
    }
    .variant-item span {
      color: var(--muted);
      font-size: 0.9rem;
      display: block;
      margin-top: 0.25rem;
    }

    /* ── install ────────────────────────────────────────── */
    .install {
      padding: 4rem 0;
      text-align: center;
    }
    .install p {
      color: var(--muted);
      margin-bottom: 1.75rem;
      font-size: 1.05rem;
    }
    .install-btn {
      display: inline-flex;
      align-items: center;
      gap: 0.5rem;
      padding: 0.9rem 2.25rem;
      background: var(--accent);
      color: #fff;
      font-family: 'Space Grotesk', sans-serif;
      font-size: 1rem;
      font-weight: 500;
      transition: background 0.15s ease;
    }
    .install-btn:hover { background: var(--accent-hover); text-decoration: none; }
    .install code {
      display: block;
      margin-top: 1.5rem;
      padding: 0.9rem 1.5rem;
      background: var(--surface);
      border: 1px solid var(--border);
      font-family: 'DM Mono', monospace;
      font-size: 0.9rem;
      font-weight: 400;
      color: var(--text);
      max-width: 480px;
      margin-inline: auto;
    }

    /* ── footer ─────────────────────────────────────────── */
    footer {
      padding: 2.5rem 2rem;
      text-align: center;
      border-top: 1px solid var(--border);
      margin-top: 2rem;
    }
    footer p {
      font-family: 'DM Mono', monospace;
      font-size: 0.8rem;
      letter-spacing: 0.08em;
      color: var(--muted);
    }
    footer a { color: var(--text); }

    /* ── responsive ─────────────────────────────────────── */
    @media (max-width: 768px) {
      header { padding: 3rem 1.25rem 2rem; }
      header h1 { font-size: clamp(3rem, 10vw, 5rem); }
      .container { padding: 0 1.25rem; }
      .showcase, .features, .variants, .install { padding: 3rem 0; }
      .feature-grid, .variant-list { grid-template-columns: 1fr; }
      .code-block pre { padding: 1.25rem !important; font-size: 0.8rem; }
      .tab { padding: 0.6rem 0.9rem; font-size: 0.72rem; }
    }

    @media (max-width: 480px) {
      header h1 { font-size: 2rem; }
      .badges { gap: 0.35rem; }
      .badge { font-size: 0.55rem; padding: 0.2rem 0.5rem; }
      .code-block pre { padding: 1rem !important; font-size: 0.65rem; line-height: 1.6; }
      .variant-list { grid-template-columns: 1fr; }
      .variant-item { padding: 1rem; }
    }
`;
