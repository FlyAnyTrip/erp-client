import React, { useState, useEffect } from 'react';
import { importAPI, authAPI } from '../services/api';

export default function AdminPanel() {
  const [admin, setAdmin] = useState(null);
  const [dataLink, setDataLink] = useState('');
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    fetchAdminProfile();
  }, []);

  const fetchAdminProfile = async () => {
    try {
      const response = await authAPI.getProfile();
      setAdmin(response.data);
      setDataLink(response.data.dataLink || '');
    } catch (error) {
      console.error('Failed to fetch admin profile:', error);
    } finally {
      setLoading(false);
    }
  };

  const handleUpdateLink = async () => {
    try {
      await importAPI.updateLink(dataLink);
      alert('Data link updated successfully');
      fetchAdminProfile();
    } catch (error) {
      alert('Failed to update data link');
    }
  };

  if (loading) return <div className="content">Loading...</div>;

  return (
    <div className="content">
      <h2>Admin Panel</h2>

      <div className="card" style={{ marginBottom: '20px' }}>
        <h3>Admin Information</h3>
        <p><strong>Username:</strong> {admin?.username}</p>
        <p><strong>Email:</strong> {admin?.email}</p>
        <p><strong>Last Updated:</strong> {admin?.lastUpdated ? new Date(admin.lastUpdated).toLocaleString() : 'Never'}</p>
      </div>

      <div className="card">
        <h3>Data Management</h3>
        <div className="form-group">
          <label>Data Link (CSV/Excel URL)</label>
          <input
            type="text"
            value={dataLink}
            onChange={(e) => setDataLink(e.target.value)}
            placeholder="https://example.com/data.csv"
          />
          <small style={{ display: 'block', marginTop: '5px', color: '#999' }}>
            Paste your CSV or Excel file URL here for automatic data import
          </small>
        </div>
        <button className="btn btn-primary" onClick={handleUpdateLink}>
          Update Data Link
        </button>
      </div>
    </div>
  );
}