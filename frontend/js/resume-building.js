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
let textColor = "#222222";
let headerTextColor = "#ffffff";
let resumePhoto = "";

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
    textColor = resume.textColor || "#222222";
    headerTextColor = resume.headerTextColor || "#ffffff";
    document.getElementById("accent-color-picker").value = accentColor;
    document.getElementById("color-swatch-display").style.background = accentColor;
    document.getElementById("text-color-picker").value = textColor;
    document.getElementById("text-color-swatch-display").style.background = textColor;
    document.getElementById("header-text-picker").value = headerTextColor;
    document.getElementById("header-text-swatch-display").style.background = headerTextColor;
    document.getElementById("font-select").value = resume.font || "poppins";
    document.getElementById("size-select").value = resume.pageSize || "A4";
    document.getElementById("spacing-select").value = resume.spacing || "normal";

    const pi = resume.personalInfo || {};
    setVal("f-name", pi.name);
    setVal("f-email", pi.email);
    setVal("f-phone", pi.phone);
    setVal("f-linkedin", pi.linkedin);
    setVal("f-github", pi.github);
    setVal("f-portfolio", pi.portfolio);
    setVal("f-summary", resume.summary);

    resumePhoto = pi.photo || "";
    const photoStatus = document.getElementById("photo-status");
    const removePhotoBtn = document.getElementById("btn-remove-photo");
    if (resumePhoto) {
        photoStatus.textContent = "Photo uploaded";
        removePhotoBtn.style.display = "flex";
    } else {
        photoStatus.textContent = "No file selected";
        removePhotoBtn.style.display = "none";
    }

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

    // ── School Year Validation ────────────────────────────────
    function validateSchoolYear(value) {
        if (!value) return true;
        if (!/^\d{4}-\d{4}$/.test(value)) return false;
        const [start, end] = value.split("-").map(Number);
        return end > start && (end - start) <= 10; // allows 1–10 year gaps
    }

    // ── GPA Validation (PH Scale: 1.0 - 5.0) ──────────────────
    function validateGPA(value) {
        if (!value) return true;
        const num = parseFloat(value);
        if (isNaN(num)) return false;
        const pattern = /^[1-5](\.\d{1,2})?$/;
        if (!pattern.test(value)) return false;
        return num >= 1.0 && num <= 5.0;
    }

    // ── Smart URL Sanitizer ───────────────────────────────────
    function cleanSocialLink(val, type) {
        if (!val) return "";
        let clean = val.trim();
        
        // Strip protocols and www
        clean = clean.replace(/^(https?:\/\/)?(www\.)?/, "");
        
        // Handle country-specific subdomains for LinkedIn (e.g. ph.linkedin.com, uk.linkedin.com)
        if (type === "linkedin") {
            clean = clean.replace(/^[a-z]{2}\.linkedin\.com/i, "linkedin.com");
            // Ensure it has linkedin.com/in/ prefix
            if (clean.toLowerCase().startsWith("linkedin.com/in/")) {
                // OK
            } else if (clean.toLowerCase().startsWith("linkedin.com/")) {
                clean = clean.replace(/linkedin\.com\//i, "linkedin.com/in/");
            } else {
                // Just the username typed
                clean = "linkedin.com/in/" + clean;
            }
        } else if (type === "github") {
            if (!clean.toLowerCase().startsWith("github.com/")) {
                clean = "github.com/" + clean;
            }
        }
        
        // Remove trailing slashes and query parameters
        clean = clean.split("?")[0].replace(/\/+$/, "");
        return clean;
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

        // URL Sanitization on blur
        ["f-linkedin", "f-github", "f-portfolio"].forEach(id => {
            const el = document.getElementById(id);
            if (el) {
                el.addEventListener("blur", () => {
                    const type = id.replace("f-", "");
                    el.value = cleanSocialLink(el.value, type);
                    renderPreview();
                    updateCompleteness();
                });
            }
        });

        // ── country code change triggers preview update ──
        // ── block non-numeric input on phone field ──
        document.getElementById("f-phone").addEventListener("keypress", (e) => {
            if (!/\d/.test(e.key)) e.preventDefault();
        });

        document.getElementById("f-phone").addEventListener("paste", (e) => {
            e.preventDefault();
            const pasted = (e.clipboardData || window.clipboardData).getData("text").replace(/\D/g, "");
            document.getElementById("f-phone").value = pasted;
            renderPreview();
        });
        // Photo upload
        const photoInput = document.getElementById("f-photo");
        const photoStatus = document.getElementById("photo-status");
        const removePhotoBtn = document.getElementById("btn-remove-photo");

        photoInput.addEventListener("change", (e) => {
            const file = e.target.files[0];
            if (!file) return;

            const reader = new FileReader();
            reader.onload = function(event) {
                const img = new Image();
                img.onload = function() {
                    const canvas = document.createElement("canvas");
                    const ctx = canvas.getContext("2d");
                    
                    canvas.width = 150;
                    canvas.height = 150;
                    
                    const size = Math.min(img.width, img.height);
                    const sx = (img.width - size) / 2;
                    const sy = (img.height - size) / 2;
                    
                    ctx.drawImage(img, sx, sy, size, size, 0, 0, 150, 150);
                    
                    resumePhoto = canvas.toDataURL("image/jpeg", 0.7);
                    photoStatus.textContent = "Photo uploaded";
                    removePhotoBtn.style.display = "flex";
                    
                    renderPreview();
                    updateCompleteness();
                };
                img.src = event.target.result;
            };
            reader.readAsDataURL(file);
        });

        removePhotoBtn.addEventListener("click", () => {
            resumePhoto = "";
            photoInput.value = "";
            photoStatus.textContent = "No file selected";
            removePhotoBtn.style.display = "none";
            renderPreview();
            updateCompleteness();
        });

        // Customization
        // Curated Tech Theme Presets
        document.querySelectorAll(".theme-preset-btn").forEach(btn => {
            btn.addEventListener("click", () => {
                document.querySelectorAll(".theme-preset-btn").forEach(b => b.classList.remove("active"));
                btn.classList.add("active");

                accentColor = btn.dataset.accent;
                textColor = btn.dataset.text;
                headerTextColor = btn.dataset.header;

                document.getElementById("accent-color-picker").value = accentColor;
                document.getElementById("text-color-picker").value = textColor;
                document.getElementById("header-text-picker").value = headerTextColor;

                document.getElementById("color-swatch-display").style.background = accentColor;
                document.getElementById("text-color-swatch-display").style.background = textColor;
                document.getElementById("header-text-swatch-display").style.background = headerTextColor;

                renderPreview();
            });
        });

        const clearActivePreset = () => {
            document.querySelectorAll(".theme-preset-btn").forEach(b => b.classList.remove("active"));
        };

        document.getElementById("accent-color-picker").addEventListener("input", (e) => {
            clearActivePreset();
            accentColor = e.target.value;
            document.getElementById("color-swatch-display").style.background = accentColor;
            renderPreview();
        });
        document.getElementById("text-color-picker").addEventListener("input", (e) => {
            clearActivePreset();
            textColor = e.target.value;
            document.getElementById("text-color-swatch-display").style.background = textColor;
            renderPreview();
        });
        document.getElementById("header-text-picker").addEventListener("input", (e) => {
            clearActivePreset();
            headerTextColor = e.target.value;
            document.getElementById("header-text-swatch-display").style.background = headerTextColor;
            renderPreview();
        });
        document.getElementById("font-select").addEventListener("change", renderPreview);
        document.getElementById("size-select").addEventListener("change", renderPreview);
        document.getElementById("spacing-select").addEventListener("change", renderPreview);

        // ── Draggable Resizer with Snap-to-Edge ─────────────────
        const resizeHandle = document.getElementById("resize-handle");
        const builderLayout = document.querySelector(".builder-layout");
        if (resizeHandle && builderLayout) {
            let isDragging = false;
            // Snap thresholds: drag past these percentages to collapse a panel in real-time
            const SNAP_LEFT  = 20;  // drag left past 20% → hide form, full preview
            const SNAP_RIGHT = 80;  // drag right past 80% → hide preview, full form

            resizeHandle.addEventListener("mousedown", (e) => {
                isDragging = true;
                resizeHandle.classList.add("dragging");
                document.body.style.cursor = "col-resize";
                document.body.style.userSelect = "none";
                e.preventDefault();
            });

            document.addEventListener("mousemove", (e) => {
                if (!isDragging) return;
                const containerRect = builderLayout.getBoundingClientRect();
                const offsetLeft = e.clientX - containerRect.left;
                const rawPercent = (offsetLeft / containerRect.width) * 100;
                const clamped = Math.max(0, Math.min(100, rawPercent));

                if (clamped <= SNAP_LEFT) {
                    // Snaps to full preview
                    builderLayout.classList.remove("preview-collapsed");
                    builderLayout.classList.add("inputs-collapsed");
                    builderLayout.style.removeProperty("--form-width");
                    builderLayout.style.removeProperty("--preview-width");
                    resizeHandle.title = "Drag right to show inputs";
                    renderPreview();
                } else if (clamped >= SNAP_RIGHT) {
                    // Snaps to full form
                    builderLayout.classList.remove("inputs-collapsed");
                    builderLayout.classList.add("preview-collapsed");
                    builderLayout.style.removeProperty("--form-width");
                    builderLayout.style.removeProperty("--preview-width");
                    resizeHandle.title = "Drag left to show preview";
                    renderPreview();
                } else {
                    // Normal split view
                    builderLayout.classList.remove("inputs-collapsed");
                    builderLayout.classList.remove("preview-collapsed");
                    builderLayout.style.setProperty("--form-width", `${clamped}%`);
                    builderLayout.style.setProperty("--preview-width", `${100 - clamped}%`);
                    resizeHandle.title = "Drag to resize panels";
                    renderPreview();
                }
            });

            document.addEventListener("mouseup", () => {
                if (!isDragging) return;
                isDragging = false;
                resizeHandle.classList.remove("dragging");
                document.body.style.cursor = "";
                document.body.style.userSelect = "";
            });

            // Double-click to reset to 50/50
            resizeHandle.addEventListener("dblclick", () => {
                builderLayout.classList.remove("inputs-collapsed");
                builderLayout.classList.remove("preview-collapsed");
                builderLayout.style.setProperty("--form-width", "50%");
                builderLayout.style.setProperty("--preview-width", "50%");
                resizeHandle.title = "Drag to resize panels";
                setTimeout(renderPreview, 30);
            });
        }

        // Re-scale preview when browser window resizes
        window.addEventListener("resize", renderPreview);
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
        // ── schoolYear added to education entries ──
        if (type === "education") educationEntries.push({ school: "", degree: "", schoolYear: "", gpa: "" });
        if (type === "projects") projectEntries.push({ title: "", description: "", link: "" });
        if (type === "experience") experienceEntries.push({ company: "", role: "", duration: "", description: "" });
        if (type === "certs") certEntries.push({ name: "", issuer: "", year: "" });
        renderEntries(type);
    };

    const ENTRY_CONFIGS = {
        education: {
            getList: () => educationEntries, label: "Education Entry",
            fields: [
                { id: "school",     label: "School / University", placeholder: "e.g. Western Mindanao State University" },
                { id: "degree",     label: "Degree / Course",     placeholder: "e.g. BS Computer Science" },
                // ── schoolYear field with validation flag ──
                { id: "schoolYear", label: "School Year",         placeholder: "e.g. 2023-2024", schoolYear: true, half: true },
                { id: "gpa",        label: "GPA (optional)",      placeholder: "e.g. 1.75", gpaValidation: true }
            ]
        },
        projects: {
            getList: () => projectEntries, label: "Project",
            fields: [
                { id: "title",       label: "Project Title", placeholder: "e.g. Personal Portfolio Website", full: true },
                { id: "description", label: "Description",   placeholder: "e.g. Built with React and Node.js.", textarea: true, full: true },
                { id: "link",        label: "Link (optional)", placeholder: "github.com/you/project", full: true }
            ]
        },
        experience: {
            getList: () => experienceEntries, label: "Experience",
            fields: [
                { id: "company",     label: "Company / Organization", placeholder: "e.g. Acme Tech" },
                { id: "role",        label: "Role / Position",        placeholder: "e.g. Frontend Intern" },
                { id: "duration",    label: "Duration",               placeholder: "e.g. Jun 2024 – Aug 2024", full: true },
                { id: "description", label: "What you did",           placeholder: "e.g. Developed UI components using React.", textarea: true, full: true }
            ]
        },
        certs: {
            getList: () => certEntries, label: "Certification",
            fields: [
                { id: "name",   label: "Certification / Course", placeholder: "e.g. AWS Cloud Practitioner", full: true },
                { id: "issuer", label: "Issued by",              placeholder: "e.g. Amazon Web Services" },
                { id: "year",   label: "Year",                   placeholder: "e.g. 2024" }
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

                let inputHTML;

                if (f.textarea) {
                    inputHTML = `<textarea class="form-textarea" id="${inputId}" placeholder="${f.placeholder}" rows="2" style="min-height:60px;" data-type="${type}" data-idx="${idx}" data-field="${f.id}">${esc(val)}</textarea>`;
                } else if (f.schoolYear) {
                    // ── School Year: text input + inline error span + validation ──
                    inputHTML = `
                    <input
                        type="text"
                        class="form-input"
                        id="${inputId}"
                        placeholder="${f.placeholder}"
                        value="${esc(val)}"
                        maxlength="9"
                        data-type="${type}"
                        data-idx="${idx}"
                        data-field="${f.id}"
                        data-school-year="true"
                    >
                    <span id="${inputId}-error" style="color:red; font-size:11px; display:none;">
                        Invalid format. Use YYYY-YYYY (e.g. 2023-2024)
                    </span>`;
                } else if (f.gpaValidation) {
                    inputHTML = `
                    <input
                        type="text"
                        class="form-input"
                        id="${inputId}"
                        placeholder="${f.placeholder}"
                        value="${esc(val)}"
                        maxlength="4"
                        data-type="${type}"
                        data-idx="${idx}"
                        data-field="${f.id}"
                        data-gpa-val="true"
                    >
                    <span id="${inputId}-error" style="color:red; font-size:11px; display:none;">
                        Enter a valid GPA (1.0 to 5.0, e.g. 1.25)
                    </span>`;
                } else {
                    inputHTML = `<input type="text" class="form-input" id="${inputId}" placeholder="${f.placeholder}" value="${esc(val)}" data-type="${type}" data-idx="${idx}" data-field="${f.id}">`;
                }

                const labelHTML = f.textarea
                    ? `<div style="display:flex; justify-content:space-between; align-items:center; width:100%;">
                         <label class="form-label" style="margin-bottom:0;">${f.label}</label>
                         <span class="btn-help-verb" style="font-size:0.72rem; color:#91DAEB; cursor:pointer; font-weight:600;"><i class='bx bx-bulb'></i> Need help?</span>
                       </div>`
                    : `<label class="form-label">${f.label}</label>`;

                const fieldHTML = `<div class="form-group">${labelHTML}${inputHTML}</div>`;

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

        // Bind action verb triggers
        list.querySelectorAll(".btn-help-verb").forEach(btn => {
            btn.addEventListener("click", () => {
                const tipsTabBtn = document.querySelector(".page-tab-btn[data-tab='tips']");
                if (tipsTabBtn) {
                    tipsTabBtn.click();
                    const dictSection = document.getElementById("tab-tips");
                    if (dictSection) {
                        dictSection.scrollIntoView({ behavior: 'smooth' });
                    }
                }
            });
        });

        // Remove entry buttons
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

        // Live input listeners
        list.querySelectorAll("[data-type][data-field]").forEach(input => {
            input.addEventListener("input", () => {
                const t = input.dataset.type;
                const i = parseInt(input.dataset.idx);
                const f = input.dataset.field;

                // Restrict GPA input to numbers and a single decimal dot only
                if (input.dataset.gpaVal) {
                    let val = input.value;
                    val = val.replace(/[^0-9.]/g, ""); // strip non-numeric/non-dot characters
                    const parts = val.split(".");
                    if (parts.length > 2) {
                        val = parts[0] + "." + parts.slice(1).join(""); // force maximum of one dot
                    }
                    input.value = val;
                }

                ENTRY_CONFIGS[t].getList()[i][f] = input.value;

                // Clear school year error while typing
                if (input.dataset.schoolYear) {
                    const errEl = document.getElementById(`${input.id}-error`);
                    if (errEl) errEl.style.display = "none";
                    input.style.border = "";
                }

                // Clear GPA error while typing
                if (input.dataset.gpaVal) {
                    const errEl = document.getElementById(`${input.id}-error`);
                    if (errEl) errEl.style.display = "none";
                    input.style.border = "";
                }

                renderPreview();
                updateCompleteness();
            });

            // ── School Year blur validation ──
            if (input.dataset.schoolYear) {
                input.addEventListener("blur", () => {
                    const value = input.value.trim();
                    const errEl = document.getElementById(`${input.id}-error`);
                    if (!errEl) return;

                    if (value === "") {
                        errEl.style.display = "none";
                        input.style.border = "";
                        return;
                    }

                    if (!validateSchoolYear(value)) {
                        errEl.style.display = "block";
                        input.style.border = "1px solid red";
                    } else {
                        errEl.style.display = "none";
                        input.style.border = "1px solid green";
                    }
                });
            }

            // ── GPA blur validation ──
            if (input.dataset.gpaVal) {
                input.addEventListener("blur", () => {
                    const value = input.value.trim();
                    const errEl = document.getElementById(`${input.id}-error`);
                    if (!errEl) return;

                    if (value === "") {
                        errEl.style.display = "none";
                        input.style.border = "";
                        return;
                    }

                    if (!validateGPA(value)) {
                        errEl.style.display = "block";
                        input.style.border = "1px solid red";
                    } else {
                        errEl.style.display = "none";
                        input.style.border = "1px solid green";
                    }
                });
            }
        });
    }

    // ── Collect form data ─────────────────────────────────────
    function collectData() {
        const phoneCode = document.getElementById("f-phone-code").value;
        const phoneRaw = document.getElementById("f-phone").value.trim().replace(/^0/, "");
        const phoneFormatted = /^\d{10}$/.test(phoneRaw)
            ? phoneRaw.replace(/(\d{3})(\d{3})(\d{4})/, "$1 $2 $3")
            : phoneRaw;    
        return { 
        templateId: selectedTemplate, 
        accentColor,
        textColor,
        headerTextColor,
        font: document.getElementById("font-select").value,
        pageSize: document.getElementById("size-select").value,
        spacing: document.getElementById("spacing-select").value,
        personalInfo: {
            name:      document.getElementById("f-name").value.trim(),
            email:     document.getElementById("f-email").value.trim(),
            phone:     `${phoneCode} ${phoneFormatted}`,            linkedin:  document.getElementById("f-linkedin").value.trim(),
            github:    document.getElementById("f-github").value.trim(),
            portfolio: document.getElementById("f-portfolio").value.trim(),
            photo:     resumePhoto
        },
        summary:        document.getElementById("f-summary").value.trim(),
        skills:         [...skills],
        education:      educationEntries.map(e => ({ ...e })),
        projects:       projectEntries.map(e => ({ ...e })),
        experience:     experienceEntries.map(e => ({ ...e })),
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

    // Update the visual Strength Checklist
    updateStrengthChecklist(d, pi);
}

function updateStrengthChecklist(d, pi) {
    const list = document.getElementById("strength-checklist");
    if (!list) return;

    let score = 0;

    // 1. Summary Check
    const chkSummary = document.getElementById("chk-summary");
    if (chkSummary) {
        const isSet = d.summary && d.summary.length >= 80;
        if (isSet) score++;
        chkSummary.innerHTML = isSet
            ? `<i class='bx bx-check' style="color: #2ed573; font-size: 1.1rem; flex-shrink: 0;"></i> About me / Summary filled (>= 80 chars)`
            : `<i class='bx bx-x' style="color: #ff4757; font-size: 1.1rem; flex-shrink: 0;"></i> About me / Summary filled (>= 80 chars)`;
        chkSummary.style.color = isSet ? "rgba(255,255,255,0.85)" : "rgba(255,255,255,0.5)";
    }

    // 2. Skills Check
    const chkSkills = document.getElementById("chk-skills");
    if (chkSkills) {
        const isSet = d.skills.length >= 3;
        if (isSet) score++;
        chkSkills.innerHTML = isSet
            ? `<i class='bx bx-check' style="color: #2ed573; font-size: 1.1rem; flex-shrink: 0;"></i> Added at least 3 skills`
            : `<i class='bx bx-x' style="color: #ff4757; font-size: 1.1rem; flex-shrink: 0;"></i> Added at least 3 skills`;
        chkSkills.style.color = isSet ? "rgba(255,255,255,0.85)" : "rgba(255,255,255,0.5)";
    }

    // 3. Experience Check
    const chkExperience = document.getElementById("chk-experience");
    if (chkExperience) {
        const isSet = d.experience.some(e => e.company && e.role && e.description);
        if (isSet) score++;
        chkExperience.innerHTML = isSet
            ? `<i class='bx bx-check' style="color: #2ed573; font-size: 1.1rem; flex-shrink: 0;"></i> Added at least 1 Work Experience`
            : `<i class='bx bx-x' style="color: #ff4757; font-size: 1.1rem; flex-shrink: 0;"></i> Added at least 1 Work Experience`;
        chkExperience.style.color = isSet ? "rgba(255,255,255,0.85)" : "rgba(255,255,255,0.5)";
    }

    // 4. Projects Check
    const chkProjects = document.getElementById("chk-projects");
    if (chkProjects) {
        const isSet = d.projects.some(p => p.title && p.description);
        if (isSet) score++;
        chkProjects.innerHTML = isSet
            ? `<i class='bx bx-check' style="color: #2ed573; font-size: 1.1rem; flex-shrink: 0;"></i> Added at least 1 Project`
            : `<i class='bx bx-x' style="color: #ff4757; font-size: 1.1rem; flex-shrink: 0;"></i> Added at least 1 Project`;
        chkProjects.style.color = isSet ? "rgba(255,255,255,0.85)" : "rgba(255,255,255,0.5)";
    }

    // Update strength badge in card header (out of 4)
    const badge = document.getElementById("strength-badge");
    if (badge) {
        let label = "Weak";
        let color = "#ff4757"; // red
        let bg = "rgba(255,71,87,0.15)";
        if (score >= 3) {
            label = "Excellent!";
            color = "#2ed573"; // green
            bg = "rgba(46,213,115,0.15)";
        } else if (score >= 2) {
            label = "Good";
            color = "#ff9f43"; // orange
            bg = "rgba(255,159,67,0.15)";
        }
        badge.textContent = `${label} (${score}/4)`;
        badge.style.color = color;
        badge.style.background = bg;
    }
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
    frame.style.setProperty("--resume-text", d.textColor);
    frame.style.setProperty("--resume-header-text", d.headerTextColor);

    // Resize preview to match selected page size (96dpi screen equivalents)
    const pageSizes = {
        A4:     { width: "794px", height: "1123px" },
        Letter: { width: "816px", height: "1056px" }
    };
    const size = pageSizes[d.pageSize] || pageSizes.A4;
    frame.style.width  = size.width;
    frame.style.height = size.height;

    // Scale preview frame to fit wrapper width dynamically
    const wrap = document.getElementById("resume-frame-wrap");
    if (wrap) {
        const wrapWidth = wrap.clientWidth - 24; // 12px padding on each side
        const frameWidth = parseFloat(size.width) || 794;
        const scale = wrapWidth / frameWidth;
        frame.style.transform = `scale(${scale})`;
        
        const frameHeight = parseFloat(size.height) || 1123;
        wrap.style.height = `${frameHeight * scale + 24}px`; // Scaled height + padding
    }

    const inner = frame.firstElementChild;
    if (inner) {
        const overflowing = inner.scrollHeight > frame.clientHeight + 10;
        document.getElementById("overflow-warning").classList.toggle("show", overflowing);
    }
}

function esc(s) {
    return (s || "").toString().replace(/</g, "&lt;").replace(/>/g, "&gt;");
}

// ── Classic Template ──────────────────────────────────────
function renderClassicTemplate(d, pi, font) {
    const contactItems = [pi.email, pi.phone, pi.linkedin, pi.github, pi.portfolio]
        .filter(Boolean).map(c => `<span class="rc-contact-item">${esc(c)}</span>`).join("");

    // ── schoolYear used in education display ──
    const eduHTML = d.education.filter(e => e.school).map(e => `
        <div class="rc-edu-item">
            <div class="rc-item-header">
                <span class="rc-item-title">${esc(e.school)}</span>
                <span class="rc-item-date">${esc(e.schoolYear || "")}</span>
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
        <div class="rc-header" style="display: flex; justify-content: space-between; align-items: center; gap: 1.5em;">
            <div>
                <div class="rc-name">${esc(pi.name) || "Your Name"}</div>
                <div class="rc-contact-row">${contactItems}</div>
            </div>
            ${pi.photo ? `<div class="rc-header-photo-wrap"><img src="${pi.photo}" class="rc-header-photo"></div>` : ""}
        </div>
        <div class="rc-body">
            ${d.summary   ? `<div class="rc-section"><div class="rc-section-title">Summary</div><div class="rc-summary">${esc(d.summary)}</div></div>` : ""}
            ${eduHTML     ? `<div class="rc-section"><div class="rc-section-title">Education</div>${eduHTML}</div>` : ""}
            ${skillsHTML  ? `<div class="rc-section"><div class="rc-section-title">Skills</div><div class="rc-skills-wrap">${skillsHTML}</div></div>` : ""}
            ${projHTML    ? `<div class="rc-section"><div class="rc-section-title">Projects</div>${projHTML}</div>` : ""}
            ${expHTML     ? `<div class="rc-section"><div class="rc-section-title">Experience</div>${expHTML}</div>` : ""}
            ${certHTML    ? `<div class="rc-section"><div class="rc-section-title">Certifications</div>${certHTML}</div>` : ""}
        </div>
    </div>`;
}

// ── Tech Template ─────────────────────────────────────────
function renderTechTemplate(d, pi, font) {
    const contactLines = [pi.email, pi.phone, pi.linkedin, pi.github, pi.portfolio]
        .filter(Boolean).map(c => `<div class="rt-sidebar-line">${esc(c)}</div>`).join("");

    const skillChips = d.skills.map(s => `<span class="rt-skill-chip">${esc(s)}</span>`).join("");

    // ── schoolYear used in tech sidebar education display ──
    const eduSidebar = d.education.filter(e => e.school).map(e => `
        <div class="rt-sidebar-line" style="font-weight:600;">${esc(e.school)}</div>
        <div class="rt-sidebar-line">${esc(e.degree)}</div>
        ${e.schoolYear ? `<div class="rt-sidebar-line" style="opacity:0.5;">${esc(e.schoolYear)}</div>` : ""}`
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
            ${pi.photo ? `<div class="rt-sidebar-photo-wrap"><img src="${pi.photo}" class="rt-sidebar-photo"></div>` : ""}
            <div class="rt-sidebar-name">${esc(pi.name) || "Your Name"}</div>
            <div class="rt-sidebar-section-title">Contact</div>
            ${contactLines}
            ${skillChips   ? `<div class="rt-sidebar-section-title">Skills</div><div class="rt-skills-list">${skillChips}</div>` : ""}
            ${eduSidebar   ? `<div class="rt-sidebar-section-title">Education</div>${eduSidebar}` : ""}
            ${certSidebar  ? `<div class="rt-sidebar-section-title">Certifications</div>${certSidebar}` : ""}
        </div>
        <div class="rt-main">
            ${d.summary ? `<div class="rt-section"><div class="rt-section-title">About</div><div class="rt-summary">${esc(d.summary)}</div></div>` : ""}
            ${expHTML   ? `<div class="rt-section"><div class="rt-section-title">Experience</div>${expHTML}</div>` : ""}
            ${projHTML  ? `<div class="rt-section"><div class="rt-section-title">Projects</div>${projHTML}</div>` : ""}
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
// Helper to format descriptions into clean bullet lists
function makeBullets(text) {
    if (!text) return [];
    return text.split("\n")
        .map(l => l.trim())
        .filter(Boolean)
        .map(line => line.replace(/^[-•*]\s*/, ""));
}

// ── Download PDF (PDFMake Selectable Text Generation) ──────
window.downloadPDF = function () {
    const d = collectData();
    const pi = d.personalInfo;

    if (typeof pdfMake === "undefined") {
        console.warn("PDFMake not loaded. Falling back to native browser print.");
        const printTarget = document.getElementById("print-target");
        printTarget.style.display = "block";
        printTarget.innerHTML = document.getElementById("resume-frame").innerHTML;
        setTimeout(() => {
            window.print();
            printTarget.style.display = "none";
            printTarget.innerHTML = "";
        }, 200);
        return;
    }

    // Configure core PDF system fonts mapping (Roboto vs Times-Roman)
    pdfMake.fonts = {
        Roboto: {
            normal: 'Roboto-Regular.ttf',
            bold: 'Roboto-Medium.ttf',
            italics: 'Roboto-Italic.ttf',
            bolditalics: 'Roboto-MediumItalic.ttf'
        },
        Times: {
            normal: 'Times-Roman',
            bold: 'Times-Bold',
            italics: 'Times-Italic',
            bolditalics: 'Times-BoldItalic'
        }
    };

    const activeFont = d.font === "georgia" ? "Times" : "Roboto";

    // Setup margins dynamic values based on Spacing parameter
    let m = 40; // normal
    let sidebarMargin = [20, 30, 20, 30];
    let mainMargin = [25, 30, 25, 30];

    if (d.spacing === "compact") {
        m = 25;
        sidebarMargin = [15, 20, 15, 20];
        mainMargin = [20, 20, 20, 20];
    } else if (d.spacing === "spacious") {
        m = 55;
        sidebarMargin = [25, 40, 25, 40];
        mainMargin = [30, 40, 30, 40];
    }

    const classicLineWidth = 595 - (2 * m);
    const techMainLineWidth = 400 - mainMargin[0] - mainMargin[2] - 10;

    let docDefinition;

    if (d.templateId === "tech") {
        // ── TECH TEMPLATE ──────────────────────────────────────
        const sidebarContent = [];

        // Render photo in sidebar if present
        if (pi.photo) {
            sidebarContent.push({
                image: pi.photo,
                width: 70,
                height: 70,
                alignment: 'center',
                margin: [0, 0, 0, 15]
            });
        }

        // Profile details
        sidebarContent.push({ text: (pi.name || "YOUR NAME").toUpperCase(), fontSize: 14, bold: true, color: d.headerTextColor, margin: [0, 0, 0, 2] });
        
        // Contact details
        sidebarContent.push({ text: 'CONTACT', fontSize: 9, bold: true, color: d.headerTextColor, opacity: 0.8, margin: [0, 15, 0, 5] });
        const contacts = [pi.email, pi.phone, pi.linkedin, pi.github, pi.portfolio].filter(Boolean);
        contacts.forEach(c => {
            let link = "";
            if (c === pi.email) {
                link = `mailto:${c}`;
            } else if (c === pi.phone) {
                link = `tel:${c}`;
            } else {
                link = c.startsWith("http") ? c : `https://${c}`;
            }
            sidebarContent.push({ text: c, link: link, fontSize: 8, color: d.headerTextColor, opacity: 0.9, margin: [0, 2, 0, 2] });
        });

        // Skills section
        if (d.skills && d.skills.length) {
            sidebarContent.push({ text: 'SKILLS', fontSize: 9, bold: true, color: d.headerTextColor, opacity: 0.8, margin: [0, 18, 0, 6] });
            d.skills.forEach(s => {
                sidebarContent.push({ text: `• ${s}`, fontSize: 8, color: d.headerTextColor, opacity: 0.9, margin: [0, 2, 0, 2] });
            });
        }

        // Education section
        const validEdu = d.education.filter(e => e.school);
        if (validEdu.length) {
            sidebarContent.push({ text: 'EDUCATION', fontSize: 9, bold: true, color: d.headerTextColor, opacity: 0.8, margin: [0, 18, 0, 6] });
            validEdu.forEach(e => {
                sidebarContent.push({ text: e.school, fontSize: 8.5, bold: true, color: d.headerTextColor, margin: [0, 4, 0, 1] });
                sidebarContent.push({ text: e.degree, fontSize: 8, color: d.headerTextColor, opacity: 0.9 });
                if (e.schoolYear) {
                    sidebarContent.push({ text: e.schoolYear, fontSize: 7.5, color: d.headerTextColor, opacity: 0.6, margin: [0, 1, 0, 6] });
                }
            });
        }

        // Certifications section
        const validCerts = d.certifications.filter(c => c.name);
        if (validCerts.length) {
            sidebarContent.push({ text: 'CERTIFICATIONS', fontSize: 9, bold: true, color: d.headerTextColor, opacity: 0.8, margin: [0, 18, 0, 6] });
            validCerts.forEach(c => {
                sidebarContent.push({ text: c.name, fontSize: 8, color: d.headerTextColor, margin: [0, 2, 0, 2] });
            });
        }

        // Main content pane
        const mainContent = [];

        // About / Summary
        if (d.summary) {
            mainContent.push({ text: 'ABOUT ME', fontSize: 11, bold: true, color: d.textColor, margin: [0, 0, 0, 4] });
            mainContent.push({ canvas: [{ type: 'line', x1: 0, y1: 0, x2: techMainLineWidth, y2: 0, lineWidth: 1.5, strokeColor: d.accentColor }] });
            mainContent.push({ text: d.summary, fontSize: 9.5, color: d.textColor, margin: [0, 6, 0, 16] });
        }

        // Experience
        const validExp = d.experience.filter(e => e.company);
        if (validExp.length) {
            mainContent.push({ text: 'EXPERIENCE', fontSize: 11, bold: true, color: d.textColor, margin: [0, 0, 0, 4] });
            mainContent.push({ canvas: [{ type: 'line', x1: 0, y1: 0, x2: techMainLineWidth, y2: 0, lineWidth: 1.5, strokeColor: d.accentColor }] });
            
            validExp.forEach(e => {
                mainContent.push({
                    columns: [
                        { text: e.role, fontSize: 9.5, bold: true, color: d.textColor },
                        { text: e.duration || "", fontSize: 8.5, alignment: 'right', color: d.textColor }
                    ],
                    margin: [0, 8, 0, 2]
                });
                mainContent.push({ text: e.company, fontSize: 8.5, italic: true, color: d.textColor, margin: [0, 0, 0, 4] });
                if (e.description) {
                    mainContent.push({
                        ul: makeBullets(e.description),
                        fontSize: 9,
                        color: d.textColor,
                        margin: [5, 0, 0, 12]
                    });
                }
            });
        }

        // Projects
        const validProj = d.projects.filter(p => p.title);
        if (validProj.length) {
            mainContent.push({ text: 'PROJECTS', fontSize: 11, bold: true, color: d.textColor, margin: [0, 8, 0, 4] });
            mainContent.push({ canvas: [{ type: 'line', x1: 0, y1: 0, x2: techMainLineWidth, y2: 0, lineWidth: 1.5, strokeColor: d.accentColor }] });
            
            validProj.forEach(p => {
                mainContent.push({
                    columns: [
                        { text: p.title, fontSize: 9.5, bold: true, color: d.textColor },
                        { text: p.link || "", link: p.link ? (p.link.startsWith("http") ? p.link : `https://${p.link}`) : "", fontSize: 8.5, alignment: 'right', color: d.textColor, decoration: 'underline' }
                    ],
                    margin: [0, 8, 0, 4]
                });
                if (p.description) {
                    mainContent.push({
                        text: p.description,
                        fontSize: 9,
                        color: d.textColor,
                        margin: [0, 0, 0, 10]
                    });
                }
            });
        }

        docDefinition = {
            pageMargins: [0, 0, 0, 0],
            defaultStyle: {
                font: activeFont
            },
            content: [
                {
                    table: {
                        widths: [195, '*'],
                        heights: [842],
                        body: [
                            [
                                {
                                    fillColor: d.accentColor,
                                    margin: sidebarMargin,
                                    stack: sidebarContent
                                },
                                {
                                    margin: mainMargin,
                                    stack: mainContent
                                }
                            ]
                        ]
                    },
                    layout: 'noBorders'
                }
            ]
        };
    } else {
        // ── CLASSIC TEMPLATE ───────────────────────────────────
        const content = [];
        const contactItems = [pi.email, pi.phone, pi.linkedin, pi.github, pi.portfolio].filter(Boolean);

        const contactInlines = [];
        contactItems.forEach((c, idx) => {
            let link = "";
            if (c === pi.email) {
                link = `mailto:${c}`;
            } else if (c === pi.phone) {
                link = `tel:${c}`;
            } else {
                link = c.startsWith("http") ? c : `https://${c}`;
            }
            contactInlines.push({ text: c, link: link });
            if (idx < contactItems.length - 1) {
                contactInlines.push({ text: "   •   " });
            }
        });

        // Header block
        content.push({
            table: {
                widths: ['*'],
                body: [
                    [
                        {
                            fillColor: d.accentColor,
                            margin: [20, 20, 20, 20],
                            stack: [
                                { text: (pi.name || "YOUR NAME").toUpperCase(), fontSize: 22, bold: true, color: d.headerTextColor, alignment: 'center' },
                                { text: contactInlines, fontSize: 9, color: d.headerTextColor, margin: [0, 8, 0, 0], alignment: 'center' }
                            ]
                        }
                    ]
                ]
            },
            layout: 'noBorders',
            margin: [-m, -m, -m, 20]
        });

        // Summary
        if (d.summary) {
            content.push({ text: 'SUMMARY', fontSize: 11, bold: true, color: d.accentColor, margin: [0, 10, 0, 4] });
            content.push({ canvas: [{ type: 'line', x1: 0, y1: 0, x2: classicLineWidth, y2: 0, lineWidth: 1.5, strokeColor: d.accentColor }] });
            content.push({ text: d.summary, fontSize: 9, color: d.textColor, margin: [0, 6, 0, 12] });
        }

        // Education
        const validEdu = d.education.filter(e => e.school);
        if (validEdu.length) {
            content.push({ text: 'EDUCATION', fontSize: 11, bold: true, color: d.accentColor, margin: [0, 8, 0, 4] });
            content.push({ canvas: [{ type: 'line', x1: 0, y1: 0, x2: classicLineWidth, y2: 0, lineWidth: 1.5, strokeColor: d.accentColor }] });
            
            const eduBlocks = [];
            validEdu.forEach(e => {
                eduBlocks.push({
                    columns: [
                        { text: e.school, fontSize: 9.5, bold: true, color: d.textColor },
                        { text: e.schoolYear || "", fontSize: 8.5, alignment: 'right', color: d.textColor }
                    ],
                    margin: [0, 6, 0, 2]
                });
                eduBlocks.push({
                    text: `${e.degree}${e.gpa ? `  •  GPA: ${e.gpa}` : ""}`,
                    fontSize: 9,
                    color: d.textColor,
                    opacity: 0.8,
                    margin: [0, 0, 0, 8]
                });
            });
            content.push({ stack: eduBlocks, margin: [0, 0, 0, 6] });
        }

        // Skills
        if (d.skills && d.skills.length) {
            content.push({ text: 'SKILLS', fontSize: 11, bold: true, color: d.accentColor, margin: [0, 8, 0, 4] });
            content.push({ canvas: [{ type: 'line', x1: 0, y1: 0, x2: classicLineWidth, y2: 0, lineWidth: 1.5, strokeColor: d.accentColor }] });
            content.push({
                text: d.skills.join("   ,   "),
                fontSize: 9,
                color: d.textColor,
                margin: [0, 8, 0, 14]
            });
        }

        // Experience
        const validExp = d.experience.filter(e => e.company);
        if (validExp.length) {
            content.push({ text: 'EXPERIENCE', fontSize: 11, bold: true, color: d.accentColor, margin: [0, 8, 0, 4] });
            content.push({ canvas: [{ type: 'line', x1: 0, y1: 0, x2: classicLineWidth, y2: 0, lineWidth: 1.5, strokeColor: d.accentColor }] });
            
            const expBlocks = [];
            validExp.forEach(e => {
                expBlocks.push({
                    columns: [
                        { text: `${e.role}  •  ${e.company}`, fontSize: 9.5, bold: true, color: d.textColor },
                        { text: e.duration || "", fontSize: 8.5, alignment: 'right', color: d.textColor }
                    ],
                    margin: [0, 6, 0, 4]
                });
                if (e.description) {
                    expBlocks.push({
                        ul: makeBullets(e.description),
                        fontSize: 9,
                        color: d.textColor,
                        margin: [5, 0, 0, 10]
                    });
                }
            });
            content.push({ stack: expBlocks, margin: [0, 0, 0, 6] });
        }

        // Projects
        const validProj = d.projects.filter(p => p.title);
        if (validProj.length) {
            content.push({ text: 'PROJECTS', fontSize: 11, bold: true, color: d.accentColor, margin: [0, 8, 0, 4] });
            content.push({ canvas: [{ type: 'line', x1: 0, y1: 0, x2: classicLineWidth, y2: 0, lineWidth: 1.5, strokeColor: d.accentColor }] });
            
            const projBlocks = [];
            validProj.forEach(p => {
                projBlocks.push({
                    columns: [
                        { text: p.title, fontSize: 9.5, bold: true, color: d.textColor },
                        { text: p.link || "", link: p.link ? (p.link.startsWith("http") ? p.link : `https://${p.link}`) : "", fontSize: 8.5, alignment: 'right', color: d.textColor, decoration: 'underline' }
                    ],
                    margin: [0, 6, 0, 4]
                });
                if (p.description) {
                    projBlocks.push({
                        text: p.description,
                        fontSize: 9,
                        color: d.textColor,
                        margin: [0, 0, 0, 10]
                    });
                }
            });
            content.push({ stack: projBlocks, margin: [0, 0, 0, 6] });
        }

        // Certifications
        const validCerts = d.certifications.filter(c => c.name);
        if (validCerts.length) {
            content.push({ text: 'CERTIFICATIONS', fontSize: 11, bold: true, color: d.accentColor, margin: [0, 8, 0, 4] });
            content.push({ canvas: [{ type: 'line', x1: 0, y1: 0, x2: classicLineWidth, y2: 0, lineWidth: 1.5, strokeColor: d.accentColor }] });
            
            const certBlocks = [];
            validCerts.forEach(c => {
                certBlocks.push({
                    text: `•  ${c.name}${c.issuer ? ` - ${c.issuer}` : ""}${c.year ? ` (${c.year})` : ""}`,
                    fontSize: 9,
                    color: d.textColor,
                    margin: [0, 4, 0, 2]
                });
            });
            content.push({ stack: certBlocks, margin: [0, 4, 0, 6] });
        }

        docDefinition = {
            pageMargins: [m, m, m, m],
            defaultStyle: {
                font: activeFont
            },
            content: content
        };
    }

    const filename = `${(pi.name || "Resume").trim().replace(/\s+/g, "_")}_Resume.pdf`;
    pdfMake.createPdf(docDefinition).download(filename);
};

// ── Toast ─────────────────────────────────────────────────
// ── Preview Panel Toggle (Desktop) ────────────────────────
window.togglePreviewPanel = function () {
    const layout      = document.querySelector(".builder-layout");
    const label       = document.getElementById("toggle-preview-label");
    const icon        = document.getElementById("toggle-preview-icon");
    const inputsBtn   = document.getElementById("btn-toggle-inputs");
    const toolbarFull = document.getElementById("btn-toolbar-fullview");
    const previewBtn  = document.getElementById("btn-toggle-preview");
    const collapsed   = layout.classList.toggle("preview-collapsed");
    
    label.textContent = collapsed ? "Show Preview" : "Hide Preview";
    if (icon) {
        icon.className = collapsed ? "bx bx-show" : "bx bx-layout";
    }
    
    // Hide side fullview button when preview is hidden, and show toolbar fullview button instead
    if (inputsBtn) {
        inputsBtn.style.display = collapsed ? "none" : "inline-flex";
    }
    if (toolbarFull) {
        toolbarFull.style.display = collapsed ? "inline-flex" : "none";
    }
    if (previewBtn) {
        previewBtn.style.marginLeft = collapsed ? "0" : "auto";
    }

    // Re-render so overflow detection recalculates with new width
    setTimeout(renderPreview, 50);
};

// ── Toolbar Full View Trigger (Desktop) ───────────────────
window.triggerToolbarFullView = function () {
    const layout = document.querySelector(".builder-layout");
    if (!layout) return;

    // Show preview panel first (restore to split mode)
    if (layout.classList.contains("preview-collapsed")) {
        togglePreviewPanel();
    }

    // Immediately toggle the inputs panel off so preview fills the screen
    toggleInputsPanel();
};

// ── Inputs Panel Toggle (Full Preview Mode on Desktop) ────
window.toggleInputsPanel = function () {
    const layout      = document.querySelector(".builder-layout");
    const label       = document.getElementById("toggle-inputs-label");
    const icon        = document.getElementById("toggle-inputs-icon");
    const previewBtn  = document.getElementById("btn-toggle-preview");
    const collapsed   = layout.classList.toggle("inputs-collapsed");

    label.textContent = collapsed ? "Show Inputs" : "Full View";
    if (icon) {
        icon.className = collapsed ? "bx bx-exit-fullscreen" : "bx bx-fullscreen";
    }

    if (previewBtn) {
        previewBtn.style.display = collapsed ? "none" : "inline-flex";
    }

    // Re-render to scale preview page to 100% container width
    setTimeout(renderPreview, 50);
};

// ── Mobile Preview Bottom Sheet ───────────────────────────
let mobilePreviewOpen = false;
let mobilePreviewZoomed = false;

window.toggleMobileZoom = function () {
    const wrapper = document.querySelector("#mobile-preview-body > div");
    const zoomBtn = document.getElementById("btn-mobile-zoom");
    const sheetBody = document.getElementById("mobile-preview-body");
    if (!wrapper || !zoomBtn || !sheetBody) return;

    mobilePreviewZoomed = !mobilePreviewZoomed;

    if (mobilePreviewZoomed) {
        wrapper.style.transform = "scale(0.95)";
        zoomBtn.innerHTML = "<i class='bx bx-zoom-out'></i> Zoom Out";
        sheetBody.style.alignItems = "flex-start";
    } else {
        const availableWidth = sheetBody.clientWidth - 24;
        const fitScale = Math.min(0.45, availableWidth / 794);
        wrapper.style.transform = `scale(${fitScale})`;
        zoomBtn.innerHTML = "<i class='bx bx-zoom-in'></i> Zoom In";
        sheetBody.style.alignItems = "center";
    }
};

window.toggleMobilePreview = function () {
    const sheet   = document.getElementById("mobile-preview-sheet");
    const body    = document.getElementById("mobile-preview-body");
    const fabIcon = document.getElementById("fab-preview-icon");

    mobilePreviewOpen = !mobilePreviewOpen;

    if (mobilePreviewOpen) {
        mobilePreviewZoomed = false; // Reset zoom state when opened
        const zoomBtn = document.getElementById("btn-mobile-zoom");
        if (zoomBtn) {
            zoomBtn.innerHTML = "<i class='bx bx-zoom-in'></i> Zoom In";
        }
        
        // Clone current rendered resume into the sheet
        const frame = document.getElementById("resume-frame");
        if (frame) {
            const availableWidth = body.clientWidth - 24;
            const fitScale = Math.min(0.45, availableWidth / 794);
            
            // Create a scaled-down wrapper so the full page fits on screen
            body.innerHTML = `
                <div style="transform-origin: top center; transform: scale(${fitScale}); width: 794px; margin: 0 auto; transition: transform 0.25s ease-in-out;">
                    ${frame.innerHTML}
                </div>`;
            // Set CSS vars on the cloned content wrapper
            const wrapper = body.firstElementChild;
            if (wrapper) {
                wrapper.style.setProperty("--resume-accent", frame.style.getPropertyValue("--resume-accent"));
                wrapper.style.setProperty("--resume-text",   frame.style.getPropertyValue("--resume-text"));
                wrapper.style.setProperty("--resume-header-text", frame.style.getPropertyValue("--resume-header-text"));
            }
        }
        sheet.classList.add("open");
        fabIcon.className = "bx bx-x";
        document.body.style.overflow = "hidden";
        body.style.alignItems = "center";
    } else {
        sheet.classList.remove("open");
        fabIcon.className = "bx bx-show";
        document.body.style.overflow = "";
        // Clear after animation
        setTimeout(() => { body.innerHTML = ""; }, 400);
    }
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
