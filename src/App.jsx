"use client"

import { useState } from "react"
import "./App.css"
import Login from "./components/Login"
import Navbar from "./components/Navbar"
import Dashboard from "./components/Dashboard"
import Sales from "./components/Sales"
import Inventory from "./components/Inventory"
import Expenses from "./components/Expenses"
import Tasks from "./components/Tasks"
import Reports from "./components/Reports"
import AdminPanel from "./components/AdminPanel"
import Sheets from "./pages/Sheets"

function App() {
  const [isLoggedIn, setIsLoggedIn] = useState(!!localStorage.getItem("token"))
  const [activeModule, setActiveModule] = useState("dashboard")
  const [lastUpdated, setLastUpdated] = useState(null)

  const handleLogout = () => {
    localStorage.removeItem("token")
    setIsLoggedIn(false)
  }

  const renderModule = () => {
    switch (activeModule) {
      case "dashboard":
        return <Dashboard onDataUpdate={setLastUpdated} />
      case "sales":
        return <Sales />
      case "inventory":
        return <Inventory />
      case "expenses":
        return <Expenses />
      case "tasks":
        return <Tasks />
      case "reports":
        return <Reports />
      case "sheets":
        return <Sheets />
      case "admin":
        return <AdminPanel />
      default:
        return <Dashboard onDataUpdate={setLastUpdated} />
    }
  }

  if (!isLoggedIn) {
    return <Login onLoginSuccess={() => setIsLoggedIn(true)} />
  }

  return (
    <div className="container">
      <div className="main-content">
        <Navbar
          onLogout={handleLogout}
          lastUpdated={lastUpdated}
          activeModule={activeModule}
          setActiveModule={setActiveModule}
        />
        {renderModule()}
      </div>
    </div>
  )
}

export default App
