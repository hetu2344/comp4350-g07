// src/pages/Reservation.jsx
import React, { useState } from "react";
import { addReservation, getReservationsByCustomer, deleteReservation } from "../services/api";
import "../components/layout/Reservation.css";

const Reservation = () => {
  const [formData, setFormData] = useState({ name: "", partySize: "", time: "", tableNum: "" });
  const [reservations, setReservations] = useState([]);
  const [message, setMessage] = useState(null); // Success/Error messages
  const [error, setError] = useState(null);

  // Handle form input changes
  const handleChange = (e) => {
    setFormData({ ...formData, [e.target.name]: e.target.value });
  };

  // Handle reservation submission
  const handleReserve = async () => {
    const { name, partySize, time, tableNum } = formData;

    // Validate input fields
    if (!name || !partySize || !time || !tableNum) {
      setError("Please fill out all fields.");
      return;
    }

    try {
      await addReservation(name, tableNum, partySize, time);
      setMessage("Reservation added successfully!");
      setError(null);

      // Fetch reservations after successful submission
      const updatedReservations = await getReservationsByCustomer(name);
      setReservations(updatedReservations);

      // Reset form
      setFormData({ name: "", partySize: "", time: "", tableNum: "" });
    } catch (err) {
      console.error("Error making reservation:", err);
      setError("Failed to add reservation.");
      setMessage(null);
    }
  };

  // Handle reservation deletion
  const handleCancel = async (reservationID) => {
    try {
      await deleteReservation(reservationID);
      setMessage("Reservation deleted successfully!");
      setError(null);

      // Refresh reservations list
      const updatedReservations = await getReservationsByCustomer(formData.name);
      setReservations(updatedReservations);
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
        <input type="number" name="tableNum" placeholder="Table Number" value={formData.tableNum} onChange={handleChange} />
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
