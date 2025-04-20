// src/pages/admin/AdminPanel.js
import React, { useEffect } from 'react';
import { Link } from 'react-router-dom';
import { useSelector } from 'react-redux';
import { selectCurrentUser } from '../../redux/authSlice';
import HasPermission from '../../components/common/HasPermission';

const AdminPanel = () => {
  const user = useSelector(selectCurrentUser);

  useEffect(() => {
    document.title = 'Panel Administrativo';
  }, []);

  return (
    <div>
      <h1 className="text-3xl font-bold mb-6">Panel Administrativo</h1>
      
      <div className="bg-white shadow-md rounded-lg p-6 mb-8">
        <h2 className="text-xl font-semibold mb-4">Bienvenido, {user?.username}</h2>
        <p className="text-gray-600">
          Este es el panel de administración de la tienda. Utiliza el menú lateral para navegar a las diferentes secciones según tus permisos asignados.
        </p>
      </div>
      
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
        {/* Gestión de Productos */}
        <HasPermission 
          requiredPermission={['productos.view_producto', 'productos.add_producto', 'productos.change_producto', 'productos.delete_producto']}
          requireAll={false}
        >
          <div className="bg-white shadow-md rounded-lg p-6">
            <h3 className="text-lg font-semibold mb-3">Gestión de Productos</h3>
            <p className="text-gray-600 mb-4">Administra los productos, categorías y marcas.</p>
            <Link 
              to="/admin/productos/lista" 
              className="block text-center bg-blue-600 text-white py-2 px-4 rounded hover:bg-blue-700"
            >
              Acceder
            </Link>
          </div>
        </HasPermission>
        
        {/* Gestión de Inventario */}
        <HasPermission 
          requiredPermission={['inventario.view_stock', 'inventario.add_stock', 'inventario.change_stock', 'inventario.delete_stock']}
          requireAll={false}
        >
          <div className="bg-white shadow-md rounded-lg p-6">
            <h3 className="text-lg font-semibold mb-3">Gestión de Inventario</h3>
            <p className="text-gray-600 mb-4">Controla el stock y las sucursales.</p>
            <Link 
              to="/admin/inventario/stocks" 
              className="block text-center bg-blue-600 text-white py-2 px-4 rounded hover:bg-blue-700"
            >
              Acceder
            </Link>
          </div>
        </HasPermission>
        
        {/* Gestión de Usuarios */}
        <HasPermission 
          requiredPermission={['auth.view_user', 'auth.add_user', 'auth.change_user']}
          requireAll={false}
        >
          <div className="bg-white shadow-md rounded-lg p-6">
            <h3 className="text-lg font-semibold mb-3">Gestión de Usuarios</h3>
            <p className="text-gray-600 mb-4">Administra usuarios, clientes y personal.</p>
            <Link 
              to="/admin/usuarios/clientes" 
              className="block text-center bg-blue-600 text-white py-2 px-4 rounded hover:bg-blue-700"
            >
              Acceder
            </Link>
          </div>
        </HasPermission>
      </div>
    </div>
  );
};

export default AdminPanel;