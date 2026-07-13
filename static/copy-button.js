document.addEventListener('DOMContentLoaded', () => {
  document.querySelectorAll('pre').forEach(pre => {
    const btn = document.createElement('button');
    btn.className = 'copy-btn';
    btn.textContent = 'Copy';
    btn.addEventListener('click', async () => {
      const code = pre.querySelector('code');
      if (!code) return;
      try { await navigator.clipboard.writeText(code.textContent); btn.textContent = 'Copied'; setTimeout(() => { btn.textContent = 'Copy'; }, 2000); } catch {}
    });
    pre.appendChild(btn);
  });
});
