const mongoose = require("mongoose");

const expenseSchema = new mongoose.Schema(
  {
    userId: {
      type: mongoose.Schema.Types.ObjectId,
      ref: "User",
      required: true,
    },

    title: {
      type: String,
      required: [true, "Expense title is required"],
      trim: true,
      maxlength: [100, "Title cannot exceed 100 characters"],
    },

    amount: {
      type: Number,
      required: [true, "Amount is required"],
      min: [1, "Amount must be greater than 0"],
    },

    category: {
      type: String,
      required: [true, "Category is required"],
      enum: {
        values: [
          "Food",
          "Shopping",
          "Travel",
          "Entertainment",
          "Bills",
          "Health",
          "Education",
          "Other",
        ],
        message: "{VALUE} is not a valid category",
      },
    },

    date: {
      type: Date,
      required: [true, "Date is required"],
    },

    description: {
      type: String,
      trim: true,
      maxlength: [300, "Description cannot exceed 300 characters"],
      default: "",
    },
  },
  {
    timestamps: true,
  }
);

const Expense = mongoose.model("Expense", expenseSchema);
module.exports = Expense;