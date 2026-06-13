import { useState, useEffect } from "react";
import axiosInstance from "../api/axios";
import Card from "../components/Card";
import Loader from "../components/Loader";
import Modal from "../components/Modal";
import ConfirmDialog from "../components/ConfirmDialog";
import { formatCurrency, formatDate } from "../utils/formatCurrency";
import "./Income.css";

const Income = () => {
  const [incomes, setIncomes] = useState([]);
  const [totalIncome, setTotalIncome] = useState(0);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState("");
  const [isModalOpen, setIsModalOpen] = useState(false);
  const [editingIncome, setEditingIncome] = useState(null);
  const [deleteId, setDeleteId] = useState(null);
  const [formData, setFormData] = useState({
    title: "",
    amount: "",
    date: "",
    description: "",
  });
  const [formErrors, setFormErrors] = useState({});
  const [submitting, setSubmitting] = useState(false);
  const [formError, setFormError] = useState("");
  const fetchIncomes = async () => {
    try {
      setLoading(true);
      const response = await axiosInstance.get("/income");
      setIncomes(response.data.incomes);
      setTotalIncome(response.data.totalIncome);
    } catch (err) {
      setError("Failed to load incomes");
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchIncomes();
  }, []);

  const openAddModal = () => {
    setEditingIncome(null); 
    setFormData({
      title: "",
      amount: "",
      date: new Date().toISOString().split("T")[0], 
      description: "",
    });
    setFormErrors({});
    setFormError("");
    setIsModalOpen(true);
  };


  const openEditModal = (income) => {
    setEditingIncome(income); 
    setFormData({
      title: income.title,
      amount: income.amount,
      date: new Date(income.date).toISOString().split("T")[0],
      description: income.description || "",
    });
    setFormErrors({});
    setFormError("");
    setIsModalOpen(true);
  };

  const closeModal = () => {
    setIsModalOpen(false);
    setEditingIncome(null);
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
        date: formData.date,
        description: formData.description,
      };

      if (editingIncome) {
        await axiosInstance.put(`/income/${editingIncome._id}`, payload);
      } else {
        await axiosInstance.post("/income", payload);
      }

      closeModal();
      fetchIncomes();

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
      await axiosInstance.delete(`/income/${deleteId}`);
      setDeleteId(null);
      fetchIncomes();
    } catch (err) {
      setError("Failed to delete income");
      setDeleteId(null);
    }
  };

  if (loading) return <Loader />;

  return (
    <div>
      <div className="flex-between" style={{ marginBottom: "8px" }}>
        <div>
          <h1 className="page-title">Income</h1>
          <p className="page-subtitle">Manage your income sources</p>
        </div>
        <button className="btn btn-primary" onClick={openAddModal}>
          + Add Income
        </button>
      </div>

      {error && <div className="alert alert-danger">{error}</div>}

      <div className="stats-grid" style={{ marginBottom: "var(--spacing-lg)" }}>
        <Card
          title="Total Income"
          value={formatCurrency(totalIncome)}
          icon="💰"
          color="success"
        />
        <Card
          title="Total Entries"
          value={incomes.length}
          icon="📋"
          color="primary"
        />
      </div>

      <div className="card-box">
        {incomes.length === 0 ? (
          <div className="empty-state">
            <p>No income entries yet.</p>
            <button className="btn btn-primary" onClick={openAddModal}>
              + Add Your First Income
            </button>
          </div>
        ) : (
          <table className="data-table">
            <thead>
              <tr>
                <th>Title</th>
                <th>Description</th>
                <th>Date</th>
                <th>Amount</th>
                <th>Actions</th>
              </tr>
            </thead>
            <tbody>
              {incomes.map((income) => (
                <tr key={income._id}>
                  <td>{income.title}</td>
                  <td className="text-secondary">{income.description || "—"}</td>
                  <td>{formatDate(income.date)}</td>
                  <td className="text-success">+{formatCurrency(income.amount)}</td>
                  <td>
                    <div className="flex gap-sm">
                      <button
                        className="btn-icon"
                        onClick={() => openEditModal(income)}
                        title="Edit"
                      >
                        ✏️
                      </button>
                      <button
                        className="btn-icon"
                        onClick={() => confirmDelete(income._id)}
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
        title={editingIncome ? "Edit Income" : "Add Income"}
      >
        {formError && <div className="alert alert-danger">{formError}</div>}

        <form onSubmit={handleSubmit}>
          
          <div className="form-group">
            <label className="form-label" htmlFor="title">Title</label>
            <input
              type="text"
              id="title"
              name="title"
              className={`form-input ${formErrors.title ? "error" : ""}`}
              placeholder="e.g. Salary, Freelance"
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

          {/* ---- DATE ---- */}
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
              {submitting ? <span className="spinner"></span> : (editingIncome ? "Update" : "Add")}
            </button>
          </div>
        </form>
      </Modal>

      
      <ConfirmDialog
        isOpen={!!deleteId}
        onClose={() => setDeleteId(null)}
        onConfirm={handleDelete}
        message="Are you sure you want to delete this income entry? This action cannot be undone."
      />
    </div>
  );
};

export default Income;