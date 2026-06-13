const Budget = require("../models/Budget");
const Expense = require("../models/Expense");
const setBudget = async (req, res) => {
  try {
    const { month, budgetAmount } = req.body;

    if (!month || !budgetAmount) {
      return res.status(400).json({
        message: "Month and budget amount are required",
      });
    }

    if (budgetAmount <= 0) {
      return res.status(400).json({
        message: "Budget amount must be greater than 0",
      });
    }

    const existingBudget = await Budget.findOne({
      userId: req.user.id,
      month,
    });

    if (existingBudget) {
      return res.status(400).json({
        message: `Budget for ${month} already exists. Use update instead.`,
      });
    }

    const budget = await Budget.create({
      userId: req.user.id,
      month,
      budgetAmount,
    });

    res.status(201).json({
      success: true,
      message: "Budget set successfully",
      budget,
    });

  } catch (error) {
    if (error.name === "ValidationError") {
      const messages = Object.values(error.errors).map((e) => e.message);
      return res.status(400).json({ message: messages[0] });
    }

    if (error.code === 11000) {
      return res.status(400).json({
        message: "Budget for this month already exists",
      });
    }

    res.status(500).json({ message: "Server error", error: error.message });
  }
};
const updateBudget = async (req, res) => {
  try {
    const { budgetAmount } = req.body;

    const budget = await Budget.findById(req.params.id);

    if (!budget) {
      return res.status(404).json({ message: "Budget not found" });
    }

    if (budget.userId.toString() !== req.user.id.toString()) {
      return res.status(403).json({
        message: "Not authorized to update this budget",
      });
    }

    if (!budgetAmount || budgetAmount <= 0) {
      return res.status(400).json({
        message: "Budget amount must be greater than 0",
      });
    }

    budget.budgetAmount = budgetAmount;
    const updatedBudget = await budget.save();

    res.status(200).json({
      success: true,
      message: "Budget updated successfully",
      budget: updatedBudget,
    });

  } catch (error) {
    res.status(500).json({ message: "Server error", error: error.message });
  }
};
const getBudgetByMonth = async (req, res) => {
  try {
    const { month } = req.params;

    // ---- VALIDATE MONTH FORMAT ----
    if (!/^\d{4}-(0[1-9]|1[0-2])$/.test(month)) {
      return res.status(400).json({
        message: "Month must be in YYYY-MM format",
      });
    }
    const budget = await Budget.findOne({
      userId: req.user.id,
      month,
    });

    if (!budget) {
      return res.status(404).json({
        message: `No budget set for ${month}`,
      });
    }

    const expenses = await Expense.find({ userId: req.user.id });
    const monthExpenses = expenses.filter((item) => {
      const itemDate = new Date(item.date);
      const itemMonth = `${itemDate.getFullYear()}-${String(
        itemDate.getMonth() + 1
      ).padStart(2, "0")}`;
      return itemMonth === month;
    });

    const totalSpent = monthExpenses.reduce((sum, item) => sum + item.amount, 0);

    const remaining = budget.budgetAmount - totalSpent;
    const percentageUsed = ((totalSpent / budget.budgetAmount) * 100).toFixed(2);

    let status = "safe"; // < 75%
    if (percentageUsed >= 100) {
      status = "exceeded";
    } else if (percentageUsed >= 90) {
      status = "critical"; // 90-100%
    } else if (percentageUsed >= 75) {
      status = "warning"; // 75-90%
    }

    res.status(200).json({
      success: true,
      budget: {
        _id: budget._id,
        month: budget.month,
        budgetAmount: budget.budgetAmount,
        totalSpent,
        remaining,
        percentageUsed: Number(percentageUsed),
        status,
      },
    });

  } catch (error) {
    res.status(500).json({ message: "Server error", error: error.message });
  }
};

const getAllBudgets = async (req, res) => {
  try {
    const budgets = await Budget.find({ userId: req.user.id }).sort({ month: -1 });

    res.status(200).json({
      success: true,
      count: budgets.length,
      budgets,
    });

  } catch (error) {
    res.status(500).json({ message: "Server error", error: error.message });
  }
};

const deleteBudget = async (req, res) => {
  try {
    const budget = await Budget.findById(req.params.id);

    if (!budget) {
      return res.status(404).json({ message: "Budget not found" });
    }

    if (budget.userId.toString() !== req.user.id.toString()) {
      return res.status(403).json({
        message: "Not authorized to delete this budget",
      });
    }

    await budget.deleteOne();

    res.status(200).json({
      success: true,
      message: "Budget deleted successfully",
    });

  } catch (error) {
    res.status(500).json({ message: "Server error", error: error.message });
  }
};

module.exports = {
  setBudget,
  updateBudget,
  getBudgetByMonth,
  getAllBudgets,
  deleteBudget,
};