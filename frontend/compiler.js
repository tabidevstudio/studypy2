const BACKEND_URL = 'https://studypy-backend.onrender.com/run';

// CodeMirror 6 CDN modules
const CM_VERSION = '6.0.1';
const CM_MODULES = {
  codemirror:        'https://esm.sh/@codemirror/codemirror@6.0.1',
  view:              'https://esm.sh/@codemirror/view@6.36.3',
  state:             'https://esm.sh/@codemirror/state@6.5.2',
  commands:          'https://esm.sh/@codemirror/commands@6.8.1',
  language:          'https://esm.sh/@codemirror/language@6.11.0',
  langPython:        'https://esm.sh/@codemirror/lang-python@6.1.8',
  langJava:          'https://esm.sh/@codemirror/lang-java@6.0.1',
  langCpp:           'https://esm.sh/@codemirror/lang-cpp@6.0.2',
  langJs:            'https://esm.sh/@codemirror/lang-javascript@6.2.2',
  langPhp:           'https://esm.sh/@codemirror/lang-php@6.0.1',
  oneDark:           'https://esm.sh/@codemirror/theme-one-dark@6.1.2',
};

// Map compiler language id → CodeMirror language loader
const LANG_MAP = {
  'python-3.14':    'langPython',
  'openjdk-25':     'langJava',
  'g++-15':         'langCpp',
  'gcc-15':         'langCpp',
  'typescript-deno':'langJs',
  'php-8.5':        'langPhp',
};

async function loadCodeMirror(language) {
  const [
    { EditorView, keymap, lineNumbers, highlightActiveLine, drawSelection },
    { EditorState },
    { defaultKeymap, historyKeymap, history, indentWithTab },
    { foldGutter, foldKeymap, syntaxHighlighting, defaultHighlightStyle, bracketMatching },
    { closeBrackets, closeBracketsKeymap },
    { oneDark },
  ] = await Promise.all([
    import('https://esm.sh/@codemirror/view@6.36.3'),
    import('https://esm.sh/@codemirror/state@6.5.2'),
    import('https://esm.sh/@codemirror/commands@6.8.1'),
    import('https://esm.sh/@codemirror/language@6.11.0'),
    import('https://esm.sh/@codemirror/autocomplete@6.16.3'),
    import('https://esm.sh/@codemirror/theme-one-dark@6.1.2'),
  ]);

  // Load language support
  const langKey = LANG_MAP[language];
  let langExtension = [];
  if (langKey) {
    try {
      if (langKey === 'langPython') {
        const { python } = await import('https://esm.sh/@codemirror/lang-python@6.1.6');
        langExtension = [python()];
      } else if (langKey === 'langJava') {
        const { java } = await import('https://esm.sh/@codemirror/lang-java@6.0.1');
        langExtension = [java()];
      } else if (langKey === 'langCpp') {
        const { cpp } = await import('https://esm.sh/@codemirror/lang-cpp@6.0.2');
        langExtension = [cpp()];
      } else if (langKey === 'langJs') {
        const { javascript } = await import('https://esm.sh/@codemirror/lang-javascript@6.2.2');
        langExtension = [javascript()];
      } else if (langKey === 'langPhp') {
        const { php } = await import('https://esm.sh/@codemirror/lang-php@6.0.1');
        langExtension = [php()];
      }
    } catch (e) {
      console.warn('Language support failed to load:', e);
    }
  }

  return {
    EditorView, EditorState, keymap,
    lineNumbers, highlightActiveLine, drawSelection,
    defaultKeymap, historyKeymap, history, indentWithTab,
    foldGutter, foldKeymap,
    syntaxHighlighting, defaultHighlightStyle,
    bracketMatching, closeBrackets, closeBracketsKeymap,
    oneDark,
    langExtension,
  };
}

function initCompiler(config) {
  const { language, containerId, placeholder } = config;

  const container = document.getElementById(containerId);
  if (!container) return;

  const editorWrap = container.querySelector('.sp-compiler__editor-wrap');
  const stdinEl    = container.querySelector('.sp-compiler__stdin');
  const outputEl   = container.querySelector('.sp-compiler__output');
  const runBtn     = container.querySelector('.sp-btn-run');
  const clearBtn   = container.querySelector('.sp-btn-clear');
  const statTime   = container.querySelector('.sp-stat-time');
  const statMem    = container.querySelector('.sp-stat-mem');
  const outputDot  = container.querySelector('.sp-output-dot');

  // Remove the old textarea — CodeMirror replaces it
  const oldTextarea = container.querySelector('.sp-compiler__textarea');
  if (oldTextarea) oldTextarea.remove();

  let editorView = null;

  // Load CodeMirror and initialize editor
  loadCodeMirror(language).then((cm) => {
    const {
      EditorView, EditorState, keymap,
      lineNumbers, highlightActiveLine, drawSelection,
      defaultKeymap, historyKeymap, history, indentWithTab,
      foldGutter, foldKeymap,
      syntaxHighlighting, defaultHighlightStyle,
      bracketMatching, closeBrackets, closeBracketsKeymap,
      oneDark, langExtension,
    } = cm;

    // StudyPY custom theme override on top of oneDark
    const studypyTheme = EditorView.theme({
      '&': {
        fontSize: '0.88rem',
        fontFamily: "'JetBrains Mono', 'Fira Code', monospace",
        background: '#0d1826',
      },
      '.cm-content': {
        padding: '1rem 0',
        minHeight: '200px',
        caretColor: '#38bdf8',
      },
      '.cm-gutters': {
        background: '#0a1120',
        borderRight: '1px solid #1e3148',
        color: '#3d5a7a',
      },
      '.cm-activeLineGutter': {
        background: '#112236',
        color: '#38bdf8',
      },
      '.cm-activeLine': {
        background: '#0f1f33',
      },
      '.cm-cursor': {
        borderLeftColor: '#38bdf8',
      },
      '.cm-selectionBackground, ::selection': {
        background: '#1a3a5c !important',
      },
      '.cm-foldPlaceholder': {
        background: '#1e3148',
        border: 'none',
        color: '#38bdf8',
      },
      '&.cm-focused .cm-cursor': {
        borderLeftColor: '#38bdf8',
      },
      '&.cm-focused': {
        outline: 'none',
      },
      '.cm-scroller': {
        overflow: 'auto',
        maxHeight: '400px',
      },
    }, { dark: true });

    const startState = EditorState.create({
      doc: placeholder || '',
      extensions: [
        lineNumbers(),
        highlightActiveLine(),
        drawSelection(),
        history(),
        foldGutter(),
        bracketMatching(),
        closeBrackets(),
        syntaxHighlighting(defaultHighlightStyle, { fallback: true }),
        oneDark,
        studypyTheme,
        ...langExtension,
        keymap.of([
          ...closeBracketsKeymap,
          ...defaultKeymap,
          ...historyKeymap,
          ...foldKeymap,
          indentWithTab,
          // Ctrl+Enter to run
          {
            key: 'Ctrl-Enter',
            run: () => { runCode(); return true; },
          },
          {
            key: 'Mod-Enter',
            run: () => { runCode(); return true; },
          },
        ]),
        EditorView.lineWrapping,
      ],
    });

    editorView = new EditorView({
      state: startState,
      parent: editorWrap,
    });

    // Expose globally so examples.js can load code into this editor
    if (!window.__cmViews) window.__cmViews = {};
    window.__cmViews[containerId] = editorView;

  }).catch((err) => {
    // Fallback to plain textarea if CodeMirror fails
    console.warn('CodeMirror failed to load, falling back to textarea:', err);
    const ta = document.createElement('textarea');
    ta.className = 'sp-compiler__textarea';
    ta.spellcheck = false;
    ta.value = placeholder || '';
    editorWrap.appendChild(ta);
  });

  function getCode() {
    if (editorView) {
      return editorView.state.doc.toString().trim();
    }
    // fallback
    const ta = container.querySelector('.sp-compiler__textarea');
    return ta ? ta.value.trim() : '';
  }

  function setCode(code) {
    if (editorView) {
      editorView.dispatch({
        changes: { from: 0, to: editorView.state.doc.length, insert: code }
      });
    } else {
      const ta = container.querySelector('.sp-compiler__textarea');
      if (ta) ta.value = code;
    }
  }

  // Clear button
  clearBtn.addEventListener('click', () => {
    setCode(placeholder || '');
    if (stdinEl) stdinEl.value = '';
    setOutput('idle');
    if (statTime) statTime.classList.remove('visible');
    if (statMem)  statMem.classList.remove('visible');
  });

  // Run button
  runBtn.addEventListener('click', () => runCode());

  async function runCode() {
    const code  = getCode();
    const input = stdinEl ? stdinEl.value : '';

    if (!code) {
      setOutput('error', '⚠ Please write some code first.');
      return;
    }

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

      if (statTime) {
        statTime.textContent = `⏱ ${parseFloat(data.time || 0).toFixed(3)}s`;
        statTime.classList.add('visible');
      }
      if (statMem) {
        const kb = parseInt(data.memory || 0);
        statMem.textContent = `💾 ${kb >= 1024 ? (kb / 1024).toFixed(1) + ' MB' : kb + ' KB'}`;
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

// Bind to window to preserve global access when imported as an ES6 module
window.initCompiler = initCompiler;