import React, { useState, useEffect } from 'react';
import { salesService } from '../api/salesService';
import { useSelector } from 'react-redux';
import { selectCurrentUser } from '../redux/authSlice';

const OrdersPage = () => {
  const [orders, setOrders] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState('');
  const [selectedOrder, setSelectedOrder] = useState(null);
  const user = useSelector(selectCurrentUser);

  useEffect(() => {
    const fetchOrders = async () => {
      try {
        // Verificamos si el usuario está cargado
        if (!user) {
          setLoading(false);
          setError('Cargando información del usuario...');
          return;
        }

        // 2. Determinar si es admin o cliente
        const isAdmin = user.is_staff === true; // Comparación estricta
        // const isClient = !isAdmin; // Cliente si no es admin
        // 3. Control de acceso
        if (isAdmin) {
          setError("Acceso denegado: Solo para clientes");
          setLoading(false);
          return; // Bloquea completamente a los admins
        }

        // 4. Si es cliente, mostrar sus órdenes
        console.log("Mostrando órdenes del cliente...");


        const response = await salesService.getOrders();
        setOrders(response.results || response);
      } catch (err) {
        console.error('Error al cargar las órdenes:', err);
        setError('Error al cargar las órdenes. Por favor, intenta de nuevo.');
      } finally {
        setLoading(false);
      }
    };

    fetchOrders();
  }, [user]);

  const viewOrderDetails = async (orderId) => {
    try {
      setLoading(true);
      const orderDetails = await salesService.getOrderById(orderId);
      setSelectedOrder(orderDetails);
    } catch (err) {
      console.error('Error al cargar los detalles de la orden:', err);
      setError('Error al cargar los detalles. Por favor, intenta de nuevo.');
    } finally {
      setLoading(false);
    }
  };

  const closeOrderDetails = () => {
    setSelectedOrder(null);
  };

  const formatDate = (dateString) => {
    try {
      const date = new Date(dateString);

      // Formatear la fecha manualmente sin dependencias
      const day = date.getDate().toString().padStart(2, '0');
      const month = (date.getMonth() + 1).toString().padStart(2, '0');
      const year = date.getFullYear();
      const hours = date.getHours().toString().padStart(2, '0');
      const minutes = date.getMinutes().toString().padStart(2, '0');

      return `${day}/${month}/${year} ${hours}:${minutes}`;
    } catch (error) {
      return 'Fecha inválida';
    }
  };

  if (loading) return <div className="text-center mt-8">Cargando...</div>;
  if (error) return <div className="text-red-500 text-center mt-8">{error}</div>;

  // Si hay una orden seleccionada, mostrar sus detalles
  if (selectedOrder) {
    return (
      <div className="container mx-auto px-4 py-8">
        <div className="flex justify-between items-center mb-6">
          <h1 className="text-2xl font-bold">Detalles de la Orden #{selectedOrder.id}</h1>
          <button
            onClick={closeOrderDetails}
            className="bg-gray-200 hover:bg-gray-300 text-gray-800 font-semibold py-2 px-4 rounded"
          >
            Volver a Órdenes
          </button>
        </div>

        <div className="bg-white shadow-md rounded-lg p-6 mb-6">
          <div className="grid grid-cols-1 md:grid-cols-2 gap-4 mb-6">
            <div>
              <h2 className="text-lg font-semibold mb-2">Información del Cliente</h2>
              <p><span className="font-medium">Nombre:</span> {selectedOrder.cliente?.nombre}</p>
              <p><span className="font-medium">Teléfono:</span> {selectedOrder.cliente?.numero}</p>
              <p><span className="font-medium">Dirección:</span> {selectedOrder.cliente?.direccion}</p>
            </div>
            <div>
              <h2 className="text-lg font-semibold mb-2">Información de la Orden</h2>
              <p><span className="font-medium">Fecha:</span> {formatDate(selectedOrder.fecha_hora)}</p>
              <p><span className="font-medium">Total:</span> ${selectedOrder.monto_total}</p>
            </div>
          </div>

          <h2 className="text-lg font-semibold mb-4">Productos</h2>
          <div className="overflow-x-auto">
            <table className="min-w-full divide-y divide-gray-200">
              <thead className="bg-gray-50">
                <tr>
                  <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">Producto</th>
                  <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">Cantidad</th>
                  <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">Precio Unitario</th>
                  <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">Subtotal</th>
                </tr>
              </thead>
              <tbody className="bg-white divide-y divide-gray-200">
                {selectedOrder.detalles.map((detalle) => (
                  <tr key={detalle.id}>
                    <td className="px-6 py-4">
                      <div className="flex items-center">
                        {detalle.producto.imagen && (
                          <img
                            src={detalle.producto.imagen}
                            alt={detalle.producto.nombre}
                            className="h-12 w-12 object-cover mr-4"
                          />
                        )}
                        <div>
                          <div className="font-medium text-gray-900">{detalle.producto.nombre}</div>
                          <div className="text-sm text-gray-500">
                            {detalle.producto.marca_nombre} | {detalle.producto.color}
                            {detalle.producto.capacidad && ` | ${detalle.producto.capacidad}`}
                          </div>
                        </div>
                      </div>
                    </td>
                    <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-500">
                      {detalle.cantidad}
                    </td>
                    <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-500">
                      ${detalle.precio_unitario}
                    </td>
                    <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-500">
                      ${detalle.subtotal}
                    </td>
                  </tr>
                ))}
              </tbody>
              <tfoot>
                <tr>
                  <td colSpan="3" className="px-6 py-4 text-right font-medium">Total:</td>
                  <td className="px-6 py-4 font-medium">${selectedOrder.monto_total}</td>
                </tr>
              </tfoot>
            </table>
          </div>
        </div>
      </div>
    );
  }

  return (
    <div className="container mx-auto px-4 py-8">
      <h1 className="text-2xl font-bold mb-6">
        {user.groups && user.groups.some(group => group.name === 'Administrador')
          ? 'Gestión de Órdenes'
          : 'Mis Órdenes'}
      </h1>

      <div className="bg-white shadow-md rounded-lg overflow-x-auto">
        <table className="min-w-full divide-y divide-gray-200">
          <thead className="bg-gray-50">
            <tr>
              <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">ID</th>
              <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">Cliente</th>
              <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">Total</th>
              <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">Fecha</th>
              <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">Acciones</th>
            </tr>
          </thead>
          <tbody className="bg-white divide-y divide-gray-200">
            {orders.length === 0 ? (
              <tr>
                <td colSpan="5" className="px-6 py-4 text-center text-sm text-gray-500">
                  No hay órdenes disponibles
                </td>
              </tr>
            ) : (
              orders.map((order) => (
                <tr key={order.id}>
                  <td className="px-6 py-4 whitespace-nowrap text-sm font-medium text-gray-900">
                    #{order.id}
                  </td>
                  <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-500">
                    {order.cliente?.nombre || 'Sin cliente'}
                  </td>
                  <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-500">
                    ${order.monto_total}
                  </td>
                  <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-500">
                    {formatDate(order.fecha_hora)}
                  </td>
                  <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-500">
                    <button
                      onClick={() => viewOrderDetails(order.id)}
                      className="text-indigo-600 hover:text-indigo-900"
                    >
                      Ver detalles
                    </button>
                  </td>
                </tr>
              ))
            )}
          </tbody>
        </table>
      </div>
    </div>
  );
};

export default OrdersPage;