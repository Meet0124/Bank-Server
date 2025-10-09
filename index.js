const express = require("express");
const dotenv = require("dotenv");
const mongoose = require("mongoose");
const path = require("path");
const bodyParser = require("body-parser");
const authRoutes = require("./routes/authRoutes.js");
const paymentRoutes = require("./routes/paymentRoutes.js");

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
app.use(bodyParser.urlencoded({ extended: true })); // FIXED: 'extend' to 'extended'

const __dirnameValue = path.resolve();


// Only serve CSS, JS, and other assets from public folder
app.use("/css", express.static(path.join(__dirnameValue, "public", "css")));
app.use("/js", express.static(path.join(__dirnameValue, "public", "js")));
app.use("/uploads", express.static(path.join(__dirnameValue, "uploads")));

// Routes
app.use("/auth", authRoutes);
app.use("/payments", paymentRoutes);

// EXPLICIT ROUTES FOR HTML PAGES
// This prevents direct access and ensures proper redirects

// Home route - serve login page
app.get("/", (req, res) => {
  res.sendFile(path.join(__dirnameValue, "public", "login.html"));
});

// Login page - anyone can access
app.get("/login.html", (req, res) => {
  res.sendFile(path.join(__dirnameValue, "public", "login.html"));
});

// Register page - anyone can access
app.get("/register.html", (req, res) => {
  res.sendFile(path.join(__dirnameValue, "public", "register.html"));
});

// PROTECTED ROUTES - These require authentication on client side
// If someone tries to access directly, they get redirected via JavaScript
app.get("/customer.html", (req, res) => {
  res.sendFile(path.join(__dirnameValue, "public", "customer.html"));
});

app.get("/admin.html", (req, res) => {
  res.sendFile(path.join(__dirnameValue, "public", "admin.html"));
});

// Catch-all route - redirect any unknown routes to login
// Catch-all route - redirect unknown routes to login
app.use((req, res) => {
  res.redirect("/login.html");
});


app.listen(PORT, () => {
  console.log(`🚀 Server running on http://localhost:${PORT}`);
});
