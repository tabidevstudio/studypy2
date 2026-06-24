"use strict";

const mongoose = require("mongoose");

/* ── Sub-document: a single question option ──────────────────────────────── */
const QuestionSchema = new mongoose.Schema(
  {
    question:    { type: String, required: true, trim: true },
    code:        { type: String, default: "" },      
    options:     { type: [String], required: true },   
    answer:      { type: Number, required: true }, 
    explanation: { type: String, required: true, trim: true },
  },
  { _id: false }
);

/* ── Top-level document: one document per programming language ───────────── */
const FlashcardSchema = new mongoose.Schema(
  {
    language:    { type: String, required: true, unique: true, trim: true, lowercase: true },
    displayName: { type: String, required: true, trim: true },                             
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
