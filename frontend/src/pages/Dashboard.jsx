import { useState, useEffect } from "react";
import axiosInstance from "../api/axios";
import Card from "../components/Card";
import Loader from "../components/Loader";
import { formatCurrency, formatDate } from "../utils/formatCurrency";
import "./Dashboard.css";

const Dashboard = () => {
  
  const [incomeSummary, setIncomeSummary] = useState(null);
  const [expenseSummary, setExpenseSummary] = useState(null);
  const [budget, setBudget] = useState(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState("");

  useEffect(() => {
    const fetchDashboardData = async () => {
      try {
        setLoading(true);
        const now = new Date();
        const currentMonth = `${now.getFullYear()}-${String(now.getMonth() + 1).padStart(2, "0")}`;
        const results = await Promise.allSettled([
          axiosInstance.get("/income/summary"),
          axiosInstance.get("/expense/summary"),
          axiosInstance.get(`/budget/${currentMonth}`),
        ]);

        if (results[0].status === "fulfilled") {
          setIncomeSummary(results[0].value.data);
        }

        
        if (results[1].status === "fulfilled") {
          setExpenseSummary(results[1].value.data);
        }

        if (results[2].status === "fulfilled") {
          setBudget(results[2].value.data.budget);
        }

      } catch (err) {
        setError("Failed to load dashboard data");
      } finally {
        setLoading(false);
      }
    };

    fetchDashboardData();
  }, []); 


  if (loading) return <Loader />;

  const totalIncome = incomeSummary?.summary?.totalIncome || 0;
  const totalExpense = expenseSummary?.summary?.totalExpense || 0;
  const balance = totalIncome - totalExpense;

  const recentTransactions = [
    ...(incomeSummary?.recentIncomes || []).map((item) => ({
      ...item,
      type: "income",
    })),
    ...(expenseSummary?.recentExpenses || []).map((item) => ({
      ...item,
      type: "expense",
    })),
  ]
    .sort((a, b) => new Date(b.date) - new Date(a.date)) 
    .slice(0, 5); 

  return (
    <div>
      <h1 className="page-title">Dashboard</h1>
      <p className="page-subtitle">Overview of your finances</p>

      {error && <div className="alert alert-danger">{error}</div>}

      <div className="stats-grid">
        <Card
          title="Total Income"
          value={formatCurrency(totalIncome)}
          icon="💰"
          color="success"
        />
        <Card
          title="Total Expense"
          value={formatCurrency(totalExpense)}
          icon="💳"
          color="danger"
        />
        <Card
          title="Remaining Balance"
          value={formatCurrency(balance)}
          icon="🏦"
          color={balance >= 0 ? "primary" : "danger"}
        />
        <Card
          title="Monthly Budget"
          value={budget ? formatCurrency(budget.budgetAmount) : "Not Set"}
          icon="🎯"
          color="warning"
        />
      </div>

      {budget && (
        <div className="card-box">
          <div className="flex-between">
            <h3>Budget Status — {budget.month}</h3>
            <span className={`badge badge-${budget.status}`}>
              {budget.status.toUpperCase()}
            </span>
          </div>

          <div className="progress-bar">
            <div
              className={`progress-bar-fill progress-${budget.status}`}
              style={{ width: `${Math.min(budget.percentageUsed, 100)}%` }}
            ></div>
          </div>

          <div className="flex-between" style={{ marginTop: "8px" }}>
            <span className="text-secondary">
              Spent: {formatCurrency(budget.totalSpent)}
            </span>
            <span className="text-secondary">
              Remaining: {formatCurrency(budget.remaining)}
            </span>
          </div>
        </div>
      )}

      <div className="card-box">
        <h3>Recent Transactions</h3>

        {recentTransactions.length === 0 ? (
          <p className="text-secondary">No transactions yet</p>
        ) : (
          <table className="data-table">
            <thead>
              <tr>
                <th>Title</th>
                <th>Type</th>
                <th>Date</th>
                <th>Amount</th>
              </tr>
            </thead>
            <tbody>
              {recentTransactions.map((item) => (
                <tr key={item._id}>
                  <td>{item.title}</td>
                  <td>
                    <span className={`badge badge-${item.type === "income" ? "success" : "danger"}`}>
                      {item.type === "income" ? "Income" : "Expense"}
                    </span>
                  </td>
                  <td>{formatDate(item.date)}</td>
                  <td className={item.type === "income" ? "text-success" : "text-danger"}>
                    {item.type === "income" ? "+" : "-"}{formatCurrency(item.amount)}
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        )}
      </div>
    </div>
  );
};

export default Dashboard;