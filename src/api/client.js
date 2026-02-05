import axios from 'axios';

// URL del backend - usa variable de entorno o localhost por defecto
const API_URL = import.meta.env.VITE_API_URL || 'http://localhost:8000';

// Crear instancia de axios con URL base
const apiClient = axios.create({
  baseURL: API_URL,
  headers: {
    'Content-Type': 'application/json',
  },
  maxRedirects: 5,
});

// Interceptor de peticiones para depuración
apiClient.interceptors.request.use(
  (config) => {
    console.log('Petición API:', config.method.toUpperCase(), config.url);
    return config;
  },
  (error) => {
    console.error('Error en petición API:', error);
    return Promise.reject(error);
  }
);

// Interceptor de respuestas para depuración y manejo de errores
apiClient.interceptors.response.use(
  (response) => {
    console.log('Respuesta API:', response.status, response.config.url);
    return response;
  },
  (error) => {
    console.error('Error en respuesta API:', error.response?.status, error.message);
    return Promise.reject(error);
  }
);

export default apiClient;
