// src/components/layout/AdminSidebar.js
import React, { useState } from 'react';
import { Link, useLocation } from 'react-router-dom';
import HasPermission from '../common/HasPermission';

const AdminSidebar = () => {
  const location = useLocation();

  // Estado para controlar qué secciones están expandidas
  const [expandedSections, setExpandedSections] = useState({
    inventario: true,
    productos: true,
    usuarios: true,
    ventas: true
  });

  // Función para alternar la expansión de secciones
  const toggleSection = (section) => {
    setExpandedSections({
      ...expandedSections,
      [section]: !expandedSections[section]
    });
  };

  // Función para verificar si un enlace está activo
  const isActive = (path) => {
    return location.pathname === path;
  };

  return (
    <aside className="w-64 bg-gray-800 text-white min-h-screen">
      <div className="p-4">
        {/* USUARIOS */}
        <div className="mb-6">
          <div
            className="flex justify-between items-center p-2 bg-blue-600 cursor-pointer"
            onClick={() => toggleSection('usuarios')}
          >
            <h3 className="font-medium">USUARIOS</h3>
            <span>{expandedSections.usuarios }</span>
          </div>

          {expandedSections.usuarios && (
            <div className="pl-2">
              <HasPermission
                requiredPermission={['usuarios.view_cliente']}
                requireAll={false}
              >
                <Link
                  to="/admin/usuarios/clientes"
                  className={`block p-2 hover:bg-gray-700 ${isActive('/admin/usuarios/clientes') ? 'bg-gray-700' : ''}`}
                >
                  Clientes
                </Link>
              </HasPermission>

              <HasPermission
                requiredPermission={['usuarios.view_personal']}
                requireAll={false}
              >
                <Link
                  to="/admin/usuarios/personals"
                  className={`block p-2 hover:bg-gray-700 ${isActive('/admin/usuarios/personals') ? 'bg-gray-700' : ''}`}
                >
                  Personals
                </Link>
              </HasPermission>
              <HasPermission
                requiredPermission={['auth.view_group']}
                requireAll={false}
              >
                <Link
                  to="/admin/usuarios/grupos"
                  className={`block p-2 hover:bg-gray-700 ${isActive('/admin/usuarios/grupos/') ? 'bg-gray-700' : ''}`}
                >
                  Grupos
                </Link>
              </HasPermission>

              <HasPermission
                requiredPermission={['auth.view_user']}
                requireAll={false}
              >
                <Link
                  to="/admin/usuarios/usuarios"
                  className={`block p-2 hover:bg-gray-700 ${isActive('/admin/usuarios/usuarios') ? 'bg-gray-700' : ''}`}
                >
                  Usuarios
                </Link>
              </HasPermission>
            </div>
          )}
        </div>

        {/* INVENTARIO */}
        <div className="mb-6">
          <div
            className="flex justify-between items-center p-2 bg-blue-600 cursor-pointer"
            onClick={() => toggleSection('inventario')}
          >
            <h3 className="font-medium">INVENTARIO</h3>
            <span>{expandedSections.inventario}</span>
          </div>

          {expandedSections.inventario && (
            <div className="pl-2">
              <HasPermission
                requiredPermission={['inventario.view_stock']}
                requireAll={false}
              >
                <Link
                  to="/admin/inventario/stocks"
                  className={`block p-2 hover:bg-gray-700 ${isActive('/admin/inventario/stocks') ? 'bg-gray-700' : ''}`}
                >
                  Stocks
                </Link>
              </HasPermission>

              <HasPermission
                requiredPermission={['inventario.view_sucursal']}
                requireAll={false}
              >
                <Link
                  to="/admin/inventario/sucursales"
                  className={`block p-2 hover:bg-gray-700 ${isActive('/admin/inventario/sucursales') ? 'bg-gray-700' : ''}`}
                >
                  Sucursales
                </Link>
              </HasPermission>
            </div>
          )}
        </div>

        {/* PRODUCTOS */}
        <div className="mb-6">
          <div
            className="flex justify-between items-center p-2 bg-blue-600 cursor-pointer"
            onClick={() => toggleSection('productos')}
          >
            <h3 className="font-medium">PRODUCTOS</h3>
            <span>{expandedSections.productos }</span>
          </div>

          {expandedSections.productos && (
            <div className="pl-2">
              <HasPermission
                requiredPermission={['productos.view_categoria']}
                requireAll={false}
              >
                <Link
                  to="/admin/productos/categorias"
                  className={`block p-2 hover:bg-gray-700 ${isActive('/admin/productos/categorias') ? 'bg-gray-700' : ''}`}
                >
                  Categorías
                </Link>
              </HasPermission>

              <HasPermission
                requiredPermission={['productos.view_marca']}
                requireAll={false}
              >
                <Link
                  to="/admin/productos/marcas"
                  className={`block p-2 hover:bg-gray-700 ${isActive('/admin/productos/marcas') ? 'bg-gray-700' : ''}`}
                >
                  Marcas
                </Link>
              </HasPermission>

              <HasPermission
                requiredPermission={['productos.view_producto']}
                requireAll={false}
              >
                <Link
                  to="/admin/productos/lista"
                  className={`block p-2 hover:bg-gray-700 ${isActive('/admin/productos/lista') ? 'bg-gray-700' : ''}`}
                >
                  Productos
                </Link>
              </HasPermission>
            </div>
          )}
        </div>

        {/* VENTAS */}
        <div className="mb-6">
          <div
            className="flex justify-between items-center p-2 bg-blue-600 cursor-pointer"
            onClick={() => toggleSection('ventas')}
          >
            <h3 className="font-medium">VENTAS</h3>
            <span>{expandedSections.ventas }</span>
          </div>

          {expandedSections.ventas && (
            <div className="pl-2">
              <HasPermission
                requiredPermission={['ventas.view_notaventa']}
                requireAll={false}
              >
                <Link
                  to="/admin/ventas/notas"
                  className={`block p-2 hover:bg-gray-700 ${isActive('/admin/ventas/notas') ? 'bg-gray-700' : ''}`}
                >
                  Notas de Venta
                </Link>
              </HasPermission>
            </div>
          )}
        </div>
      </div>
    </aside>
  );
};

export default AdminSidebar;