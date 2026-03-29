(function () {
  /* ─── Inline nav/sidebar HTML (no fetch needed, works on file://) ─── */
  const NAV_HTML = `
<nav>
    <div class="container">
        <div>
            <a href="/index.html" class="logo container">
                <img src="/assets/images/lugu-bg.png" alt="StudyPy" class="logo-image">
                <div class="LogoText">StudyPy</div>
            </a>
        </div>
        <div>
            <ul>
                <li><a href="/index.html#home">Home</a></li>
                <li><a href="/index.html#about">About</a></li>
                <li><a href="/index.html#explore">Explore</a></li>
                <li><a href="/index.html#footer">Contact</a></li>
            </ul>
        </div>
    </div>
</nav>
 
<div class="sidebar close">
    <div class="sidebar-header">
        <button class="sidebar-toggle" type="button" aria-label="Toggle sidebar">
            <i class='bx bx-menu'></i>
        </button>
    </div>
    <ul class="nav-links">
        <li>
            <a href="/index.html">
                <i class='bx bx-home-alt'></i>
                <span class="link_name">Home</span>
            </a>
            <ul class="sub-menu blank">
                <li><a class="link_name" href="/index.html">Home</a></li>
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
    </ul>
</div>`;

  /* ─── Inject into placeholder ─── */
  const placeholder = document.getElementById("navbar-placeholder");
  if (placeholder) {
    placeholder.innerHTML = NAV_HTML;
  }

    /* ─── Sidebar toggle ─── */
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

  /* ─── Click-based submenus ─── */
  document.querySelectorAll(".iocn-link").forEach((iocnLink) => {
    const link = iocnLink.querySelector("a");
    if (!link) return;

    if (!iocnLink.querySelector(".arrow")) {
      const arrow = document.createElement("i");
      arrow.className = "bx bxs-chevron-down arrow";
      iocnLink.appendChild(arrow);
    }

    link.addEventListener("click", (e) => {
      e.preventDefault();
      const parentLi = iocnLink.closest("li");
      if (!parentLi) return;

      const isOpen = parentLi.classList.contains("showMenu");

      document.querySelectorAll(".nav-links li.showMenu").forEach((li) => {
        li.classList.remove("showMenu");
      });

      if (!isOpen) {
        parentLi.classList.add("showMenu");
      }
    });
  });
})();