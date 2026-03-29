const express = require("express");
const fetch = require("node-fetch");
const cors = require("cors");
require("dotenv").config();

const app = express();
app.use(cors());
app.use(express.json());

app.post("/run", async (req, res) => {
  const { language, code, input } = req.body;

  if (!language || !code) {
    return res.status(400).json({ error: "Missing language or code." });
  }

  try {
        const response = await fetch("https://api.onlinecompiler.io/api/run-code-sync/", {
      method: "POST",
      headers: {
        "Authorization": process.env.API_KEY,
        "Content-Type": "application/json"
      },
      body: JSON.stringify({ compiler: language, code, input: input || "" })
    });

    const data = await response.json();
    res.json(data);

  } catch (err) {
    res.status(500).json({ error: "Failed to reach compiler API." });
  }
});

const fs = require("fs");
const path = require("path");

app.get("/links", (req, res) => {
  try {
    const filePath = path.join(__dirname, "data/data.json");
    const data = JSON.parse(fs.readFileSync(filePath, "utf-8"));
    res.json(data);
  } catch (err) {
    res.status(500).json({ error: "Something went wrong: " + err.message });
  }
});

app.listen(3000, () => console.log("Backend running on http://localhost:3000"));