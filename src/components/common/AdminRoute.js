// src/components/common/AdminRoute.js (versión corregida)
import React, { useEffect, useState } from 'react';
import { Navigate, useLocation } from 'react-router-dom';
import { useSelector, useDispatch } from 'react-redux';
import { selectIsAuthenticated, selectIsStaff, fetchUserProfile } from '../../redux/authSlice';

const AdminRoute = ({ children }) => {
  const isAuthenticated = useSelector(selectIsAuthenticated);
  const isStaff = useSelector(selectIsStaff);
  const dispatch = useDispatch();
  const location = useLocation();
  const user = useSelector(state => state.auth.user);
  const [isLoading, setIsLoading] = useState(false);
  const [profileChecked, setProfileChecked] = useState(false);

  // Si tenemos un token pero no tenemos la información completa del usuario
  // obtenemos su perfil
  useEffect(() => {
    const checkUserProfile = async () => {
      if (isAuthenticated && (!user || !user.hasOwnProperty('is_staff'))) {
        setIsLoading(true);
        try {
          await dispatch(fetchUserProfile()).unwrap();
        } catch (error) {
          console.error("Error fetching user profile:", error);
        } finally {
          setIsLoading(false);
          setProfileChecked(true);
        }
      } else {
        setProfileChecked(true);
      }
    };

    checkUserProfile();
  }, [isAuthenticated, user, dispatch]);

  if (!isAuthenticated) {
    // Redirigir a login si no está autenticado
    return <Navigate to="/login" state={{ from: location.pathname, isAdminRedirect: true }} replace />;
  }

  // Si está autenticado pero aún estamos verificando el perfil
  if (isLoading || (!profileChecked && (!user || !user.hasOwnProperty('is_staff')))) {
    // Mostrar un loader mientras obtenemos los datos del perfil
    return (
      <div className="flex justify-center items-center min-h-screen">
        <div className="text-center">
          <div className="animate-spin rounded-full h-12 w-12 border-t-2 border-b-2 border-blue-500 mx-auto"></div>
          <p className="mt-2">Verificando permisos...</p>
        </div>
      </div>
    );
  }

  // Si no es staff, redirigir a la página de inicio
  if (profileChecked && !isStaff) {
    return <Navigate to="/" replace />;
  }

  // Si es staff, mostrar el contenido protegido
  return children;
};

export default AdminRoute;