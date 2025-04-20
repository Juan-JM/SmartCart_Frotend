// src/api/axiosConfig.js
import axios from 'axios';
import store from '../redux/store';
import { setCredentials, logout } from '../redux/authSlice';

const apiClient = axios.create({
  // baseURL: 'http://127.0.0.1:8000/api/',
  baseURL: 'https://web-production-0a76.up.railway.app/api/',
  headers: {
    'Content-Type': 'application/json'
  }
});

// Interceptor para agregar el token a las peticiones
apiClient.interceptors.request.use(
  (config) => {
    const token = localStorage.getItem('accessToken');
    if (token) {
      config.headers.Authorization = `Bearer ${token}`;
    }
    return config;
  },
  (error) => {
    return Promise.reject(error);
  }
);

// Interceptor para manejar respuestas y refrescar el token si es necesario
apiClient.interceptors.response.use(
  (response) => response,
  async (error) => {
    const originalRequest = error.config;

    if (error.response?.status === 401 && !originalRequest._retry) {
      originalRequest._retry = true;

      try {
        const refreshToken = localStorage.getItem('refreshToken');
        if (!refreshToken) {
          // Si no hay refresh token, logout
          store.dispatch(logout());
          return Promise.reject(error);
        }

        const response = await axios.post('http://127.0.0.1:8000/api/token/refresh/', {
          refresh: refreshToken
        });

        const { access } = response.data;
        localStorage.setItem('accessToken', access);
        
        // Actualizado para usar setCredentials en lugar de setToken
        // Estamos manteniendo la estructura actual del usuario y actualizando solo los tokens
        const state = store.getState();
        const currentUser = state.auth.user;
        
        store.dispatch(
          setCredentials({
            user: currentUser,
            tokens: {
              access: access,
              refresh: refreshToken // Mantener el refresh token actual
            }
          })
        );
        
        originalRequest.headers.Authorization = `Bearer ${access}`;
        return apiClient(originalRequest);
      } catch (refreshError) {
        store.dispatch(logout());
        return Promise.reject(refreshError);
      }
    }
    return Promise.reject(error);
  }
);

export default apiClient;