// src/pages/TableManagement.jsx
import React, { useEffect, useState } from 'react';
import '../components/layout/TableManagement.css';
import RoleProtection from '../components/security/RoleProtection';
import { getAllTables, updateTableStatus } from '../services/api';

const TableManagement = () => {
  const [tables, setTables] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);

  // Fetch tables from the backend
  useEffect(() => {
    const fetchTables = async () => {
      try {
        console.log("Fetching tables...");
        const data = await getAllTables();
        console.log("API Response:", data); // Debugging output
  
        if (!Array.isArray(data)) {
          throw new Error("Invalid API response format");
        }
  
        setTables(data);
      } catch (err) {
        console.error("Error fetching tables:", err);
        setError("Failed to load tables.");
        setTables([]); // Ensure tables is always an array
      } finally {
        setLoading(false);
      }
    };
  
    fetchTables();
  }, []);

  // Update table status
  const handleUpdateStatus = async (tableNum, isOpen) => {
    try {
      await updateTableStatus(tableNum, isOpen);
      // Refresh the table list after updating
      const updatedTables = await getAllTables();
      setTables(updatedTables);
    } catch (err) {
      setError(err.message);
    }
  };

  if (loading) return <p>Loading tables...</p>;
  if (error) return <p>Error: {error}</p>;
  console.log("Tables state:", tables)
  return (
    <div className="table-management">
      <h2>Table Management</h2>
      <div className="table-grid">
        {tables.map((table) => (
          <div
            key={table.table_num}
            className={`table-card ${table.table_status ? 'open' : 'taken'}`}
          >
            <h3>Table {table.table_num}</h3>
            <p>Status: {table.table_status ? 'Open' : 'Taken'}</p>
            <button
              onClick={() => handleUpdateStatus(table.table_num, !table.table_status)}
              className="action-button"
            >
              Mark as {table.table_status ? 'Taken' : 'Open'}
            </button>
          </div>
        ))}
      </div>
    </div>
  );
};

export default RoleProtection(TableManagement, ['S', 'M', 'E']);