/**
 * search-global.js - Handles global search input and dropdown results on index.html.
 */

const BASE_URL = window.location.hostname === "localhost" || window.location.hostname === "127.0.0.1"
  ? "http://localhost:3000"
  : "";

function initGlobalSearch() {
  const searchInput = document.getElementById("global-search-input");
  const dropdown = document.getElementById("global-search-dropdown");
  if (!searchInput || !dropdown) return;

  let debounceTimer;

  searchInput.addEventListener("input", () => {
    clearTimeout(debounceTimer);
    const query = searchInput.value.trim();

    if (!query) {
      dropdown.innerHTML = "";
      dropdown.style.display = "none";
      return;
    }

    debounceTimer = setTimeout(async () => {
      try {
        const response = await fetch(`${BASE_URL}/search?q=${encodeURIComponent(query)}`);
        if (!response.ok) {
          throw new Error(`Server returned ${response.status}`);
        }
        const data = await response.json();
        renderResults(data.results || []);
      } catch (err) {
        console.error("Global search error:", err);
        dropdown.innerHTML = `<div style="padding:12px 16px; color:#ff4d4d; font-size:13px;">Error loading results. Please try again.</div>`;
        dropdown.style.display = "block";
      }
    }, 250); // 250ms debounce
  });

  // Hide dropdown when clicking outside
  document.addEventListener("click", (e) => {
    if (!searchInput.contains(e.target) && !dropdown.contains(e.target)) {
      dropdown.style.display = "none";
    }
  });

  // Re-show dropdown on focus if input is not empty
  searchInput.addEventListener("focus", () => {
    if (searchInput.value.trim() && dropdown.children.length > 0) {
      dropdown.style.display = "block";
    }
  });

  function renderResults(results) {
    dropdown.innerHTML = "";

    if (results.length === 0) {
      dropdown.innerHTML = `<div style="padding:12px 16px; color:rgba(255,255,255,0.5); font-size:13px; text-align:center;">No resources found.</div>`;
      dropdown.style.display = "block";
      return;
    }

    results.forEach((link) => {
      const item = document.createElement("a");
      item.href = link.url;
      item.target = "_blank";
      item.className = "global-search-item";
      
      // Format the breadcrumb text nicely
      const cleanCategory = link.categoryName.replace(/-/g, ' ');
      const cleanPage = link.pageName.replace(/-/g, ' ');

      item.innerHTML = `
        <div class="search-item-title">${link.title}</div>
        <div class="search-item-desc">${link.description}</div>
        <div class="search-item-badge">${cleanCategory} &rsaquo; ${cleanPage}</div>
      `;
      dropdown.appendChild(item);
    });

    dropdown.style.display = "block";
  }
}

// Initialise on load
initGlobalSearch();
