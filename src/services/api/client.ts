// API client configuration. Today this is a thin wrapper that returns dummy
// data; tomorrow the same service modules call axios.get(...) against this
// baseURL with zero UI-layer changes.
import axios from 'axios';

export const apiClient = axios.create({
  baseURL: import.meta.env.VITE_API_BASE_URL ?? '/api',
  timeout: 15000,
  headers: { 'Content-Type': 'application/json' },
});

// Future: attach JWT interceptor.
// apiClient.interceptors.request.use((config) => {
//   const token = localStorage.getItem('voltiq.token');
//   if (token) config.headers.Authorization = `Bearer ${token}`;
//   return config;
// });

export default apiClient;
