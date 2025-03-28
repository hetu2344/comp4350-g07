import React, { useState,useEffect } from "react";
import { addReservation,deleteReservation } from "../services/api";
import "../components/layout/Reservation.css";

const Reservation = ({ selectedTable, onClose, onReservationChange, formatDate }) => {
  const [loading, setLoading] = useState(false)
  const [formData, setFormData] = useState({ name: "", partySize: "", time: "", tableNum: "" });
  const [error, setError] = useState(null);
  const [localTable, setLocalTable] = useState(selectedTable)

    useEffect(() => {
    setLocalTable(selectedTable)
  }, [selectedTable])


    // Handle reservation creation
    const handleReserve = async () => {
      console.log("Current formData before sending:", formData);
  
      if (
        !formData.name ||
        !formData.partySize ||
        !formData.time ||
        !selectedTable
      ) {
        setError("Please fill out all fields and select a table.");
        return;
      }
  
      const formattedTime = formData.time + ":00";
  
      console.log("Calling addReservation with:", {
        name: formData.name,
        tableNum: selectedTable.table_num, // Ensure the selected table number is sent
        partySize: formData.partySize,
        time: formattedTime,
      });
  
      try {
        setLoading(true)
  
        const result=await addReservation(
          formData.name,
          selectedTable.table_num, // Ensure tableNum is included
          formData.partySize,
          formattedTime
        );
        console.log("Reservation request sent!");
  
        
        // Refresh tables
        if (onReservationChange) {
        onReservationChange()
      }

        setFormData({ name: "", partySize: "", time: "" });
        onClose();
      } catch (err) {
        console.error("Error making reservation:", err);
        if(err.response.data.error.includes("Party size exceeds table capacity.")){
          setError(err.response.data);
        }
        setError("Failed to add reservation.");
      }finally{
        setLoading(false);
      }
    };
  
    
      // Handle reservation deletion
      const handleCancelReservation = async (reservationId) => {
        if (!reservationId) {
          console.error("No reservation Id provided.");
          return;
        }
    
        try {
          setLoading(true)
          console.log("Calling deleteReservation with:", reservationId);
          await deleteReservation(reservationId);
          console.log("Reservation Deleted");

          if (localTable && localTable.reservations) {
        const updatedReservations = localTable.reservations.filter((res) => res.reservation_id !== reservationId)
        setLocalTable({
          ...localTable,
          reservations: updatedReservations,
        })
      }
    
          // Refresh tables
        if (onReservationChange) {
          onReservationChange()
        }
        } catch (err) {
          console.error("Error deleting reservation:", err);
          setError("Failed to delete reservation.");
        }finally{
          setLoading(false);
        }
      };
    
if(!localTable){
  return null
}

  return (
    <div className="modal">
      <div className="modal-content">
        {/* Close button at top right */}
        <button onClick={onClose} className="close-button-top" aria-label="Close">
          ✕
        </button>
        <h2>Table {localTable.table_num}</h2>
        <p>Seats: {localTable.num_seats}</p>

        {/* Error */}
        {error && (
          <div className="error-message">
            {error}
            <button onClick={() => setError(null)}>✕</button>
          </div>
        )}

        
        <h3>Make a New Reservation</h3>
        <div className="reservation-form">
          <div className="form-group">
            <label htmlFor="name">Customer Name</label>
            <input
              id="name"
              type="text"
              placeholder="Name"
              value={formData.name}
              onChange={(e) => setFormData({ ...formData, name: e.target.value })}
            />
          </div>

          <div className="form-group">
            <label htmlFor="partySize">Party Size</label>
            <input
              id="partySize"
              type="number"
              placeholder="Party Size"
              value={formData.partySize}
              onChange={(e) => setFormData({ ...formData, partySize: Number(e.target.value) })}
              min="1"
              max={localTable.num_seats}
            />
          </div>

          <div className="form-group">
            <label htmlFor="time">Date & Time</label>
            <input
              id="time"
              type="datetime-local"
              value={formData.time}
              onChange={(e) => setFormData({ ...formData, time: e.target.value })}
              min={new Date().toISOString().slice(0, 16)}
            />
          </div>

          <button onClick={handleReserve} className="action-button" disabled={loading}>
            Reserve
          </button>
          <hr />

        </div>


        {localTable.reservations && localTable.reservations.length > 0 ? (
          <div>
            <h3>Current Reservations</h3>
              <hr />

            {localTable.reservations.map((reservation) => (
              <div key={reservation.reservation_id} className="reservation-item">
                <p>
                  <strong>Reserved by:</strong> {reservation.customer_name}
                </p>
                <p>
                  <strong>Party Size:</strong> {reservation.party_size}
                </p>
                <p>
                  <strong>Time:</strong> {formatDate(reservation.reservation_time)}
                </p>
                <button
                  onClick={() => handleCancelReservation(reservation.reservation_id)}
                  className="cancel-button"
                  disabled={loading}
                >
                  Cancel Reservation
                </button>
              </div>
            ))}
            <hr />
          </div>
        ) : null}

        <button onClick={onClose} className="close-button">
          Close
        </button>
      </div>
    </div>
  )
}

export default Reservation

