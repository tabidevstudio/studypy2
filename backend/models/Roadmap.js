"use strict";

const mongoose = require("mongoose");

/* ── Sub-document: a link inside a step ──────────────────────────────────── */
const StepLinkSchema = new mongoose.Schema(
  {
    label:    { type: String, required: true, trim: true },
    url:      { type: String, required: true, trim: true },
    icon:     { type: String, default: "bx-link" },
    external: { type: Boolean, default: false },
  },
  { _id: false }
);

/* ── Sub-document: a tag badge on a step ─────────────────────────────────── */
const StepTagSchema = new mongoose.Schema(
  {
    label: { type: String, required: true, trim: true },  // e.g. "Must Learn"
    type:  { type: String, default: "must" },             // must | optional | good
  },
  { _id: false }
);

/* ── Sub-document: a single step in a phase ──────────────────────────────── */
const StepSchema = new mongoose.Schema(
  {
    number:      { type: Number, required: true },
    title:       { type: String, required: true, trim: true },
    optional:    { type: Boolean, default: false },
    tags:        { type: [StepTagSchema], default: [] },
    description: { type: String, required: true, trim: true },
    links:       { type: [StepLinkSchema], default: [] },
  },
  { _id: false }
);

/* ── Sub-document: a phase grouping steps ────────────────────────────────── */
const PhaseSchema = new mongoose.Schema(
  {
    label: { type: String, required: true, trim: true },  // e.g. "Phase 1 — The Basics"
    steps: { type: [StepSchema], default: [] },
  },
  { _id: false }
);

/* ── Top-level document: one document per roadmap track ──────────────────── */
const RoadmapSchema = new mongoose.Schema(
  {
    trackId:     { type: String, required: true, unique: true, trim: true }, // e.g. "frontend"
    title:       { type: String, required: true, trim: true },
    description: { type: String, required: true, trim: true },
    icon:        { type: String, default: "bx-map-alt" },    // boxicons class
    iconColor:   { type: String, default: "#fff" },
    iconBg:      { type: String, default: "rgba(255,255,255,0.1)" },
    meta:        { type: [String], default: [] },             // pill labels
    order:       { type: Number, default: 0 },                // display order
    phases:      { type: [PhaseSchema], default: [] },
  },
  {
    timestamps: true,
    collection: "roadmaps",
  }
);

module.exports = mongoose.model("Roadmap", RoadmapSchema);
