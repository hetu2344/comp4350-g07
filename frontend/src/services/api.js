// src/services/api.js
import axios from 'axios';

const API_BASE_URL = 'http://localhost:8018/api/tables'; 

export const getAllTables = async () => {
    try {
      const response = await fetch("http://localhost:8018/api/tables"); // Ensure correct backend port
      const data = await response.json();
      console.log("API Response:", data);
  
      return data.rows || []; // Ensure it's an array
    } catch (error) {
      console.error("Error fetching tables:", error);
      return [];
    }
  };

export const updateTableStatus = async (tableNum, isOpen) => {
  try {
    const response = await axios.post(`${API_BASE_URL}/`, { tableNum, isOpen });
    return response.data;
  } catch (error) {
    console.error('Error updating table status:', error);
    throw error;
  }
};

export const addReservation = async (name, tableNum, partySize, time) => {
  try {
    const response = await axios.post(`${API_BASE_URL}/reservation`, {
      name,
      tableNum,
      partySize,
      time,
    });
    return response.data;
  } catch (error) {
    console.error('Error adding reservation:', error);
    throw error;
  }
};

export const getReservationsByTable = async (tableNum) => {
  try {
    const response = await axios.get(`${API_BASE_URL}/reservation/table`, {
      params: { tableNum },
    });
    return response.data;
  } catch (error) {
    console.error('Error fetching reservations by table:', error);
    throw error;
  }
};

export const getReservationsByCustomer = async (customerName) => {
  try {
    const response = await axios.get(`${API_BASE_URL}/reservation/customer`, {
      params: { customer_name: customerName },
    });
    return response.data;
  } catch (error) {
    console.error('Error fetching reservations by customer:', error);
    throw error;
  }
};

export const deleteReservation = async (reservationID) => {
  try {
    const response = await axios.delete(`${API_BASE_URL}/reservation`, {
      data: { reservationID },
    });
    return response.data;
  } catch (error) {
    console.error('Error deleting reservation:', error);
    throw error;
  }
};