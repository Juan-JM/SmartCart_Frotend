// src/components/product/ProductCard.js
import React from 'react';
import { Link } from 'react-router-dom';
import { useCart } from '../../context/CartContext';
import { useToast } from '../../context/ToastContext';


const ProductCard = ({ product }) => {
  const { addItem } = useCart();
  const { showToast } = useToast();

  // Manejar cuando se agrega un producto al carrito
  const handleAddToCart = (e) => {
    e.preventDefault();
    addItem(product, 1);
    showToast('El producto se ha agregado al carrito', 'success');
  };
  
  return (
    <div className="bg-white rounded-lg shadow-md overflow-hidden">
      {/* Imagen del producto */}
      <Link to={`/productos/${product.id}`}>
        <div className="h-48 bg-gray-200 relative">
          {product.imagen ? (
            <img 
              src={product.imagen} 
              alt={product.nombre} 
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
          <Link to={`/productos/${product.id}`} className="text-lg font-medium text-gray-900 hover:text-blue-600">
            {product.nombre}
          </Link>
          <span className="text-sm text-gray-500">{product.marca_nombre}</span>
        </div>
        
        <div className="mb-2">
          <span className="text-sm text-gray-500">{product.categoria_nombre}</span>
        </div>
        <div className="mb-2">
          <span className="text-sm text-gray-500">{product.color}</span>
        </div>
        <div className="mb-2">
          <span className="text-sm text-gray-500">{product.capacidad}</span>
        </div>
        <div className="flex justify-between items-center">
          <span className="text-xl font-bold text-gray-900">${product.precio}</span>
          <button 
            onClick={handleAddToCart}
            className="bg-blue-600 text-white py-1 px-3 rounded hover:bg-blue-700 transition"
          >
            Agregar
          </button>
        </div>
      </div>
    </div>
  );
};

export default ProductCard;