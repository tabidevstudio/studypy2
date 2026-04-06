# Data.json Pages Mapping & Integration Guide

## 1. CURRENT DATA.JSON REFERENCES

**Pages Currently Using data.json:**
- ✅ `interactive-coding.html` - Has `data-page="interactive-coding"` attribute
- ✅ Links are served via `/links` endpoint (backend: `server.js` line 38-46)

**Pages NOT yet using data.json:**
- ❌ All other 24 pages (need `data-page="[page-name]"` attribute added to their `#tools-container` div)

**Backend Location:** `/backend/data/data.json` (currently doesn't exist - exists in `/frontend/data/data.json`)

---

## 2. COMPLETE PAGE MAPPING STRUCTURE

| Category | Page Name | Page Slug | HTML File |
|----------|-----------|-----------|-----------|
| **Learning** | Interactive Coding | `interactive-coding` | `Learning/interactive-coding.html` ✅ |
| | Book & eBooks | `book-and-ebooks` | `Learning/book-and-ebooks.html` |
| | Online Courses | `online-courses` | `Learning/online-courses.html` |
| | Video Tutorials | `video-tutorials` | `Learning/video-tutorials.html` |
| **Career** | Interview Prep | `interview-prep` | `Career/Interview-prep.html` |
| | Job Boards | `job-boards` | `Career/job-boards.html` |
| | Resume Building | `resume-building` | `Career/resume-building.html` |
| **Challenges** | Coding Problems | `coding-problems` | `Challenges/coding-problems.html` |
| | Competition | `competition` | `Challenges/competition.html` |
| | Project Ideas | `projectideas` | `Challenges/projectideas.html` |
| **Communities** | Discord Servers | `discord-servers` | `Communities/discord-servers.html` |
| | Forums | `forums` | `Communities/forums.html` |
| | Study Groups | `study-groups` | `Communities/study-groups.html` |
| **Dev Tools** | Debugging Tools | `debugging-tools` | `Dev Tools/debugging-tools.html` |
| | Fun Tools | `fun-tools` | `Dev Tools/fun-tools.html` |
| | IDEs | `ides` | `Dev Tools/IDES.html` |
| | Version Control | `version-control` | `Dev Tools/version-control.html` |
| **Docs** | API References | `api-references` | `Docs/api-references.html` |
| | Cheat Sheets | `cheat-sheets` | `Docs/cheat-sheets.html` |
| | Official Docs | `official-docs` | `Docs/official-docs.html` |
| **Languages** | C/C++ | `c-cpp` | `languages/c-cpp.html` |
| | Java | `java` | `languages/java.html` |
| | JavaScript | `javascript` | `languages/javascript.html` |
| | PHP | `php` | `languages/php.html` |
| | Python | `python` | `languages/python.html` |

---

## 3. DATA.JSON TEMPLATE

Each page entry requires this structure:

```json
{
  "name": "page-slug-here",
  "path": "frontend/pages/Category/page.html",
  "links": [
    {
      "title": "Resource Title",
      "description": "Brief description of what this resource offers",
      "url": "https://example.com"
    },
    {
      "title": "Another Resource",
      "description": "What you can learn or do with this resource",
      "url": "https://example.com"
    }
  ]
}
```

### Required Fields:
- **name** (string): Page identifier/slug - must match `data-page` attribute in HTML
- **title** (string): Display title of the link
- **description** (string): 1-2 sentence description of the resource
- **url** (string): Full URL (must start with http/https)

### Guidelines:
- Use kebab-case for page names: `online-courses`, `resume-building`, etc.
- Description should be user-friendly and highlight value proposition
- Include 5-10 quality links per page for best UX
- Test all URLs before adding

---

## 4. HOW IT WORKS

```
User visits page
    ↓
HTML has <div id="tools-container" data-page="page-slug"></div>
    ↓
links.js runs loadLinks()
    ↓
Fetches from /links endpoint
    ↓
Backend reads /backend/data/data.json
    ↓
JavaScript finds matching page by slug
    ↓
Renders card for each link with title + description
```

---

## 5. INTEGRATION CHECKLIST

- [ ] Copy data.json to `/backend/data/data.json`
- [ ] Update all 24 pages to add `data-page` attribute
- [ ] Add link entries for each page in data.json
- [ ] Test each page loads links correctly
- [ ] Verify all URLs are working (no 404s)
- [ ] Test search functionality with new links
