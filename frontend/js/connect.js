/**
 * study-groups.js - Fetches and renders other communities (Reddit, Facebook,
 * LinkedIn, Telegram, Stack Overflow, blogs) from the /api/communities endpoint.
 *
 * Pattern mirrors job-boards.js and forum.js.
 */

const isLocal = window.location.hostname === "localhost" || window.location.hostname === "127.0.0.1";
const BASE_URL = isLocal ? "http://localhost:3000" : "";

// ── Platform display config ──────────────────────────────────────────────────
const PLATFORM_META = {
    reddit:        { label: "Reddit",        iconClass: "bxl-reddit",    colorClass: "icon-reddit"        },
    facebook:      { label: "Facebook",      iconClass: "bxl-facebook",  colorClass: "icon-facebook"      },
    linkedin:      { label: "LinkedIn",      iconClass: "bxl-linkedin",  colorClass: "icon-linkedin"      },
    telegram:      { label: "Telegram",      iconClass: "bxl-telegram",  colorClass: "icon-telegram"      },
    stackoverflow: { label: "Stack Overflow",iconClass: "bx-code-curly", colorClass: "icon-stackoverflow" },
    devto:         { label: "DEV Community", iconClass: "bx-pencil",     colorClass: "icon-devto"         },
    hashnode:      { label: "Hashnode",      iconClass: "bx-hash",       colorClass: "icon-hashnode"      },
    slack:         { label: "Slack",         iconClass: "bxl-slack",     colorClass: "icon-slack"         },
    other:         { label: "Other",         iconClass: "bx-group",      colorClass: "icon-other"         },
};

// ── State ────────────────────────────────────────────────────────────────────
let allCommunities = [];

// ── Render helpers ───────────────────────────────────────────────────────────
function renderSkeletons() {
    const root = document.getElementById("communities-root");
    if (!root) return;
    root.innerHTML = `
        <div class="skeleton-grid">
            ${Array(6).fill('<div class="skeleton-card"></div>').join("")}
        </div>`;
}

function renderError(message) {
    const root = document.getElementById("communities-root");
    if (!root) return;
    root.innerHTML = `
        <div class="state-box">
            <i class='bx bx-error-circle'></i>
            ${message}
        </div>`;
}

function buildCard(c) {
    const meta = PLATFORM_META[c.platform] || PLATFORM_META.other;
    const icon = c.icon ? c.icon : meta.iconClass;

    return `
        <div class="community-card" data-platform="${c.platform}">
            <div class="card-top">
                <div class="platform-icon ${meta.colorClass}">
                    <i class='bx ${icon}'></i>
                </div>
                <div class="card-name-wrap">
                    <div class="card-name">${c.name}</div>
                    <div class="card-platform-label">${meta.label}</div>
                </div>
                ${c.featured ? `<span class="badge-featured">Popular</span>` : ""}
            </div>
            <p class="card-desc">${c.description}</p>
            <div class="card-bottom">
                <span class="member-count">
                    <i class='bx bx-group'></i>
                    ${c.memberCount || "—"}
                </span>
                <a href="${c.url}" target="_blank" rel="noopener noreferrer" class="btn-visit">
                    Visit <i class='bx bx-right-top-arrow-circle'></i>
                </a>
            </div>
        </div>`;
}

function renderCommunities(communities) {
    const root = document.getElementById("communities-root");
    if (!root) return;

    if (!communities.length) {
        root.innerHTML = `
            <div class="state-box">
                <i class='bx bx-search-alt'></i>
                No communities found for this filter.
            </div>`;
        return;
    }

    // Group by platform — preserves sort order returned from the API
    const grouped = {};
    communities.forEach(c => {
        if (!grouped[c.platform]) grouped[c.platform] = [];
        grouped[c.platform].push(c);
    });

    root.innerHTML = Object.entries(grouped).map(([platform, items]) => {
        const meta = PLATFORM_META[platform] || PLATFORM_META.other;
        return `
            <div class="platform-section" data-section="${platform}">
                <p class="section-label">
                    <i class='bx ${meta.iconClass}'></i>
                    ${meta.label}
                </p>
                <div class="communities-grid">
                    ${items.map(buildCard).join("")}
                </div>
            </div>`;
    }).join("");
}

// ── Fetch from API ───────────────────────────────────────────────────────────
async function loadCommunities() {
    renderSkeletons();
    try {
        const res = await fetch(`${BASE_URL}/api/communities`);
        if (!res.ok) throw new Error(`Server responded with ${res.status}`);
        const data = await res.json();
        allCommunities = data.communities || [];
        renderCommunities(allCommunities);
    } catch (err) {
        console.error("Failed to load communities:", err);
        renderError("Failed to load communities. Please try again later.");
    }
}

// ── Filter logic ─────────────────────────────────────────────────────────────
function initFilterBar() {
    const filterBar = document.getElementById("filter-bar");
    if (!filterBar) return;

    filterBar.addEventListener("click", (e) => {
        const btn = e.target.closest(".filter-btn");
        if (!btn) return;

        document.querySelectorAll(".filter-btn").forEach(b => b.classList.remove("active"));
        btn.classList.add("active");

        const platform = btn.dataset.platform;
        if (platform === "all") {
            renderCommunities(allCommunities);
        } else {
            // "blogs" button maps to both devto and hashnode
            const filtered = allCommunities.filter(c =>
                platform === "devto"
                    ? (c.platform === "devto" || c.platform === "hashnode")
                    : c.platform === platform
            );
            renderCommunities(filtered);
        }
    });
}

// ── Boot ─────────────────────────────────────────────────────────────────────
initFilterBar();
loadCommunities();
