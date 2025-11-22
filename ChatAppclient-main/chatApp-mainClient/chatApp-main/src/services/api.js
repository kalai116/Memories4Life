import axios from 'axios';

// ⚙️ Change this to your actual backend URL
const BASE_URL = 'http://192.168.0.107:8080'; 

const api = axios.create({
  baseURL: BASE_URL,
  headers: {
    'Content-Type': 'application/json',
  },
});

export default api;
