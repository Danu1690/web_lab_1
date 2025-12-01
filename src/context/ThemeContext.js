import React, { createContext, useState, useContext, useEffect } from 'react';

const ThemeContext = createContext();

export const useTheme = () => {
  const context = useContext(ThemeContext);
  if (!context) {
    throw new Error('useTheme must be used within a ThemeProvider');
  }
  return context;
};

export const ThemeProvider = ({ children }) => {
  const [isDarkTheme, setIsDarkTheme] = useState(false);
  const [themeVersion, setThemeVersion] = useState(0); // Для принудительного обновления

  // Загружаем тему при инициализации
  useEffect(() => {
    const loadTheme = () => {
      // Сначала пробуем получить тему из localStorage пользователя
      const userData = localStorage.getItem('user');
      let userTheme = null;
      
      if (userData) {
        try {
          const parsedUser = JSON.parse(userData);
          userTheme = parsedUser.theme;
        } catch (error) {
          console.error('Error parsing user data for theme:', error);
        }
      }
      
      // Приоритет: тема пользователя из БД > сохраненная тема > системная
      const savedTheme = localStorage.getItem('theme');
      const systemPrefersDark = window.matchMedia('(prefers-color-scheme: dark)').matches;
      
      const themeToApply = userTheme || savedTheme || (systemPrefersDark ? 'dark' : 'light');
      
      applyTheme(themeToApply);
    };

    loadTheme();

    // Слушаем изменения в localStorage для синхронизации темы между вкладками
    const handleStorageChange = (e) => {
      if (e.key === 'theme' || e.key === 'user') {
        loadTheme();
        setThemeVersion(prev => prev + 1); // Принудительное обновление
      }
    };

    window.addEventListener('storage', handleStorageChange);
    
    return () => {
      window.removeEventListener('storage', handleStorageChange);
    };
  }, []);

  const applyTheme = (theme) => {
    const isDark = theme === 'dark';
    setIsDarkTheme(isDark);
    document.documentElement.setAttribute('data-theme', theme);
    localStorage.setItem('theme', theme);
    
    // Принудительно обновляем CSS переменные
    document.documentElement.style.setProperty('--theme-version', themeVersion);
  };

  const toggleTheme = () => {
    const newTheme = isDarkTheme ? 'light' : 'dark';
    
    // Немедленно применяем тему визуально
    applyTheme(newTheme);
    setThemeVersion(prev => prev + 1);
    
    // Отправляем событие для обновления темы в БД через AuthContext
    window.dispatchEvent(new CustomEvent('themeChange', { 
      detail: { theme: newTheme } 
    }));
  };

  const value = {
    isDarkTheme,
    toggleTheme,
    themeVersion // Добавляем в контекст для принудительного обновления
  };

  return (
    <ThemeContext.Provider value={value}>
      {children}
    </ThemeContext.Provider>
  );
};