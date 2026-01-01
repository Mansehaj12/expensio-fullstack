const express = require("express");
const Expense = require("../models/Expense");
const auth = require("../middleware/auth");

const router = express.Router();

/**
 * GET all family expenses
 */
router.get("/", auth, async (req, res) => {
  try {
    const expenses = await Expense.find({
      familyId: req.user.familyId,
    }).sort({ createdAt: -1 });

    res.json(expenses);
  } catch (err) {
    res.status(500).json({ msg: "Failed to load expenses" });
  }
});

/**
 * ADD new expense
 */
router.post("/", auth, async (req, res) => {
  try {
    const { detail, amount } = req.body;

    if (!detail || !amount) {
      return res.status(400).json({ msg: "Category and amount are required" });
    }

    const expense = new Expense({
      ...req.body,
      familyId: req.user.familyId,
      addedBy: req.user.userId,
    });

    await expense.save();
    res.json({ msg: "Expense added", expense });
  } catch (err) {
    console.error(err);
    res.status(500).json({ msg: "Failed to add expense" });
  }
});

/**
 * DELETE expense
 */
router.delete("/:id", auth, async (req, res) => {
  try {
    const deleted = await Expense.findOneAndDelete({
      _id: req.params.id,
      familyId: req.user.familyId,
    });

    if (!deleted) {
      return res.status(404).json({ msg: "Expense not found" });
    }

    res.json({ msg: "Expense deleted" });
  } catch (err) {
    res.status(500).json({ msg: "Failed to delete expense" });
  }
});

module.exports = router;
