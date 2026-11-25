import { Link, useNavigate } from 'react-router-dom'
import { FaMinus, FaPlus, FaTrash, FaShoppingBag, FaArrowLeft } from 'react-icons/fa'
import toast from 'react-hot-toast'
import Breadcrumb from '../components/Breadcrumb'
import { useCart } from '../context/CartContext'
import { useAuth } from '../context/AuthContext' 
import { formatCurrency } from '../utils/formatCurrency'
import './Cart.css'

export default function Cart() {
  const { items, removeFromCart, updateQuantity, subtotal, shipping, total } = useCart()
  
  const navigate = useNavigate()
  const { isLoggedIn } = useAuth()

  const handleCheckout = () => {
    if (!isLoggedIn) {
      toast.error('Faça login para continuar para o checkout!')
      navigate('/login', { state: { from: '/checkout' } })
      return
    }
    navigate('/checkout')
  }

  return (
    <div className="page">
      <div className="container page-section">
        
        {/* BOTÃO DE VOLTAR ADICIONADO AQUI */}
        <button className="btn-voltar" onClick={() => navigate(-1)} aria-label="Voltar para a página anterior">
          <FaArrowLeft /> Voltar
        </button>

        <Breadcrumb items={[{ label: 'Carrinho' }]} />
        <span className="eyebrow">Seu pedido</span>
        <h1 className="section-heading">Carrinho de compras</h1>

        {items.length === 0 ? (
          <div className="cart-empty panel">
            <FaShoppingBag />
            <p>Seu carrinho está vazio.</p>
            <Link to="/catalogo" className="btn btn-primary">Ver Catálogo</Link>
          </div>
        ) : (
          <div className="cart-layout">
            <div className="cart-items">
              {items.map((item) => (
                <div key={item.id} className="cart-item panel">
                  <img src={item.image} alt={item.name} />
                  <div className="cart-item-info">
                    <h3>{item.name}</h3>
                    <span className="mono cart-item-price">{formatCurrency(item.price)}</span>
                  </div>
                  <div className="cart-item-qty">
                    <button onClick={() => updateQuantity(item.id, item.quantity - 1)} aria-label="Diminuir quantidade">
                      <FaMinus />
                    </button>
                    <span className="mono">{item.quantity}</span>
                    <button onClick={() => updateQuantity(item.id, item.quantity + 1)} aria-label="Aumentar quantidade">
                      <FaPlus />
                    </button>
                  </div>
                  <span className="mono cart-item-total">{formatCurrency(item.price * item.quantity)}</span>
                  <button className="cart-item-remove" onClick={() => removeFromCart(item.id)} aria-label="Remover item">
                    <FaTrash />
                  </button>
                </div>
              ))}
            </div>

            <aside className="cart-summary panel">
              <h3>Resumo do pedido</h3>
              <div className="cart-summary-row">
                <span>Subtotal</span>
                <span className="mono">{formatCurrency(subtotal)}</span>
              </div>
              <div className="cart-summary-row">
                <span>Frete</span>
                <span className="mono">{shipping === 0 ? 'Grátis' : formatCurrency(shipping)}</span>
              </div>
              <div className="cart-summary-row cart-summary-total">
                <span>Total</span>
                <span className="mono">{formatCurrency(total)}</span>
              </div>
              <button className="btn btn-primary btn-block" onClick={handleCheckout}>
                Continuar para o Checkout
              </button>
            </aside>
          </div>
        )}
      </div>
    </div>
  )
}