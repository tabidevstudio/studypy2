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
    }
  },
  {
    timestamps: true,
    collection: "users"
  }
);

module.exports = mongoose.model("User", UserSchema);
