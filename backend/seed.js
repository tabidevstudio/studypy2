"use strict";

/**
 * seed.js  â€”  Resource Links seeder
 * ----------------------------------
 * Upserts all resource link categories from data.json into MongoDB Atlas.
 * Run with:  node backend/seed.js
 *
 * Uses the Mongoose Resource model (consistent with server.js).
 * Collection: "resources"
 */

require("dotenv").config();
const mongoose = require("mongoose");
const Resource = require("./models/Resource");
const data = require("./data.json");

async function seed() {
  try {
    await mongoose.connect(process.env.MONGO_URI);
    console.log("âœ… Connected to MongoDB Atlas");

    let upserted = 0;

    for (const category of data.categories) {
      await Resource.findOneAndUpdate(
        { name: category.name },      // filter by unique category name
        category,                     // full replacement
        { upsert: true, returnDocument: 'after', setDefaultsOnInsert: true }
      );
      upserted++;
    }

    const totalLinks = data.categories.reduce((sum, cat) =>
      sum + cat.pages.reduce((s, page) => s + page.links.length, 0), 0
    );

    console.log(`\nðŸ”— Resource links seeded:`);
    console.log(`   â€¢ ${upserted} category document(s) upserted`);
    console.log(`   â€¢ Categories: ${data.categories.map(c => c.name).join(", ")}`);
    console.log(`   â€¢ Total links: ${totalLinks}`);

  } catch (err) {
    console.error("âŒ Seeding failed:", err.message);
  } finally {
    await mongoose.disconnect();
    console.log("\nðŸ”Œ Disconnected from MongoDB");
  }
}

seed();

