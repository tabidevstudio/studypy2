

function initCompiler(config) {
  const {
    language,        
    containerId,     
    placeholder,    
    label,          
  } = config;

  const container  = document.getElementById(containerId);
  if (!container) return;

  const textarea   = container.querySelector('.sp-compiler__textarea');
  const stdinEl    = container.querySelector('.sp-compiler__stdin');
  const outputEl   = container.querySelector('.sp-compiler__output');
  const runBtn     = container.querySelector('.sp-btn-run');
  const clearBtn   = container.querySelector('.sp-btn-clear');
  const statTime   = container.querySelector('.sp-stat-time');
  const statMem    = container.querySelector('.sp-stat-mem');
  const outputDot  = container.querySelector('.sp-output-dot');

  // Set placeholder starter code
  if (placeholder && textarea) {
    textarea.value = placeholder;
  }

  // Tab key inserts spaces instead of leaving the field
  textarea.addEventListener('keydown', (e) => {
    if (e.key === 'Tab') {
      e.preventDefault();
      const start = textarea.selectionStart;
      const end   = textarea.selectionEnd;
      textarea.value = textarea.value.substring(0, start) + '    ' + textarea.value.substring(end);
      textarea.selectionStart = textarea.selectionEnd = start + 4;
    }
  });

  // Clear button
  clearBtn.addEventListener('click', () => {
    textarea.value  = placeholder || '';
    if (stdinEl) stdinEl.value = '';
    setOutput('idle');
  });

  // Run button
  runBtn.addEventListener('click', () => runCode());

  // Ctrl+Enter / Cmd+Enter shortcut
  textarea.addEventListener('keydown', (e) => {
    if ((e.ctrlKey || e.metaKey) && e.key === 'Enter') runCode();
  });

  async function runCode() {
    const code  = textarea.value.trim();
    const input = stdinEl ? stdinEl.value : '';

    if (!code) {
      setOutput('error', '⚠ Please write some code first.');
      return;
    }

    setOutput('loading');
    runBtn.disabled = true;

    try {
      const res = await fetch('http://localhost:3000/run', {
        method:  'POST',
        headers: { 'Content-Type': 'application/json' },
        body:    JSON.stringify({ language, code, input }),
      });

      if (!res.ok) throw new Error(`Server error: ${res.status}`);

      const data = await res.json();

      // Show stats
      if (statTime) {
        statTime.textContent = `⏱ ${parseFloat(data.time || 0).toFixed(3)}s`;
        statTime.classList.add('visible');
      }
      if (statMem) {
        const kb = parseInt(data.memory || 0);
        statMem.textContent = `💾 ${kb >= 1024 ? (kb/1024).toFixed(1) + ' MB' : kb + ' KB'}`;
        statMem.classList.add('visible');
      }

      if (data.error && data.error.trim()) {
        setOutput('error', data.error.trim());
      } else if (data.output !== undefined) {
        setOutput('success', data.output || '(no output)');
      } else {
        setOutput('error', JSON.stringify(data));
      }

    } catch (err) {
      setOutput('error', `❌ Could not reach the compiler server.\n\nMake sure your backend is running:\n  cd backend\n  node server.js\n\n(${err.message})`);
    } finally {
      runBtn.disabled = false;
    }
  }

  function setOutput(state, text) {
    outputEl.classList.remove('is-empty', 'is-error', 'is-success', 'is-loading');
    outputDot.classList.remove('success', 'error', 'loading');

    if (statTime) statTime.classList.remove('visible');
    if (statMem)  statMem.classList.remove('visible');

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
