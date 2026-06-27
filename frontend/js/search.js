/**
 * search.js - Handles searching, tab filtering, badges, lazy iframe loading,
 * and page-load batching for StudyPy resource cards.
 * 
 * Works seamlessly with both static HTML cards and dynamic cards loaded via links.js.
 */

function initSearch() {
  const searchInput = document.getElementById('search-input');
  const noResults = document.getElementById('no-results');
  const loadMoreBtn = document.getElementById('load-more-btn');
  const container = document.getElementById('tools-container');

  let tools = [];
  let filteredTools = [];
  let currentBatch = 0;
  const BATCH_SIZE = 12;

  const genreMap = {
    'html': 'html',
    'css': 'css',
    'responsive': 'responsive',
    'web development': 'webdev',
    'deployment': 'deployment',
    'javascript': 'javascript',
    'frameworks': 'framework',
    'devops': 'devops',
    'developer utilities': 'developer utilities',
    'ui components': 'ui component libraries',
    'creative kits': 'design inspiration assets',
    'ui component libraries': 'ui component libraries',
    'design inspiration & assets': 'design inspiration assets',
    'performance': 'performance',
    'testing': 'testing',
    'accessibility': 'accessibility',
    'macro architecture': 'macro architecture',
    'micro clean code': 'micro clean code',
    'business tech': 'business tech',
    'real-world outages': 'real-world outages',
    'the mind view': 'the mind view',
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
      
      const badgeContainer = document.createElement('div');
      badgeContainer.className = 'tools-badges';

      const primary = document.createElement('span');
      primary.className = 'badge badge--primary';
      primary.textContent = parts[0] ? parts[0].replace(/\b\w/g, c => c.toUpperCase()) : 'General';
      badgeContainer.appendChild(primary);

      parts.slice(1).forEach(sub => {
        const subBadge = document.createElement('span');
        subBadge.className = 'badge badge--sub';
        subBadge.textContent = sub.replace(/\b\w/g, c => c.toUpperCase());
        badgeContainer.appendChild(subBadge);
      });

      const titleLink = el.querySelector('.card-link');
      if (titleLink) el.insertBefore(badgeContainer, titleLink);
      else el.prepend(badgeContainer);
    });
  }

  function normalize(text = '') {
    return text.toString().toLowerCase().trim();
  }

  function filterTools() {
    const q = normalize(searchInput?.value || '');
    const genre = getActiveGenre();

    // Figure out which cards match the current filter/search
    filteredTools = tools.filter(el => {
      // Title: can be inside h2, or class ending with -card-name
      const titleEl = el.querySelector('h2, [class*="-card-name"]');
      const title = normalize(titleEl?.textContent || '');
      
      // Description: can be h5, p, or class ending with -card-desc
      const descEl = el.querySelector('h5, p, [class*="-card-desc"]');
      const desc = normalize(descEl?.textContent || '');

      const data = (el.dataset.genres || '').toLowerCase();
      const matchesSearch = q === '' || title.includes(q) || desc.includes(q);
      const matchesGenre = genre === 'all' || data.split(',').map(s => s.trim()).includes(genre);
      return matchesSearch && matchesGenre;
    });

    // Hide ALL cards first
    tools.forEach(el => el.style.display = 'none');

    if (!loadMoreBtn) {
      // Show ALL filtered tools if there's no "Load More" button on the page
      filteredTools.forEach(el => {
        el.style.display = '';
        const iframe = el.querySelector('iframe[data-src]');
        if (iframe) {
          iframe.src = iframe.dataset.src;
        }
      });
    } else {
      // Reset batch counter and show first batch
      currentBatch = 0;
      showNextBatch();
    }

    // Toggle visibility of category sections if they contain no visible cards
    document.querySelectorAll('.tools-section').forEach(section => {
      const sectionCards = Array.from(section.querySelectorAll('.Tools, .tool-card, .video-card, #tools-container > div > div'));
      if (sectionCards.length > 0) {
        const hasVisible = sectionCards.some(el => el.style.display !== 'none');
        section.style.display = hasVisible ? '' : 'none';
      }
    });

    if (noResults) {
      noResults.style.display = filteredTools.length === 0 ? 'block' : 'none';
    }
  }

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

  function setupTools() {
    // Select cards dynamically. Matches '.Tools', '.tool-card', '.video-card' (static/video) or immediate child divs of grid in tools-container
    tools = Array.from(document.querySelectorAll('.Tools, .tool-card, .video-card, #tools-container > div > div'));
    renderBadges();
    filterTools();
  }

  // Determine if we are on a dynamic page that has not loaded cards yet
  if (container && container.dataset.page) {
    // Check if cards are already in the DOM (e.g. from cached links rendered synchronously)
    const existingCards = container.querySelectorAll('.Tools, .tool-card, .video-card');
    if (existingCards.length > 0) {
      setupTools();
    }
    
    container.addEventListener('linksRendered', () => {
      setupTools();
    });
  } else {
    // Static page, or cards are already rendered in the DOM
    setupTools();
  }

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
      filterTools();
    });
  });

  updateActiveTab();
}

// Initialize immediately as script is loaded as type="module" (deferred by default)
initSearch();
