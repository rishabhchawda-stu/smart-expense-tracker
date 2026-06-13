import { useState, useEffect } from "react";
import axiosInstance from "../api/axios";
import Card from "../components/Card";
import Loader from "../components/Loader";
import Modal from "../components/Modal";
import ConfirmDialog from "../components/ConfirmDialog";
import { formatCurrency } from "../utils/formatCurrency";
import "./Budget.css";

const getCurrentMonth = () => {
  const now = new Date();
  return `${now.getFullYear()}-${String(now.getMonth() + 1).padStart(2, "0")}`;
};

const formatMonthLabel = (monthString) => {
  const [year, month] = monthString.split("-");
  const date = new Date(year, month - 1); 
  return date.toLocaleDateString("en-IN", { month: "long", year: "numeric" });
};

const Budget = () => {
  
  const [selectedMonth, setSelectedMonth] = useState(getCurrentMonth());
  const [currentBudget, setCurrentBudget] = useState(null);
  const [allBudgets, setAllBudgets] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState("");
  const [notSet, setNotSet] = useState(false); 
  const [isModalOpen, setIsModalOpen] = useState(false);
  const [isEditMode, setIsEditMode] = useState(false); 
  const [formData, setFormData] = useState({
    month: getCurrentMonth(),
    budgetAmount: "",
  });
  const [formErrors, setFormErrors] = useState({});
  const [submitting, setSubmitting] = useState(false);
  const [formError, setFormError] = useState("");
  const [deleteId, setDeleteId] = useState(null);
  const fetchBudgetForMonth = async (month) => {
    try {
      setNotSet(false);
      setError("");
      const response = await axiosInstance.get(`/budget/${month}`);
      setCurrentBudget(response.data.budget);

    } catch (err) {
      if (err.response?.status === 404) {
        setCurrentBudget(null);
        setNotSet(true);
      } else {
        setError("Failed to load budget");
      }
    }
  };

  const fetchAllBudgets = async () => {
    try {
      const response = await axiosInstance.get("/budget");
      setAllBudgets(response.data.budgets);
    } catch (err) {
      setError("Failed to load budget history");
    }
  };

  useEffect(() => {
    const loadData = async () => {
      setLoading(true);
      await Promise.all([
        fetchBudgetForMonth(selectedMonth),
        fetchAllBudgets(),
      ]);
      setLoading(false);
    };
    loadData();
  }, []);

  useEffect(() => {
    fetchBudgetForMonth(selectedMonth);
  }, [selectedMonth]);

  const openSetModal = () => {
    setIsEditMode(false);
    setFormData({
      month: selectedMonth,
      budgetAmount: "",
    });
    setFormErrors({});
    setFormError("");
    setIsModalOpen(true);
  };

  const openEditModal = () => {
    setIsEditMode(true);
    setFormData({
      month: currentBudget.month,
      budgetAmount: currentBudget.budgetAmount,
    });
    setFormErrors({});
    setFormError("");
    setIsModalOpen(true);
  };

  const closeModal = () => {
    setIsModalOpen(false);
  };

  const handleChange = (e) => {
    const { name, value } = e.target;
    setFormData((prev) => ({ ...prev, [name]: value }));

    if (formErrors[name]) {
      setFormErrors((prev) => ({ ...prev, [name]: "" }));
    }
  };

  const validate = () => {
    const newErrors = {};

    if (!formData.budgetAmount || Number(formData.budgetAmount) <= 0) {
      newErrors.budgetAmount = "Budget amount must be greater than 0";
    }

    if (!isEditMode && !formData.month) {
      newErrors.month = "Month is required";
    }

    setFormErrors(newErrors);
    return Object.keys(newErrors).length === 0;
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    setFormError("");

    if (!validate()) return;

    setSubmitting(true);

    try {
      if (isEditMode) {
        await axiosInstance.put(`/budget/${currentBudget._id}`, {
          budgetAmount: Number(formData.budgetAmount),
        });
      } else {
        await axiosInstance.post("/budget", {
          month: formData.month,
          budgetAmount: Number(formData.budgetAmount),
        });
      }

      closeModal();

      await fetchBudgetForMonth(selectedMonth);
      await fetchAllBudgets();

    } catch (err) {
      const message = err.response?.data?.message || "Something went wrong";
      setFormError(message);
    } finally {
      setSubmitting(false);
    }
  };

  const confirmDelete = (id) => {
    setDeleteId(id);
  };

  const handleDelete = async () => {
    try {
      await axiosInstance.delete(`/budget/${deleteId}`);
      setDeleteId(null);

      // refresh
      await fetchBudgetForMonth(selectedMonth);
      await fetchAllBudgets();

    } catch (err) {
      setError("Failed to delete budget");
      setDeleteId(null);
    }
  };

  const getStatusMessage = (status) => {
    const messages = {
      safe: "You're within budget. Keep it up!",
      warning: "You've used most of your budget. Spend carefully.",
      critical: "Almost at your limit! Be cautious.",
      exceeded: "Budget exceeded! You've overspent this month.",
    };
    return messages[status] || "";
  };

  if (loading) return <Loader />;

  return (
    <div>
      
      <div className="flex-between" style={{ marginBottom: "8px" }}>
        <div>
          <h1 className="page-title">Budget</h1>
          <p className="page-subtitle">Set and track your monthly budget</p>
        </div>

        
        <div className="form-group" style={{ marginBottom: 0 }}>
          <input
            type="month"
            className="form-input"
            value={selectedMonth}
            onChange={(e) => setSelectedMonth(e.target.value)}
          />
        </div>
      </div>

      {error && <div className="alert alert-danger">{error}</div>}

      
      <div className="card-box">
        <div className="flex-between" style={{ marginBottom: "var(--spacing-md)" }}>
          <h3>{formatMonthLabel(selectedMonth)}</h3>

          {currentBudget && (
            <span className={`badge badge-${currentBudget.status}`}>
              {currentBudget.status.toUpperCase()}
            </span>
          )}
        </div>

        
        {notSet ? (
          <div className="empty-state">
            <p>No budget set for {formatMonthLabel(selectedMonth)}.</p>
            <button className="btn btn-primary" onClick={openSetModal}>
              + Set Budget
            </button>
          </div>
        ) : currentBudget ? (
          <>
            
            {(currentBudget.status === "exceeded" || currentBudget.status === "critical") && (
              <div className={`alert alert-${currentBudget.status === "exceeded" ? "danger" : "warning-custom"}`}>
                {getStatusMessage(currentBudget.status)}
              </div>
            )}

            
            <div className="budget-summary-grid">
              <div className="budget-stat">
                <span className="budget-stat-label">Budget</span>
                <span className="budget-stat-value">{formatCurrency(currentBudget.budgetAmount)}</span>
              </div>
              <div className="budget-stat">
                <span className="budget-stat-label">Spent</span>
                <span className="budget-stat-value text-danger">{formatCurrency(currentBudget.totalSpent)}</span>
              </div>
              <div className="budget-stat">
                <span className="budget-stat-label">Remaining</span>
                <span className={`budget-stat-value ${currentBudget.remaining < 0 ? "text-danger" : "text-success"}`}>
                  {formatCurrency(currentBudget.remaining)}
                </span>
              </div>
            </div>

            
            <div className="progress-bar" style={{ marginTop: "var(--spacing-md)" }}>
              <div
                className={`progress-bar-fill progress-${currentBudget.status}`}
                style={{ width: `${Math.min(currentBudget.percentageUsed, 100)}%` }}
              ></div>
            </div>
            <p className="text-secondary" style={{ marginTop: "4px", fontSize: "13px" }}>
              {currentBudget.percentageUsed}% used
            </p>

            
            <div className="flex gap-md" style={{ marginTop: "var(--spacing-lg)" }}>
              <button className="btn btn-secondary" onClick={openEditModal}>
                Edit Budget
              </button>
              <button className="btn btn-danger" onClick={() => confirmDelete(currentBudget._id)}>
                Delete Budget
              </button>
            </div>
          </>
        ) : null}
      </div>

      
      <div className="card-box">
        <h3>Budget History</h3>

        {allBudgets.length === 0 ? (
          <p className="text-secondary">No budgets set yet.</p>
        ) : (
          <table className="data-table">
            <thead>
              <tr>
                <th>Month</th>
                <th>Budget Amount</th>
                <th>Created</th>
              </tr>
            </thead>
            <tbody>
              {allBudgets.map((budget) => (
                <tr key={budget._id}>
                  <td>{formatMonthLabel(budget.month)}</td>
                  <td>{formatCurrency(budget.budgetAmount)}</td>
                  <td className="text-secondary">
                    {new Date(budget.createdAt).toLocaleDateString("en-IN", {
                      day: "2-digit",
                      month: "short",
                      year: "numeric",
                    })}
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        )}
      </div>

      
      <Modal
        isOpen={isModalOpen}
        onClose={closeModal}
        title={isEditMode ? "Edit Budget" : "Set Budget"}
      >
        {formError && <div className="alert alert-danger">{formError}</div>}

        <form onSubmit={handleSubmit}>
          <div className="form-group">
            <label className="form-label" htmlFor="month">Month</label>
            <input
              type="month"
              id="month"
              name="month"
              className={`form-input ${formErrors.month ? "error" : ""}`}
              value={formData.month}
              onChange={handleChange}
              disabled={isEditMode} 
            />
            {formErrors.month && <p className="form-error">{formErrors.month}</p>}
          </div>

          
          <div className="form-group">
            <label className="form-label" htmlFor="budgetAmount">Budget Amount (₹)</label>
            <input
              type="number"
              id="budgetAmount"
              name="budgetAmount"
              className={`form-input ${formErrors.budgetAmount ? "error" : ""}`}
              placeholder="e.g. 20000"
              min="1"
              value={formData.budgetAmount}
              onChange={handleChange}
            />
            {formErrors.budgetAmount && <p className="form-error">{formErrors.budgetAmount}</p>}
          </div>

          
          <div className="flex gap-md" style={{ justifyContent: "flex-end" }}>
            <button type="button" className="btn btn-secondary" onClick={closeModal}>
              Cancel
            </button>
            <button type="submit" className="btn btn-primary" disabled={submitting}>
              {submitting ? <span className="spinner"></span> : (isEditMode ? "Update" : "Set Budget")}
            </button>
          </div>
        </form>
      </Modal>

      
      <ConfirmDialog
        isOpen={!!deleteId}
        onClose={() => setDeleteId(null)}
        onConfirm={handleDelete}
        message="Are you sure you want to delete this budget? This action cannot be undone."
      />
    </div>
  );
};

export default Budget;