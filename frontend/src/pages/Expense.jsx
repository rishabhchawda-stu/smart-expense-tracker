import { useState, useEffect } from "react";
import axiosInstance from "../api/axios";
import Card from "../components/Card";
import Loader from "../components/Loader";
import Modal from "../components/Modal";
import ConfirmDialog from "../components/ConfirmDialog";
import { formatCurrency, formatDate } from "../utils/formatCurrency";
import "./Expense.css";

const CATEGORIES = [
  "Food",
  "Shopping",
  "Travel",
  "Entertainment",
  "Bills",
  "Health",
  "Education",
  "Other",
];

const Expense = () => {
  
  const [expenses, setExpenses] = useState([]);
  const [totalExpense, setTotalExpense] = useState(0);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState("");

  const [categoryFilter, setCategoryFilter] = useState("All");
  const [sortOption, setSortOption] = useState("latest");

  const [isModalOpen, setIsModalOpen] = useState(false);
  const [editingExpense, setEditingExpense] = useState(null);

  const [deleteId, setDeleteId] = useState(null);

  const [formData, setFormData] = useState({
    title: "",
    amount: "",
    category: "Food",
    date: "",
    description: "",
  });
  const [formErrors, setFormErrors] = useState({});
  const [submitting, setSubmitting] = useState(false);
  const [formError, setFormError] = useState("");

  const fetchExpenses = async () => {
    try {
      setLoading(true);

      const params = new URLSearchParams();

      if (categoryFilter !== "All") {
        params.append("category", categoryFilter);
      }

      if (sortOption !== "latest") {
        params.append("sort", sortOption);
      }

      const response = await axiosInstance.get(`/expense?${params.toString()}`);

      setExpenses(response.data.expenses);
      setTotalExpense(response.data.totalExpense);

    } catch (err) {
      setError("Failed to load expenses");
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchExpenses();
  }, [categoryFilter, sortOption]);

  const openAddModal = () => {
    setEditingExpense(null);
    setFormData({
      title: "",
      amount: "",
      category: "Food",
      date: new Date().toISOString().split("T")[0],
      description: "",
    });
    setFormErrors({});
    setFormError("");
    setIsModalOpen(true);
  };

  const openEditModal = (expense) => {
    setEditingExpense(expense);
    setFormData({
      title: expense.title,
      amount: expense.amount,
      category: expense.category,
      date: new Date(expense.date).toISOString().split("T")[0],
      description: expense.description || "",
    });
    setFormErrors({});
    setFormError("");
    setIsModalOpen(true);
  };

  const closeModal = () => {
    setIsModalOpen(false);
    setEditingExpense(null);
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

    if (!formData.title.trim()) {
      newErrors.title = "Title is required";
    }

    if (!formData.amount || Number(formData.amount) <= 0) {
      newErrors.amount = "Amount must be greater than 0";
    }

    if (!formData.category) {
      newErrors.category = "Category is required";
    }

    if (!formData.date) {
      newErrors.date = "Date is required";
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
      const payload = {
        title: formData.title,
        amount: Number(formData.amount),
        category: formData.category,
        date: formData.date,
        description: formData.description,
      };

      if (editingExpense) {
        await axiosInstance.put(`/expense/${editingExpense._id}`, payload);
      } else {
        await axiosInstance.post("/expense", payload);
      }

      closeModal();
      fetchExpenses();

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
      await axiosInstance.delete(`/expense/${deleteId}`);
      setDeleteId(null);
      fetchExpenses();
    } catch (err) {
      setError("Failed to delete expense");
      setDeleteId(null);
    }
  };

  const getCategoryColor = (category) => {
    const colors = {
      Food: "warning",
      Shopping: "primary",
      Travel: "info",
      Entertainment: "danger",
      Bills: "secondary",
      Health: "success",
      Education: "primary",
      Other: "secondary",
    };
    return colors[category] || "secondary";
  };

  if (loading && expenses.length === 0) return <Loader />;

  return (
    <div>
      
      <div className="flex-between" style={{ marginBottom: "8px" }}>
        <div>
          <h1 className="page-title">Expense</h1>
          <p className="page-subtitle">Track and manage your expenses</p>
        </div>
        <button className="btn btn-primary" onClick={openAddModal}>
          + Add Expense
        </button>
      </div>

      {error && <div className="alert alert-danger">{error}</div>}

      
      <div className="stats-grid" style={{ marginBottom: "var(--spacing-lg)" }}>
        <Card
          title="Total Expense"
          value={formatCurrency(totalExpense)}
          icon="💳"
          color="danger"
        />
        <Card
          title="Total Entries"
          value={expenses.length}
          icon="📋"
          color="primary"
        />
      </div>

      <div className="card-box filter-bar">
        <div className="filter-group">
          <label className="form-label">Category</label>
          <select
            className="form-select"
            value={categoryFilter}
            onChange={(e) => setCategoryFilter(e.target.value)}
          >
            <option value="All">All Categories</option>
            {CATEGORIES.map((cat) => (
              <option key={cat} value={cat}>{cat}</option>
            ))}
          </select>
        </div>

        <div className="filter-group">
          <label className="form-label">Sort By</label>
          <select
            className="form-select"
            value={sortOption}
            onChange={(e) => setSortOption(e.target.value)}
          >
            <option value="latest">Latest First</option>
            <option value="oldest">Oldest First</option>
            <option value="highest">Highest Amount</option>
            <option value="lowest">Lowest Amount</option>
          </select>
        </div>
      </div>

      <div className="card-box">
        {expenses.length === 0 ? (
          <div className="empty-state">
            <p>No expense entries found.</p>
            <button className="btn btn-primary" onClick={openAddModal}>
              + Add Your First Expense
            </button>
          </div>
        ) : (
          <table className="data-table">
            <thead>
              <tr>
                <th>Title</th>
                <th>Category</th>
                <th>Description</th>
                <th>Date</th>
                <th>Amount</th>
                <th>Actions</th>
              </tr>
            </thead>
            <tbody>
              {expenses.map((expense) => (
                <tr key={expense._id}>
                  <td>{expense.title}</td>
                  <td>
                    <span className={`badge badge-${getCategoryColor(expense.category)}`}>
                      {expense.category}
                    </span>
                  </td>
                  <td className="text-secondary">{expense.description || "—"}</td>
                  <td>{formatDate(expense.date)}</td>
                  <td className="text-danger">-{formatCurrency(expense.amount)}</td>
                  <td>
                    <div className="flex gap-sm">
                      <button
                        className="btn-icon"
                        onClick={() => openEditModal(expense)}
                        title="Edit"
                      >
                        ✏️
                      </button>
                      <button
                        className="btn-icon"
                        onClick={() => confirmDelete(expense._id)}
                        title="Delete"
                      >
                        🗑️
                      </button>
                    </div>
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
        title={editingExpense ? "Edit Expense" : "Add Expense"}
      >
        {formError && <div className="alert alert-danger">{formError}</div>}

        <form onSubmit={handleSubmit}>
          {/* ---- TITLE ---- */}
          <div className="form-group">
            <label className="form-label" htmlFor="title">Title</label>
            <input
              type="text"
              id="title"
              name="title"
              className={`form-input ${formErrors.title ? "error" : ""}`}
              placeholder="e.g. Groceries, Movie tickets"
              value={formData.title}
              onChange={handleChange}
            />
            {formErrors.title && <p className="form-error">{formErrors.title}</p>}
          </div>

          
          <div className="form-group">
            <label className="form-label" htmlFor="amount">Amount (₹)</label>
            <input
              type="number"
              id="amount"
              name="amount"
              className={`form-input ${formErrors.amount ? "error" : ""}`}
              placeholder="0"
              min="1"
              value={formData.amount}
              onChange={handleChange}
            />
            {formErrors.amount && <p className="form-error">{formErrors.amount}</p>}
          </div>

          
          <div className="form-group">
            <label className="form-label" htmlFor="category">Category</label>
            <select
              id="category"
              name="category"
              className={`form-select ${formErrors.category ? "error" : ""}`}
              value={formData.category}
              onChange={handleChange}
            >
              {CATEGORIES.map((cat) => (
                <option key={cat} value={cat}>{cat}</option>
              ))}
            </select>
            {formErrors.category && <p className="form-error">{formErrors.category}</p>}
          </div>

          
          <div className="form-group">
            <label className="form-label" htmlFor="date">Date</label>
            <input
              type="date"
              id="date"
              name="date"
              className={`form-input ${formErrors.date ? "error" : ""}`}
              value={formData.date}
              onChange={handleChange}
            />
            {formErrors.date && <p className="form-error">{formErrors.date}</p>}
          </div>

          
          <div className="form-group">
            <label className="form-label" htmlFor="description">Description (optional)</label>
            <textarea
              id="description"
              name="description"
              className="form-input"
              placeholder="Add a note..."
              value={formData.description}
              onChange={handleChange}
            />
          </div>

          
          <div className="flex gap-md" style={{ justifyContent: "flex-end" }}>
            <button type="button" className="btn btn-secondary" onClick={closeModal}>
              Cancel
            </button>
            <button type="submit" className="btn btn-primary" disabled={submitting}>
              {submitting ? <span className="spinner"></span> : (editingExpense ? "Update" : "Add")}
            </button>
          </div>
        </form>
      </Modal>

      <ConfirmDialog
        isOpen={!!deleteId}
        onClose={() => setDeleteId(null)}
        onConfirm={handleDelete}
        message="Are you sure you want to delete this expense entry? This action cannot be undone."
      />
    </div>
  );
};

export default Expense;