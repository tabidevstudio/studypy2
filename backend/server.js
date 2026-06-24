"use strict";

const express      = require("express");
const fetch        = require("node-fetch");
const cors         = require("cors");
const cookieParser = require("cookie-parser");
const mongoose     = require("mongoose");
const { exec }     = require("child_process");
const fs           = require("fs");
const path         = require("path");
const os           = require("os");
require("dotenv").config();

const Category = require("./models/Resource");
const authRouter = require("./routes/auth");
const Job = require("./models/Job.js");
const app = express();

app.use(cors({
  origin: function(origin, callback) {
    const allowedOrigins = [
      process.env.FRONTEND_URL,
      "http://localhost:5500",
      "http://127.0.0.1:5500",
      "http://localhost:3000"
    ].filter(Boolean).map(o => o.replace(/\/$/, ""));
    
    // Allow requests with no origin (like mobile apps, postman, curl)
    // or origins that match allowed origins
    if (!origin || allowedOrigins.some(o => origin.startsWith(o))) {
      callback(null, true);
    } else {
      callback(new Error("Not allowed by CORS"));
    }
  },
  credentials: true
}));

app.use(cookieParser());
app.use(express.json());

// Mount authentication router
app.use("/api/auth", authRouter);


/* ─────────────────────────────────────────────────────────────────────────────
   POST /run  —  Compiler proxy: forwards code to external OnlineCompiler API.
   The API key never reaches the frontend.
───────────────────────────────────────────────────────────────────────────── */
app.post("/run", async (req, res) => {
  const { language, code, input } = req.body;

  if (!language || !code) {
    return res.status(400).json({ error: "Missing language or code." });
  }

  // If API_KEY is set, use onlinecompiler.io
  if (process.env.API_KEY) {
    try {
      const response = await fetch("https://api.onlinecompiler.io/api/run-code-sync/", {
        method: "POST",
        headers: {
          Authorization:  process.env.API_KEY,
          "Content-Type": "application/json",
        },
        body: JSON.stringify({ compiler: language, code, input: input || "" }),
      });

      const data = await response.json();
      return res.json(data);
    } catch (err) {
      return res.status(500).json({ error: "Failed to reach compiler API." });
    }
  }

  // Local fallback for python3
  if (language === "python3") {
    const tempDir = os.tmpdir();
    const tempFile = path.join(tempDir, `studypy_run_${Date.now()}_${Math.random().toString(36).substr(2, 5)}.py`);

    try {
      fs.writeFileSync(tempFile, code, "utf8");

      exec(`python "${tempFile}"`, { timeout: 5000 }, (error, stdout, stderr) => {
        try {
          fs.unlinkSync(tempFile);
        } catch (e) {}

        if (error && error.killed) {
          return res.json({ errors: "Execution timed out (5s limit)." });
        }

        const errors = stderr ? stderr.toString() : "";
        const output = stdout ? stdout.toString() : "";

        res.json({
          output: output,
          errors: errors || (error ? error.message : "")
        });
      });
    } catch (err) {
      try {
        fs.unlinkSync(tempFile);
      } catch (e) {}
      res.status(500).json({ error: `Local python execution failed: ${err.message}` });
    }
  } else {
    res.status(400).json({ error: "API_KEY not configured for onlinecompiler.io and local execution is only supported for python3." });
  }
});

/* ─────────────────────────────────────────────────────────────────────────────
   GET /links  —  Returns all resource categories from MongoDB Atlas.
   Replaces the previous fs.readFileSync(data.json) implementation.
───────────────────────────────────────────────────────────────────────────── */
app.get("/links", async (req, res) => {
  try {
    const categories = await Category.find({}, { __v: 0, createdAt: 0, updatedAt: 0 }).lean();
    res.json({ categories });
  } catch (err) {
    console.error("GET /links error:", err.message);
    res.status(500).json({ error: "Failed to fetch resource links from the database." });
  }
});

/* ─────────────────────────────────────────────────────────────────────────────
   GET /search  —  Performs a text search across all categories in MongoDB.
   Query parameter: q=search_term
───────────────────────────────────────────────────────────────────────────── */

app.get("/api/jobs", async (req, res) => {
    const { tech, mode, location, type } = req.query;
    const filter = {};

    if (tech) {
        filter.techTags = { $in: [new RegExp(tech, "i")] };
    }
    if (mode) {
        filter.workMode = mode;
    }
    if (location) {
        filter.location = new RegExp(location, "i");
    }
    if (type) {
        // strict match — no senior/mid roles slipping through
        filter.experienceLevel = type;
    } else {
        // default: exclude nothing, but block senior-level titles
        filter.title = {
            $not: /\b(senior|sr\.|lead|principal|staff|head of|manager|director|vp |vice president|architect)\b/i
        };
    }

    try {
        const jobs = await Job.find(filter).sort({ postedAt: -1 }).limit(50);
        res.json({ jobs });
    } catch (err) {
        console.error("Error querying jobs from MongoDB:", err.message);
        res.status(500).json({ error: "Failed to fetch job postings." });
    }
});

/* ─────────────────────────────────────────────────────────────────────────────
   Database connection → then start Express.
   The server only accepts requests once Atlas is confirmed reachable.
───────────────────────────────────────────────────────────────────────────── */
const PORT = process.env.PORT || 3000;

mongoose
  .connect(process.env.MONGO_URI)
  .then(() => {
    console.log("✅ Connected to MongoDB Atlas");
    app.listen(PORT, () => {
      console.log(`🚀 Backend running on port ${PORT}`);
    });
  })
  .catch((err) => {
    console.error("❌ MongoDB connection failed:", err.message);
    process.exit(1);   // Hard exit — do not start Express without a DB
  });
