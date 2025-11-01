"use client"

import { useState } from "react"
// import "../styles/google-sheets.css"

export default function AddGoogleSheetModal({ onClose, onAdd }) {
  const [name, setName] = useState("")
  const [url, setUrl] = useState("")
  const [error, setError] = useState("")
  const [loading, setLoading] = useState(false)

  const handleSubmit = async (e) => {
    e.preventDefault()
    setError("")

    if (!name.trim()) {
      setError("Please enter a sheet name")
      return
    }

    if (!url.trim()) {
      setError("Please enter a Google Sheets URL")
      return
    }

    if (!url.includes("docs.google.com/spreadsheets")) {
      setError("Please enter a valid Google Sheets URL")
      return
    }

    setLoading(true)
    try {
      await onAdd({ name, url })
      setName("")
      setUrl("")
      onClose()
    } catch (err) {
      setError(err.response?.data?.message || "Failed to add sheet")
    } finally {
      setLoading(false)
    }
  }

  return (
    <div className="modal active" onClick={onClose}>
      <div className="modal-content" onClick={(e) => e.stopPropagation()}>
        <div className="modal-header">
          <h2>Add Google Sheet</h2>
          <button className="close-btn" onClick={onClose}>
            ×
          </button>
        </div>

        <form onSubmit={handleSubmit}>
          <div className="form-group">
            <label htmlFor="sheet-name">Sheet Name</label>
            <input
              id="sheet-name"
              type="text"
              value={name}
              onChange={(e) => setName(e.target.value)}
              placeholder="e.g., Sales Data, Inventory"
              disabled={loading}
            />
          </div>

          <div className="form-group">
            <label htmlFor="sheet-url">Google Sheets URL</label>
            <input
              id="sheet-url"
              type="text"
              value={url}
              onChange={(e) => setUrl(e.target.value)}
              placeholder="https://docs.google.com/spreadsheets/d/..."
              disabled={loading}
            />
            <div className="form-hint">Copy the URL from your Google Sheet's address bar</div>
          </div>

          {error && <div className="error-message">{error}</div>}

          <div className="modal-actions">
            <button type="button" className="btn btn-secondary" onClick={onClose} disabled={loading}>
              Cancel
            </button>
            <button type="submit" className="btn btn-primary" disabled={loading}>
              {loading ? "Adding..." : "Add Sheet"}
            </button>
          </div>
        </form>
      </div>
    </div>
  )
}
