"use strict";

const mongoose = require("mongoose");

/* ── Top-level document: one document per AI tool ────────────────────────── */
const AiToolSchema = new mongoose.Schema(
  {
    name:           { type: String, required: true, trim: true },
    maker:          { type: String, required: true, trim: true },
    logoUrl:        { type: String, default: "" },
    logoFallback:   { type: String, default: "🤖" },
    logoStyle:      { type: String, default: "" },        // inline CSS for logo fallback div
    tags:           { type: [String], default: [] },      // filter tags e.g. ["free", "vscode"]
    categories:     { type: [String], default: [] },      // display labels e.g. ["Autocomplete"]
    categoryColors: { type: [String], default: [] },      // matching color per category badge
    description:    { type: String, required: true, trim: true },
    pricing:        { type: String, enum: ["free", "freemium", "paid"], default: "freemium" },
    beginnerPick:   { type: Boolean, default: false },
    url:            { type: String, required: true, trim: true },
    btnLabel:       { type: String, default: "Visit Site" },
    btnClass:       { type: String, default: "mirror" },  // "try" (teal) | "mirror" (subtle)
    order:          { type: Number, default: 0 },         // display order in table
  },
  {
    timestamps: true,
    collection: "ai_tools",
  }
);

module.exports = mongoose.model("AiTool", AiToolSchema);
