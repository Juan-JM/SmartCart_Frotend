import React, { useState, useEffect } from 'react';
import { useParams, useNavigate } from 'react-router-dom';
import apiClient from '../../../api/axiosConfig';

const ClienteForm = () => {
  const { id } = useParams();
  const navigate = useNavigate();
  const isEditing = Boolean(id);
  
  const [formData, setFormData] = useState({
    nombre: '',
    numero: '',
    direccion: '',
    usuario: {
      username: '',
      email: '',
      first_name: '',
      last_name: '',
      password: '',
      password2: ''
    }
  });
  
  const [loading, setLoading] = useState(isEditing);
  const [saving, setSaving] = useState(false);
  const [error, setError] = useState(null);
  const [feedbackMsg, setFeedbackMsg] = useState(null);

  useEffect(() => {
    if (isEditing) {
      fetchCliente();
    }
  }, [id]);

  const fetchCliente = async () => {
    try {
      setLoading(true);
      const response = await apiClient.get(`/usuarios/clientes/${id}/`);
      const clienteData = response.data;
      
      setFormData({
        nombre: clienteData.nombre || '',
        numero: clienteData.numero || '',
        direccion: clienteData.direccion || '',
        usuario: {
          username: clienteData.usuario?.username || '',
          email: clienteData.usuario?.email || '',
          first_name: clienteData.usuario?.first_name || '',
          last_name: clienteData.usuario?.last_name || '',
          password: '',
          password2: ''
        }
      });
      
      setLoading(false);
    } catch (err) {
      setError('Error al cargar los datos del cliente: ' + (err.response?.data?.detail || err.message));
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

  const handleSubmit = async (e) => {
    e.preventDefault();
    setError(null);
    setFeedbackMsg(null);
    setSaving(true);
    
    try {
      let response;
      
      // Preparar datos para el envío
      const submitData = {
        nombre: formData.nombre,
        numero: formData.numero || null,
        direccion: formData.direccion || null,
      };
      
      if (isEditing) {
        // Actualizar cliente existente
        response = await apiClient.put(`/usuarios/clientes/${id}/`, submitData);
        setFeedbackMsg('Cliente actualizado correctamente');
      } else {
        // Crear nuevo cliente, que incluye crear un usuario
        const registerData = {
          username: formData.usuario.username,
          email: formData.usuario.email,
          password: formData.usuario.password,
          password2: formData.usuario.password2,
          first_name: formData.usuario.first_name,
          last_name: formData.usuario.last_name,
          nombre_cliente: formData.nombre,
          numero: formData.numero,
          direccion: formData.direccion
        };
        
        response = await apiClient.post('/usuarios/register/', registerData);
        setFeedbackMsg('Cliente creado correctamente');
        
        // Redirigir a la lista de clientes después de crear
        setTimeout(() => {
          navigate('/admin/usuarios/clientes');
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
          {isEditing ? 'Editar Cliente' : 'Nuevo Cliente'}
        </h1>
        <button
          onClick={() => navigate('/admin/usuarios/clientes')}
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
          <h2 className="text-xl font-semibold mb-4">Información del Cliente</h2>
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
            <div className="mb-4">
              <label className="block text-gray-700 text-sm font-bold mb-2" htmlFor="numero">
                Número de contacto
              </label>
              <input
                className="shadow appearance-none border rounded w-full py-2 px-3 text-gray-700 leading-tight focus:outline-none focus:shadow-outline"
                id="numero"
                type="text"
                name="numero"
                value={formData.numero || ''}
                onChange={handleChange}
              />
            </div>
            <div className="mb-4 md:col-span-2">
              <label className="block text-gray-700 text-sm font-bold mb-2" htmlFor="direccion">
                Dirección
              </label>
              <textarea
                className="shadow appearance-none border rounded w-full py-2 px-3 text-gray-700 leading-tight focus:outline-none focus:shadow-outline"
                id="direccion"
                name="direccion"
                value={formData.direccion || ''}
                onChange={handleChange}
                rows="3"
              />
            </div>
          </div>
        </div>

        {/* Información de usuario solo necesaria para creación, no para edición */}
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

export default ClienteForm;