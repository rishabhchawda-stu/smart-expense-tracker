const express = require("express");
const router = express.Router();

const {
  addExpense,
  getAllExpenses,
  getExpenseById,
  updateExpense,
  deleteExpense,
  getExpenseSummary,
} = require("../controllers/expenseController");

const { protect } = require("../middlewares/authMiddleware");

router.get("/summary", protect, getExpenseSummary);
router.post("/", protect, addExpense);
router.get("/", protect, getAllExpenses);
router.get("/:id", protect, getExpenseById);
router.put("/:id", protect, updateExpense);
router.delete("/:id", protect, deleteExpense);

module.exports = router;