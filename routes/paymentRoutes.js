const express = require("express");
const mongoose = require("mongoose");
const User = require("../models/User");
const Transaction = require("../models/Transaction");
const authenticateJWT = require("./authMiddleware");

const router = express.Router();

// GET a list of other customers to send money to
router.get("/users", authenticateJWT, async (req, res) => {
  try {
    // Find all users who are "customers" but exclude the current user
    const customerId = req.body.userId;
    const customers = await User.find({
      role: "customer",
      _id: { $ne: customerId },
    }).select("name _id");
    res.json(customers);
  } catch (e) {
    res.status(500).json({ message: "Server error fetching users" });
  }
});

// POST to handle the money transfer
router.post("/transfer", authenticateJWT, async (req, res) => {
  const { recipientId, amount } = req.body;
  const senderId = req.user.userId;

  const transferAmount = Number(amount);
  // check if the recipient and amount is valid for transactions
  if (!recipientId || !transferAmount || transferAmount <= 0) {
    return res
      .status(400)
      .json({ message: "Valid recipient and amount are required." });
  }
  // Use a Database Transaction for safety. This ensures the entire
  // operation succeeds or fails together, preventing "lost" money.
  const session = await mongoose.startSession();
  session.startTransaction();

  try {
    const sender = await User.findById(senderId).session(session);
    // check if the sender is valid and the balance is sufficient
    if (!sender || sender.balance < transferAmount) {
      throw new Error("Insufficient balance or sender not found.");
    }

    const recipient = await User.findById(recipientId).session(session);
    // check if the recipient is present or not
    if (!recipient) {
      throw new Error("Recipient not found.");
    }

    // Perform the core transfer logic
    sender.balance = sender.balance - transferAmount;
    recipient.balance = recipient.balance + transferAmount;

    // Create the transaction log entry
    const transaction = new Transaction({
      senderId: sender._id,
      recipientId: recipient._id,
      amount: transferAmount,
    });

    // Save all changes to the database
    await sender.save();
    await recipient.save();
    await transaction.save();

    // If all saves were successful, commit the transaction
    await session.commitTransaction();

    res.json({
      message: "Transfer successful!",
      newBalance: sender.balance, // Send back the new balance for a UI update
    });
  } catch (error) {
    // If any error occurred, abort the entire transaction
    await session.abortTransaction();
    res.status(400).json({ message: error.message || "Transfer failed." });
  } finally {
    // Always end the session
    session.endSession();
  }
});

router.get("/transactions", authenticateJWT, async (req, res) => {
  // First, perform a security check to ensure the user is an admin.
  if (req.user.role !== "admin") {
    return res.status(403).json({ message: "Forbidden: Admins only." });
  }

  try {
    // Fetch all transactions from the database.
    const allTransaction = await Transaction.find({})
      .sort({ created: -1 })
      .populate("senderId", "name")
      .populate("recipientId", "name");
    // Sort by newest first for a clear log.
    // Replace sender's ID with their name.
    // Replace recipient's ID with their name.
    res.json(allTransaction);
    // Send the list of transactions back to the frontend.
  } catch (e) {
    console.error("Error fetching transactions:", e);
    res.status(500).json({ message: "Server error fetching transactions." });
  }
});

module.exports = router;
