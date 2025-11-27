import React, { createContext, useState, useContext, useEffect } from 'react';

const ThemeContext = createContext();

export const useTheme = () => {
  return useContext(ThemeContext);
};

export const ThemeProvider = ({ children }) => {
  const [isDarkTheme, setIsDarkTheme] = useState(false);

  useEffect(() => {
    // Загружаем тему из localStorage при загрузке
    const savedTheme = localStorage.getItem('theme');
    if (savedTheme === 'dark') {
      setIsDarkTheme(true);
      applyDarkTheme();
    } else {
      applyLightTheme();
    }
  }, []);

  const applyDarkTheme = () => {
    document.documentElement.setAttribute('data-theme', 'dark');
    localStorage.setItem('theme', 'dark');
  };

  const applyLightTheme = () => {
    document.documentElement.setAttribute('data-theme', 'light');
    localStorage.setItem('theme', 'light');
  };

  // В ThemeContext.js обнови функцию toggleTheme:
    const toggleTheme = () => {
    setIsDarkTheme(prev => {
        const newTheme = !prev;
        if (newTheme) {
        applyDarkTheme();
        } else {
        applyLightTheme();
        }
        
        // Сохраняем тему в localStorage пользователя если он авторизован
        const userData = localStorage.getItem('user');
        if (userData) {
        try {
            const user = JSON.parse(userData);
            user.theme = newTheme ? 'dark' : 'light';
            localStorage.setItem('user', JSON.stringify(user));
        } catch (error) {
            console.error('Error saving user theme:', error);
        }
        }
        
        return newTheme;
    });
    };

  const value = {
    isDarkTheme,
    toggleTheme
  };

  return (
    <ThemeContext.Provider value={value}>
      {children}
    </ThemeContext.Provider>
  );
};