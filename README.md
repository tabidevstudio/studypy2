# StudyPY 👨🏻‍💻

A centralized learning platform for IT/CS students – providing a code editor, learning resources, and study tools in one place.

## 📖 About The Project

**StudyPY** was built as a collaborative project to help IT/CS students access learning materials and practice coding without juggling multiple tools. It features an online Python compiler, organized video tutorials, and a code examples library – all in a clean, student-friendly interface.

### What It Does

- **Online Compiler** – Write and run code directly in the browser (powered by OnlineCompiler.io API)
- **Learning Videos** – Curated video tutorials organized by topic
- **Code Examples Library** – Ready-to-run code snippets for common algorithms and concepts
- **Clean Dashboard** – Central hub for all learning resources

### Tech Stack

| Layer    | Technology                    | Hosting          |
|----------|-------------------------------|------------------|
| Frontend | HTML, CSS, Vanilla JavaScript | Vercel           |
| Backend  | Node.js + Express             | Render           |
| API      | OnlineCompiler.io             | External service |

### Architecture

Frontend (Vercel) → Backend API (Render) → OnlineCompiler.io
↓ ↓ ↓
Static pages Proxies API requests Executes code
(hides API key)

The frontend never directly calls the third-party API – all compilation requests go through our backend, which adds the API key securely.

## 👥 Contributors

This project was developed by:

- Bryan P. Saavedra 
- Nur-Mohammad Zaarr L. Iraji
- Carl Marcel O. Mapa
- Landis Angelo J. Tarro

## 🎯 Purpose

This repository is part of a learning exercise in:
- Full-stack JavaScript development
- API integration and security (keeping keys safe)
- Deploying separate frontend and backend services
- Collaborative Git workflows

## 🔒 Private Repository

**Note:** This repository is for internal/educational purposes within the tabidevstudio team. It is not configured for public deployment or external contribution. Setup instructions are intentionally omitted as the project is maintained by its original contributors.

## 🚀 Live Deployment

- Frontend: [studypy.vercel.app](https://studypy.vercel.app)
- Backend: Hosted on Render (private endpoint)

---

*Built with ☕ by CCS students, for CCS students.*