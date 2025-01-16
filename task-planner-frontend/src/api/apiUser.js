import axios from 'axios';

const API_BASE_URL = 'http://localhost:5000/api';

// Установка токена для авторизации
export const getAuthConfig = () => {
    const token = localStorage.getItem('token'); // Или где у вас хранится токен
    if (!token) {
        console.error('Токен отсутствует!');
    }
    return {
        headers: {
            Authorization: `Bearer ${token}`,
        },
    };
};

// Запросы к API
export const getUserProfile = async () => {
    return axios.get(`${API_BASE_URL}/users/profile`, getAuthConfig());
};

export const updateUserProfile = async (data) => {
    return axios.put(`${API_BASE_URL}/users/profile`, data, getAuthConfig());
};

export const uploadUserPhoto = async (file) => {
    const formData = new FormData();
    formData.append('photo', file);

    const authConfig = getAuthConfig(); // Получаем заголовки авторизации
    console.log('Заголовки авторизации:', authConfig);

    return axios.post(`${API_BASE_URL}/users/profile/photo`, formData, {
        ...authConfig,
        headers: {
            ...authConfig.headers,
            'Content-Type': 'multipart/form-data',
        },
    });
};

export const changeUserPassword = async (currentPassword, newPassword) => {
    if (!currentPassword || !newPassword) {
        throw new Error('Текущий и новый пароли обязательны.');
    }

    const response = await axios.post(
        `${API_BASE_URL}/users/change-password`,
        { oldPassword: currentPassword, newPassword },
        getAuthConfig()
    );

    return response;
};
