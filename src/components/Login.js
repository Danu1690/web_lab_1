import React, { useState } from 'react';
import { useNavigate, Link } from 'react-router-dom';
import { useAuth } from '../context/AuthContext';
import axios from 'axios';

const Login = () => {
  const [formData, setFormData] = useState({
    login: '',
    password: ''
  });
  const [error, setError] = useState('');
  const [loading, setLoading] = useState(false);
  const navigate = useNavigate();
  const { login } = useAuth();

  const API_BASE = 'http://localhost/auth-api';

  const handleChange = (e) => {
    setFormData({
      ...formData,
      [e.target.name]: e.target.value
    });
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    setLoading(true);
    setError('');
    
    try {
      const response = await axios.post(`${API_BASE}/login.php`, formData, {
        headers: {
          'Content-Type': 'application/json',
        },
        timeout: 5000
      });
      
      if (response.data.success) {
        login(response.data.token, response.data.user);
        navigate('/profile', { replace: true });
      } else {
        setError(response.data.message || 'Ошибка входа');
      }
    } catch (error) {
      console.error('Login error:', error);
      setError('Ошибка входа. Проверьте логин и пароль.');
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="auth-container">
      <div className="auth-form">
        <h2>Вход в систему</h2>
        
        {error && (
          <div className="error-message">
            <strong>Ошибка:</strong> {error}
          </div>
        )}
        
        <form onSubmit={handleSubmit} autoComplete="off">
          <div className="form-group">
            <label>Логин:</label>
            <input
              type="text"
              name="login"
              value={formData.login}
              onChange={handleChange}
              required
              disabled={loading}
              placeholder="Введите ваш логин"
              autoComplete="off"
            />
          </div>
          
          <div className="form-group">
            <label>Пароль:</label>
            <input
              type="password"
              name="password"
              value={formData.password}
              onChange={handleChange}
              required
              disabled={loading}
              placeholder="Введите ваш пароль"
              autoComplete="new-password"
            />
          </div>
          
          <button 
            type="submit" 
            className="auth-button"
            disabled={loading}
          >
            {loading ? '⏳ Вход...' : '🚪 Войти'}
          </button>
        </form>
        
        <p style={{ marginTop: '20px', textAlign: 'center', fontSize: '14px' }}>
          Нет аккаунта? <Link to="/register">Зарегистрируйтесь</Link>
        </p>
      </div>
    </div>
  );
};

export default Login;