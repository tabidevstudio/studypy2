const BASE_URL = "https://studypy-backend.onrender.com";

function getCardPrefix(pageName) {
  const prefixes = {
    "interview-prep": "career",
    "job-boards": "career",
    "resume-building": "career",
    "coding-problems": "challenge",
    "competition": "challenge",
    "projectideas": "challenge",
    "discord-servers": "community",
    "forums": "community",
    "study-groups": "community",
    "debugging-tools": "tools",
    "version-control": "tools",
    "fun-tools": "tools",
    "ides": "tools",
    "official-docs": "docs",
    "video-tutorials": "learning",
    "interactive-coding": "learning",
    "book-and-ebooks": "learning",
    "online-courses": "learning"
  };
  return prefixes[pageName] || "tools";
}

// Retries the fetch once to handle Render cold starts (free tier spins down after inactivity)
async function getLinks(retries = 1) {
  for (let attempt = 0; attempt <= retries; attempt++) {
    try {
      const response = await fetch(`${BASE_URL}/links`);
      if (!response.ok) {
        throw new Error(`Server returned ${response.status}: ${response.statusText}`);
      }
      return await response.json();
    } catch (err) {
      if (attempt < retries) {
        console.warn(`Fetch attempt ${attempt + 1} failed, retrying...`, err.message);
        await new Promise(res => setTimeout(res, 3000)); // 3 seconds cooldown for retry b
      } else {
        throw err;
      }
    }
  }
}

function showSkeletons(container, count = 6) {
  container.innerHTML = "";
  const grid = document.createElement("div");
  // Temporarily use a generic grid style while loading
  grid.style.cssText = "display:grid;grid-template-columns:repeat(auto-fill,minmax(260px,1fr));gap:1rem;";

  for (let i = 0; i < count; i++) {
    const card = document.createElement("div");
    card.className = "skeleton-card";
    card.innerHTML = `
      <div class="skeleton-line sk-title"></div>
      <div class="skeleton-line sk-desc"></div>
      <div class="skeleton-line sk-desc2"></div>
      <div class="skeleton-line sk-desc3"></div>
      <div class="skeleton-line sk-btn"></div>
    `;
    grid.appendChild(card);
  }

  container.appendChild(grid);
}

async function loadLinks() {
  const container = document.getElementById("tools-container");
  if (!container) return;

  const pageName = container.dataset.page;
  if (!pageName) {
    console.error("No data-page attribute set on #tools-container");
    return;
  }

  // Show loading skeletons while fetching data
 showSkeletons(container);

  try {
    const data = await getLinks();

    const allLinks = data.categories
      .flatMap(category => category.pages)
      .find(page => page.name === pageName)
      ?.links ?? [];

    // Clear loading message
    container.innerHTML = "";

    if (allLinks.length === 0) {
      container.innerHTML = "<p>No links found for this page.</p>";
      return;
    }

    // Special handling for video tutorials with embedded iframes
    if (pageName === "video-tutorials") {
      const grid = document.createElement("div");
      grid.className = "learning-grid";

      allLinks.forEach(link => {
        const card = document.createElement("div");
        card.className = "Tools";
        card.innerHTML = `
          <a class="card-link" href="${link.url}" target="_blank" title="${link.title}">
            <h2>${link.title}</h2>
          </a>
          <div class="video-preview">
            <iframe data-src="${link.url}" title="${link.title}" allowfullscreen></iframe>
          </div>
          <h5>${link.description}</h5>
        `;
        grid.appendChild(card);
      });

      container.appendChild(grid);
    } else {
      // Regular card rendering for other pages
      const prefix = getCardPrefix(pageName);
      const gridClass = `${prefix}-grid`;
      const cardClass = `${prefix}-card`;
      const cardBodyClass = `${prefix}-card-body`;
      const cardNameClass = `${prefix}-card-name`;
      const cardDescClass = `${prefix}-card-desc`;
      const cardFooterClass = `${prefix}-card-footer`;
      const btnClass = `${prefix}-btn-visit`;

      const grid = document.createElement("div");
      grid.className = gridClass;

      allLinks.forEach(link => {
        const card = document.createElement("div");
        card.className = cardClass;
        card.innerHTML = `
          <div class="${cardBodyClass}">
            <div class="${cardNameClass}">${link.title}</div>
            <div class="${cardDescClass}">${link.description}</div>
          </div>
          <div class="${cardFooterClass}">
            <a href="${link.url}" target="_blank" class="${btnClass}">Visit</a>
          </div>
        `;
        grid.appendChild(card);
      });

      container.appendChild(grid);
    }

  } catch (err) {
    console.error("Failed to load links:", err);
    container.innerHTML = `
      <p>Failed to load links. The backend may be waking up — please refresh in a moment.</p>
      <p style="font-size:0.8em;color:gray;">Error: ${err.message}</p>
    `;
  }
}

loadLinks();