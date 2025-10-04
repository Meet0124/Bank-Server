const mongoose = require("mongoose");

const UsersSchema = new mongoose.Schema({
  name: {
    type: String,
  },
  email: {
    type: String,
    unique: true,
    required: true,
  },
  password: {
    type: String,
    required: true,
  },
  role: {
    type: String,
    default: "customer",
    enum: ["customer", "admin"],
  },
  balance: {
    type: Number,
    default: 10000,
  },
});
const User = mongoose.model("User", UsersSchema);

module.exports = User;
