const mongoose = require("mongoose");

const userSchema = new mongoose.Schema({
  username: { type: String, unique: true },
  email: String,
  password: String,
  familyId: { type: mongoose.Schema.Types.ObjectId, ref: "Family" },
});

module.exports = mongoose.model("User", userSchema);
