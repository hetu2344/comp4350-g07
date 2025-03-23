// src/pages/TableManagement.jsx

import React, { useEffect, useState } from "react";
import "../components/layout/TableManagement.css";
import RoleProtection from "../components/security/RoleProtection";
import {
  getAllTables,
  getReservationsByCustomer,
  getReservationsByTable,
} from "../services/api";
import Reservation from "./Reservation";
import TableManagementNavigation from "../components/layout/TableManagementNavigation";

const TableManagement = () => {
  const [tables, setTables] = useState([]);
  const [selectedTable, setSelectedTable] = useState(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);
  const [searchCustomer,setSearchCustomer]=useState("");
  const [customerReservations, setCustomerReservations] = useState([]);
  const [searchTableNum, setSearchTableNum] = useState("");
  const [tableReservations, setTableReservations] = useState([]);
  const [hasSearchedTable, setHasSearchedTable] = useState(false)




  // Fetch tables from the backend
  useEffect(() => {
    fetchTables();
  }, []);


   const fetchTables = async () => {
      try {
        setLoading(true)
        setError(null)
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

  const handleSearchCustomer=async()=>{
    if (!searchCustomer.trim()) {
      setError("Please enter a customer name to search")
      return
    }

    try{
      setLoading(true);
      setError(null);
      const reservations= await getReservationsByCustomer(searchCustomer);
      setCustomerReservations(reservations)
    }catch(err){
      setError("Failed to find customer reservations.");
    }finally{
      setLoading(false);
    }
  }

  
  const handleSearchTable = async () => {
    if (!searchTableNum.trim()) {
      setError("Please enter a table number to search")
      return
    }

    try {
      setLoading(true)
      setError(null)
      const tableNum = Number.parseInt(searchTableNum)
      const response = await getReservationsByTable(tableNum)
      setTableReservations(response || [])
    } catch (err) {
      setError("Failed to find reservations for this table.")
    } finally {
      setLoading(false)
    }
  }

  const clearCustomerSearch = () => {
    setSearchCustomer("")
    setCustomerReservations([])
  }

  const clearTableSearch = () => {
    setSearchTableNum("")
    setTableReservations([])
  }


   const formatDate = (dateString) => {
    if (!dateString) return "N/A"
    const date = new Date(dateString)
    return date.toLocaleString()
  }

  const getNextReservation=(table)=>{
    if(!table.reservations||table.reservations.length===0){
      return null;
    }

    const now=new Date();
    const futureReservations=table.reservations.filter((res)=>new Date(res.reservation_time)>now).sort((a,b)=>new Date(a.reservation_time)-new Date(b.reservation_time));

    if(futureReservations.length>0){
      return futureReservations[0];
    }else{
      return null;
    }
  }


  return (
    <div>
       <TableManagementNavigation />


    
    <div className="table-management">
      <h2>Table Management</h2>

      {/* Error */}
      {error && (
        <div className="error-message">
          {error}
          <button onClick={() => setError(null)}>✕</button>
        </div>
      )}

      {/* Loading*/}
      {loading && <div className="loading-indicator">Loading...</div>}

      {/*TableGrid*/}
      <div className="table-grid">
        {tables.map((table) => {
          const nextReservation = getNextReservation(table)

          return (
            <div key={table.table_num} className="table-card" onClick={() => setSelectedTable(table)}>
              <h3>Table {table.table_num}</h3>
              <p>Seats: {table.num_seats}</p>
              <p>Reservations: {table.reservations ? table.reservations.length : 0}</p>
              {nextReservation && (
                <p className="next-reservation">Next: {formatDate(nextReservation.reservation_time)}</p>
              )}
            </div>
          )
        })}
      </div>

      {/* Customer Search*/}
      <div className="reservation-list-container">
        <h3>Search Reservations by Customer</h3>
        <div className="search-form">
          <input
            type="text"
            placeholder="Customer Name"
            value={searchCustomer}
            onChange={(e) => setSearchCustomer(e.target.value)}
          />
          <button onClick={handleSearchCustomer} className="action-button" disabled={loading}>
            Search
          </button>
          <button onClick={clearCustomerSearch} className="cancel-button" disabled={loading}>
            Clear
          </button>
        </div>

        {customerReservations.length > 0 && (
          <div>
            <h4>Results for "{searchCustomer}"</h4>
            <table className="reservation-table">
              <thead>
                <tr>
                  <th>Table</th>
                  <th>Party Size</th>
                  <th>Date & Time</th>
                  <th>Actions</th>
                </tr>
              </thead>
              <tbody>
                {customerReservations.map((reservation) => (
                  <tr key={reservation.reservation_id}>
                    <td>Table {reservation.table_num}</td>
                    <td>{reservation.party_size}</td>
                    <td>{formatDate(reservation.reservation_time)}</td>
                    <td>
                      <button
                        onClick={() => {
                          const table = tables.find((t) => t.table_num === reservation.table_num)
                          if (table) setSelectedTable(table)
                        }}
                        className="action-button"
                      >
                        View
                      </button>
                       <button
                        onClick={() => {
                          const table = tables.find((t) => t.table_num === reservation.table_num)
                          if (table) setSelectedTable(table)
                        }}
                        className="action-button"
                      >
                        Cancel
                      </button>
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        )}
      </div>

      {/* Table Number Search */}
      <div className="reservation-list-container">
        <h3>Search by Table Number</h3>
        <div className="search-form">
          <input
            type="number"
            placeholder="Table Number"
            value={searchTableNum}
            onChange={(e) => setSearchTableNum(e.target.value)}
            min="1"
          />
          <button onClick={handleSearchTable} className="action-button" disabled={loading}>
            Search
          </button>
          <button onClick={clearTableSearch} className="cancel-button" disabled={loading}>
            Clear
          </button>
        </div>

        {tableReservations.length > 0 && (
          <div>
            <h4>Reservations for Table #{searchTableNum}</h4>
            <table className="reservation-table">
              <thead>
                <tr>
                  <th>Customer</th>
                  <th>Party Size</th>
                  <th>Date & Time</th>
                  <th>Actions</th>
                </tr>
              </thead>
              <tbody>
                {tableReservations.map((reservation) => (
                  <tr key={reservation.reservation_id}>
                    <td>{reservation.customer_name}</td>
                    <td>{reservation.party_size}</td>
                    <td>{formatDate(reservation.reservation_time)}</td>
                    <td>
                      <button
                        onClick={() => {
                          const table = tables.find((t) => t.table_num === Number.parseInt(searchTableNum))
                          if (table) setSelectedTable(table)
                        }}
                        className="action-button"
                      >
                        View
                      </button>
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        )}
        {hasSearchedTable && tableReservations.length === 0 && !loading && (
          <p>No reservations found for Table #{searchTableNum}.</p>
        )}
      </div>

      {/*ReservationList*/}
      <div className="reservation-list-container">
        <h2 className="reservation-list-title">All Reservations</h2>
        <table className="reservation-table">
          <thead>
            <tr>
              <th>Table</th>
              <th>Customer</th>
              <th>Party Size</th>
              <th>Date & Time</th>
              <th>Actions</th>
            </tr>
          </thead>
          <tbody>
            {tables.flatMap((table) =>
              table.reservations
                ? table.reservations.map((reservation) => (
                    <tr key={reservation.reservation_id}>
                      <td>Table {table.table_num}</td>
                      <td>{reservation.customer_name}</td>
                      <td>{reservation.party_size}</td>
                      <td>{formatDate(reservation.reservation_time)}</td>
                      <td>
                        <button onClick={() => setSelectedTable(table)} className="action-button">
                          View
                        </button>
                      </td>
                    </tr>
                  ))
                : [],
            )}
            {tables.every((table) => !table.reservations || table.reservations.length === 0) && (
              <tr>
                <td colSpan="5" style={{ textAlign: "center" }}>
                  No reservations found
                </td>
              </tr>
            )}
          </tbody>
        </table>
      </div>

      {/* Reservation Modal */}
      {selectedTable && (
        <Reservation
          selectedTable={selectedTable}
          onClose={() => setSelectedTable(null)}
          onReservationChange={fetchTables}
          formatDate={formatDate}
        />
      )}
    </div>
    </div>
  )
}

export default RoleProtection(TableManagement, ["S", "M", "E"])

