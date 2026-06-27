"use strict";

const mongoose = require("mongoose");

/* ── Top-level document: one document per community ──────────────────────── */
const CommunitySchema = new mongoose.Schema(
  {
    name:        { type: String, required: true, trim: true },
    platform:    { type: String, required: true, trim: true, enum: ["reddit", "facebook", "linkedin", "telegram", "stackoverflow", "devto", "hashnode", "slack", "other"] },
    url:         { type: String, required: true, trim: true },
    description: { type: String, required: true, trim: true },
    memberCount: { type: String, default: "" },       // e.g. "900k+", "1.3M+" — display string
    icon:        { type: String, default: "bx-group" },
    tags:        { type: [String], default: [] },     // e.g. ["python", "beginner", "jobs"]
    featured:    { type: Boolean, default: false },   // show a "Popular" badge
    active:      { type: Boolean, default: true },    // soft-delete / hide without removing
    order:       { type: Number, default: 0 },        // sort order within platform group
  },
  {
    timestamps: true,
    collection: "communities",
  }
);

module.exports = mongoose.model("Community", CommunitySchema);
