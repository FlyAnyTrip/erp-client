"use client"

import { useState, useEffect } from "react"
import { sheetsAPI } from "../services/api"
import GoogleSheetCard from "../components/GoogleSheetCard"
import AddGoogleSheetModal from "../components/AddGoogleSheetModal"
import "../styles/sheets-page.css"

const Sheets = () => {
  const [sheets, setSheets] = useState([])
  const [pinnedSheets, setPinnedSheets] = useState([])
  const [loading, setLoading] = useState(true)
  const [showAddModal, setShowAddModal] = useState(false)

  useEffect(() => {
    fetchSheets()
  }, [])

  const fetchSheets = async () => {
    try {
      setLoading(true)
      const response = await sheetsAPI.getAll()
      const allSheets = response.data
      const pinned = allSheets.filter((sheet) => sheet.isPinned)
      const unpinned = allSheets.filter((sheet) => !sheet.isPinned)

      setPinnedSheets(pinned)
      setSheets(unpinned)
    } catch (error) {
      console.error("Failed to fetch sheets:", error)
    } finally {
      setLoading(false)
    }
  }

  const handleAddSheet = async (sheetData) => {
    try {
      await sheetsAPI.create(sheetData)
      fetchSheets()
      setShowAddModal(false)
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

  if (loading) return <div className="content">Loading...</div>

  return (
    <div className="content sheets-page-content">
      <div className="sheets-page-header">
        <h2>📄 Google Sheets</h2>
        <button className="btn btn-primary" onClick={() => setShowAddModal(true)}>
          + Add New Sheet
        </button>
      </div>

      {pinnedSheets.length > 0 && (
        <div className="sheets-section">
          <h3>📌 Pinned Sheets</h3>
          <div className="sheets-grid">
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
        </div>
      )}

      {sheets.length > 0 && (
        <div className="sheets-section">
          <h3>📋 All Sheets</h3>
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

      {sheets.length === 0 && pinnedSheets.length === 0 && (
        <div className="empty-state">
          <div className="empty-icon">📊</div>
          <h3>No Google Sheets Yet</h3>
          <p>Start by adding your first Google Sheet to organize your data</p>
          <button className="btn btn-primary" onClick={() => setShowAddModal(true)}>
            Add Your First Sheet
          </button>
        </div>
      )}

      {showAddModal && <AddGoogleSheetModal onClose={() => setShowAddModal(false)} onAdd={handleAddSheet} />}
    </div>
  )
}

export default Sheets
