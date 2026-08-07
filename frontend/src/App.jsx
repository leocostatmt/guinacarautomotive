import { useEffect } from 'react'
import { Routes, Route, useLocation } from 'react-router-dom'
import { Toaster } from 'react-hot-toast'
import Navbar from './components/Navbar'
import Footer from './components/Footer'
import ScrollToTop from './components/ScrollToTop'

// Importação dos Contextos (Providers)
import { CartProvider } from './context/CartContext'
import { AuthProvider } from './context/AuthContext' // <-- Novo Provider de Autenticação

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
import Contact from './pages/Contact'
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
    <AuthProvider> {/* <-- O AuthProvider abraça toda a aplicação */}
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
            <Route path="/contato" element={<Contact />} />
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
    </AuthProvider>
  )
}