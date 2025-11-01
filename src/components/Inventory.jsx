"use client"

import { useState, useEffect } from "react"
import { inventoryAPI } from "../services/api"
import "../styles/inventory.css"

export default function Inventory() {
  const [inventory, setInventory] = useState([])
  const [lowStock, setLowStock] = useState([])
  const [loading, setLoading] = useState(true)
  const [showForm, setShowForm] = useState(false)
  const [formData, setFormData] = useState({
    productName: "",
    quantity: "",
    price: "",
    minStock: "",
    category: "",
    sku: "",
  })

  useEffect(() => {
    fetchInventory()
    fetchLowStock()
  }, [])

  const fetchInventory = async () => {
    try {
      const response = await inventoryAPI.getAll()
      setInventory(response.data)
    } catch (error) {
      console.error("Failed to fetch inventory:", error)
    } finally {
      setLoading(false)
    }
  }

  const fetchLowStock = async () => {
    try {
      const response = await inventoryAPI.getLowStock()
      setLowStock(response.data)
    } catch (error) {
      console.error("Failed to fetch low stock items:", error)
    }
  }

  const handleChange = (e) => {
    setFormData({ ...formData, [e.target.name]: e.target.value })
  }

  const handleSubmit = async (e) => {
    e.preventDefault()
    try {
      await inventoryAPI.create(formData)
      setFormData({ productName: "", quantity: "", price: "", minStock: "", category: "", sku: "" })
      setShowForm(false)
      fetchInventory()
      fetchLowStock()
    } catch (error) {
      alert("Failed to create inventory item")
    }
  }

  const handleDelete = async (id) => {
    if (window.confirm("Are you sure?")) {
      try {
        await inventoryAPI.delete(id)
        fetchInventory()
        fetchLowStock()
      } catch (error) {
        alert("Failed to delete item")
      }
    }
  }

  // Calculate dashboard stats
  const totalItems = inventory.length
  const lowStockCount = lowStock.length
  const totalValue = inventory.reduce((sum, item) => sum + (item.quantity * item.price), 0)

  if (loading) return <div className="loading">Loading...</div>

  return (
    <div className="content">
      {/* Dashboard Header */}
      <div className="dashboard-header">
        <h2>Inventory Module</h2>
        <button className="btn btn-primary" onClick={() => setShowForm(!showForm)}>
          {showForm ? "Cancel" : "Add Item"}
        </button>
      </div>

      {/* Dashboard Stats Grid */}
      <div className="dashboard-grid">
        <div className="card">
          <h3>Total Items</h3>
          <div className="value">{totalItems}</div>
        </div>
        <div className="card">
          <h3>Low Stock Items</h3>
          <div className="value">{lowStockCount}</div>
        </div>
        <div className="card">
          <h3>Total Inventory Value</h3>
          <div className="value">₹{totalValue.toLocaleString('en-IN')}</div>
        </div>
      </div>

      {/* Low Stock Alert */}
      {lowStock.length > 0 && (
        <div className="alert alert-error" style={{ marginBottom: "20px" }}>
          {lowStock.length} items are below minimum stock level!
        </div>
      )}

      {/* Add Item Form */}
      {showForm && (
        <div className="card" style={{ marginBottom: "20px" }}>
          <form onSubmit={handleSubmit}>
            <div style={{ display: "grid", gridTemplateColumns: "1fr 1fr", gap: "15px" }}>
              <div className="form-group">
                <label>Product Name</label>
                <input type="text" name="productName" value={formData.productName} onChange={handleChange} required />
              </div>
              <div className="form-group">
                <label>Quantity</label>
                <input type="number" name="quantity" value={formData.quantity} onChange={handleChange} required />
              </div>
              <div className="form-group">
                <label>Price (₹)</label>
                <input type="number" name="price" value={formData.price} onChange={handleChange} required />
              </div>
              <div className="form-group">
                <label>Min Stock</label>
                <input type="number" name="minStock" value={formData.minStock} onChange={handleChange} />
              </div>
              <div className="form-group">
                <label>Category</label>
                <input type="text" name="category" value={formData.category} onChange={handleChange} />
              </div>
              <div className="form-group">
                <label>SKU</label>
                <input type="text" name="sku" value={formData.sku} onChange={handleChange} />
              </div>
            </div>
            <button type="submit" className="btn btn-primary">
              Add Item
            </button>
          </form>
        </div>
      )}

      {/* Inventory Table */}
      <div className="table-container">
        <table>
          <thead>
            <tr>
              <th>Product Name</th>
              <th>SKU</th>
              <th>Category</th>
              <th>Quantity</th>
              <th>Price</th>
              <th>Min Stock</th>
              <th>Status</th>
              <th>Action</th>
            </tr>
          </thead>
          <tbody>
            {inventory.map((item) => (
              <tr key={item._id}>
                <td>{item.productName}</td>
                <td>{item.sku}</td>
                <td>{item.category}</td>
                <td>{item.quantity}</td>
                <td>₹{item.price}</td>
                <td>{item.minStock}</td>
                <td className={`status-${item.quantity <= item.minStock ? 'low' : 'ok'}`}>
                  {item.quantity <= item.minStock ? "Low Stock" : "In Stock"}
                </td>
                <td>
                  <button className="btn btn-danger" onClick={() => handleDelete(item._id)}>
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