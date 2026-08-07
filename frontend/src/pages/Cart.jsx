import { Link, useNavigate } from 'react-router-dom'
import { FaMinus, FaPlus, FaTrash, FaShoppingBag } from 'react-icons/fa'
import toast from 'react-hot-toast'
import Breadcrumb from '../components/Breadcrumb'
import { useCart } from '../context/CartContext'
import { useAuth } from '../context/AuthContext' // Importação do contexto de autenticação
import { formatCurrency } from '../utils/formatCurrency'
import './Cart.css'

export default function Cart() {
  const { items, removeFromCart, updateQuantity, clearCart, subtotal, shipping, total } = useCart()
  
  // Trazendo as ferramentas de navegação e autenticação
  const navigate = useNavigate()
  const { isLoggedIn, logout } = useAuth()

  const handleCheckout = async () => {
    // 1ª Validação (Front-end): Se não estiver logado, bloqueia imediatamente
    if (!isLoggedIn) {
      toast.error('Você precisa estar logado para finalizar a compra!')
      navigate('/login')
      return
    }

    // 2ª Validação (Back-end): Envia o token para o Spring Boot provando a autenticação
    try {
      const token = localStorage.getItem('token')
      
      const response = await fetch('http://localhost:8081/api/pedidos', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
          'Authorization': `Bearer ${token}` // O token vai aqui no cabeçalho
        },
        body: JSON.stringify({ 
          itens: items, 
          subtotal: subtotal,
          frete: shipping,
          total: total 
        })
      })

      // Se o token for inválido, adulterado ou expirado
      if (response.status === 401 || response.status === 403) {
        logout() // Limpa o estado falso
        toast.error('Sua sessão expirou. Por favor, faça login novamente.')
        navigate('/login')
      } 
      // Se o backend aprovar a compra e salvar no banco
      else if (response.ok) {
        toast.success('Pedido finalizado com sucesso! Obrigado por comprar na GuinaCar.')
        clearCart()
        // Opcional: navigate('/sucesso') para uma tela de agradecimento
      } 
      else {
        toast.error('Erro ao processar o pedido. Tente novamente.')
      }

    } catch (error) {
      console.error("Erro no checkout:", error)
      toast.error('Erro ao conectar com o servidor.')
    }
  }

  return (
    <div className="page">
      <div className="container page-section">
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
                Finalizar Compra
              </button>
            </aside>
          </div>
        )}
      </div>
    </div>
  )
}