require("dotenv").config();
const mongoose = require("mongoose");

mongoose.connect(process.env.MONGO_URI).then(async () => {
  const db = mongoose.connection.db;
  const cols = await db.listCollections().toArray();
  console.log("Collections in studypy_db:");
  cols.forEach(c => console.log(" -", c.name));

  const targets = ["resources", "categories", "flashcards", "roadmaps", "ai_tools", "users", "jobs"];
  console.log("\nDocument counts:");
  for (const name of targets) {
    try {
      const count = await db.collection(name).countDocuments();
      console.log("  " + name + ": " + count + " docs");
    } catch(e) {
      console.log("  " + name + ": error - " + e.message);
    }
  }
  await mongoose.disconnect();
  console.log("\nDone.");
}).catch(e => console.error("Connection error:", e.message));
