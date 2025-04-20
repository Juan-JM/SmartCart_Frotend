// src/pages/LoginPage.js
import React, { useState, useEffect } from 'react';
import { useNavigate, useLocation } from 'react-router-dom';
import { useDispatch, useSelector } from 'react-redux';
import { login } from '../redux/authSlice';
import { Link } from 'react-router-dom';
import { selectCurrentUser, selectIsAuthenticated } from '../redux/authSlice';

const LoginPage = () => {
  const [username, setUsername] = useState('');
  const [password, setPassword] = useState('');
  const [error, setError] = useState('');
  const [loading, setLoading] = useState(false);
  
  const navigate = useNavigate();
  const location = useLocation();
  const dispatch = useDispatch();
  const isAuthenticated = useSelector(selectIsAuthenticated);
  const user = useSelector(selectCurrentUser);
  
  // Determinar a dónde redirigir después del login
  const from = location.state?.from || '/';
  const isAdminRedirect = location.state?.isAdminRedirect || false;
  
  // Si ya está autenticado, redirigir
  useEffect(() => {
    if (isAuthenticated) {
      // Si el usuario es staff, redirigir al panel administrativo
      if (user?.is_staff) {
        navigate('/admin/', { replace: true });
      } else {
        // Si no es staff, redirigir a la ruta original o a la página principal
        // navigate(from, { replace: true });
        navigate('/', { replace: true });
      }
    }
  }, [isAuthenticated, user, navigate, from]);
  
  const handleSubmit = async (e) => {
    e.preventDefault();
    
    if (!username || !password) {
      setError('Por favor, completa todos los campos');
      return;
    }
    
    try {
      setLoading(true);
      setError('');
      
      // Dispatch de la acción de login
      await dispatch(login({ username, password })).unwrap();
      
      // No es necesario redirigir aquí, ya que se hace en el useEffect
    } catch (err) {
      console.error('Error al iniciar sesión:', err);
      setError('Credenciales incorrectas. Por favor, intenta de nuevo.');
    } finally {
      setLoading(false);
    }
  };
  
  return (
    <div className="flex min-h-screen bg-gray-50">
      <div className="m-auto w-full max-w-md p-8 bg-white rounded-lg shadow-md">
        <h1 className="text-2xl font-bold text-center mb-6">Iniciar Sesión</h1>
        
        {error && (
          <div className="mb-4 p-4 text-red-700 bg-red-100 rounded-md">
            {error}
          </div>
        )}
        
        {isAdminRedirect && (
          <div className="mb-4 p-4 text-blue-700 bg-blue-100 rounded-md">
            Necesitas iniciar sesión como administrador para acceder a esta página.
          </div>
        )}
        
        <form onSubmit={handleSubmit}>
          <div className="mb-4">
            <label htmlFor="username" className="block text-gray-700 font-medium mb-2">
              Nombre de Usuario
            </label>
            <input
              type="text"
              id="username"
              className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500"
              value={username}
              onChange={(e) => setUsername(e.target.value)}
              required
            />
          </div>
          
          <div className="mb-6">
            <label htmlFor="password" className="block text-gray-700 font-medium mb-2">
              Contraseña
            </label>
            <input
              type="password"
              id="password"
              className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500"
              value={password}
              onChange={(e) => setPassword(e.target.value)}
              required
            />
          </div>
          
          <button
            type="submit"
            className={`w-full py-2 px-4 rounded-md text-white font-medium ${
              loading ? 'bg-gray-400' : 'bg-blue-600 hover:bg-blue-700'
            }`}
            disabled={loading}
          >
            {loading ? 'Iniciando sesión...' : 'Iniciar Sesión'}
          </button>
        </form>
        
        <div className="mt-6 text-center">
          <p className="text-gray-600">
            ¿No tienes una cuenta?{' '}
            <Link to="/registro" className="text-blue-600 hover:underline">
              Regístrate aquí
            </Link>
          </p>
        </div>
      </div>
    </div>
  );
};

export default LoginPage;
