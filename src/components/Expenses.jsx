"use client"

import { useState, useEffect } from "react"
import { expenseAPI } from "../services/api"
import "../styles/expense.css"

export default function Expenses() {
  const [expenses, setExpenses] = useState([])
  const [loading, setLoading] = useState(true)
  const [showForm, setShowForm] = useState(false)
  const [formData, setFormData] = useState({
    category: "",
    description: "",
    amount: "",
    status: "Pending",
  })

  useEffect(() => {
    fetchExpenses()
  }, [])

  const fetchExpenses = async () => {
    try {
      const response = await expenseAPI.getAll()
      setExpenses(response.data)
    } catch (error) {
      console.error("Failed to fetch expenses:", error)
    } finally {
      setLoading(false)
    }
  }

  const handleChange = (e) => {
    setFormData({ ...formData, [e.target.name]: e.target.value })
  }

  const handleSubmit = async (e) => {
    e.preventDefault()
    try {
      await expenseAPI.create(formData)
      setFormData({ category: "", description: "", amount: "", status: "Pending" })
      setShowForm(false)
      fetchExpenses()
    } catch (error) {
      alert("Failed to create expense")
    }
  }

  const handleDelete = async (id) => {
    if (window.confirm("Are you sure?")) {
      try {
        await expenseAPI.delete(id)
        fetchExpenses()
      } catch (error) {
        alert("Failed to delete expense")
      }
    }
  }

  const totalExpenses = expenses.reduce((sum, exp) => sum + Number.parseFloat(exp.amount || 0), 0)

  if (loading) return <div className="content">Loading...</div>

  return (
    <div className="content">
      <div className="dashboard-header">
        <h2>Expense Tracker</h2>
        <button className="btn btn-primary" onClick={() => setShowForm(!showForm)}>
          {showForm ? "Cancel" : "Add Expense"}
        </button>
      </div>

      <div className="dashboard-grid">
        <div className="card">
          <h3>Total Expenses</h3>
          <div className="value">₹{totalExpenses.toFixed(2)}</div>
        </div>
        <div className="card">
          <h3>Pending Expenses</h3>
          <div className="value">{expenses.filter((e) => e.status === "Pending").length}</div>
        </div>
        <div className="card">
          <h3>Approved Expenses</h3>
          <div className="value">{expenses.filter((e) => e.status === "Approved").length}</div>
        </div>
      </div>

      {showForm && (
        <div className="card" style={{ marginBottom: "20px" }}>
          <form onSubmit={handleSubmit}>
            <div style={{ display: "grid", gridTemplateColumns: "1fr 1fr", gap: "15px" }}>
              <div className="form-group">
                <label>Category</label>
                <select name="category" value={formData.category} onChange={handleChange} required>
                  <option value="">Select Category</option>
                  <option value="Utilities">Utilities</option>
                  <option value="Salaries">Salaries</option>
                  <option value="Rent">Rent</option>
                  <option value="Supplies">Supplies</option>
                  <option value="Marketing">Marketing</option>
                  <option value="Other">Other</option>
                </select>
              </div>
              <div className="form-group">
                <label>Amount</label>
                <input type="number" name="amount" value={formData.amount} onChange={handleChange} required />
              </div>
              <div className="form-group">
                <label>Description</label>
                <input type="text" name="description" value={formData.description} onChange={handleChange} />
              </div>
              <div className="form-group">
                <label>Status</label>
                <select name="status" value={formData.status} onChange={handleChange}>
                  <option value="Pending">Pending</option>
                  <option value="Approved">Approved</option>
                  <option value="Rejected">Rejected</option>
                </select>
              </div>
            </div>
            <button type="submit" className="btn btn-primary">
              Add Expense
            </button>
          </form>
        </div>
      )}

      <div className="table-container">
        <table>
          <thead>
            <tr>
              <th>Date</th>
              <th>Category</th>
              <th>Description</th>
              <th>Amount</th>
              <th>Status</th>
              <th>Action</th>
            </tr>
          </thead>
          <tbody>
            {expenses.map((expense) => (
              <tr key={expense._id}>
                <td>{new Date(expense.date).toLocaleDateString()}</td>
                <td>{expense.category}</td>
                <td>{expense.description}</td>
                <td>₹{expense.amount}</td>
                <td>{expense.status}</td>
                <td>
                  <button className="btn btn-danger" onClick={() => handleDelete(expense._id)}>
                    Delete
                  </button>
                </td>
              </tr>
            ))}
          </tbody>
        </table>
      </div>
    </div>
  )
}
