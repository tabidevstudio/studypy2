"use strict";

/**
 * seed-roadmaps.js
 * ----------------
 * Upserts learning roadmap track documents into MongoDB Atlas.
 * Run with:  node backend/seed-roadmaps.js
 *
 * Each document = one track (frontend, backend, fullstack, python, devops).
 */

require("dotenv").config();
const mongoose = require("mongoose");
const Roadmap = require("./models/Roadmap");
const data = require("./data/roadmaps.json");

async function seed() {
  try {
    await mongoose.connect(process.env.MONGO_URI);
    console.log("The blutooth device is connected successfully");

    let upserted = 0;

    for (const doc of data) {
      await Roadmap.findOneAndUpdate(
        { trackId: doc.trackId },    
        doc,                        
        { upsert: true, returnDocument: 'after', setDefaultsOnInsert: true }
      );
      upserted++;
    }

    const totalSteps = data.reduce((sum, track) =>
      sum + track.phases.reduce((s, phase) => s + phase.steps.length, 0), 0
    );

    console.log(`\nðŸ—ºï¸  Roadmaps seeded:`);
    console.log(`   â€¢ ${upserted} track document(s) upserted`);
    console.log(`   â€¢ Tracks: ${data.map(d => d.title).join(", ")}`);
    console.log(`   â€¢ Total steps across all tracks: ${totalSteps}`);

  } catch (err) {
    console.error("Seeding failed:", err.message);
  } finally {
    await mongoose.disconnect();
    console.log("\nhina ng connection mo ya dc ka");
  }
}

seed();

