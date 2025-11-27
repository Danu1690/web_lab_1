import React, { useState, useEffect } from 'react';
import { useNavigate, Link } from 'react-router-dom';
import { useAuth } from '../context/AuthContext';
import axios from 'axios';

const Register = () => {
  const [formData, setFormData] = useState({
    first_name: '',
    last_name: '',
    email: '',
    login: '',
    password: '',
    confirmPassword: '',
    age_group: '',
    gender: '',
    agreed_to_terms: false,
    captcha_answer: ''
  });
  
  const [errors, setErrors] = useState({});
  const [loading, setLoading] = useState(false);
  const [showPassword, setShowPassword] = useState(false);
  const [showConfirmPassword, setShowConfirmPassword] = useState(false);
  const [captchaQuestion, setCaptchaQuestion] = useState('');
  const [captchaCorrectAnswer, setCaptchaCorrectAnswer] = useState(0);
  const navigate = useNavigate();
  const { login } = useAuth();

  const API_BASE = 'http://localhost/auth-api';

  // Генерация капчи при загрузке компонента
  useEffect(() => {
    generateCaptcha();
  }, []);

  // Функция генерации простой математической капчи
  const generateCaptcha = () => {
    const operators = ['+', '-', '*'];
    const operator = operators[Math.floor(Math.random() * operators.length)];
    let num1, num2, answer;

    switch (operator) {
      case '+':
        num1 = Math.floor(Math.random() * 10) + 1;
        num2 = Math.floor(Math.random() * 10) + 1;
        answer = num1 + num2;
        break;
      case '-':
        num1 = Math.floor(Math.random() * 10) + 10;
        num2 = Math.floor(Math.random() * 10) + 1;
        answer = num1 - num2;
        break;
      case '*':
        num1 = Math.floor(Math.random() * 5) + 1;
        num2 = Math.floor(Math.random() * 5) + 1;
        answer = num1 * num2;
        break;
      default:
        num1 = 1;
        num2 = 1;
        answer = 2;
    }

    setCaptchaQuestion(`${num1} ${operator} ${num2} = ?`);
    setCaptchaCorrectAnswer(answer);
    setFormData(prev => ({ ...prev, captcha_answer: '' }));
  };

  // Функции переключения видимости пароля
  const togglePasswordVisibility = (field) => {
    if (field === 'password') {
      setShowPassword(!showPassword);
    } else {
      setShowConfirmPassword(!showConfirmPassword);
    }
  };

  // Валидация полей
  const validateField = (name, value) => {
    const newErrors = { ...errors };
    
    switch (name) {
      case 'first_name':
      case 'last_name':
        if (!value.trim()) {
          newErrors[name] = 'Обязательное поле';
        } else if (!/^[A-Za-zА-Яа-яЁё\s-]{2,15}$/.test(value)) {
          newErrors[name] = 'Только буквы, дефисы и пробелы (2-15 символов)';
        } else {
          delete newErrors[name];
        }
        break;
        
      case 'email':
        if (!value.trim()) {
          newErrors[name] = 'Обязательное поле';
        } else if (!/^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(value)) {
          newErrors[name] = 'Неверный формат email';
        } else {
          delete newErrors[name];
        }
        break;
        
      case 'login':
        if (!value.trim()) {
          newErrors[name] = 'Обязательное поле';
        } else if (value.length < 6) {
          newErrors[name] = 'Логин должен быть не менее 6 символов';
        } else {
          delete newErrors[name];
        }
        break;
        
      case 'password':
        if (!value) {
          newErrors[name] = 'Обязательное поле';
        } else if (value.length < 8) {
          newErrors[name] = 'Пароль должен быть не менее 8 символов';
        } else {
          // Упрощенная проверка пароля
          const hasUpperCase = /[A-Z]/.test(value);
          const hasLowerCase = /[a-z]/.test(value);
          const hasNumbers = /\d/.test(value);
          const hasSpecialChar = /[!@#$%^&*()_+\-=\[\]{};':"\\|,.<>\/?]/.test(value);
          
          if (!hasUpperCase || !hasLowerCase || !hasNumbers || !hasSpecialChar) {
            newErrors[name] = 'Пароль должен содержать заглавные, строчные буквы, цифры и спецсимволы';
          } else {
            delete newErrors[name];
          }
        }
        break;
        
      case 'confirmPassword':
        if (value !== formData.password) {
          newErrors[name] = 'Пароли не совпадают';
        } else {
          delete newErrors[name];
        }
        break;

      case 'captcha_answer':
        if (!value.trim()) {
          newErrors[name] = 'Введите ответ';
        } else if (parseInt(value) !== captchaCorrectAnswer) {
          newErrors[name] = 'Неверный ответ';
        } else {
          delete newErrors[name];
        }
        break;
        
      case 'age_group':
        if (!value) {
          newErrors[name] = 'Выберите вариант';
        } else {
          delete newErrors[name];
        }
        break;
        
      case 'gender':
        if (!value) {
          newErrors[name] = 'Выберите пол';
        } else {
          delete newErrors[name];
        }
        break;
        
      case 'agreed_to_terms':
        if (!value) {
          newErrors[name] = 'Необходимо принять правила';
        } else {
          delete newErrors[name];
        }
        break;
        
      default:
        break;
    }
    
    setErrors(newErrors);
    return Object.keys(newErrors).length === 0;
  };

  const handleChange = (e) => {
    const { name, value, type, checked } = e.target;
    const fieldValue = type === 'checkbox' ? checked : value;
    
    setFormData(prev => ({
      ...prev,
      [name]: fieldValue
    }));
    
    // Валидация при изменении
    if (name !== 'agreed_to_terms') {
      validateField(name, fieldValue);
    }
  };

  const validateForm = () => {
    const newErrors = {};
    
    if (!formData.first_name.trim()) newErrors.first_name = 'Обязательное поле';
    if (!formData.last_name.trim()) newErrors.last_name = 'Обязательное поле';
    if (!formData.email.trim()) newErrors.email = 'Обязательное поле';
    if (!formData.login.trim()) newErrors.login = 'Обязательное поле';
    if (!formData.password) newErrors.password = 'Обязательное поле';
    if (!formData.confirmPassword) newErrors.confirmPassword = 'Обязательное поле';
    if (!formData.age_group) newErrors.age_group = 'Выберите вариант';
    if (!formData.gender) newErrors.gender = 'Выберите пол';
    if (!formData.agreed_to_terms) newErrors.agreed_to_terms = 'Необходимо принять правила';
    if (!formData.captcha_answer.trim()) newErrors.captcha_answer = 'Введите ответ на вопрос';
    
    // Детальная валидация
    validateField('first_name', formData.first_name);
    validateField('last_name', formData.last_name);
    validateField('email', formData.email);
    validateField('login', formData.login);
    validateField('password', formData.password);
    validateField('confirmPassword', formData.confirmPassword);
    validateField('captcha_answer', formData.captcha_answer);
    
    setErrors(newErrors);
    return Object.keys(newErrors).length === 0;
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    
    if (!validateForm()) {
      alert('Пожалуйста, исправьте ошибки в форме');
      return;
    }

    setLoading(true);

    try {
      const response = await axios.post(`${API_BASE}/register.php`, {
        ...formData,
        captcha_correct_answer: captchaCorrectAnswer
      });
      
      if (response.data.success) {
        login(response.data.token, response.data.user);
        navigate('/profile', { replace: true });
      } else {
        alert(response.data.message || 'Ошибка регистрации');
        generateCaptcha(); // Генерируем новую капчу при ошибке
      }
    } catch (error) {
      console.error('Registration error:', error);
      if (error.response?.data?.message) {
        alert(error.response.data.message);
      } else {
        alert('Ошибка при регистрации. Проверьте подключение к серверу.');
      }
      generateCaptcha(); // Генерируем новую капчу при ошибке
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="auth-container">
      <div className="auth-form">
        <h2>Регистрация</h2>
        
        <form onSubmit={handleSubmit} autoComplete="off">
          {/* Имя и Фамилия */}
          <div className="form-row">
            <div className="form-group">
              <label>Имя *</label>
              <input
                type="text"
                name="first_name"
                value={formData.first_name}
                onChange={handleChange}
                required
                disabled={loading}
                placeholder="Иван"
                autoComplete="off"
                className={errors.first_name ? 'error' : ''}
              />
              {errors.first_name && <span className="error-text">{errors.first_name}</span>}
            </div>
            
            <div className="form-group">
              <label>Фамилия *</label>
              <input
                type="text"
                name="last_name"
                value={formData.last_name}
                onChange={handleChange}
                required
                disabled={loading}
                placeholder="Иванов"
                autoComplete="off"
                className={errors.last_name ? 'error' : ''}
              />
              {errors.last_name && <span className="error-text">{errors.last_name}</span>}
            </div>
          </div>

          {/* Email */}
          <div className="form-group">
            <label>Email *</label>
            <input
              type="email"
              name="email"
              value={formData.email}
              onChange={handleChange}
              required
              disabled={loading}
              placeholder="ivan@example.com"
              autoComplete="off"
              className={errors.email ? 'error' : ''}
            />
            {errors.email && <span className="error-text">{errors.email}</span>}
          </div>

          {/* Логин */}
          <div className="form-group">
            <label>Логин *</label>
            <input
              type="text"
              name="login"
              value={formData.login}
              onChange={handleChange}
              required
              disabled={loading}
              placeholder="Не менее 6 символов"
              autoComplete="off"
              className={errors.login ? 'error' : ''}
            />
            {errors.login && <span className="error-text">{errors.login}</span>}
          </div>

          {/* Пароли */}
          <div className="form-row">
            <div className="form-group">
              <label>Пароль *</label>
              <div className="password-input-container">
                <input
                  type={showPassword ? "text" : "password"}
                  name="password"
                  value={formData.password}
                  onChange={handleChange}
                  required
                  disabled={loading}
                  placeholder="Не менее 8 символов"
                  autoComplete="new-password"
                  className={errors.password ? 'error' : ''}
                />
                <button 
                  type="button"
                  className="password-toggle"
                  onClick={() => togglePasswordVisibility('password')}
                >
                  {showPassword ? '👁️' : '👁️‍🗨️'}
                </button>
              </div>
              {errors.password && <span className="error-text">{errors.password}</span>}
            </div>
            
            <div className="form-group">
              <label>Подтверждение *</label>
              <div className="password-input-container">
                <input
                  type={showConfirmPassword ? "text" : "password"}
                  name="confirmPassword"
                  value={formData.confirmPassword}
                  onChange={handleChange}
                  required
                  disabled={loading}
                  placeholder="Повторите пароль"
                  autoComplete="new-password"
                  className={errors.confirmPassword ? 'error' : ''}
                />
                <button 
                  type="button"
                  className="password-toggle"
                  onClick={() => togglePasswordVisibility('confirmPassword')}
                >
                  {showConfirmPassword ? '👁️' : '👁️‍🗨️'}
                </button>
              </div>
              {errors.confirmPassword && <span className="error-text">{errors.confirmPassword}</span>}
            </div>
          </div>

          {/* Возраст */}
          <div className="form-group">
            <label>Возраст *</label>
            <select
              name="age_group"
              value={formData.age_group}
              onChange={handleChange}
              required
              disabled={loading}
              className={errors.age_group ? 'error' : ''}
            >
              <option value="">Выберите вариант</option>
              <option value="over18">Мне 18 лет или больше</option>
              <option value="under18">Мне меньше 18 лет</option>
            </select>
            {errors.age_group && <span className="error-text">{errors.age_group}</span>}
          </div>

          {/* Пол */}
          <div className="form-group">
            <label>Пол *</label>
            <div className="radio-group">
              <label className="radio-label">
                <input
                  type="radio"
                  name="gender"
                  value="male"
                  checked={formData.gender === 'male'}
                  onChange={handleChange}
                  disabled={loading}
                />
                Мужской
              </label>
              <label className="radio-label">
                <input
                  type="radio"
                  name="gender"
                  value="female"
                  checked={formData.gender === 'female'}
                  onChange={handleChange}
                  disabled={loading}
                />
                Женский
              </label>
            </div>
            {errors.gender && <span className="error-text">{errors.gender}</span>}
          </div>

          {/* Капча */}
          <div className="form-group">
            <label>Подтвердите что вы не робот *</label>
            <div className="captcha-container">
              <div className="captcha-question">
                <strong>{captchaQuestion}</strong>
                <button 
                  type="button" 
                  className="captcha-refresh"
                  onClick={generateCaptcha}
                  disabled={loading}
                >
                  🔄
                </button>
              </div>
              <input
                type="number"
                name="captcha_answer"
                value={formData.captcha_answer}
                onChange={handleChange}
                required
                disabled={loading}
                placeholder="Введите ответ"
                autoComplete="off"
                className={errors.captcha_answer ? 'error' : ''}
              />
              {errors.captcha_answer && <span className="error-text">{errors.captcha_answer}</span>}
            </div>
          </div>

          {/* Чекбокс */}
          <div className="form-group checkbox-group">
            <label className="checkbox-label">
              <input
                type="checkbox"
                name="agreed_to_terms"
                checked={formData.agreed_to_terms}
                onChange={handleChange}
                disabled={loading}
              />
              Принимаю правила использования сервиса *
            </label>
            {errors.agreed_to_terms && <span className="error-text">{errors.agreed_to_terms}</span>}
          </div>

          <button 
            type="submit" 
            className="auth-button"
            disabled={loading || Object.keys(errors).length > 0}
          >
            {loading ? '⏳ Регистрация...' : '📝 Зарегистрироваться'}
          </button>
        </form>
        
        <p style={{ marginTop: '20px', textAlign: 'center', fontSize: '14px' }}>
          Уже есть аккаунт? <Link to="/login">Войдите</Link>
        </p>
      </div>
    </div>
  );
};

export default Register;