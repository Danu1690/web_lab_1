import React from 'react';
import { useNavigate } from 'react-router-dom';
import { useAuth } from '../context/AuthContext';

const Profile = () => {
  const navigate = useNavigate();
  const { user, logout } = useAuth();

  const handleLogout = () => {
    logout();
    navigate('/login', { replace: true });
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

  const getGenderText = (gender) => {
    return gender === 'male' ? 'Мужской' : 'Женский';
  };

  const getAgeGroupText = (ageGroup) => {
    return ageGroup === 'over18' ? '18 лет или больше' : 'Меньше 18 лет';
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
          {/* Приветствие */}
          <div className="welcome-section">
            <h2>Добро пожаловать, {user.first_name} {user.last_name}! 👋</h2>
            <p>Рады видеть вас в вашем личном кабинете</p>
          </div>

          {/* Основная информация */}
          <div className="user-card">
            <div className="user-avatar">
              {user.first_name ? user.first_name.charAt(0).toUpperCase() : 'U'}
            </div>
            <div className="user-info">
              <h3>Основная информация</h3>
              <div className="info-grid">
                <div className="info-item">
                  <span className="info-label">Имя:</span>
                  <span className="info-value">{user.first_name}</span>
                </div>
                <div className="info-item">
                  <span className="info-label">Фамилия:</span>
                  <span className="info-value">{user.last_name}</span>
                </div>
                <div className="info-item">
                  <span className="info-label">Email:</span>
                  <span className="info-value">{user.email}</span>
                </div>
                <div className="info-item">
                  <span className="info-label">Логин:</span>
                  <span className="info-value">{user.login}</span>
                </div>
                <div className="info-item">
                  <span className="info-label">Пол:</span>
                  <span className="info-value">{getGenderText(user.gender)}</span>
                </div>
                <div className="info-item">
                  <span className="info-label">Возраст:</span>
                  <span className="info-value">{getAgeGroupText(user.age_group)}</span>
                </div>
                <div className="info-item">
                  <span className="info-label">ID:</span>
                  <span className="info-value">{user.id}</span>
                </div>
                {user.created_at && (
                  <div className="info-item">
                    <span className="info-label">Зарегистрирован:</span>
                    <span className="info-value">{formatDate(user.created_at)}</span>
                  </div>
                )}
              </div>
            </div>
          </div>

          {/* Настройки */}
          <div className="settings-section">
            <h3>Настройки</h3>
            <div className="settings-grid">
              <div className="setting-item">
                <span>Текущая тема:</span>
                <span className="setting-value">
                  {/* Тема теперь управляется из навбара */}
                  {document.documentElement.getAttribute('data-theme') === 'dark' ? 'Тёмная' : 'Светлая'}
                </span>
              </div>
              <div className="setting-item">
                <span>Статус аккаунта:</span>
                <span className="setting-value active">Активен</span>
              </div>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
};

export default Profile;