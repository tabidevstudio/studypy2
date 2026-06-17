"use strict";

const express  = require("express");
const fetch    = require("node-fetch");
const cors     = require("cors");
const mongoose = require("mongoose");
require("dotenv").config();

const Category = require("./models/Resource");

const app = express();
app.use(cors());
app.use(express.json());

/* ─────────────────────────────────────────────────────────────────────────────
   POST /run  —  Compiler proxy: forwards code to external OnlineCompiler API.
   The API key never reaches the frontend.
───────────────────────────────────────────────────────────────────────────── */
app.post("/run", async (req, res) => {
  const { language, code, input } = req.body;

  if (!language || !code) {
    return res.status(400).json({ error: "Missing language or code." });
  }

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
    res.json(data);
  } catch (err) {
    res.status(500).json({ error: "Failed to reach compiler API." });
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