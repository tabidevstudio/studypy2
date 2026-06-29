"use strict";

const mongoose = require("mongoose");

const UserSchema = new mongoose.Schema(
  {
    username: { type: String, required: true },
    email: { type: String, required: true, unique: true, lowercase: true, trim: true },
    googleId: { type: String, unique: true, sparse: true },
    githubId: { type: String, unique: true, sparse: true },
    avatar: { type: String },
    bookmarks: { type: [String], default: [] },
    watchedVideos: { type: [String], default: [] },
    streak: {
      count: { type: Number, default: 0 },
      lastActiveDate: { type: String, default: "" }
    },
    // ── Resume Builder ───────────────────────────────────────
    resume: {
      templateId:  { type: String, default: "" },
      accentColor: { type: String, default: "#91DAEB" },
      textColor:   { type: String, default: "#222222" },
      headerTextColor: { type: String, default: "#ffffff" },
      font:        { type: String, default: "poppins" },
      pageSize:    { type: String, default: "A4" },
      spacing:     { type: String, default: "normal" },
      personalInfo: {
        name:      { type: String, default: "" },
        email:     { type: String, default: "" },
        phone:     { type: String, default: "" },
        linkedin:  { type: String, default: "" },
        github:    { type: String, default: "" },
        portfolio: { type: String, default: "" },
        photo:     { type: String, default: "" }
      },
      summary:        { type: String, default: "" },
      education:      { type: Array,    default: [] },
      skills:         { type: [String], default: [] },
      projects:       { type: Array,    default: [] },
      experience:     { type: Array,    default: [] },
      certifications: { type: Array,    default: [] },
      lastSaved:      { type: String,   default: "" }
    }
  },
  {
    timestamps: true,
    collection: "users"
  }
);

module.exports = mongoose.model("User", UserSchema);
