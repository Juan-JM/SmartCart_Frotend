// CheckoutPage.js
import React, { useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import { useCart } from '../context/CartContext';
import { salesService } from '../api/salesService';
import { useSelector } from 'react-redux';
import { selectCurrentUser } from '../redux/authSlice';
import { loadStripe } from '@stripe/stripe-js';
import { Elements, CardElement, useStripe, useElements } from '@stripe/react-stripe-js';

// Cargar Stripe con tu clave pública
const stripePromise = loadStripe('pk_test_51Q6PfFA3VhVRZlE9icPaW8KTl6aje0qhOMyJ5hxVwK6BmJeqzziM1iF6eRkO3PhttRmvdYmN8l3Qk7RB9FFbFv1c00uAf9xSsm');

// Componente de Stripe simplificado para pruebas
const SimpleCardForm = ({ currentUser }) => {
  const stripe = useStripe();
  const elements = useElements();

  useEffect(() => {
    console.log("SimpleCardForm - Stripe disponible:", !!stripe);
    console.log("SimpleCardForm - Elements disponible:", !!elements);
    const token = localStorage.getItem('token'); // o donde almacenes tu token
    console.log("Token disponible:", !!token);
    if (token) {
      console.log("Primeros 10 caracteres del token:", token.substring(0, 10) + "...");
    }

    // Verificar datos del usuario
    if (currentUser) {
      console.log("Usuario autenticado:", currentUser.username);
      console.log("Perfil de cliente:", currentUser.cliente_profile ?
        `ID: ${currentUser.cliente_profile.id}, Nombre: ${currentUser.cliente_profile.nombre}` :
        "No tiene perfil de cliente");
    } else {
      console.log("Usuario no autenticado o no cargado");
    }
  }, [stripe, elements, currentUser]);

  return (
    <div className="p-4 border border-blue-500 bg-blue-50">
      <p className="mb-4">Formulario de prueba de Stripe</p>
      <div className="border border-gray-300 rounded-md p-4 bg-white mb-4" style={{ minHeight: "40px" }}>
        <CardElement
          options={{
            style: {
              base: {
                fontSize: '16px',
                color: '#424770',
                '::placeholder': {
                  color: '#aab7c4',
                },
              },
              invalid: {
                color: '#9e2146',
              },
            },
          }}
        />
      </div>
      <button
        className="bg-blue-500 text-white px-4 py-2 rounded"
        disabled={!stripe}
      >
        Probar Stripe
      </button>
    </div>
  );
};

// Componente para pruebas
const TestStripeElements = ({ currentUser }) => {
  return (
    <div className="mt-6 p-4 border border-red-500 bg-red-50">
      <h3 className="text-xl font-bold mb-4">Prueba de integración de Stripe</h3>
      <Elements stripe={stripePromise}>
        <SimpleCardForm currentUser={currentUser} />
      </Elements>
    </div>
  );
};

// Componente para el formulario de pago real
const PaymentForm = ({ clientSecret, onPaymentComplete, onError, amount, currentUser }) => {
  const stripe = useStripe();
  const elements = useElements();
  const [loading, setLoading] = useState(false);
  const [errorMessage, setErrorMessage] = useState('');

  useEffect(() => {
    console.log("PaymentForm - Stripe disponible:", !!stripe);
    console.log("PaymentForm - Elements disponible:", !!elements);
    console.log("PaymentForm - ClientSecret disponible:", !!clientSecret);
    console.log("PaymentForm - Amount:", amount);
  }, [stripe, elements, clientSecret, amount]);

  const handleSubmit = async (event) => {
    event.preventDefault();
    
    if (!stripe || !elements || !clientSecret) {
      console.error("No se puede procesar el pago: falta stripe, elements o clientSecret");
      return;
    }

    setLoading(true);
    setErrorMessage('');

    try {
      console.log("Iniciando confirmación de pago con Stripe");
      
      // Confirmar el pago con Stripe
      const result = await stripe.confirmCardPayment(clientSecret, {
        payment_method: {
          card: elements.getElement(CardElement),
        },
      });

      console.log("Resultado de confirmCardPayment:", result);

      if (result.error) {
        console.error("Error en el pago:", result.error);
        setErrorMessage(result.error.message);
        onError(result.error.message);
      } else {
        if (result.paymentIntent.status === 'succeeded') {
          console.log("Pago exitoso, notificando al backend");
          await salesService.confirmPayment(result.paymentIntent.id);
          onPaymentComplete();
        } else {
          console.log("Estado inesperado del pago:", result.paymentIntent.status);
          setErrorMessage(`El pago está en estado: ${result.paymentIntent.status}`);
        }
      }
    } catch (error) {
      console.error('Error al procesar el pago:', error);
      setErrorMessage('Ocurrió un error al procesar el pago. Por favor, intenta nuevamente.');
      onError('Error al procesar el pago');
    } finally {
      setLoading(false);
    }
  };

  return (
    <form onSubmit={handleSubmit} className="space-y-4">
      <div className="mb-4">
        <label className="block text-sm font-medium text-gray-700 mb-2">
          Información de pago
        </label>
        <div className="border border-gray-300 rounded-md p-4 bg-white">
          <CardElement
            options={{
              style: {
                base: {
                  fontSize: '16px',
                  color: '#424770',
                  '::placeholder': {
                    color: '#aab7c4',
                  },
                },
                invalid: {
                  color: '#9e2146',
                },
              },
            }}
          />
        </div>
      </div>
      
      {errorMessage && (
        <div className="bg-red-100 border border-red-400 text-red-700 px-4 py-3 rounded">
          {errorMessage}
        </div>
      )}
      
      <button
        type="submit"
        disabled={loading || !stripe || !clientSecret}
        className="w-full bg-indigo-600 text-white px-6 py-3 rounded-md hover:bg-indigo-700 disabled:bg-indigo-400"
      >
        {loading ? 'Procesando pago...' : `Pagar $${amount ? amount.toFixed(2) : '0.00'}`}
      </button>
    </form>
  );
};

const CheckoutPage = () => {
  const { cart, clearCart } = useCart();
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState('');
  const [notaVentaId, setNotaVentaId] = useState(null);
  const [paymentIntent, setPaymentIntent] = useState(null);
  const [showPaymentForm, setShowPaymentForm] = useState(false);
  const navigate = useNavigate();
  const user = useSelector(selectCurrentUser);

// 1. Primero, agregar un useEffect para verificar mejor el perfil del cliente
// Agregar este código después de la declaración del usuario
useEffect(() => {
  if (user) {
    console.log("Información completa del usuario:", user);
    console.log("Perfil de cliente:", user.cliente_profile);
    // Verificar la estructura exacta del perfil del cliente
    if (user.cliente_profile) {
      console.log("Estructura del perfil: ", Object.keys(user.cliente_profile));
    }
  }
}, [user]);
  // Calculamos el total del carrito usando la estructura correcta del contexto
  const calculateTotal = () => {
    return cart.total || cart.items.reduce((total, item) => total + item.price * item.quantity, 0);
  };

  const handleCheckout = async () => {
    setLoading(true);
    setError('');

    try {
      console.log("Iniciando proceso de checkout");
      
      // Obtener el perfil de cliente
      const clienteId = user?.cliente_profile?.id;
      console.log("ID de cliente usuario todo:", user);

      console.log("ID de cliente utilizado:", clienteId);
      
      // Usar el método prepareSaleData de tu servicio
      const saleData = salesService.prepareSaleData(
        cart.items, 
        clienteId
      );
      console.log("Datos preparados para la venta:", saleData);

      // Crear la nota de venta
      const responseData = await salesService.createSale(saleData);
      console.log("Nota de venta creada:", responseData);
      
      if (!responseData || !responseData.id) {
        throw new Error("No se recibió un ID de venta válido");
      }
      
      setNotaVentaId(responseData.id);
      setShowPaymentForm(true);
      
      // Verificar autorización antes de crear el intento de pago
      const token = localStorage.getItem('token');
      console.log("Creando intento de pago con token:", !!token);
      
      // Crear intento de pago en Stripe
      console.log("Solicitud de intento de pago para nota:", responseData.id);
      try {
        const paymentData = await salesService.createPaymentIntent(responseData.id);
        console.log("Respuesta de intento de pago:", paymentData);
        
        if (!paymentData || !paymentData.clientSecret) {
          throw new Error("No se recibió un clientSecret válido");
        }
        
        setPaymentIntent({
          clientSecret: paymentData.clientSecret,
          amount: paymentData.amount || calculateTotal()
        });
      } catch (paymentError) {
        console.error("Error al crear intento de pago:", paymentError);
        if (paymentError.response) {
          console.error("Respuesta del servidor:", paymentError.response.status, paymentError.response.data);
          throw new Error(paymentError.response.data?.detail || "Error al crear el intento de pago");
        }
        throw paymentError;
      }
    } catch (err) {
      console.error('Error al procesar la compra:', err);
      setError(err.message || 'Error al crear la orden. Por favor, intenta nuevamente.');
      setShowPaymentForm(false);
    } finally {
      setLoading(false);
    }
  };

  const handlePaymentComplete = () => {
    console.log("Pago completado, limpiando carrito y redirigiendo");
    clearCart();
    navigate('/perfil'); // O redirige a donde prefieras
  };

  const handlePaymentError = (message) => {
    console.error("Error en el pago:", message);
    setError(message);
  };

  // Verificamos si el carrito está vacío
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

      {/* Componente de prueba de Stripe */}
      {/* <TestStripeElements currentUser={user} /> */}

      <div className="grid grid-cols-1 md:grid-cols-2 gap-8 mt-8">
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
                <p><span className="font-medium">Dirección:</span> {user.cliente_profile.direccion || "No especificada"}</p>
                <p><span className="font-medium">Teléfono:</span> {user.cliente_profile.numero || "No especificado"}</p>
              </div>
            ) : (
              <p>Cargando información de envío...</p>
            )}

            {error && (
              <div className="mt-4 bg-red-100 border border-red-400 text-red-700 px-4 py-3 rounded">
                {error}
              </div>
            )}

            {!showPaymentForm ? (
              <button
                onClick={handleCheckout}
                disabled={loading}
                className="mt-6 w-full bg-indigo-600 text-white px-6 py-3 rounded-md hover:bg-indigo-700 disabled:bg-indigo-400"
              >
                {loading ? 'Procesando...' : 'Continuar al Pago'}
              </button>
            ) : (
              <div className="mt-4">
                <h3 className="text-lg font-semibold mb-3">Método de Pago</h3>
                {paymentIntent ? (
                  <Elements stripe={stripePromise}>
                    <PaymentForm 
                      clientSecret={paymentIntent.clientSecret}
                      onPaymentComplete={handlePaymentComplete}
                      onError={handlePaymentError}
                      amount={paymentIntent.amount}
                      currentUser={user}
                    />
                  </Elements>
                ) : (
                  <div className="mt-4 text-center p-4 border border-gray-200 rounded">
                    <div className="animate-pulse">
                      <p>Cargando opciones de pago...</p>
                    </div>
                  </div>
                )}
              </div>
            )}
          </div>
        </div>
      </div>

      {/* Información de depuración */}
      {/* <div className="mt-8 p-4 border border-gray-300 rounded bg-gray-50">
        <h3 className="font-bold">Información de depuración:</h3>
        <p>stripePromise: {stripePromise ? "Cargado" : "No cargado"}</p>
        <p>showPaymentForm: {showPaymentForm ? "Sí" : "No"}</p>
        <p>notaVentaId: {notaVentaId || "No disponible"}</p>
        <p>paymentIntent: {paymentIntent ? "Disponible" : "No disponible"}</p>
        {paymentIntent && (
          <p>clientSecret: {paymentIntent.clientSecret ? paymentIntent.clientSecret.substring(0, 10) + "..." : "No disponible"}</p>
        )}
      </div> */}
    </div>
  );
};

export default CheckoutPage;