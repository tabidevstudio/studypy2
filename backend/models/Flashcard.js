"use strict";

const mongoose = require("mongoose");

/* ── Sub-document: a single question option ──────────────────────────────── */
const QuestionSchema = new mongoose.Schema(
  {
    question:    { type: String, required: true, trim: true },
    code:        { type: String, default: "" },          // optional code snippet
    options:     { type: [String], required: true },     // 4 answer choices
    answer:      { type: Number, required: true },       // 0-indexed correct answer
    explanation: { type: String, required: true, trim: true },
  },
  { _id: false }
);

/* ── Top-level document: one document per programming language ───────────── */
const FlashcardSchema = new mongoose.Schema(
  {
    language:    { type: String, required: true, unique: true, trim: true, lowercase: true }, // e.g. "python"
    displayName: { type: String, required: true, trim: true },                                // e.g. "Python"
    easy:        { type: [QuestionSchema], default: [] },
    medium:      { type: [QuestionSchema], default: [] },
    hard:        { type: [QuestionSchema], default: [] },
  },
  {
    timestamps: true,
    collection: "flashcards",
  }
);

module.exports = mongoose.model("Flashcard", FlashcardSchema);
