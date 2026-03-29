# StudyPY 👨🏻‍💻

A centralized learning platform for IT/CS students.

## Requirements

Before running this project, make sure you have:
- [Node.js](https://nodejs.org/) installed (v18 or higher)
- An API key from [OnlineCompiler.io](https://onlinecompiler.io) (free)

## Setup

### 1. Clone the repo
```bash
git clone https://github.com/BrianC0des/Studypy.git
cd Studypy
```

### 2. Install root dependencies
```bash
npm install
```

### 3. Install backend dependencies
```bash
cd backend
npm install
cd ..
```

### 4. Create your .env file
Create a file called `.env` inside the `backend/` folder:
```
API_KEY=your_onlinecompiler_api_key_here
```
Get your free API key at https://onlinecompiler.io

### 5. Run the project
```bash
npm run dev
```

This starts both the frontend and backend at the same time:
- Frontend: http://localhost:5500
- Backend: http://localhost:3000

## Project Structure
```
Studypy/
├── frontend/          # HTML, CSS, JS files
│   ├── index.html
│   ├── compiler.js    # Shared compiler logic
│   ├── compiler.css   # Compiler styles
│   └── pages/         # All site pages
└── backend/           # Node.js API server
    ├── server.js
    └── .env           # Your API key (never shared)
```
