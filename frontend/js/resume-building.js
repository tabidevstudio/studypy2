import { getProfile, getResume, saveResume } from "../js/auth.js";

// ── State ─────────────────────────────────────────────────
let currentStep = 1;
let selectedTemplate = "";
let currentUser = null;
let isAuthenticated = false;
let skills = [];
let educationEntries = [];
let projectEntries = [];
let experienceEntries = [];
let certEntries = [];
let accentColor = "#91DAEB";

// ── Boot ──────────────────────────────────────────────────
async function init() {
    const profileRes = await getProfile();
    isAuthenticated = profileRes.authenticated;
    currentUser = profileRes.user || null;

    const promptWrap = document.getElementById("login-prompt-wrap");
    if (!isAuthenticated) {
        promptWrap.innerHTML = `
            <div class="login-prompt">
                <i class='bx bx-info-circle'></i>
                <span><a href="/pages/login.html">Log in</a> to save your resume to your profile and access it later.</span>
            </div>`;
        document.getElementById("btn-save-profile").disabled = true;
        document.getElementById("btn-save-profile").style.opacity = "0.4";
    }

    if (isAuthenticated && currentUser?.resume?.templateId) {
        loadSavedResume(currentUser.resume);
    } else {
        addEntry('education');
    }

    bindEvents();
}

function loadSavedResume(resume) {
    selectedTemplate = resume.templateId || "classic";
    accentColor = resume.accentColor || "#91DAEB";
    document.getElementById("accent-color-picker").value = accentColor;
    document.getElementById("color-swatch-display").style.background = accentColor;
    document.getElementById("font-select").value = resume.font || "poppins";
    document.getElementById("size-select").value = resume.pageSize || "A4";

    const pi = resume.personalInfo || {};
    setVal("f-name", pi.name);
    setVal("f-email", pi.email);
    setVal("f-phone", pi.phone);
    setVal("f-linkedin", pi.linkedin);
    setVal("f-github", pi.github);
    setVal("f-portfolio", pi.portfolio);
    setVal("f-summary", resume.summary);

    skills = resume.skills || [];
    renderSkillTags();

    educationEntries = resume.education || [];
    projectEntries = resume.projects || [];
    experienceEntries = resume.experience || [];
    certEntries = resume.certifications || [];

    renderEntries("education");
    renderEntries("projects");
    renderEntries("experience");
    renderEntries("certs");

    if (resume.lastSaved) {
        document.getElementById("last-saved-text").textContent =
            `Last saved: ${new Date(resume.lastSaved).toLocaleDateString("en-PH", { dateStyle: "medium" })}`;
    }

    // Mark template card as selected
    document.querySelectorAll(".template-card").forEach(c => {
        c.classList.toggle("selected", c.dataset.template === selectedTemplate);
    });
    document.getElementById("btn-step1-next").disabled = false;

    goToStep(2);
}

function setVal(id, val) {
    const el = document.getElementById(id);
    if (el && val) el.value = val;
}

// ── Event Binding ─────────────────────────────────────────
function bindEvents() {
    // Page Tabs
    document.querySelectorAll(".page-tab-btn").forEach(btn => {
        btn.addEventListener("click", () => {
            const tab = btn.dataset.tab;
            document.querySelectorAll(".page-tab-btn").forEach(b => b.classList.remove("active"));
            document.querySelectorAll(".page-tab-content").forEach(c => c.classList.remove("active"));
            btn.classList.add("active");
            document.getElementById(`tab-${tab}`).classList.add("active");
        });
    });

    // Template Selection
    document.querySelectorAll(".template-card").forEach(card => {
        card.addEventListener("click", () => {
            document.querySelectorAll(".template-card").forEach(c => c.classList.remove("selected"));
            card.classList.add("selected");
            selectedTemplate = card.dataset.template;
            document.getElementById("btn-step1-next").disabled = false;
        });
    });

    document.getElementById("btn-step1-next").addEventListener("click", () => goToStep(2));

    // Skills input
    const skillInput = document.getElementById("skill-input");
    const skillsWrap = document.getElementById("skills-wrap");

    skillsWrap.addEventListener("click", () => skillInput.focus());

    skillInput.addEventListener("keydown", (e) => {
        if (e.key === "Enter" || e.key === ",") {
            e.preventDefault();
            const val = skillInput.value.replace(",", "").trim();
            if (val && !skills.includes(val)) {
                skills.push(val);
                renderSkillTags();
                renderPreview();
            }
            skillInput.value = "";
        }
        if (e.key === "Backspace" && !skillInput.value && skills.length) {
            skills.pop();
            renderSkillTags();
            renderPreview();
        }
    });

    // Live form -> preview listeners
    ["f-name", "f-email", "f-phone", "f-linkedin", "f-github", "f-portfolio", "f-summary"].forEach(id => {
        const el = document.getElementById(id);
        if (el) el.addEventListener("input", () => { renderPreview(); updateCompleteness(); });
    });

    // Customization
    document.getElementById("accent-color-picker").addEventListener("input", (e) => {
        accentColor = e.target.value;
        document.getElementById("color-swatch-display").style.background = accentColor;
        renderPreview();
    });
    document.getElementById("font-select").addEventListener("change", renderPreview);
    document.getElementById("size-select").addEventListener("change", renderPreview);
}

// ── Step Navigation ───────────────────────────────────────
window.goToStep = function (step) {
    document.querySelectorAll(".builder-step").forEach(s => s.classList.remove("active"));
    document.getElementById(`step-${step}`).classList.add("active");
    currentStep = step;
    updateStepIndicator(step);
    if (step === 2) {
        renderPreview();
        updateCompleteness();
    }
    if (step === 3) {
        updateCompleteness();
    }
    window.scrollTo({ top: 0, behavior: "smooth" });
};

function updateStepIndicator(step) {
    for (let i = 1; i <= 3; i++) {
        const dot = document.getElementById(`sdot-${i}`);
        const label = document.getElementById(`slabel-${i}`);
        dot.className = "step-dot";
        label.className = "step-label";
        if (i < step) {
            dot.classList.add("done");
            dot.innerHTML = "<i class='bx bx-check' style='font-size:0.8rem;'></i>";
        } else if (i === step) {
            dot.classList.add("active");
            dot.textContent = i;
            label.classList.add("active");
        } else {
            dot.textContent = i;
        }
        if (i < 3) {
            const line = document.getElementById(`sline-${i}`);
            line.className = i < step ? "step-line done" : "step-line";
        }
    }
}

// ── Section Toggle ────────────────────────────────────────
window.toggleSection = function (id) {
    document.getElementById(id).classList.toggle("open");
};

// ── Skills ────────────────────────────────────────────────
function renderSkillTags() {
    const skillsWrap = document.getElementById("skills-wrap");
    const skillInput = document.getElementById("skill-input");

    skillsWrap.querySelectorAll(".skill-tag").forEach(t => t.remove());
    skills.forEach((skill, i) => {
        const tag = document.createElement("span");
        tag.className = "skill-tag";
        tag.innerHTML = `${esc(skill)} <span class="skill-tag-remove" data-i="${i}">×</span>`;
        skillsWrap.insertBefore(tag, skillInput);
    });
    skillsWrap.querySelectorAll(".skill-tag-remove").forEach(btn => {
        btn.addEventListener("click", () => {
            skills.splice(parseInt(btn.dataset.i), 1);
            renderSkillTags();
            renderPreview();
        });
    });
}

// ── Repeatable Entries ────────────────────────────────────
window.addEntry = function (type) {
    if (type === "education") educationEntries.push({ school: "", degree: "", year: "", gpa: "" });
    if (type === "projects") projectEntries.push({ title: "", description: "", link: "" });
    if (type === "experience") experienceEntries.push({ company: "", role: "", duration: "", description: "" });
    if (type === "certs") certEntries.push({ name: "", issuer: "", year: "" });
    renderEntries(type);
};

const ENTRY_CONFIGS = {
    education: {
        getList: () => educationEntries, label: "Education Entry",
        fields: [
            { id: "school", label: "School / University", placeholder: "e.g. University of the Philippines" },
            { id: "degree", label: "Degree / Course", placeholder: "e.g. BS Computer Science" },
            { id: "year", label: "Year", placeholder: "e.g. 2021 – 2025" },
            { id: "gpa", label: "GPA (optional)", placeholder: "e.g. 1.75" }
        ]
    },
    projects: {
        getList: () => projectEntries, label: "Project",
        fields: [
            { id: "title", label: "Project Title", placeholder: "e.g. Personal Portfolio Website", full: true },
            { id: "description", label: "Description", placeholder: "e.g. Built with React and Node.js.", textarea: true, full: true },
            { id: "link", label: "Link (optional)", placeholder: "github.com/you/project", full: true }
        ]
    },
    experience: {
        getList: () => experienceEntries, label: "Experience",
        fields: [
            { id: "company", label: "Company / Organization", placeholder: "e.g. Acme Tech" },
            { id: "role", label: "Role / Position", placeholder: "e.g. Frontend Intern" },
            { id: "duration", label: "Duration", placeholder: "e.g. Jun 2024 – Aug 2024", full: true },
            { id: "description", label: "What you did", placeholder: "e.g. Developed UI components using React.", textarea: true, full: true }
        ]
    },
    certs: {
        getList: () => certEntries, label: "Certification",
        fields: [
            { id: "name", label: "Certification / Course", placeholder: "e.g. AWS Cloud Practitioner", full: true },
            { id: "issuer", label: "Issued by", placeholder: "e.g. Amazon Web Services" },
            { id: "year", label: "Year", placeholder: "e.g. 2024" }
        ]
    }
};

function renderEntries(type) {
    const cfg = ENTRY_CONFIGS[type];
    const list = document.getElementById(`${type}-list`);
    const entries = cfg.getList();

    list.innerHTML = "";
    entries.forEach((entry, idx) => {
        const card = document.createElement("div");
        card.className = "entry-card";

        let headerHTML = `
            <div class="entry-card-header">
                <span class="entry-card-title">${cfg.label} ${idx + 1}</span>
                <button class="btn-remove-entry" data-type="${type}" data-idx="${idx}" title="Remove">
                    <i class='bx bx-trash'></i>
                </button>
            </div>`;

        let rowsHTML = "";
        let inRow = false;
        cfg.fields.forEach((f) => {
            const val = entry[f.id] || "";
            const inputId = `${type}-${idx}-${f.id}`;
            const inputHTML = f.textarea
                ? `<textarea class="form-textarea" id="${inputId}" placeholder="${f.placeholder}" rows="2" style="min-height:60px;" data-type="${type}" data-idx="${idx}" data-field="${f.id}">${esc(val)}</textarea>`
                : `<input type="text" class="form-input" id="${inputId}" placeholder="${f.placeholder}" value="${esc(val)}" data-type="${type}" data-idx="${idx}" data-field="${f.id}">`;
            const fieldHTML = `<div class="form-group"><label class="form-label">${f.label}</label>${inputHTML}</div>`;

            if (f.full) {
                if (inRow) { rowsHTML += "</div>"; inRow = false; }
                rowsHTML += `<div class="form-row single">${fieldHTML}</div>`;
            } else {
                if (!inRow) { rowsHTML += `<div class="form-row">`; inRow = true; }
                rowsHTML += fieldHTML;
            }
        });
        if (inRow) rowsHTML += "</div>";

        card.innerHTML = headerHTML + rowsHTML;
        list.appendChild(card);
    });

    list.querySelectorAll(".btn-remove-entry").forEach(btn => {
        btn.addEventListener("click", () => {
            const t = btn.dataset.type;
            const i = parseInt(btn.dataset.idx);
            ENTRY_CONFIGS[t].getList().splice(i, 1);
            renderEntries(t);
            renderPreview();
            updateCompleteness();
        });
    });

    list.querySelectorAll("[data-type][data-field]").forEach(input => {
        input.addEventListener("input", () => {
            const t = input.dataset.type;
            const i = parseInt(input.dataset.idx);
            const f = input.dataset.field;
            ENTRY_CONFIGS[t].getList()[i][f] = input.value;
            renderPreview();
            updateCompleteness();
        });
    });
}

// ── Collect form data ─────────────────────────────────────
function collectData() {
    return {
        templateId: selectedTemplate,
        accentColor,
        font: document.getElementById("font-select").value,
        pageSize: document.getElementById("size-select").value,
        personalInfo: {
            name: document.getElementById("f-name").value.trim(),
            email: document.getElementById("f-email").value.trim(),
            phone: document.getElementById("f-phone").value.trim(),
            linkedin: document.getElementById("f-linkedin").value.trim(),
            github: document.getElementById("f-github").value.trim(),
            portfolio: document.getElementById("f-portfolio").value.trim()
        },
        summary: document.getElementById("f-summary").value.trim(),
        skills: [...skills],
        education: educationEntries.map(e => ({ ...e })),
        projects: projectEntries.map(e => ({ ...e })),
        experience: experienceEntries.map(e => ({ ...e })),
        certifications: certEntries.map(e => ({ ...e }))
    };
}

// ── Completeness ──────────────────────────────────────────
function updateCompleteness() {
    const d = collectData();
    const pi = d.personalInfo;
    let score = 0, total = 8;
    if (pi.name) score++;
    if (pi.email) score++;
    if (pi.phone) score++;
    if (pi.github || pi.linkedin) score++;
    if (d.summary) score++;
    if (d.skills.length >= 3) score++;
    if (d.education.length && d.education[0].school) score++;
    if (d.projects.length || d.experience.length) score++;
    const pct = Math.round((score / total) * 100);
    document.getElementById("completeness-fill").style.width = pct + "%";
    document.getElementById("completeness-pct").textContent = pct + "%";
}

// ── Render Preview ────────────────────────────────────────
function renderPreview() {
    const d = collectData();
    const pi = d.personalInfo;
    const frame = document.getElementById("resume-frame");
    const fontMap = { poppins: "'Poppins', sans-serif", inter: "'Inter', sans-serif", georgia: "Georgia, serif" };
    const font = fontMap[d.font] || fontMap.poppins;

    frame.innerHTML = d.templateId === "tech"
        ? renderTechTemplate(d, pi, font)
        : renderClassicTemplate(d, pi, font);

    frame.style.setProperty("--resume-accent", d.accentColor);

    const inner = frame.firstElementChild;
    if (inner) {
        const overflowing = inner.scrollHeight > frame.clientHeight + 10;
        document.getElementById("overflow-warning").classList.toggle("show", overflowing);
    }
}

function esc(s) {
    return (s || "").toString().replace(/</g, "&lt;").replace(/>/g, "&gt;");
}

function renderClassicTemplate(d, pi, font) {
    const contactItems = [pi.email, pi.phone, pi.linkedin, pi.github, pi.portfolio]
        .filter(Boolean).map(c => `<span class="rc-contact-item">${esc(c)}</span>`).join("");

    const eduHTML = d.education.filter(e => e.school).map(e => `
        <div class="rc-edu-item">
            <div class="rc-item-header">
                <span class="rc-item-title">${esc(e.school)}</span>
                <span class="rc-item-date">${esc(e.year)}</span>
            </div>
            <div class="rc-item-sub">${esc(e.degree)}${e.gpa ? ` · GPA: ${esc(e.gpa)}` : ""}</div>
        </div>`).join("");

    const skillsHTML = d.skills.map(s => `<span class="rc-skill-tag">${esc(s)}</span>`).join("");

    const projHTML = d.projects.filter(p => p.title).map(p => `
        <div class="rc-proj-item">
            <div class="rc-item-header">
                <span class="rc-item-title">${esc(p.title)}</span>
                ${p.link ? `<span class="rc-item-date">${esc(p.link)}</span>` : ""}
            </div>
            ${p.description ? `<div class="rc-item-desc">${esc(p.description)}</div>` : ""}
        </div>`).join("");

    const expHTML = d.experience.filter(e => e.company).map(e => `
        <div class="rc-exp-item">
            <div class="rc-item-header">
                <span class="rc-item-title">${esc(e.role)} · ${esc(e.company)}</span>
                <span class="rc-item-date">${esc(e.duration)}</span>
            </div>
            ${e.description ? `<div class="rc-item-desc">${esc(e.description)}</div>` : ""}
        </div>`).join("");

    const certHTML = d.certifications.filter(c => c.name).map(c =>
        `<div class="rc-cert-item">${esc(c.name)}${c.issuer ? ` · ${esc(c.issuer)}` : ""}${c.year ? ` (${esc(c.year)})` : ""}</div>`
    ).join("");

    return `<div id="resume-classic" style="font-family:${font}; --resume-accent:${d.accentColor};">
        <div class="rc-header">
            <div class="rc-name">${esc(pi.name) || "Your Name"}</div>
            <div class="rc-contact-row">${contactItems}</div>
        </div>
        <div class="rc-body">
            ${d.summary ? `<div class="rc-section"><div class="rc-section-title">Summary</div><div class="rc-summary">${esc(d.summary)}</div></div>` : ""}
            ${eduHTML ? `<div class="rc-section"><div class="rc-section-title">Education</div>${eduHTML}</div>` : ""}
            ${skillsHTML ? `<div class="rc-section"><div class="rc-section-title">Skills</div><div class="rc-skills-wrap">${skillsHTML}</div></div>` : ""}
            ${projHTML ? `<div class="rc-section"><div class="rc-section-title">Projects</div>${projHTML}</div>` : ""}
            ${expHTML ? `<div class="rc-section"><div class="rc-section-title">Experience</div>${expHTML}</div>` : ""}
            ${certHTML ? `<div class="rc-section"><div class="rc-section-title">Certifications</div>${certHTML}</div>` : ""}
        </div>
    </div>`;
}

function renderTechTemplate(d, pi, font) {
    const contactLines = [pi.email, pi.phone, pi.linkedin, pi.github, pi.portfolio]
        .filter(Boolean).map(c => `<div class="rt-sidebar-line">${esc(c)}</div>`).join("");

    const skillChips = d.skills.map(s => `<span class="rt-skill-chip">${esc(s)}</span>`).join("");

    const eduSidebar = d.education.filter(e => e.school).map(e => `
        <div class="rt-sidebar-line" style="font-weight:600;">${esc(e.school)}</div>
        <div class="rt-sidebar-line">${esc(e.degree)}</div>
        ${e.year ? `<div class="rt-sidebar-line" style="opacity:0.5;">${esc(e.year)}</div>` : ""}`
    ).join("");

    const certSidebar = d.certifications.filter(c => c.name).map(c =>
        `<div class="rt-sidebar-line">${esc(c.name)}</div>`
    ).join("");

    const projHTML = d.projects.filter(p => p.title).map(p => `
        <div class="rt-item">
            <div class="rt-item-header">
                <span class="rt-item-title">${esc(p.title)}</span>
                ${p.link ? `<span class="rt-item-date">${esc(p.link)}</span>` : ""}
            </div>
            ${p.description ? `<div class="rt-item-desc">${esc(p.description)}</div>` : ""}
        </div>`).join("");

    const expHTML = d.experience.filter(e => e.company).map(e => `
        <div class="rt-item">
            <div class="rt-item-header">
                <span class="rt-item-title">${esc(e.role)} · ${esc(e.company)}</span>
                <span class="rt-item-date">${esc(e.duration)}</span>
            </div>
            ${e.description ? `<div class="rt-item-desc">${esc(e.description)}</div>` : ""}
        </div>`).join("");

    return `<div id="resume-tech" style="font-family:${font}; --resume-accent:${d.accentColor};">
        <div class="rt-sidebar">
            <div class="rt-sidebar-name">${esc(pi.name) || "Your Name"}</div>
            <div class="rt-sidebar-section-title">Contact</div>
            ${contactLines}
            ${skillChips ? `<div class="rt-sidebar-section-title">Skills</div><div class="rt-skills-list">${skillChips}</div>` : ""}
            ${eduSidebar ? `<div class="rt-sidebar-section-title">Education</div>${eduSidebar}` : ""}
            ${certSidebar ? `<div class="rt-sidebar-section-title">Certifications</div>${certSidebar}` : ""}
        </div>
        <div class="rt-main">
            ${d.summary ? `<div class="rt-section"><div class="rt-section-title">About</div><div class="rt-summary">${esc(d.summary)}</div></div>` : ""}
            ${expHTML ? `<div class="rt-section"><div class="rt-section-title">Experience</div>${expHTML}</div>` : ""}
            ${projHTML ? `<div class="rt-section"><div class="rt-section-title">Projects</div>${projHTML}</div>` : ""}
        </div>
    </div>`;
}

// ── Save to Profile ───────────────────────────────────────
window.saveToProfile = async function () {
    if (!isAuthenticated) return;
    const btn = document.getElementById("btn-save-profile");
    btn.disabled = true;
    btn.innerHTML = `<i class='bx bx-loader-alt bx-spin'></i> Saving...`;
    try {
        const resumeData = collectData();
        const res = await saveResume(resumeData);
        showToast("✓ Resume saved to your profile!");
        document.getElementById("last-saved-text").textContent =
            `Last saved: ${new Date(res.resume.lastSaved).toLocaleDateString("en-PH", { dateStyle: "medium" })}`;
    } catch (err) {
        showToast(err.message || "Failed to save.", true);
    } finally {
        btn.disabled = false;
        btn.innerHTML = `<i class='bx bx-save'></i> Save to My Profile`;
    }
};

// ── Download PDF ──────────────────────────────────────────
window.downloadPDF = function () {
    const d = collectData();
    const frame = document.getElementById("resume-frame");
    const printTarget = document.getElementById("print-target");

    printTarget.style.display = "block";
    printTarget.innerHTML = "";

    const wrapper = document.createElement("div");
    wrapper.style.cssText = "width:210mm; min-height:297mm; background:#fff; padding:0; margin:0 auto;";
    wrapper.innerHTML = frame.innerHTML;

    const innerEl = wrapper.querySelector("[id^='resume-']");
    if (innerEl) {
        innerEl.style.fontSize = "10px";
        innerEl.style.height = "297mm";
    }
    wrapper.style.setProperty("--resume-accent", d.accentColor);

    printTarget.appendChild(wrapper);

    setTimeout(() => {
        window.print();
        printTarget.style.display = "none";
        printTarget.innerHTML = "";
    }, 200);
};

// ── Toast ─────────────────────────────────────────────────
function showToast(msg, isError = false) {
    const toast = document.getElementById("resume-toast");
    toast.textContent = msg;
    toast.className = "resume-toast" + (isError ? " error" : "");
    toast.classList.add("show");
    setTimeout(() => toast.classList.remove("show"), 3000);
}

// ── Init ──────────────────────────────────────────────────
init();
