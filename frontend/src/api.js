// In src/api.js
import axios from "axios"

export const api = axios.create({
  baseURL: "http://localhost:9090/api/v1",
  withCredentials: true,
  headers: {
    "Content-Type": "application/json",
    Accept: "application/json",
  },
})

// Add request interceptor for debugging
api.interceptors.request.use(
  (config) => {
    console.log(`Making request to: ${config.baseURL}${config.url}`, config)
    return config
  },
  (error) => {
    console.error("Request error:", error)
    return Promise.reject(error)
  },
)

// Add response interceptor for debugging
api.interceptors.response.use(
  (response) => {
    console.log("Response received:", response.status, response.data)
    return response
  },
  (error) => {
    console.error("Response error:", error.message)
    if (error.response) {
      console.error("Error status:", error.response.status)
      console.error("Error data:", error.response.data)
      console.error("Error headers:", error.response.headers)
    }
    return Promise.reject(error)
  },
)
