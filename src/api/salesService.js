// src/api/salesService.js
// import { authAxios } from './authService';
// import { ENDPOINTS } from './config';
import apiClient from './axiosConfig';

// const salesService = {

export const salesService = {
    createSale: async (saleData) => {
      const response = await apiClient.post('/ventas/notas/', saleData);
      return response.data;
    },
  
    getOrders: async () => {
      const response = await apiClient.get('/ventas/notas/');
      return response.data;
    },
  
    getOrderById: async (id) => {
      const response = await apiClient.get(`/ventas/notas/${id}/`);
      return response.data;
    },
  // // Crear una nueva venta
  // createSale: async (saleData) => {
  //   try {
  //     const response = await authAxios.post(ENDPOINTS.SALES, saleData);
  //     return response.data;
  //   } catch (error) {
  //     throw error;
  //   }
  // },
  
  // // Obtener historial de ventas del usuario (solo para usuarios autenticados)
  // getSalesHistory: async () => {
  //   try {
  //     const response = await authAxios.get(ENDPOINTS.SALES);
  //     return response.data;
  //   } catch (error) {
  //     throw error;
  //   }
  // },
  
  // // Obtener detalle de una venta específica
  // getSaleDetail: async (saleId) => {
  //   try {
  //     const response = await authAxios.get(`${ENDPOINTS.SALES}${saleId}/`);
  //     return response.data;
  //   } catch (error) {
  //     throw error;
  //   }
  // },
  
  // Formatear datos del carrito para la API
  prepareSaleData: (cartItems, clienteId = null) => {
    // Convertir los items del carrito al formato que espera la API
    const detalles_payload = cartItems.map(item => ({
      producto_id: item.id,
      cantidad: item.quantity
    }));
    
    // Estructura esperada por el endpoint de ventas
    return {
      cliente_id: clienteId,
      detalles_payload
    };
  }
};

export default salesService;