// src/context/CartContext.js
import React, { createContext, useContext, useState, useEffect } from 'react';
import apiClient from '../api/axiosConfig';

// Constante para la URL base de la API
const API_BASE_URL = apiClient.defaults.baseURL.replace('/api/', '');

// Crear el contexto del carrito
const CartContext = createContext();

// Hook personalizado para usar el contexto del carrito
export const useCart = () => {
  return useContext(CartContext);
};

// Proveedor del contexto del carrito
export const CartProvider = ({ children }) => {
  // Estado del carrito
  const [cart, setCart] = useState(() => {
    // Intentar cargar el carrito desde localStorage al iniciar
    const savedCart = localStorage.getItem('cart');
    return savedCart ? JSON.parse(savedCart) : { items: [], total: 0 };
  });

  // Guardar el carrito en localStorage cada vez que cambie
  useEffect(() => {
    localStorage.setItem('cart', JSON.stringify(cart));
  }, [cart]);

  // Función para normalizar la URL de imagen
  const normalizeImageUrl = (imageUrl) => {
    if (!imageUrl) return null;
    
    // Si la URL ya es absoluta (comienza con http o https), devolverla como está
    if (imageUrl.startsWith('http://') || imageUrl.startsWith('https://')) {
      return imageUrl;
    }
    
    // Si la URL es relativa (comienza con /media/), añadir la URL base
    if (imageUrl.startsWith('/media/')) {
      return `${API_BASE_URL}${imageUrl}`;
    }
    
    // Si la URL no tiene ningún formato esperado, asumimos que es relativa
    return `${API_BASE_URL}${imageUrl}`;
  };

  // Añadir un producto al carrito
  const addItem = (product, quantity = 1) => {
    setCart(prevCart => {
      // Buscar si el producto ya está en el carrito
      const existingItemIndex = prevCart.items.findIndex(item => item.id === product.id);
      
      // Normalizar la URL de la imagen
      const normalizedImageUrl = normalizeImageUrl(product.imagen || product.image);
      
      if (existingItemIndex >= 0) {
        // Si el producto ya está en el carrito, actualizar la cantidad
        const updatedItems = [...prevCart.items];
        updatedItems[existingItemIndex].quantity += quantity;
        
        // Recalcular el total
        const newTotal = updatedItems.reduce((sum, item) => sum + (item.price * item.quantity), 0);
        
        return {
          items: updatedItems,
          total: newTotal
        };
      } else {
        // Si el producto no está en el carrito, añadirlo
        const newItem = {
          id: product.id,
          name: product.nombre || product.name,
          price: parseFloat(product.precio || product.price),
          image: normalizedImageUrl,
          quantity: quantity
        };
        
        // Añadir el nuevo producto y recalcular el total
        const updatedItems = [...prevCart.items, newItem];
        const newTotal = updatedItems.reduce((sum, item) => sum + (item.price * item.quantity), 0);
        
        return {
          items: updatedItems,
          total: newTotal
        };
      }
    });
  };

  // Eliminar un producto del carrito
  const removeItem = (productId) => {
    setCart(prevCart => {
      // Filtrar el producto a eliminar
      const updatedItems = prevCart.items.filter(item => item.id !== productId);
      
      // Recalcular el total
      const newTotal = updatedItems.reduce((sum, item) => sum + (item.price * item.quantity), 0);
      
      return {
        items: updatedItems,
        total: newTotal
      };
    });
  };

  // Actualizar la cantidad de un producto
  const updateQuantity = (productId, newQuantity) => {
    if (newQuantity < 1) return;
    
    setCart(prevCart => {
      // Buscar el producto a actualizar
      const updatedItems = prevCart.items.map(item => 
        item.id === productId ? { ...item, quantity: newQuantity } : item
      );
      
      // Recalcular el total
      const newTotal = updatedItems.reduce((sum, item) => sum + (item.price * item.quantity), 0);
      
      return {
        items: updatedItems,
        total: newTotal
      };
    });
  };

  // Vaciar el carrito
  const clearCart = () => {
    setCart({ items: [], total: 0 });
  };

  // Valor a proporcionar al contexto
  const value = {
    cart,
    addItem,
    removeItem,
    updateQuantity,
    clearCart
  };

  return (
    <CartContext.Provider value={value}>
      {children}
    </CartContext.Provider>
  );
};

export default CartContext;