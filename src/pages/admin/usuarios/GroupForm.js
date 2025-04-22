import React, { useState, useEffect } from 'react';
import { useParams, useNavigate } from 'react-router-dom';
import apiClient from '../../../api/axiosConfig';

const GroupForm = () => {
  const { id } = useParams();
  const navigate = useNavigate();
  const isEditing = Boolean(id);
  
  const [formData, setFormData] = useState({
    name: '',
    permissions: []
  });
  
  const [availablePermissions, setAvailablePermissions] = useState({});
  const [loading, setLoading] = useState(true);
  const [saving, setSaving] = useState(false);
  const [error, setError] = useState(null);
  const [feedbackMsg, setFeedbackMsg] = useState(null);

  // Categorías de permisos más claras para los usuarios
  const permissionCategories = {
    'auth': 'Autenticación y Usuarios',
    'usuarios': 'Perfiles de Usuarios',
    'productos': 'Productos y Catálogo',
    'inventario': 'Inventario y Stock',
    'ventas': 'Ventas y Facturas',
    'admin': 'Administración',
    'contenttypes': 'Tipos de Contenido',
    'sessions': 'Sesiones',
  };

  // Traducción simple de acciones comunes
  const actionTranslations = {
    'add': 'Agregar',
    'change': 'Modificar',
    'delete': 'Eliminar',
    'view': 'Ver',
  };

  useEffect(() => {
    const fetchData = async () => {
      try {
        setLoading(true);
        
        // Obtener todos los permisos disponibles
        const permsResponse = await apiClient.get('/usuarios/permisos/');
        
        // Organizar permisos por aplicación
        const permsByApp = {};
        permsResponse.data.forEach(perm => {
          const [app, action] = perm.codename.split('_', 2);
          if (!permsByApp[app]) {
            permsByApp[app] = [];
          }
          permsByApp[app].push({
            id: perm.id,
            codename: perm.codename,
            name: perm.name
          });
        });
        
        setAvailablePermissions(permsByApp);
        
        // Si estamos editando, obtener datos del grupo
        if (isEditing) {
          const groupResponse = await apiClient.get(`/usuarios/grupos/${id}/`);
          setFormData({
            name: groupResponse.data.name,
            permissions: groupResponse.data.permissions.map(p => parseInt(p.id))
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
    const { name, value } = e.target;
    setFormData({
      ...formData,
      [name]: value
    });
  };

  const handlePermissionChange = (permId) => {
    // Convert permId to number to ensure consistent comparison
    permId = parseInt(permId);
    
    // Check if permission is already selected
    const isSelected = formData.permissions.includes(permId);
    
    if (isSelected) {
      // Remove permission if already selected
      setFormData({
        ...formData,
        permissions: formData.permissions.filter(id => id !== permId)
      });
    } else {
      // Add permission if not selected
      setFormData({
        ...formData,
        permissions: [...formData.permissions, permId]
      });
    }
  };

  // Helper to check if all permissions in an app are selected
  const areAllAppPermissionsSelected = (appPerms) => {
    const permIds = appPerms.map(p => p.id);
    return permIds.every(id => formData.permissions.includes(id));
  };

  // Function to toggle all permissions for an app
  const toggleAppPermissions = (appPerms) => {
    const permIds = appPerms.map(p => p.id);
    
    if (areAllAppPermissionsSelected(appPerms)) {
      // If all are selected, unselect all
      setFormData({
        ...formData,
        permissions: formData.permissions.filter(id => !permIds.includes(id))
      });
    } else {
      // If not all selected, select all
      const currentSelected = new Set(formData.permissions);
      permIds.forEach(id => currentSelected.add(id));
      setFormData({
        ...formData,
        permissions: Array.from(currentSelected)
      });
    }
  };

  const formatPermissionName = (codename) => {
    const [model, action] = codename.split('_');
    return `${actionTranslations[action] || action} ${model}`;
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    setError(null);
    setFeedbackMsg(null);
    setSaving(true);
    
    try {
      let response;
      
      if (isEditing) {
        // Actualizar grupo existente
        response = await apiClient.put(`/usuarios/grupos/${id}/`, formData);
        setFeedbackMsg('Grupo actualizado correctamente');
      } else {
        // Crear nuevo grupo
        response = await apiClient.post('/usuarios/grupos/', formData);
        setFeedbackMsg('Grupo creado correctamente');
        
        // Redirigir a la lista de grupos después de crear
        setTimeout(() => {
          navigate('/admin/usuarios/grupos');
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
          {isEditing ? `Editar Grupo: ${formData.name}` : 'Nuevo Grupo'}
        </h1>
        <button
          onClick={() => navigate('/admin/usuarios/grupos')}
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
          <h2 className="text-xl font-semibold mb-4">Información del Grupo</h2>
          <div className="mb-4">
            <label className="block text-gray-700 text-sm font-bold mb-2" htmlFor="name">
              Nombre del Grupo *
            </label>
            <input
              className="shadow appearance-none border rounded w-full py-2 px-3 text-gray-700 leading-tight focus:outline-none focus:shadow-outline"
              id="name"
              type="text"
              name="name"
              value={formData.name}
              onChange={handleChange}
              required
            />
          </div>
        </div>

        <div className="mb-6">
          <h2 className="text-xl font-semibold mb-4">Permisos del Grupo</h2>
          <p className="text-gray-600 mb-4">Seleccione los permisos que desea asignar a este grupo:</p>
          
          <div className="space-y-6">
            {Object.entries(availablePermissions).map(([app, perms]) => (
              <div key={app} className="border-b pb-4 last:border-b-0">
                <div className="flex items-center mb-3">
                  <input
                    type="checkbox"
                    id={`app-${app}`}
                    checked={areAllAppPermissionsSelected(perms)}
                    onChange={() => toggleAppPermissions(perms)}
                    className="h-4 w-4 text-blue-600 focus:ring-blue-500 border-gray-300 rounded"
                  />
                  <label htmlFor={`app-${app}`} className="ml-2 block text-gray-900 font-medium">
                    {permissionCategories[app] || app.charAt(0).toUpperCase() + app.slice(1)}
                  </label>
                </div>
                
                <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-2 ml-6">
                  {perms.map(perm => (
                    <div key={perm.id} className="flex items-start">
                      <input
                        type="checkbox"
                        id={`perm-${perm.id}`}
                        checked={formData.permissions.includes(perm.id)}
                        onChange={() => handlePermissionChange(perm.id)}
                        className="h-4 w-4 mt-1 text-blue-600 focus:ring-blue-500 border-gray-300 rounded"
                      />
                      <label htmlFor={`perm-${perm.id}`} className="ml-2 block text-sm text-gray-700">
                        {perm.name}
                      </label>
                    </div>
                  ))}
                </div>
              </div>
            ))}
          </div>
        </div>

        <div className="flex items-center justify-end">
          <button
            className="bg-blue-500 hover:bg-blue-700 text-white font-bold py-2 px-4 rounded focus:outline-none focus:shadow-outline"
            type="submit"
            disabled={saving || !formData.name.trim()}
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

export default GroupForm;