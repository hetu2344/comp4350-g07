// src/pages/Reservation.jsx
import React, { useState, useEffect } from "react";
import { addReservation, getReservationsByCustomer, deleteReservation } from "../services/api";
import "../components/layout/Reservation.css";

const Reservation = () => {
  const [formData, setFormData] = useState({ name: "", partySize: "", time: "" });
  const [reservations, setReservations] = useState([]);
  const [message, setMessage] = useState(null);
  const [error, setError] = useState(null);

  // Fetch reservations for the logged-in customer
  useEffect(() => {
    const fetchReservations = async () => {
      const customerName = localStorage.getItem("username"); // Get from localStorage
      if (!customerName) return;

      try {
        const data = await getReservationsByCustomer(customerName);
        setReservations(data);
      } catch (err) {
        setError("Failed to load reservations.");
      }
    };

    fetchReservations();
  }, []);

  // Handle form input changes
  const handleChange = (e) => {
    setFormData({ ...formData, [e.target.name]: e.target.value });
  };

  // Handle reservation submission
  const handleReserve = async () => {
    if (!formData.name || !formData.partySize || !formData.time) {
      setError("Please fill out all fields.");
      return;
    }
  
    console.log("Original Time from Form:", formData.time);
  
    // ✅ Convert time into ISO format before sending to backend
    const formattedTime = new Date(formData.time).toISOString();
    console.log("Formatted Time for Backend:", formattedTime);
  
    try {
      await addReservation(formData.name, null, formData.partySize, formattedTime);
  
      // Refresh tables
      const updatedTables = await getAllTables();
      console.log("Updated tables after reservation:", updatedTables);
      setTables(updatedTables);
  
      setSelectedTable(null);
      setFormData({ name: "", partySize: "", time: "" });
    } catch (err) {
      console.error("Error making reservation:", err);
      setError("Failed to add reservation.");
    }
  };

  // Handle reservation deletion
  const handleCancel = async (reservationID) => {
    try {
        await deleteReservation(reservationID);

        // Remove reservation from local state immediately
        setReservations(reservations.filter(res => res.reservation_id !== reservationID));

        // Refresh table list to reflect status change
        const updatedTables = await getAllTables();
        setTables(updatedTables); // Ensure this is updating correctly

        setMessage("Reservation deleted successfully.");
        setError(null);
    } catch (err) {
        console.error("Error deleting reservation:", err);
        setError("Failed to delete reservation.");
        setMessage(null);
    }
};

  return (
    <div className="reservation">
      <h2>Make a Reservation</h2>

      {message && <p className="success-message">{message}</p>}
      {error && <p className="error-message">{error}</p>}

      <div className="reservation-form">
        <h3>Book a Table</h3>
        <input type="text" name="name" placeholder="Name" value={formData.name} onChange={handleChange} />
        <input type="number" name="partySize" placeholder="Party Size" value={formData.partySize} onChange={handleChange} />
        <input type="datetime-local" name="time" value={formData.time} onChange={handleChange} />
        <button onClick={handleReserve} className="action-button">Reserve</button>
      </div>

      <div className="reservation-list">
        <h3>My Reservations</h3>
        {reservations.length > 0 ? (
          reservations.map((res) => (
            <div key={res.reservation_id} className="reservation-card">
              <p>Name: {res.customer_name}</p>
              <p>Party Size: {res.party_size}</p>
              <p>Time: {new Date(res.reservation_time).toLocaleString()}</p>
              <p>Table: {res.table_num}</p>
              <button onClick={() => handleCancel(res.reservation_id)} className="cancel-button">
                Cancel
              </button>
            </div>
          ))
        ) : (
          <p>No reservations found.</p>
        )}
      </div>
    </div>
  );
};

export default Reservation;

