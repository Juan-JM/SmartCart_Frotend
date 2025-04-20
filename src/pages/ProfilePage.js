import React, { useState, useEffect } from 'react';
import { authService } from '../api/authService';
// import { useSelector } from 'react-redux';
// import { selectCurrentUser } from '../redux/authSlice';

const ProfilePage = () => {
  const [profile, setProfile] = useState(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState('');
  const [editingField, setEditingField] = useState(null);
  const [tempValue, setTempValue] = useState('');
  const [isUpdating, setIsUpdating] = useState(false);
  const [successMessage, setSuccessMessage] = useState('');
  // const user = useSelector(selectCurrentUser);

  useEffect(() => {
    const fetchProfile = async () => {
      try {
        const data = await authService.getProfile();
        setProfile(data);
      } catch (err) {
        setError('Error al cargar el perfil');
      } finally {
        setLoading(false);
      }
    };

    fetchProfile();
  }, []);

  const handleEditClick = (field, value) => {
    setEditingField(field);
    setTempValue(value);
    setSuccessMessage('');
    setError('');
  };

  const handleCancelEdit = () => {
    setEditingField(null);
    setTempValue('');
  };

  const handleUpdate = async () => {
    if (!tempValue || tempValue.trim() === '') {
      setError('El campo no puede estar vacío');
      return;
    }
    
    setIsUpdating(true);
    try {
      let updateData = {};
      const fieldParts = editingField.split('.');
      
      if (fieldParts.length > 1) {
        // Para campos anidados como cliente_profile.nombre
        updateData[fieldParts[0]] = {
          ...profile[fieldParts[0]],
          [fieldParts[1]]: tempValue
        };
      } else {
        updateData[editingField] = tempValue;
      }
      
      // Llamada al endpoint de actualización
      const updatedProfile = await authService.updateProfile(updateData);
      
      setProfile(updatedProfile);
      setEditingField(null);
      setTempValue('');
      setSuccessMessage('Perfil actualizado correctamente');
      setError('');
    } catch (err) {
      setError(err.message || 'Error al actualizar el perfil');
    } finally {
      setIsUpdating(false);
    }
  };

  if (loading) return <div className="text-center mt-8">Cargando...</div>;
  if (error) return <div className="text-red-500 text-center mt-8">{error}</div>;
  if (!profile) return null;

  const renderEditableField = (label, field, value) => {
    if (editingField === field) {
      return (
        <div className="flex items-center gap-2 mb-3">
          <span className="font-medium w-32">{label}:</span>
          <input
            type="text"
            value={tempValue}
            onChange={(e) => setTempValue(e.target.value)}
            className="border rounded px-2 py-1 flex-1"
            autoFocus
          />
          <button
            onClick={handleUpdate}
            disabled={isUpdating}
            className="bg-green-500 text-white px-2 py-1 rounded hover:bg-green-600 disabled:bg-green-300 text-sm"
          >
            {isUpdating ? 'Guardando...' : '✓'}
          </button>
          <button
            onClick={handleCancelEdit}
            className="bg-gray-500 text-white px-2 py-1 rounded hover:bg-gray-600 text-sm"
          >
            ✕
          </button>
        </div>
      );
    }
    return (
      <div className="flex items-center gap-2 mb-3">
        <span className="font-medium w-32">{label}:</span>
        <span className="flex-1">{value || 'No especificado'}</span>
        <button
          onClick={() => handleEditClick(field, value)}
          className="text-blue-500 hover:text-blue-700"
          title="Editar"
        >
          <svg xmlns="http://www.w3.org/2000/svg" className="h-4 w-4" fill="none" viewBox="0 0 24 24" stroke="currentColor">
            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M11 5H6a2 2 0 00-2 2v11a2 2 0 002 2h11a2 2 0 002-2v-5m-1.414-9.414a2 2 0 112.828 2.828L11.828 15H9v-2.828l8.586-8.586z" />
          </svg>
        </button>
      </div>
    );
  };

  return (
    <div className="container mx-auto px-4 py-8">
      <div className="max-w-3xl mx-auto bg-white rounded-lg shadow-md p-6">
        <h1 className="text-2xl font-bold mb-6">Mi Perfil</h1>
        
        {successMessage && (
          <div className="bg-green-100 border border-green-400 text-green-700 px-4 py-3 rounded mb-4">
            {successMessage}
          </div>
        )}

        <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
          <div>
            <h2 className="text-lg font-semibold mb-4">Información Personal</h2>
            <div>
              {renderEditableField('Nombre de Usuario', 'username', profile.username)}
              {renderEditableField('Email', 'email', profile.email)}
              {renderEditableField('Nombre', 'first_name', profile.first_name)}
              {renderEditableField('Apellido', 'last_name', profile.last_name)}
            </div>
          </div>

          {profile.cliente_profile && (
            <div>
              <h2 className="text-lg font-semibold mb-4">Datos de Cliente</h2>
              <div>
                {renderEditableField('Nombre Completo', 'cliente_profile.nombre', profile.cliente_profile.nombre)}
                {renderEditableField('Teléfono', 'cliente_profile.numero', profile.cliente_profile.numero)}
                {renderEditableField('Dirección', 'cliente_profile.direccion', profile.cliente_profile.direccion)}
              </div>
            </div>
          )}
        </div>
      </div>
    </div>
  );
};

export default ProfilePage;