import React, { useState, useEffect } from 'react';
import { useParams, Link, useNavigate } from 'react-router-dom';
import apiClient from '../../../api/axiosConfig';
import HasPermission from '../../../components/common/HasPermission';

const ClienteDetail = () => {
  const { id } = useParams();
  const navigate = useNavigate();
  const [cliente, setCliente] = useState(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);
  const [ventasRecientes, setVentasRecientes] = useState([]);

  useEffect(() => {
    const fetchCliente = async () => {
      try {
        setLoading(true);
        const response = await apiClient.get(`/usuarios/clientes/${id}/`);
        setCliente(response.data);
        setLoading(false);
        
        // Cargar las ventas recientes de este cliente
        try {
          const ventasResponse = await apiClient.get(`/ventas/notas/?cliente_id=${id}&limit=5`);
          setVentasRecientes(ventasResponse.data.results || ventasResponse.data);
        } catch (err) {
          console.error('Error al cargar ventas:', err);
        }
      } catch (err) {
        setError('Error al cargar los datos del cliente: ' + (err.response?.data?.detail || err.message));
        setLoading(false);
      }
    };

    fetchCliente();
  }, [id]);

  const handleDelete = async () => {
    if (window.confirm('¿Estás seguro de eliminar este cliente? Esta acción no se puede deshacer.')) {
      try {
        await apiClient.delete(`/usuarios/clientes/${id}/`);
        navigate('/admin/usuarios/clientes');
      } catch (err) {
        setError('Error al eliminar el cliente: ' + (err.response?.data?.detail || err.message));
      }
    }
  };

  if (loading) return <div className="flex justify-center p-6"><div className="animate-spin rounded-full h-12 w-12 border-t-2 border-b-2 border-blue-500"></div></div>;
  
  if (error) return <div className="text-red-500 p-4 text-center">{error}</div>;
  
  if (!cliente) return <div className="text-center p-4">Cliente no encontrado</div>;

  return (
    <div className="container mx-auto px-4 py-6">
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

      <div className="bg-white shadow rounded-lg p-6 mb-6">
        <h2 className="text-xl font-semibold mb-4">Información del Cliente</h2>
        <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
          <div>
            <p className="text-gray-600">Nombre:</p>
            <p className="font-medium">{cliente.nombre}</p>
          </div>
          <div>
            <p className="text-gray-600">Número de contacto:</p>
            <p className="font-medium">{cliente.numero || 'No especificado'}</p>
          </div>
          <div>
            <p className="text-gray-600">Dirección:</p>
            <p className="font-medium">{cliente.direccion || 'No especificada'}</p>
          </div>
          <div>
            <p className="text-gray-600">Puntos acumulados:</p>
            <p className="font-medium">{cliente.points}</p>
          </div>
          <div>
            <p className="text-gray-600">Usuario asociado:</p>
            <p className="font-medium">{cliente.usuario?.username || 'No especificado'}</p>
          </div>
          <div>
            <p className="text-gray-600">Email:</p>
            <p className="font-medium">{cliente.usuario?.email || 'No especificado'}</p>
          </div>
        </div>
      </div>

      {/* Ventas recientes */}
      <div className="bg-white shadow rounded-lg p-6">
        <h2 className="text-xl font-semibold mb-4">Compras Recientes</h2>
        {ventasRecientes.length > 0 ? (
          <div className="overflow-x-auto">
            <table className="min-w-full divide-y divide-gray-200">
              <thead className="bg-gray-50">
                <tr>
                  <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">ID</th>
                  <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">Fecha</th>
                  <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">Monto Total</th>
                  <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">Acción</th>
                </tr>
              </thead>
              <tbody className="bg-white divide-y divide-gray-200">
                {ventasRecientes.map((venta) => (
                  <tr key={venta.id}>
                    <td className="px-6 py-4 whitespace-nowrap">{venta.id}</td>
                    <td className="px-6 py-4 whitespace-nowrap">
                      {new Date(venta.fecha_hora).toLocaleString()}
                    </td>
                    <td className="px-6 py-4 whitespace-nowrap">${venta.monto_total}</td>
                    <td className="px-6 py-4 whitespace-nowrap">
                      <HasPermission requiredPermission="ventas.view_notaventa">
                        <Link to={`/admin/ventas/notas/${venta.id}`} className="text-blue-600 hover:text-blue-900">
                          Ver detalle
                        </Link>
                      </HasPermission>
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        ) : (
          <p className="text-gray-500">Este cliente no tiene compras recientes.</p>
        )}
        <div className="mt-4">
          <HasPermission requiredPermission="ventas.view_notaventa">
            <Link to={`/admin/ventas/notas?cliente_id=${id}`} className="text-blue-600 hover:text-blue-800">
              Ver todas las compras del cliente →
            </Link>
          </HasPermission>
        </div>
      </div>
    </div>
  );
};

export default ClienteDetail;