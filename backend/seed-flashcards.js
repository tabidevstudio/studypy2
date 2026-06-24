"use strict";

/**
 * seed-flashcards.js
 * ------------------
 * Upserts flashcard question documents into MongoDB Atlas.
 * Run with:  node backend/seed-flashcards.js
 *
 * Each document = one programming language (python, javascript, java, cpp).
 * Questions are split into easy / medium / hard arrays.
 */

require("dotenv").config();
const mongoose = require("mongoose");
const Flashcard = require("./models/Flashcard");
const data = require("./data/flashcards.json");

async function seed() {
  try {
    await mongoose.connect(process.env.MONGO_URI);
    console.log("âœ… Connected to MongoDB Atlas");

    let upserted = 0;
    let unchanged = 0;

    for (const doc of data) {
      const result = await Flashcard.findOneAndUpdate(
        { language: doc.language },   // filter
        doc,                          // full replacement
        { upsert: true, returnDocument: 'after', setDefaultsOnInsert: true }
      );
      if (result) upserted++;
      else unchanged++;
    }

    console.log(`\nðŸ“š Flashcards seeded:`);
    console.log(`   â€¢ ${upserted} language document(s) upserted`);
    console.log(`   â€¢ Languages: ${data.map(d => d.displayName).join(", ")}`);
    console.log(`   â€¢ Total questions: ${data.reduce((sum, d) => sum + d.easy.length + d.medium.length + d.hard.length, 0)}`);

  } catch (err) {
    console.error("âŒ Seeding failed:", err.message);
  } finally {
    await mongoose.disconnect();
    console.log("\nðŸ”Œ Disconnected from MongoDB");
  }
}

seed();

