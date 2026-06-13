export const getLastNMonths = (n) => {
  const months = [];
  const now = new Date();

  for (let i = n - 1; i >= 0; i--) {
    const date = new Date(now.getFullYear(), now.getMonth() - i, 1);
    const monthStr = `${date.getFullYear()}-${String(date.getMonth() + 1).padStart(2, "0")}`;
    months.push(monthStr);
  }

  return months;
};

export const formatMonthShort = (monthString) => {
  const [year, month] = monthString.split("-");
  const date = new Date(year, month - 1);
  return date.toLocaleDateString("en-IN", { month: "short", year: "2-digit" });
};

export const groupByMonth = (transactions, months) => {
  const totals = {};
  months.forEach((m) => (totals[m] = 0));

  transactions.forEach((item) => {
    const date = new Date(item.date);
    const monthKey = `${date.getFullYear()}-${String(date.getMonth() + 1).padStart(2, "0")}`;

    // sirf un months ka data lo jo hum chart mein dikha rahe hain
    if (totals.hasOwnProperty(monthKey)) {
      totals[monthKey] += item.amount;
    }
  });

  return months.map((m) => totals[m]);
};

export const CHART_COLORS = {
  income: "#16a34a",
  expense: "#dc2626",
  categoryColors: [
    "#4f46e5", // Food
    "#0ea5e9", // Shopping
    "#f59e0b", // Travel
    "#dc2626", // Entertainment
    "#64748b", // Bills
    "#16a34a", // Health
    "#7c3aed", // Education
    "#94a3b8", // Other
  ],
};