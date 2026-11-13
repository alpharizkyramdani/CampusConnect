import axios from 'axios';

export const getApiBaseURL = (): string => {
  if (typeof window !== 'undefined') {
    const custom = localStorage.getItem('campusconnect_api_url');
    if (custom && custom.trim()) return custom.trim();

    const envUrl = import.meta.env.VITE_API_BASE_URL || import.meta.env.VITE_API_URL;
    if (envUrl && envUrl.trim() && !envUrl.includes('localhost') && !envUrl.includes('127.0.0.1')) {
      return envUrl.trim();
    }

    // If running on a public domain (like Vercel) and no remote env is baked,
    // automatically fallback to the active live Cloudflare tunnel
    if (!window.location.hostname.includes('localhost') && !window.location.hostname.includes('127.0.0.1')) {
      return 'https://champion-architecture-comparing-nevada.trycloudflare.com/api/v1';
    }
  }

  return import.meta.env.VITE_API_BASE_URL || import.meta.env.VITE_API_URL || 'http://localhost:8000/api/v1';
};

const api = axios.create({
  baseURL: getApiBaseURL(),
  headers: {
    'Content-Type': 'application/json',
    'Accept': 'application/json',
  },
});

api.interceptors.request.use((config) => {
  const token = localStorage.getItem('campusconnect_token');
  if (token) {
    config.headers.Authorization = `Bearer ${token}`;
  }
  return config;
});

api.interceptors.response.use(
  (response) => response,
  (error) => {
    if (error.response?.status === 401) {
      // Optional auto-logout on unauthorized
      // localStorage.removeItem('campusconnect_token');
    }
    return Promise.reject(error);
  }
);

export default api;

