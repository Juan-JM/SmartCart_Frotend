import React, { useState, useEffect } from 'react';
import { useParams, Link, useNavigate } from 'react-router-dom';
import apiClient from '../../../api/axiosConfig'; // Asume que apiClient está configurado
import HasPermission from '../../../components/common/HasPermission'; // Asume que este componente existe

// Helper para formatear fecha (puedes moverlo a un archivo utils si lo usas en más sitios)
const formatDate = (dateString) => {
  try {
    const date = new Date(dateString);
    const day = date.getDate().toString().padStart(2, '0');
    const month = (date.getMonth() + 1).toString().padStart(2, '0'); // Meses son 0-indexados
    const year = date.getFullYear();
    const hours = date.getHours().toString().padStart(2, '0');
    const minutes = date.getMinutes().toString().padStart(2, '0');
    return `${day}/${month}/${year} ${hours}:${minutes}`;
  } catch (error) {
    console.error("Error formatting date:", error);
    return 'Fecha inválida';
  }
};

// Componente para la tabla de detalles de productos (extraído para reusabilidad)
const OrderDetailsTable = ({ detalles, montoTotal }) => (
  <div className="overflow-x-auto">
    <table className="min-w-full divide-y divide-gray-200 text-sm">
      <thead className="bg-gray-50">
        <tr>
          <th className="px-4 py-2 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">Producto</th>
          <th className="px-4 py-2 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">Cantidad</th>
          <th className="px-4 py-2 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">Precio Unit.</th>
          <th className="px-4 py-2 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">Subtotal</th>
        </tr>
      </thead>
      <tbody className="bg-white divide-y divide-gray-200">
        {detalles?.map((detalle) => (
          <tr key={detalle.id}>
            <td className="px-4 py-2">
              <div className="flex items-center">
                {/* Puedes añadir la imagen si está disponible en detalle.producto.imagen */}
                {/* {detalle.producto?.imagen && (
                  <img src={detalle.producto.imagen} alt={detalle.producto.nombre} className="h-10 w-10 object-cover mr-3 rounded" />
                )} */}
                <div>
                  <div className="font-medium text-gray-900">{detalle.producto?.nombre || 'Producto no encontrado'}</div>
                  <div className="text-xs text-gray-500">
                     {/* Ajusta según los campos disponibles en tu API para producto */}
                     {detalle.producto?.marca_nombre || ''} {detalle.producto?.color || ''} {detalle.producto?.capacidad || ''}
                  </div>
                </div>
              </div>
            </td>
            <td className="px-4 py-2">{detalle.cantidad}</td>
            <td className="px-4 py-2">${detalle.precio_unitario}</td>
            <td className="px-4 py-2">${detalle.subtotal}</td>
          </tr>
        ))}
      </tbody>
      <tfoot>
        <tr>
          <td colSpan="3" className="px-4 py-2 text-right font-medium">Total Orden:</td>
          <td className="px-4 py-2 font-medium">${montoTotal}</td>
        </tr>
      </tfoot>
    </table>
  </div>
);


const ClienteDetail = () => {
  const { id } = useParams();
  const navigate = useNavigate();
  const [cliente, setCliente] = useState(null);
  const [loadingCliente, setLoadingCliente] = useState(true);
  const [errorCliente, setErrorCliente] = useState(null);

  const [orders, setOrders] = useState([]);
  const [loadingOrders, setLoadingOrders] = useState(true);
  const [errorOrders, setErrorOrders] = useState(null);

  // Estado para manejar la orden expandida y sus detalles
  const [expandedOrderId, setExpandedOrderId] = useState(null);
  const [loadingDetails, setLoadingDetails] = useState(false);
  const [orderDetails, setOrderDetails] = useState(null);
  const [errorDetails, setErrorDetails] = useState(null);

  // --- Fetch Cliente Data ---
  useEffect(() => {
    const fetchCliente = async () => {
      try {
        setLoadingCliente(true);
        setErrorCliente(null);
        const response = await apiClient.get(`/usuarios/clientes/${id}/`);
        setCliente(response.data);
      } catch (err) {
        setErrorCliente('Error al cargar los datos del cliente: ' + (err.response?.data?.detail || err.message));
        console.error('Error fetching client:', err);
      } finally {
        setLoadingCliente(false);
      }
    };
    fetchCliente();
  }, [id]);

  // --- Fetch Orders List ---
  useEffect(() => {
    const fetchOrders = async () => {
      if (!id) return; // No buscar si no hay ID de cliente
      try {
        setLoadingOrders(true);
        setErrorOrders(null);
        // Obtener TODAS las órdenes del cliente (quita el limit=5)
        // Asegúrate que el endpoint devuelve una lista, puede ser paginada.
        // Aquí asumimos que devuelve un objeto con 'results' o directamente el array.
        const response = await apiClient.get(`/ventas/notas/?cliente_id=${id}`);
        setOrders(response.data.results || response.data || []); // Maneja diferentes estructuras de respuesta
      } catch (err) {
        setErrorOrders('Error al cargar el historial de órdenes.');
        console.error('Error fetching orders:', err);
      } finally {
        setLoadingOrders(false);
      }
    };
    fetchOrders();
  }, [id]); // Depende del ID del cliente

  // --- Function to Toggle Order Details ---
  const handleToggleOrderDetails = async (orderId) => {
    // Si la orden clickeada ya está abierta, ciérrala
    if (expandedOrderId === orderId) {
      setExpandedOrderId(null);
      setOrderDetails(null);
      setErrorDetails(null);
      return;
    }

    // Si se clickea una nueva orden, ciérra la anterior y carga la nueva
    setExpandedOrderId(orderId);
    setOrderDetails(null); // Limpia detalles anteriores
    setErrorDetails(null);
    setLoadingDetails(true);

    try {
      // Llama a la API para obtener los detalles específicos de ESTA orden
      // Asume que el endpoint /ventas/notas/{orderId}/ devuelve los detalles completos, incluyendo el array 'detalles'
      const response = await apiClient.get(`/ventas/notas/${orderId}/`);
      setOrderDetails(response.data); // Guarda los detalles completos
    } catch (err) {
      setErrorDetails('Error al cargar los detalles de esta orden.');
      console.error(`Error fetching details for order ${orderId}:`, err);
      setExpandedOrderId(null); // Cierra si hay error
    } finally {
      setLoadingDetails(false);
    }
  };

  // --- Handle Delete ---
  const handleDelete = async () => {
    if (window.confirm('¿Estás seguro de eliminar este cliente? Esta acción no se puede deshacer.')) {
      try {
        await apiClient.delete(`/usuarios/clientes/${id}/`);
        navigate('/admin/usuarios/clientes'); // Redirige a la lista
      } catch (err) {
        // Podrías mostrar un error más específico o usar un state para el error de borrado
        setErrorCliente('Error al eliminar el cliente: ' + (err.response?.data?.detail || err.message));
        console.error('Error deleting client:', err);
      }
    }
  };

  // --- Render Logic ---
  if (loadingCliente) return <div className="flex justify-center p-6"><div className="animate-spin rounded-full h-12 w-12 border-t-2 border-b-2 border-blue-500"></div></div>;
  if (errorCliente) return <div className="text-red-500 p-4 text-center">{errorCliente}</div>;
  if (!cliente) return <div className="text-center p-4">Cliente no encontrado</div>;

  return (
    <div className="container mx-auto px-4 py-6">
      {/* --- Header and Actions --- */}
      <div className="flex justify-between items-center mb-6">
        <h1 className="text-2xl font-bold">Detalle del Cliente</h1>
        <div className="space-x-2">
          <Link to="/admin/usuarios/clientes" className="bg-gray-500 hover:bg-gray-600 text-white px-4 py-2 rounded">
            Volver
          </Link>
          <HasPermission requiredPermission="usuarios.change_cliente">
            <Link to={`/admin/usuarios/clientes/${id}/editar`} className="bg-yellow-500 hover:bg-yellow-600 text-white px-4 py-2 rounded">
              Editar
            </Link>
          </HasPermission>
          <HasPermission requiredPermission="usuarios.delete_cliente">
            <button
              onClick={handleDelete}
              className="bg-red-500 hover:bg-red-600 text-white px-4 py-2 rounded">
              Eliminar
            </button>
          </HasPermission>
        </div>
      </div>

      {/* --- Client Info Section --- */}
      <div className="bg-white shadow rounded-lg p-6 mb-6">
        <h2 className="text-xl font-semibold mb-4">Información del Cliente</h2>
        <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
          <div>
            <p className="text-sm text-gray-600">Nombre:</p>
            <p className="font-medium">{cliente.nombre}</p>
          </div>
          <div>
            <p className="text-sm text-gray-600">Número de contacto:</p>
            <p className="font-medium">{cliente.numero || 'No especificado'}</p>
          </div>
          <div>
            <p className="text-sm text-gray-600">Dirección:</p>
            <p className="font-medium">{cliente.direccion || 'No especificada'}</p>
          </div>
          <div>
            <p className="text-sm text-gray-600">Puntos acumulados:</p>
            <p className="font-medium">{cliente.points}</p>
          </div>
          <div>
            <p className="text-sm text-gray-600">Usuario asociado:</p>
            <p className="font-medium">{cliente.usuario?.username || 'No especificado'}</p>
          </div>
          <div>
            <p className="text-sm text-gray-600">Email:</p>
            <p className="font-medium">{cliente.usuario?.email || 'No especificado'}</p>
          </div>
        </div>
      </div>

      {/* --- Orders History Section --- */}
      <div className="bg-white shadow rounded-lg p-6">
        <h2 className="text-xl font-semibold mb-4">Historial de Órdenes</h2>
        {loadingOrders && <p>Cargando historial de órdenes...</p>}
        {errorOrders && <p className="text-red-500">{errorOrders}</p>}

        {!loadingOrders && !errorOrders && (
          orders.length > 0 ? (
            <div className="space-y-4">
              {orders.map((order) => (
                <div key={order.id} className="border border-gray-200 rounded">
                  {/* Order Summary Row (Clickable) */}
                  <div
                    className="flex justify-between items-center p-4 cursor-pointer hover:bg-gray-50"
                    onClick={() => handleToggleOrderDetails(order.id)}
                  >
                    <div>
                      <span className="font-medium">Orden #{order.id}</span>
                      <span className="text-sm text-gray-600 ml-4">
                        Fecha: {formatDate(order.fecha_hora)}
                      </span>
                      <span className="text-sm text-gray-600 ml-4">
                        Total: ${order.monto_total}
                      </span>
                    </div>
                    {/* Expand/Collapse Icon */}
                    <span className="text-xl">
                      {expandedOrderId === order.id ? '−' : '+'}
                    </span>
                  </div>

                  {/* Expanded Order Details Section */}
                  {expandedOrderId === order.id && (
                    <div className="border-t border-gray-200 p-4">
                      {loadingDetails && <p>Cargando detalles...</p>}
                      {errorDetails && <p className="text-red-500">{errorDetails}</p>}
                      {!loadingDetails && !errorDetails && orderDetails && (
                        // Renderiza la tabla de detalles reutilizada
                        <OrderDetailsTable
                           detalles={orderDetails.detalles} // Asegúrate que tu API devuelve esto
                           montoTotal={orderDetails.monto_total}
                         />
                      )}
                       {!loadingDetails && !errorDetails && !orderDetails && (
                         <p>No se pudieron cargar los detalles.</p> // Fallback
                       )}
                    </div>
                  )}
                </div>
              ))}
            </div>
          ) : (
            <p className="text-gray-500">Este cliente no tiene órdenes registradas.</p>
          )
        )}
         {/* Ya no necesitas el link "Ver todas las compras" aquí si las muestras todas */}
      </div>
    </div>
  );
};

export default ClienteDetail;