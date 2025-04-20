import React, { useState, useEffect } from 'react';
import { useParams, Link, useNavigate } from 'react-router-dom';
import apiClient from '../../../api/axiosConfig';
import HasPermission from '../../../components/common/HasPermission';

const UserDetail = () => {
  const { id } = useParams();
  const navigate = useNavigate();
  const [user, setUser] = useState(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);
  const [passwordResetInProgress, setPasswordResetInProgress] = useState(false);
  const [resetPasswordMessage, setResetPasswordMessage] = useState(null);

  useEffect(() => {
    const fetchUserData = async () => {
      try {
        setLoading(true);
        const response = await apiClient.get(`/admin/users/${id}/`);
        setUser(response.data);
        setLoading(false);
      } catch (err) {
        setError('Error al cargar los datos del usuario: ' + (err.response?.data?.detail || err.message));
        setLoading(false);
      }
    };

    fetchUserData();
  }, [id]);

  const handleStatusChange = async () => {
    try {
      const response = await apiClient.patch(`/admin/users/${id}/status/`, {
        is_active: !user.is_active
      });
      setUser({
        ...user,
        is_active: response.data.is_active
      });
    } catch (err) {
      setError('Error al cambiar el estado del usuario: ' + (err.response?.data?.detail || err.message));
    }
  };

  const handleResetPassword = async () => {
    if (window.confirm('¿Estás seguro de generar una nueva contraseña para este usuario? Se enviará por correo electrónico.')) {
      try {
        setPasswordResetInProgress(true);
        const response = await apiClient.post(`/admin/users/${id}/reset-password/`);
        setResetPasswordMessage(response.data.message || 'Se ha enviado una nueva contraseña al correo del usuario.');
        setPasswordResetInProgress(false);
      } catch (err) {
        setError('Error al restablecer la contraseña: ' + (err.response?.data?.detail || err.message));
        setPasswordResetInProgress(false);
      }
    }
  };

  const handleDelete = async () => {
    if (window.confirm('¿Estás seguro de eliminar este usuario? Esta acción no se puede deshacer.')) {
      try {
        await apiClient.delete(`/admin/users/${id}/`);
        navigate('/admin/usuarios/administradores');
      } catch (err) {
        setError('Error al eliminar el usuario: ' + (err.response?.data?.detail || err.message));
      }
    }
  };

  if (loading) return <div className="flex justify-center p-6"><div className="animate-spin rounded-full h-12 w-12 border-t-2 border-b-2 border-blue-500"></div></div>;
  
  if (error) return <div className="text-red-500 p-4 text-center">{error}</div>;
  
  if (!user) return <div className="text-center p-4">Usuario no encontrado</div>;

  return (
    <div className="container mx-auto px-4 py-6">
      <div className="flex justify-between items-center mb-6">
        <h1 className="text-2xl font-bold">Detalle del Usuario: {user.username}</h1>
        <div className="space-x-2">
          <Link to="/admin/usuarios/administradores" className="bg-gray-500 hover:bg-gray-600 text-white px-4 py-2 rounded">
            Volver
          </Link>
          <HasPermission requiredPermission="auth.change_user">
            <Link to={`/admin/usuarios/administradores/${id}/editar`} className="bg-yellow-500 hover:bg-yellow-600 text-white px-4 py-2 rounded">
              Editar
            </Link>
          </HasPermission>
          <HasPermission requiredPermission="auth.delete_user">
            <button 
              onClick={handleDelete}
              className="bg-red-500 hover:bg-red-600 text-white px-4 py-2 rounded">
              Eliminar
            </button>
          </HasPermission>
        </div>
      </div>

      {resetPasswordMessage && (
        <div className="bg-green-100 border border-green-400 text-green-700 px-4 py-3 rounded mb-4">
          {resetPasswordMessage}
        </div>
      )}

      <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
        {/* Información básica del usuario */}
        <div className="bg-white shadow rounded-lg p-6">
          <div className="flex justify-between items-center mb-4">
            <h2 className="text-xl font-semibold">Información del Usuario</h2>
            <HasPermission requiredPermission="auth.change_user">
              <button
                onClick={handleStatusChange}
                className={`px-3 py-1 rounded ${user.is_active ? 'bg-red-100 hover:bg-red-200 text-red-800' : 'bg-green-100 hover:bg-green-200 text-green-800'}`}
              >
                {user.is_active ? 'Desactivar' : 'Activar'}
              </button>
            </HasPermission>
          </div>
          <div className="space-y-4">
            <div>
              <p className="text-gray-600">Nombre de usuario:</p>
              <p className="font-medium">{user.username}</p>
            </div>
            <div>
              <p className="text-gray-600">Nombre completo:</p>
              <p className="font-medium">{`${user.first_name || ''} ${user.last_name || ''}`}</p>
            </div>
            <div>
              <p className="text-gray-600">Email:</p>
              <p className="font-medium">{user.email}</p>
            </div>
            <div>
              <p className="text-gray-600">Estado:</p>
              <p className={`font-medium ${user.is_active ? 'text-green-600' : 'text-red-600'}`}>
                {user.is_active ? 'Activo' : 'Inactivo'}
              </p>
            </div>
            <div>
              <p className="text-gray-600">Es staff:</p>
              <p className="font-medium">{user.is_staff ? 'Sí' : 'No'}</p>
            </div>
            <div>
              <p className="text-gray-600">Es superusuario:</p>
              <p className="font-medium">{user.is_superuser ? 'Sí' : 'No'}</p>
            </div>
            <div>
              <p className="text-gray-600">Fecha de registro:</p>
              <p className="font-medium">{new Date(user.date_joined).toLocaleString()}</p>
            </div>
            <div>
              <p className="text-gray-600">Último acceso:</p>
              <p className="font-medium">{user.last_login ? new Date(user.last_login).toLocaleString() : 'Nunca'}</p>
            </div>
          </div>
          
          <div className="mt-6">
            <HasPermission requiredPermission="auth.change_user">
              <button
                onClick={handleResetPassword}
                disabled={passwordResetInProgress}
                className="px-4 py-2 bg-blue-100 hover:bg-blue-200 text-blue-700 rounded transition-colors"
              >
                {passwordResetInProgress ? 'Procesando...' : 'Restablecer contraseña'}
              </button>
            </HasPermission>
          </div>
        </div>

        {/* Grupos y permisos */}
        <div className="bg-white shadow rounded-lg p-6">
          <h2 className="text-xl font-semibold mb-4">Grupos y Permisos</h2>
          
          <div className="mb-6">
            <h3 className="font-medium text-lg mb-2">Grupos asignados</h3>
            {user.groups && user.groups.length > 0 ? (
              <div className="space-y-2">
                {user.groups.map((group, idx) => (
                  <div key={idx} className="flex justify-between items-center bg-gray-50 p-3 rounded">
                    <span className="font-medium">{group.name}</span>
                    <HasPermission requiredPermission="auth.view_group">
                      <Link to={`/admin/usuarios/grupos/${group.id}`} className="text-blue-600 hover:text-blue-800 text-sm">
                        Ver grupo
                      </Link>
                    </HasPermission>
                  </div>
                ))}
              </div>
            ) : (
              <p className="text-gray-500">El usuario no pertenece a ningún grupo</p>
            )}
          </div>
          
          <div>
            <h3 className="font-medium text-lg mb-2">Permisos directos</h3>
            {user.user_permissions && user.user_permissions.length > 0 ? (
              <div className="grid grid-cols-1 sm:grid-cols-2 gap-2">
                {user.user_permissions.map((permission, idx) => (
                  <div key={idx} className="text-sm bg-gray-50 p-2 rounded">
                    {permission}
                  </div>
                ))}
              </div>
            ) : (
              <p className="text-gray-500">El usuario no tiene permisos directos asignados</p>
            )}
          </div>
        </div>
      </div>
    </div>
  );
};

export default UserDetail;