"use strict";

const mongoose = require("mongoose");

/* ── Top-level document: one document per AI tool ────────────────────────── */
const AiToolSchema = new mongoose.Schema(
  {
    name:           { type: String, required: true, trim: true },
    maker:          { type: String, required: true, trim: true },
    logoUrl:        { type: String, default: "" },
    logoFallback:   { type: String, default: "🤖" },
    logoStyle:      { type: String, default: "" },    
    tags:           { type: [String], default: [] },     
    categories:     { type: [String], default: [] },    
    categoryColors: { type: [String], default: [] },      
    description:    { type: String, required: true, trim: true },
    pricing:        { type: String, enum: ["free", "freemium", "paid"], default: "freemium" },
    beginnerPick:   { type: Boolean, default: false },
    url:            { type: String, required: true, trim: true },
    btnLabel:       { type: String, default: "Visit Site" },
    btnClass:       { type: String, default: "mirror" },  
    order:          { type: Number, default: 0 },        
  },
  {
    timestamps: true,
    collection: "ai_tools",
  }
);

module.exports = mongoose.model("AiTool", AiToolSchema);
