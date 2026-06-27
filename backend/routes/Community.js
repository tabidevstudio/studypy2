"use strict";

const express     = require("express");
const router      = express.Router();
const Community   = require("../models/Community");

/* ─────────────────────────────────────────────────────────────────────────────
   GET /api/communities
   Optional query: ?platform=reddit   → filter by platform
   Returns all active communities sorted by platform then order.
───────────────────────────────────────────────────────────────────────────── */
router.get("/", async (req, res) => {
    const { platform } = req.query;
    const filter = { active: true };

    if (platform) {
        filter.platform = platform.toLowerCase();
    }

    try {
        const communities = await Community.find(filter, { __v: 0, createdAt: 0, updatedAt: 0 })
            .sort({ platform: 1, order: 1 })
            .lean();

        res.json({ communities });
    } catch (err) {
        console.error("GET /api/communities error:", err.message);
        res.status(500).json({ error: "Failed to fetch communities from the database." });
    }
});

module.exports = router;
