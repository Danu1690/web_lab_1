// Утилиты для работы с аутентификацией

export const authStorage = {
  // Сохранить данные пользователя
  setUser: (token, userData) => {
    try {
      localStorage.setItem('token', token);
      localStorage.setItem('user', JSON.stringify(userData));
      console.log('✅ Данные пользователя сохранены');
      return true;
    } catch (error) {
      console.error('❌ Ошибка сохранения данных:', error);
      return false;
    }
  },

  // Получить данные пользователя
  getUser: () => {
    try {
      const token = localStorage.getItem('token');
      const userData = localStorage.getItem('user');
      
      if (!token || !userData) {
        return null;
      }
      
      return {
        token,
        user: JSON.parse(userData)
      };
    } catch (error) {
      console.error('❌ Ошибка чтения данных:', error);
      this.clearUser();
      return null;
    }
  },

  // Проверить аутентификацию
  isAuthenticated: () => {
    const data = this.getUser();
    return data !== null;
  },

  // Очистить данные
  clearUser: () => {
    localStorage.removeItem('token');
    localStorage.removeItem('user');
    console.log('🧹 Данные пользователя очищены');
  }
};