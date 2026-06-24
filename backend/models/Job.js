// backend/models/Job.js
const mongoose = require("mongoose");

const JobSchema = new mongoose.Schema({
    title: { type: String, required: true },
    company: { type: String, required: true },
    location: { type: String, required: true },
    description: { type: String },
    applyLink: { type: String, required: true, unique: true }, // unique constraint prevents duplicates
    salary: { type: String },
    source: { type: String, required: true }, // e.g. "Jooble", "Adzuna"
    postedAt: { type: Date, default: Date.now },
    techTags: [{ type: String }], // e.g. ["Python", "JavaScript"]
    workMode: { type: String, enum: ["remote", "onsite", "hybrid"], default: "onsite" },
    experienceLevel: { type: String, enum: ["internship", "entry-level", "any"], default: "any" }
}, { timestamps: true });

// Add text index for fast searching across title, company, and description
JobSchema.index({ title: "text", company: "text", description: "text" });

module.exports = mongoose.model("Job", JobSchema);

