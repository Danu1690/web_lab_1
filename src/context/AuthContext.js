import React, { createContext, useState, useContext, useEffect } from 'react';
import axios from 'axios';

const AuthContext = createContext();

export const useAuth = () => {
  const context = useContext(AuthContext);
  if (!context) {
    throw new Error('useAuth must be used within an AuthProvider');
  }
  return context;
};

export const AuthProvider = ({ children }) => {
  const [isAuthenticated, setIsAuthenticated] = useState(false);
  const [user, setUser] = useState(null);
  const [loading, setLoading] = useState(true);

  const API_BASE = 'http://localhost/auth-api';

  // Функция для обновления токенов
  const refreshTokens = async () => {
    try {
      const response = await axios.post(`${API_BASE}/refresh-token.php`);
      
      if (response.data.success) {
        localStorage.setItem('access_token', response.data.access_token);
        
        // Обновляем данные пользователя если пришли
        if (response.data.user) {
          const updatedUser = { ...user, ...response.data.user };
          setUser(updatedUser);
          localStorage.setItem('user', JSON.stringify(updatedUser));
        }
        
        return true;
      }
    } catch (error) {
      console.error('Token refresh failed:', error);
      logout();
      return false;
    }
  };

  // Interceptor для автоматического обновления токенов
  useEffect(() => {
    const requestInterceptor = axios.interceptors.request.use(
      (config) => {
        const token = localStorage.getItem('access_token');
        if (token) {
          config.headers.Authorization = `Bearer ${token}`;
        }
        return config;
      },
      (error) => Promise.reject(error)
    );

    const responseInterceptor = axios.interceptors.response.use(
      (response) => response,
      async (error) => {
        const originalRequest = error.config;
        
        if (error.response?.status === 401 && !originalRequest._retry) {
          originalRequest._retry = true;
          
          const refreshed = await refreshTokens();
          if (refreshed) {
            const newToken = localStorage.getItem('access_token');
            originalRequest.headers.Authorization = `Bearer ${newToken}`;
            return axios(originalRequest);
          }
        }
        
        return Promise.reject(error);
      }
    );

    return () => {
      axios.interceptors.request.eject(requestInterceptor);
      axios.interceptors.response.eject(responseInterceptor);
    };
  }, []);

  // Инициализация аутентификации
  useEffect(() => {
    const initializeAuth = async () => {
      const accessToken = localStorage.getItem('access_token');
      const userData = localStorage.getItem('user');
      
      if (accessToken && userData) {
        try {
          const parsedUser = JSON.parse(userData);
          setUser(parsedUser);
          setIsAuthenticated(true);
          
          if (parsedUser.theme) {
            document.documentElement.setAttribute('data-theme', parsedUser.theme);
            localStorage.setItem('theme', parsedUser.theme);
          }
        } catch (error) {
          console.error('Error parsing user data:', error);
          logout();
        }
      }
      
      setLoading(false);
    };

    initializeAuth();
  }, []);

  const login = (accessToken, userData) => {
    if (!userData || typeof userData !== 'object') {
      throw new Error('User data is required for login');
    }

    localStorage.setItem('access_token', accessToken);
    setUser(userData);
    setIsAuthenticated(true);
    
    if (userData.theme) {
      document.documentElement.setAttribute('data-theme', userData.theme);
      localStorage.setItem('theme', userData.theme);
    }
  };

  const logout = async () => {
    try {
      await axios.post(`${API_BASE}/logout.php`);
    } catch (error) {
      console.error('Logout error:', error);
    } finally {
      localStorage.removeItem('access_token');
      localStorage.removeItem('user');
      setUser(null);
      setIsAuthenticated(false);
    }
  };

  const updateUserTheme = async (theme) => {
    if (user) {
      try {
        const response = await axios.post(`${API_BASE}/update-theme.php`, {
          theme: theme
        });
        
        if (response.data.success) {
          const updatedUser = { ...user, theme };
          setUser(updatedUser);
          localStorage.setItem('user', JSON.stringify(updatedUser));
          document.documentElement.setAttribute('data-theme', theme);
          localStorage.setItem('theme', theme);
          return true;
        }
      } catch (error) {
        console.error('Error updating theme:', error);
      }
    }
    return false;
  };

  const value = {
    isAuthenticated,
    user,
    login,
    logout,
    loading,
    updateUserTheme,
    refreshTokens
  };

  return (
    <AuthContext.Provider value={value}>
      {children}
    </AuthContext.Provider>
  );
};