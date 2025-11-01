// Dashboard.jsx
"use client"

import { useState, useEffect } from "react"
import { 
  Tooltip, 
  ResponsiveContainer, 
  PieChart, 
  Pie, 
  Cell, 
  BarChart, 
  Bar, 
  XAxis, 
  YAxis, 
  CartesianGrid, 
  LineChart, 
  Line,
  AreaChart,
  Area,
  Legend
} from "recharts"
import { dashboardAPI, importAPI, sheetsAPI, taskAPI } from "../services/api"
import GoogleSheetCard from "./GoogleSheetCard"
import AddGoogleSheetModal from "./AddGoogleSheetModal"
import "../styles/dashboard.css"

export default function Dashboard({ onDataUpdate }) {
  const [dashboardData, setDashboardData] = useState(null)
  const [loading, setLoading] = useState(true)
  const [dataLink, setDataLink] = useState("")
  const [showImportModal, setShowImportModal] = useState(false)
  const [sheets, setSheets] = useState([])
  const [pinnedSheets, setPinnedSheets] = useState([])
  const [showAddSheetModal, setShowAddSheetModal] = useState(false)
  const [sheetsLoading, setSheetLoading] = useState(false)
  const [pinnedTasks, setPinnedTasks] = useState([])
  const [tasksLoading, setTasksLoading] = useState(false)
  const [activeChart, setActiveChart] = useState("sales")

  useEffect(() => {
    fetchDashboardData()
    fetchSheets()
    fetchPinnedTasks()
  }, [])

  const fetchDashboardData = async () => {
    try {
      const response = await dashboardAPI.getData()
      setDashboardData(response.data)
      onDataUpdate(response.data.lastUpdated)
    } catch (error) {
      console.error("Failed to fetch dashboard data:", error)
    } finally {
      setLoading(false)
    }
  }

  const fetchSheets = async () => {
    try {
      setSheetLoading(true)
      const response = await sheetsAPI.getAll()
      const allSheets = response.data
      const pinned = allSheets.filter((sheet) => sheet.isPinned)
      const unpinned = allSheets.filter((sheet) => !sheet.isPinned)

      setPinnedSheets(pinned)
      setSheets(unpinned)
    } catch (error) {
      console.error("Failed to fetch sheets:", error)
    } finally {
      setSheetLoading(false)
    }
  }

  const fetchPinnedTasks = async () => {
    try {
      setTasksLoading(true)
      const response = await taskAPI.getPinned()
      setPinnedTasks(response.data)
    } catch (error) {
      console.error("Failed to fetch pinned tasks:", error)
    } finally {
      setTasksLoading(false)
    }
  }

  const handleAddSheet = async (sheetData) => {
    try {
      await sheetsAPI.create(sheetData)
      fetchSheets()
    } catch (error) {
      throw error
    }
  }

  const handleTogglePin = async (sheetId) => {
    try {
      await sheetsAPI.togglePin(sheetId)
      fetchSheets()
    } catch (error) {
      console.error("Failed to toggle pin:", error)
    }
  }

  const handleDeleteSheet = async (sheetId) => {
    if (window.confirm("Are you sure you want to delete this sheet?")) {
      try {
        await sheetsAPI.delete(sheetId)
        fetchSheets()
      } catch (error) {
        console.error("Failed to delete sheet:", error)
      }
    }
  }

  const handleImportData = async (dataType) => {
    try {
      await importAPI.importData(dataLink, dataType)
      alert(`${dataType} data imported successfully`)
      setDataLink("")
      setShowImportModal(false)
      fetchDashboardData()
    } catch (error) {
      alert("Failed to import data: " + error.response?.data?.message)
    }
  }

  if (loading) return (
    <div className="content">
      <div className="loading-container">
        <div className="loading-spinner"></div>
        <p>Loading dashboard data...</p>
      </div>
    </div>
  )

  // Sample data for charts (replace with actual data from API)
  const pieChartData = [
    { name: "Sales", value: dashboardData?.totalSales || 0 },
    { name: "Expenses", value: dashboardData?.totalExpenses || 0 },
    { name: "Profit", value: dashboardData?.totalProfit || 0 },
  ]

  const barChartData = [
    { month: "Jan", sales: 4000, expenses: 2400, profit: 1600 },
    { month: "Feb", sales: 3000, expenses: 1398, profit: 1602 },
    { month: "Mar", sales: 9800, expenses: 2000, profit: 7800 },
    { month: "Apr", sales: 3908, expenses: 2780, profit: 1128 },
    { month: "May", sales: 4800, expenses: 1890, profit: 2910 },
    { month: "Jun", sales: 3800, expenses: 2390, profit: 1410 },
  ]

  const lineChartData = [
    { week: "Week 1", revenue: 4000, customers: 2400 },
    { week: "Week 2", revenue: 3000, customers: 1398 },
    { week: "Week 3", revenue: 2000, customers: 9800 },
    { week: "Week 4", revenue: 2780, customers: 3908 },
    { week: "Week 5", revenue: 1890, customers: 4800 },
  ]

  const areaChartData = [
    { day: "Mon", sales: 4000, target: 3000 },
    { day: "Tue", sales: 3000, target: 2500 },
    { day: "Wed", sales: 2000, target: 3500 },
    { day: "Thu", sales: 2780, target: 4000 },
    { day: "Fri", sales: 1890, target: 2000 },
    { day: "Sat", sales: 2390, target: 1800 },
    { day: "Sun", sales: 3490, target: 2200 },
  ]

  const COLORS = ["#667eea", "#ff6b6b", "#51cf66", "#fcc419", "#339af0", "#845ef7"]

  return (
    <div className="content">
      <div className="dashboard-header">
        <div className="header-content">
          <h2>Dashboard Overview</h2>
          <p className="header-subtitle">Real-time business insights and analytics</p>
        </div>
        <button 
          className="btn btn-primary import-btn" 
          onClick={() => setShowImportModal(true)}
        >
          <span className="btn-icon">📥</span>
          Import Data
        </button>
      </div>

      {/* Stats Grid */}
      <div className="stats-grid">
        <div className="stat-card primary">
          <div className="stat-icon">💰</div>
          <div className="stat-content">
            <h3>Total Sales</h3>
            <div className="stat-value">₹ {dashboardData?.totalSales?.toFixed(2) || 0}</div>
            <div className="stat-trend positive">+12% vs last month</div>
          </div>
        </div>
        
        <div className="stat-card danger">
          <div className="stat-icon">💸</div>
          <div className="stat-content">
            <h3>Total Expenses</h3>
            <div className="stat-value">₹ {dashboardData?.totalExpenses?.toFixed(2) || 0}</div>
            <div className="stat-trend negative">+8% vs last month</div>
          </div>
        </div>
        
        <div className="stat-card success">
          <div className="stat-icon">📈</div>
          <div className="stat-content">
            <h3>Total Profit</h3>
            <div className="stat-value">₹ {dashboardData?.totalProfit?.toFixed(2) || 0}</div>
            <div className="stat-trend positive">+15% vs last month</div>
          </div>
        </div>
        
        <div className="stat-card info">
          <div className="stat-icon">🎯</div>
          <div className="stat-content">
            <h3>Today's Revenue</h3>
            <div className="stat-value">₹ {dashboardData?.todaySales?.toFixed(2) || 0}</div>
            <div className="stat-trend positive">+5% vs yesterday</div>
          </div>
        </div>
      </div>

      {/* Charts Section */}
      <div className="charts-section">
        <div className="charts-header">
          <h3>📊 Analytics Dashboard</h3>
          <div className="chart-tabs">
            <button 
              className={`chart-tab ${activeChart === 'sales' ? 'active' : ''}`}
              onClick={() => setActiveChart('sales')}
            >
              Sales
            </button>
            <button 
              className={`chart-tab ${activeChart === 'revenue' ? 'active' : ''}`}
              onClick={() => setActiveChart('revenue')}
            >
              Revenue
            </button>
            <button 
              className={`chart-tab ${activeChart === 'performance' ? 'active' : ''}`}
              onClick={() => setActiveChart('performance')}
            >
              Performance
            </button>
          </div>
        </div>

        <div className="charts-grid">
          {/* Pie Chart */}
          <div className="chart-container">
            <div className="chart-header">
              <h4>Revenue Distribution</h4>
              <span className="chart-badge">Real-time</span>
            </div>
            <ResponsiveContainer width="100%" height={300}>
              <PieChart>
                <Pie
                  data={pieChartData}
                  cx="50%"
                  cy="50%"
                  labelLine={false}
                  label={({ name, percent }) => `${name}: ${(percent * 100).toFixed(0)}%`}
                  outerRadius={100}
                  fill="#8884d8"
                  dataKey="value"
                >
                  {pieChartData.map((entry, index) => (
                    <Cell key={`cell-${index}`} fill={COLORS[index % COLORS.length]} />
                  ))}
                </Pie>
                <Tooltip formatter={(value) => [`₹${value}`, 'Amount']} />
                <Legend />
              </PieChart>
            </ResponsiveContainer>
          </div>

          {/* Bar Chart */}
          <div className="chart-container">
            <div className="chart-header">
              <h4>Monthly Performance</h4>
              <span className="chart-badge">2024</span>
            </div>
            <ResponsiveContainer width="100%" height={300}>
              <BarChart data={barChartData}>
                <CartesianGrid strokeDasharray="3 3" stroke="#f0f0f0" />
                <XAxis dataKey="month" />
                <YAxis />
                <Tooltip formatter={(value) => [`₹${value}`, 'Amount']} />
                <Legend />
                <Bar dataKey="sales" fill="#667eea" radius={[4, 4, 0, 0]} />
                <Bar dataKey="expenses" fill="#ff6b6b" radius={[4, 4, 0, 0]} />
                <Bar dataKey="profit" fill="#51cf66" radius={[4, 4, 0, 0]} />
              </BarChart>
            </ResponsiveContainer>
          </div>

          {/* Line Chart */}
          <div className="chart-container">
            <div className="chart-header">
              <h4>Weekly Trends</h4>
              <span className="chart-badge">Growth</span>
            </div>
            <ResponsiveContainer width="100%" height={300}>
              <LineChart data={lineChartData}>
                <CartesianGrid strokeDasharray="3 3" stroke="#f0f0f0" />
                <XAxis dataKey="week" />
                <YAxis />
                <Tooltip formatter={(value) => [`₹${value}`, 'Amount']} />
                <Legend />
                <Line 
                  type="monotone" 
                  dataKey="revenue" 
                  stroke="#667eea" 
                  strokeWidth={3}
                  dot={{ fill: '#667eea', strokeWidth: 2, r: 4 }}
                  activeDot={{ r: 6, fill: '#667eea' }}
                />
                <Line 
                  type="monotone" 
                  dataKey="customers" 
                  stroke="#51cf66" 
                  strokeWidth={3}
                  dot={{ fill: '#51cf66', strokeWidth: 2, r: 4 }}
                  activeDot={{ r: 6, fill: '#51cf66' }}
                />
              </LineChart>
            </ResponsiveContainer>
          </div>

          {/* Area Chart */}
          <div className="chart-container full-width">
            <div className="chart-header">
              <h4>Daily Sales vs Target</h4>
              <span className="chart-badge">This Week</span>
            </div>
            <ResponsiveContainer width="100%" height={300}>
              <AreaChart data={areaChartData}>
                <CartesianGrid strokeDasharray="3 3" stroke="#f0f0f0" />
                <XAxis dataKey="day" />
                <YAxis />
                <Tooltip formatter={(value) => [`₹${value}`, 'Amount']} />
                <Legend />
                <Area 
                  type="monotone" 
                  dataKey="sales" 
                  stackId="1"
                  stroke="#667eea" 
                  fill="url(#colorSales)" 
                  fillOpacity={0.6}
                />
                <Area 
                  type="monotone" 
                  dataKey="target" 
                  stackId="1"
                  stroke="#ff6b6b" 
                  fill="url(#colorTarget)" 
                  fillOpacity={0.6}
                />
                <defs>
                  <linearGradient id="colorSales" x1="0" y1="0" x2="0" y2="1">
                    <stop offset="5%" stopColor="#667eea" stopOpacity={0.8}/>
                    <stop offset="95%" stopColor="#667eea" stopOpacity={0.1}/>
                  </linearGradient>
                  <linearGradient id="colorTarget" x1="0" y1="0" x2="0" y2="1">
                    <stop offset="5%" stopColor="#ff6b6b" stopOpacity={0.8}/>
                    <stop offset="95%" stopColor="#ff6b6b" stopOpacity={0.1}/>
                  </linearGradient>
                </defs>
              </AreaChart>
            </ResponsiveContainer>
          </div>
        </div>
      </div>

      {/* Pinned Tasks */}
      {pinnedTasks.length > 0 && (
        <div className="pinned-tasks-section">
          <div className="section-header">
            <h3>📌 Pinned Tasks</h3>
            <div className="section-badge">{pinnedTasks.length}</div>
          </div>
          <div className="pinned-tasks-grid">
            {pinnedTasks.map((task) => (
              <div key={task._id} className="pinned-task-card">
                <div className="task-header">
                  <h4>{task.title}</h4>
                  <span className={`priority-badge priority-${task.priority.toLowerCase()}`}>
                    {task.priority}
                  </span>
                </div>
                <p className="task-assigned">Assigned to: {task.assignedTo || "Unassigned"}</p>
                <p className="task-status">Status: {task.status}</p>
                {task.dueDate && (
                  <p className="task-due">
                    Due: {new Date(task.dueDate).toLocaleDateString()}
                  </p>
                )}
                <div className="task-gradient"></div>
              </div>
            ))}
          </div>
        </div>
      )}

      {/* Google Sheets Section */}
      <div className="sheets-section">
        <div className="sheets-header">
          <div className="section-header">
            <h3>📌 Connected Sheets</h3>
            <div className="section-badge">{pinnedSheets.length + sheets.length}</div>
          </div>
          <button 
            className="btn btn-primary add-sheet-btn" 
            onClick={() => setShowAddSheetModal(true)}
          >
            <span className="btn-icon">+</span>
            Add Sheet
          </button>
        </div>

        {pinnedSheets.length > 0 ? (
          <div className="sheets-grid pinned-sheets">
            {pinnedSheets.map((sheet) => (
              <GoogleSheetCard
                key={sheet._id}
                sheet={sheet}
                onPin={handleTogglePin}
                onDelete={handleDeleteSheet}
                isPinned={true}
              />
            ))}
          </div>
        ) : (
          <div className="empty-state">
            <div className="empty-icon">📌</div>
            <p>No pinned sheets yet</p>
            <p className="empty-subtitle">Pin your favorite sheets for quick access!</p>
          </div>
        )}

        {sheets.length > 0 && (
          <div className="all-sheets-section">
            <div className="section-header">
              <h4>📄 All Sheets</h4>
              <div className="section-badge">{sheets.length}</div>
            </div>
            <div className="sheets-grid">
              {sheets.map((sheet) => (
                <GoogleSheetCard
                  key={sheet._id}
                  sheet={sheet}
                  onPin={handleTogglePin}
                  onDelete={handleDeleteSheet}
                  isPinned={false}
                />
              ))}
            </div>
          </div>
        )}
      </div>

      {showAddSheetModal && (
        <AddGoogleSheetModal 
          onClose={() => setShowAddSheetModal(false)} 
          onAdd={handleAddSheet} 
        />
      )}

      {showImportModal && (
        <div className="modal active" onClick={() => setShowImportModal(false)}>
          <div className="modal-content" onClick={(e) => e.stopPropagation()}>
            <div className="modal-header">
              <h2>Import Data</h2>
              <button className="close-btn" onClick={() => setShowImportModal(false)}>
                ×
              </button>
            </div>
            <div className="form-group">
              <label>Data Link (CSV/Excel URL)</label>
              <input
                type="text"
                value={dataLink}
                onChange={(e) => setDataLink(e.target.value)}
                placeholder="https://example.com/data.csv"
                className="form-input"
              />
            </div>
            <div className="import-buttons">
              <button className="btn btn-primary import-type-btn" onClick={() => handleImportData("sales")}>
                Import Sales
              </button>
              <button className="btn btn-primary import-type-btn" onClick={() => handleImportData("inventory")}>
                Import Inventory
              </button>
              <button className="btn btn-primary import-type-btn" onClick={() => handleImportData("expenses")}>
                Import Expenses
              </button>
            </div>
          </div>
        </div>
      )}
    </div>
  )
}