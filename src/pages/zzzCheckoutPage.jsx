import React, { useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import { useCart } from '../context/CartContext';
import { salesService } from '../api/salesService';
import { useSelector } from 'react-redux';
import { selectCurrentUser } from '../redux/authSlice';
import { loadStripe } from '@stripe/stripe-js';
import { Elements, CardElement, useStripe, useElements } from '@stripe/react-stripe-js';

// IMPORTANTE: Asegúrate de que esta clave sea correcta
const stripePromise = loadStripe('pk_test_51Q6PfFA3VhVRZlE9icPaW8KTl6aje0qhOMyJ5hxVwK6BmJeqzziM1iF6eRkO3PhttRmvdYmN8l3Qk7RB9FFbFv1c00uAf9xSsm');

// Opciones del CardElement para mejor visualización
const CARD_ELEMENT_OPTIONS = {
  style: {
    base: {
      color: '#32325d',
      fontFamily: '"Helvetica Neue", Helvetica, sans-serif',
      fontSmoothing: 'antialiased',
      fontSize: '16px',
      '::placeholder': {
        color: '#aab7c4',
      },
    },
    invalid: {
      color: '#fa755a',
      iconColor: '#fa755a',
    },
  },
};

// Componente de formulario de pago
const CheckoutForm = ({ clientSecret, onPaymentComplete, onError, amount }) => {
  const stripe = useStripe();
  const elements = useElements();
  const [loading, setLoading] = useState(false);
  const [errorMessage, setErrorMessage] = useState('');

  // Mostrar información de depuración
  useEffect(() => {
    console.log("CheckoutForm montado");
    console.log("Stripe disponible:", !!stripe);
    console.log("Elements disponible:", !!elements);
    console.log("ClientSecret:", clientSecret?.substring(0, 10) + "...");
  }, [stripe, elements, clientSecret]);

  const handleSubmit = async (event) => {
    event.preventDefault();
    
    if (!stripe || !elements) {
      console.log("Stripe o elements no disponibles al enviar");
      return;
    }

    setLoading(true);
    setErrorMessage('');

    try {
      console.log("Intentando confirmCardPayment con clientSecret");
      
      // Confirmar el pago con Stripe
      const result = await stripe.confirmCardPayment(clientSecret, {
        payment_method: {
          card: elements.getElement(CardElement),
        },
      });

      console.log("Resultado de confirmCardPayment:", result);

      if (result.error) {
        // Mostrar error al usuario
        console.error("Error en confirmCardPayment:", result.error);
        setErrorMessage(result.error.message);
        onError(result.error.message);
      } else {
        // El pago se procesó correctamente
        if (result.paymentIntent.status === 'succeeded') {
          console.log("Pago exitoso, notificando al backend");
          // Informar al backend que el pago se completó
          await salesService.confirmPayment(result.paymentIntent.id);
          onPaymentComplete();
        } else {
          console.log("Estado del paymentIntent:", result.paymentIntent.status);
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
          <CardElement options={CARD_ELEMENT_OPTIONS} />
        </div>
      </div>
      
      {errorMessage && (
        <div className="bg-red-100 border border-red-400 text-red-700 px-4 py-3 rounded">
          {errorMessage}
        </div>
      )}
      
      <button
        type="submit"
        disabled={loading || !stripe}
        className="w-full bg-indigo-600 text-white px-6 py-3 rounded-md hover:bg-indigo-700 disabled:bg-indigo-400"
      >
        {loading ? 'Procesando pago...' : `Pagar $${Number(amount).toFixed(2)}`}
      </button>
    </form>
  );
};

// Componente contenedor para Stripe Elements
const StripePaymentForm = ({ clientSecret, onPaymentComplete, onError, amount }) => {
  // Estado para indicar si stripePromise está resuelto
  const [stripeLoaded, setStripeLoaded] = useState(false);

  useEffect(() => {
    // Check if Stripe has loaded
    if (stripePromise) {
      stripePromise.then(() => {
        console.log("Stripe cargado correctamente");
        setStripeLoaded(true);
      }).catch(error => {
        console.error("Error cargando Stripe:", error);
      });
    }
  }, []);

  if (!clientSecret) {
    return <div>Esperando información de pago...</div>;
  }

  if (!stripeLoaded) {
    return <div>Cargando procesador de pagos...</div>;
  }

  return (
    <Elements stripe={stripePromise}>
      <CheckoutForm 
        clientSecret={clientSecret}
        onPaymentComplete={onPaymentComplete}
        onError={onError}
        amount={amount}
      />
    </Elements>
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

  // Calculamos el total del carrito usando la estructura correcta del contexto
  const calculateTotal = () => {
    return cart.total || cart.items.reduce((total, item) => total + item.price * item.quantity, 0);
  };

  const handleCheckout = async () => {
    setLoading(true);
    setError('');

    try {
      console.log("Iniciando proceso de checkout");
      
      // Usar el método prepareSaleData de tu servicio
      const saleData = salesService.prepareSaleData(
        cart.items, 
        user?.cliente_profile?.id
      );

      console.log("Datos de venta preparados:", saleData);

      // Crear la nota de venta
      const responseData = await salesService.createSale(saleData);
      console.log("Nota de venta creada:", responseData);
      
      if (!responseData || !responseData.id) {
        throw new Error("No se recibió un ID de venta válido");
      }
      
      setNotaVentaId(responseData.id);
      
      // Mostrar el formulario de pago
      setShowPaymentForm(true);
      
      // Crear intento de pago en Stripe
      console.log("Creando intento de pago para la nota:", responseData.id);
      const paymentData = await salesService.createPaymentIntent(responseData.id);
      console.log("Intento de pago creado:", paymentData);
      
      if (!paymentData || !paymentData.clientSecret) {
        throw new Error("No se recibió un clientSecret válido");
      }
      
      setPaymentIntent({
        clientSecret: paymentData.clientSecret,
        amount: paymentData.amount || calculateTotal()
      });
    } catch (err) {
      console.error('Error al procesar la compra:', err);
      setError(err.message || 'Error al crear la orden. Por favor, intenta nuevamente.');
      setShowPaymentForm(false);
    } finally {
      setLoading(false);
    }
  };

  const handlePaymentComplete = () => {
    // Limpiar el carrito y redirigir a una página de confirmación
    console.log("Pago completado, limpiando carrito y redirigiendo");
    clearCart();
    navigate('/compra-completada');
  };

  const handlePaymentError = (message) => {
    console.error("Error de pago:", message);
    setError(message);
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
                  <StripePaymentForm 
                    clientSecret={paymentIntent.clientSecret}
                    onPaymentComplete={handlePaymentComplete}
                    onError={handlePaymentError}
                    amount={paymentIntent.amount}
                  />
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
    </div>
  );
};

export default CheckoutPage;