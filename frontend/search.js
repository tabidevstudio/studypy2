document.addEventListener('DOMContentLoaded', () => {
  const searchInput = document.getElementById('search-input');
  const tools = Array.from(document.querySelectorAll('.Tools'));
  const noResults = document.getElementById('no-results');
  const loadMoreBtn = document.getElementById('load-more-btn');

  const BATCH_SIZE = 12;
  let currentBatch = 0;
  let filteredTools = []; // tracks currently matching cards

  const genreMap = {
    'html': 'html',
    'css': 'css',
    'responsive': 'responsive',
    'web development': 'webdev',
    'deployment': 'deployment',
    'javascript': 'javascript',
    'frameworks': 'framework',
    'devops': 'devops',
    'developer utilities': 'devutils',
    'ui component libraries': 'ui',
    'design inspiration & assets': 'design',
    'performance': 'performance',
    'testing': 'testing',
    'accessibility': 'accessibility',
    'all': 'all'
  };

  function getActiveGenre() {
    const activeTab = document.querySelector('.tab.active');
    const tabText = (activeTab?.textContent || '').toLowerCase().trim();
    return genreMap[tabText] || 'all';
  }

  function renderBadges() {
    tools.forEach(el => {
      if (el.querySelector('.tools-badges')) return;
      const data = (el.dataset.genres || 'uncategorized').toLowerCase();
      const parts = data.split(',').map(s => s.trim()).filter(Boolean);
      const container = document.createElement('div');
      container.className = 'tools-badges';

      const primary = document.createElement('span');
      primary.className = 'badge badge--primary';
      primary.textContent = parts[0] ? parts[0].replace(/\b\w/g, c => c.toUpperCase()) : 'General';
      container.appendChild(primary);

      parts.slice(1).forEach(sub => {
        const subBadge = document.createElement('span');
        subBadge.className = 'badge badge--sub';
        subBadge.textContent = sub.replace(/\b\w/g, c => c.toUpperCase());
        container.appendChild(subBadge);
      });

      const titleLink = el.querySelector('.card-link');
      if (titleLink) el.insertBefore(container, titleLink);
      else el.prepend(container);
    });
  }

  renderBadges();

  function normalize(text = '') {
    return text.toString().toLowerCase().trim();
  }

  // ── UPDATED: filterTools now rebuilds filteredTools and resets batching ──
  function filterTools() {
    const q = normalize(searchInput?.value || '');
    const genre = getActiveGenre();

    // Step 1: figure out which cards match the current filter/search
    filteredTools = tools.filter(el => {
      const title = normalize(el.querySelector('h2')?.textContent || '');
      const desc = normalize(el.querySelector('h5')?.textContent || '');
      const data = (el.dataset.genres || '').toLowerCase();
      const matchesSearch = q === '' || title.includes(q) || desc.includes(q);
      const matchesGenre = genre === 'all' || data.split(',').map(s => s.trim()).includes(genre);
      return matchesSearch && matchesGenre;
    });

    // Step 2: hide ALL cards first
    tools.forEach(el => el.style.display = 'none');

    // Step 3: reset batch counter and show first batch
    currentBatch = 0;
    showNextBatch();

    if (noResults) noResults.style.display = filteredTools.length === 0 ? 'block' : 'none';
  }

  // ── NEW: reveals the next BATCH_SIZE cards from filteredTools ──
  function showNextBatch() {
    const start = currentBatch * BATCH_SIZE;
    const end = start + BATCH_SIZE;

    filteredTools.slice(start, end).forEach(el => {
      el.style.display = '';

      // Lazy load the iframe only when the card is revealed
      const iframe = el.querySelector('iframe[data-src]');
      if (iframe) {
        iframe.src = iframe.dataset.src;
      }
    });

    currentBatch++;

    // Show or hide the Load More button
    if (loadMoreBtn) {
      loadMoreBtn.style.display = end >= filteredTools.length ? 'none' : 'block';
    }
  }

  // ── NEW: Load More button click ──
  if (loadMoreBtn) {
    loadMoreBtn.addEventListener('click', showNextBatch);
  }

  if (searchInput) {
    searchInput.addEventListener('input', filterTools);
  }

  const tabButtons = document.querySelectorAll('.tab');

  function updateActiveTab() {
    tabButtons.forEach(btn => {
      const genre = genreMap[btn.textContent.trim().toLowerCase()] || 'all';
      if (genre === getActiveGenre()) {
        btn.classList.add('active');
      } else {
        btn.classList.remove('active');
      }
    });
  }

  tabButtons.forEach(button => {
    button.addEventListener('click', () => {
      tabButtons.forEach(btn => btn.classList.remove('active'));
      button.classList.add('active');
      filterTools(); // ← this now also resets load more automatically
    });
  });

  updateActiveTab();
  filterTools(); // ← initial load, shows first 6 cards
});
