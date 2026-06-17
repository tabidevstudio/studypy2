"use strict";

const mongoose = require("mongoose");

/* ── Sub-document: a single link entry ───────────────────────────────────── */
const LinkSchema = new mongoose.Schema(
  {
    title:       { type: String, required: true, trim: true },
    description: { type: String, required: true, trim: true },
    url:         { type: String, required: true, trim: true },
  },
  { _id: false }          // links are embedded; no separate _id needed
);

/* ── Sub-document: a page inside a category ──────────────────────────────── */
const PageSchema = new mongoose.Schema(
  {
    name:  { type: String, required: true, trim: true }, // e.g. "online-courses"
    path:  { type: String, required: true, trim: true }, // e.g. "frontend/pages/Learning/online-courses.html"
    links: { type: [LinkSchema], default: [] },
  },
  { _id: false }
);

/* ── Top-level document: a resource category ─────────────────────────────── */
const CategorySchema = new mongoose.Schema(
  {
    name:  { type: String, required: true, unique: true, trim: true }, // e.g. "learning"
    path:  { type: String, required: true, trim: true },               // e.g. "frontend/pages/Learning"
    pages: { type: [PageSchema], default: [] },
  },
  {
    timestamps: true,   // createdAt / updatedAt for free
    collection: "categories",
  }
);

module.exports = mongoose.model("Category", CategorySchema);
