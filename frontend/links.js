const BASE_URL = "https://your-backend-name.onrender.com";

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

async function getLinks() {
  const response = await fetch(`${BASE_URL}/links`);
  if (!response.ok) throw new Error("Failed to fetch links");
  return response.json();
}

async function loadLinks() {
  const container = document.getElementById("tools-container");
  if (!container) return;

  const pageName = container.dataset.page;
  if (!pageName) {
    console.error("No data-page attribute set on #tools-container");
    return;
  }

  try {
    const data = await getLinks();

    const allLinks = data.categories
      .flatMap(category => category.pages)
      .find(page => page.name === pageName)
      ?.links ?? [];

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
    container.innerHTML = "<p>Failed to load links.</p>";
  }
}

loadLinks();