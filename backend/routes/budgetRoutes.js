const express = require("express");
const router = express.Router();

const {
  setBudget,
  updateBudget,
  getBudgetByMonth,
  getAllBudgets,
  deleteBudget,
} = require("../controllers/budgetController");

const { protect } = require("../middlewares/authMiddleware");

router.post("/", protect, setBudget);          
router.get("/", protect, getAllBudgets);       

router.get("/:month", protect, getBudgetByMonth);

router.put("/:id", protect, updateBudget);
router.delete("/:id", protect, deleteBudget);

module.exports = router;