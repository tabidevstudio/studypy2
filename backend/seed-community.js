"use strict";

/**
 * Seed script for the communities collection.
 * Reads from data/communities.json — same pattern as other seeds.
 * Run once: node seeds/communities.seed.js
 */

require("dotenv").config();
const mongoose  = require("mongoose");
const path      = require("path");
const Community = require("./models/Community");

const COMMUNITIES = require(path.join(__dirname, "./data/communities.json"));

async function seed() {
    await mongoose.connect(process.env.MONGO_URI);
    console.log("✅ Connected to MongoDB Atlas");

    await Community.deleteMany({});
    console.log("🗑️  Cleared communities collection");

    await Community.insertMany(COMMUNITIES);
    console.log(`🌱 Seeded ${COMMUNITIES.length} communities`);

    await mongoose.disconnect();
    console.log("👋 Done");
}

seed().catch(err => {
    console.error("❌ Seed failed:", err.message);
    process.exit(1);
});
