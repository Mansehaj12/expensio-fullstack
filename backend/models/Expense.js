const mongoose = require("mongoose");

const expenseSchema = new mongoose.Schema(
  {
    familyId: {
      type: mongoose.Schema.Types.ObjectId,
      ref: "Family",
      required: true,
    },
    date: String,
    detail: String,
    merchant: String,
    amount: Number,
    status: {
      type: String,
      enum: ["submitted", "pending"],
      default: "submitted",
    },
    addedBy: String,
  },
  { timestamps: true }
);

module.exports = mongoose.model("Expense", expenseSchema);
