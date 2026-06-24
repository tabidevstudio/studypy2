"use strict";

const mongoose = require("mongoose");

/* ── Sub-document: a single link entry ───────────────────────────────────── */
const LinkSchema = new mongoose.Schema(
  {
    title:       { type: String, required: true, trim: true },
    description: { type: String, required: true, trim: true },
    url:         { type: String, required: true, trim: true },
  },
  { _id: false }        
);

/* ── Sub-document: a page inside a category ──────────────────────────────── */
const PageSchema = new mongoose.Schema(
  {
    name:  { type: String, required: true, trim: true },
    path:  { type: String, required: true, trim: true }, 
    links: { type: [LinkSchema], default: [] },
  },
  { _id: false }
);

/* ── Top-level document: a resource category ─────────────────────────────── */
const CategorySchema = new mongoose.Schema(
  {
    name:  { type: String, required: true, unique: true, trim: true },
    path:  { type: String, required: true, trim: true },              
    pages: { type: [PageSchema], default: [] },
  },
  {
    timestamps: true, 
    collection: "resources",
  }
);

module.exports = mongoose.model("Category", CategorySchema);
