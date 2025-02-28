// src/components/pages/Reservation.jsx
import React, { useEffect, useState } from 'react';
import { useNavigate } from 'react-router-dom';
import '../components/layout/Reservation.css';
import { addReservation, deleteReservation, getReservationsByCustomer } from '../services/api';

const Reservation = () => {
  const [reservations, setReservations] = useState([]);
  const [formData, setFormData] = useState({ name: '', partySize: '', time: '' });
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);
  const navigate = useNavigate();

  // Fetch reservations for the logged-in customer
  useEffect(() => {
    const fetchReservations = async () => {
      try {
        const customerName = localStorage.getItem('username'); // Example: Get customer name from localStorage
        const data = await getReservationsByCustomer(customerName);
        setReservations(data);
      } catch (err) {
        setError(err.message);
      } finally {
        setLoading(false);
      }
    };

    fetchReservations();
  }, []);

  // Add a new reservation
  const handleReserve = async () => {
    if (!formData.name || !formData.partySize || !formData.time) {
      alert('Please fill out all fields.');
      return;
    }

    try {
      await addReservation(formData.name, formData.tableNum, formData.partySize, formData.time);
      // Refresh the reservation list after adding
      const updatedReservations = await getReservationsByCustomer(formData.name);
      setReservations(updatedReservations);
      setFormData({ name: '', partySize: '', time: '' }); // Clear the form
      alert('Reservation added successfully!');
    } catch (err) {
      setError(err.message);
      alert('Failed to add reservation.');
    }
  };

  // Delete a reservation
  const handleCancel = async (reservationID) => {
    try {
      await deleteReservation(reservationID);
      // Refresh the reservation list after deleting
      const updatedReservations = await getReservationsByCustomer(formData.name);
      setReservations(updatedReservations);
      alert('Reservation deleted successfully!');
    } catch (err) {
      setError(err.message);
      alert('Failed to delete reservation.');
    }
  };

  if (loading) return <p>Loading reservations...</p>;
  if (error) return <p>Error: {error}</p>;

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
          <div key={res.reservation_id} className="reservation-card">
            <p>Name: {res.customer_name}</p>
            <p>Party Size: {res.party_size}</p>
            <p>Time: {new Date(res.reservation_time).toLocaleString()}</p>
            <button
              onClick={() => handleCancel(res.reservation_id)}
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