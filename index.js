const express = require("express");
const dotenv = require("dotenv");
const mongoose = require("mongoose");
const path = require("path");
const bodyParser = require("body-parser");
const authRoutes = require("./routes/authRoutes.js")

dotenv.config();
const app = express();
const PORT = process.env.PORT || 3000;

const MONGO_URI = process.env.MONGO_URI;

mongoose
  .connect(MONGO_URI, {
    useNewUrlParser: true,
    useUnifiedTopology: true,
  })
  .then(() => console.log("✅ Connected to MongoDB Atlas"))
  .catch((err) => console.error("❌ MongoDB connection error:", err));

// Middleware
  app.use(bodyParser.json());
  app.use(bodyParser.urlencoded({ extend: true }));

// statically load the public folder
app.use(express.static(path.join(__dirname, "public")));

// Routes
app.use("/auth", authRoutes);

// Serve the login.hthml from the public folder for home route /.
app.get("/", (req, res) => {
  res.sendFile(path.join(__dirname, "public", "login.html"));
});

app.listen(PORT, () => {
  console.log(`🚀 Server running on http://localhost:${PORT}`);
});
