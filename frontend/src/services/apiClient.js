import axios from 'axios';

// Vite exposes env vars with import.meta.env
const API_BASE = import.meta.env.VITE_API_URL || 'http://localhost:3000/api';

const apiClient = axios.create({
    baseURL: API_BASE,
    timeout: 60000,
    headers: {
        'Content-Type': 'application/json'
    }
});

export default apiClient;