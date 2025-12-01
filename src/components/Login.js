import React, { useState, useContext } from 'react';
import { useNavigate, Link } from 'react-router-dom';
import { useAuth } from '../context/AuthContext';
import { useTheme } from '../context/ThemeContext';
import axios from 'axios';

const Login = () => {
  const [login, setLogin] = useState('');
  const [password, setPassword] = useState('');
  const [error, setError] = useState('');
  const [loading, setLoading] = useState(false);
  const navigate = useNavigate();
  const { login: authLogin } = useAuth();
  const { isDarkTheme } = useTheme();

  const handleSubmit = async (e) => {
    e.preventDefault();
    
    if (!login || !password) {
      setError('Заполните все поля');
      return;
    }

    setLoading(true);
    setError('');

    try {
      const response = await axios.post('http://localhost/auth-api/login.php', {
        login: login,
        password: password
      });

      if (response.data.success) {
        authLogin(response.data.access_token, response.data.user);
        navigate('/profile');
      } else {
        setError(response.data.message || 'Ошибка');
      }
    } catch (error) {
      setError('Ошибка сервера');
    } finally {
      setLoading(false);
    }
  };

  // Стили для темной и светлой темы
  const containerStyle = {
    maxWidth: '400px',
    margin: '50px auto',
    padding: '20px'
  };

  const formStyle = {
    padding: '30px',
    borderRadius: '8px',
    boxShadow: '0 2px 10px rgba(0, 0, 0, 0.1)',
    backgroundColor: isDarkTheme ? '#2d3748' : 'white',
    color: isDarkTheme ? 'white' : '#333'
  };

  const inputStyle = {
    width: '100%',
    padding: '12px',
    borderRadius: '4px',
    fontSize: '16px',
    boxSizing: 'border-box',
    backgroundColor: isDarkTheme ? '#4a5568' : 'white',
    color: isDarkTheme ? 'white' : '#333',
    border: isDarkTheme ? '2px solid #718096' : '2px solid #ddd'
  };

  const buttonStyle = {
    width: '100%',
    padding: '12px',
    border: 'none',
    borderRadius: '4px',
    fontSize: '16px',
    cursor: loading ? 'not-allowed' : 'pointer',
    backgroundColor: loading ? '#ccc' : (isDarkTheme ? '#4299e1' : '#007bff'),
    color: 'white'
  };

  const errorStyle = {
    padding: '12px',
    borderRadius: '4px',
    marginBottom: '20px',
    borderLeft: '4px solid #c62828',
    backgroundColor: isDarkTheme ? '#742a2a' : '#ffebee',
    color: isDarkTheme ? '#fca5a5' : '#c62828'
  };

  const linkStyle = {
    color: isDarkTheme ? '#63b3ed' : '#007bff'
  };

  return (
    <div style={containerStyle}>
      <div style={formStyle}>
        <h2>Вход в систему</h2>
        
        {error && (
          <div style={errorStyle}>
            <strong>Ошибка:</strong> {error}
          </div>
        )}
        
        <form onSubmit={handleSubmit}>
          <div style={{ marginBottom: '20px' }}>
            <label style={{ display: 'block', marginBottom: '5px', fontWeight: 'bold' }}>
              Логин:
            </label>
            <input
              type="text"
              value={login}
              onChange={(e) => setLogin(e.target.value)}
              disabled={loading}
              placeholder="Введите ваш логин"
              style={inputStyle}
            />
          </div>
          
          <div style={{ marginBottom: '20px' }}>
            <label style={{ display: 'block', marginBottom: '5px', fontWeight: 'bold' }}>
              Пароль:
            </label>
            <input
              type="password"
              value={password}
              onChange={(e) => setPassword(e.target.value)}
              disabled={loading}
              placeholder="Введите ваш пароль"
              style={inputStyle}
            />
          </div>
          
          <button 
            type="submit"
            disabled={loading}
            style={buttonStyle}
          >
            {loading ? 'Вход...' : 'Войти'}
          </button>
        </form>
        
        <p style={{ marginTop: '20px', textAlign: 'center' }}>
          Нет аккаунта? <Link to="/register" style={linkStyle}>Зарегистрируйтесь</Link>
        </p>
      </div>
    </div>
  );
};

export default Login;