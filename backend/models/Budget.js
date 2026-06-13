const mongoose = require("mongoose");

const budgetSchema = new mongoose.Schema(
  {
    userId: {
      type: mongoose.Schema.Types.ObjectId,
      ref: "User",
      required: true,
    },

    month: {
      type: String,
      required: [true, "Month is required"],
      match: [/^\d{4}-(0[1-9]|1[0-2])$/, "Month must be in YYYY-MM format"],
    },

    budgetAmount: {
      type: Number,
      required: [true, "Budget amount is required"],
      min: [1, "Budget amount must be greater than 0"],
    },
  },
  {
    timestamps: true,
  }
);

budgetSchema.index({ userId: 1, month: 1 }, { unique: true });

const Budget = mongoose.model("Budget", budgetSchema);
module.exports = Budget;