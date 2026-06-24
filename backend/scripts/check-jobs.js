const mongoose = require("mongoose");
const path = require("path");
require("dotenv").config({ path: path.join(__dirname, "../.env") });
const Job = require("../models/Job");
mongoose.connect(process.env.MONGO_URI).then(async () => {
    const sample = await Job.find().limit(3);
    sample.forEach(j => console.log("applyLink:", j.applyLink, "| company:", j.company));
    process.exit();
});
