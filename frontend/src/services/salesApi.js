import axios from "axios"

const API_BASE_URL = "http://localhost:8018/api/sales"

// Get total revenue for a date range
export const getTotalRevenue = async (startDate, endDate) => {
  try {
    const params = {}
    if (startDate) params.startDate = startDate
    if (endDate) params.endDate = endDate

    const response = await axios.get(`${API_BASE_URL}/totalRevenue`, {
      params,
      withCredentials: true,
    })
    return response.data
  } catch (error) {
    console.error("Error fetching total revenue:", error)
    throw error
  }
}

// Get top menu items for a date range
export const getTopMenuItems = async (startDate, endDate) => {
  try {
    const params = {}
    if (startDate) params.startDate = startDate
    if (endDate) params.endDate = endDate

    const response = await axios.get(`${API_BASE_URL}/topMenuItems`, {
      params,
      withCredentials: true,
    })
    return response.data
  } catch (error) {
    console.error("Error fetching top menu items:", error)
    throw error
  }
}

// Get revenue by category for a date range
export const getRevenueByCategory = async (startDate, endDate) => {
  try {
    const params = {}
    if (startDate) params.startDate = startDate
    if (endDate) params.endDate = endDate

    const response = await axios.get(`${API_BASE_URL}/revenueByCategory`, {
      params,
      withCredentials: true,
    })
    return response.data
  } catch (error) {
    console.error("Error fetching revenue by category:", error)
    throw error
  }
}

// Get weekly sales data
export const getWeeklySales = async () => {
  try {
    const response = await axios.get(`${API_BASE_URL}/weeklySales`, {
      withCredentials: true,
    })
    return response.data
  } catch (error) {
    console.error("Error fetching weekly sales:", error)
    throw error
  }
}

// Get dine-in vs take-out data for a date range
export const getDineVsTake = async (startDate, endDate) => {
  try {
    const params = {}
    if (startDate) params.startDate = startDate
    if (endDate) params.endDate = endDate

    const response = await axios.get(`${API_BASE_URL}/dinevstake`, {
      params,
      withCredentials: true,
    })
    return response.data
  } catch (error) {
    console.error("Error fetching dine vs take data:", error)
    throw error
  }
}

