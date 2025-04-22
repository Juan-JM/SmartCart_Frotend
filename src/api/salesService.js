// src/api/salesService.js
import apiClient from './axiosConfig';

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
  
    // Nuevas funciones para manejar pagos de Stripe
    createPaymentIntent: async (notaVentaId) => {
      const response = await apiClient.post('/pagos/crear-intento/', {
        nota_venta_id: notaVentaId
      });
      return response.data;
    },

    confirmPayment: async (paymentIntentId) => {
      const response = await apiClient.post('/pagos/confirmar-pago/', {
        payment_intent_id: paymentIntentId
      });
      return response.data;
    },
  
    // Formatear datos del carrito para la API
    prepareSaleData: (cartItems, clienteId) => {
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