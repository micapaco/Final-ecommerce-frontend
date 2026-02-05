import React from 'react';
import { BrowserRouter as Router, Routes, Route, useLocation } from 'react-router-dom';
import { AuthProvider } from './context/AuthContext';
import Navbar from './components/layout/Navbar';
import Footer from './components/layout/Footer';
import Home from './pages/Home';
import Products from './pages/Products';
import Cart from './pages/Cart';
import Checkout from './pages/Checkout';
import OrderConfirmation from './pages/OrderConfirmation';
import ProductDetail from './pages/ProductDetail';
import Login from './pages/Login';
import Register from './pages/Register';
import Profile from './pages/Profile';
import OrderDetail from './pages/OrderDetail';
import CheckoutSuccess from './pages/CheckoutSuccess';
import AboutUs from './pages/AboutUs';
import ProtectedRoute from './components/auth/ProtectedRoute';
import PromoBar from './components/layout/PromoBar';

// Admin imports
import AdminLayout from './components/admin/AdminLayout';
import AdminDashboard from './pages/admin/AdminDashboard';
import AdminProducts from './pages/admin/AdminProducts';
import AdminProductForm from './pages/admin/AdminProductForm';
import AdminCategories from './pages/admin/AdminCategories';
import AdminOrders from './pages/admin/AdminOrders';
import AdminOrderDetail from './pages/admin/AdminOrderDetail';
import AdminClients from './pages/admin/AdminClients';
import AdminBills from './pages/admin/AdminBills';
import AdminAddresses from './pages/admin/AdminAddresses';

// Layout para la tienda (con Navbar y Footer)
const StoreLayout = ({ children }) => {
  const location = useLocation();
  const isHome = location.pathname === '/';
  return (
    <div className="flex flex-col min-h-screen">
      <Navbar />
      {isHome && <PromoBar />}
      <main className="flex-grow">
        {children}
      </main>
      <Footer />
    </div>
  );
};

function App() {
  return (
    <AuthProvider>
      <Router>
        <Routes>
          {/* Rutas de Auth - sin Navbar/Footer */}
          <Route path="/login" element={<Login />} />
          <Route path="/register" element={<Register />} />

          {/* Rutas Admin - protegidas, requieren admin */}
          <Route path="/admin" element={
            <ProtectedRoute requireAdmin>
              <AdminLayout />
            </ProtectedRoute>
          }>
            <Route index element={<AdminDashboard />} />
            <Route path="productos" element={<AdminProducts />} />
            <Route path="productos/nuevo" element={<AdminProductForm />} />
            <Route path="productos/:id" element={<AdminProductForm />} />
            <Route path="categorias" element={<AdminCategories />} />
            <Route path="pedidos" element={<AdminOrders />} />
            <Route path="pedidos/:id" element={<AdminOrderDetail />} />
            <Route path="clientes" element={<AdminClients />} />
            <Route path="direcciones" element={<AdminAddresses />} />
            <Route path="facturas" element={<AdminBills />} />
          </Route>

          {/* Rutas Tienda - públicas */}
          <Route path="/" element={<StoreLayout><Home /></StoreLayout>} />
          <Route path="/productos" element={<StoreLayout><Products /></StoreLayout>} />
          <Route path="/product/:id" element={<StoreLayout><ProductDetail /></StoreLayout>} />
          <Route path="/cart" element={<StoreLayout><Cart /></StoreLayout>} />
          <Route path="/nosotros" element={<StoreLayout><AboutUs /></StoreLayout>} />

          {/* Checkout protegido - requiere login */}
          <Route path="/checkout" element={
            <ProtectedRoute>
              <StoreLayout><Checkout /></StoreLayout>
            </ProtectedRoute>
          } />

          {/* Checkout Success */}
          <Route path="/checkout/success" element={
            <ProtectedRoute>
              <StoreLayout><CheckoutSuccess /></StoreLayout>
            </ProtectedRoute>
          } />

          <Route path="/order-confirmation" element={<StoreLayout><OrderConfirmation /></StoreLayout>} />

          {/* Perfil protegido - requiere login */}
          <Route path="/perfil" element={
            <ProtectedRoute>
              <StoreLayout><Profile /></StoreLayout>
            </ProtectedRoute>
          } />

          {/* Detalle de pedido - requiere login */}
          <Route path="/pedido/:id" element={
            <ProtectedRoute>
              <StoreLayout><OrderDetail /></StoreLayout>
            </ProtectedRoute>
          } />
        </Routes>
      </Router>
    </AuthProvider>
  );
}

export default App;




