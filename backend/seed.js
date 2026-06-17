"use strict";

/**
 * seed.js — One-time migration script.
 * Reads backend/data.json and inserts all categories into MongoDB Atlas.
 *
 * Usage (from the backend/ directory):
 *   node seed.js
 */

const mongoose = require("mongoose");
require("dotenv").config();

const Category = require("./models/Resource");
const rawData  = require("./data.json");

async function seed() {
  if (!process.env.MONGO_URI) {
    console.error("❌ MONGO_URI is not defined in .env");
    process.exit(1);
  }

  try {
    await mongoose.connect(process.env.MONGO_URI);
    console.log("✅ Connected to MongoDB Atlas");

    // Wipe existing data so the seed is idempotent
    await Category.deleteMany({});
    console.log("🗑  Cleared existing categories");

    // Insert every category from data.json
    const inserted = await Category.insertMany(rawData.categories);
    console.log(`✅ Seeded ${inserted.length} categories into MongoDB Atlas`);

    rawData.categories.forEach((cat) => {
      const totalLinks = cat.pages.reduce((sum, p) => sum + p.links.length, 0);
      console.log(
        `   • ${cat.name}: ${cat.pages.length} page(s), ${totalLinks} link(s)`
      );
    });
  } catch (err) {
    console.error("❌ Seed failed:", err.message);
    process.exit(1);
  } finally {
    await mongoose.disconnect();
    console.log("🔌 Disconnected from MongoDB Atlas");
  }
}

seed();
