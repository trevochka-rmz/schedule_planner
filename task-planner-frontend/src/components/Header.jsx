import React from 'react';
import './Header.css';

const Header = ({ username, profilePic, onLogout }) => {
    // if (!username) {
    //     return null; // Показываем пустую шапку, пока данные не загружены
    // }
    return (
        <header className="header">
            {/* Логотип и название */}
            <div className="header-logo">
                <span className="logo-icon">📚</span>
                <span className="logo-text">Мой Планер</span>
            </div>

            {/* Профиль пользователя */}
            {username ? (
                <div className="header-profile">
                    <img
                        src={profilePic || 'https://via.placeholder.com/40'} // Стандартная заглушка, если фото нет
                        alt="Фото профиля"
                        className="profile-pic-header"
                    />
                    <span className="profile-name">{username || 'Гость'}</span>
                    <button className="logout-button" onClick={onLogout}>
                        Выйти
                    </button>
                </div>
            ) : null}
        </header>
    );
};

export default Header;
