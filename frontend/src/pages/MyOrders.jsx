import { useState, useEffect, useCallback } from 'react'
import { Link, useNavigate } from 'react-router-dom'
import toast from 'react-hot-toast'
import { FaBoxOpen, FaRedo, FaTimesCircle, FaWrench, FaCheckCircle } from 'react-icons/fa'
import AccountLayout from '../components/AccountLayout'
import { useAuth } from '../context/AuthContext'
import { useCart } from '../context/CartContext'
import { getProductById } from '../data/products'
import { formatCurrency } from '../utils/formatCurrency'

const STATUS_LABELS = {
  TODOS: 'Todos',
  AGUARDANDO_PAGAMENTO: 'Aguardando pagamento',
  CONFIRMADO: 'Confirmado',
  EM_SEPARACAO: 'Em separação',
  ENVIADO: 'Enviado',
  ENTREGUE: 'Entregue',
  CANCELADO: 'Cancelado',
}

const PAYMENT_LABELS = {
  PIX: 'PIX',
  CARTAO_CREDITO: 'Cartão de Crédito',
  BOLETO: 'Boleto Bancário',
}

function formatDateTime(isoString) {
  if (!isoString) return ''
  const date = new Date(isoString)
  if (Number.isNaN(date.getTime())) return isoString
  return date.toLocaleString('pt-BR', {
    day: '2-digit',
    month: '2-digit',
    year: 'numeric',
    hour: '2-digit',
    minute: '2-digit',
  })
}

export default function MyOrders() {
  const { logout } = useAuth()
  const { addToCart } = useCart()
  const navigate = useNavigate()

  const [orders, setOrders] = useState([])
  const [loading, setLoading] = useState(true)
  const [statusFilter, setStatusFilter] = useState('TODOS')
  const [cancelingId, setCancelingId] = useState(null)
  const [confirmingId, setConfirmingId] = useState(null)

  const fetchOrders = useCallback(async () => {
    setLoading(true)
    try {
      const token = localStorage.getItem('token')
      const res = await fetch('http://localhost:8081/api/pedidos', {
        headers: { Authorization: `Bearer ${token}` },
      })

      if (res.status === 401 || res.status === 403) {
        logout()
        toast.error('Sua sessão expirou. Faça login novamente.')
        navigate('/login')
        return
      }

      if (res.ok) {
        const data = await res.json()
        setOrders(Array.isArray(data) ? data : [])
      } else {
        toast.error('Não foi possível carregar seus pedidos.')
      }
    } catch (err) {
      console.error('Erro ao buscar pedidos:', err)
      toast.error('Erro ao conectar com o servidor.')
    } finally {
      setLoading(false)
    }
  }, [logout, navigate])

  useEffect(() => {
    fetchOrders()
  }, [fetchOrders])

  const handleReorder = (order) => {
    order.itens.forEach((item) => {
      const catalogProduct = getProductById(item.produtoSlug)
      addToCart(
        catalogProduct || {
          id: item.produtoSlug,
          name: item.nome,
          price: Number(item.precoUnitario),
          image: item.imagem || '',
        },
        item.quantidade
      )
    })
    toast.success('Itens adicionados ao carrinho!')
    navigate('/carrinho')
  }

  const handleConfirmPayment = async (orderId) => {
    setConfirmingId(orderId)
    try {
      const token = localStorage.getItem('token')
      const res = await fetch(`http://localhost:8081/api/pedidos/${orderId}/confirmar-pagamento`, {
        method: 'POST',
        headers: { Authorization: `Bearer ${token}` },
      })
      if (res.ok) {
        const updated = await res.json()
        setOrders((prev) => prev.map((o) => (o.id === orderId ? updated : o)))
        toast.success(`Pagamento do pedido #${String(orderId).padStart(4, '0')} validado!`)
      } else {
        const errData = await res.json().catch(() => ({}))
        toast.error(errData.message || 'Não foi possível validar o pagamento.')
      }
    } catch {
      toast.error('Erro ao conectar com o servidor.')
    } finally {
      setConfirmingId(null)
    }
  }

  const handleCancel = async (orderId) => {
    setCancelingId(orderId)
    try {
      const token = localStorage.getItem('token')
      const res = await fetch(`http://localhost:8081/api/pedidos/${orderId}/cancelar`, {
        method: 'PATCH',
        headers: { Authorization: `Bearer ${token}` },
      })

      if (res.ok) {
        const updated = await res.json()
        setOrders((prev) => prev.map((o) => (o.id === orderId ? updated : o)))
        toast.success(`Pedido #${String(orderId).padStart(4, '0')} cancelado.`)
      } else {
        const errData = await res.json().catch(() => ({}))
        toast.error(errData.message || 'Não foi possível cancelar o pedido.')
      }
    } catch (err) {
      console.error(err)
      toast.error('Erro ao conectar com o servidor.')
    } finally {
      setCancelingId(null)
    }
  }

  const filteredOrders =
    statusFilter === 'TODOS'
      ? orders
      : orders.filter((order) => order.status === statusFilter)

  return (
    <AccountLayout
      eyebrow="Histórico de compras"
      title="Meus Pedidos"
      subtitle="Acompanhe o status das suas compras, pagamentos e entregas em tempo real."
      breadcrumbLabel="Meus Pedidos"
    >
      <div className="orders-filters">
        {Object.entries(STATUS_LABELS).map(([key, label]) => (
          <button
            key={key}
            type="button"
            className={`orders-filter-pill ${statusFilter === key ? 'is-active' : ''}`}
            onClick={() => setStatusFilter(key)}
          >
            {label}
          </button>
        ))}
      </div>

      {loading ? (
        <div className="orders-list">
          <div className="skeleton" style={{ height: 180 }} />
          <div className="skeleton" style={{ height: 180 }} />
        </div>
      ) : filteredOrders.length === 0 ? (
        <div className="account-empty panel">
          <FaBoxOpen />
          <h3>
            {orders.length === 0
              ? 'Você ainda não fez nenhum pedido'
              : 'Nenhum pedido com este status'}
          </h3>
          <p>
            {orders.length === 0
              ? 'Explore nosso catálogo de autopeças originais e homologadas para fazer sua primeira compra.'
              : 'Tente selecionar outro filtro acima para visualizar seus demais pedidos.'}
          </p>
          {orders.length === 0 ? (
            <Link to="/catalogo" className="btn btn-primary">
              Ver Catálogo
            </Link>
          ) : (
            <button
              type="button"
              className="btn btn-outline"
              onClick={() => setStatusFilter('TODOS')}
            >
              Mostrar todos
            </button>
          )}
        </div>
      ) : (
        <div className="orders-list">
          {filteredOrders.map((order) => {
            const canCancel =
              order.status === 'AGUARDANDO_PAGAMENTO' ||
              order.status === 'CONFIRMADO' ||
              order.status === 'EM_SEPARACAO'
            const isPendingPayment =
              order.status === 'AGUARDANDO_PAGAMENTO' &&
              order.pagamento?.statusPagamento === 'PENDENTE'

            return (
              <article key={order.id} className="order-card panel">
                <div className="order-card-header">
                  <div className="order-card-id">
                    <strong>Pedido #{String(order.id).padStart(4, '0')}</strong>
                    <span className="mono">
                      {formatDateTime(order.criadoEm)}
                      {order.pagamento?.formaPagamento
                        ? ` · ${PAYMENT_LABELS[order.pagamento.formaPagamento] || order.pagamento.formaPagamento}`
                        : ''}
                      {order.pagamento?.ultimosDigitosCartao
                        ? ` (final ${order.pagamento.ultimosDigitosCartao})`
                        : ''}
                    </span>
                  </div>
                  <span className={`order-status-badge order-status-${order.status}`}>
                    {STATUS_LABELS[order.status] || order.status}
                  </span>
                </div>

                {order.entrega?.logradouro && (
                  <div className="order-meta-bar mono">
                    <span>
                      Entrega: {order.entrega.logradouro}, {order.entrega.numero} —{' '}
                      {order.entrega.cidade}/{order.entrega.estado}
                    </span>
                    {order.entrega.prazoEntrega && <span>{order.entrega.prazoEntrega}</span>}
                  </div>
                )}

                <div className="order-items">
                  {order.itens.map((item) => {
                    const catalogProduct = getProductById(item.produtoSlug)
                    const thumb = item.imagem || catalogProduct?.image

                    return (
                      <div key={item.id} className="order-item-row">
                        {thumb ? (
                          <img src={thumb} alt={item.nome} className="order-item-thumb" />
                        ) : (
                          <div className="order-item-thumb-placeholder">
                            <FaWrench />
                          </div>
                        )}
                        <div className="order-item-info">
                          {catalogProduct ? (
                            <Link to={`/produto/${item.produtoSlug}`} className="order-item-name">
                              {item.nome}
                            </Link>
                          ) : (
                            <span className="order-item-name">{item.nome}</span>
                          )}
                          <span className="order-item-qty mono">
                            {item.quantidade}x {formatCurrency(Number(item.precoUnitario))}
                          </span>
                        </div>
                        <span className="order-item-subtotal mono">
                          {formatCurrency(Number(item.precoUnitario) * item.quantidade)}
                        </span>
                      </div>
                    )
                  })}
                </div>

                <div className="order-card-footer">
                  <div className="order-totals mono">
                    <span>Subtotal: {formatCurrency(Number(order.subtotal))}</span>
                    <span>
                      Frete:{' '}
                      {Number(order.frete) === 0
                        ? 'Grátis'
                        : formatCurrency(Number(order.frete))}
                    </span>
                    {Number(order.desconto) > 0 && (
                      <span style={{ color: '#4ade80' }}>
                        Desconto: - {formatCurrency(Number(order.desconto))}
                      </span>
                    )}
                    <span>
                      Total:
                      <strong>{formatCurrency(Number(order.total))}</strong>
                    </span>
                  </div>

                  <div className="order-actions">
                    {isPendingPayment && (
                      <button
                        type="button"
                        className="btn btn-primary"
                        disabled={confirmingId === order.id}
                        onClick={() => handleConfirmPayment(order.id)}
                      >
                        <FaCheckCircle />{' '}
                        {confirmingId === order.id ? 'Validando...' : 'Validar pagamento'}
                      </button>
                    )}

                    <button
                      type="button"
                      className="btn btn-outline"
                      onClick={() => handleReorder(order)}
                    >
                      <FaRedo /> Comprar novamente
                    </button>

                    {canCancel && (
                      <button
                        type="button"
                        className="btn btn-outline"
                        disabled={cancelingId === order.id}
                        onClick={() => handleCancel(order.id)}
                      >
                        <FaTimesCircle />{' '}
                        {cancelingId === order.id ? 'Cancelando...' : 'Cancelar'}
                      </button>
                    )}
                  </div>
                </div>
              </article>
            )
          })}
        </div>
      )}
    </AccountLayout>
  )
}
