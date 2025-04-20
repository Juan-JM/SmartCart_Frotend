import React, { useState, useEffect } from 'react';
import { useParams, useNavigate } from 'react-router-dom';
import apiClient from '../../../api/axiosConfig';

const UserForm = () => {
  const { id } = useParams();
  const navigate = useNavigate();
  const isEditing = Boolean(id);
  
  const [formData, setFormData] = useState({
    username: '',
    first_name: '',
    last_name: '',
    email: '',
    password: '',
    password2: '',
    is_staff: true,
    is_superuser: false,
    is_active: true,
    groups: []
  });
  
  const [availableGroups, setAvailableGroups] = useState([]);
  const [loading, setLoading] = useState(true);
  const [saving, setSaving] = useState(false);
  const [error, setError] = useState(null);
  const [feedbackMsg, setFeedbackMsg] = useState(null);

  useEffect(() => {
    const fetchData = async () => {
      try {
        setLoading(true);
        
        // Obtener los grupos disponibles
        const groupsResponse = await apiClient.get('/auth/groups/');
        setAvailableGroups(groupsResponse.data);
        
        // Si estamos editando, cargar los datos del usuario
        if (isEditing) {
          const userResponse = await apiClient.get(`/usuarios/users/${id}/`);
          const userData = userResponse.data;
          
          setFormData({
            username: userData.username || '',
            first_name: userData.first_name || '',
            last_name: userData.last_name || '',
            email: userData.email || '',
            password: '',
            password2: '',
            is_staff: userData.is_staff,
            is_superuser: userData.is_superuser,
            is_active: userData.is_active,
            groups: userData.groups?.map(g => g.id) || []
          });
        }
        
        setLoading(false);
      } catch (err) {
        setError('Error al cargar datos: ' + (err.response?.data?.detail || err.message));
        setLoading(false);
      }
    };
    
    fetchData();
  }, [id, isEditing]);

  const handleChange = (e) => {
    const { name, value, type, checked } = e.target;
    setFormData({
      ...formData,
      [name]: type === 'checkbox' ? checked : value
    });
  };

  const handleGroupChange = (groupId) => {
    // Convertir a número para asegurar comparación consistente
    groupId = parseInt(groupId);
    
    const isSelected = formData.groups.includes(groupId);
    
    if (isSelected) {
      setFormData({
        ...formData,
        groups: formData.groups.filter(id => id !== groupId)
      });
    } else {
      setFormData({
        ...formData,
        groups: [...formData.groups, groupId]
      });
    }
  };

  const validateForm = () => {
    // Validar contraseñas solo si estamos creando un nuevo usuario o si se ha ingresado una contraseña
    if (!isEditing || (formData.password && formData.password2)) {
      if (formData.password !== formData.password2) {
        setError('Las contraseñas no coinciden');
        return false;
      }
      
      if (!isEditing && formData.password.length < 8) {
        setError('La contraseña debe tener al menos 8 caracteres');
        return false;
      }
    }
    
    return true;
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    setError(null);
    setFeedbackMsg(null);
    
    if (!validateForm()) {
      return;
    }
    
    setSaving(true);
    
    try {
      let response;
      
      if (isEditing) {
        // Preparar datos para actualización (eliminar campos vacíos de contraseña)
        const updateData = { ...formData };
        if (!updateData.password) {
          delete updateData.password;
          delete updateData.password2;
        }
        
        // Actualizar usuario existente
        response = await apiClient.put(`/usuarios/users/${id}/`, updateData);
        setFeedbackMsg('Usuario actualizado correctamente');
      } else {
        // Crear nuevo usuario
        response = await apiClient.post('/usuarios/users/', formData);
        setFeedbackMsg('Usuario creado correctamente');
        
        // Redirigir a la lista de usuarios después de crear
        setTimeout(() => {
          navigate('/admin/usuarios/administradores');
        }, 2000);
      }
      
      setSaving(false);
    } catch (err) {
      const errorMsg = err.response?.data?.detail || 
                       Object.values(err.response?.data || {}).flat().join(', ') ||
                       err.message;
      setError('Error: ' + errorMsg);
      setSaving(false);
    }
  };

  if (loading) return <div className="flex justify-center p-6"><div className="animate-spin rounded-full h-12 w-12 border-t-2 border-b-2 border-blue-500"></div></div>;

  return (
    <div className="container mx-auto px-4 py-6">
      <div className="flex justify-between items-center mb-6">
        <h1 className="text-2xl font-bold">
          {isEditing ? `Editar Usuario: ${formData.username}` : 'Nuevo Usuario Administrador'}
        </h1>
        <button
          onClick={() => navigate('/admin/usuarios/administradores')}
          className="bg-gray-500 hover:bg-gray-600 text-white px-4 py-2 rounded"
        >
          Cancelar
        </button>
      </div>

      {error && (
        <div className="bg-red-100 border border-red-400 text-red-700 px-4 py-3 rounded mb-4">
          {error}
        </div>
      )}

      {feedbackMsg && (
        <div className="bg-green-100 border border-green-400 text-green-700 px-4 py-3 rounded mb-4">
          {feedbackMsg}
        </div>
      )}

      <form onSubmit={handleSubmit} className="bg-white shadow-md rounded px-8 pt-6 pb-8 mb-4">
        <div className="mb-6">
          <h2 className="text-xl font-semibold mb-4">Información básica</h2>
          <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
            <div className="mb-4">
              <label className="block text-gray-700 text-sm font-bold mb-2" htmlFor="username">
                Nombre de usuario *
              </label>
              <input
                className="shadow appearance-none border rounded w-full py-2 px-3 text-gray-700 leading-tight focus:outline-none focus:shadow-outline"
                id="username"
                type="text"
                name="username"
                value={formData.username}
                onChange={handleChange}
                required
                disabled={isEditing} // No permitir cambiar el username en edición
              />
            </div>
            <div className="mb-4">
              <label className="block text-gray-700 text-sm font-bold mb-2" htmlFor="email">
                Email *
              </label>
              <input
                className="shadow appearance-none border rounded w-full py-2 px-3 text-gray-700 leading-tight focus:outline-none focus:shadow-outline"
                id="email"
                type="email"
                name="email"
                value={formData.email}
                onChange={handleChange}
                required
              />
            </div>
            <div className="mb-4">
              <label className="block text-gray-700 text-sm font-bold mb-2" htmlFor="first_name">
                Nombre
              </label>
              <input
                className="shadow appearance-none border rounded w-full py-2 px-3 text-gray-700 leading-tight focus:outline-none focus:shadow-outline"
                id="first_name"
                type="text"
                name="first_name"
                value={formData.first_name}
                onChange={handleChange}
              />
            </div>
            <div className="mb-4">
              <label className="block text-gray-700 text-sm font-bold mb-2" htmlFor="last_name">
                Apellido
              </label>
              <input
                className="shadow appearance-none border rounded w-full py-2 px-3 text-gray-700 leading-tight focus:outline-none focus:shadow-outline"
                id="last_name"
                type="text"
                name="last_name"
                value={formData.last_name}
                onChange={handleChange}
              />
            </div>
          </div>
        </div>

        <div className="mb-6">
          <h2 className="text-xl font-semibold mb-4">Contraseña</h2>
          <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
            <div className="mb-4">
              <label className="block text-gray-700 text-sm font-bold mb-2" htmlFor="password">
                {isEditing ? 'Nueva contraseña (dejar en blanco para mantener la actual)' : 'Contraseña *'}
              </label>
              <input
                className="shadow appearance-none border rounded w-full py-2 px-3 text-gray-700 leading-tight focus:outline-none focus:shadow-outline"
                id="password"
                type="password"
                name="password"
                value={formData.password}
                onChange={handleChange}
                required={!isEditing}
              />
            </div>
            <div className="mb-4">
              <label className="block text-gray-700 text-sm font-bold mb-2" htmlFor="password2">
                {isEditing ? 'Confirmar nueva contraseña' : 'Confirmar contraseña *'}
              </label>
              <input
                className="shadow appearance-none border rounded w-full py-2 px-3 text-gray-700 leading-tight focus:outline-none focus:shadow-outline"
                id="password2"
                type="password"
                name="password2"
                value={formData.password2}
                onChange={handleChange}
                required={!isEditing}
              />
            </div>
          </div>
        </div>

        <div className="mb-6">
          <h2 className="text-xl font-semibold mb-4">Permisos y grupos</h2>
          
          <div className="flex flex-col space-y-4 mb-6">
            <div className="flex items-center">
              <input
                type="checkbox"
                id="is_active"
                name="is_active"
                checked={formData.is_active}
                onChange={handleChange}
                className="h-4 w-4 text-blue-600 focus:ring-blue-500 border-gray-300 rounded"
              />
              <label htmlFor="is_active" className="ml-2 block text-sm text-gray-900">
                Usuario activo
              </label>
            </div>
            
            <div className="flex items-center">
              <input
                type="checkbox"
                id="is_staff"
                name="is_staff"
                checked={formData.is_staff}
                onChange={handleChange}
                className="h-4 w-4 text-blue-600 focus:ring-blue-500 border-gray-300 rounded"
              />
              <label htmlFor="is_staff" className="ml-2 block text-sm text-gray-900">
                Acceso al panel de administración (staff)
              </label>
            </div>
            
            <div className="flex items-center">
              <input
                type="checkbox"
                id="is_superuser"
                name="is_superuser"
                checked={formData.is_superuser}
                onChange={handleChange}
                className="h-4 w-4 text-blue-600 focus:ring-blue-500 border-gray-300 rounded"
              />
              <label htmlFor="is_superuser" className="ml-2 block text-sm text-gray-900">
                Superusuario (todos los permisos sin asignación explícita)
              </label>
            </div>
          </div>
          
          <div>
            <h3 className="font-medium text-lg mb-3">Grupos</h3>
            {availableGroups.length > 0 ? (
              <div className="grid grid-cols-1 sm:grid-cols-2 md:grid-cols-3 gap-3 mb-4">
                {availableGroups.map(group => (
                  <div key={group.id} className="flex items-center">
                    <input
                      type="checkbox"
                      id={`group-${group.id}`}
                      checked={formData.groups.includes(group.id)}
                      onChange={() => handleGroupChange(group.id)}
                      className="h-4 w-4 text-blue-600 focus:ring-blue-500 border-gray-300 rounded"
                    />
                    <label htmlFor={`group-${group.id}`} className="ml-2 block text-sm text-gray-900">
                      {group.name}
                    </label>
                  </div>
                ))}
              </div>
            ) : (
              <p className="text-gray-500 mb-4">No hay grupos disponibles</p>
            )}
          </div>
        </div>

        <div className="flex items-center justify-end">
          <button
            className="bg-blue-500 hover:bg-blue-700 text-white font-bold py-2 px-4 rounded focus:outline-none focus:shadow-outline"
            type="submit"
            disabled={saving}
          >
            {saving ? (
              <span className="flex items-center">
                <svg className="animate-spin -ml-1 mr-3 h-5 w-5 text-white" xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24">
                  <circle className="opacity-25" cx="12" cy="12" r="10" stroke="currentColor" strokeWidth="4"></circle>
                  <path className="opacity-75" fill="currentColor" d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4zm2 5.291A7.962 7.962 0 014 12H0c0 3.042 1.135 5.824 3 7.938l3-2.647z"></path>
                </svg>
                Guardando...
              </span>
            ) : (
              'Guardar'
            )}
          </button>
        </div>
      </form>
    </div>
  );
};

export default UserForm;