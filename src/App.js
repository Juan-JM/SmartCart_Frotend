// src/App.js
import React from 'react';
import { BrowserRouter as Router, Routes, Route } from 'react-router-dom';
import { Provider } from 'react-redux';
import store from './redux/store';
import { CartProvider } from './context/CartContext';
import { ToastProvider } from './context/ToastContext';

// Componentes de layout
import Header from './components/layout/Header';
// import AdminHeader from './components/layout/AdminHeader';

// Páginas públicas
import HomePage from './pages/HomePage';
import ProductsPage from './pages/ProductsPage';
import ProductDetailPage from './pages/ProductDetailPage';
import CartPage from './pages/CartPage';
import LoginPage from './pages/LoginPage';
import RegisterPage from './pages/RegisterPage';

// Páginas que requieren autenticación
import ProfilePage from './pages/ProfilePage';
// import CheckoutPage from './pages/CheckoutPage';
import OrdersPage from './pages/OrdersPage';
import CheckoutPage from './pages/CheckoutPage';
import OrderConfirmationPage from './pages/OrderConfirmationPage';

// Páginas administrativas
import AdminLayout from './components/layout/AdminLayout';
import AdminPanel from './pages/admin/AdminPanel';

// Importar los componentes de usuarios
import ClientesList from './pages/admin/usuarios/ClientesList';
import ClienteDetail from './pages/admin/usuarios/ClienteDetail';
import ClienteForm from './pages/admin/usuarios/ClienteForm';
import PersonalList from './pages/admin/usuarios/PersonalList';
import PersonalDetail from './pages/admin/usuarios/PersonalDetail';
import PersonalForm from './pages/admin/usuarios/PersonalForm';
import GroupsList from './pages/admin/usuarios/GroupsList';
import GroupDetail from './pages/admin/usuarios/GroupDetail';
import GroupForm from './pages/admin/usuarios/GroupForm';
import UsersList from './pages/admin/usuarios/UsersList';
import UserDetail from './pages/admin/usuarios/UserDetail';
import UserForm from './pages/admin/usuarios/UserForm';

// import ProductosList from './pages/admin/productos/ProductosList';
// Componentes de protección de rutas
import ProtectedRoute from './components/common/ProtectedRoute';
import AdminRoute from './components/common/AdminRoute';

function App() {
  return (
    <ToastProvider>
      <Provider store={store}>
        <CartProvider>
          <Router>
            <Routes>
              {/* Rutas Administrativas */}
              <Route path="/admin" element={
                <AdminRoute>
                  <AdminLayout />
                </AdminRoute>
              }>
                <Route index element={<AdminPanel />} />

                {/* Rutas de Usuarios - Clientes */}
                <Route path="usuarios/clientes" element={<ClientesList />} />
                <Route path="usuarios/clientes/:id" element={<ClienteDetail />} />
                <Route path="usuarios/clientes/nuevo" element={<ClienteForm />} />
                <Route path="usuarios/clientes/:id/editar" element={<ClienteForm />} />

                {/* Rutas de Usuarios - Personal */}
                <Route path="usuarios/personals" element={<PersonalList />} />
                <Route path="usuarios/personals/:id" element={<PersonalDetail />} />
                <Route path="usuarios/personals/nuevo" element={<PersonalForm />} />
                <Route path="usuarios/personals/:id/editar" element={<PersonalForm />} />

                {/* Rutas de Usuarios - Grupos */}
                <Route path="usuarios/grupos" element={<GroupsList />} />
                <Route path="usuarios/grupos/:id" element={<GroupDetail />} />
                <Route path="usuarios/grupos/nuevo" element={<GroupForm />} />
                <Route path="usuarios/grupos/:id/editar" element={<GroupForm />} />

                {/* Rutas de Usuarios - Administradores */}
                <Route path="usuarios/usuarios" element={<UsersList />} />
                <Route path="usuarios/usuarios/:id" element={<UserDetail />} />
                <Route path="usuarios/usuarios/nuevo" element={<UserForm />} />
                <Route path="usuarios/usuarios/:id/editar" element={<UserForm />} />

                {/* Rutas de Inventario */}
                <Route path="inventario/stocks" element={<div>Stocks</div>} />
                <Route path="inventario/sucursales" element={<div>Sucursales</div>} />

                {/* Rutas de Productos */}
                <Route path="productos/categorias" element={<div>Categorías</div>} />
                <Route path="productos/marcas" element={<div>Marcas</div>} />
                <Route path="productos/lista" element={<><HomePage /></>} />


                {/* Rutas de Ventas */}
                <Route path="ventas/notas" element={<div>Notas de Venta</div>} />
                
              </Route>

              {/* Rutas Públicas */}
              <Route path="/" element={<><Header /><HomePage /></>} />
              <Route path="/productos" element={<><Header /><ProductsPage /></>} />
              <Route path="/productos/:id" element={<><Header /><ProductDetailPage /></>} />
              <Route path="/carrito" element={<><Header /><CartPage /></>} />
              <Route path="/login" element={<><Header /><LoginPage /></>} />
              <Route path="/registro" element={<><Header /><RegisterPage /></>} />

              {/* Rutas Protegidas */}
              <Route path="/checkout" element={
                  <ProtectedRoute>
                    <Header />
                    <CheckoutPage />
                  </ProtectedRoute>
                } />
              <Route path="/compra-completada" element={
                  <ProtectedRoute>
                    <Header />
                    <OrderConfirmationPage />
                  </ProtectedRoute>
                } />
              <Route
                path="/perfil"
                element={
                  <ProtectedRoute>
                    <Header />
                    <ProfilePage />
                  </ProtectedRoute>
                }
              />
              {/* <Route
                path="/checkout"
                element={
                  <ProtectedRoute>
                    <Header />
                    <CheckoutPage />
                  </ProtectedRoute>
                }
              /> */}
              <Route
                path="/ordenes"
                element={
                  <ProtectedRoute>
                    <Header />
                    <OrdersPage />
                  </ProtectedRoute>
                }
              />
            </Routes>
          </Router>
        </CartProvider>
      </Provider>
    </ToastProvider>
  );
}

export default App;