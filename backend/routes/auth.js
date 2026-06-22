"use strict";

const express = require("express");
const jwt = require("jsonwebtoken");
const fetch = require("node-fetch");
const User = require("../models/User");

const router = express.Router();

// Fallbacks for environment variables in development
const JWT_SECRET = process.env.JWT_SECRET || "studypy_super_secret_session_key_98765";
const FRONTEND_URL = process.env.FRONTEND_URL || "http://localhost:5500";
const BACKEND_URL = process.env.BACKEND_URL || "http://localhost:3000";

// Helper to calculate days between two YYYY-MM-DD dates
function getDaysBetween(dateStr1, dateStr2) {
  const d1 = new Date(dateStr1 + "T00:00:00");
  const d2 = new Date(dateStr2 + "T00:00:00");
  const diffTime = Math.abs(d2 - d1);
  return Math.round(diffTime / (1000 * 60 * 60 * 24));
}

// Middleware to verify JWT from cookie
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

/* ─────────────────────────────────────────────────────────────────────────────
   GOOGLE OAUTH FLOW
   ───────────────────────────────────────────────────────────────────────────── */

// 1. Redirect to Google Consent Screen
router.get("/google", (req, res) => {
  const googleClientId = process.env.GOOGLE_CLIENT_ID;
  
  if (!googleClientId) {
    console.warn("⚠️ GOOGLE_CLIENT_ID not set. Redirecting to Mock Google Auth callback for development.");
    return res.redirect(`${BACKEND_URL}/api/auth/google/callback?code=mock_google_code`);
  }

  const redirectUri = `${BACKEND_URL}/api/auth/google/callback`;
  const googleAuthUrl = `https://accounts.google.com/o/oauth2/v2/auth?client_id=${googleClientId}&redirect_uri=${encodeURIComponent(
    redirectUri
  )}&response_type=code&scope=${encodeURIComponent("openid profile email")}`;

  res.redirect(googleAuthUrl);
});

// 2. Google Callback
router.get("/google/callback", async (req, res) => {
  const { code } = req.query;
  if (!code) {
    return res.redirect(`${FRONTEND_URL}/pages/login.html?error=no_code`);
  }

  try {
    let profile = null;

    // Handle Mock Authentication for easy local testing
    if (code === "mock_google_code") {
      profile = {
        id: "mock_google_12345",
        name: "Mock Google User",
        email: "mock.google.user@studypy.dev",
        picture: "https://images.unsplash.com/photo-1535713875002-d1d0cf377fde?auto=format&fit=crop&w=150&h=150&q=80"
      };
    } else {
      // Exchange code for token
      const tokenRes = await fetch("https://oauth2.googleapis.com/token", {
        method: "POST",
        headers: { "Content-Type": "application/x-www-form-urlencoded" },
        body: new URLSearchParams({
          code,
          client_id: process.env.GOOGLE_CLIENT_ID,
          client_secret: process.env.GOOGLE_CLIENT_SECRET,
          redirect_uri: `${BACKEND_URL}/api/auth/google/callback`,
          grant_type: "authorization_code"
        })
      });

      const tokenData = await tokenRes.json();
      if (!tokenRes.ok || tokenData.error) {
        console.error("Google token exchange error:", tokenData);
        return res.redirect(`${FRONTEND_URL}/pages/login.html?error=token_exchange_failed`);
      }

      // Fetch user profile info
      const userRes = await fetch("https://www.googleapis.com/oauth2/v3/userinfo", {
        headers: { Authorization: `Bearer ${tokenData.access_token}` }
      });
      
      const userData = await userRes.json();
      if (!userRes.ok) {
        console.error("Google user profile fetch error:", userData);
        return res.redirect(`${FRONTEND_URL}/pages/login.html?error=profile_fetch_failed`);
      }

      profile = {
        id: userData.sub,
        name: userData.name || userData.given_name || "Google User",
        email: userData.email,
        picture: userData.picture
      };
    }

    if (!profile.email) {
      return res.redirect(`${FRONTEND_URL}/pages/login.html?error=no_email_provided`);
    }

    // Upsert User in MongoDB
    let user = await User.findOne({ email: profile.email });
    if (!user) {
      user = new User({
        username: profile.name,
        email: profile.email,
        googleId: profile.id,
        avatar: profile.picture,
        streak: { count: 0, lastActiveDate: "" }
      });
    } else {
      // Link Google ID if email matches but ID isn't set yet
      if (!user.googleId) {
        user.googleId = profile.id;
      }
      if (profile.picture && !user.avatar) {
        user.avatar = profile.picture;
      }
    }
    await user.save();

    // Create Session JWT
    const token = jwt.sign({ userId: user._id }, JWT_SECRET, { expiresIn: "7d" });

    // Set cookie on client
    res.cookie("studypy_token", token, {
      httpOnly: true,
      secure: process.env.NODE_ENV === "production",
      sameSite: process.env.NODE_ENV === "production" ? "none" : "lax",
      maxAge: 7 * 24 * 60 * 60 * 1000 // 7 days
    });

    // Redirect to frontend (dashboard/settings or homepage)
    res.redirect(`${FRONTEND_URL}/pages/settings.html?auth=success`);
  } catch (err) {
    console.error("Google OAuth error:", err);
    res.redirect(`${FRONTEND_URL}/pages/login.html?error=auth_failed`);
  }
});

/* ─────────────────────────────────────────────────────────────────────────────
   GITHUB OAUTH FLOW
   ───────────────────────────────────────────────────────────────────────────── */

// 1. Redirect to GitHub Authorization
router.get("/github", (req, res) => {
  const githubClientId = process.env.GITHUB_CLIENT_ID;

  if (!githubClientId) {
    console.warn("⚠️ GITHUB_CLIENT_ID not set. Redirecting to Mock GitHub Auth callback for development.");
    return res.redirect(`${BACKEND_URL}/api/auth/github/callback?code=mock_github_code`);
  }

  const redirectUri = `${BACKEND_URL}/api/auth/github/callback`;
  const githubAuthUrl = `https://github.com/login/oauth/authorize?client_id=${githubClientId}&redirect_uri=${encodeURIComponent(
    redirectUri
  )}&scope=user:email`;

  res.redirect(githubAuthUrl);
});

// 2. GitHub Callback
router.get("/github/callback", async (req, res) => {
  const { code } = req.query;
  if (!code) {
    return res.redirect(`${FRONTEND_URL}/pages/login.html?error=no_code`);
  }

  try {
    let profile = null;

    // Handle Mock Authentication for easy local testing
    if (code === "mock_github_code") {
      profile = {
        id: "mock_github_12345",
        name: "Mock GitHub User",
        email: "mock.github.user@studypy.dev",
        picture: "https://images.unsplash.com/photo-1570295999919-56ceb5ecca61?auto=format&fit=crop&w=150&h=150&q=80"
      };
    } else {
      // Exchange code for token
      const tokenRes = await fetch("https://github.com/login/oauth/access_token", {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
          Accept: "application/json"
        },
        body: JSON.stringify({
          client_id: process.env.GITHUB_CLIENT_ID,
          client_secret: process.env.GITHUB_CLIENT_SECRET,
          code,
          redirect_uri: `${BACKEND_URL}/api/auth/github/callback`
        })
      });

      const tokenData = await tokenRes.json();
      if (!tokenRes.ok || tokenData.error) {
        console.error("GitHub token exchange error:", tokenData);
        return res.redirect(`${FRONTEND_URL}/pages/login.html?error=token_exchange_failed`);
      }

      const accessToken = tokenData.access_token;

      // Fetch user profile info
      const userRes = await fetch("https://api.github.com/user", {
        headers: {
          Authorization: `token ${accessToken}`,
          "User-Agent": "StudyPy-App"
        }
      });
      const userData = await userRes.json();

      if (!userRes.ok) {
        console.error("GitHub user info fetch error:", userData);
        return res.redirect(`${FRONTEND_URL}/pages/login.html?error=profile_fetch_failed`);
      }

      // If email is null (private), fetch list of emails
      let email = userData.email;
      if (!email) {
        const emailRes = await fetch("https://api.github.com/user/emails", {
          headers: {
            Authorization: `token ${accessToken}`,
            "User-Agent": "StudyPy-App"
          }
        });
        const emails = await emailRes.json();
        if (emailRes.ok && Array.isArray(emails)) {
          const primaryEmail = emails.find(e => e.primary && e.verified) || emails.find(e => e.primary) || emails[0];
          email = primaryEmail ? primaryEmail.email : null;
        }
      }

      // Generate fallback email if still not available
      if (!email) {
        email = `${userData.login || "github_user"}_${userData.id}@studypy.dev`;
      }

      profile = {
        id: userData.id.toString(),
        name: userData.name || userData.login || "GitHub User",
        email: email,
        picture: userData.avatar_url
      };
    }

    // Upsert User in MongoDB
    let user = await User.findOne({ email: profile.email });
    if (!user) {
      user = new User({
        username: profile.name,
        email: profile.email,
        githubId: profile.id,
        avatar: profile.picture,
        streak: { count: 0, lastActiveDate: "" }
      });
    } else {
      // Link GitHub ID if email matches but ID isn't set yet
      if (!user.githubId) {
        user.githubId = profile.id;
      }
      if (profile.picture && !user.avatar) {
        user.avatar = profile.picture;
      }
    }
    await user.save();

    // Create Session JWT
    const token = jwt.sign({ userId: user._id }, JWT_SECRET, { expiresIn: "7d" });

    // Set cookie on client
    res.cookie("studypy_token", token, {
      httpOnly: true,
      secure: process.env.NODE_ENV === "production",
      sameSite: process.env.NODE_ENV === "production" ? "none" : "lax",
      maxAge: 7 * 24 * 60 * 60 * 1000 // 7 days
    });

    res.redirect(`${FRONTEND_URL}/pages/settings.html?auth=success`);
  } catch (err) {
    console.error("GitHub OAuth error:", err);
    res.redirect(`${FRONTEND_URL}/pages/login.html?error=auth_failed`);
  }
});

/* ─────────────────────────────────────────────────────────────────────────────
   AUTHENTICATED ENDPOINTS
   ───────────────────────────────────────────────────────────────────────────── */

// 1. Get Logged-in User Profile (updates/maintains daily streak)
router.get("/me", requireAuth, async (req, res) => {
  const user = req.user;
  const clientDate = req.query.date; // Expecting "YYYY-MM-DD" from client timezone

  let streakUpdated = false;

  // Streak logic check
  if (clientDate && /^\d{4}-\d{2}-\d{2}$/.test(clientDate)) {
    const lastDate = user.streak.lastActiveDate;

    if (!lastDate) {
      // Initialize streak
      user.streak.count = 1;
      user.streak.lastActiveDate = clientDate;
      streakUpdated = true;
    } else if (lastDate !== clientDate) {
      const diff = getDaysBetween(lastDate, clientDate);
      if (diff === 1) {
        // Continuous day activity
        user.streak.count += 1;
        user.streak.lastActiveDate = clientDate;
        streakUpdated = true;
      } else if (diff > 1) {
        // Gap of >1 days, streak broken, reset to 1
        user.streak.count = 1;
        user.streak.lastActiveDate = clientDate;
        streakUpdated = true;
      }
    }
  }

  if (streakUpdated) {
    await user.save();
  }

  res.json({
    authenticated: true,
    user: {
      username: user.username,
      email: user.email,
      avatar: user.avatar,
      bookmarks: user.bookmarks,
      watchedVideos: user.watchedVideos,
      streak: user.streak
    }
  });
});

// 2. Logout Endpoint
router.post("/logout", (req, res) => {
  res.clearCookie("studypy_token", {
    httpOnly: true,
    secure: process.env.NODE_ENV === "production",
    sameSite: process.env.NODE_ENV === "production" ? "none" : "lax"
  });
  res.json({ message: "Logged out successfully" });
});

// 3. Toggle Bookmark
router.post("/bookmark", requireAuth, async (req, res) => {
  const { path } = req.body;
  if (!path) {
    return res.status(400).json({ error: "Missing resource path." });
  }

  const user = req.user;
  const index = user.bookmarks.indexOf(path);

  if (index === -1) {
    user.bookmarks.push(path);
  } else {
    user.bookmarks.splice(index, 1);
  }

  await user.save();
  res.json({ bookmarks: user.bookmarks, bookmarked: index === -1 });
});

// 4. Toggle Watched Video status
router.post("/watched", requireAuth, async (req, res) => {
  const { videoUrl } = req.body;
  if (!videoUrl) {
    return res.status(400).json({ error: "Missing video URL." });
  }

  const user = req.user;
  const index = user.watchedVideos.indexOf(videoUrl);

  if (index === -1) {
    user.watchedVideos.push(videoUrl);
  } else {
    user.watchedVideos.splice(index, 1);
  }

  await user.save();
  res.json({ watchedVideos: user.watchedVideos, watched: index === -1 });
});

// 5. Update Streak manually (or via challenge check)
router.post("/streak/increment", requireAuth, async (req, res) => {
  const user = req.user;
  const { date } = req.body; // Expecting "YYYY-MM-DD"

  if (!date || !/^\d{4}-\d{2}-\d{2}$/.test(date)) {
    return res.status(400).json({ error: "Invalid date format." });
  }

  const lastDate = user.streak.lastActiveDate;
  if (!lastDate) {
    user.streak.count = 1;
    user.streak.lastActiveDate = date;
  } else if (lastDate !== date) {
    const diff = getDaysBetween(lastDate, date);
    if (diff === 1) {
      user.streak.count += 1;
      user.streak.lastActiveDate = date;
    } else if (diff > 1) {
      user.streak.count = 1;
      user.streak.lastActiveDate = date;
    }
  }

  await user.save();
  res.json({ streak: user.streak });
});

module.exports = router;
