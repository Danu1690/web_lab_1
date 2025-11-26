// Конфигурация API
const API_CONFIG = {
  // ✅ Абсолютный URL к API
  BASE_URL: 'http://localhost/auth-api',
  
  // ✅ Или используем прокси (если настроен)
  // BASE_URL: '/api'
};

export const getApiUrl = (endpoint) => {
  return `${API_CONFIG.BASE_URL}/${endpoint}`;
};

export default API_CONFIG;