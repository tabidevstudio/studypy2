// Simple forum frontend module (ES module)
import { getProfile } from "./auth.js";

const isLocal = window.location.hostname === "localhost" || window.location.hostname === "127.0.0.1";
const API_BASE = isLocal ? "http://localhost:3000/api/forum" : "/api/forum";

let isAuthenticated = false;

async function apiFetch(url, options = {}) {
  options.credentials = "include";
  if (options.body && typeof options.body === "object") {
    options.headers = { "Content-Type": "application/json", ...(options.headers || {}) };
    options.body = JSON.stringify(options.body);
  }

  const res = await fetch(url, options);
  if (!res.ok) {
    const err = await res.json().catch(() => ({}));
    throw new Error(err.error || `HTTP ${res.status}`);
  }
  return res.json();
}

export async function fetchAllPosts() {
  const data = await apiFetch(`${API_BASE}`);
  return data.posts || [];
}

export async function createPost(title, content) {
  return await apiFetch(`${API_BASE}/create`, { method: "POST", body: { title, content } });
}

export async function addReply(postId, content) {
  return await apiFetch(`${API_BASE}/${postId}/reply`, { method: "POST", body: { content } });
}

function renderPost(post) {
  const container = document.createElement("div");
  container.className = "forum-post";

  const author = post.author && post.author.username ? post.author.username : "Unknown";
  const title = document.createElement("h3");
  title.textContent = post.title;

  const meta = document.createElement("div");
  meta.className = "meta";
  meta.textContent = `by ${author} • ${new Date(post.createdAt).toLocaleString()}`;

  const body = document.createElement("p");
  body.textContent = post.content;

  container.appendChild(title);
  container.appendChild(meta);
  container.appendChild(body);

  // Replies
  const repliesEl = document.createElement("div");
  repliesEl.className = "replies";
  (post.replies || []).forEach(r => {
    const rEl = document.createElement("div");
    rEl.className = "reply";
    const ra = r.author && r.author.username ? r.author.username : "Unknown";
    rEl.textContent = `${ra}: ${r.content}`;
    repliesEl.appendChild(rEl);
  });

  container.appendChild(repliesEl);

  // Quick reply form
  const replyForm = document.createElement("form");
  replyForm.className = "reply-form";
  replyForm.innerHTML = `
    <input name="content" placeholder="Write a reply..." required />
    <button type="submit">Reply</button>
  `;

  replyForm.addEventListener("submit", async (e) => {
    e.preventDefault();
    // If not authenticated, prompt login modal
    if (!isAuthenticated) {
      showLoginModal();
      return;
    }

    const input = replyForm.querySelector("input[name=content]");
    const content = input.value.trim();
    if (!content) return;
    try {
      await addReply(post._id, content);
      input.value = "";
      await refreshPosts();
    } catch (err) {
      alert(err.message || "Failed to add reply");
    }
  });

  container.appendChild(replyForm);

  return container;
}

async function refreshPosts() {
  const list = document.getElementById("forum-list");
  if (!list) return;
  list.innerHTML = "Loading...";
  try {
    const posts = await fetchAllPosts();
    list.innerHTML = "";
    if (!posts.length) {
      list.textContent = "No posts yet.";
      return;
    }
    posts.forEach(p => list.appendChild(renderPost(p)));
  } catch (err) {
    list.textContent = "Failed to load posts.";
    console.error(err);
  }
}

function init() {
  const app = document.getElementById("forum-app");
  if (!app) return;

  const form = document.getElementById("forum-form");
  const list = document.getElementById("forum-list");

  // Intercept create-post submission: require auth
  form.addEventListener("submit", async (e) => {
    e.preventDefault();
    if (!isAuthenticated) {
      showLoginModal();
      return;
    }

    const title = form.querySelector("input[name=title]").value.trim();
    const content = form.querySelector("textarea[name=content]").value.trim();
    if (!title || !content) return alert("Please provide title and content.");
    try {
      await createPost(title, content);
      form.reset();
      await refreshPosts();
    } catch (err) {
      alert(err.message || "Failed to create post. Are you logged in?");
    }
  });

  // Setup login modal controls
  const loginModal = document.getElementById("loginModal");
  const loginModalClose = document.getElementById("loginModalClose");
  const loginModalCloseBtn = document.getElementById("loginModalCloseBtn");
  function bindModalClose() {
    if (!loginModal) return;
    const close = () => {
      loginModal.classList.remove("active");
      document.body.style.overflow = "";
    };
    if (loginModalClose) loginModalClose.addEventListener("click", close);
    if (loginModalCloseBtn) loginModalCloseBtn.addEventListener("click", close);
    loginModal.addEventListener("click", (e) => { if (e.target === loginModal) close(); });
    document.addEventListener("keydown", (e) => { if (e.key === "Escape" && loginModal.classList.contains("active")) close(); });
  }

  function showLoginModal() {
    const modal = document.getElementById("loginModal");
    if (!modal) return;
    modal.classList.add("active");
    document.body.style.overflow = "hidden";
  }

  bindModalClose();

  refreshPosts();
}

// Auto-init when module is loaded on the page
document.addEventListener("DOMContentLoaded", async () => {
  try {
    const profile = await getProfile();
    isAuthenticated = !!(profile && profile.authenticated);
  } catch (err) {
    isAuthenticated = false;
  }
  init();
});

export default { init, fetchAllPosts, createPost, addReply };
