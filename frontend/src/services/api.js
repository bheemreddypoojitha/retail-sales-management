import axios from "axios";

const API_BASE_URL =
  import.meta.env.VITE_API_URL || "http://localhost:5000/api/sales";

const api = axios.create({
  baseURL: API_BASE_URL,
  timeout: 30000,
  headers: {
    "Content-Type": "application/json",
  },
});

api.interceptors.response.use(
  (response) => response,
  (error) => {
    console.error("API Error:", error);
    return Promise.reject(error);
  }
);

// Fetch sales data
export const fetchSalesData = async (params) => {
  try {
    const response = await api.get("/data", { params });
    return response.data;
  } catch (error) {
    throw new Error(
      error.response?.data?.message || "Failed to fetch sales data"
    );
  }
};

// Fetch filter options
export const fetchFilterOptions = async () => {
  try {
    const response = await api.get("/filters");
    return response.data;
  } catch (error) {
    throw new Error(
      error.response?.data?.message || "Failed to fetch filter options"
    );
  }
};

export default api;
