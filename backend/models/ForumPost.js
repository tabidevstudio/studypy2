"use strict";

const mongoose = require("mongoose");

const replySchema = new mongoose.Schema({
  author: { type: mongoose.Schema.Types.ObjectId, ref: 'User', required: true },
  content: { type: String, required: true },
  createdAt: { type: Date, default: Date.now }
});

const forumPostSchema = new mongoose.Schema({
  author: { type: mongoose.Schema.Types.ObjectId, ref: 'User', required: true },
  title: { type: String, required: true },
  content: { type: String, required: true },
  replies: [replySchema]
}, { timestamps: true, collection: 'forum_posts' });

module.exports = mongoose.model('ForumPost', forumPostSchema);
