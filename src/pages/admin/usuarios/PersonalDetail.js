import React, { useState, useEffect } from 'react';
import { Link } from 'react-router-dom';
import apiClient from '../../../api/axiosConfig';
import HasPermission from '../../../components/common/HasPermission';

const PersonalList = () => {
  const [personal, setPersonal] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);
  const [currentPage, setCurrentPage] = useState(1);
  const [totalPages, setTotalPages] = useState(0);
  const [searchTerm, setSearchTerm] = useState('');

  useEffect(() => {
    fetchPersonal();
  }, [currentPage, searchTerm]);

  const fetchPersonal = async () => {
    try {
      setLoading(true);
      let url = `/usuarios/personal/?page=${currentPage}`;
      if (searchTerm) {
        url += `&search=${searchTerm}`;
      }
      const response = await apiClient.get(url);
      setPersonal(response.data.results || response.data);
      
      // Configurar paginación si la API devuelve esa información
      if (response.data.count) {
        setTotalPages(Math.ceil(response.data.count / 10)); // Asumiendo 10 por página
      }
      
      setLoading(false);
    } catch (err) {
      setError('Error al cargar el personal: ' + (err.response?.data?.detail || err.message));
      setLoading(false);
    }
  };

  const handleDelete = async (id) => {
    if (window.confirm('¿Estás seguro de eliminar este personal? Esta acción no se puede deshacer.')) {
      try {
        await apiClient.delete(`/usuarios/personal/${id}/`);
        // Recargar la lista de personal
        fetchPersonal();
      } catch (err) {
        setError('Error al eliminar el personal: ' + (err.response?.data?.detail || err.message));
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
        <h1 className="text-2xl font-bold">Gestión de Personal</h1>
        <HasPermission requiredPermission="usuarios.add_personal">
          <Link to="/admin/usuarios/personals/nuevo" className="bg-blue-500 hover:bg-blue-600 text-white px-4 py-2 rounded">
            Nuevo Personal
          </Link>
        </HasPermission>
      </div>

      <form onSubmit={handleSearch} className="mb-6">
        <div className="flex gap-2">
          <input
            type="text"
            value={searchTerm}
            onChange={(e) => setSearchTerm(e.target.value)}
            placeholder="Buscar por nombre o cargo..."
            className="flex-1 border rounded px-3 py-2"
          />
          <button type="submit" className="bg-gray-200 hover:bg-gray-300 px-4 py-2 rounded">
            Buscar
          </button>
        </div>
      </form>

      {personal.length === 0 ? (
        <div className="text-center p-4 bg-gray-100 rounded">No se encontró personal</div>
      ) : (
        <div className="overflow-x-auto bg-white rounded-lg shadow">
          <table className="min-w-full divide-y divide-gray-200">
            <thead className="bg-gray-50">
              <tr>
                <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">ID</th>
                <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">Nombre</th>
                <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">Cargo</th>
                <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">Usuario</th>
                <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">Email</th>
                <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">Acciones</th>
              </tr>
            </thead>
            <tbody className="bg-white divide-y divide-gray-200">
              {personal.map((persona) => (
                <tr key={persona.id} className="hover:bg-gray-50">
                  <td className="px-6 py-4 whitespace-nowrap">{persona.id}</td>
                  <td className="px-6 py-4 whitespace-nowrap">{persona.nombre}</td>
                  <td className="px-6 py-4 whitespace-nowrap">{persona.cargo}</td>
                  <td className="px-6 py-4 whitespace-nowrap">{persona.usuario?.username || 'N/A'}</td>
                  <td className="px-6 py-4 whitespace-nowrap">{persona.usuario?.email || 'N/A'}</td>
                  <td className="px-6 py-4 whitespace-nowrap space-x-2">
                    <HasPermission requiredPermission="usuarios.view_personal">
                      <Link to={`/admin/usuarios/personals/${persona.id}`} className="text-blue-600 hover:text-blue-900">
                        Ver
                      </Link>
                    </HasPermission>
                    <HasPermission requiredPermission="usuarios.change_personal">
                      <Link to={`/admin/usuarios/personals/${persona.id}/editar`} className="text-yellow-600 hover:text-yellow-900">
                        Editar
                      </Link>
                    </HasPermission>
                    <HasPermission requiredPermission="usuarios.delete_personal">
                      <button 
                        onClick={() => handleDelete(persona.id)} 
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

export default PersonalList;