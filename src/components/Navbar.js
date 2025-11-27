import React from 'react';
import { Link, useNavigate } from 'react-router-dom';
import { useAuth } from '../context/AuthContext';
import { useTheme } from '../context/ThemeContext';

const Navbar = () => {
  const navigate = useNavigate();
  const { isAuthenticated, user, logout } = useAuth();
  const { isDarkTheme, toggleTheme } = useTheme();

  const handleLogout = () => {
    logout();
    navigate('/login', { replace: true });
  };

  const handleThemeToggle = () => {
    toggleTheme();
  };

  return (
    <nav className="navbar">
      <div className="nav-container">
        <Link to="/" className="nav-logo">
          MyApp
        </Link>
        <div className="nav-links">
          {isAuthenticated ? (
            <>
              <span className="nav-welcome">
                Привет, {user?.username || user?.first_name || 'Пользователь'}!
              </span>
              <button 
                onClick={handleThemeToggle} 
                className="theme-toggle-btn nav-theme-toggle"
              >
                {isDarkTheme ? '☀️ Светлая' : '🌙 Тёмная'}
              </button>
              <button onClick={handleLogout} className="nav-button">
                Выйти
              </button>
            </>
          ) : (
            <>
              <Link to="/login">Вход</Link>
              <Link to="/register">Регистрация</Link>
              <button 
                onClick={handleThemeToggle} 
                className="theme-toggle-btn nav-theme-toggle"
              >
                {isDarkTheme ? '☀️ Светлая' : '🌙 Тёмная'}
              </button>
            </>
          )}
        </div>
      </div>
    </nav>
  );
};

export default Navbar;