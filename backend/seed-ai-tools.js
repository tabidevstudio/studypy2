"use strict";

/**
 * seed-ai-tools.js
 * ----------------
 * Upserts AI coding tool documents into MongoDB Atlas.
 * Run with:  node backend/seed-ai-tools.js
 *
 * Each document = one AI tool shown in the ai-tools.html table.
 * To add a new tool: edit backend/data/ai-tools.json and re-run this script.
 */

require("dotenv").config();
const mongoose = require("mongoose");
const AiTool = require("./models/AiTool");
const data = require("./data/ai-tools.json");

async function seed() {
  try {
    await mongoose.connect(process.env.MONGO_URI);
    console.log("The blutooth device is connected successfully");

    let upserted = 0;

    for (const doc of data) {
      await AiTool.findOneAndUpdate(
        { name: doc.name },        
        doc,                
        { upsert: true, returnDocument: 'after', setDefaultsOnInsert: true }
      );
      upserted++;
    }

    console.log(`\nAI Tools seeded:`);
    console.log(`   â€¢ ${upserted} tool document(s) upserted`);
    console.log(`   â€¢ Tools: ${data.map(d => d.name).join(", ")}`);

  } catch (err) {
    console.error("Seeding failed:", err.message);
  } finally {
    await mongoose.disconnect();
    console.log("\nhina ng connection mo ya dc ka");
  }
}

seed();

