# StudyPY 👨🏻‍💻

A centralized, interactive learning platform and sandbox hub for Information Technology & Computer Science students. StudyPy provides a multi-language online compiler, visual database sandboxes, version control simulators, and structured academic documentation in a single unified dashboard.

---

## 📖 Project Overview

**StudyPy** is designed to bridge the gap between theoretical computer science concepts and active practice. Beginners and advanced students alike can write code, visualize complex data structures, practice Git workflows, and experiment with databases without having to manage separate tools.

Originally built as a collection of static templates, the platform has evolved into a robust, full-stack web application powered by a MongoDB Atlas database, an Express API proxy, and native ES6 JavaScript module playgrounds.

---

## 🚀 Key Features & Interactive Sandboxes

### 💻 1. Multi-Language Online Compiler
A secure browser-based code runner utilizing CodeMirror 6 with full syntax highlighting, automatic indentation, tab-indent, and run stats tracking (Execution Time & Memory usage).
*   **Languages:** Python 3.14, Java (OpenJDK 25), C/C++ (GCC/G++ 15), JavaScript (Deno), and PHP 8.5.
*   **Safety:** Execution runs through our backend proxy server, shielding external compiler API tokens.

### 🌿 2. Git Branching Simulator
A visual version control simulator that models Git state transformations dynamically.
*   **Interactive Terminal:** Type standard Git commands (`git commit`, `git branch`, `git checkout`, `git merge`, `git log`) or use quick command buttons.
*   **Visual Canvas:** Renders commits as dynamic nodes connected via cubic Bezier curves on a scrollable SVG canvas, complete with branch labels and stacked `HEAD` pointers.
*   **Interactivity:** Click directly on any commit node to run `git checkout` to that commit.

### 📊 3. SQL Join & Venn Diagram Visualizer
A learning tool designed to demystify relational database joins.
*   **Shaded Venn Diagrams:** Choose INNER, LEFT, RIGHT, FULL, or anti-joins to watch corresponding SVG regions highlight instantly.
*   **Live SQL Queries:** Generates formatted SQL query templates with automatic keyword, alias, and NULL value syntax coloring.
*   **Dynamic Datasets:** Computes join records in real time over sample tables (`Employees` and `Departments`) to show exact outputs.

### 🧠 4. Data Structures & Algorithms Visualizer
An educational animator illustrating computer science algorithms.
*   **Sorting Algorithms:** Watch bubble sort, selection sort, and insertion sort rearrange array bars, highlighting comparing (yellow), swapping (red), and sorted (green) elements dynamically.
*   **Linear Structures:** Visualizes Push/Pop operations on LIFO Stacks and Enqueue/Dequeue operations on FIFO Queues, displaying top, front, and rear indicator arrows.

### 🔍 5. Curated Learning Tracks & Global Search
*   **Global Search API:** Site-wide search fetching matching titles and descriptions directly from MongoDB Atlas.
*   **Resource Library:** Dynamically loads curated online courses, video tutorials, e-books, and official documentation with localized browser caching for fast loading.

---

## 🛠️ Technology Stack

| Layer | Technologies | Primary Purpose |
| :--- | :--- | :--- |
| **Frontend** | HTML5, Vanilla JS (Strict ES6 Modules), CSS3 (Compiled Sass/SCSS) | Responsive UI, interactive engines, animations |
| **Backend** | Node.js, Express, Mongoose, dotenv, cors | Secure API routing, online compiler proxy |
| **Database** | MongoDB Atlas Cloud | Dynamic resource links and search indexes |
| **Integrations** | CodeMirror 6 (esm.sh CDN), Font Awesome, Boxicons | Text editing, iconography |

---

## 👥 Contributors

This project is built and maintained by the **CCS student developer team** at **Tabi Dev Studio**:

*   **Bryan P. Saavedra**
*   **Nur-Mohammad Zaarr L. Iraji**
*   **Carl Marcel O. Mapa**
*   **Landis Angelo J. Tarro**
*   **Norielle John Buhawe**


---

*Built with ☕ by CCS students, for CCS students.*