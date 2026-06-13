const Income = require("../models/Income");

const addIncome = async (req, res) => {
  try {
    const { title, amount, date, description } = req.body;

    if (!title || !amount || !date) {
      return res.status(400).json({
        message: "Title, amount and date are required",
      });
    }

    if (amount <= 0) {
      return res.status(400).json({
        message: "Amount must be greater than 0",
      });
    }

    const income = await Income.create({
      userId: req.user.id,
      title,
      amount,
      date,
      description,
    });

    res.status(201).json({
      success: true,
      message: "Income added successfully",
      income,
    });

  } catch (error) {
    if (error.name === "ValidationError") {
      const messages = Object.values(error.errors).map((e) => e.message);
      return res.status(400).json({ message: messages[0] });
    }
    res.status(500).json({ message: "Server error", error: error.message });
  }
};

const getAllIncomes = async (req, res) => {
  try {
    
    const incomes = await Income.find({ userId: req.user.id })
      .sort({ date: -1 }); 

    const totalIncome = incomes.reduce((sum, item) => sum + item.amount, 0);

    res.status(200).json({
      success: true,
      count: incomes.length,      
      totalIncome,                 
      incomes,                     
    });

  } catch (error) {
    res.status(500).json({ message: "Server error", error: error.message });
  }
};

const getIncomeById = async (req, res) => {
  try {
    const income = await Income.findById(req.params.id);

    if (!income) {
      return res.status(404).json({ message: "Income not found" });
    }

    if (income.userId.toString() !== req.user.id.toString()) {
      return res.status(403).json({
        message: "Not authorized to access this income",
      });
    }

    res.status(200).json({
      success: true,
      income,
    });

  } catch (error) {
    res.status(500).json({ message: "Server error", error: error.message });
  }
};

const updateIncome = async (req, res) => {
  try {
    const { title, amount, date, description } = req.body;

    const income = await Income.findById(req.params.id);

    if (!income) {
      return res.status(404).json({ message: "Income not found" });
    }

    if (income.userId.toString() !== req.user.id.toString()) {
      return res.status(403).json({
        message: "Not authorized to update this income",
      });
    }

    if (amount && amount <= 0) {
      return res.status(400).json({
        message: "Amount must be greater than 0",
      });
    }
    income.title = title || income.title;
    income.amount = amount || income.amount;
    income.date = date || income.date;
    income.description = description !== undefined ? description : income.description;

    const updatedIncome = await income.save();

    res.status(200).json({
      success: true,
      message: "Income updated successfully",
      income: updatedIncome,
    });

  } catch (error) {
    res.status(500).json({ message: "Server error", error: error.message });
  }
};

const deleteIncome = async (req, res) => {
  try {
    const income = await Income.findById(req.params.id);

    if (!income) {
      return res.status(404).json({ message: "Income not found" });
    }
    if (income.userId.toString() !== req.user.id.toString()) {
      return res.status(403).json({
        message: "Not authorized to delete this income",
      });
    }
    await income.deleteOne();

    res.status(200).json({
      success: true,
      message: "Income deleted successfully",
    });

  } catch (error) {
    res.status(500).json({ message: "Server error", error: error.message });
  }
};

const getIncomeSummary = async (req, res) => {
  try {
    const incomes = await Income.find({ userId: req.user.id });
    const totalIncome = incomes.reduce((sum, item) => sum + item.amount, 0);

    const now = new Date();
    const currentMonthIncome = incomes
      .filter((item) => {
        const itemDate = new Date(item.date);
        return (
          itemDate.getMonth() === now.getMonth() &&
          itemDate.getFullYear() === now.getFullYear()
        );
      })
      .reduce((sum, item) => sum + item.amount, 0);

    const highestIncome = incomes.length
      ? Math.max(...incomes.map((item) => item.amount))
      : 0;
    const recentIncomes = await Income.find({ userId: req.user.id })
      .sort({ date: -1 })
      .limit(5);

    res.status(200).json({
      success: true,
      summary: {
        totalIncome,
        currentMonthIncome,
        highestIncome,
        totalEntries: incomes.length,
      },
      recentIncomes,
    });

  } catch (error) {
    res.status(500).json({ message: "Server error", error: error.message });
  }
};

module.exports = {
  addIncome,
  getAllIncomes,
  getIncomeById,
  updateIncome,
  deleteIncome,
  getIncomeSummary,
};