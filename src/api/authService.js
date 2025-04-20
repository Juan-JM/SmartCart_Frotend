// src/api/authService.js
import apiClient from './axiosConfig';

export const authService = {
  login: async (credentials) => {
    const response = await apiClient.post('/token/', credentials);
    // Guardar tokens en localStorage con nombres consistentes
    localStorage.setItem('accessToken', response.data.access);
    localStorage.setItem('refreshToken', response.data.refresh);
    
    return response.data;
  },

  register: async (userData) => {
    const response = await apiClient.post('/usuarios/register/', userData);
    return response.data;
  },

  getUserProfile: async (token) => {
    // Asegurarnos de enviar el token en el header
    const config = {
      headers: {
        Authorization: `Bearer ${token}`
      }
    };
    const response = await apiClient.get('/usuarios/profile/', config);
    return response.data;
  },

  getProfile: async () => {
    const token = localStorage.getItem('accessToken');
    const config = {
      headers: {
        Authorization: `Bearer ${token}`
      }
    };
    const response = await apiClient.get('/usuarios/profile/', config);
    return response.data;
  },

  updateProfile: async (profileData) => {
    const response = await apiClient.put('/usuarios/profile/', profileData);
    return response.data;
  },

  changePassword: async (passwordData) => {
    const response = await apiClient.put('/usuarios/change-password/', passwordData);
    return response.data;
  },

  isAuthenticated: () => {
    // Verificar si existe un token en el localStorage (usando el mismo nombre que en axiosConfig)
    const token = localStorage.getItem('accessToken');
    return !!token;
  },

  logout: () => {
    // Elimina los tokens del localStorage con nombres consistentes
    localStorage.removeItem('accessToken');
    localStorage.removeItem('refreshToken');
  }
};

export default authService;