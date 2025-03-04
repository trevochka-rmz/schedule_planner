import React, { useState } from 'react';
import { useNavigate } from 'react-router-dom';
import axios from 'axios';
import './LoginPage.css';

const LoginPage = ({ setAuth, setUserData }) => {
    const [identifier, setIdentifier] = useState('');
    const [password, setPassword] = useState('');
    const [error, setError] = useState('');
    const [message, setMessage] = useState('');
    const [isResettingPassword, setIsResettingPassword] = useState(false);
    const navigate = useNavigate();

    const handleLogin = async (e) => {
        e.preventDefault();
        try {
            const { data } = await axios.post(
                `http://localhost:5000/api/users/login`,
                { identifier, password }
            );
            localStorage.setItem('token', data.token);
            setAuth(true);
            setUserData({
                userName: `${data.user.fullname}`,
                profilePic:
                    data.user.urlPhoto || 'https://via.placeholder.com/40',
            });
            navigate('/profile');
        } catch (err) {
            setError(err.response?.data?.message || 'Ошибка авторизации');
        }
    };

    const handlePasswordReset = async (e) => {
        e.preventDefault();
        try {
            const { data } = await axios.post(
                `http://localhost:5000/api/users/reset-password`,
                { email: identifier } // Для сброса пароля по email
            );
            setMessage(data.message);
            setError('');
        } catch (err) {
            setError(err.response?.data?.message || 'Ошибка сброса пароля');
            setMessage('');
        }
    };

    return (
        <div className="login-page">
            <div className="login-container">
                <h2>
                    {isResettingPassword
                        ? 'Сброс пароля'
                        : 'Вход в личный кабинет'}
                </h2>
                {error && <p className="error">{error}</p>}
                {message && <p className="success">{message}</p>}

                {isResettingPassword ? (
                    <form onSubmit={handlePasswordReset}>
                        <input
                            type="email"
                            placeholder="Введите ваш email"
                            value={identifier}
                            onChange={(e) => setIdentifier(e.target.value)}
                            required
                        />
                        <button className="reset-button" type="submit">
                            Сбросить пароль
                        </button>
                        <button
                            type="button"
                            onClick={() => setIsResettingPassword(false)}
                        >
                            Назад
                        </button>
                    </form>
                ) : (
                    <form onSubmit={handleLogin}>
                        <input
                            type="text" // Меняем тип на text для поддержки email и логина
                            placeholder="Введите email или логин"
                            value={identifier}
                            onChange={(e) => setIdentifier(e.target.value)}
                            required
                        />
                        <input
                            type="password"
                            placeholder="Введите пароль"
                            value={password}
                            onChange={(e) => setPassword(e.target.value)}
                            required
                        />
                        <button type="submit">Войти</button>
                        <p
                            className="forgot-password"
                            onClick={() => setIsResettingPassword(true)}
                        >
                            Забыли пароль?
                        </p>
                    </form>
                )}
            </div>
        </div>
    );
};

export default LoginPage;
