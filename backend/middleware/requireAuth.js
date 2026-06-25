"use strict";

const jwt = require("jsonwebtoken");
const User = require("../models/User");

const JWT_SECRET = process.env.JWT_SECRET || "studypy_super_secret_session_key_98765";

async function requireAuth(req, res, next) {
  const token = req.cookies ? req.cookies.studypy_token : null;
  if (!token) {
    return res.status(401).json({ error: "Unauthorized. No session found." });
  }

  try {
    const decoded = jwt.verify(token, JWT_SECRET);
    const user = await User.findById(decoded.userId);
    if (!user) {
      return res.status(401).json({ error: "User not found." });
    }
    req.user = user;
    next();
  } catch (err) {
    return res.status(401).json({ error: "Session expired or invalid." });
  }
}

module.exports = requireAuth;
