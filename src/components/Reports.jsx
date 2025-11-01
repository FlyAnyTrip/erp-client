import React, { useState, useEffect } from 'react';
import { salesAPI, inventoryAPI, expenseAPI } from '../services/api';
import * as XLSX from 'xlsx';
import jsPDF from 'jspdf';
import "../styles/reports.css";

export default function Reports() {
  const [reportData, setReportData] = useState(null);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    generateReport();
  }, []);

  const generateReport = async () => {
    try {
      const [salesRes, inventoryRes, expenseRes] = await Promise.all([
        salesAPI.getAll(),
        inventoryAPI.getAll(),
        expenseAPI.getAll(),
      ]);

      const totalSales = salesRes.data.reduce((sum, s) => sum + s.totalAmount, 0);
      const totalExpenses = expenseRes.data.reduce((sum, e) => sum + e.amount, 0);
      const totalProfit = salesRes.data.reduce((sum, s) => sum + s.profit, 0);
      const inventoryValue = inventoryRes.data.reduce((sum, i) => sum + i.quantity * i.price, 0);

      setReportData({
        totalSales,
        totalExpenses,
        totalProfit,
        inventoryValue,
        salesCount: salesRes.data.length,
        expenseCount: expenseRes.data.length,
        inventoryCount: inventoryRes.data.length,
        profitMargin: totalSales > 0 ? ((totalProfit / totalSales) * 100).toFixed(2) : 0,
      });
    } catch (error) {
      console.error('Failed to generate report:', error);
    } finally {
      setLoading(false);
    }
  };

  const exportReportToExcel = () => {
    const ws = XLSX.utils.json_to_sheet([reportData]);
    const wb = XLSX.utils.book_new();
    XLSX.utils.book_append_sheet(wb, ws, 'Report');
    XLSX.writeFile(wb, 'report.xlsx');
  };

  const exportReportToPDF = () => {
    const doc = new jsPDF();
    doc.text('ERP System Report', 10, 10);
    doc.text(`Total Sales: ₹${reportData.totalSales.toFixed(2)}`, 10, 30);
    doc.text(`Total Expenses: ₹${reportData.totalExpenses.toFixed(2)}`, 10, 40);
    doc.text(`Total Profit: ₹${reportData.totalProfit.toFixed(2)}`, 10, 50);
    doc.text(`Profit Margin: ${reportData.profitMargin}%`, 10, 60);
    doc.text(`Inventory Value: ₹${reportData.inventoryValue.toFixed(2)}`, 10, 70);
    doc.save('report.pdf');
  };

  if (loading) return <div className="content">Loading...</div>;

  return (
    <div className="content">
      <div style={{ display: 'flex', justifyContent: 'space-between', marginBottom: '20px' }}>
        <h2>Reports & Analytics</h2>
        <div style={{ display: 'flex', gap: '10px' }}>
          <button className="btn btn-success" onClick={exportReportToExcel}>
            Export Excel
          </button>
          <button className="btn btn-success" onClick={exportReportToPDF}>
            Export PDF
          </button>
        </div>
      </div>

      <div className="dashboard-grid">
        <div className="card">
          <h3>Total Sales</h3>
          <div className="value">₹{reportData.totalSales.toFixed(2)}</div>
          <div className="subtitle">{reportData.salesCount} transactions</div>
        </div>
        <div className="card">
          <h3>Total Expenses</h3>
          <div className="value">₹{reportData.totalExpenses.toFixed(2)}</div>
          <div className="subtitle">{reportData.expenseCount} expenses</div>
        </div>
        <div className="card">
          <h3>Total Profit</h3>
          <div className="value">₹{reportData.totalProfit.toFixed(2)}</div>
          <div className="subtitle">{reportData.profitMargin}% margin</div>
        </div>
        <div className="card">
          <h3>Inventory Value</h3>
          <div className="value">₹{reportData.inventoryValue.toFixed(2)}</div>
          <div className="subtitle">{reportData.inventoryCount} items</div>
        </div>
      </div>
    </div>
  );
}