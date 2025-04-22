// src/api/recommendationService.js
// import axios from 'axios';
import apiClient from './axiosConfig';

// const API_URL = '/api/recomendaciones';

const recommendationService = {
  /**
   * Obtiene recomendaciones basadas en los productos en el carrito
   * @param {Array} productIds - Array de IDs de productos en el carrito
   * @param {number} limit - Cantidad máxima de recomendaciones a obtener
   * @returns {Promise} Promesa con los datos de recomendaciones
   */
  getRecommendationsForCart: async (productIds, limit = 3) => {
    try {
      const response = await apiClient.post(`/recomendaciones/sugerencias/`, {
        productos: productIds,
        limite: limit
      });
      return response.data;
    } catch (error) {
      console.error('Error al obtener recomendaciones:', error);
      throw error;
    }
  },

  /**
   * Obtiene recomendaciones para un producto específico
   * @param {number} productId - ID del producto 
   * @param {number} limit - Cantidad máxima de recomendaciones
   * @returns {Promise} Promesa con los datos de recomendaciones
   */
  getRecommendationsForProduct: async (productId, limit = 5) => {
    try {
      const response = await apiClient.post(`/recomendaciones/sugerencias/`, {
        productos: [productId],
        limite: limit
      });
      return response.data;
    } catch (error) {
      console.error('Error al obtener recomendaciones para producto:', error);
      throw error;
    }
  }
};

export default recommendationService;