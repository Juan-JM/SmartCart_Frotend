// src/components/layout/AdminHeader.js
import React, { useState, useRef, useEffect } from 'react';
import { Link, useNavigate } from 'react-router-dom';
import { useDispatch, useSelector } from 'react-redux';
import { logout, selectCurrentUser } from '../../redux/authSlice';

const AdminHeader = () => {
  const user = useSelector(selectCurrentUser);
  const dispatch = useDispatch();
  const navigate = useNavigate();
  
  // Estado para controlar la visibilidad del menú desplegable
  const [isMenuOpen, setIsMenuOpen] = useState(false);
  const menuRef = useRef(null);

  // Manejo de clics fuera del menú para cerrarlo
  useEffect(() => {
    const handleOutsideClick = (event) => {
      if (menuRef.current && !menuRef.current.contains(event.target)) {
        setIsMenuOpen(false);
      }
    };

    if (isMenuOpen) {
      document.addEventListener('mousedown', handleOutsideClick);
    }

    return () => {
      document.removeEventListener('mousedown', handleOutsideClick);
    };
  }, [isMenuOpen]);

  const handleLogout = () => {
    dispatch(logout());
    navigate('/login');
  };

  // Función para alternar el menú desplegable
  const toggleMenu = (e) => {
    e.stopPropagation();
    setIsMenuOpen(!isMenuOpen);
  };

  return (
    <header className="bg-gray-800 text-white py-3 px-6 sticky top-0 z-10">
      <div className="flex justify-between items-center">
        {/* Logo y título */}
        <div className="flex items-center space-x-4">
          <Link to="/admin" className="text-xl font-bold">
            Administración de Sistema
          </Link>
        </div>

        {/* Perfil de usuario */}
        <div className="flex items-center space-x-4">
          <div className="hidden md:block">
            <span className="font-medium">{user?.username}</span>
          </div>
          
          <div className="relative" ref={menuRef}>
            <button 
              className="flex items-center space-x-2"
              onClick={toggleMenu}
            >
              <div className="w-8 h-8 rounded-full bg-gray-600 flex items-center justify-center">
                {user?.first_name ? user.first_name[0] : user?.username?.[0]}
              </div>
              <svg xmlns="http://www.w3.org/2000/svg" className="h-5 w-5" viewBox="0 0 20 20" fill="currentColor">
                <path fillRule="evenodd" d="M5.293 7.293a1 1 0 011.414 0L10 10.586l3.293-3.293a1 1 0 111.414 1.414l-4 4a1 1 0 01-1.414 0l-4-4a1 1 0 010-1.414z" clipRule="evenodd" />
              </svg>
            </button>
            
            {isMenuOpen && (
              <div className="absolute right-0 mt-2 w-48 bg-white rounded-md shadow-lg py-1 z-10">
                <Link to="/" className="block px-4 py-2 text-sm text-gray-700 hover:bg-gray-100">
                  Ir a la tienda
                </Link>
                <button
                  onClick={handleLogout}
                  className="block w-full text-left px-4 py-2 text-sm text-gray-700 hover:bg-gray-100"
                >
                  Cerrar sesión
                </button>
              </div>
            )}
          </div>
        </div>
      </div>
    </header>
  );
};

export default AdminHeader;