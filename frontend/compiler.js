
const SOCKET_URL = 'https://api.onlinecompiler.io';
const WS_API_KEY = 'cd22da454b84af78a75a9975b3e4ff52';

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

  let socket   = null;
  let isRunning = false;

  // Set placeholder starter code
  if (placeholder && textarea) {
    textarea.value = placeholder;
  }

  // Tab key inserts spaces
  textarea.addEventListener('keydown', (e) => {
    if (e.key === 'Tab') {
      e.preventDefault();
      const start = textarea.selectionStart;
      const end   = textarea.selectionEnd;
      textarea.value = textarea.value.substring(0, start) + '    ' + textarea.value.substring(end);
      textarea.selectionStart = textarea.selectionEnd = start + 4;
    }
  });

  // Ctrl+Enter shortcut
  textarea.addEventListener('keydown', (e) => {
    if ((e.ctrlKey || e.metaKey) && e.key === 'Enter') runCode();
  });

  // Clear button
  clearBtn.addEventListener('click', () => {
    textarea.value = placeholder || '';
    if (stdinEl) stdinEl.value = '';
    setOutput('idle');
    if (statTime) statTime.classList.remove('visible');
    if (statMem)  statMem.classList.remove('visible');
  });

  // Run button — toggles between Run and Stop
  runBtn.addEventListener('click', () => {
    if (isRunning) stopCode();
    else runCode();
  });

  function loadSocketIO(callback) {
    if (window.io) { callback(); return; }
    const s = document.createElement('script');
    s.src = 'https://cdnjs.cloudflare.com/ajax/libs/socket.io/4.7.5/socket.io.min.js';
    s.onload = callback;
    document.head.appendChild(s);
  }

  function runCode() {
    const code  = textarea.value.trim();
    const input = stdinEl ? stdinEl.value : '';

    if (!code) {
      setOutput('error', '⚠ Please write some code first.');
      return;
    }

    setOutput('loading');
    setRunBtn('stop');
    isRunning = true;
    if (statTime) statTime.classList.remove('visible');
    if (statMem)  statMem.classList.remove('visible');

    loadSocketIO(() => {
      if (socket) socket.disconnect();


      socket = io(SOCKET_URL, {
        auth: { token: WS_API_KEY },
        transports: ['websocket'],
      });

      const startTime = Date.now();

      socket.on('connect', () => {
        socket.emit('runcode', {
          api_key:  WS_API_KEY,
          compiler: language,
          code:     code,
          input:    input,
        });
        outputEl.classList.remove('is-loading');
        outputEl.textContent = '';
        outputDot.classList.remove('loading');
        outputDot.classList.add('running');
      });

      socket.on('codeoutput', (result) => {
        const elapsed = ((Date.now() - startTime) / 1000).toFixed(3);

        if (result.error && result.error.trim()) {
          setOutput('error', result.error.trim());
        } else {
          setOutput('success', result.output || '(no output)');
        }

        if (statTime) {
          statTime.textContent = `⏱ ${result.time || elapsed}s`;
          statTime.classList.add('visible');
        }
        if (statMem && result.memory) {
          const kb = parseInt(result.memory);
          statMem.textContent = `💾 ${kb >= 1024 ? (kb / 1024).toFixed(1) + ' MB' : kb + ' KB'}`;
          statMem.classList.add('visible');
        }

        setRunBtn('run');
        isRunning = false;
        socket.disconnect();
      });

      socket.on('connect_error', (err) => {
        setOutput('error', `❌ Could not connect to compiler.\n\n${err.message}`);
        setRunBtn('run');
        isRunning = false;
      });

      socket.on('disconnect', () => {
        if (isRunning) {
          setRunBtn('run');
          isRunning = false;
        }
      });
    });
  }

  function stopCode() {
    if (socket) socket.disconnect();
    setOutput('error', '⛔ Execution stopped.');
    setRunBtn('run');
    isRunning = false;
  }

  function setRunBtn(state) {
    if (state === 'stop') {
      runBtn.innerHTML = `<svg viewBox="0 0 16 16"><rect x="3" y="3" width="10" height="10" rx="1"/></svg> Stop`;
      runBtn.style.background = '#f87171';
      runBtn.style.color = '#fff';
    } else {
      runBtn.innerHTML = `<svg viewBox="0 0 16 16"><path d="M3 2l10 6-10 6V2z"/></svg> Run`;
      runBtn.style.background = '';
      runBtn.style.color = '';
    }
  }

  function setOutput(state, text) {
    outputEl.classList.remove('is-empty', 'is-error', 'is-success', 'is-loading');
    outputDot.classList.remove('success', 'error', 'loading', 'running');

    switch (state) {
      case 'idle':
        outputEl.classList.add('is-empty');
        outputEl.textContent = 'Output will appear here...';
        break;
      case 'loading':
        outputEl.classList.add('is-loading');
        outputEl.textContent = 'Connecting';
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
