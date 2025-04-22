import React, { useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import { CheckCircleIcon } from '@heroicons/react/24/outline';

const OrderConfirmationPage = () => {
  const navigate = useNavigate();

  useEffect(() => {
    // Opcional: Si quieres hacer algo cuando la página se carga
    // Por ejemplo, enviar analíticas, mostrar notificaciones, etc.
  }, []);

  return (
    <div className="container mx-auto px-4 py-16 text-center">
      <div className="flex flex-col items-center max-w-md mx-auto">
        <div className="rounded-full bg-green-100 p-3 mb-4">
          <CheckCircleIcon className="h-16 w-16 text-green-600" aria-hidden="true" />
        </div>
        
        <h1 className="text-3xl font-bold text-gray-900 mb-4">
          ¡Gracias por tu compra!
        </h1>
        
        <p className="text-lg text-gray-600 mb-8">
          Tu pedido ha sido procesado correctamente. Recibirás una confirmación por correo electrónico en breve.
        </p>
        
        <div className="space-y-4 w-full">
          <button
            onClick={() => navigate('/productos')}
            className="w-full bg-indigo-600 text-white px-6 py-3 rounded-md hover:bg-indigo-700"
          >
            Seguir comprando
          </button>
          
          <button
            onClick={() => navigate('/perfil')}
            className="w-full bg-white text-indigo-600 border border-indigo-600 px-6 py-3 rounded-md hover:bg-indigo-50"
          >
            Ver mis pedidos
          </button>
        </div>
      </div>
    </div>
  );
};

export default OrderConfirmationPage;