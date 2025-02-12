import React, { useState, useEffect } from 'react';
import { NavLink } from 'react-router-dom';
import { Menu, X } from 'lucide-react';
import './SideBar.css';

const Sidebar = ({ role }) => {
    const [isOpen, setIsOpen] = useState(window.innerWidth > 768);
    const [isMobile, setIsMobile] = useState(window.innerWidth < 768);

    // Обработчик изменения размера окна
    useEffect(() => {
        const handleResize = () => {
            const isSmallScreen = window.innerWidth < 768;
            setIsMobile(isSmallScreen);
            setIsOpen(!isSmallScreen); // Открыть панель на больших экранах
        };

        window.addEventListener('resize', handleResize);

        // Установить начальное состояние при монтировании
        handleResize();

        return () => window.removeEventListener('resize', handleResize);
    }, []);

    return (
        <>
            {/* Кнопка меню (только на мобильных) */}
            {isMobile && (
                <button className="menu-btn" onClick={() => setIsOpen(!isOpen)}>
                    {isOpen ? <X size={24} /> : <Menu size={24} />}
                </button>
            )}

            {/* Sidebar с динамическим классом */}
            <div className={`sidebar ${isOpen ? '' : 'hidden'}`}>
                <nav className="sidebar-nav">
                    <NavLink to="/profile" className="sidebar-link">
                        Профиль
                    </NavLink>
                    <NavLink to="/students" className="sidebar-link">
                        Ученики
                    </NavLink>
                    <NavLink to="/schedule" className="sidebar-link">
                        Расписание
                    </NavLink>
                    <NavLink to="/tasks" className="sidebar-link">
                        Задачи
                    </NavLink>
                    <NavLink to="/groups" className="sidebar-link">
                        Группы
                    </NavLink>
                    {(role === 'admin' || role === 'manager') && (
                        <NavLink to="/add-user" className="sidebar-link">
                            Пользователи
                        </NavLink>
                    )}
                </nav>
            </div>

            {/* Затемненный фон при открытом Sidebar */}
            {isOpen && isMobile && (
                <div
                    className="overlay active"
                    onClick={() => setIsOpen(false)}
                />
            )}
        </>
    );
};

export default Sidebar;
