import { useEffect } from 'react'
import { Routes, Route, useLocation } from 'react-router-dom'
import { Toaster } from 'react-hot-toast'
import Navbar from './components/Navbar'
import Footer from './components/Footer'
import ScrollToTop from './components/ScrollToTop'

// Importação dos Contextos (Providers)
import { CartProvider } from './context/CartContext'
import { AuthProvider } from './context/AuthContext'
import { FavoritesProvider } from './context/FavoritesContext'
import PrivateRoute from './components/PrivateRoute'
import AdminRoute from './components/AdminRoute'

import Home from './pages/Home'
import Catalog from './pages/Catalog'
import Categories from './pages/Categories'
import CategoryProducts from './pages/CategoryProducts'
import Brands from './pages/Brands'
import BrandProducts from './pages/BrandProducts'
import ProductDetail from './pages/ProductDetail'
import Login from './pages/Login'
import Register from './pages/Register'
import ForgotPassword from './pages/ForgotPassword'
import Cart from './pages/Cart'
import Checkout from './pages/Checkout'
import Contact from './pages/Contact'
import MyAccount from './pages/MyAccount'
import MyOrders from './pages/MyOrders'
import MyFavorites from './pages/MyFavorites'
import AdminDashboard from './pages/admin/AdminDashboard'
import AdminOrders from './pages/admin/AdminOrders'
import AdminProducts from './pages/admin/AdminProducts'
import AdminUsers from './pages/admin/AdminUsers'
import AdminReports from './pages/admin/AdminReports'
import NotFound from './pages/NotFound'

// Reseta a rolagem da página sempre que a rota muda
function ScrollReset() {
  const { pathname } = useLocation()
  useEffect(() => {
    window.scrollTo(0, 0)
  }, [pathname])
  return null
}

export default function App() {
  return (
    <AuthProvider>
      <FavoritesProvider>
        <CartProvider>
          <ScrollReset />
          <Navbar />

          <main>
            <Routes>
              <Route path="/" element={<Home />} />
              <Route path="/catalogo" element={<Catalog />} />
              <Route path="/categorias" element={<Categories />} />
              <Route path="/categorias/:slug" element={<CategoryProducts />} />
              <Route path="/marcas" element={<Brands />} />
              <Route path="/marcas/:slug" element={<BrandProducts />} />
              <Route path="/produto/:id" element={<ProductDetail />} />
              <Route path="/login" element={<Login />} />
              <Route path="/cadastro" element={<Register />} />
              <Route path="/recuperar-senha" element={<ForgotPassword />} />
              <Route path="/carrinho" element={<Cart />} />
              <Route
                path="/checkout"
                element={
                  <PrivateRoute>
                    <Checkout />
                  </PrivateRoute>
                }
              />
              <Route path="/contato" element={<Contact />} />
              <Route
                path="/minha-conta"
                element={
                  <PrivateRoute>
                    <MyAccount />
                  </PrivateRoute>
                }
              />
              <Route
                path="/meus-pedidos"
                element={
                  <PrivateRoute>
                    <MyOrders />
                  </PrivateRoute>
                }
              />
              <Route
                path="/meus-favoritos"
                element={
                  <PrivateRoute>
                    <MyFavorites />
                  </PrivateRoute>
                }
              />

              {/* Central do Vendedor / Administrador */}
              <Route
                path="/admin"
                element={
                  <AdminRoute allowedRoles={['ADMIN']}>
                    <AdminDashboard />
                  </AdminRoute>
                }
              />
              <Route
                path="/admin/pedidos"
                element={
                  <AdminRoute allowedRoles={['ADMIN', 'FUNCIONARIO']}>
                    <AdminOrders />
                  </AdminRoute>
                }
              />
              <Route
                path="/admin/produtos"
                element={
                  <AdminRoute allowedRoles={['ADMIN', 'FUNCIONARIO']}>
                    <AdminProducts />
                  </AdminRoute>
                }
              />
              <Route
                path="/admin/clientes"
                element={
                  <AdminRoute allowedRoles={['ADMIN']}>
                    <AdminUsers mode="CLIENTES" />
                  </AdminRoute>
                }
              />
              <Route
                path="/admin/funcionarios"
                element={
                  <AdminRoute allowedRoles={['ADMIN']}>
                    <AdminUsers mode="FUNCIONARIOS" />
                  </AdminRoute>
                }
              />
              <Route
                path="/admin/relatorios"
                element={
                  <AdminRoute allowedRoles={['ADMIN']}>
                    <AdminReports />
                  </AdminRoute>
                }
              />

              <Route path="*" element={<NotFound />} />
            </Routes>
          </main>

          <Footer />
          <ScrollToTop />

          <Toaster
            position="bottom-right"
            toastOptions={{
              style: {
                background: '#212124',
                color: '#f4f4f3',
                border: '1px solid #2b2b2f',
                fontFamily: 'Inter, sans-serif',
                fontSize: '0.9rem',
              },
              success: { iconTheme: { primary: '#e0122a', secondary: '#f4f4f3' } },
            }}
          />
        </CartProvider>
      </FavoritesProvider>
    </AuthProvider>
  )
}