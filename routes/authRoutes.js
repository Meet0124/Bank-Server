const express = require("express");
const User = require("../models/User");
const bcrypt = require("bcrypt");
const jwt = require("jsonwebtoken");
const upload = require("./uploadMiddleware");
const dotenv = require("dotenv");

dotenv.config();

const router = express.Router();
const JWT_SECRET = process.env.JWT_SECRET;

router.post("/register", upload.single("profilePicture"), async (req, res) => {
  const { name, email, password, role } = req.body;
  if (!req.file) {
    return res.status(400).json({ message: "Profile picture is required." });
  }
  try {
    let user = await User.findOne({ email });
    if (user) return res.status(400).json({ message: "User already exists" });
    const hashedPassword = await bcrypt.hash(password, 10);
    user = new User({
      name,
      email,
      password: hashedPassword,
      role,
      profilePicturePath: req.file.path,
    });
    await user.save();
    res.json({ message: "Registered successfully" });
  } catch (e) {
    console.error(e);
    res.status(500).json({ message: "Server error" });
  }
});

router.post("/login", async (req, res) => {
  const { email, password } = req.body;
  try {
    const user = await User.findOne({ email });
    if (!user) return res.status(400).json({ message: "Invalid credentials" });

    const isPasswordValid = await bcrypt.compare(password, user.password);
    if (!isPasswordValid)
      return res.status(400).json({ message: "Invalid credentials" });

    const tokenPayload = {
      userId: user._id,
      name: user.name,
      email: user.email,
      role: user.role,
      balance: user.balance,
      profilePicturePath: user.profilePicturePath || "",
    };

    const token = jwt.sign(tokenPayload, JWT_SECRET, { expiresIn: "1h" });

    res.json({ message: "Login successful", token });
  } catch (e) {
    console.error("Login Error on Server:", e);
    res.status(500).json({ message: "Server error" });
  }
});

module.exports = router;
