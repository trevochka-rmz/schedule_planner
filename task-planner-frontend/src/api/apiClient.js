import axios from 'axios';

const API = axios.create({
    baseURL: 'http://localhost:5000/api', // Базовый URL API
    withCredentials: true, // Для работы с куками/токенами
});

// Добавляем токен в заголовок (если требуется)
API.interceptors.request.use((config) => {
    const token = localStorage.getItem('token');
    if (token) {
        config.headers.Authorization = `Bearer ${token}`;
    }
    return config;
});

export default API;
