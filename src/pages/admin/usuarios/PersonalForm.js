import React, { useState, useEffect } from 'react';
import { useParams, useNavigate } from 'react-router-dom';
import apiClient from '../../../api/axiosConfig';

const PersonalForm = () => {
  const { id } = useParams();
  const navigate = useNavigate();
  const isEditing = Boolean(id);
  
  const [formData, setFormData] = useState({
    nombre: '',
    usuario: {
      username: '',
      email: '',
      first_name: '',
      last_name: '',
      password: '',
      password2: '',
      is_staff: true // El personal siempre es staff
    },
    groups: [] // Grupos seleccionados
  });
  
  const [availableGroups, setAvailableGroups] = useState([]);
  const [loading, setLoading] = useState(true);
  const [saving, setSaving] = useState(false);
  const [error, setError] = useState(null);
  const [feedbackMsg, setFeedbackMsg] = useState(null);

  useEffect(() => {
    // Cargar los grupos disponibles
    const fetchGroups = async () => {
      try {
        const response = await apiClient.get('/usuarios/grupos/');
        // Filtrar grupos de personal: Vendedor, Reponedor, Administrador
        const staffGroups = response.data.filter(group => 
          ['Vendedor', 'Reponedor', 'Administrador'].includes(group.name)
        );
        setAvailableGroups(staffGroups);
        
        if (isEditing) {
          // Si es edición, también cargar los datos del personal
          fetchPersonal();
        } else {
          setLoading(false);
        }
      } catch (err) {
        setError('Error al cargar los grupos: ' + (err.response?.data?.detail || err.message));
        setLoading(false);
      }
    };
    
    fetchGroups();
  }, [id]);

  const fetchPersonal = async () => {
    try {
      const response = await apiClient.get(`/usuarios/personal/${id}/`);
      const personalData = response.data;
      
      setFormData({
        nombre: personalData.nombre || '',
        usuario: {
          username: personalData.usuario?.username || '',
          email: personalData.usuario?.email || '',
          first_name: personalData.usuario?.first_name || '',
          last_name: personalData.usuario?.last_name || '',
          password: '',
          password2: '',
          is_staff: true
        },
        groups: personalData.usuario?.groups?.map(g => g.id) || []
      });
      
      setLoading(false);
    } catch (err) {
      setError('Error al cargar los datos del personal: ' + (err.response?.data?.detail || err.message));
      setLoading(false);
    }
  };

  const handleChange = (e) => {
    const { name, value } = e.target;
    
    if (name.includes('usuario.')) {
      const userField = name.split('.')[1];
      setFormData({
        ...formData,
        usuario: {
          ...formData.usuario,
          [userField]: value
        }
      });
    } else {
      setFormData({
        ...formData,
        [name]: value
      });
    }
  };

  const handleGroupChange = (groupId) => {
    // Verificar si el grupo ya está seleccionado
    const isSelected = formData.groups.includes(groupId);
    
    if (isSelected) {
      // Remover el grupo si ya está seleccionado
      setFormData({
        ...formData,
        groups: formData.groups.filter(id => id !== groupId)
      });
    } else {
      // Añadir el grupo si no está seleccionado
      setFormData({
        ...formData,
        groups: [...formData.groups, groupId]
      });
    }
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    setError(null);
    setFeedbackMsg(null);
    setSaving(true);
    
    try {
      let response;
      
      if (isEditing) {
        // Actualizar personal existente
        const updateData = {
          nombre: formData.nombre,
          // No enviamos usuario completo, probablemente se maneja en otro endpoint
        };
        
        response = await apiClient.put(`/usuarios/personal/${id}/`, updateData);
        
        // Si hay grupos para actualizar, hacer una petición adicional
        if (formData.groups.length > 0) {
          await apiClient.put(`/admin/users/${response.data.usuario.id}/groups/`, {
            groups: formData.groups
          });
        }
        
        setFeedbackMsg('Personal actualizado correctamente');
      } else {
        // Crear nuevo personal
        const registerData = {
          nombre: formData.nombre,
          username: formData.usuario.username,
          email: formData.usuario.email,
          password: formData.usuario.password,
          password2: formData.usuario.password2,
          first_name: formData.usuario.first_name,
          last_name: formData.usuario.last_name,
          is_staff: true,
          groups: formData.groups
        };
        
        response = await apiClient.post('/usuarios/personal/', registerData);
        setFeedbackMsg('Personal creado correctamente');
        
        // Redirigir a la lista de personal después de crear
        setTimeout(() => {
          navigate('/admin/usuarios/personals');
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
          {isEditing ? 'Editar Personal' : 'Nuevo Personal'}
        </h1>
        <button
          onClick={() => navigate('/admin/usuarios/personals')}
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
          <h2 className="text-xl font-semibold mb-4">Información del Personal</h2>
          <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
            <div className="mb-4">
              <label className="block text-gray-700 text-sm font-bold mb-2" htmlFor="nombre">
                Nombre completo *
              </label>
              <input
                className="shadow appearance-none border rounded w-full py-2 px-3 text-gray-700 leading-tight focus:outline-none focus:shadow-outline"
                id="nombre"
                type="text"
                name="nombre"
                value={formData.nombre}
                onChange={handleChange}
                required
              />
            </div>
          </div>
          
          <div className="mb-6">
            <h3 className="text-lg font-medium mb-3">Rol de Personal</h3>
            <div className="grid grid-cols-1 sm:grid-cols-2 md:grid-cols-3 gap-4">
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
            {formData.groups.length === 0 && (
              <p className="text-red-500 text-sm mt-2">Seleccione al menos un rol</p>
            )}
          </div>
        </div>

        {/* Información de usuario solo para creación, no para edición */}
        {!isEditing && (
          <div className="mb-6">
            <h2 className="text-xl font-semibold mb-4">Información de Cuenta</h2>
            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
              <div className="mb-4">
                <label className="block text-gray-700 text-sm font-bold mb-2" htmlFor="usuario.username">
                  Nombre de usuario *
                </label>
                <input
                  className="shadow appearance-none border rounded w-full py-2 px-3 text-gray-700 leading-tight focus:outline-none focus:shadow-outline"
                  id="usuario.username"
                  type="text"
                  name="usuario.username"
                  value={formData.usuario.username}
                  onChange={handleChange}
                  required
                />
              </div>
              <div className="mb-4">
                <label className="block text-gray-700 text-sm font-bold mb-2" htmlFor="usuario.email">
                  Email *
                </label>
                <input
                  className="shadow appearance-none border rounded w-full py-2 px-3 text-gray-700 leading-tight focus:outline-none focus:shadow-outline"
                  id="usuario.email"
                  type="email"
                  name="usuario.email"
                  value={formData.usuario.email}
                  onChange={handleChange}
                  required
                />
              </div>
              <div className="mb-4">
                <label className="block text-gray-700 text-sm font-bold mb-2" htmlFor="usuario.first_name">
                  Nombre
                </label>
                <input
                  className="shadow appearance-none border rounded w-full py-2 px-3 text-gray-700 leading-tight focus:outline-none focus:shadow-outline"
                  id="usuario.first_name"
                  type="text"
                  name="usuario.first_name"
                  value={formData.usuario.first_name}
                  onChange={handleChange}
                />
              </div>
              <div className="mb-4">
                <label className="block text-gray-700 text-sm font-bold mb-2" htmlFor="usuario.last_name">
                  Apellido
                </label>
                <input
                  className="shadow appearance-none border rounded w-full py-2 px-3 text-gray-700 leading-tight focus:outline-none focus:shadow-outline"
                  id="usuario.last_name"
                  type="text"
                  name="usuario.last_name"
                  value={formData.usuario.last_name}
                  onChange={handleChange}
                />
              </div>
              <div className="mb-4">
                <label className="block text-gray-700 text-sm font-bold mb-2" htmlFor="usuario.password">
                  Contraseña *
                </label>
                <input
                  className="shadow appearance-none border rounded w-full py-2 px-3 text-gray-700 leading-tight focus:outline-none focus:shadow-outline"
                  id="usuario.password"
                  type="password"
                  name="usuario.password"
                  value={formData.usuario.password}
                  onChange={handleChange}
                  required
                />
              </div>
              <div className="mb-4">
                <label className="block text-gray-700 text-sm font-bold mb-2" htmlFor="usuario.password2">
                  Confirmar contraseña *
                </label>
                <input
                  className="shadow appearance-none border rounded w-full py-2 px-3 text-gray-700 leading-tight focus:outline-none focus:shadow-outline"
                  id="usuario.password2"
                  type="password"
                  name="usuario.password2"
                  value={formData.usuario.password2}
                  onChange={handleChange}
                  required
                />
              </div>
            </div>
          </div>
        )}

        <div className="flex items-center justify-end">
          <button
            className="bg-blue-500 hover:bg-blue-700 text-white font-bold py-2 px-4 rounded focus:outline-none focus:shadow-outline"
            type="submit"
            disabled={saving || formData.groups.length === 0}
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

export default PersonalForm;