import { useState, useEffect } from "react";
import axiosInstance from "../api/axios";
import Loader from "../components/Loader";
import { formatCurrency } from "../utils/formatCurrency";
import { exportToCSV, exportToPDF } from "../utils/exportHelpers";
import "./Reports.css";


const INCOME_COLUMNS = [
  { key: "title", label: "Title" },
  { key: "amount", label: "Amount" },
  { key: "date", label: "Date" },
  { key: "description", label: "Description" },
];

const EXPENSE_COLUMNS = [
  { key: "title", label: "Title" },
  { key: "category", label: "Category" },
  { key: "amount", label: "Amount" },
  { key: "date", label: "Date" },
  { key: "description", label: "Description" },
];

const Reports = () => {
  const [incomes, setIncomes] = useState([]);
  const [expenses, setExpenses] = useState([]);
  const [totalIncome, setTotalIncome] = useState(0);
  const [totalExpense, setTotalExpense] = useState(0);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState("");

  useEffect(() => {
    const fetchData = async () => {
      try {
        setLoading(true);

        const [incomeRes, expenseRes] = await Promise.all([
          axiosInstance.get("/income"),
          axiosInstance.get("/expense"),
        ]);

        setIncomes(incomeRes.data.incomes);
        setTotalIncome(incomeRes.data.totalIncome);
        setExpenses(expenseRes.data.expenses);
        setTotalExpense(expenseRes.data.totalExpense);

      } catch (err) {
        setError("Failed to load report data");
      } finally {
        setLoading(false);
      }
    };

    fetchData();
  }, []);

  const handleIncomeCSV = () => {
    exportToCSV(incomes, INCOME_COLUMNS, "income-report");
  };

  const handleIncomePDF = () => {
    exportToPDF(
      "Income Report",
      incomes,
      INCOME_COLUMNS,
      { "Total Income": formatCurrency(totalIncome), "Total Entries": incomes.length },
      "income-report"
    );
  };

  const handleExpenseCSV = () => {
    exportToCSV(expenses, EXPENSE_COLUMNS, "expense-report");
  };

  const handleExpensePDF = () => {
    exportToPDF(
      "Expense Report",
      expenses,
      EXPENSE_COLUMNS,
      { "Total Expense": formatCurrency(totalExpense), "Total Entries": expenses.length },
      "expense-report"
    );
  };

  const handleCombinedCSV = () => {
    const combined = [
      ...incomes.map((item) => ({ ...item, type: "Income" })),
      ...expenses.map((item) => ({ ...item, type: "Expense", category: item.category })),
    ].sort((a, b) => new Date(b.date) - new Date(a.date)); // latest first

    const columns = [
      { key: "type", label: "Type" },
      { key: "title", label: "Title" },
      { key: "category", label: "Category" },
      { key: "amount", label: "Amount" },
      { key: "date", label: "Date" },
    ];

    exportToCSV(combined, columns, "combined-report");
  };

  const handleCombinedPDF = () => {
    const combined = [
      ...incomes.map((item) => ({ ...item, type: "Income" })),
      ...expenses.map((item) => ({ ...item, type: "Expense", category: item.category })),
    ].sort((a, b) => new Date(b.date) - new Date(a.date));

    const columns = [
      { key: "type", label: "Type" },
      { key: "title", label: "Title" },
      { key: "category", label: "Category" },
      { key: "amount", label: "Amount" },
      { key: "date", label: "Date" },
    ];

    exportToPDF(
      "Combined Financial Report",
      combined,
      columns,
      {
        "Total Income": formatCurrency(totalIncome),
        "Total Expense": formatCurrency(totalExpense),
        "Net Balance": formatCurrency(totalIncome - totalExpense),
      },
      "combined-report"
    );
  };

  if (loading) return <Loader />;

  return (
    <div>
      <h1 className="page-title">Reports</h1>
      <p className="page-subtitle">Export your financial data</p>

      {error && <div className="alert alert-danger">{error}</div>}

      <div className="card-box">
        <div className="report-header">
          <div>
            <h3>Combined Report</h3>
            <p className="text-secondary">All income and expense transactions in one file</p>
          </div>
        </div>

        <div className="report-summary">
          <div className="report-stat">
            <span className="text-secondary">Total Income</span>
            <span className="text-success">{formatCurrency(totalIncome)}</span>
          </div>
          <div className="report-stat">
            <span className="text-secondary">Total Expense</span>
            <span className="text-danger">{formatCurrency(totalExpense)}</span>
          </div>
          <div className="report-stat">
            <span className="text-secondary">Net Balance</span>
            <span className={totalIncome - totalExpense >= 0 ? "text-success" : "text-danger"}>
              {formatCurrency(totalIncome - totalExpense)}
            </span>
          </div>
        </div>

        <div className="flex gap-md" style={{ marginTop: "var(--spacing-lg)" }}>
          <button
            className="btn btn-secondary"
            onClick={handleCombinedCSV}
            disabled={incomes.length === 0 && expenses.length === 0}
          >
            📄 Export CSV
          </button>
          <button
            className="btn btn-primary"
            onClick={handleCombinedPDF}
            disabled={incomes.length === 0 && expenses.length === 0}
          >
            📑 Export PDF
          </button>
        </div>
      </div>

      
      <div className="card-box">
        <div className="report-header">
          <div>
            <h3>Income Report</h3>
            <p className="text-secondary">{incomes.length} entries · {formatCurrency(totalIncome)}</p>
          </div>
        </div>

        <div className="flex gap-md">
          <button
            className="btn btn-secondary"
            onClick={handleIncomeCSV}
            disabled={incomes.length === 0}
          >
            📄 Export CSV
          </button>
          <button
            className="btn btn-primary"
            onClick={handleIncomePDF}
            disabled={incomes.length === 0}
          >
            📑 Export PDF
          </button>
        </div>

        {incomes.length === 0 && (
          <p className="text-secondary" style={{ marginTop: "var(--spacing-md)" }}>
            No income data to export.
          </p>
        )}
      </div>

      <div className="card-box">
        <div className="report-header">
          <div>
            <h3>Expense Report</h3>
            <p className="text-secondary">{expenses.length} entries · {formatCurrency(totalExpense)}</p>
          </div>
        </div>

        <div className="flex gap-md">
          <button
            className="btn btn-secondary"
            onClick={handleExpenseCSV}
            disabled={expenses.length === 0}
          >
            📄 Export CSV
          </button>
          <button
            className="btn btn-primary"
            onClick={handleExpensePDF}
            disabled={expenses.length === 0}
          >
            📑 Export PDF
          </button>
        </div>

        {expenses.length === 0 && (
          <p className="text-secondary" style={{ marginTop: "var(--spacing-md)" }}>
            No expense data to export.
          </p>
        )}
      </div>
    </div>
  );
};

export default Reports;