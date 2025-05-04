// In src/api.js
import axios from "axios"

export const api = axios.create({
  baseURL: "http://localhost:9090/api/v1", // Updated to include v1
  withCredentials: true // Add this line to include credentials
})