import React, { useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { useCart } from '../context/CartContext';
import { salesService } from '../api/salesService';
import { useSelector } from 'react-redux';
import { selectCurrentUser } from '../redux/authSlice';

const CheckoutPage = () => {
  const { cart, clearCart } = useCart();
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState('');
  const navigate = useNavigate();
  const user = useSelector(selectCurrentUser);

  // Calculamos el total del carrito usando la estructura correcta del contexto
  const calculateTotal = () => {
    return cart.total || cart.items.reduce((total, item) => total + item.price * item.quantity, 0);
  };

  const handleCheckout = async () => {
    setLoading(true);
    setError('');

    try {
      // Adaptamos los datos para coincidir con la estructura esperada por la API
      const saleData = {
        notas: cart.items.map(item => ({
          producto: item.id,
          cantidad: item.quantity,
          subtotal: item.price * item.quantity
        })),
        total: calculateTotal(),
        cliente: user?.cliente_profile?.id
      };

      await salesService.createSale(saleData);
      clearCart();
      navigate('/perfil');
    } catch (err) {
      console.error('Error al procesar la compra:', err);
      setError('Error al procesar la compra. Por favor, intenta nuevamente.');
    } finally {
      setLoading(false);
    }
  };

  // Verificamos si el carrito está vacío usando la estructura correcta
  if (!cart.items || cart.items.length === 0) {
    return (
      <div className="container mx-auto px-4 py-8 text-center">
        <h1 className="text-2xl font-bold mb-4">Tu carrito está vacío</h1>
        <button 
          onClick={() => navigate('/productos')}
          className="bg-indigo-600 text-white px-6 py-2 rounded-md hover:bg-indigo-700"
        >
          Ver Productos
        </button>
      </div>
    );
  }

  return (
    <div className="container mx-auto px-4 py-8">
      <h1 className="text-2xl font-bold mb-6">Finalizar Compra</h1>
      
      <div className="grid grid-cols-1 md:grid-cols-2 gap-8">
        <div>
          <h2 className="text-xl font-semibold mb-4">Resumen de la Orden</h2>
          <div className="bg-white rounded-lg shadow-md p-6">
            {cart.items.map((item) => (
              <div key={item.id} className="flex justify-between items-center border-b py-2">
                <div>
                  <p className="font-medium">{item.name}</p>
                  <p className="text-sm text-gray-600">Cantidad: {item.quantity}</p>
                </div>
                <p className="font-semibold">${(item.price * item.quantity).toFixed(2)}</p>
              </div>
            ))}
            <div className="mt-4 pt-4 border-t">
              <div className="flex justify-between items-center font-bold text-lg">
                <span>Total:</span>
                <span>${calculateTotal().toFixed(2)}</span>
              </div>
            </div>
          </div>
        </div>

        <div>
          <h2 className="text-xl font-semibold mb-4">Información de Envío</h2>
          <div className="bg-white rounded-lg shadow-md p-6">
            {user?.cliente_profile ? (
              <div className="space-y-2">
                <p><span className="font-medium">Nombre:</span> {user.cliente_profile.nombre}</p>
                <p><span className="font-medium">Dirección:</span> {user.cliente_profile.direccion}</p>
                <p><span className="font-medium">Teléfono:</span> {user.cliente_profile.numero}</p>
              </div>
            ) : (
              <p>Cargando información de envío...</p>
            )}

            {error && (
              <div className="mt-4 bg-red-100 border border-red-400 text-red-700 px-4 py-3 rounded">
                {error}
              </div>
            )}

            <button
              onClick={handleCheckout}
              disabled={loading}
              className="mt-6 w-full bg-indigo-600 text-white px-6 py-3 rounded-md hover:bg-indigo-700 disabled:bg-indigo-400"
            >
              {loading ? 'Procesando...' : 'Confirmar Compra'}
            </button>
          </div>
        </div>
      </div>
    </div>
  );
};

export default CheckoutPage;