// src/api/productService.js
import axios from 'axios';
import { ENDPOINTS } from './config';
import apiClient from './axiosConfig';

export const productService = {
  // Obtener productos con filtros y paginación
  getProducts: async (params = {}) => {
    try {
      console.log('Solicitando productos con parámetros:', params);
      const response = await apiClient.get('/productos/productos/', { params });
      return response.data;
    } catch (error) {
      console.error('Error al obtener productos:', error);
      throw error;
    }
  },
  
  // Obtener un producto específico por ID
  getProductById: async (id) => {
    try {
      const response = await apiClient.get(`/productos/productos/${id}/`);
      return response.data;
    } catch (error) {
      console.error(`Error al obtener producto ${id}:`, error);
      throw error;
    }
  },
  
  // Obtener todas las categorías
  getCategories: async () => {
    try {
      const response = await apiClient.get('/productos/categorias/');
      return response.data;
    } catch (error) {
      console.error('Error al obtener categorías:', error);
      throw error;
    }
  },
  
  // Obtener todas las marcas
  getBrands: async () => {
    try {
      const response = await apiClient.get('/productos/marcas/');
      return response.data;
    } catch (error) {
      console.error('Error al obtener marcas:', error);
      throw error;
    }
  }
};

export default productService;