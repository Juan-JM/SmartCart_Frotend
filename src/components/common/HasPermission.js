// src/components/common/HasPermission.js
// import React from 'react';
import { useSelector } from 'react-redux';
import { selectCurrentUser } from '../../redux/authSlice';

/**
 * Componente que renderiza su contenido solo si el usuario tiene los permisos requeridos
 * @param {Object} props
 * @param {String|Array} props.requiredPermission - Permiso o array de permisos requeridos
 * @param {React.ReactNode} props.children - Contenido a renderizar si tiene permiso
 * @param {React.ReactNode} props.fallback - Contenido a renderizar si no tiene permiso (opcional)
 * @param {Boolean} props.requireAll - Si es true, requiere todos los permisos, de lo contrario, solo uno (opcional)
 */
const HasPermission = ({ 
  requiredPermission, 
  children, 
  fallback = null,
  requireAll = false 
}) => {
  const user = useSelector(selectCurrentUser);
  
  // Si no hay usuario o no se especificaron permisos, no mostrar nada
  if (!user || !requiredPermission) {
    return fallback;
  }
  
  // Extraer permisos del usuario
  const userPermissions = [];
  
  // Revisar permisos en grupos
  if (user.groups && Array.isArray(user.groups)) {
    user.groups.forEach(group => {
      if (group.permissions && Array.isArray(group.permissions)) {
        userPermissions.push(...group.permissions);
      }
    });
  }
  
  // Revisar permisos directos del usuario
  if (user.user_permissions && Array.isArray(user.user_permissions)) {
    userPermissions.push(...user.user_permissions);
  }
  
  // Función para verificar si el usuario tiene un permiso específico
  const hasSpecificPermission = (permission) => {
    return userPermissions.includes(permission);
  };
  
  // Determinar si tiene los permisos requeridos
  let hasPermission = false;
  
  if (Array.isArray(requiredPermission)) {
    if (requireAll) {
      // Requiere TODOS los permisos especificados
      hasPermission = requiredPermission.every(perm => hasSpecificPermission(perm));
    } else {
      // Requiere AL MENOS UNO de los permisos especificados
      hasPermission = requiredPermission.some(perm => hasSpecificPermission(perm));
    }
  } else {
    // Si se requiere un permiso específico
    hasPermission = hasSpecificPermission(requiredPermission);
  }
  
  return hasPermission ? children : fallback;
};

export default HasPermission;