"use strict";

const express = require("express");
const ForumPost = require("../models/ForumPost");
const requireAuth = require("../middleware/requireAuth");
const sanitizeHtml = require("sanitize-html");

const router = express.Router();

// Sanitization / validation settings
const MAX_TITLE_LENGTH = 200;
const MAX_CONTENT_LENGTH = 20000;
const allowedContentTags = ["b", "i", "em", "strong", "a", "p", "ul", "ol", "li", "br", "code", "pre"];
const sanitizeContentOptions = {
  allowedTags: allowedContentTags,
  allowedAttributes: {
    a: ["href", "rel", "target"]
  },
  allowedSchemes: ["http", "https", "mailto"]
};

// GET /api/forum/  — return all posts
router.get("/", async (req, res) => {
  try {
    const posts = await ForumPost.find({})
      .populate("author", "username email avatar")
      .populate("replies.author", "username email avatar")
      .sort({ createdAt: -1 })
      .lean();

    res.json({ posts });
  } catch (err) {
    console.error("GET /api/forum error:", err.message);
    res.status(500).json({ error: "Failed to fetch forum posts." });
  }
});

// POST /api/forum/create  — create a new thread (requires auth)
router.post("/create", requireAuth, async (req, res) => {
  const { title: rawTitle, content: rawContent } = req.body || {};
  if (!rawTitle || !rawContent) {
    return res.status(400).json({ error: "Missing title or content." });
  }

  // Sanitize inputs
  const title = sanitizeHtml(String(rawTitle), { allowedTags: [], allowedAttributes: {} }).trim();
  const content = sanitizeHtml(String(rawContent), sanitizeContentOptions).trim();

  // Validate lengths
  if (!title || title.length > MAX_TITLE_LENGTH) {
    return res.status(400).json({ error: "Invalid title." });
  }
  if (!content || content.length > MAX_CONTENT_LENGTH) {
    return res.status(400).json({ error: "Invalid content." });
  }

  try {
    const post = new ForumPost({ author: req.user._id, title, content });
    await post.save();
    await post.populate("author", "username email avatar");
    res.json({ success: true, post });
  } catch (err) {
    console.error("POST /api/forum/create error:", err.message);
    res.status(500).json({ error: "Failed to create forum post." });
  }
});

// POST /api/forum/:id/reply  — add a reply to a post (requires auth)
router.post("/:id/reply", requireAuth, async (req, res) => {
  const { content: rawContent } = req.body || {};
  if (!rawContent) {
    return res.status(400).json({ error: "Missing reply content." });
  }

  const content = sanitizeHtml(String(rawContent), sanitizeContentOptions).trim();
  if (!content || content.length > MAX_CONTENT_LENGTH) {
    return res.status(400).json({ error: "Invalid reply content." });
  }

  try {
    const post = await ForumPost.findById(req.params.id);
    if (!post) {
      return res.status(404).json({ error: "Post not found." });
    }

    const reply = { author: req.user._id, content, createdAt: new Date() };
    post.replies.push(reply);
    await post.save();
    await post.populate("replies.author", "username email avatar");

    const addedReply = post.replies[post.replies.length - 1];
    res.json({ success: true, reply: addedReply });
  } catch (err) {
    console.error("POST /api/forum/:id/reply error:", err.message);
    res.status(500).json({ error: "Failed to add reply." });
  }
});

module.exports = router;