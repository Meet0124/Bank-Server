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
    const customerId = req.user.userId;
    const customers = await User.find({
      role: "customer",
      _id: { $ne: customerId },
    }).select("name _id");

    console.log("Found customers:", customers.length);
    res.json(customers);
  } catch (e) {
    console.error("Error fetching users:", e);
    res.status(500).json({ message: "Server error fetching users" });
  }
});

// POST to handle the money transfer
router.post("/transfer", authenticateJWT, async (req, res) => {
  const { recipientId, amount } = req.body;
  const senderId = req.user.userId;

  const transferAmount = Number(amount);

  // Check if the recipient and amount is valid for transactions
  if (!recipientId || !transferAmount || transferAmount <= 0) {
    return res
      .status(400)
      .json({ message: "Valid recipient and amount are required." });
  }

  // FIXED: Removed MongoDB transactions to work with standalone instances
  // Using try-catch with manual rollback logic instead
  try {
    // Find sender and check balance
    const sender = await User.findById(senderId);
    if (!sender || sender.balance < transferAmount) {
      return res.status(400).json({
        message: "Insufficient balance or sender not found.",
      });
    }

    // Find recipient
    const recipient = await User.findById(recipientId);
    if (!recipient) {
      return res.status(400).json({ message: "Recipient not found." });
    }

    // Store original balances for potential rollback
    const originalSenderBalance = sender.balance;
    const originalRecipientBalance = recipient.balance;

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
    try {
      await sender.save();
      await recipient.save();
      await transaction.save();

      res.json({
        message: "Transfer successful!",
        newBalance: sender.balance,
      });
    } catch (saveError) {
      // Rollback on save failure
      console.error("Save error, attempting rollback:", saveError);

      // Restore original balances
      sender.balance = originalSenderBalance;
      recipient.balance = originalRecipientBalance;

      try {
        await sender.save();
        await recipient.save();
      } catch (rollbackError) {
        console.error("CRITICAL: Rollback failed:", rollbackError);
      }

      throw new Error("Transfer failed during save operation.");
    }
  } catch (error) {
    console.error("Transfer error:", error);
    res.status(400).json({
      message: error.message || "Transfer failed.",
    });
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
      .sort({ createdAt: -1 })
      .populate("senderId", "name")
      .populate("recipientId", "name");

    res.json(allTransaction);
  } catch (e) {
    console.error("Error fetching transactions:", e);
    res.status(500).json({ message: "Server error fetching transactions." });
  }
});

module.exports = router;
