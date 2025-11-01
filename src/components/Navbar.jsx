"use client"

import { useState, useEffect } from "react"
import { sheetsAPI } from "../services/api"
import "../styles/Navbar.css"

export default function Navbar({ onLogout, lastUpdated, activeModule, setActiveModule }) {
  const [pinnedSheets, setPinnedSheets] = useState([])
  const [showDropdown, setShowDropdown] = useState(false)
  const [showNavMenu, setShowNavMenu] = useState(false)

  const modules = [
    { id: "dashboard", label: "Dashboard", icon: "📊" },
    { id: "sales", label: "Sales", icon: "💰" },
    { id: "inventory", label: "Inventory", icon: "📦" },
    { id: "expenses", label: "Expenses", icon: "💸" },
    { id: "tasks", label: "Tasks", icon: "✅" },
    { id: "reports", label: "Reports", icon: "📈" },
    { id: "sheets", label: "Sheets", icon: "📄" },
    { id: "admin", label: "Admin Panel", icon: "⚙️" },
  ]

  useEffect(() => {
    fetchPinnedSheets()
  }, [])

  const fetchPinnedSheets = async () => {
    try {
      const response = await sheetsAPI.getAll()
      const pinned = response.data.filter((sheet) => sheet.isPinned)
      setPinnedSheets(pinned)
    } catch (error) {
      console.error("Failed to fetch pinned sheets:", error)
    }
  }

  const handleViewSheet = (url) => {
    window.open(url, "_blank")
  }

  const handleNavClick = (moduleId) => {
    setActiveModule(moduleId)
    setShowNavMenu(false)
  }

  return (
    <div className="navbar">
      <div className="navbar-left">
        <h1>📊 ERP System</h1>
      </div>

      <button className="nav-menu-toggle" onClick={() => setShowNavMenu(!showNavMenu)}>
        ☰
      </button>

      <nav className={`navbar-nav ${showNavMenu ? "open" : ""}`}>
        <ul className="nav-list">
          {modules.map((module) => (
            <li key={module.id}>
              <button
                className={`nav-link ${activeModule === module.id ? "active" : ""}`}
                onClick={() => handleNavClick(module.id)}
                title={module.label}
              >
                <span className="nav-icon">{module.icon}</span>
                <span className="nav-label">{module.label}</span>
              </button>
            </li>
          ))}
        </ul>
      </nav>

      <div className="navbar-center">
        <div className="sheets-dropdown-container">
          {/* <button
            className="sheets-btn"
            onClick={() => setShowDropdown(!showDropdown)}
            title="Quick access to pinned sheets"
          >
            📌 Sheets ({pinnedSheets.length})
          </button> */}

          {showDropdown && (
            <div className="sheets-dropdown">
              {pinnedSheets.length > 0 ? (
                <div className="sheets-list">
                  {pinnedSheets.map((sheet) => (
                    <div key={sheet._id} className="sheet-item">
                      <span className="sheet-name">{sheet.name}</span>
                      <button className="view-btn" onClick={() => handleViewSheet(sheet.url)} title="Open in new tab">
                        ↗
                      </button>
                    </div>
                  ))}
                </div>
              ) : (
                <div className="no-sheets">No pinned sheets yet</div>
              )}
            </div>
          )}
        </div>
      </div>

      <div className="navbar-right">
        <span className="last-updated">🕐 {lastUpdated ? new Date(lastUpdated).toLocaleString() : "Never"}</span>
        <button className="logout-btn" onClick={onLogout}>
          Logout
        </button>
      </div>

      {showNavMenu && <div className="nav-overlay" onClick={() => setShowNavMenu(false)}></div>}
    </div>
  )
}
