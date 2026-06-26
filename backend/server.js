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

// ── Models ───────────────────────────────────────────────────────────────────
const Resource  = require("./models/Resource");    // resource link categories
const Flashcard = require("./models/Flashcard");   // coding flashcard questions
const Roadmap   = require("./models/Roadmap");     // learning roadmap tracks
const AiTool    = require("./models/AiTool");      // AI coding tools table

const authRouter = require("./routes/auth");
const forumRouter = require("./routes/forum");
const communitiesRouter = require("./routes/Community");
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
// Mount forum router
app.use("/api/forum", forumRouter);
// Mount communities router
app.use("/api/communities", communitiesRouter);

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
───────────────────────────────────────────────────────────────────────────── */
app.get("/links", async (req, res) => {
  try {
    const categories = await Resource.find({}, { __v: 0, createdAt: 0, updatedAt: 0 }).lean();
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
app.get("/search", async (req, res) => {
  const query = req.query.q;
  if (!query) {
    return res.status(400).json({ error: "Missing query parameter 'q'." });
  }

  try {
    const results = await Resource.aggregate([
      { $unwind: "$pages" },
      { $unwind: "$pages.links" },
      {
        $match: {
          $or: [
            { "pages.links.title":       { $regex: query, $options: "i" } },
            { "pages.links.description": { $regex: query, $options: "i" } },
            { "pages.name":              { $regex: query, $options: "i" } },
            { "name":                    { $regex: query, $options: "i" } }
          ]
        }
      },
      {
        $project: {
          _id: 0,
          title:        "$pages.links.title",
          description:  "$pages.links.description",
          url:          "$pages.links.url",
          pageName:     "$pages.name",
          pagePath:     "$pages.path",
          categoryName: "$name"
        }
      }
    ]);

    res.json({ results });
  } catch (err) {
    console.error("GET /search error:", err.message);
    res.status(500).json({ error: "Failed to perform global search." });
  }
});

/* ─────────────────────────────────────────────────────────────────────────────
   GET /api/jobs  —  Returns jobs filtered by tech, mode, location, type.
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
   GET /api/flashcards          → all languages summary
   GET /api/flashcards?lang=python            → full doc for one language
   GET /api/flashcards?lang=python&diff=easy  → only the easy array
───────────────────────────────────────────────────────────────────────────── */
app.get("/api/flashcards", async (req, res) => {
  const { lang, diff } = req.query;

  try {
    // No language specified → return list of available languages
    if (!lang) {
      const summary = await Flashcard.find(
        {},
        { language: 1, displayName: 1, _id: 0,
          easyCount: { $size: "$easy" },
          mediumCount: { $size: "$medium" },
          hardCount: { $size: "$hard" } }
      ).lean();
      return res.json({ flashcards: summary });
    }

    // Fetch for a specific language
    const doc = await Flashcard.findOne(
      { language: lang.toLowerCase() },
      { __v: 0, createdAt: 0, updatedAt: 0 }
    ).lean();

    if (!doc) {
      return res.status(404).json({ error: `No flashcards found for language: ${lang}` });
    }

    // Optionally filter to a single difficulty
    if (diff) {
      const validDiffs = ["easy", "medium", "hard"];
      if (!validDiffs.includes(diff.toLowerCase())) {
        return res.status(400).json({ error: "Invalid difficulty. Use: easy, medium, or hard." });
      }
      return res.json({
        language:    doc.language,
        displayName: doc.displayName,
        difficulty:  diff.toLowerCase(),
        questions:   doc[diff.toLowerCase()],
      });
    }

    return res.json(doc);

  } catch (err) {
    console.error("GET /api/flashcards error:", err.message);
    res.status(500).json({ error: "Failed to fetch flashcards from the database." });
  }
});

/* ─────────────────────────────────────────────────────────────────────────────
   GET /api/roadmaps            → all tracks (sorted by order)
   GET /api/roadmaps/:trackId   → single track with full phase/step detail
───────────────────────────────────────────────────────────────────────────── */
app.get("/api/roadmaps", async (req, res) => {
  try {
    const tracks = await Roadmap.find(
      {},
      { __v: 0, createdAt: 0, updatedAt: 0 }
    ).sort({ order: 1 }).lean();

    res.json({ roadmaps: tracks });
  } catch (err) {
    console.error("GET /api/roadmaps error:", err.message);
    res.status(500).json({ error: "Failed to fetch roadmaps from the database." });
  }
});

app.get("/api/roadmaps/:trackId", async (req, res) => {
  try {
    const track = await Roadmap.findOne(
      { trackId: req.params.trackId },
      { __v: 0, createdAt: 0, updatedAt: 0 }
    ).lean();

    if (!track) {
      return res.status(404).json({ error: `No roadmap found for track: ${req.params.trackId}` });
    }

    res.json(track);
  } catch (err) {
    console.error("GET /api/roadmaps/:trackId error:", err.message);
    res.status(500).json({ error: "Failed to fetch roadmap from the database." });
  }
});

/* ─────────────────────────────────────────────────────────────────────────────
   GET /api/ai-tools  —  Returns all AI coding tools sorted by display order.
───────────────────────────────────────────────────────────────────────────── */
app.get("/api/ai-tools", async (req, res) => {
  try {
    const tools = await AiTool.find(
      {},
      { __v: 0, createdAt: 0, updatedAt: 0 }
    ).sort({ order: 1 }).lean();

    res.json({ tools });
  } catch (err) {
    console.error("GET /api/ai-tools error:", err.message);
    res.status(500).json({ error: "Failed to fetch AI tools from the database." });
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
