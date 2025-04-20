import React, { useState, useEffect } from 'react';
import { Link } from 'react-router-dom';
import apiClient from '../../../api/axiosConfig';
import HasPermission from '../../../components/common/HasPermission';

const UsersList = () => {
  const [users, setUsers] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);
  const [currentPage, setCurrentPage] = useState(1);
  const [totalPages, setTotalPages] = useState(0);
  const [searchTerm, setSearchTerm] = useState('');

  useEffect(() => {
    fetchUsers();
  }, [currentPage, searchTerm]);

  const fetchUsers = async () => {
    try {
      setLoading(true);
      let url = `/usuarios/users/?page=${currentPage}`;
      if (searchTerm) {
        url += `&search=${searchTerm}`;
      }
      const response = await apiClient.get(url);
      setUsers(response.data.results || response.data);
      
      // Configurar paginación si la API devuelve esa información
      if (response.data.count) {
        setTotalPages(Math.ceil(response.data.count / 10)); // Asumiendo 10 por página
      }
      
      setLoading(false);
    } catch (err) {
      setError('Error al cargar la lista de usuarios: ' + (err.response?.data?.detail || err.message));
      setLoading(false);
    }
  };

  const handleStatusChange = async (userId, isActive) => {
    try {
      await apiClient.patch(`/admin/users/${userId}/status/`, {
        is_active: !isActive
      });
      // Actualizar la lista de usuarios
      fetchUsers();
    } catch (err) {
      setError('Error al cambiar el estado del usuario: ' + (err.response?.data?.detail || err.message));
    }
  };

  const handleDelete = async (userId) => {
    if (window.confirm('¿Estás seguro de eliminar este usuario? Esta acción no se puede deshacer.')) {
      try {
        await apiClient.delete(`/admin/users/${userId}/`);
        // Actualizar la lista de usuarios
        fetchUsers();
      } catch (err) {
        setError('Error al eliminar el usuario: ' + (err.response?.data?.detail || err.message));
      }
    }
  };

  const handleSearch = (e) => {
    e.preventDefault();
    setCurrentPage(1); // Resetear a la primera página al buscar
  };

  if (loading) return <div className="flex justify-center p-6"><div className="animate-spin rounded-full h-12 w-12 border-t-2 border-b-2 border-blue-500"></div></div>;
  
  if (error) return <div className="text-red-500 p-4 text-center">{error}</div>;

  return (
    <div className="container mx-auto px-4 py-6">
      <div className="flex justify-between items-center mb-6">
        <h1 className="text-2xl font-bold">Gestión de Usuarios Administradores</h1>
        <HasPermission requiredPermission="auth.add_user">
          <Link to="/admin/usuarios/administradores/nuevo" className="bg-blue-500 hover:bg-blue-600 text-white px-4 py-2 rounded">
            Nuevo Administrador
          </Link>
        </HasPermission>
      </div>

      <form onSubmit={handleSearch} className="mb-6">
        <div className="flex gap-2">
          <input
            type="text"
            value={searchTerm}
            onChange={(e) => setSearchTerm(e.target.value)}
            placeholder="Buscar por nombre o email..."
            className="flex-1 border rounded px-3 py-2"
          />
          <button type="submit" className="bg-gray-200 hover:bg-gray-300 px-4 py-2 rounded">
            Buscar
          </button>
        </div>
      </form>

      {users.length === 0 ? (
        <div className="text-center p-4 bg-gray-100 rounded">No se encontraron usuarios administradores</div>
      ) : (
        <div className="overflow-x-auto bg-white rounded-lg shadow">
          <table className="min-w-full divide-y divide-gray-200">
            <thead className="bg-gray-50">
              <tr>
                <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">ID</th>
                <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">Usuario</th>
                <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">Nombre</th>
                <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">Email</th>
                <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">Estado</th>
                <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">Grupos</th>
                <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">Acciones</th>
              </tr>
            </thead>
            <tbody className="bg-white divide-y divide-gray-200">
              {users.map((user) => (
                <tr key={user.id} className="hover:bg-gray-50">
                  <td className="px-6 py-4 whitespace-nowrap">{user.id}</td>
                  <td className="px-6 py-4 whitespace-nowrap font-medium">{user.username}</td>
                  <td className="px-6 py-4 whitespace-nowrap">
                    {user.first_name} {user.last_name}
                  </td>
                  <td className="px-6 py-4 whitespace-nowrap">{user.email}</td>
                  <td className="px-6 py-4 whitespace-nowrap">
                    <HasPermission requiredPermission="auth.change_user">
                      <button
                        onClick={() => handleStatusChange(user.id, user.is_active)}
                        className={`px-2 py-1 rounded text-xs font-semibold ${user.is_active ? 'bg-green-100 text-green-800' : 'bg-red-100 text-red-800'}`}
                      >
                        {user.is_active ? 'Activo' : 'Inactivo'}
                      </button>
                    </HasPermission>
                    {!HasPermission({ requiredPermission: "auth.change_user" }) && (
                      <span className={`px-2 py-1 rounded text-xs font-semibold ${user.is_active ? 'bg-green-100 text-green-800' : 'bg-red-100 text-red-800'}`}>
                        {user.is_active ? 'Activo' : 'Inactivo'}
                      </span>
                    )}
                  </td>
                  <td className="px-6 py-4 whitespace-nowrap">
                    {user.groups && user.groups.length > 0 ? (
                      <div className="flex flex-wrap gap-1">
                        {user.groups.map((group, idx) => (
                          <span key={idx} className="bg-blue-100 text-blue-800 text-xs px-2 py-1 rounded">
                            {group.name}
                          </span>
                        ))}
                      </div>
                    ) : (
                      <span className="text-gray-500 text-sm">Sin grupos</span>
                    )}
                  </td>
                  <td className="px-6 py-4 whitespace-nowrap space-x-2">
                    <HasPermission requiredPermission="auth.view_user">
                      <Link to={`/admin/usuarios/administradores/${user.id}`} className="text-blue-600 hover:text-blue-900">
                        Ver
                      </Link>
                    </HasPermission>
                    <HasPermission requiredPermission="auth.change_user">
                      <Link to={`/admin/usuarios/administradores/${user.id}/editar`} className="text-yellow-600 hover:text-yellow-900">
                        Editar
                      </Link>
                    </HasPermission>
                    <HasPermission requiredPermission="auth.delete_user">
                      <button 
                        onClick={() => handleDelete(user.id)} 
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
      
      {/* Paginación */}
      {totalPages > 1 && (
        <div className="flex justify-center mt-6">
          <nav className="flex items-center">
            <button 
              onClick={() => setCurrentPage(prev => Math.max(prev - 1, 1))}
              disabled={currentPage === 1}
              className={`px-3 py-1 rounded-l ${currentPage === 1 ? 'bg-gray-200 cursor-not-allowed' : 'bg-gray-100 hover:bg-gray-200'}`}
            >
              Anterior
            </button>
            <span className="px-4 py-1 bg-white border-t border-b">
              Página {currentPage} de {totalPages}
            </span>
            <button
              onClick={() => setCurrentPage(prev => Math.min(prev + 1, totalPages))}
              disabled={currentPage === totalPages}
              className={`px-3 py-1 rounded-r ${currentPage === totalPages ? 'bg-gray-200 cursor-not-allowed' : 'bg-gray-100 hover:bg-gray-200'}`}
            >
              Siguiente
            </button>
          </nav>
        </div>
      )}
    </div>
  );
};

export default UsersList;