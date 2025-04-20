// src/context/CartContext.js
import React, { createContext, useContext, useReducer, useEffect } from 'react';

// Estado inicial del carrito
const initialState = {
  items: [],
  total: 0
};

// Crear contexto
const CartContext = createContext();

// Tipos de acciones
const ADD_ITEM = 'ADD_ITEM';
const REMOVE_ITEM = 'REMOVE_ITEM';
const UPDATE_QUANTITY = 'UPDATE_QUANTITY';
const CLEAR_CART = 'CLEAR_CART';

// Reductor para manipular el estado del carrito
const cartReducer = (state, action) => {
  switch (action.type) {
    case ADD_ITEM: {
      const existingItemIndex = state.items.findIndex(
        item => item.id === action.payload.id
      );
      
      if (existingItemIndex >= 0) {
        // El producto ya existe en el carrito, actualizar cantidad
        const updatedItems = [...state.items];
        updatedItems[existingItemIndex] = {
          ...updatedItems[existingItemIndex],
          quantity: updatedItems[existingItemIndex].quantity + action.payload.quantity
        };
        
        return {
          ...state,
          items: updatedItems,
          total: calculateTotal(updatedItems)
        };
      } else {
        // Nuevo producto
        const newItems = [...state.items, action.payload];
        return {
          ...state,
          items: newItems,
          total: calculateTotal(newItems)
        };
      }
    }
    
    case REMOVE_ITEM: {
      const updatedItems = state.items.filter(item => item.id !== action.payload);
      return {
        ...state,
        items: updatedItems,
        total: calculateTotal(updatedItems)
      };
    }
    
    case UPDATE_QUANTITY: {
      const updatedItems = state.items.map(item => 
        item.id === action.payload.id 
          ? { ...item, quantity: action.payload.quantity }
          : item
      );
      
      return {
        ...state,
        items: updatedItems,
        total: calculateTotal(updatedItems)
      };
    }
    
    case CLEAR_CART:
      return initialState;
      
    default:
      return state;
  }
};

// Función auxiliar para calcular el total del carrito
const calculateTotal = (items) => {
  return items.reduce((sum, item) => sum + (item.price * item.quantity), 0);
};

// Proveedor del contexto
export const CartProvider = ({ children }) => {
  // Intentar recuperar el carrito del localStorage
  const getInitialState = () => {
    const savedCart = localStorage.getItem('cart');
    return savedCart ? JSON.parse(savedCart) : initialState;
  };
  
  const [state, dispatch] = useReducer(cartReducer, null, getInitialState);
  
  // Guardar el carrito en localStorage cuando cambie
  useEffect(() => {
    localStorage.setItem('cart', JSON.stringify(state));
  }, [state]);
  
  // Acciones para manipular el carrito
  const addItem = (product, quantity = 1) => {
    dispatch({
      type: ADD_ITEM,
      payload: {
        id: product.id,
        name: product.nombre,
        price: parseFloat(product.precio),
        image: product.imagen,
        quantity
      }
    });
  };
  
  const removeItem = (productId) => {
    dispatch({
      type: REMOVE_ITEM,
      payload: productId
    });
  };
  
  const updateQuantity = (productId, quantity) => {
    dispatch({
      type: UPDATE_QUANTITY,
      payload: {
        id: productId,
        quantity: parseInt(quantity)
      }
    });
  };
  
  const clearCart = () => {
    dispatch({ type: CLEAR_CART });
  };
  
  return (
    <CartContext.Provider
      value={{
        cart: state,
        addItem,
        removeItem,
        updateQuantity,
        clearCart
      }}
    >
      {children}
    </CartContext.Provider>
  );
};

// Hook personalizado para usar el contexto del carrito
export const useCart = () => {
  const context = useContext(CartContext);
  if (!context) {
    throw new Error('useCart debe usarse dentro de un CartProvider');
  }
  return context;
};