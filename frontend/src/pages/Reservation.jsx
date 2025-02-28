// src/components/pages/Reservation.jsx
import React, { useState } from 'react';
import { useNavigate } from 'react-router-dom';
import '../components/layout/Reservation.css';

const Reservation = () => {
  const [reservations, setReservations] = useState([]);
  const [formData, setFormData] = useState({ name: '', partySize: '', time: '' });
  const navigate = useNavigate();

  const handleReserve = () => {
    if (!formData.name || !formData.partySize || !formData.time) {
      alert('Please fill out all fields.');
      return;
    }

    const newReservation = { ...formData, id: Date.now() };
    setReservations((prev) => [...prev, newReservation]);
    setFormData({ name: '', partySize: '', time: '' });
  };

  const handleCancel = (id) => {
    setReservations((prev) => prev.filter((res) => res.id !== id));
  };

  return (
    <div className="reservation">
      <h2>Reservations</h2>
      <div className="reservation-form">
        <h3>Book a Table</h3>
        <input
          type="text"
          placeholder="Name"
          value={formData.name}
          onChange={(e) => setFormData({ ...formData, name: e.target.value })}
        />
        <input
          type="number"
          placeholder="Party Size"
          value={formData.partySize}
          onChange={(e) => setFormData({ ...formData, partySize: e.target.value })}
        />
        <input
          type="datetime-local"
          value={formData.time}
          onChange={(e) => setFormData({ ...formData, time: e.target.value })}
        />
        <button onClick={handleReserve} className="action-button">
          Reserve
        </button>
      </div>
      <div className="reservation-list">
        <h3>My Reservations</h3>
        {reservations.map((res) => (
          <div key={res.id} className="reservation-card">
            <p>Name: {res.name}</p>
            <p>Party Size: {res.partySize}</p>
            <p>Time: {new Date(res.time).toLocaleString()}</p>
            <button
              onClick={() => handleCancel(res.id)}
              className="cancel-button"
            >
              Cancel
            </button>
          </div>
        ))}
      </div>
    </div>
  );
};

export default Reservation;
