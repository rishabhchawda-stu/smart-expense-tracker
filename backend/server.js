const express = require("express");
require("dotenv").config();
const cors = require("cors");
const connectDB = require("./config/db");

const authRoutes = require("./routes/authRoutes");
const incomeRoutes = require("./routes/incomeRoutes");
const expenseRoutes = require("./routes/expenseRoutes");
const budgetRoutes = require("./routes/budgetRoutes");

const app = express();
connectDB();

const allowedOrigins = ["http://localhost:5173", "http://localhost:5174","https://smart-expense-tracker-kyrf.onrender.com/api"];

app.use(cors({
  origin: function (origin, callback) {
    // agar origin allowedOrigins mein hai, ya request Postman se aayi hai (origin undefined)
    if (!origin || allowedOrigins.includes(origin)) {
      callback(null, true);
    } else {
      callback(new Error("Not allowed by CORS"));
    }
  },
  credentials: true,
}));

app.use(express.json());
app.use(express.urlencoded({ extended: true }));

app.use("/api/auth", authRoutes);
app.use("/api/income", incomeRoutes);
app.use("/api/expense", expenseRoutes);
app.use("/api/budget", budgetRoutes);

app.get("/", (req, res) => {
  res.json({ message: "Smart Expense Tracker API is running!", status: "OK" });
});

app.use((req, res) => {
  res.status(404).json({ message: "Route not found" });
});

const PORT = process.env.PORT || 5000;
app.listen(PORT, () => {
  console.log(`Server running on http://localhost:${PORT}`);
});