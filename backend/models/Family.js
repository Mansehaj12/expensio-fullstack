const mongoose = require("mongoose");

const familySchema = new mongoose.Schema({
  familyName: String,
  familyCode: { type: String, unique: true },
  members: [{ type: mongoose.Schema.Types.ObjectId, ref: "User" }],
});

module.exports = mongoose.model("Family", familySchema);
