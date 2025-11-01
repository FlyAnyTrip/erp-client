// FIXED API SERVICE - client/src/services/api.js
import axios from "axios"

const API_URL = import.meta.env.VITE_API_URL || "http://localhost:5000/api"

const api = axios.create({
  baseURL: API_URL,
  headers: {
    "Content-Type": "application/json",
  },
})

// Request interceptor to add token
api.interceptors.request.use(
  (config) => {
    const token = localStorage.getItem("token")
    console.log("[v0] Token from localStorage:", token ? "Present" : "Missing")
    if (token) {
      config.headers.Authorization = `Bearer ${token}`
      console.log("[v0] Authorization header set")
    }
    return config
  },
  (error) => {
    return Promise.reject(error)
  },
)

// Response interceptor to handle errors
api.interceptors.response.use(
  (response) => response,
  (error) => {
    if (error.response?.status === 401) {
      console.log("[v0] 401 Unauthorized - clearing token")
      localStorage.removeItem("token")
      window.location.href = "/"
    }
    return Promise.reject(error)
  },
)

export const authAPI = {
  register: (data) => api.post("/auth/register", data),
  login: (data) => api.post("/auth/login", data),
  getProfile: () => api.get("/auth/profile"),
}

export const salesAPI = {
  getAll: () => api.get("/sales"),
  getByRange: (startDate, endDate) => api.get(`/sales/range/${startDate}/${endDate}`),
  create: (data) => api.post("/sales", data),
  update: (id, data) => api.put(`/sales/${id}`, data),
  delete: (id) => api.delete(`/sales/${id}`),
}

export const inventoryAPI = {
  getAll: () => api.get("/inventory"),
  getLowStock: () => api.get("/inventory/low-stock"),
  create: (data) => api.post("/inventory", data),
  update: (id, data) => api.put(`/inventory/${id}`, data),
  delete: (id) => api.delete(`/inventory/${id}`),
}

export const expenseAPI = {
  getAll: () => api.get("/expenses"),
  getByCategory: (category) => api.get(`/expenses/category/${category}`),
  create: (data) => api.post("/expenses", data),
  update: (id, data) => api.put(`/expenses/${id}`, data),
  delete: (id) => api.delete(`/expenses/${id}`),
}

export const taskAPI = {
  getAll: () => api.get("/tasks"),
  getByStatus: (status) => api.get(`/tasks/status/${status}`),
  getPinned: () => api.get("/tasks/pinned/all"),
  create: (data) => api.post("/tasks", data),
  update: (id, data) => api.put(`/tasks/${id}`, data),
  togglePin: (id) => api.put(`/tasks/${id}/pin`),
  delete: (id) => api.delete(`/tasks/${id}`),
}

export const dashboardAPI = {
  getData: () => api.get("/dashboard"),
}

export const importAPI = {
  importData: (dataLink, dataType) => api.post("/import/data", { dataLink, dataType }),
  updateLink: (dataLink) => api.post("/import/link", { dataLink }),
}

export const sheetsAPI = {
  getAll: () => api.get("/sheets"),
  getPinned: () => api.get("/sheets/pinned"),
  create: (data) => api.post("/sheets", data),
  togglePin: (id) => api.put(`/sheets/${id}/pin`),
  delete: (id) => api.delete(`/sheets/${id}`),
}

export default api
