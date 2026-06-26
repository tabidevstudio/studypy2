// ─────────────────────────────────────────────────────────────────────────────
// coding-problems.js  —  Controller and database for Flashcards Challenge Arena
// ─────────────────────────────────────────────────────────────────────────────

import { getProfile } from "./auth.js";

// ── BACKEND URL ──────────────────────────────────────────────────────────────
const API_BASE = window.location.hostname === "localhost" || window.location.hostname === "127.0.0.1"
  ? "http://localhost:3000"
  : ""; // same origin in production

/**
 * fetchQuestions(language, difficulty)
 * Fetches from GET /api/flashcards?lang=<language>&diff=<difficulty>
 * Returns the questions array, or throws on error.
 */
async function fetchQuestions(language, difficulty) {
  const url = `${API_BASE}/api/flashcards?lang=${language}&diff=${difficulty}`;
  const res = await fetch(url, { credentials: "include" });
  if (!res.ok) {
    const err = await res.json().catch(() => ({}));
    throw new Error(err.error || `HTTP ${res.status}`);
  }
  const data = await res.json();
  return data.questions || [];
}

// Legacy placeholder — questions are now fetched dynamically in startChallenge()
const QUESTIONS_DB = null;

// ── STATE VARIABLES ─────────────────────────────────────────────────────────
let selectedLanguage = "";
let selectedDifficulty = "";
let questionsList = [];
let score = 0;
let currentIndex = 0;
let selectedOptionIdx = null;
let isSubmitted = false;

// ── DOM ELEMENTS ─────────────────────────────────────────────────────────────
document.addEventListener("DOMContentLoaded", () => {
  initNavbar();
  setupEventListeners();
  loadProfileHeader();
});

function initNavbar() {
  // Check if navbar placeholder exists
  const placeholder = document.getElementById("navbar-placeholder");
  if (placeholder) {
    // If we are in challenges subdirectory, adjust paths if necessary, script.js handles it.
  }
}

async function loadProfileHeader() {
  try {
    const res = await getProfile();
    if (res.authenticated && res.user) {
      const authItem = document.getElementById("nav-auth-item");
      if (authItem) {
        authItem.innerHTML = `<a href="/pages/settings.html" style="display:flex; align-items:center; gap:8px;">
          <img src="${res.user.avatar || '/assets/images/lugu-bg.png'}" style="width:24px; height:24px; border-radius:50%; object-fit:cover;">
          ${res.user.username}
        </a>`;
      }
    }
  } catch (e) {
    console.warn("Auth check failed:", e);
  }
}

function setupEventListeners() {
  // Language selectors
  const langCards = document.querySelectorAll(".lang-card-select");
  langCards.forEach(card => {
    card.addEventListener("click", () => {
      langCards.forEach(c => c.classList.remove("active"));
      card.classList.add("active");
      selectedLanguage = card.dataset.lang;
      checkStartAbility();
    });
  });

  // Difficulty selectors
  const diffBtns = document.querySelectorAll(".diff-btn");
  diffBtns.forEach(btn => {
    btn.addEventListener("click", () => {
      diffBtns.forEach(b => b.classList.remove("active"));
      btn.classList.add("active");
      selectedDifficulty = btn.dataset.diff;
      checkStartAbility();
    });
  });

  // Start Button
  const startBtn = document.getElementById("btn-start-challenge");
  if (startBtn) {
    startBtn.addEventListener("click", startChallenge);
  }

  // Back buttons
  const backBtns = document.querySelectorAll(".back-to-setup");
  backBtns.forEach(btn => {
    btn.addEventListener("click", (e) => {
      e.preventDefault();
      resetToSetup();
    });
  });
}

function checkStartAbility() {
  const startBtn = document.getElementById("btn-start-challenge");
  if (!startBtn) return;
  
  if (selectedLanguage && selectedDifficulty) {
    startBtn.removeAttribute("disabled");
  } else {
    startBtn.setAttribute("disabled", "true");
  }
}

async function startChallenge() {
  if (!selectedLanguage || !selectedDifficulty) return;

  const startBtn = document.getElementById("btn-start-challenge");
  if (startBtn) {
    startBtn.disabled = true;
    startBtn.innerHTML = `Loading... <i class="bx bx-loader-alt bx-spin"></i>`;
  }

  try {
    const dataset = await fetchQuestions(selectedLanguage, selectedDifficulty);

    if (!dataset || dataset.length === 0) {
      alert("No questions found for this configuration.");
      return;
    }

    // Shuffle questions copy
    questionsList = [...dataset].sort(() => Math.random() - 0.5);

    // Reset state
    score = 0;
    currentIndex = 0;
    isSubmitted = false;
    selectedOptionIdx = null;

    // Toggle Containers
    document.getElementById("setup-container").classList.add("hidden");
    document.getElementById("results-container").classList.add("hidden");
    document.getElementById("arena-container").classList.remove("hidden");

    // Setup stats
    const langName = {
      python: "Python",
      javascript: "JavaScript",
      java: "Java",
      cpp: "C++"
    }[selectedLanguage];

    document.getElementById("arena-lang-title").textContent = `${langName} - ${selectedDifficulty.charAt(0).toUpperCase() + selectedDifficulty.slice(1)}`;
    updateStatsPanel();

    // Initialize and Render Card Stack
    initStackDOM();
    renderStackState();

  } catch (err) {
    console.error("Failed to load flashcards:", err);
    alert("Could not load questions. Please check your connection and try again.");
  } finally {
    if (startBtn) {
      startBtn.disabled = false;
      startBtn.innerHTML = `Start Flashcards <i class="bx bx-right-arrow-alt"></i>`;
      checkStartAbility();
    }
  }
}

function updateStatsPanel() {
  document.getElementById("score-val").textContent = score;
  document.getElementById("progress-text").textContent = `${currentIndex + 1} / ${questionsList.length}`;
  
  const pct = (currentIndex / questionsList.length) * 100;
  document.getElementById("arena-progress-bar").style.width = `${pct}%`;
}

// ── CARD STACK ENGINE ────────────────────────────────────────────────────────
let cardElements = []; // Persistent A, B, C cards

function initStackDOM() {
  const container = document.getElementById("flashcard-stack");
  if (!container) return;
  container.innerHTML = "";

  cardElements = [];

  // Create three persistent card objects
  for (let i = 0; i < 3; i++) {
    const card = document.createElement("div");
    card.id = `card-stack-item-${i}`;
    card.className = "flashcard-item card--hidden";
    container.appendChild(card);
    cardElements.push(card);
  }
}

function renderStackState() {
  isSubmitted = false;
  selectedOptionIdx = null;

  // We assign questions to our persistent card elements based on currentIndex
  // Card index 0 in DOM holds currentIndex
  // Card index 1 in DOM holds currentIndex + 1
  // Card index 2 in DOM holds currentIndex + 2
  
  // Clean classes
  cardElements.forEach(el => {
    el.className = "flashcard-item card--hidden";
  });

  const cardsToAssign = [
    { elIndex: 0, qIndex: currentIndex, styleClass: "card--front" },
    { elIndex: 1, qIndex: currentIndex + 1, styleClass: "card--middle" },
    { elIndex: 2, qIndex: currentIndex + 2, styleClass: "card--back" }
  ];

  cardsToAssign.forEach(config => {
    if (config.qIndex < questionsList.length) {
      const cardEl = cardElements[config.elIndex];
      cardEl.className = `flashcard-item ${config.styleClass}`;
      
      // Populate content
      populateCardData(cardEl, questionsList[config.qIndex], config.qIndex);
      
      // Bind event listeners only to the active card
      if (config.styleClass === "card--front") {
        bindFrontCardActions(cardEl);
      }
    }
  });
  
  updateStatsPanel();
}

function populateCardData(cardEl, qData, qIdx) {
  const isCodeAvailable = qData.code && qData.code.trim().length > 0;
  const escapedCode = isCodeAvailable ? escapeHtml(qData.code) : "";
  
  cardEl.innerHTML = `
    <div>
      <div class="card-tags">
        <span class="tag-badge ${selectedDifficulty}">${selectedDifficulty}</span>
        <span class="q-num">Question ${qIdx + 1}/${questionsList.length}</span>
      </div>
      <div class="card-question">
        ${qData.question}
      </div>
      ${isCodeAvailable ? `<pre class="code-block"><code>${escapedCode}</code></pre>` : ""}
      <div class="options-list">
        ${qData.options.map((opt, idx) => `
          <button class="option-card-btn" data-idx="${idx}">
            <span>${escapeHtml(opt)}</span>
            <i class="bx bx-check-circle"></i>
          </button>
        `).join("")}
      </div>
    </div>
    <div class="card-actions-panel">
      <div class="feedback-text hidden" id="card-feedback-${qIdx}"></div>
      <button class="btn-submit-answer" id="card-action-btn-${qIdx}" disabled>
        Submit Answer <i class="bx bx-check"></i>
      </button>
    </div>
  `;
}

function bindFrontCardActions(cardEl) {
  const qIdx = currentIndex;
  const qData = questionsList[qIdx];
  const optionBtns = cardEl.querySelectorAll(".option-card-btn");
  const submitBtn = cardEl.querySelector(`#card-action-btn-${qIdx}`);
  const feedbackEl = cardEl.querySelector(`#card-feedback-${qIdx}`);

  optionBtns.forEach(btn => {
    btn.addEventListener("click", () => {
      if (isSubmitted) return;

      optionBtns.forEach(b => b.classList.remove("selected"));
      btn.classList.add("selected");
      
      selectedOptionIdx = parseInt(btn.dataset.idx);
      submitBtn.removeAttribute("disabled");
    });
  });

  submitBtn.addEventListener("click", () => {
    if (!isSubmitted) {
      // Evaluate Answer
      isSubmitted = true;
      optionBtns.forEach(b => b.setAttribute("disabled", "true"));
      
      const correctIdx = qData.answer;
      
      // Select visual classes
      optionBtns.forEach(btn => {
        const idx = parseInt(btn.dataset.idx);
        if (idx === correctIdx) {
          btn.classList.add("correct");
        } else if (idx === selectedOptionIdx) {
          btn.classList.add("incorrect");
          // Change icon to cross
          btn.querySelector("i").className = "bx bx-x-circle";
        }
      });

      // Feedback display
      feedbackEl.classList.remove("hidden");
      if (selectedOptionIdx === correctIdx) {
        score++;
        feedbackEl.className = "feedback-text success";
        feedbackEl.innerHTML = `<i class="bx bxs-check-circle"></i> Correct!`;
      } else {
        feedbackEl.className = "feedback-text danger";
        feedbackEl.innerHTML = `<i class="bx bxs-x-circle"></i> Incorrect!`;
      }

      // Convert button to Next
      submitBtn.className = "btn-next-card";
      submitBtn.innerHTML = `Next Card <i class="bx bx-right-arrow-alt"></i>`;
      
      // Update running scores
      document.getElementById("score-val").textContent = score;
    } else {
      // Trigger Card Rotation and Next state
      rotateCardStack();
    }
  });
}

function rotateCardStack() {
  const frontCard = cardElements[0];
  
  // 1. Arc Animation Out
  frontCard.classList.add("card--slide-out");
  
  // 2. Shift others visually
  // Middle -> Front
  if (cardElements[1]) {
    cardElements[1].className = "flashcard-item card--front";
  }
  // Back -> Middle
  if (cardElements[2]) {
    cardElements[2].className = "flashcard-item card--middle";
  }
  
  // Wait for 3D translation to complete
  setTimeout(() => {
    // 3. Move index
    currentIndex++;
    
    if (currentIndex >= questionsList.length) {
      showResults();
    } else {
      // Rotate indices in our persistent elements
      // Shift array left so Card 1 becomes Card 0, Card 2 becomes Card 1, and the old Card 0 becomes Card 2
      const oldFront = cardElements.shift(); 
      cardElements.push(oldFront);
      
      // Render next batch
      // Old front is now cardElements[2] (Back). Let's load the next question (currentIndex + 2) into it
      const nextQIndex = currentIndex + 2;
      
      if (nextQIndex < questionsList.length) {
        oldFront.className = "flashcard-item card--hidden";
        populateCardData(oldFront, questionsList[nextQIndex], nextQIndex);
        
        // Wait briefly, then move from hidden to back
        setTimeout(() => {
          oldFront.className = "flashcard-item card--back";
        }, 50);
      } else {
        // No more items to feed back, hide it
        oldFront.className = "flashcard-item card--hidden";
      }

      // Reset per-card state before binding the new front card
      isSubmitted = false;
      selectedOptionIdx = null;

      // Re-assign event listeners to the new front (which is now cardElements[0])
      bindFrontCardActions(cardElements[0]);
      
      // Update statistics
      updateStatsPanel();
    }
  }, 600); // syncs with transitions
}

// ── SHOW RESULTS ─────────────────────────────────────────────────────────────
function showResults() {
  document.getElementById("arena-container").classList.add("hidden");
  
  const resultsContainer = document.getElementById("results-container");
  resultsContainer.classList.remove("hidden");

  // Populate data
  document.getElementById("res-score").textContent = score;
  document.getElementById("res-total").textContent = questionsList.length;
  
  const percent = Math.round((score / questionsList.length) * 100);
  document.getElementById("res-percent").textContent = `${percent}%`;
  
  // Circular progress loader
  const circleFill = document.querySelector(".circle-fill");
  if (circleFill) {
    // Circumference = 2 * pi * r = 2 * 3.14159 * 70 = 439.8 (approx 440)
    const offset = 440 - (440 * percent) / 100;
    
    // Add brief timeout for transition visibility
    setTimeout(() => {
      circleFill.style.strokeDashoffset = offset;
    }, 150);
  }

  // Dynamic trophy icon
  const trophy = document.getElementById("res-trophy");
  if (percent === 100) {
    trophy.className = "bx bxs-trophy success-trophy";
    trophy.style.color = "#f39c12"; // Golden
  } else if (percent >= 75) {
    trophy.className = "bx bxs-award success-trophy";
    trophy.style.color = "#a0a0a0"; // Silver
  } else if (percent >= 50) {
    trophy.className = "bx bxs-medal success-trophy";
    trophy.style.color = "#cd7f32"; // Bronze
  } else {
    trophy.className = "bx bx-message-alt-error success-trophy";
    trophy.style.color = "#e74c3c"; // Red warning
  }
}

function resetToSetup() {
  document.getElementById("arena-container").classList.add("hidden");
  document.getElementById("results-container").classList.add("hidden");
  document.getElementById("setup-container").classList.remove("hidden");
}

// ── HELPERS ──────────────────────────────────────────────────────────────────
function escapeHtml(str) {
  return str
    .replace(/&/g, "&amp;")
    .replace(/</g, "&lt;")
    .replace(/>/g, "&gt;")
    .replace(/"/g, "&quot;")
    .replace(/'/g, "&#039;");
}