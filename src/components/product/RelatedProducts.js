import React, { useState, useEffect } from 'react';
import { Link } from 'react-router-dom';
import recommendationService from '../../api/recommendationService';
import { useCart } from '../../context/CartContext';
import { useToast } from '../../context/ToastContext';
import apiClient from '../../api/axiosConfig';

const RelatedProducts = ({ productId }) => {
  const [relatedProducts, setRelatedProducts] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);
  const { addItem } = useCart();
  const { showToast } = useToast();

  // Base URL para las imágenes
  const API_BASE_URL = apiClient.defaults.baseURL.replace('/api/', '');

  useEffect(() => {
    // Solo obtener recomendaciones si hay un ID de producto
    if (!productId) {
      setRelatedProducts([]);
      setLoading(false);
      return;
    }

    const fetchRelatedProducts = async () => {
      try {
        setLoading(true);
        setError(null);

        // Solicitar recomendaciones para este producto específico
        const recommendationsData = await recommendationService.getRecommendationsForProduct(productId, 4);

        setRelatedProducts(recommendationsData);
      } catch (err) {
        console.error('Error al obtener productos relacionados:', err);
        setError('No se pudieron cargar los productos relacionados');
      } finally {
        setLoading(false);
      }
    };

    fetchRelatedProducts();
  }, [productId]); // Re-ejecutar cuando cambie el ID del producto

  // Manejar cuando se agrega un producto recomendado al carrito
  const handleAddToCart = (product) => {
    addItem(product, 1);
    showToast(`${product.nombre} se ha agregado al carrito`, 'success');
  };

  // Si no hay recomendaciones o hay un error, no mostrar nada
  if ((relatedProducts.length === 0 && !loading) || error) {
    return null;
  }

  return (
    <div className="mt-12">
      <h2 className="text-2xl font-bold mb-6">Productos relacionados</h2>

      {loading ? (
        <div className="flex justify-center py-8">
          <div className="animate-spin rounded-full h-10 w-10 border-t-2 border-b-2 border-blue-500"></div>
        </div>
      ) : (
        <div className="grid grid-cols-1 sm:grid-cols-2 md:grid-cols-3 lg:grid-cols-4 gap-6">
          {relatedProducts.map((item) => (
            <div
              key={item.producto.id}
              className="bg-white rounded-lg shadow-md overflow-hidden"
            >
              {/* Imagen del producto - URL corregida */}
              <Link to={`/productos/${item.producto.id}`}>
                <div className="h-48 bg-gray-200 relative">
                  {item.producto.imagen ? (
                    <img
                      src={`${API_BASE_URL}${item.producto.imagen}`}
                      alt={item.producto.nombre}
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
              <div className="p-4">
                <div className="flex justify-between items-start mb-1">
                  <Link to={`/productos/${item.producto.id}`} className="text-lg font-medium text-gray-900 hover:text-blue-600">
                    {item.producto.nombre}
                  </Link>
                  <span className="text-sm text-gray-500">{item.producto.marca_nombre}</span>
                </div>

                <div className="mb-2">
                  <span className="text-sm text-gray-500">{item.producto.categoria_nombre}</span>
                </div>

                <div className="flex justify-between items-center">
                  <span className="text-xl font-bold text-gray-900">${item.producto.precio}</span>
                  <button
                    onClick={() => handleAddToCart(item.producto)}
                    className="bg-blue-600 text-white py-1 px-3 rounded hover:bg-blue-700 transition"
                  >
                    Agregar
                  </button>
                </div>
              </div>
            </div>
          ))}
        </div>
      )}
    </div>
  );
};

export default RelatedProducts;