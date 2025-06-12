const express = require("express");
const path = require("path");
const app = express();

app.use(express.json());
app.use(express.static(path.join(__dirname, "public")));

let scores = {};

// Serve main page
app.get("/", (req, res) => {
  res.sendFile(path.join(__dirname, "public", "index.html"));
});

// Serve scoreboard page
app.get("/scoreboard.html", (req, res) => {
  res.sendFile(path.join(__dirname, "public", "scoreboard.html"));
});

// Serve wheel spin page
app.get("/wheelspin.html", (req, res) => {
  res.sendFile(path.join(__dirname, "public", "wheelspin.html"));
});

// API to get all scores
app.get("/api/scores", (req, res) => {
  res.json(scores);
});

// API to add/update a score
app.post("/api/scores", (req, res) => {
  const { name, score } = req.body;
  if (typeof name === "string" && typeof score === "number" && score >= 0) {
    scores[name] = score;
    res.status(200).json({ message: "Score updated" });
  } else {
    res.status(400).json({ message: "Invalid data" });
  }
});

// API to reset scores
app.post("/api/scores/reset", (req, res) => {
  scores = {};
  res.status(200).json({ message: "Scores reset" });
});

const PORT = process.env.PORT || 3000;
app.listen(PORT, () => {
  console.log(`Server running on port ${PORT}`);
});
