const mongoose = require("mongoose");
const path = require("path");
require("dotenv").config({ path: path.join(__dirname, "../.env") });

mongoose.connect(process.env.MONGO_URI).then(async () => {
    await mongoose.connection.collection("jobs").deleteMany({});
    console.log("Cleared all jobs.");
    process.exit();
});
