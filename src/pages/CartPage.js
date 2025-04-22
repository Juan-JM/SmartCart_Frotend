// src/pages/CartPage.js
import React, { useState } from 'react';
import { Link, useNavigate } from 'react-router-dom';
import { useCart } from '../context/CartContext';
import salesService from '../api/salesService';
import { authService } from '../api/authService';
import ProductRecommendations from '../components/cart/ProductRecommendations';

import { useSelector } from 'react-redux';
import { selectIsAuthenticated } from '../redux/authSlice';

const CartPage = () => {
  const isAuthenticated = useSelector(selectIsAuthenticated);
  const { cart, removeItem, updateQuantity, clearCart } = useCart();
  const [isProcessing, setIsProcessing] = useState(false);
  const [error, setError] = useState(null);
  const navigate = useNavigate();
  
  const handleQuantityChange = (productId, newQuantity) => {
    if (newQuantity < 1) return;
    updateQuantity(productId, newQuantity);
  };
  
  const handleCheckout = async () => {
    try {
      setIsProcessing(true);
      setError(null);
      
      if (isAuthenticated) {
        // Si está autenticado, ir al checkout
        navigate('/checkout');
      } else {
        // Si no está autenticado, redirigir al login
        navigate('/login', { state: { from: '/cart' } });
      }
    } catch (error) {
      console.error('Error during checkout:', error);
      setError('Error al procesar la compra. Por favor, intenta de nuevo.');
    } finally {
      setIsProcessing(false);
    }
  };
  
  if (cart.items.length === 0) {
    return (
      <div className="container mx-auto px-4 py-8">
        <h1 className="text-3xl font-bold mb-8">Tu carrito</h1>
        <div className="text-center py-12">
          <svg xmlns="http://www.w3.org/2000/svg" className="h-16 w-16 text-gray-400 mx-auto mb-4" fill="none" viewBox="0 0 24 24" stroke="currentColor">
            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M16 11V7a4 4 0 00-8 0v4M5 9h14l1 12H4L5 9z" />
          </svg>
          <p className="text-xl text-gray-600 mb-4">Tu carrito está vacío</p>
          <Link to="/productos" className="bg-blue-600 text-white px-6 py-2 rounded-lg hover:bg-blue-700">
            Ir a comprar
          </Link>
        </div>
      </div>
    );
  }
  
  return (
    <div className="container mx-auto px-4 py-8">
      <h1 className="text-3xl font-bold mb-8">Tu carrito</h1>
      
      {error && (
        <div className="bg-red-100 border border-red-400 text-red-700 px-4 py-3 rounded mb-4">
          <p>{error}</p>
        </div>
      )}
      
      <div className="grid grid-cols-1 lg:grid-cols-3 gap-8">
        {/* Lista de productos */}
        <div className="lg:col-span-2">
          {cart.items.map(item => (
            <div key={item.id} className="flex items-center border-b py-4">
              {/* Imagen */}
              <div className="w-20 h-20 flex-shrink-0">
                {item.image ? (
                  <img src={item.image} alt={item.name} className="w-full h-full object-cover" />
                ) : (
                  <div className="w-full h-full bg-gray-200 flex items-center justify-center text-sm text-gray-500">
                    Sin imagen
                  </div>
                )}
              </div>
              
              {/* Información del producto */}
              <div className="ml-4 flex-grow">
                <h3 className="text-lg font-medium">{item.name}</h3>
                <p className="text-gray-600">${item.price.toFixed(2)}</p>
              </div>
              
              {/* Cantidad */}
              <div className="flex items-center">
                <button 
                  onClick={() => handleQuantityChange(item.id, item.quantity - 1)}
                  className="p-1 border rounded"
                  disabled={item.quantity === 1}
                >
                  -
                </button>
                <span className="mx-2 w-8 text-center">{item.quantity}</span>
                <button 
                  onClick={() => handleQuantityChange(item.id, item.quantity + 1)}
                  className="p-1 border rounded"
                >
                  +
                </button>
              </div>
              
              {/* Subtotal */}
              <div className="ml-4 w-24 text-right font-medium">
                ${(item.price * item.quantity).toFixed(2)}
              </div>
              
              {/* Eliminar */}
              <button 
                onClick={() => removeItem(item.id)}
                className="ml-4 text-red-600 hover:text-red-800"
              >
                <svg xmlns="http://www.w3.org/2000/svg" className="h-5 w-5" viewBox="0 0 20 20" fill="currentColor">
                  <path fillRule="evenodd" d="M9 2a1 1 0 00-.894.553L7.382 4H4a1 1 0 000 2v10a2 2 0 002 2h8a2 2 0 002-2V6a1 1 0 100-2h-3.382l-.724-1.447A1 1 0 0011 2H9zM7 8a1 1 0 012 0v6a1 1 0 11-2 0V8zm5-1a1 1 0 00-1 1v6a1 1 0 102 0V8a1 1 0 00-1-1z" clipRule="evenodd" />
                </svg>
              </button>
            </div>
          ))}
          
          {/* Componente de Recomendaciones */}
          <ProductRecommendations />
        </div>
        
        {/* Resumen del pedido */}
        <div className="lg:col-span-1">
          <div className="bg-gray-50 rounded-lg p-6">
            <h2 className="text-xl font-bold mb-4">Resumen del pedido</h2>
            <div className="space-y-2">
              <div className="flex justify-between">
                <span>Subtotal</span>
                <span>${cart.total.toFixed(2)}</span>
              </div>
              <div className="flex justify-between font-bold pt-2 border-t">
                <span>Total</span>
                <span>${cart.total.toFixed(2)}</span>
              </div>
            </div>
            
            <button 
              onClick={handleCheckout}
              disabled={isProcessing}
              className={`w-full mt-6 py-3 rounded-lg text-white ${
                isProcessing 
                  ? 'bg-gray-400 cursor-not-allowed' 
                  : 'bg-blue-600 hover:bg-blue-700'
              }`}
            >
              {isProcessing ? 'Procesando...' : 'Proceder al pago'}
            </button>
            
            <p className="text-sm text-gray-600 mt-4">
              {authService.isAuthenticated() 
                ? 'La compra se registrará a tu cuenta.' 
                : 'No estás logueado. La compra se realizará como invitado.'}
            </p>
          </div>
        </div>
      </div>
    </div>
  );
};

export default CartPage;
// // src/pages/CartPage.js
// import React, { useState } from 'react';
// import { Link, useNavigate } from 'react-router-dom';
// import { useCart } from '../context/CartContext';
// import salesService from '../api/salesService';
// import { authService } from '../api/authService';

// import { useSelector } from 'react-redux';
// import { selectIsAuthenticated } from '../redux/authSlice';

// const CartPage = () => {
//   const isAuthenticated = useSelector(selectIsAuthenticated); //prueba
//   const { cart, removeItem, updateQuantity, clearCart } = useCart();
//   const [isProcessing, setIsProcessing] = useState(false);
//   const [error, setError] = useState(null);
//   const navigate = useNavigate();
  
//   const handleQuantityChange = (productId, newQuantity) => {
//     if (newQuantity < 1) return;
//     updateQuantity(productId, newQuantity);
//   };
  
//   const handleCheckout = async () => {
//     try {
//       setIsProcessing(true);
//       setError(null);
      
//       // // Verificar si el usuario está autenticado
//       // const isAuthenticated = authService.isAuthenticated();
      
//       if (isAuthenticated) {
//         // Si está autenticado, ir al checkout
//         navigate('/checkout');
//       } else {
//         // Si no está autenticado, redirigir al login
//         navigate('/login', { state: { from: '/cart' } });
//       }
//     } catch (error) {
//       console.error('Error during checkout:', error);
//       setError('Error al procesar la compra. Por favor, intenta de nuevo.');
//     } finally {
//       setIsProcessing(false);
//     }
//   };
  
//   if (cart.items.length === 0) {
//     return (
//       <div className="container mx-auto px-4 py-8">
//         <h1 className="text-3xl font-bold mb-8">Tu carrito</h1>
//         <div className="text-center py-12">
//           <svg xmlns="http://www.w3.org/2000/svg" className="h-16 w-16 text-gray-400 mx-auto mb-4" fill="none" viewBox="0 0 24 24" stroke="currentColor">
//             <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M16 11V7a4 4 0 00-8 0v4M5 9h14l1 12H4L5 9z" />
//           </svg>
//           <p className="text-xl text-gray-600 mb-4">Tu carrito está vacío</p>
//           <Link to="/productos" className="bg-blue-600 text-white px-6 py-2 rounded-lg hover:bg-blue-700">
//             Ir a comprar
//           </Link>
//         </div>
//       </div>
//     );
//   }
  
//   return (
//     <div className="container mx-auto px-4 py-8">
//       <h1 className="text-3xl font-bold mb-8">Tu carrito</h1>
      
//       {error && (
//         <div className="bg-red-100 border border-red-400 text-red-700 px-4 py-3 rounded mb-4">
//           <p>{error}</p>
//         </div>
//       )}
      
//       <div className="grid grid-cols-1 lg:grid-cols-3 gap-8">
//         {/* Lista de productos */}
//         <div className="lg:col-span-2">
//           {cart.items.map(item => (
//             <div key={item.id} className="flex items-center border-b py-4">
//               {/* Imagen */}
//               <div className="w-20 h-20 flex-shrink-0">
//                 {item.image ? (
//                   <img src={item.image} alt={item.name} className="w-full h-full object-cover" />
//                 ) : (
//                   <div className="w-full h-full bg-gray-200 flex items-center justify-center text-sm text-gray-500">
//                     Sin imagen
//                   </div>
//                 )}
//               </div>
              
//               {/* Información del producto */}
//               <div className="ml-4 flex-grow">
//                 <h3 className="text-lg font-medium">{item.name}</h3>
//                 <p className="text-gray-600">${item.price.toFixed(2)}</p>
//               </div>
              
//               {/* Cantidad */}
//               <div className="flex items-center">
//                 <button 
//                   onClick={() => handleQuantityChange(item.id, item.quantity - 1)}
//                   className="p-1 border rounded"
//                   disabled={item.quantity === 1}
//                 >
//                   -
//                 </button>
//                 <span className="mx-2 w-8 text-center">{item.quantity}</span>
//                 <button 
//                   onClick={() => handleQuantityChange(item.id, item.quantity + 1)}
//                   className="p-1 border rounded"
//                 >
//                   +
//                 </button>
//               </div>
              
//               {/* Subtotal */}
//               <div className="ml-4 w-24 text-right font-medium">
//                 ${(item.price * item.quantity).toFixed(2)}
//               </div>
              
//               {/* Eliminar */}
//               <button 
//                 onClick={() => removeItem(item.id)}
//                 className="ml-4 text-red-600 hover:text-red-800"
//               >
//                 <svg xmlns="http://www.w3.org/2000/svg" className="h-5 w-5" viewBox="0 0 20 20" fill="currentColor">
//                   <path fillRule="evenodd" d="M9 2a1 1 0 00-.894.553L7.382 4H4a1 1 0 000 2v10a2 2 0 002 2h8a2 2 0 002-2V6a1 1 0 100-2h-3.382l-.724-1.447A1 1 0 0011 2H9zM7 8a1 1 0 012 0v6a1 1 0 11-2 0V8zm5-1a1 1 0 00-1 1v6a1 1 0 102 0V8a1 1 0 00-1-1z" clipRule="evenodd" />
//                 </svg>
//               </button>
//             </div>
//           ))}
//         </div>
        
//         {/* Resumen del pedido */}
//         <div className="lg:col-span-1">
//           <div className="bg-gray-50 rounded-lg p-6">
//             <h2 className="text-xl font-bold mb-4">Resumen del pedido</h2>
//             <div className="space-y-2">
//               <div className="flex justify-between">
//                 <span>Subtotal</span>
//                 <span>${cart.total.toFixed(2)}</span>
//               </div>
//               <div className="flex justify-between font-bold pt-2 border-t">
//                 <span>Total</span>
//                 <span>${cart.total.toFixed(2)}</span>
//               </div>
//             </div>
            
//             <button 
//               onClick={handleCheckout}
//               disabled={isProcessing}
//               className={`w-full mt-6 py-3 rounded-lg text-white ${
//                 isProcessing 
//                   ? 'bg-gray-400 cursor-not-allowed' 
//                   : 'bg-blue-600 hover:bg-blue-700'
//               }`}
//             >
//               {isProcessing ? 'Procesando...' : 'Proceder al pago'}
//             </button>
            
//             <p className="text-sm text-gray-600 mt-4">
//               {authService.isAuthenticated() 
//                 ? 'La compra se registrará a tu cuenta.' 
//                 : 'No estás logueado. La compra se realizará como invitado.'}
//             </p>
//           </div>
//         </div>
//       </div>
//     </div>
//   );
// };

// export default CartPage;
