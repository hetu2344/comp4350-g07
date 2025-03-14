// src/services/api.js
import axios from 'axios';

const API_BASE_URL = 'http://localhost:8018/api/tables'; 

// Fetch all tables
export const getAllTables = async () => {
    try {
        const response = await fetch(API_BASE_URL);
        const data = await response.json();
        console.log("API Response:", data);
        return data;
    } catch (error) {
        console.error("Error fetching tables:", error);
        return [];
    }
};

// Update table status
export const updateTableStatus = async (tableNum, isOpen) => {
    try {
        const response = await axios.post(`${API_BASE_URL}/`, { tableNum, isOpen });
        return response.data;
    } catch (error) {
        console.error('Error updating table status:', error);
        throw error;
    }
};

// ✅ FIXED: Removed `table_num` from the request
export const addReservation = async (name, partySize, time) => {
    try {
        console.log("Making reservation:", { name, partySize, time });

        const response = await axios.post(`${API_BASE_URL}/reservation`, {
            name,
            partySize,
            time,
        });

        return response.data;
    } catch (error) {
        console.error('Error adding reservation:', error.response?.data || error.message);
        throw error;
    }
};

// Get reservations by table number
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

// ✅ FIXED: Changed `customer_name` to `customerName`
export const getReservationsByCustomer = async (customerName) => {
    try {
        const response = await axios.get(`${API_BASE_URL}/reservation/customer`, {
            params: { customerName }, // Match backend naming
        });
        return response.data;
    } catch (error) {
        console.error('Error fetching reservations by customer:', error.response?.data || error.message);
        throw error;
    }
};

// Delete reservation
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
