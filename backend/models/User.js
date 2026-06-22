"use strict";

const mongoose = require("mongoose");

const UserSchema = new mongoose.Schema(
  {
    username: { type: String, required: true },
    email: { type: String, required: true, unique: true, lowercase: true, trim: true },
    googleId: { type: String, unique: true, sparse: true },
    githubId: { type: String, unique: true, sparse: true },
    avatar: { type: String },
    bookmarks: { type: [String], default: [] }, // Array of bookmarked URL paths
    watchedVideos: { type: [String], default: [] }, // Array of video URLs/IDs
    streak: {
      count: { type: Number, default: 0 },
      lastActiveDate: { type: String, default: "" } // Format: "YYYY-MM-DD"
    }
  },
  {
    timestamps: true,
    collection: "users"
  }
);

module.exports = mongoose.model("User", UserSchema);
