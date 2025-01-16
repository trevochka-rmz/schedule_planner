import React, { useState, useEffect } from 'react';
import {
    BrowserRouter as Router,
    Routes,
    Route,
    Navigate,
} from 'react-router-dom';
import Header from './components/Header';
import SideBar from './components/SideBar';
import ProfilePage from './pages/ProfilePage';
import StudentsPage from './pages/StudentsPage';
import SchedulePage from './pages/SchedulePage';
import TasksPage from './pages/TasksPage';
import GroupsPage from './pages/GroupsPage';
import LoginPage from './pages/LoginPage';
import axios from 'axios';
import './App.css';

const App = () => {
    const [isAuthenticated, setIsAuthenticated] = useState(false);
    const [userName, setUserName] = useState('');
    const [profilePic, setProfilePic] = useState('');

    useEffect(() => {
        const token = localStorage.getItem('token');
        if (token) {
            setIsAuthenticated(true);
            fetchUserData();
        }
    }, [isAuthenticated]);

    const fetchUserData = async () => {
        try {
            const { data } = await axios.get(
                `http://localhost:5000/api/users/profile`,
                {
                    headers: {
                        Authorization: `Bearer ${localStorage.getItem(
                            'token'
                        )}`,
                    },
                }
            );
            setUserData({
                userName: data.fullname,
                profilePic: data.urlPhoto || 'https://via.placeholder.com/40',
            });
        } catch (error) {
            console.error('Ошибка загрузки данных пользователя:', error);
            setIsAuthenticated(false);
        }
    };

    const setUserData = ({ userName, profilePic }) => {
        setUserName(userName);
        setProfilePic(profilePic);
    };

    const handleLogout = () => {
        // Удаляем токен и сбрасываем состояние
        localStorage.removeItem('token');
        setIsAuthenticated(false);
        setUserName('');
        setProfilePic('');
    };

    useEffect(() => {
        const fetchUser = async () => {
            const token = localStorage.getItem('token');
            if (!token) {
                setIsAuthenticated(false);
                return;
            }

            try {
                const config = {
                    headers: {
                        Authorization: `Bearer ${token}`,
                    },
                };

                // Получение информации о пользователе
                const { data } = await axios.get(
                    `http://localhost:5000/api/users/profile`,
                    config
                );

                setUserName(`${data.fullname}`);
                setProfilePic(
                    data.urlPhoto || 'https://via.placeholder.com/40'
                );
                setIsAuthenticated(true);
            } catch (error) {
                console.error('Ошибка получения данных пользователя:', error);
                setIsAuthenticated(false);
            }
        };

        fetchUser();
    }, []);

    return (
        <Router>
            <div className="app-wrapper">
                <Header
                    username={isAuthenticated ? userName : null}
                    profilePic={isAuthenticated ? profilePic : null}
                    onLogout={handleLogout} // Передаем функцию выхода
                />

                {isAuthenticated ? (
                    <div className="app-container">
                        <SideBar />
                        <div className="content">
                            <Routes>
                                <Route
                                    path="/profile"
                                    element={<ProfilePage />}
                                />
                                <Route
                                    path="/students"
                                    element={<StudentsPage />}
                                />
                                <Route
                                    path="/schedule"
                                    element={<SchedulePage />}
                                />
                                <Route path="/tasks" element={<TasksPage />} />
                                <Route
                                    path="/groups"
                                    element={<GroupsPage />}
                                />
                                <Route
                                    path="*"
                                    element={<Navigate to="/profile" />}
                                />
                            </Routes>
                        </div>
                    </div>
                ) : (
                    <Routes>
                        <Route
                            path="/login"
                            element={
                                <LoginPage
                                    setAuth={setIsAuthenticated}
                                    setUserData={setUserData}
                                />
                            }
                        />
                        <Route path="*" element={<Navigate to="/login" />} />
                    </Routes>
                )}
            </div>
        </Router>
    );
};

export default App;
