import { getProfile, toggleBookmark, toggleWatched } from "./auth.js";

const isLocal = window.location.hostname === "localhost" || window.location.hostname === "127.0.0.1";
const BASE_URL = isLocal
  ? "http://localhost:3000"
  : "";

let loggedInUser = null;

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
        await new Promise(res => setTimeout(res, 3000)); // 3 seconds cooldown for retry
      } else {
        throw err;
      }
    }
  }
}

function showSkeletons(container, count = 6) {
  container.innerHTML = "";
  const grid = document.createElement("div");
  grid.style.cssText = "display:grid;grid-template-columns:repeat(auto-fill,minmax(300px,1fr));gap:1.5rem;margin-top:2rem;";

  for (let i = 0; i < count; i++) {
    const card = document.createElement("div");
    card.className = "skeleton-card";
    card.innerHTML = `
      <div class="skeleton-card-body">
        <div class="skeleton-line sk-title"></div>
        <div class="skeleton-line sk-desc"></div>
        <div class="skeleton-line sk-desc2"></div>
        <div class="skeleton-line sk-desc3"></div>
      </div>
      <div class="skeleton-card-footer">
        <div class="skeleton-line sk-btn"></div>
      </div>
    `;
    grid.appendChild(card);
  }

  container.appendChild(grid);
}

/**
 * Fires a "linksRendered" CustomEvent on the container element once cards
 * are in the DOM. search.js listens for this event to initialise filtering
 * AFTER the async fetch completes — fixing the DOMContentLoaded race condition.
 */
function dispatchRendered(container, pageName) {
  container.dispatchEvent(
    new CustomEvent("linksRendered", {
      bubbles: true,
      detail: { pageName }
    })
  );
}

function guessToolGenres(title, description) {
  const t = (title + " " + description).toLowerCase();
  const genres = [];

  // UI Components / Libraries
  if (
    t.includes("ui") ||
    t.includes("component") ||
    t.includes("library") ||
    t.includes("shadcn") ||
    t.includes("flowbite") ||
    t.includes("daisy") ||
    t.includes("tailwind") ||
    t.includes("bootstrap") ||
    t.includes("hover") ||
    t.includes("design system")
  ) {
    genres.push("ui component libraries");
  }

  // Creative Kits / Design Assets
  if (
    t.includes("creative") ||
    t.includes("inspiration") ||
    t.includes("behance") ||
    t.includes("dribbble") ||
    t.includes("lottie") ||
    t.includes("asset") ||
    t.includes("vector") ||
    t.includes("illustration") ||
    t.includes("photo") ||
    t.includes("stock") ||
    t.includes("unsplash") ||
    t.includes("pexels") ||
    t.includes("design") ||
    t.includes("kit")
  ) {
    genres.push("design inspiration assets");
  }

  // Developer Utilities
  if (
    t.includes("utility") ||
    t.includes("tool") ||
    t.includes("compiler") ||
    t.includes("editor") ||
    t.includes("copilot") ||
    t.includes("ai") ||
    t.includes("codepen") ||
    t.includes("fiddle") ||
    t.includes("replit") ||
    t.includes("glitch") ||
    t.includes("responsively") ||
    t.includes("font") ||
    t.includes("regex") ||
    t.includes("json") ||
    t.includes("format") ||
    t.includes("debug") ||
    t.includes("git") ||
    t.includes("github") ||
    t.includes("observable")
  ) {
    genres.push("developer utilities");
  }

  // Fallback if none matched
  if (genres.length === 0) {
    genres.push("developer utilities");
  }

  return [...new Set(genres)].join(",");
}

function guessVideoGenres(title) {
  const t = title.toLowerCase();
  const genres = [];

  if (t.includes("html")) genres.push("html");
  if (t.includes("css") || t.includes("selectors")) genres.push("css");
  if (t.includes("flexbox") || t.includes("grid") || t.includes("responsive")) {
    genres.push("css", "responsive");
  }
  if (t.includes("javascript") || t.includes("js") || t.includes("dom") || t.includes("async")) genres.push("javascript");
  if (t.includes("react") || t.includes("hooks") || t.includes("framework")) genres.push("framework");

  // DevOps & Deployment
  if (t.includes("git") || t.includes("github") || t.includes("security") || t.includes("database") || t.includes("sql") || t.includes("mongodb") || t.includes("node") || t.includes("express") || t.includes("api")) {
    genres.push("devops");
  }
  if (t.includes("deploy") || t.includes("hosting") || t.includes("domain") || t.includes("cdn") || t.includes("cache")) {
    genres.push("deployment");
  }

  if (t.includes("performance") || t.includes("speed")) genres.push("performance");
  if (t.includes("testing") || t.includes("jest")) genres.push("testing");
  if (t.includes("accessibility") || t.includes("a11y")) genres.push("accessibility");

  // All videos are part of web development
  genres.push("webdev");

  return [...new Set(genres)].join(",");
}

const CACHE_KEY = "studypy_links_cache";

function extractLinksForPage(data, pageName) {
  return data?.categories
    ?.flatMap(category => category.pages)
    ?.find(page => page.name === pageName)
    ?.links ?? [];
}

function renderPageLinks(container, allLinks, pageName) {
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
      const isBookmarked = loggedInUser && loggedInUser.bookmarks.includes(link.url);
      const isWatched = loggedInUser && loggedInUser.watchedVideos.includes(link.url);

      const card = document.createElement("div");
      card.className = "video-card";
      card.dataset.genres = guessVideoGenres(link.title);
      card.innerHTML = `
        <div style="display:flex; justify-content:space-between; align-items:flex-start; gap:10px; width: 100%;">
          <a class="card-link" href="${link.url}" target="_blank" title="${link.title}">
            <h2>${link.title}</h2>
          </a>
          ${loggedInUser ? `
            <div class="premium-actions" style="display:flex; gap:12px; align-items:center;">
              <button class="watched-toggle-btn" data-url="${link.url}" style="background:none; border:none; cursor:pointer; font-size:1.45rem; color:${isWatched ? '#4cd137' : 'rgba(255,255,255,0.3)'}; transition:transform 0.2s;" title="${isWatched ? 'Mark as Unwatched' : 'Mark as Watched'}">
                <i class='bx ${isWatched ? "bxs-check-circle" : "bx-check-circle"}'></i>
              </button>
              <button class="bookmark-toggle-btn" data-path="${link.url}" style="background:none; border:none; cursor:pointer; font-size:1.45rem; color:${isBookmarked ? '#46a8f3' : 'rgba(255,255,255,0.3)'}; transition:transform 0.2s;" title="Bookmark">
                <i class='bx ${isBookmarked ? "bxs-bookmark" : "bx-bookmark"}'></i>
              </button>
            </div>
          ` : ''}
        </div>
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
    grid.className = (pageName === "fun-tools") ? "videos-grid" : gridClass;

    allLinks.forEach(link => {
      const card = document.createElement("div");
      card.className = (pageName === "fun-tools") ? "tool-card" : cardClass;
      card.dataset.genres = guessToolGenres(link.title, link.description);

      if (pageName === "fun-tools") {
        const genre = guessToolGenres(link.title, link.description).split(',')[0];
        const tagText = {
          "ui component libraries": "UI Components",
          "design inspiration assets": "Creative",
          "developer utilities": "Utilities"
        }[genre] || "Tool";

        // Construct clean filename for the preview image
        let filename = link.title.toLowerCase().replace(/[^a-z0-9]/g, "");
        if (filename === "shadcnui") filename = "shadcn";
        if (filename === "responsivelyapp") filename = "responsively";

        const isBookmarked = loggedInUser && loggedInUser.bookmarks.includes(link.url);

        card.innerHTML = `
          <div class="tool-card-content">
            <div style="display:flex; justify-content:space-between; align-items:center; width:100%; margin-bottom:8px;">
              <div class="tool-tag">${tagText}</div>
              ${loggedInUser ? `
                <button class="bookmark-toggle-btn" data-path="${link.url}" style="background:none; border:none; cursor:pointer; font-size:1.3rem; color:${isBookmarked ? '#46a8f3' : 'rgba(255,255,255,0.3)'}; transition:transform 0.2s;" title="Bookmark">
                  <i class='bx ${isBookmarked ? "bxs-bookmark" : "bx-bookmark"}'></i>
                </button>
              ` : ''}
            </div>
            <a class="card-link" href="${link.url}" target="_blank" rel="noopener noreferrer">
              <h2>${link.title}</h2>
            </a>
            <p>${link.description}</p>
            <img src="../../assets/website-previews/${filename}.png" alt="${link.title} preview" class="tool-image" onerror="this.style.display='none'">
          </div>
        `;
      } else {
        const isBookmarked = loggedInUser && loggedInUser.bookmarks.includes(link.url);

        card.innerHTML = `
          <div class="${cardBodyClass}">
            <div class="${cardNameClass}" style="display:flex; justify-content:space-between; align-items:flex-start; gap:8px;">
              <span>${link.title}</span>
              ${loggedInUser ? `
                <button class="bookmark-toggle-btn" data-path="${link.url}" style="background:none; border:none; cursor:pointer; font-size:1.3rem; color:${isBookmarked ? '#46a8f3' : 'rgba(255,255,255,0.25)'}; transition:transform 0.2s;" title="Bookmark">
                  <i class='bx ${isBookmarked ? "bxs-bookmark" : "bx-bookmark"}'></i>
                </button>
              ` : ''}
            </div>
            <div class="${cardDescClass}">${link.description}</div>
          </div>
          <div class="${cardFooterClass}">
            <a href="${link.url}" target="_blank" class="${btnClass}">Visit</a>
          </div>
        `;
      }
      grid.appendChild(card);
    });

    container.appendChild(grid);
  }

  // Bind event listeners for logged-in premium interactions
  if (loggedInUser) {
    container.querySelectorAll(".bookmark-toggle-btn").forEach(btn => {
      btn.addEventListener("click", async (e) => {
        e.preventDefault();
        e.stopPropagation();
        const path = btn.dataset.path;
        try {
          const res = await toggleBookmark(path);
          const isBookmarked = res.bookmarked;
          btn.style.color = isBookmarked ? '#46a8f3' : 'rgba(255,255,255,0.3)';
          const icon = btn.querySelector("i");
          if (icon) {
            icon.className = `bx ${isBookmarked ? "bxs-bookmark" : "bx-bookmark"}`;
          }
          loggedInUser.bookmarks = res.bookmarks;
        } catch (err) {
          console.error("Failed to toggle bookmark:", err);
        }
      });
    });

    container.querySelectorAll(".watched-toggle-btn").forEach(btn => {
      btn.addEventListener("click", async (e) => {
        e.preventDefault();
        e.stopPropagation();
        const url = btn.dataset.url;
        try {
          const res = await toggleWatched(url);
          const isWatched = res.watched;
          btn.style.color = isWatched ? '#4cd137' : 'rgba(255,255,255,0.3)';
          const icon = btn.querySelector("i");
          if (icon) {
            icon.className = `bx ${isWatched ? "bxs-check-circle" : "bx-check-circle"}`;
          }
          loggedInUser.watchedVideos = res.watchedVideos;
        } catch (err) {
          console.error("Failed to toggle watched video:", err);
        }
      });
    });
  }

  // Notify search.js (and any other listeners) that cards are now in the DOM
  dispatchRendered(container, pageName);
}

async function loadLinks() {
  const container = document.getElementById("tools-container");
  if (!container) return;

  const pageName = container.dataset.page;
  if (!pageName) {
    console.error("No data-page attribute set on #tools-container");
    return;
  }
    const UNDER_CONSTRUCTION_PAGES = [
        "interview-prep",
        "resume-building",
        "projectideas",
        "study-groups"
    ];
    if(UNDER_CONSTRUCTION_PAGES.includes(pageName)) {
        window.location.href = `/pages/503.html?page=${encodeURIComponent(pageName)}`;
        return;
    }


  // Check auth status first
  try {
    const authRes = await getProfile();
    if (authRes && authRes.authenticated) {
      loggedInUser = authRes.user;
    }
  } catch (authErr) {
    console.warn("Failed to retrieve profile:", authErr);
  }

  // Check if we have cached data in localStorage
  let cachedData = null;
  try {
    const rawCache = localStorage.getItem(CACHE_KEY);
    if (rawCache) {
      cachedData = JSON.parse(rawCache);
    }
  } catch (cacheErr) {
    console.warn("Failed to read links cache from localStorage:", cacheErr);
  }

  // If cache exists, render it immediately!
  if (cachedData) {
    console.log(`[Cache] Loading links for page: ${pageName} from localStorage...`);
    const cachedLinks = extractLinksForPage(cachedData, pageName);
    renderPageLinks(container, cachedLinks, pageName);
  } else {
    // If no cache, show loading skeletons
    showSkeletons(container);
  }

  // Perform background fetch (Revalidation)
  try {
    const freshData = await getLinks();

    // Save fresh data to localStorage cache
    try {
      localStorage.setItem(CACHE_KEY, JSON.stringify(freshData));
    } catch (saveErr) {
      console.warn("Failed to save links to localStorage cache:", saveErr);
    }

    const freshLinks = extractLinksForPage(freshData, pageName);

    // If cache was loaded, check if the links actually changed before updating the DOM (prevents layout shifts/flashes)
    if (cachedData) {
      const cachedLinks = extractLinksForPage(cachedData, pageName);
      if (JSON.stringify(cachedLinks) === JSON.stringify(freshLinks)) {
        console.log(`[Cache] Links for page: ${pageName} are up to date.`);
        return;
      }
      console.log(`[Cache] Cache outdated for page: ${pageName}, updating DOM with fresh database entries...`);
    }

    renderPageLinks(container, freshLinks, pageName);

  } catch (err) {
    console.error("Failed to load links from backend:", err);
    // If we don't have cached data, display the error block. If we do, we silently keep showing the cached data!
    if (!cachedData) {
      container.innerHTML = `
        <p>Failed to load links. The backend may be waking up — please refresh in a moment.</p>
        <p style="font-size:0.8em;color:gray;">Error: ${err.message}</p>
      `;
    }
  }
}

loadLinks();
