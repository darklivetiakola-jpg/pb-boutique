import axios from "axios";

export const API_BASE = import.meta.env.VITE_API_URL || "http://localhost:4000/api";

const apiClient = axios.create({ baseURL: API_BASE, withCredentials: true });

export default apiClient;
