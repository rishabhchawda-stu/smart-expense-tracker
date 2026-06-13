import { useState, useEffect } from "react";
import { Bar, Pie, Line } from "react-chartjs-2";
import {
  Chart as ChartJS,
  CategoryScale,
  LinearScale,
  BarElement,
  ArcElement,
  PointElement,
  LineElement,
  Title,
  Tooltip,
  Legend,
} from "chart.js";
import axiosInstance from "../api/axios";
import Loader from "../components/Loader";
import { formatCurrency } from "../utils/formatCurrency";
import {
  getLastNMonths,
  formatMonthShort,
  groupByMonth,
  CHART_COLORS,
} from "../utils/chartHelpers";
import "./Analytics.css";

ChartJS.register(
  CategoryScale,
  LinearScale,
  BarElement,
  ArcElement,
  PointElement,
  LineElement,
  Title,
  Tooltip,
  Legend
);

const Analytics = () => {
  const [incomes, setIncomes] = useState([]);
  const [expenses, setExpenses] = useState([]);
  const [categoryBreakdown, setCategoryBreakdown] = useState({});
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState("");

  useEffect(() => {
    const fetchData = async () => {
      try {
        setLoading(true);

        const [incomeRes, expenseRes, summaryRes] = await Promise.all([
          axiosInstance.get("/income"),
          axiosInstance.get("/expense"),
          axiosInstance.get("/expense/summary"),
        ]);

        setIncomes(incomeRes.data.incomes);
        setExpenses(expenseRes.data.expenses);
        setCategoryBreakdown(summaryRes.data.categoryBreakdown);

      } catch (err) {
        setError("Failed to load analytics data");
      } finally {
        setLoading(false);
      }
    };

    fetchData();
  }, []);

  if (loading) return <Loader />;

  const last6Months = getLastNMonths(6);
  const monthLabels = last6Months.map(formatMonthShort); 

  const incomeData = groupByMonth(incomes, last6Months);
  const expenseData = groupByMonth(expenses, last6Months);

  const barChartData = {
    labels: monthLabels,
    datasets: [
      {
        label: "Income",
        data: incomeData,
        backgroundColor: CHART_COLORS.income,
        borderRadius: 6,
      },
      {
        label: "Expense",
        data: expenseData,
        backgroundColor: CHART_COLORS.expense,
        borderRadius: 6,
      },
    ],
  };

  const barChartOptions = {
    responsive: true,
    plugins: {
      legend: { position: "top" },
      title: { display: false },
    },
    scales: {
      y: {
        beginAtZero: true,
        ticks: {
          callback: (value) => `₹${value / 1000}k`,
        },
      },
    },
  };

  const categoryLabels = Object.keys(categoryBreakdown);
  const categoryValues = Object.values(categoryBreakdown);

  const pieChartData = {
    labels: categoryLabels,
    datasets: [
      {
        data: categoryValues,
        backgroundColor: CHART_COLORS.categoryColors,
        borderWidth: 1,
        borderColor: "#fff",
      },
    ],
  };

  const pieChartOptions = {
    responsive: true,
    plugins: {
      legend: { position: "right" },
      tooltip: {
        callbacks: {
          label: (context) => {
            const total = categoryValues.reduce((sum, v) => sum + v, 0);
            const percentage = ((context.parsed / total) * 100).toFixed(1);
            return `${context.label}: ${formatCurrency(context.parsed)} (${percentage}%)`;
          },
        },
      },
    },
  };

  const lineChartData = {
    labels: monthLabels,
    datasets: [
      {
        label: "Expense Trend",
        data: expenseData, 
        borderColor: CHART_COLORS.expense,
        backgroundColor: "rgba(220, 38, 38, 0.1)",
        tension: 0.3, 
        fill: true,
        pointRadius: 4,
        pointBackgroundColor: CHART_COLORS.expense,
      },
    ],
  };

  const lineChartOptions = {
    responsive: true,
    plugins: {
      legend: { display: false },
    },
    scales: {
      y: {
        beginAtZero: true,
        ticks: {
          callback: (value) => `₹${value / 1000}k`,
        },
      },
    },
  };

  const total6MonthIncome = incomeData.reduce((sum, v) => sum + v, 0);
  const total6MonthExpense = expenseData.reduce((sum, v) => sum + v, 0);

  return (
    <div>
      <h1 className="page-title">Analytics</h1>
      <p className="page-subtitle">Visual insights into your finances</p>

      {error && <div className="alert alert-danger">{error}</div>}

      
      <div className="stats-grid" style={{ marginBottom: "var(--spacing-lg)" }}>
        <div className="card-box stat-mini">
          <span className="text-secondary">Last 6 Months Income</span>
          <h3 className="text-success">{formatCurrency(total6MonthIncome)}</h3>
        </div>
        <div className="card-box stat-mini">
          <span className="text-secondary">Last 6 Months Expense</span>
          <h3 className="text-danger">{formatCurrency(total6MonthExpense)}</h3>
        </div>
        <div className="card-box stat-mini">
          <span className="text-secondary">Net Savings</span>
          <h3 className={total6MonthIncome - total6MonthExpense >= 0 ? "text-success" : "text-danger"}>
            {formatCurrency(total6MonthIncome - total6MonthExpense)}
          </h3>
        </div>
      </div>

      <div className="card-box">
        <h3>Income vs Expense (Last 6 Months)</h3>
        {incomes.length === 0 && expenses.length === 0 ? (
          <p className="text-secondary">No data available yet. Add some income/expense entries first.</p>
        ) : (
          <div className="chart-wrapper">
            <Bar data={barChartData} options={barChartOptions} />
          </div>
        )}
      </div>

      <div className="analytics-grid">
        <div className="card-box">
          <h3>Expense by Category</h3>
          {categoryLabels.length === 0 ? (
            <p className="text-secondary">No expenses recorded yet.</p>
          ) : (
            <div className="chart-wrapper chart-wrapper-pie">
              <Pie data={pieChartData} options={pieChartOptions} />
            </div>
          )}
        </div>

        <div className="card-box">
          <h3>Monthly Expense Trend</h3>
          {expenses.length === 0 ? (
            <p className="text-secondary">No expenses recorded yet.</p>
          ) : (
            <div className="chart-wrapper">
              <Line data={lineChartData} options={lineChartOptions} />
            </div>
          )}
        </div>
      </div>

      {categoryLabels.length > 0 && (
        <div className="card-box">
          <h3>Spending Distribution</h3>
          <table className="data-table">
            <thead>
              <tr>
                <th>Category</th>
                <th>Amount</th>
                <th>% of Total</th>
              </tr>
            </thead>
            <tbody>
              {categoryLabels.map((cat, index) => {
                const total = categoryValues.reduce((sum, v) => sum + v, 0);
                const percentage = ((categoryBreakdown[cat] / total) * 100).toFixed(1);

                return (
                  <tr key={cat}>
                    <td>
                      <span
                        className="color-dot"
                        style={{ backgroundColor: CHART_COLORS.categoryColors[index % CHART_COLORS.categoryColors.length] }}
                      ></span>
                      {cat}
                    </td>
                    <td className="text-danger">{formatCurrency(categoryBreakdown[cat])}</td>
                    <td>{percentage}%</td>
                  </tr>
                );
              })}
            </tbody>
          </table>
        </div>
      )}
    </div>
  );
};

export default Analytics;