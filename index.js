const express = require("express");
const dotenv = require("dotenv");
const mongoose = require("mongoose");
const User = require("./models/User");


dotenv.config();
const app = express();
const PORT = process.env.PORT || 3000;
// initialize other requirements app, port, mongouri
const MONGO_URI = process.env.MONGO_URI;

mongoose
  .connect(MONGO_URI, {
    useNewUrlParser: true,
    useUnifiedTopology: true,
  })
  .then(() => console.log("✅ Connected to MongoDB Atlas"))
  .catch((err) => console.error("❌ MongoDB connection error:", err));

app.get("/", (req, res) => {
  res.send("Bank Server is running!");
});

app.listen(PORT, () => {
  console.log(`🚀 Server running on http://localhost:${PORT}`);
});
