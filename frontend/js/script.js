import { getProfile } from "./auth.js";

(function () {
    /* Nav & Sidebar HTML */
    const NAV_HTML = `
<nav>
    <div class="container">
        <div class="logo-wrap" style="display:flex; align-items:center; gap:10px;">
            <button class="mobile-nav-toggle" aria-label="Open Menu">
                <i class='bx bx-menu'></i>
            </button>
            <a href="/" class="logo container">
                <img src="/assets/images/lugu-bg.png" alt="StudyPy" class="logo-image">
                <div class="LogoText">StudyPy</div>
            </a>
        </div>
        <div>
            <ul>
                <li><a href="/#home">Home</a></li>
                <li><a href="/#about">About</a></li>
                <li><a href="/#explore">Explore</a></li>
                <li><a href="/#footer">Contact</a></li>
                <li id="nav-auth-item"><a href="/pages/login.html">Login</a></li>
            </ul>
        </div>
    </div>
</nav>

<div class="sidebar close">
    <button class="sidebar-mobile-close" aria-label="Close menu">
        <i class='bx bx-x'></i>
    </button>
    <div class="sidebar-header">
        <button class="sidebar-toggle" type="button" aria-label="Toggle sidebar">
            <i class='bx bx-menu'></i>
        </button>
    </div>
    <ul class="nav-links">
        <li>
            <a href="/">
                <i class='bx bx-home-alt'></i>
                <span class="link_name">Home</span>
            </a>
            <ul class="sub-menu blank">
                <li><a class="link_name" href="/">Home</a></li>
            </ul>
        </li>
        <li>
            <div class="iocn-link">
                <a href="#">
                    <i class='bx bx-book-open'></i>
                    <span class="link_name">Learning</span>
                </a>
            </div>
            <ul class="sub-menu">
                <li><a class="link_name" href="#">Learning</a></li>
                <li><a href="/pages/Learning/online-courses.html">Online Courses</a></li>
                <li><a href="/pages/Learning/interactive-coding.html">Interactive Coding</a></li>
                <li><a href="/pages/Learning/video-tutorials.html">Video Tutorials</a></li>
                <li><a href="/pages/Learning/book-and-ebooks.html">Books &amp; eBooks</a></li>
            </ul>
        </li>
        <li>
            <div class="iocn-link">
                <a href="#">
                    <i class='bx bx-pointer'></i>
                    <span class="link_name">Interactive</span>
                </a>
            </div>
            <ul class="sub-menu">
                <li><a class="link_name" href="#">Interactive</a></li>
                <li><a href="/pages/Interactive/css-playground.html">CSS Playground</a></li>
                <li><a href="/pages/Interactive/git-branching.html">Git Branching</a></li>
                <li><a href="/pages/Interactive/sql-joins.html">SQL Joins</a></li>
                <li><a href="/pages/Interactive/dsa-visualizer.html">DSA Visualizer</a></li>
            </ul>
        </li>
        <li>
            <div class="iocn-link">
                <a href="#">
                    <i class='bx bx-code-alt'></i>
                    <span class="link_name">Languages</span>
                </a>
            </div>
            <ul class="sub-menu">
                <li><a class="link_name" href="#">Languages</a></li>
                <li><a href="/pages/languages/python.html">Python</a></li>
                <li><a href="/pages/languages/java.html">Java</a></li>
                <li><a href="/pages/languages/c-cpp.html">C/C++</a></li>
                <li><a href="/pages/languages/javascript.html">JavaScript</a></li>
                <li><a href="/pages/languages/php.html">PHP</a></li>
            </ul>
        </li>
        <li>
            <div class="iocn-link">
                <a href="#">
                    <i class='bx bx-wrench'></i>
                    <span class="link_name">Dev Tools</span>
                </a>
            </div>
            <ul class="sub-menu">
                <li><a class="link_name" href="#">Dev Tools</a></li>
                <li><a href="/pages/Dev Tools/IDES.html">IDEs &amp; Editors</a></li>
                <li><a href="/pages/Dev Tools/version-control.html">Version Control</a></li>
                <li><a href="/pages/Dev Tools/debugging-tools.html">Debugging Tools</a></li>
                <li><a href="/pages/Dev Tools/fun-tools.html">Fun Tools</a></li>
            </ul>
        </li>
        <li>
            <div class="iocn-link">
                <a href="#">
                    <i class='bx bx-file'></i>
                    <span class="link_name">Docs</span>
                </a>
            </div>
            <ul class="sub-menu">
                <li><a class="link_name" href="#">Docs</a></li>
                <li><a href="/pages/Docs/official-docs.html">Official Docs</a></li>
                <li><a href="/pages/Docs/cheat-sheets.html">Cheat Sheets</a></li>
                <li><a href="/pages/Docs/api-references.html">API References</a></li>
            </ul>
        </li>
        <li>
            <div class="iocn-link">
                <a href="#">
                    <i class='bx bx-trophy'></i>
                    <span class="link_name">Challenges</span>
                </a>
            </div>
            <ul class="sub-menu">
                <li><a class="link_name" href="#">Challenges</a></li>
                <li><a href="/pages/Challenges/coding-problems.html">Coding Problems</a></li>
                <li><a href="/pages/Challenges/projectideas.html">Project Ideas</a></li>
                <li><a href="/pages/Challenges/competition.html">Competitions</a></li>
            </ul>
        </li>
        <li>
            <div class="iocn-link">
                <a href="#">
                    <i class='bx bx-group'></i>
                    <span class="link_name">Communities</span>
                </a>
            </div>
            <ul class="sub-menu">
                <li><a class="link_name" href="#">Communities</a></li>
                <li><a href="/pages/Communities/forums.html">Forums</a></li>
                <li><a href="/pages/Communities/discord-servers.html">Discord Servers</a></li>
                <li><a href="/pages/Communities/study-groups.html">Study Groups</a></li>
            </ul>
        </li>
        <li>
            <div class="iocn-link">
                <a href="#">
                    <i class='bx bx-briefcase'></i>
                    <span class="link_name">Career</span>
                </a>
            </div>
            <ul class="sub-menu">
                <li><a class="link_name" href="#">Career</a></li>
                <li><a href="/pages/Career/Interview-prep.html">Interview Prep</a></li>
                <li><a href="/pages/Career/resume-building.html">Resume Building</a></li>
                <li><a href="/pages/Career/job-boards.html">Job Boards</a></li>
            </ul>
        </li>
        <li>
            <a href="/pages/settings.html">
                <i class='bx bx-cog'></i>
                <span class="link_name">Setting</span>
            </a>
            <ul class="sub-menu blank">
                <li><a class="link_name" href="/pages/settings.html">Setting</a></li>
            </ul>
        </li>
        <li id="sidebar-auth-item">
            <a href="/pages/login.html" id="auth-sidebar-link">
                <i class='bx bx-log-in' id="auth-sidebar-icon"></i>
                <span class="link_name" id="auth-sidebar-text">Login</span>
            </a>
            <ul class="sub-menu blank">
                <li><a class="link_name" href="/pages/login.html" id="auth-submenu-link">Login</a></li>
            </ul>
        </li>
    </ul>
</div>`;

    /* Inject into placeholder */
    const placeholder = document.getElementById("navbar-placeholder");
    if (placeholder) {
        placeholder.innerHTML = NAV_HTML;
    }

    /* Sidebar toggle */
    const sidebar = document.querySelector(".sidebar");
    window.__studypySidebarInit = true;

    const syncSidebarState = () => {
        document.body.classList.toggle(
            "sidebar-collapsed",
            sidebar.classList.contains("close")
        );
    };

    syncSidebarState();

    const sidebarToggle = document.querySelector(".sidebar-toggle");
    if (sidebarToggle) {
        sidebarToggle.addEventListener("click", () => {
            sidebar.classList.toggle("close");
            syncSidebarState();
        });
    }

    /* Mobile close button */
    const mobileCloseBtn = document.querySelector(".sidebar-mobile-close");
    if (mobileCloseBtn) {
        mobileCloseBtn.addEventListener("click", () => {
            sidebar.classList.remove("mobile-open");
            document.body.classList.remove("mobile-sidebar-active");
        });
    }

    /* Mobile sidebar toggle & backdrop */
    const mobileToggle = document.querySelector(".mobile-nav-toggle");
    if (mobileToggle) {
        mobileToggle.addEventListener("click", () => {
            sidebar.classList.toggle("mobile-open");
            document.body.classList.toggle("mobile-sidebar-active");

            let backdrop = document.querySelector(".sidebar-backdrop");
            if (!backdrop) {
                backdrop = document.createElement("div");
                backdrop.className = "sidebar-backdrop";
                document.body.appendChild(backdrop);
                backdrop.addEventListener("click", () => {
                    sidebar.classList.remove("mobile-open");
                    document.body.classList.remove("mobile-sidebar-active");
                });
            }
        });
    }

    /* Click-based submenus */
    document.querySelectorAll(".iocn-link").forEach((iocnLink) => {
        const link = iocnLink.querySelector("a");
        if (!link) return;

        if (!iocnLink.querySelector(".arrow")) {
            const arrow = document.createElement("i");
            arrow.className = "bx bxs-chevron-down arrow";
            iocnLink.appendChild(arrow);
        }
        const arrow = iocnLink.querySelector(".arrow");

        const toggleMenu = (e) => {
            e.preventDefault();
            e.stopPropagation();
            const parentLi = iocnLink.closest("li");
            if (!parentLi) return;

            const isOpen = parentLi.classList.contains("showMenu");

            document.querySelectorAll(".nav-links li.showMenu").forEach((li) => {
                li.classList.remove("showMenu");
            });

            if (!isOpen) {
                parentLi.classList.add("showMenu");
            }
        };

        link.addEventListener("click", toggleMenu);
        if (arrow) {
            arrow.style.cursor = "pointer";
            arrow.addEventListener("click", toggleMenu);
        }
    });

    // Synchronize User Authentication Status
    getProfile().then((res) => {
        const navAuthItem = document.getElementById("nav-auth-item");
        const authSidebarLink = document.getElementById("auth-sidebar-link");
        const authSidebarIcon = document.getElementById("auth-sidebar-icon");
        const authSidebarText = document.getElementById("auth-sidebar-text");
        const authSubmenuLink = document.getElementById("auth-submenu-link");

        if (res && res.authenticated) {
            const user = res.user;
            if (navAuthItem) {
                navAuthItem.innerHTML = `
                    <a href="/pages/settings.html" style="display:flex; align-items:center; gap:8px;">
                        <img src="${user.avatar || '/assets/images/lugu-bg.png'}" alt="Avatar" style="width:24px; height:24px; border-radius:50%; object-fit:cover; border:1px solid rgb(145, 218, 235);">
                        <span>${user.username}</span>
                    </a>
                `;
            }
            if (authSidebarLink) authSidebarLink.href = "/pages/settings.html";
            if (authSidebarIcon) {
                authSidebarIcon.className = "bx bx-user-circle";
            }
            if (authSidebarText) authSidebarText.textContent = "Profile";
            if (authSubmenuLink) {
                authSubmenuLink.href = "/pages/settings.html";
                authSubmenuLink.textContent = "Profile";
            }
        } else {
            if (navAuthItem) {
                navAuthItem.innerHTML = `<a href="/pages/login.html">Login</a>`;
            }
            if (authSidebarLink) authSidebarLink.href = "/pages/login.html";
            if (authSidebarIcon) {
                authSidebarIcon.className = "bx bx-log-in";
            }
            if (authSidebarText) authSidebarText.textContent = "Login";
            if (authSubmenuLink) {
                authSubmenuLink.href = "/pages/login.html";
                authSubmenuLink.textContent = "Login";
            }
        }
    }).catch((err) => {
        console.error("Auth status sync error:", err);
    });



    if ("serviceWorker" in navigator){
        window.addEventListener("load", () => {
            navigator.serviceWorker
                .register("/sw.js")
                .then((reg) => console.log("Service Worker registered successfully:", reg.scope))
                .catch((err) => console.error("Service Worker registration failed:", err));
        })
    }

})();
