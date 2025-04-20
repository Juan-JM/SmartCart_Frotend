// src/components/layout/Header.js
import React, { useState, useEffect, useRef } from 'react';
import { Link, useNavigate } from 'react-router-dom';
import { useSelector, useDispatch } from 'react-redux';
import { selectIsAuthenticated, selectCurrentUser, logout } from '../../redux/authSlice';
import { useCart } from '../../context/CartContext';

const Header = () => {
  const isAuthenticated = useSelector(selectIsAuthenticated);
  const user = useSelector(selectCurrentUser);
  const dispatch = useDispatch();
  const navigate = useNavigate();
  const { cart } = useCart();
  
  // Estado para el menú desplegable del perfil
  const [isProfileMenuOpen, setIsProfileMenuOpen] = useState(false);
  const profileMenuRef = useRef(null);

  // Manejo de clics fuera del menú para cerrarlo
  useEffect(() => {
    const handleOutsideClick = (event) => {
      if (profileMenuRef.current && !profileMenuRef.current.contains(event.target)) {
        setIsProfileMenuOpen(false);
      }
    };

    if (isProfileMenuOpen) {
      document.addEventListener('mousedown', handleOutsideClick);
    }

    return () => {
      document.removeEventListener('mousedown', handleOutsideClick);
    };
  }, [isProfileMenuOpen]);

  const handleLogout = () => {
    dispatch(logout());
    navigate('/');
  };

  const toggleProfileMenu = () => {
    setIsProfileMenuOpen(!isProfileMenuOpen);
  };

  const cartItemsCount = cart.items?.reduce((total, item) => total + item.quantity, 0) || 0;

  return (
    <header className="bg-white shadow-md">
      <nav className="container mx-auto px-4 py-4">
        <div className="flex justify-between items-center">
          <Link to="/" className="text-2xl font-bold text-indigo-600">
            Mi Tienda
          </Link>
          
          <div className="flex items-center space-x-4">
            {/* Carrito con ícono */}
            <Link to="/carrito" className="text-gray-600 hover:text-indigo-600 relative">
              <svg xmlns="http://www.w3.org/2000/svg" className="h-6 w-6" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M3 3h2l.4 2M7 13h10l4-8H5.4M7 13L5.4 5M7 13l-2.293 2.293c-.63.63-.184 1.707.707 1.707H17m0 0a2 2 0 100 4 2 2 0 000-4zm-8 2a2 2 0 11-4 0 2 2 0 014 0z" />
              </svg>
              {cartItemsCount > 0 && (
                <span className="absolute -top-2 -right-2 bg-red-500 text-white rounded-full w-5 h-5 flex items-center justify-center text-xs">
                  {cartItemsCount}
                </span>
              )}
            </Link>
            
            {isAuthenticated ? (
              <>
                {/* Menú desplegable del perfil */}
                <div className="relative" ref={profileMenuRef}>
                  <button 
                    onClick={toggleProfileMenu}
                    className="flex items-center space-x-2 text-gray-600 hover:text-indigo-600 focus:outline-none"
                  >
                    <div className="w-8 h-8 rounded-full bg-indigo-100 flex items-center justify-center text-indigo-600">
                      {user?.first_name ? user.first_name[0] : user?.username?.[0]}
                    </div>
                    <span>{user?.first_name || user?.username}</span>
                    <svg xmlns="http://www.w3.org/2000/svg" className={`h-4 w-4 transition-transform ${isProfileMenuOpen ? 'rotate-180' : ''}`} fill="none" viewBox="0 0 24 24" stroke="currentColor">
                      <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M19 9l-7 7-7-7" />
                    </svg>
                  </button>
                  
                  {isProfileMenuOpen && (
                    <div className="absolute right-0 mt-2 w-48 bg-white rounded-md shadow-lg py-1 z-10">
                      <Link to="/perfil" className="block px-4 py-2 text-sm text-gray-700 hover:bg-gray-100">
                        Mi Perfil
                      </Link>
                      <Link to="/ordenes" className="block px-4 py-2 text-sm text-gray-700 hover:bg-gray-100">
                        Mis Órdenes
                      </Link>
                      {/* Panel Administrativo solo para usuarios is_staff */}
                      {user?.is_staff && (
                        <Link to="/admin" className="block px-4 py-2 text-sm text-gray-700 hover:bg-gray-100">
                          Panel Administrativo
                        </Link>
                      )}
                      <button
                        onClick={handleLogout}
                        className="block w-full text-left px-4 py-2 text-sm text-gray-700 hover:bg-gray-100"
                      >
                        Cerrar Sesión
                      </button>
                    </div>
                  )}
                </div>
              </>
            ) : (
              <>
                <Link
                  to="/login"
                  className="text-gray-600 hover:text-indigo-600"
                >
                  Iniciar Sesión
                </Link>
                <Link
                  to="/registro"
                  className="bg-indigo-600 text-white px-4 py-2 rounded-md hover:bg-indigo-700"
                >
                  Registrarse
                </Link>
              </>
            )}
          </div>
        </div>
      </nav>
    </header>
  );
};

export default Header;