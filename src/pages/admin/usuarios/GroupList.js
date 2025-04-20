import React, { useState, useEffect } from 'react';
import { Link } from 'react-router-dom';
import apiClient from '../../../api/axiosConfig';
import HasPermission from '../../../components/common/HasPermission';

const GroupsList = () => {
  const [groups, setGroups] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);

  useEffect(() => {
    fetchGroups();
  }, []);

  const fetchGroups = async () => {
    try {
      setLoading(true);
      const response = await apiClient.get('/admin/groups/');
      setGroups(response.data);
      setLoading(false);
    } catch (err) {
      setError('Error al cargar los grupos: ' + (err.response?.data?.detail || err.message));
      setLoading(false);
    }
  };

  const handleDelete = async (id) => {
    if (window.confirm('¿Estás seguro de eliminar este grupo? Esta acción no se puede deshacer y podría afectar a usuarios.')) {
      try {
        await apiClient.delete(`/admin/groups/${id}/`);
        // Recargar la lista de grupos
        fetchGroups();
      } catch (err) {
        setError('Error al eliminar el grupo: ' + (err.response?.data?.detail || err.message));
      }
    }
  };

  if (loading) return <div className="flex justify-center p-6"><div className="animate-spin rounded-full h-12 w-12 border-t-2 border-b-2 border-blue-500"></div></div>;
  
  if (error) return <div className="text-red-500 p-4 text-center">{error}</div>;

  return (
    <div className="container mx-auto px-4 py-6">
      <div className="flex justify-between items-center mb-6">
        <h1 className="text-2xl font-bold">Gestión de Grupos y Permisos</h1>
        <HasPermission requiredPermission="auth.add_group">
          <Link to="/admin/usuarios/grupos/nuevo" className="bg-blue-500 hover:bg-blue-600 text-white px-4 py-2 rounded">
            Nuevo Grupo
          </Link>
        </HasPermission>
      </div>

      {groups.length === 0 ? (
        <div className="text-center p-4 bg-gray-100 rounded">No se encontraron grupos</div>
      ) : (
        <div className="overflow-x-auto bg-white rounded-lg shadow">
          <table className="min-w-full divide-y divide-gray-200">
            <thead className="bg-gray-50">
              <tr>
                <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">ID</th>
                <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">Nombre</th>
                <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">Usuarios</th>
                <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">Permisos</th>
                <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">Acciones</th>
              </tr>
            </thead>
            <tbody className="bg-white divide-y divide-gray-200">
              {groups.map((group) => (
                <tr key={group.id} className="hover:bg-gray-50">
                  <td className="px-6 py-4 whitespace-nowrap">{group.id}</td>
                  <td className="px-6 py-4 whitespace-nowrap font-medium">{group.name}</td>
                  <td className="px-6 py-4 whitespace-nowrap">
                    {group.user_count || '0'} usuarios
                  </td>
                  <td className="px-6 py-4 whitespace-nowrap">
                    {group.permissions?.length || '0'} permisos
                  </td>
                  <td className="px-6 py-4 whitespace-nowrap space-x-2">
                    <HasPermission requiredPermission="auth.view_group">
                      <Link to={`/admin/usuarios/grupos/${group.id}`} className="text-blue-600 hover:text-blue-900">
                        Ver
                      </Link>
                    </HasPermission>
                    <HasPermission requiredPermission="auth.change_group">
                      <Link to={`/admin/usuarios/grupos/${group.id}/editar`} className="text-yellow-600 hover:text-yellow-900">
                        Editar
                      </Link>
                    </HasPermission>
                    <HasPermission requiredPermission="auth.delete_group">
                      <button 
                        onClick={() => handleDelete(group.id)} 
                        className="text-red-600 hover:text-red-900">
                        Eliminar
                      </button>
                    </HasPermission>
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      )}
    </div>
  );
};

export default GroupsList;