// src/components/cart/ProductRecommendations.js
import React, { useState, useEffect } from 'react';
import { Link } from 'react-router-dom';
import recommendationService from '../../api/recommendationService';
import { useCart } from '../../context/CartContext';
import { useToast } from '../../context/ToastContext';
import apiClient from '../../api/axiosConfig';

const ProductRecommendations = () => {
  const [recommendations, setRecommendations] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);
  const { cart, addItem } = useCart();
  const { showToast } = useToast();
  
  // Base URL para las imágenes
  const API_BASE_URL = apiClient.defaults.baseURL.replace('/api/', '');

  useEffect(() => {
    // Solo obtener recomendaciones si hay productos en el carrito
    if (cart.items.length === 0) {
      setRecommendations([]);
      setLoading(false);
      return;
    }

    const fetchRecommendations = async () => {
      try {
        setLoading(true);
        setError(null);
        
        // Obtener IDs de productos en el carrito
        const productIds = cart.items.map(item => item.id);
        
        // Solicitar recomendaciones usando el servicio
        const recommendationsData = await recommendationService.getRecommendationsForCart(productIds, 5);
        
        setRecommendations(recommendationsData);
      } catch (err) {
        console.error('Error al obtener recomendaciones:', err);
        setError('No se pudieron cargar las recomendaciones');
      } finally {
        setLoading(false);
      }
    };

    fetchRecommendations();
  }, [cart.items]); // Re-ejecutar cuando cambie el contenido del carrito

  // Manejar cuando se agrega un producto recomendado al carrito
  const handleAddToCart = (product) => {
    addItem(product, 1);
    showToast(`${product.nombre} se ha agregado al carrito`, 'success');
  };

  // Si no hay recomendaciones o hay un error, no mostrar nada
  if ((recommendations.length === 0 && !loading) || error) {
    return null;
  }

  return (
    <div className="mt-8 pb-4">
      <h2 className="text-xl font-bold mb-4">Productos recomendados</h2>
      
      {loading ? (
        <div className="flex justify-center py-6">
          <div className="animate-spin rounded-full h-8 w-8 border-t-2 border-b-2 border-blue-500"></div>
        </div>
      ) : (
        <div className="relative">
          <div className="flex overflow-x-auto pb-4 gap-4 scrollbar-hide">
            {recommendations.map((recommendation) => (
              <div 
                key={recommendation.producto.id} 
                className="flex-shrink-0 w-48 bg-white rounded-lg shadow-md overflow-hidden"
              >
                {/* Imagen del producto - URL corregida */}
                <Link to={`/productos/${recommendation.producto.id}`}>
                  <div className="h-36 bg-gray-200 relative">
                    {recommendation.producto.imagen ? (
                      <img 
                        src={`${API_BASE_URL}${recommendation.producto.imagen}`}
                        alt={recommendation.producto.nombre} 
                        className="w-full h-full object-cover"
                      />
                    ) : (
                      <div className="flex items-center justify-center h-full text-gray-500">
                        <span>Sin imagen</span>
                      </div>
                    )}
                  </div>
                </Link>
                
                {/* Información del producto */}
                <div className="p-3">
                  <Link 
                    to={`/productos/${recommendation.producto.id}`} 
                    className="text-sm font-medium text-gray-900 hover:text-blue-600 line-clamp-2"
                  >
                    {recommendation.producto.nombre}
                  </Link>
                  
                  <div className="mt-1 flex justify-between items-center">
                    <span className="text-sm font-bold text-gray-900">${recommendation.producto.precio}</span>
                    <button 
                      onClick={() => handleAddToCart(recommendation.producto)}
                      className="bg-blue-600 text-white text-xs py-1 px-2 rounded hover:bg-blue-700 transition"
                    >
                      Agregar
                    </button>
                  </div>
                </div>
              </div>
            ))}
          </div>
          
          {/* Indicadores de desplazamiento */}
          <div className="hidden md:flex absolute top-1/2 left-0 transform -translate-y-1/2">
            <button className="rounded-full bg-white shadow-md p-2 text-gray-600 hover:text-blue-600">
              <svg xmlns="http://www.w3.org/2000/svg" className="h-5 w-5" viewBox="0 0 20 20" fill="currentColor">
                <path fillRule="evenodd" d="M12.707 5.293a1 1 0 010 1.414L9.414 10l3.293 3.293a1 1 0 01-1.414 1.414l-4-4a1 1 0 010-1.414l4-4a1 1 0 011.414 0z" clipRule="evenodd" />
              </svg>
            </button>
          </div>
          
          <div className="hidden md:flex absolute top-1/2 right-0 transform -translate-y-1/2">
            <button className="rounded-full bg-white shadow-md p-2 text-gray-600 hover:text-blue-600">
              <svg xmlns="http://www.w3.org/2000/svg" className="h-5 w-5" viewBox="0 0 20 20" fill="currentColor">
                <path fillRule="evenodd" d="M7.293 14.707a1 1 0 010-1.414L10.586 10 7.293 6.707a1 1 0 011.414-1.414l4 4a1 1 0 010 1.414l-4 4a1 1 0 01-1.414 0z" clipRule="evenodd" />
              </svg>
            </button>
          </div>
        </div>
      )}
    </div>
  );
};

export default ProductRecommendations;