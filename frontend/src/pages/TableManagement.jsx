// src/pages/TableManagement.jsx
import React, { useState } from 'react';
import '../components/layout/TableManagement.css';
import RoleProtection from '../components/security/RoleProtection';

const TableManagement = () => {
  const [tables, setTables] = useState([
    { id: 1, status: 'open', reservation: null },
    { id: 2, status: 'open', reservation: null },
    { id: 3, status: 'open', reservation: null },
  ]);

  const markAsTaken = (id) => {
    setTables((prevTables) =>
      prevTables.map((table) =>
        table.id === id ? { ...table, status: 'taken' } : table
      )
    );
  };

  const markAsOpen = (id) => {
    setTables((prevTables) =>
      prevTables.map((table) =>
        table.id === id ? { ...table, status: 'open' } : table
      )
    );
  };

  return (
    <div className="table-management">
      <h2>Table Management</h2>
      <div className="table-grid">
        {tables.map((table) => (
          <div
            key={table.id}
            className={`table-card ${table.status === 'open' ? 'open' : 'taken'}`}
          >
            <h3>Table {table.id}</h3>
            <p>Status: {table.status}</p>
            {table.status === 'open' ? (
              <button
                onClick={() => markAsTaken(table.id)}
                className="action-button"
              >
                Mark as Taken
              </button>
            ) : (
              <button
                onClick={() => markAsOpen(table.id)}
                className="action-button"
              >
                Mark as Open
              </button>
            )}
          </div>
        ))}
      </div>
    </div>
  );
};

export default RoleProtection(TableManagement, ['S','M','E']);

