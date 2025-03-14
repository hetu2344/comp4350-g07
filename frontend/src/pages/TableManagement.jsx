// src/pages/TableManagement.jsx
import React, { useEffect, useState } from "react";
import "../components/layout/TableManagement.css";
import RoleProtection from "../components/security/RoleProtection";
import { getAllTables, updateTableStatus, addReservation, deleteReservation } from "../services/api";

const TableManagement = () => {
  const [tables, setTables] = useState([]);
  const [selectedTable, setSelectedTable] = useState(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);
  const [formData, setFormData] = useState({ name: "", partySize: "", time: "" });

  // Fetch tables from the backend
  useEffect(() => {
    const fetchTables = async () => {
      try {
        console.log("Fetching tables...");
        const data = await getAllTables();
        console.log("Raw API Response:", data); // Debugging output

        if (!Array.isArray(data)) {
          throw new Error("Invalid API response format");
        }

        setTables(data); // Update state with table data
        console.log("Updated tables state:", data); // Log after state update
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

  // Handle reservation creation
  const handleReserve = async () => {
    if (!formData.name || !formData.partySize || !formData.time) {
        setError("Please fill out all fields.");
        return;
    }

    // Ensure time is in the correct format
let selectedTime = new Date(`${formData.time}:00`);

// Validate if selectedTime is a valid date
if (isNaN(selectedTime.getTime())) {
    setError("Invalid date selected.");
    return;
}

// Convert to ISO 8601 format, adjusting for timezones
const formattedTime = new Date(selectedTime.getTime() - (selectedTime.getTimezoneOffset() * 60000)).toISOString();

    
    console.log("Formatted Reservation Time:", formattedTime);

    try {
        await addReservation(formData.name, selectedTable.table_num, formData.partySize, formattedTime);
        
        // Refresh tables
        const updatedTables = await getAllTables();
        setTables(updatedTables);

        setSelectedTable(null);
        setFormData({ name: "", partySize: "", time: "" });
    } catch (err) {
        console.error("Error making reservation:", err);
        setError("Failed to add reservation.");
    }
};


  // Handle reservation deletion
  const handleCancelReservation = async () => {
    if (!selectedTable || !selectedTable.reservation_id) return;

    try {
      await deleteReservation(selectedTable.reservation_id);
      setSelectedTable(null);

      // Update table status to available
      await updateTableStatus(selectedTable.table_num, true);

      // Refresh tables
      const updatedTables = await getAllTables();
      setTables(updatedTables);
    } catch (err) {
      console.error("Error deleting reservation:", err);
      setError("Failed to delete reservation.");
    }
  };

  // Handle manual table status update
  const handleUpdateStatus = async (tableNum, isAvailable) => {
    try {
      await updateTableStatus(tableNum, isAvailable);

      // Refresh the table list after updating
      const updatedTables = await getAllTables();
      setTables(updatedTables);
    } catch (err) {
      setError("Failed to update table status.");
      console.error("Error updating table status:", err);
    }
  };

  if (loading) return <p>Loading tables...</p>;
  if (error) return <p>Error: {error}</p>;

  return (
    <div className="table-management">
      <h2>Table Management</h2>
      <div className="table-grid">
        {tables.map((table) => (
          <div
            key={table.table_num}
            className={`table-card ${table.table_status === false ? "reserved" : ""}`}
            onClick={() => setSelectedTable(table)}
          >
            <img src="/table.png" alt="Table" className="table-image" />
            <h3>Table {table.table_num}</h3>
            <p>Status: {table.table_status === false ? "Reserved" : "Available"}</p>
          </div>
        ))}
      </div>

      {/* Modal for Reservation Details */}
      {selectedTable && (
  <div className="modal">
    <div className="modal-content">
      <h2>Table {selectedTable.table_num}</h2>

      {/* Check if the table has any reservations */}
      {selectedTable.reservations.length > 0 ? (
        selectedTable.reservations.map((reservation) => (
          <div key={reservation.reservation_id}>
            <p><strong>Reserved by:</strong> {reservation.customer_name || "Unknown"}</p>
            <p><strong>Party Size:</strong> {reservation.party_size || "N/A"}</p>
            <p><strong>Time:</strong> {reservation.reservation_time ? new Date(reservation.reservation_time).toLocaleString() : "N/A"}</p>
            <button onClick={() => handleCancelReservation(reservation.reservation_id)} className="cancel-button">
              Cancel Reservation
            </button>
          </div>
        ))
      ) : (
        <>
          <h3>Make a Reservation</h3>
          <input type="text" placeholder="Name" value={formData.name} onChange={(e) => setFormData({ ...formData, name: e.target.value })} />
          <input type="number" placeholder="Party Size" value={formData.partySize} onChange={(e) => setFormData({ ...formData, partySize: e.target.value })} />
          <input type="datetime-local" value={formData.time} onChange={(e) => setFormData({ ...formData, time: e.target.value })} />
          <button onClick={handleReserve} className="action-button">Reserve</button>
        </>
      )}
      <button onClick={() => setSelectedTable(null)} className="close-button">Close</button>
    </div>
  </div>
)}
    </div>
  );
};

export default RoleProtection(TableManagement, ["S", "M", "E"]);

