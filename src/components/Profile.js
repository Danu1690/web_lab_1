import React, { useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import { useAuth } from '../context/AuthContext';
import axios from 'axios';

const Profile = () => {
  const navigate = useNavigate();
  const { user, logout } = useAuth();
  const [activeTab, setActiveTab] = useState('profile'); // 'profile' или 'users'
  const [allUsers, setAllUsers] = useState([]);
  const [loadingUsers, setLoadingUsers] = useState(false);
  const [usersError, setUsersError] = useState('');


  const API_BASE = 'http://localhost/auth-api';

  const handleLogout = () => {
    logout();
    navigate('/login', { replace: true });
  };

  // Загрузка списка пользователей
  const loadAllUsers = async () => {
    setLoadingUsers(true);
    setUsersError('');
    try {
      const response = await axios.get(`http://localhost/auth-api/get-users.php`);
      if (response.data.success) {
        setAllUsers(response.data.users);
      }
    } catch (error) {
      console.error('Error loading users:', error);
      setUsersError('Не удалось загрузить список пользователей');
    } finally {
      setLoadingUsers(false);
    }
  };

  // Автоматически загружаем пользователей при переходе на вкладку
  useEffect(() => {
    if (activeTab === 'users') {
      loadAllUsers();
    }
  }, [activeTab]);

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

        {/* Навигация по табам */}
        <div className="tabs-navigation">
          <button 
            className={`tab-btn ${activeTab === 'profile' ? 'active' : ''}`}
            onClick={() => setActiveTab('profile')}
          >
            👤 Мой профиль
          </button>
          <button 
            className={`tab-btn ${activeTab === 'users' ? 'active' : ''}`}
            onClick={() => setActiveTab('users')}
          >
            👥 Все пользователи
          </button>
        </div>

        <div className="profile-content">
          {activeTab === 'profile' ? (
            /* Вкладка личного профиля */
            <>
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
            </>
          ) : (
            /* Вкладка всех пользователей */
            <div className="users-section">
              <div className="section-header">
                <h2>👥 Все пользователи системы</h2>
                <p>Всего зарегистрировано: {allUsers.length} пользователей</p>
              </div>

              {loadingUsers ? (
                <div className="loading">Загрузка пользователей...</div>
              ) : usersError ? (
                <div className="error-message">
                  {usersError}
                  <button onClick={loadAllUsers} className="retry-btn">
                    Повторить
                  </button>
                </div>
              ) : (
                <div className="users-grid">
                  {allUsers.map(userItem => (
                    <div key={userItem.id} className="user-card">
                      <div className="user-avatar-small">
                        {userItem.first_name ? userItem.first_name.charAt(0).toUpperCase() : 'U'}
                      </div>
                      <div className="user-details">
                        <h4>{userItem.first_name} {userItem.last_name}</h4>
                        <div className="user-meta">
                          <span className="user-email">📧 {userItem.email}</span>
                          <span className="user-login">👤 {userItem.login}</span>
                          <span className="user-gender">{userItem.gender === 'male' ? 'Мужской' : 'Женский'}</span>
                          <span className="user-age">
                            {userItem.age_group === 'over18' ? '18+' : '<18'}
                          </span>
                          {userItem.created_at && (
                            <span className="user-registered">
                              📅 {formatDate(userItem.created_at)}
                            </span>
                          )}
                        </div>
                        {userItem.id === user.id && (
                          <span className="current-user-badge">Это вы</span>
                        )}
                      </div>
                    </div>
                  ))}
                </div>
              )}
            </div>
          )}
        </div>
      </div>
    </div>
  );
};

export default Profile;