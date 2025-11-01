"use client"

import { useState, useEffect } from "react"
import { taskAPI } from "../services/api"
import "../styles/tasks.css"

export default function Tasks() {
  const [tasks, setTasks] = useState([])
  const [loading, setLoading] = useState(true)
  const [showForm, setShowForm] = useState(false)
  const [formData, setFormData] = useState({
    title: "",
    description: "",
    assignedTo: "",
    dueDate: "",
    priority: "Medium",
    status: "Pending",
  })

  useEffect(() => {
    fetchTasks()
  }, [])

  const fetchTasks = async () => {
    try {
      const response = await taskAPI.getAll()
      setTasks(response.data)
    } catch (error) {
      console.error("Failed to fetch tasks:", error)
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
      await taskAPI.create(formData)
      setFormData({ title: "", description: "", assignedTo: "", dueDate: "", priority: "Medium", status: "Pending" })
      setShowForm(false)
      fetchTasks()
    } catch (error) {
      alert("Failed to create task")
    }
  }

  const handleDelete = async (id) => {
    if (window.confirm("Are you sure?")) {
      try {
        await taskAPI.delete(id)
        fetchTasks()
      } catch (error) {
        alert("Failed to delete task")
      }
    }
  }

  const handleStatusChange = async (id, newStatus) => {
    try {
      await taskAPI.update(id, { status: newStatus })
      fetchTasks()
    } catch (error) {
      alert("Failed to update task")
    }
  }

  const handleTogglePin = async (id) => {
    try {
      await taskAPI.togglePin(id)
      fetchTasks()
    } catch (error) {
      alert("Failed to toggle pin")
    }
  }

  if (loading) return <div className="content">Loading...</div>

  return (
    <div className="content">
      <div style={{ display: "flex", justifyContent: "space-between", marginBottom: "20px" }}>
        <h2>Tasks Module</h2>
        <button className="btn btn-primary" onClick={() => setShowForm(!showForm)}>
          {showForm ? "Cancel" : "Add Task"}
        </button>
      </div>

      <div className="dashboard-grid">
        <div className="card">
          <h3>Total Tasks</h3>
          <div className="value">{tasks.length}</div>
        </div>
        <div className="card">
          <h3>Pending</h3>
          <div className="value">{tasks.filter((t) => t.status === "Pending").length}</div>
        </div>
        <div className="card">
          <h3>In Progress</h3>
          <div className="value">{tasks.filter((t) => t.status === "In Progress").length}</div>
        </div>
        <div className="card">
          <h3>Completed</h3>
          <div className="value">{tasks.filter((t) => t.status === "Completed").length}</div>
        </div>
      </div>

      {showForm && (
        <div className="card" style={{ marginBottom: "20px" }}>
          <form onSubmit={handleSubmit}>
            <div style={{ display: "grid", gridTemplateColumns: "1fr 1fr", gap: "15px" }}>
              <div className="form-group">
                <label>Title</label>
                <input type="text" name="title" value={formData.title} onChange={handleChange} required />
              </div>
              <div className="form-group">
                <label>Assigned To</label>
                <input type="text" name="assignedTo" value={formData.assignedTo} onChange={handleChange} />
              </div>
              <div className="form-group">
                <label>Due Date</label>
                <input type="date" name="dueDate" value={formData.dueDate} onChange={handleChange} />
              </div>
              <div className="form-group">
                <label>Priority</label>
                <select name="priority" value={formData.priority} onChange={handleChange}>
                  <option value="Low">Low</option>
                  <option value="Medium">Medium</option>
                  <option value="High">High</option>
                </select>
              </div>
              <div className="form-group" style={{ gridColumn: "1 / -1" }}>
                <label>Description</label>
                <textarea name="description" value={formData.description} onChange={handleChange} rows="3" />
              </div>
            </div>
            <button type="submit" className="btn btn-primary">
              Add Task
            </button>
          </form>
        </div>
      )}

      <div className="table-container">
        <table>
          <thead>
            <tr>
              <th>Title</th>
              <th>Assigned To</th>
              <th>Due Date</th>
              <th>Priority</th>
              <th>Status</th>
              <th>Action</th>
            </tr>
          </thead>
          <tbody>
            {tasks.map((task) => (
              <tr key={task._id} className={task.isPinned ? "pinned-row" : ""}>
                <td>{task.title}</td>
                <td>{task.assignedTo}</td>
                <td>{task.dueDate ? new Date(task.dueDate).toLocaleDateString() : "N/A"}</td>
                <td>
                  <span
                    style={{
                      padding: "5px 10px",
                      borderRadius: "5px",
                      background:
                        task.priority === "High" ? "#ff6b6b" : task.priority === "Medium" ? "#ffd43b" : "#51cf66",
                      color: "white",
                    }}
                  >
                    {task.priority}
                  </span>
                </td>
                <td>
                  <select
                    value={task.status}
                    onChange={(e) => handleStatusChange(task._id, e.target.value)}
                    style={{ padding: "5px" }}
                  >
                    <option value="Pending">Pending</option>
                    <option value="In Progress">In Progress</option>
                    <option value="Completed">Completed</option>
                  </select>
                </td>
                <td className="action-buttons">
                  <button
                    className={`btn btn-pin ${task.isPinned ? "pinned" : ""}`}
                    onClick={() => handleTogglePin(task._id)}
                    title={task.isPinned ? "Unpin task" : "Pin task"}
                  >
                    {task.isPinned ? "📌" : "📍"}
                  </button>
                  <button className="btn btn-danger" onClick={() => handleDelete(task._id)}>
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
