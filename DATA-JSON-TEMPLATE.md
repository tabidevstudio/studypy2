# Data.json Template & Quick Add Guide

## Single Page Template

Copy this template and customize for each new page:

```json
{
  "name": "page-slug-here",
  "path": "frontend/pages/Category/page-name.html",
  "links": [
    {
      "title": "Resource Title",
      "description": "One or two sentence description highlighting the main value or benefit.",
      "url": "https://example.com"
    },
    {
      "title": "Another Resource",
      "description": "Brief description of what learners can achieve with this resource.",
      "url": "https://example.com"
    }
  ]
}
```

---

## Adding New Pages to data.json Structure

### Step 1: Create the Category Entry (if new category)
```json
{
  "name": "category-slug",
  "path": "frontend/pages/CategoryName",
  "pages": [
    // Add page entries here
  ]
}
```

### Step 2: Add Page Inside Category
```json
{
  "name": "page-slug",
  "path": "frontend/pages/CategoryName/page-name.html",
  "links": [
    // Add link entries here
  ]
}
```

### Step 3: Add Links to Page
```json
{
  "title": "Resource Name",
  "description": "Clear, concise description of the resource.",
  "url": "https://full-valid-url.com"
}
```

---

## Naming Conventions

### Page Slugs (name field)
- Use **kebab-case**: `interactive-coding`, `resume-building`, `api-references`
- No spaces or special characters except hyphens
- Must be **unique** within entire data.json
- Should match the intention of the page

### Examples:
- HTML file: `Interview-prep.html` → slug: `interview-prep`
- HTML file: `online-courses.html` → slug: `online-courses`
- HTML file: `IDES.html` → slug: `ides`

---

## Adding to HTML Pages

Each page that uses data.json needs:

```html
<div id="tools-container" data-page="page-slug"></div>

<script src="../../script.js"></script>
<script src="../../search.js"></script>
<script src="../../links.js"></script>
```

Replace `page-slug` with the actual page name from data.json.

---

## Link Best Practices

### Description Template:
```
"[Action] [context/domain] with [key benefit/feature]"
```

### Good Examples:
- ✅ "Learn to code for free with interactive tutorials and build real projects."
- ✅ "Thousands of coding problems organized by difficulty and topic with solutions."
- ✅ "World's largest Q&A platform for programmers with millions of answered questions."
- ✅ "Grow in your career and unlock new opportunities by learning in-demand skills."

### Poor Examples:
- ❌ "A coding website"
- ❌ "Good for learning"
- ❌ "Programming resource"

---

## Quick Validation Checklist

Before adding links:
- [ ] **URL is valid** - Starts with http:// or https://
- [ ] **URL is working** - No 404s or redirects
- [ ] **Description is unique** - Not copied from another link
- [ ] **Title matches official name** - Use the official resource name
- [ ] **Relevance** - Link matches the page topic
- [ ] **Quality** - Resource is legitimate and well-maintained

---

## Common Mistakes to Avoid

| ❌ Wrong | ✅ Correct |
|---------|----------|
| `"title": ""` | `"title": "freeCodeCamp"` |
| `"description": "coding"` | `"description": "Learn to code for free with interactive tutorials"` |
| `"url": "google.com"` | `"url": "https://www.google.com"` |
| `"name": "Java Script"` | `"name": "javascript"` |
| `"name": "INTERVIEW-PREP"` | `"name": "interview-prep"` |

---

## Batch Add Example

Adding 3 links to the `python` page:

```json
{
  "name": "python",
  "path": "frontend/pages/languages/python.html",
  "links": [
    {
      "title": "Python Official Documentation",
      "description": "Complete Python documentation including tutorial, library reference, and language reference.",
      "url": "https://docs.python.org/3/"
    },
    {
      "title": "Real Python",
      "description": "High-quality Python tutorials covering beginner to advanced topics.",
      "url": "https://realpython.com/"
    },
    {
      "title": "GeeksforGeeks Python",
      "description": "Comprehensive Python tutorials with examples and solutions.",
      "url": "https://www.geeksforgeeks.org/python/"
    }
  ]
}
```

---

## Testing Your Changes

1. **Syntax**: Validate JSON at [jsonlint.com](https://www.jsonlint.com/)
2. **Backend**: Restart backend server
3. **Frontend**: Clear browser cache and reload page
4. **Console**: Check for errors in browser DevTools
5. **Links**: Click each link to verify URL works

---

## Files to Update

When adding a new page to data.json, remember to also:

1. Add `data-page` attribute to HTML file
2. Include `links.js` script in HTML
3. Copy updated `data.json` to `/backend/data/data.json`
4. Restart backend server
5. Clear frontend cache
