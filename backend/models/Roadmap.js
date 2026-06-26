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
    label: { type: String, required: true, trim: true },  
    type:  { type: String, default: "must" },            
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
    label: { type: String, required: true, trim: true }, 
    steps: { type: [StepSchema], default: [] },
  },
  { _id: false }
);

/* ── Top-level document: one document per roadmap track ──────────────────── */
const RoadmapSchema = new mongoose.Schema(
  {
    trackId:     { type: String, required: true, unique: true, trim: true }, 
    title:       { type: String, required: true, trim: true },
    description: { type: String, required: true, trim: true },
    icon:        { type: String, default: "bx-map-alt" },   
    iconColor:   { type: String, default: "#fff" },
    iconBg:      { type: String, default: "rgba(255,255,255,0.1)" },
    meta:        { type: [String], default: [] },             
    order:       { type: Number, default: 0 },                
    phases:      { type: [PhaseSchema], default: [] },
  },
  {
    timestamps: true,
    collection: "roadmaps",
  }
);

module.exports = mongoose.model("Roadmap", RoadmapSchema);
