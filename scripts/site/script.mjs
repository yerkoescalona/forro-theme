export const clientScript = (firstVariant, firstLang) => `
    /* ── mode toggle (dark/light) ─── */
    let activeMode = 'dark';
    const modeBtn = document.querySelector('.mode-toggle');
    const modeLabel = modeBtn.querySelector('.mode-label');

    function setMode(mode) {
      activeMode = mode;
      document.body.classList.toggle('light', mode === 'light');
      modeLabel.textContent = mode === 'dark' ? 'Light' : 'Dark';
      showBlock();
    }

    modeBtn.addEventListener('click', () => {
      setMode(activeMode === 'dark' ? 'light' : 'dark');
    });

    /* ── variant & language tab switching ─── */
    const container = document.querySelector('.code-container');
    const allBlocks = container.querySelectorAll('.code-block');

    let activeVariant = '${firstVariant}';
    let activeLang = '${firstLang}';

    function showBlock() {
      allBlocks.forEach(b => b.classList.remove('visible'));
      const target = container.querySelector(
        \`.code-block[data-mode="\${activeMode}"][data-variant="\${activeVariant}"][data-lang="\${activeLang}"]\`
      );
      if (target) target.classList.add('visible');
      container.dataset.activeVariant = activeVariant;
    }

    document.querySelectorAll('.variant-tab').forEach(btn => {
      btn.addEventListener('click', () => {
        document.querySelectorAll('.variant-tab').forEach(b => b.classList.remove('active'));
        btn.classList.add('active');
        activeVariant = btn.dataset.variant;
        showBlock();
      });
    });

    document.querySelectorAll('.lang-tab').forEach(btn => {
      btn.addEventListener('click', () => {
        document.querySelectorAll('.lang-tab').forEach(b => b.classList.remove('active'));
        btn.classList.add('active');
        activeLang = btn.dataset.lang;
        showBlock();
      });
    });

    showBlock();
`;
