import React, { useState } from 'react';
import { useNavigate, Link } from 'react-router-dom';
import { useAuth } from '../context/AuthContext';
import axios from 'axios';

const Login = () => {
  const [formData, setFormData] = useState({
    email: '',
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
      console.log('🔄 Отправка запроса на:', `${API_BASE}/login.php`);
      
      const response = await axios.post(`${API_BASE}/login.php`, formData, {
        headers: {
          'Content-Type': 'application/json',
        },
        timeout: 5000
      });
      
      console.log('✅ Ответ сервера:', response.data);
      
      if (response.data.success) {
        // ✅ Используем Context для логина
        login(response.data.token, response.data.user);
        
        // ✅ Немедленный переход на профиль
        navigate('/profile', { replace: true });
      } else {
        setError(response.data.message || 'Ошибка входа');
      }
    } catch (error) {
      console.error('❌ Ошибка:', error);
      
      if (error.code === 'ERR_NETWORK') {
        setError('❌ Ошибка сети: Не удалось подключиться к серверу.');
      } else if (error.response) {
        setError(`❌ Ошибка сервера: ${error.response.status} - ${error.response.data?.message || 'Нет сообщения'}`);
      } else {
        setError('❌ Неизвестная ошибка: ' + error.message);
      }
    } finally {
      setLoading(false);
    }
  };

  const testConnection = async () => {
    try {
      console.log('🔍 Тестируем соединение с:', `${API_BASE}/test.php`);
      const response = await axios.get(`${API_BASE}/test.php`, {
        timeout: 5000
      });
      console.log('✅ Тест соединения успешен:', response.data);
      alert(`✅ Сервер работает!\n\nСообщение: ${response.data.message}\nВремя: ${response.data.timestamp}`);
    } catch (error) {
      console.error('❌ Тест соединения провален:', error);
      
      if (error.code === 'ERR_NETWORK') {
        alert('❌ Не удалось подключиться к серверу!\n\nПроверьте:\n1. XAMPP запущен (Apache и MySQL)\n2. Файлы находятся в C:\\xampp\\htdocs\\auth-api\\\n3. Браузер открывает http://localhost/auth-api/test.php');
      } else {
        alert('❌ Ошибка: ' + error.message);
      }
    }
  };

  const directBrowserTest = () => {
    // Открывает тестовый URL в новой вкладке
    window.open(`${API_BASE}/test.php`, '_blank');
  };

  const checkXAMPP = () => {
    window.open('http://localhost', '_blank');
  };

  return (
    <div className="auth-container">
      <div className="auth-form">
        <h2>Вход в систему</h2>
        
        <div style={{ display: 'flex', flexDirection: 'column', gap: '10px', marginBottom: '20px' }}>
          <button 
            type="button" 
            onClick={testConnection}
            style={{
              padding: '12px', 
              background: '#28a745',
              color: 'white',
              border: 'none',
              borderRadius: '4px',
              cursor: 'pointer',
              fontSize: '14px'
            }}
          >
            🔍 Тест соединения с сервером
          </button>
          
          <button 
            type="button" 
            onClick={directBrowserTest}
            style={{
              padding: '12px', 
              background: '#17a2b8',
              color: 'white',
              border: 'none',
              borderRadius: '4px',
              cursor: 'pointer',
              fontSize: '14px'
            }}
          >
            🌐 Открыть test.php в браузере
          </button>
          
          <button 
            type="button" 
            onClick={checkXAMPP}
            style={{
              padding: '12px', 
              background: '#6c757d',
              color: 'white',
              border: 'none',
              borderRadius: '4px',
              cursor: 'pointer',
              fontSize: '14px'
            }}
          >
            ⚙️ Проверить XAMPP
          </button>
        </div>
        
        {error && (
          <div style={{
            background: '#f8d7da',
            color: '#721c24',
            padding: '12px',
            borderRadius: '4px',
            marginBottom: '15px',
            border: '1px solid #f5c6cb',
            fontSize: '14px'
          }}>
            <strong>Ошибка:</strong> {error}
          </div>
        )}
        
        <form onSubmit={handleSubmit}>
          <div className="form-group">
            <label>Email:</label>
            <input
              type="email"
              name="email"
              value={formData.email}
              onChange={handleChange}
              required
              disabled={loading}
              placeholder="test@example.com"
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
              placeholder="password"
            />
          </div>
          <button 
            type="submit" 
            className="auth-button"
            disabled={loading}
            style={{
              background: loading ? '#6c757d' : '#007bff',
              cursor: loading ? 'not-allowed' : 'pointer'
            }}
          >
            {loading ? '⏳ Вход...' : '🚪 Войти'}
          </button>
        </form>
        
        <div style={{
          marginTop: '20px', 
          fontSize: '14px', 
          color: '#666',
          background: '#f8f9fa',
          padding: '15px',
          borderRadius: '4px',
          border: '1px solid #e9ecef'
        }}>
          <p style={{ margin: '0 0 10px 0', fontWeight: 'bold' }}>Тестовые данные:</p>
          <p style={{ margin: '5px 0' }}>📧 Email: <strong>test@example.com</strong></p>
          <p style={{ margin: '5px 0' }}>🔑 Password: <strong>password</strong></p>
        </div>
        
        <p style={{ marginTop: '20px', textAlign: 'center', fontSize: '14px' }}>
          Нет аккаунта? <Link to="/register">Зарегистрируйтесь</Link>
        </p>
      </div>
    </div>
  );
};

export default Login;