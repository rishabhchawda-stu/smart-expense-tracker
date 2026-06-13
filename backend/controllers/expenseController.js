const Expense = require("../models/Expense");

const addExpense = async (req, res) => {
  try {
    const { title, amount, category, date, description } = req.body;

    
    if (!title || !amount || !category || !date) {
      return res.status(400).json({
        message: "Title, amount, category and date are required",
      });
    }

    if (amount <= 0) {
      return res.status(400).json({
        message: "Amount must be greater than 0",
      });
    }

    const expense = await Expense.create({
      userId: req.user.id,
      title,
      amount,
      category,
      date,
      description,
    });

    res.status(201).json({
      success: true,
      message: "Expense added successfully",
      expense,
    });

  } catch (error) {
    if (error.name === "ValidationError") {
      const messages = Object.values(error.errors).map((e) => e.message);
      return res.status(400).json({ message: messages[0] });
    }
    res.status(500).json({ message: "Server error", error: error.message });
  }
};

const getAllExpenses = async (req, res) => {
  try {
    
    const filter = { userId: req.user.id };

    if (req.query.category && req.query.category !== "All") {
      filter.category = req.query.category;
    }

    let sortOption = { date: -1 };

    if (req.query.sort === "highest") {
      sortOption = { amount: -1 }; 
    } else if (req.query.sort === "lowest") {
      sortOption = { amount: 1 };  
    } else if (req.query.sort === "oldest") {
      sortOption = { date: 1 };    
    }

    const expenses = await Expense.find(filter).sort(sortOption);

    const totalExpense = expenses.reduce((sum, item) => sum + item.amount, 0);

    res.status(200).json({
      success: true,
      count: expenses.length,
      totalExpense,
      expenses,
    });

  } catch (error) {
    res.status(500).json({ message: "Server error", error: error.message });
  }
};

const getExpenseById = async (req, res) => {
  try {
    const expense = await Expense.findById(req.params.id);

    if (!expense) {
      return res.status(404).json({ message: "Expense not found" });
    }

    if (expense.userId.toString() !== req.user.id.toString()) {
      return res.status(403).json({
        message: "Not authorized to access this expense",
      });
    }

    res.status(200).json({
      success: true,
      expense,
    });

  } catch (error) {
    res.status(500).json({ message: "Server error", error: error.message });
  }
};

const updateExpense = async (req, res) => {
  try {
    const { title, amount, category, date, description } = req.body;

    const expense = await Expense.findById(req.params.id);

    if (!expense) {
      return res.status(404).json({ message: "Expense not found" });
    }

    if (expense.userId.toString() !== req.user.id.toString()) {
      return res.status(403).json({
        message: "Not authorized to update this expense",
      });
    }

    if (amount && amount <= 0) {
      return res.status(400).json({
        message: "Amount must be greater than 0",
      });
    }

    expense.title = title || expense.title;
    expense.amount = amount || expense.amount;
    expense.category = category || expense.category;
    expense.date = date || expense.date;
    expense.description = description !== undefined ? description : expense.description;

    const updatedExpense = await expense.save();

    res.status(200).json({
      success: true,
      message: "Expense updated successfully",
      expense: updatedExpense,
    });

  } catch (error) {
    if (error.name === "ValidationError") {
      const messages = Object.values(error.errors).map((e) => e.message);
      return res.status(400).json({ message: messages[0] });
    }
    res.status(500).json({ message: "Server error", error: error.message });
  }
};

const deleteExpense = async (req, res) => {
  try {
    const expense = await Expense.findById(req.params.id);

    if (!expense) {
      return res.status(404).json({ message: "Expense not found" });
    }

    if (expense.userId.toString() !== req.user.id.toString()) {
      return res.status(403).json({
        message: "Not authorized to delete this expense",
      });
    }

    await expense.deleteOne();

    res.status(200).json({
      success: true,
      message: "Expense deleted successfully",
    });

  } catch (error) {
    res.status(500).json({ message: "Server error", error: error.message });
  }
};

const getExpenseSummary = async (req, res) => {
  try {
    const expenses = await Expense.find({ userId: req.user.id });

    const totalExpense = expenses.reduce((sum, item) => sum + item.amount, 0);

    const now = new Date();
    const currentMonthExpense = expenses
      .filter((item) => {
        const itemDate = new Date(item.date);
        return (
          itemDate.getMonth() === now.getMonth() &&
          itemDate.getFullYear() === now.getFullYear()
        );
      })
      .reduce((sum, item) => sum + item.amount, 0);

    const categoryBreakdown = expenses.reduce((acc, item) => {
      
      if (!acc[item.category]) {
        acc[item.category] = 0;
      }
      
      acc[item.category] += item.amount;
      return acc;
    }, {}); 

    const highestExpense = expenses.length
      ? Math.max(...expenses.map((item) => item.amount))
      : 0;

    const recentExpenses = await Expense.find({ userId: req.user.id })
      .sort({ date: -1 })
      .limit(5);

    res.status(200).json({
      success: true,
      summary: {
        totalExpense,
        currentMonthExpense,
        highestExpense,
        totalEntries: expenses.length,
      },
      categoryBreakdown,
      recentExpenses,
    });

  } catch (error) {
    res.status(500).json({ message: "Server error", error: error.message });
  }
};

module.exports = {
  addExpense,
  getAllExpenses,
  getExpenseById,
  updateExpense,
  deleteExpense,
  getExpenseSummary,
};