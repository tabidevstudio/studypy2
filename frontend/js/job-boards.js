const BASE_URL = window.location.hostname === "localhost" || window.location.hostname === "127.0.0.1"
  ? "http://localhost:3000"
  : "https://studypy-backend.onrender.com";

const jobsContainer = document.getElementById("jobs-container");
const jobCountEl = document.getElementById("job-count");
const searchInput = document.getElementById("job-search-input");
const filterType = document.getElementById("filter-type");

let selectedTech = "";
let selectedMode = "";
let cachedJobs = [];

const LOGO_GRADIENTS = [
    "linear-gradient(135deg, #1e3c72 0%, #2a5298 100%)",
    "linear-gradient(135deg, #0f2027 0%, #203a43 50%, #2c5364 100%)",
    "linear-gradient(135deg, #833ab4 0%, #fd1d1d 50%, #fcb045 100%)",
    "linear-gradient(135deg, #11998e 0%, #38ef7d 100%)",
    "linear-gradient(135deg, #8e2de2 0%, #4a00e0 100%)",
    "linear-gradient(135deg, #ff9966 0%, #ff5e62 100%)"
];

function getLogoStyle(companyName) {
    if (!companyName) return LOGO_GRADIENTS[0];
    let hash = 0;
    for (let i = 0; i < companyName.length; i++) {
        hash = companyName.charCodeAt(i) + ((hash << 5) - hash);
    }
    const index = Math.abs(hash) % LOGO_GRADIENTS.length;
    return LOGO_GRADIENTS[index];
}

function showLoadingSkeletons() {
    jobCountEl.textContent = "Updating listings...";
    jobsContainer.innerHTML = "";
    for (let i = 0; i < 4; i++) {
        const card = document.createElement("div");
        card.className = "tokyodev-job-card skeleton-card";
        card.innerHTML = `
            <div class="job-logo-box" style="background: rgba(255,255,255,0.03);"></div>
            <div class="job-content-box" style="width: 100%;">
                <div class="skeleton-line sk-title" style="width: 40%;"></div>
                <div class="skeleton-line sk-desc" style="width: 25%;"></div>
                <div class="skeleton-line sk-desc" style="width: 70%; margin-top: 8px;"></div>
                <div class="skeleton-line sk-desc2" style="width: 30%;"></div>
            </div>
            <div class="job-action-box" style="align-items: flex-end;">
                <div class="skeleton-line sk-btn" style="width: 60px;"></div>
                <div class="skeleton-line sk-btn" style="width: 90px; height: 32px; border-radius: 8px;"></div>
            </div>
        `;
        jobsContainer.appendChild(card);
    }
}

async function fetchJobs() {
    showLoadingSkeletons();

    const tech = selectedTech;
    const type = filterType.value;
    const mode = selectedMode;

    let queryParams = [];
    if (tech) queryParams.push(`tech=${encodeURIComponent(tech)}`);
    if (type) queryParams.push(`type=${encodeURIComponent(type)}`);
    if (mode) queryParams.push(`mode=${encodeURIComponent(mode)}`);

    const queryString = queryParams.length > 0 ? `?${queryParams.join("&")}` : "";

    try {
        const response = await fetch(`${BASE_URL}/api/jobs${queryString}`);
        if (!response.ok) {
            throw new Error(`Failed to load jobs: ${response.statusText}`);
        }
        const data = await response.json();
        cachedJobs = data.jobs || [];
        renderJobs(cachedJobs);
    } catch (err) {
        console.error("Jobs fetch error:", err);
        jobCountEl.textContent = "Error loading jobs";
        jobsContainer.innerHTML = `
            <div class="error-msg-box" style="grid-column: 1/-1; text-align: center; padding: 40px; color: rgba(255, 255, 255, 0.65);">
                <i class='bx bx-error-circle' style="font-size: 3rem; color: #f87171; margin-bottom: 10px;"></i>
                <p>Unable to fetch listings right now. Please try again later.</p>
                <span style="font-size: 0.8rem; color: gray;">Error: ${err.message}</span>
            </div>
        `;
    }
}

function renderJobs(jobs) {
    jobsContainer.innerHTML = "";

    const searchTerm = searchInput.value.toLowerCase().trim();
    let filteredJobs = jobs || [];

    if (searchTerm) {
        filteredJobs = filteredJobs.filter(job =>
            job.title.toLowerCase().includes(searchTerm) ||
            job.company.toLowerCase().includes(searchTerm) ||
            (job.description && job.description.toLowerCase().includes(searchTerm))
        );
    }

    jobCountEl.textContent = `${filteredJobs.length} roles found`;

    if (filteredJobs.length === 0) {
        jobsContainer.innerHTML = `
            <div style="text-align: center; padding: 60px; color: rgba(255, 255, 255, 0.5); width: 100%;">
                <i class='bx bx-search-alt' style="font-size: 3rem; margin-bottom: 10px; color: rgb(145, 218, 235);"></i>
                <h3>No jobs found matching these parameters.</h3>
                <p>Try clearing your search query or selecting a different technology.</p>
            </div>
        `;
        return;
    }

    filteredJobs.forEach(job => {
        const card = document.createElement("div");
        card.className = "tokyodev-job-card";

        const logoBackground = getLogoStyle(job.company);
        const firstLetter = (job.company || "?").charAt(0).toUpperCase();

        const dateStr = job.postedAt
            ? new Date(job.postedAt).toLocaleDateString("en-US", { month: "short", day: "numeric" })
            : "Recently";

        const salaryHTML = job.salary && job.salary.trim() !== ""
            ? `<div class="job-salary-tag"><i class='bx bx-money'></i> ${job.salary}</div>`
            : `<div class="job-salary-tag verified"><i class='bx bxs-badge-check'></i> Verified Role</div>`;

        let tagsHTML = `<span class="job-tag">${job.experienceLevel === "internship" ? "Internship" : "Entry Level"}</span>`;
        if (job.techTags && job.techTags.length > 0) {
            job.techTags.forEach(tag => {
                tagsHTML += `<span class="job-tag">${tag}</span>`;
            });
        }

        card.innerHTML = `
            <div class="job-logo-box" style="background: ${logoBackground}">
                ${firstLetter}
            </div>
            <div class="job-content-box">
                <div class="job-title-row">
                    <a href="${job.applyLink}" target="_blank" rel="noopener noreferrer">${job.title}</a>
                    <span class="company-name">${job.company}</span>
                </div>
                <div class="job-meta-row">
                    <span><i class='bx bx-map'></i> ${job.location}</span>
                </div>
                <div class="job-snippet">
                    ${job.description || "Click apply to view full role descriptions and requirements."}
                </div>
                <div class="job-tags-row">
                    ${tagsHTML}
                </div>
            </div>
            <div class="job-action-box">
                ${salaryHTML}
                <span class="job-date"><i class='bx bx-calendar'></i> ${dateStr}</span>
                <a href="${job.applyLink}" target="_blank" class="job-apply-btn" rel="noopener noreferrer">
                    Apply <i class='bx bx-right-arrow-alt'></i>
                </a>
            </div>
        `;
        jobsContainer.appendChild(card);
    });
}

document.querySelectorAll(".tech-pill").forEach(button => {
    button.addEventListener("click", () => {
        document.querySelectorAll(".tech-pill").forEach(b => b.classList.remove("active"));
        button.classList.add("active");
        selectedTech = button.dataset.tech;
        fetchJobs();
    });
});

document.querySelectorAll(".toggle-btn").forEach(button => {
    button.addEventListener("click", () => {
        document.querySelectorAll(".toggle-btn").forEach(b => b.classList.remove("active"));
        button.classList.add("active");
        selectedMode = button.dataset.mode;
        fetchJobs();
    });
});

searchInput.addEventListener("input", () => {
    renderJobs(cachedJobs);
});

filterType.addEventListener("change", fetchJobs);

fetchJobs();
