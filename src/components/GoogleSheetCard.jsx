"use client"

import "../styles/GoogleSheetCard.css"

export default function GoogleSheetCard({ sheet, onPin, onDelete, isPinned }) {
  const handleViewSheet = () => {
    window.open(sheet.url, "_blank")
  }

  return (
    <div className="google-sheet-card">
      <div className="sheet-card-header">
        <span className="sheet-name">{sheet.name}</span>
        <div className="sheet-actions">
          <button
            className={`sheet-btn pin-btn ${isPinned ? "pinned" : ""}`}
            onClick={() => onPin(sheet._id)}
            title={isPinned ? "Unpin sheet" : "Pin sheet"}
          >
            {isPinned ? "📌" : "📍"}
          </button>
          <button className="sheet-btn delete-btn" onClick={() => onDelete(sheet._id)} title="Delete sheet">
            🗑️
          </button>
        </div>
      </div>
      <div className="sheet-url">{sheet.url}</div>
      <div className="sheet-footer">
        <button className="view-sheet-btn" onClick={handleViewSheet}>
          ↗ View Sheet
        </button>
      </div>
    </div>
  )
}