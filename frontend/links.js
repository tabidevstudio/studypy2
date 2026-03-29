const BASE_URL = window.ENV_BASE_URL || "http://localhost:3000";

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

    allLinks.forEach(link => {
      const card = document.createElement("div");
      card.className = "Tools";
      card.innerHTML = `
        <a class="links" href="${link.url}" target="_blank">
          <h2>${link.title}</h2>
          <p>${link.description}</p>
        </a>
      `;
      container.appendChild(card);
    });

  } catch (err) {
    console.error("Failed to load links:", err);
    container.innerHTML = "<p>Failed to load links.</p>";
  }
}

loadLinks();