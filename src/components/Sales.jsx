"use client"

import { useState, useEffect } from "react"
import { salesAPI } from "../services/api"
import * as XLSX from "xlsx"
import jsPDF from "jspdf"
import "../styles/sales.css"

export default function Sales() {
  const [sales, setSales] = useState([])
  const [loading, setLoading] = useState(true)
  const [showForm, setShowForm] = useState(false)
  const [formData, setFormData] = useState({
    productName: "",
    quantity: "",
    unitPrice: "",
    profit: "",
  })

  useEffect(() => {
    fetchSales()
  }, [])

  const fetchSales = async () => {
    try {
      const response = await salesAPI.getAll()
      setSales(response.data)
    } catch (error) {
      console.error("Failed to fetch sales:", error)
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
      // Convert to numbers and calculate total amount
      const saleData = {
        ...formData,
        quantity: parseInt(formData.quantity),
        unitPrice: parseFloat(formData.unitPrice),
        profit: parseFloat(formData.profit),
        totalAmount: (parseInt(formData.quantity) * parseFloat(formData.unitPrice)).toFixed(2)
      }
      await salesAPI.create(saleData)
      setFormData({ productName: "", quantity: "", unitPrice: "", profit: "" })
      setShowForm(false)
      fetchSales()
    } catch (error) {
      alert("Failed to create sale")
    }
  }

  const handleDelete = async (id) => {
    if (window.confirm("Are you sure you want to delete this sale?")) {
      try {
        await salesAPI.delete(id)
        fetchSales()
      } catch (error) {
        alert("Failed to delete sale")
      }
    }
  }

  // Format currency in Indian Rupees
  const formatINR = (amount) => {
    return new Intl.NumberFormat('en-IN', {
      style: 'currency',
      currency: 'INR',
      minimumFractionDigits: 2,
      maximumFractionDigits: 2
    }).format(amount)
  }

  const exportToExcel = () => {
    const salesWithINR = sales.map(sale => ({
      ...sale,
      unitPrice: formatINR(sale.unitPrice),
      totalAmount: formatINR(sale.totalAmount),
      profit: formatINR(sale.profit)
    }))
    
    const ws = XLSX.utils.json_to_sheet(salesWithINR)
    const wb = XLSX.utils.book_new()
    XLSX.utils.book_append_sheet(wb, ws, "Sales")
    XLSX.writeFile(wb, "sales_report.xlsx")
  }

  const exportToPDF = () => {
    const doc = new jsPDF()
    
    // Add title
    doc.setFontSize(16)
    doc.setTextColor(40, 40, 40)
    doc.text("Sales Report - Indian Rupees", 10, 15)
    
    // Add date
    doc.setFontSize(10)
    doc.setTextColor(100, 100, 100)
    doc.text(`Generated on: ${new Date().toLocaleDateString('en-IN')}`, 10, 25)
    
    // Add table headers
    doc.setFontSize(8)
    doc.setTextColor(255, 255, 255)
    doc.setFillColor(102, 126, 234)
    doc.rect(10, 35, 190, 8, 'F')
    doc.text("Product", 12, 40)
    doc.text("Quantity", 70, 40)
    doc.text("Unit Price", 100, 40)
    doc.text("Total Amount", 130, 40)
    doc.text("Profit", 160, 40)
    
    // Add sales data
    doc.setTextColor(0, 0, 0)
    let y = 45
    sales.forEach((sale, index) => {
      if (y > 270) {
        doc.addPage()
        y = 20
      }
      
      doc.text(sale.productName.substring(0, 20), 12, y)
      doc.text(sale.quantity.toString(), 70, y)
      doc.text(formatINR(sale.unitPrice), 100, y)
      doc.text(formatINR(sale.totalAmount), 130, y)
      doc.text(formatINR(sale.profit), 160, y)
      y += 8
    })
    
    // Add summary
    const totalSales = sales.reduce((sum, sale) => sum + parseFloat(sale.totalAmount), 0)
    const totalProfit = sales.reduce((sum, sale) => sum + parseFloat(sale.profit), 0)
    
    y += 10
    doc.setFontSize(10)
    doc.setTextColor(40, 40, 40)
    doc.text(`Total Sales: ${formatINR(totalSales)}`, 10, y)
    doc.text(`Total Profit: ${formatINR(totalProfit)}`, 10, y + 8)
    
    doc.save("sales_report_inr.pdf")
  }

  // Calculate totals for dashboard
  const totalSales = sales.reduce((sum, sale) => sum + parseFloat(sale.totalAmount), 0)
  const totalProfit = sales.reduce((sum, sale) => sum + parseFloat(sale.profit), 0)
  const totalItems = sales.reduce((sum, sale) => sum + parseInt(sale.quantity), 0)

  if (loading) return <div className="loading">Loading sales data...</div>

  return (
    <div className="content">
      <div className="dashboard-header">
        <h2>Sales Module (INR)</h2>
        <div className="button-group">
          <button className="btn btn-primary" onClick={() => setShowForm(!showForm)}>
            {showForm ? "Cancel" : "Add Sale"}
          </button>
          <button className="btn btn-success" onClick={exportToExcel}>
            Export Excel
          </button>
          <button className="btn btn-success" onClick={exportToPDF}>
            Export PDF
          </button>
        </div>
      </div>

      {/* Sales Summary Dashboard */}
      <div className="dashboard-grid">
        <div className="card">
          <h3>Total Sales</h3>
          <div className="value">{formatINR(totalSales)}</div>
        </div>
        <div className="card">
          <h3>Total Profit</h3>
          <div className="value">{formatINR(totalProfit)}</div>
        </div>
        <div className="card">
          <h3>Items Sold</h3>
          <div className="value">{totalItems}</div>
        </div>
        <div className="card">
          <h3>Total Transactions</h3>
          <div className="value">{sales.length}</div>
        </div>
      </div>

      {showForm && (
        <div className="card">
          <form onSubmit={handleSubmit}>
            <div className="form-grid">
              <div className="form-group">
                <label>Product Name</label>
                <input 
                  type="text" 
                  name="productName" 
                  value={formData.productName} 
                  onChange={handleChange} 
                  required 
                  placeholder="Enter product name"
                />
              </div>
              <div className="form-group">
                <label>Quantity</label>
                <input 
                  type="number" 
                  name="quantity" 
                  value={formData.quantity} 
                  onChange={handleChange} 
                  required 
                  min="1"
                  placeholder="0"
                />
              </div>
              <div className="form-group">
                <label>Unit Price (₹)</label>
                <input 
                  type="number" 
                  name="unitPrice" 
                  value={formData.unitPrice} 
                  onChange={handleChange} 
                  required 
                  min="0"
                  step="0.01"
                  placeholder="0.00"
                />
              </div>
              <div className="form-group">
                <label>Profit (₹)</label>
                <input 
                  type="number" 
                  name="profit" 
                  value={formData.profit} 
                  onChange={handleChange} 
                  required 
                  min="0"
                  step="0.01"
                  placeholder="0.00"
                />
              </div>
            </div>
            {formData.quantity && formData.unitPrice && (
              <div className="calculation-preview">
                <strong>Total Amount: {formatINR(formData.quantity * formData.unitPrice)}</strong>
              </div>
            )}
            <button type="submit" className="btn btn-primary">
              Create Sale
            </button>
          </form>
        </div>
      )}

      <div className="table-container">
        <table>
          <thead>
            <tr>
              <th>Date</th>
              <th>Product</th>
              <th>Quantity</th>
              <th>Unit Price</th>
              <th>Total Amount</th>
              <th>Profit</th>
              <th>Status</th>
              <th>Action</th>
            </tr>
          </thead>
          <tbody>
            {sales.length === 0 ? (
              <tr>
                <td colSpan="8" className="no-data">
                  No sales records found. Create your first sale to get started!
                </td>
              </tr>
            ) : (
              sales.map((sale) => (
                <tr key={sale._id}>
                  <td>{new Date(sale.date).toLocaleDateString('en-IN')}</td>
                  <td className="product-name">{sale.productName}</td>
                  <td className="quantity">{sale.quantity}</td>
                  <td className="currency">{formatINR(sale.unitPrice)}</td>
                  <td className="currency total-amount">{formatINR(sale.totalAmount)}</td>
                  <td className="currency profit">{formatINR(sale.profit)}</td>
                  <td>
                    <span className={`status-badge status-${sale.status?.toLowerCase() || 'completed'}`}>
                      {sale.status || 'Completed'}
                    </span>
                  </td>
                  <td>
                    <div className="action-buttons">
                      <button className="btn btn-danger" onClick={() => handleDelete(sale._id)}>
                        Delete
                      </button>
                    </div>
                  </td>
                </tr>
              ))
            )}
          </tbody>
        </table>
      </div>
    </div>
  )
}