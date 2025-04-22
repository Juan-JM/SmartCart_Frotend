//src/pages/admin/usuarios/groupdetail
import React, { useState, useEffect } from 'react';
import { useParams, Link, useNavigate } from 'react-router-dom';
import apiClient from '../../../api/axiosConfig';
import HasPermission from '../../../components/common/HasPermission';

const GroupDetail = () => {
  const { id } = useParams();
  const navigate = useNavigate();
  const [group, setGroup] = useState(null);
  const [groupUsers, setGroupUsers] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);

  useEffect(() => {
    const fetchGroupData = async () => {
      try {
        setLoading(true);
        // Obtener detalles del grupo
        const groupResponse = await apiClient.get(`/usuarios/grupos/${id}/`);
        console.log('groupResponse ', groupResponse.data);
        setGroup(groupResponse.data);

        // Obtener usuarios que pertenecen al grupo
        const usersResponse = await apiClient.get(`/usuarios/grupos/${id}/`);
        setGroupUsers(usersResponse.data);

        setLoading(false);
      } catch (err) {
        setError('Error al cargar los datos del grupo: ' + (err.response?.data?.detail || err.message));
        setLoading(false);
      }
    };

    fetchGroupData();
  }, [id]);

  const handleDelete = async () => {
    if (window.confirm('¿Estás seguro de eliminar este grupo? Esta acción no se puede deshacer y podría afectar a usuarios.')) {
      try {
        await apiClient.delete(`/usuarios/grupos/${id}/`);
        navigate('/admin/usuarios/grupos');
      } catch (err) {
        setError('Error al eliminar el grupo: ' + (err.response?.data?.detail || err.message));
      }
    }
  };

  if (loading) return <div className="flex justify-center p-6"><div className="animate-spin rounded-full h-12 w-12 border-t-2 border-b-2 border-blue-500"></div></div>;

  if (error) return <div className="text-red-500 p-4 text-center">{error}</div>;

  if (!group) return <div className="text-center p-4">Grupo no encontrado</div>;

  // Agrupar permisos por aplicación
  const permissionsByApp = {};
  if (group.permissions && group.permissions.length > 0) {
    // console.log('group ', group.permissions);
    group.permissions.forEach(perm => {
      const app = 'permissions'
      //const [app, action] = permission.split('.');
      if (!permissionsByApp[app]) {
        permissionsByApp[app] = [];
      }
      permissionsByApp[app].push(perm.codename);
    });
    // console.log('permissionsByApp ',permissionsByApp)
  }

  return (
    <div className="container mx-auto px-4 py-6">
      <div className="flex justify-between items-center mb-6">
        <h1 className="text-2xl font-bold">Detalle del Grupo: {group.name}</h1>
        <div className="space-x-2">
          <Link to="/admin/usuarios/grupos" className="bg-gray-500 hover:bg-gray-600 text-white px-4 py-2 rounded">
            Volver
          </Link>
          <HasPermission requiredPermission="auth.change_group">
            <Link to={`/admin/usuarios/grupos/${id}/editar`} className="bg-yellow-500 hover:bg-yellow-600 text-white px-4 py-2 rounded">
              Editar
            </Link>
          </HasPermission>
          <HasPermission requiredPermission="auth.delete_group">
            <button
              onClick={handleDelete}
              className="bg-red-500 hover:bg-red-600 text-white px-4 py-2 rounded">
              Eliminar
            </button>
          </HasPermission>
        </div>
      </div>

      <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
        {/* Información del grupo */}
        <div className="bg-white shadow rounded-lg p-6">
          <h2 className="text-xl font-semibold mb-4">Información del Grupo</h2>
          <div className="space-y-4">
            <div>
              <p className="text-gray-600">Nombre:</p>
              <p className="font-medium text-lg">{group.name}</p>
            </div>
            <div>
              <p className="text-gray-600">Usuarios asignados:</p>
              <p className="font-medium">{groupUsers.length}</p>
            </div>
            <div>
              <p className="text-gray-600">Permisos asignados:</p>
              <p className="font-medium">{group.permissions?.length || 0}</p>
            </div>
          </div>
        </div>

        {/* Lista de permisos */}
        <div className="bg-white shadow rounded-lg p-6">
          <h2 className="text-xl font-semibold mb-4">Permisos</h2>
          {Object.keys(permissionsByApp).length > 0 ? (
            <div className="space-y-4">
              {Object.entries(permissionsByApp).map(([app, actions]) => (
                <div key={app} className="border-b pb-3 last:border-b-0">
                  {/* <h3 className="font-medium text-lg mb-2 capitalize">{app}</h3> */}
                  <ul className="list-disc pl-5 space-y-1">
                    {actions.map((action, index) => (
                      <li key={index} className="text-sm text-gray-700">{action}</li>
                    ))}
                  </ul>
                </div>
              ))}
            </div>
          ) : (
            <p className="text-gray-500">Este grupo no tiene permisos asignados</p>
          )}
        </div>
      </div>

      {/* Lista de usuarios en el grupo */}
      <div className="bg-white shadow rounded-lg p-6 mt-6">
        <h2 className="text-xl font-semibold mb-4">Usuarios en este grupo</h2>
        {groupUsers.length > 0 ? (
          <div className="overflow-x-auto">
            <table className="min-w-full divide-y divide-gray-200">
              <thead className="bg-gray-50">
                <tr>
                  <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">ID</th>
                  <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">Username</th>
                  <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">Nombre</th>
                  <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">Email</th>
                  <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">Acción</th>
                </tr>
              </thead>
              <tbody className="bg-white divide-y divide-gray-200">
                {groupUsers.map((user) => (
                  <tr key={user.id} className="hover:bg-gray-50">
                    <td className="px-6 py-4 whitespace-nowrap">{user.id}</td>
                    <td className="px-6 py-4 whitespace-nowrap font-medium">{user.username}</td>
                    <td className="px-6 py-4 whitespace-nowrap">
                      {user.first_name} {user.last_name}
                    </td>
                    <td className="px-6 py-4 whitespace-nowrap">{user.email}</td>
                    <td className="px-6 py-4 whitespace-nowrap">
                      <HasPermission requiredPermission="auth.view_user">
                        <Link
                          to={user.is_staff ? `/admin/usuarios/personals/${user.personal_id}` : `/admin/usuarios/clientes/${user.cliente_id}`}
                          className="text-blue-600 hover:text-blue-900">
                          Ver perfil
                        </Link>
                      </HasPermission>
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        ) : (
          <p className="text-gray-500">No hay usuarios asignados a este grupo</p>
        )}
      </div>
    </div>
  );
};

export default GroupDetail;