const BACKEND_URL = 'https://studypy-backend.onrender.com/run';

function initCompiler(config) {
  const { language, containerId, placeholder } = config;

  const container = document.getElementById(containerId);
  if (!container) return;

  const textarea  = container.querySelector('.sp-compiler__textarea');
  const stdinEl   = container.querySelector('.sp-compiler__stdin');
  const outputEl  = container.querySelector('.sp-compiler__output');
  const runBtn    = container.querySelector('.sp-btn-run');
  const clearBtn  = container.querySelector('.sp-btn-clear');
  const statTime  = container.querySelector('.sp-stat-time');
  const statMem   = container.querySelector('.sp-stat-mem');
  const outputDot = container.querySelector('.sp-output-dot');

  if (placeholder && textarea) textarea.value = placeholder;

  textarea.addEventListener('keydown', (e) => {
    if (e.key === 'Tab') {
      e.preventDefault();
      const start = textarea.selectionStart;
      const end   = textarea.selectionEnd;
      textarea.value = textarea.value.substring(0, start) + '    ' + textarea.value.substring(end);
      textarea.selectionStart = textarea.selectionEnd = start + 4;
    }
  });

  textarea.addEventListener('keydown', (e) => {
    if ((e.ctrlKey || e.metaKey) && e.key === 'Enter') runCode();
  });

  clearBtn.addEventListener('click', () => {
    textarea.value = placeholder || '';
    if (stdinEl) stdinEl.value = '';
    setOutput('idle');
    if (statTime) statTime.classList.remove('visible');
    if (statMem)  statMem.classList.remove('visible');
  });

  runBtn.addEventListener('click', () => runCode());

  async function runCode() {
    const code  = textarea.value.trim();
    const input = stdinEl ? stdinEl.value : '';

    if (!code) { setOutput('error', '⚠ Please write some code first.'); return; }

    setOutput('loading');
    runBtn.disabled = true;
    if (statTime) statTime.classList.remove('visible');
    if (statMem)  statMem.classList.remove('visible');

    try {
      const res = await fetch(BACKEND_URL, {
        method:  'POST',
        headers: { 'Content-Type': 'application/json' },
        body:    JSON.stringify({ language, code, input }),
      });

      if (!res.ok) throw new Error(`Server error: ${res.status}`);
      const data = await res.json();

      if (statTime && data.time) {
        statTime.textContent = `⏱ ${parseFloat(data.time).toFixed(3)}s`;
        statTime.classList.add('visible');
      }
      if (statMem && data.memory) {
        const kb = parseInt(data.memory);
        statMem.textContent = `💾 ${kb >= 1024 ? (kb/1024).toFixed(1) + ' MB' : kb + ' KB'}`;
        statMem.classList.add('visible');
      }

      if (data.error && data.error.trim()) {
        setOutput('error', data.error.trim());
      } else {
        setOutput('success', data.output || '(no output)');
      }

    } catch (err) {
      setOutput('error', `❌ Could not reach the compiler server.\n\n${err.message}`);
    } finally {
      runBtn.disabled = false;
    }
  }

  function setOutput(state, text) {
    outputEl.classList.remove('is-empty', 'is-error', 'is-success', 'is-loading');
    outputDot.classList.remove('success', 'error', 'loading');
    switch (state) {
      case 'idle':
        outputEl.classList.add('is-empty');
        outputEl.textContent = 'Output will appear here...';
        break;
      case 'loading':
        outputEl.classList.add('is-loading');
        outputEl.textContent = 'Running';
        outputDot.classList.add('loading');
        break;
      case 'success':
        outputEl.classList.add('is-success');
        outputEl.textContent = text;
        outputDot.classList.add('success');
        break;
      case 'error':
        outputEl.classList.add('is-error');
        outputEl.textContent = text;
        outputDot.classList.add('error');
        break;
    }
  }
}