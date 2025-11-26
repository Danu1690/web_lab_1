import React from 'react';
import { useNavigate } from 'react-router-dom';
import { useAuth } from '../context/AuthContext';

const Profile = () => {
  const navigate = useNavigate();
  const { user, logout } = useAuth();

  const handleLogout = () => {
    logout(); // ✅ Используем Context для выхода
    navigate('/login', { replace: true }); // ✅ Немедленный переход
  };

  const formatDate = (dateString) => {
    return new Date(dateString).toLocaleDateString('ru-RU', {
      year: 'numeric',
      month: 'long',
      day: 'numeric',
      hour: '2-digit',
      minute: '2-digit'
    });
  };

  if (!user) {
    return (
      <div className="profile">
        <div className="loading">Загрузка профиля...</div>
      </div>
    );
  }

  return (
    <div className="profile">
      <div className="profile-container">
        <div className="profile-header">
          <h1>Личный кабинет</h1>
          <button onClick={handleLogout} className="logout-btn">
            Выйти
          </button>
        </div>

        <div className="profile-content">
          <div className="user-card">
            <div className="user-avatar">
              {user.username ? user.username.charAt(0).toUpperCase() : 'U'}
            </div>
            <div className="user-info">
              <h2>{user.username || 'Пользователь'}</h2>
              <p className="user-email">{user.email}</p>
              <p className="user-id">ID: {user.id}</p>
              {user.created_at && (
                <p className="user-join-date">
                  Зарегистрирован: {formatDate(user.created_at)}
                </p>
              )}
            </div>
          </div>

          <div className="profile-stats">
            <div className="stat-card">
              <h3>Статистика</h3>
              <div className="stats-grid">
                <div className="stat-item">
                  <span className="stat-number">0</span>
                  <span className="stat-label">Задач</span>
                </div>
                <div className="stat-item">
                  <span className="stat-number">0</span>
                  <span className="stat-label">Проектов</span>
                </div>
                <div className="stat-item">
                  <span className="stat-number">0</span>
                  <span className="stat-label">Друзей</span>
                </div>
              </div>
            </div>
          </div>

          <div className="quick-actions">
            <h3>Быстрые действия</h3>
            <div className="actions-grid">
              <button className="action-btn" disabled>
                📝 Создать задачу
              </button>
              <button className="action-btn" disabled>
                👥 Найти друзей
              </button>
              <button className="action-btn" disabled>
                ⚙️ Настройки
              </button>
              <button className="action-btn" disabled>
                📊 Аналитика
              </button>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
};

export default Profile;