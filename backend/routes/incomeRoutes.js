const express = require("express");
const router = express.Router();

const {
  addIncome,
  getAllIncomes,
  getIncomeById,
  updateIncome,
  deleteIncome,
  getIncomeSummary,
} = require("../controllers/incomeController");

const { protect } = require("../middlewares/authMiddleware");

router.get("/summary", protect, getIncomeSummary);
router.post("/", protect, addIncome);       
router.get("/", protect, getAllIncomes);     
router.get("/:id", protect, getIncomeById);      
router.put("/:id", protect, updateIncome);       
router.delete("/:id", protect, deleteIncome);    

module.exports = router;