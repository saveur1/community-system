// src/api/client.ts
import axios, { AxiosError } from 'axios';

// Create axios instance with default config
export const client = axios.create({
  baseURL: import.meta.env.VITE_API_URL || '/api',
  withCredentials: true, // This is important for sending cookies
  headers: {
    'Content-Type': 'application/json',
    'Accept': 'application/json',
  },
});

// Request interceptor to add auth token if it exists
client.interceptors.request.use(
  (config) => {
    // You can add auth token here if needed
    // const token = localStorage.getItem('token');
    // if (token) {
    //   config.headers.Authorization = `Bearer ${token}`;
    // }
    return config;
  },
  (error) => {
    return Promise.reject(error);
  }
);

// Response interceptor for handling errors
client.interceptors.response.use(
  (response) => response,
  (error: AxiosError) => {
    // Handle 401 Unauthorized errors
    if (error.response?.status === 401) {
      // Handle unauthorized access (e.g., redirect to login)
      console.error('Unauthorized access - please log in');
      // You can redirect to login page here if needed
      // window.location.href = '/login';
    }
    return Promise.reject(error);
  }
);
