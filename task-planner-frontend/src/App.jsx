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
import StudentProfilePage from './pages/StudentProfilePage';
import UserManagementPage from './pages/UserManagementPage';
import { ToastContainer } from 'react-toastify';
import 'react-toastify/dist/ReactToastify.css';
import GroupsProfilePage from './pages/GroupsProfilePage';

const App = () => {
    const [isAuthenticated, setIsAuthenticated] = useState(false);
    const [userName, setUserName] = useState('');
    const [profilePic, setProfilePic] = useState('');
    const [userRole, setUserRole] = useState('');
    const [userId, setUserId] = useState('');

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
            console.log(data);
            setUserData({
                userId: data._id,
                userName: data.fullname,
                profilePic: data.urlPhoto || 'https://via.placeholder.com/40',
                userRole: data.role || 'none',
            });
        } catch (error) {
            console.error('Ошибка загрузки данных пользователя:', error);
            setIsAuthenticated(false);
        }
    };

    const setUserData = ({ userName, profilePic, userRole, userId }) => {
        setUserId(userId);
        setUserName(userName);
        setProfilePic(profilePic);
        setUserRole(userRole);
    };

    const handleLogout = () => {
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
                console.log(userId);
                console.log(userRole);
            } catch (error) {
                console.error('Ошибка получения данных пользователя:', error);
                setIsAuthenticated(false);
            }
        };
        console.log(userRole);
        fetchUser();
    }, []);

    return (
        <Router>
            <ToastContainer />
            <div className="app-wrapper">
                <Header
                    username={isAuthenticated ? userName : null}
                    profilePic={isAuthenticated ? profilePic : null}
                    onLogout={handleLogout} // Передаем функцию выхода
                />

                {isAuthenticated ? (
                    <div className="app-container">
                        <SideBar role={userRole} />
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
                                <Route
                                    path="/tasks"
                                    element={
                                        <TasksPage
                                            teacherId={userId}
                                            role={userRole}
                                        />
                                    }
                                />
                                <Route
                                    path="/groups"
                                    element={<GroupsPage />}
                                />
                                <Route
                                    path="/groups/:id"
                                    element={
                                        <GroupsProfilePage role={userRole} />
                                    }
                                />
                                <Route
                                    path="/students/:id"
                                    element={<StudentProfilePage />}
                                />
                                <Route
                                    path="/add-user"
                                    element={<UserManagementPage />}
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
