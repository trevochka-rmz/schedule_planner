import React from 'react';
import { NavLink } from 'react-router-dom'; // Для навигации между страницами
import './SideBar.css'; // Подключим стили

const Sidebar = () => {
    return (
        <div className="sidebar">
            <h2 className="sidebar-logo">Лого</h2>
            <nav className="sidebar-nav">
                <NavLink
                    to="/profile"
                    className={({ isActive }) =>
                        isActive ? 'sidebar-link active' : 'sidebar-link'
                    }
                >
                    Профиль
                </NavLink>
                <NavLink
                    to="/students"
                    className={({ isActive }) =>
                        isActive ? 'sidebar-link active' : 'sidebar-link'
                    }
                >
                    Ученики
                </NavLink>
                <NavLink
                    to="/schedule"
                    className={({ isActive }) =>
                        isActive ? 'sidebar-link active' : 'sidebar-link'
                    }
                >
                    Расписание
                </NavLink>
                <NavLink
                    to="/tasks"
                    className={({ isActive }) =>
                        isActive ? 'sidebar-link active' : 'sidebar-link'
                    }
                >
                    Задачи
                </NavLink>
                <NavLink
                    to="/groups"
                    className={({ isActive }) =>
                        isActive ? 'sidebar-link active' : 'sidebar-link'
                    }
                >
                    Группы
                </NavLink>
            </nav>
        </div>
    );
};

export default Sidebar;
