
import axios from "axios";


const API_BASE_URL = 'http://localhost:8018/api/tables'; 

// Fetch all tables
export const getAllTables = async () => {
    try {
        const response = await axios.get(`${API_BASE_URL}/`);
        console.log("API Response:", response.data);
        return response.data;
    } catch (error) {
        console.error("Error fetching tables:", error);
        return [];
    }
};


export const addReservation = async (name, tableNum, partySize, time) => {  // Ensure tableNum is passed
    try {
        console.log("Making reservation:", { name, tableNum, partySize, time });
        

        const response = await axios.post(`${API_BASE_URL}/reservation`, {
            name,
            tableNum,  // Include tableNum in request
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
        return response.data.rows || [];
    } catch (error) {
        console.error('Error fetching reservations by table:', error);
        throw error;
    }
};


export const getReservationsByCustomer = async (customerName) => {
    try {
        const response = await axios.get(`${API_BASE_URL}/reservation/customer`, {
            params: { customerName }, // Match backend naming
        });
        return response.data.rows || [];
    } catch (error) {
        console.error('Error fetching reservations by customer:', error.response?.data || error.message);
        throw error;
    }
};

// Delete reservation
export const deleteReservation = async (reservationID) => {
    try {
        console.log(`Sending DELETE request to: ${API_BASE_URL}/reservation/${reservationID}`);

        const response = await axios.delete(`${API_BASE_URL}/reservation/${reservationID}`);

        console.log(`Successfully deleted reservation ID: ${reservationID}`);
        return response.data;
    } catch (error) {
        console.error(" Error deleting reservation:", error.response?.data || error.message);
        throw error;
    }
};