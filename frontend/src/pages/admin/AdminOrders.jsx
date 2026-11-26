import { useState, useEffect, useCallback } from 'react'
import toast from 'react-hot-toast'
import { FaTruck, FaBoxOpen, FaEye, FaTimes, FaPaperPlane } from 'react-icons/fa'
import AdminLayout from '../../components/AdminLayout'
import { adminFetch } from '../../services/adminApi'
import { formatCurrency } from '../../utils/formatCurrency'

const STATUS_OPTIONS = [
  { value: 'AGUARDANDO_PAGAMENTO', label: 'Aguardando Pgto', cls: 'admin-badge-amber' },
  { value: 'CONFIRMADO', label: 'Confirmado', cls: 'admin-badge-blue' },
  { value: 'EM_SEPARACAO', label: 'Em Separação', cls: 'admin-badge-amber' },
  { value: 'ENVIADO', label: 'Enviado', cls: 'admin-badge-purple' },
  { value: 'ENTREGUE', label: 'Entregue', cls: 'admin-badge-green' },
  { value: 'CANCELADO', label: 'Cancelado', cls: 'admin-badge-red' },
]

const STATUS_MAP = Object.fromEntries(STATUS_OPTIONS.map((o) => [o.value, o]))

function formatDate(iso) {
  if (!iso) return '—'
  const d = new Date(iso)
  return Number.isNaN(d.getTime())
    ? iso
    : d.toLocaleString('pt-BR', { day: '2-digit', month: '2-digit', year: 'numeric', hour: '2-digit', minute: '2-digit' })
}

export default function AdminOrders() {
  const [tab, setTab] = useState('TODOS') // TODOS | ENVIOS
  const [statusFilter, setStatusFilter] = useState('')
  const [busca, setBusca] = useState('')
  const [page, setPage] = useState(0)
  const [pageData, setPageData] = useState({ content: [], totalElements: 0, totalPages: 0 })
  const [loading, setLoading] = useState(true)

  const [detailOrder, setDetailOrder] = useState(null)
  const [dispatchOrder, setDispatchOrder] = useState(null)
  const [dispatchForm, setDispatchForm] = useState({ transportadora: 'GuinaCar Full Logística', codigoRastreio: '' })
  const [submitting, setSubmitting] = useState(false)

  const loadOrders = useCallback(async () => {
    setLoading(true)
    try {
      const res = await adminFetch('/api/admin/pedidos', {
        params: {
          somenteEnvios: tab === 'ENVIOS',
          status: tab === 'ENVIOS' ? '' : statusFilter,
          busca,
          page,
          size: 15,
        },
      })
      setPageData(res || { content: [], totalElements: 0, totalPages: 0 })
    } catch (err) {
      toast.error(err.message || 'Erro ao carregar pedidos')
    } finally {
      setLoading(false)
    }
  }, [tab, statusFilter, busca, page])

  useEffect(() => {
    const timer = setTimeout(loadOrders, 220)
    return () => clearTimeout(timer)
  }, [loadOrders])

  const handleStatusChange = async (orderId, novoStatus) => {
    try {
      await adminFetch(`/api/admin/pedidos/${orderId}/status`, {
        method: 'PATCH',
        body: { status: novoStatus },
      })
      toast.success(`Pedido #${String(orderId).padStart(4, '0')} atualizado para ${STATUS_MAP[novoStatus]?.label || novoStatus}`)
      loadOrders()
    } catch (err) {
      toast.error(err.message || 'Erro ao atualizar status')
    }
  }

  const openDispatchModal = (order) => {
    setDispatchOrder(order)
    setDispatchForm({
      transportadora: order.transportadora || 'GuinaCar Full Logística',
      codigoRastreio: order.codigoRastreio || '',
    })
  }

  const handleDispatchSubmit = async (e) => {
    e.preventDefault()
    if (!dispatchOrder) return
    setSubmitting(true)
    try {
      const updated = await adminFetch(`/api/admin/pedidos/${dispatchOrder.id}/despachar`, {
        method: 'POST',
        body: dispatchForm,
      })
      toast.success(`Envio despachado! Rastreio: ${updated.codigoRastreio}`)
      setDispatchOrder(null)
      loadOrders()
    } catch (err) {
      toast.error(err.message || 'Erro ao despachar envio')
    } finally {
      setSubmitting(false)
    }
  }

  return (
    <AdminLayout
      eyebrow="Operação & Logística"
      title="Pedidos & Envios do Dia"
      subtitle="Gerencie todas as vendas, atualize status em tempo real e despache pacotes com código de rastreio."
    >
      <div className="admin-tabs">
        <button
          type="button"
          className={`admin-tab ${tab === 'TODOS' ? 'is-active' : ''}`}
          onClick={() => {
            setTab('TODOS')
            setPage(0)
          }}
        >
          <FaBoxOpen /> Todos os Pedidos
        </button>
        <button
          type="button"
          className={`admin-tab ${tab === 'ENVIOS' ? 'is-active' : ''}`}
          onClick={() => {
            setTab('ENVIOS')
            setPage(0)
          }}
        >
          <FaTruck /> Fila de Envios do Dia (Prontos p/ Despacho)
        </button>
      </div>

      <div className="admin-toolbar panel">
        <input
          className="admin-search-input"
          placeholder="Buscar por #pedido, nome/e-mail do cliente ou rastreio..."
          value={busca}
          onChange={(e) => {
            setBusca(e.target.value)
            setPage(0)
          }}
        />
        {tab === 'TODOS' && (
          <select
            className="admin-select"
            value={statusFilter}
            onChange={(e) => {
              setStatusFilter(e.target.value)
              setPage(0)
            }}
          >
            <option value="">Todos os status</option>
            {STATUS_OPTIONS.map((opt) => (
              <option key={opt.value} value={opt.value}>
                {opt.label}
              </option>
            ))}
          </select>
        )}
      </div>

      <div className="admin-card panel">
        {loading ? (
          <div className="skeleton" style={{ height: 260 }} />
        ) : pageData.content.length === 0 ? (
          <p className="admin-subtext">Nenhum pedido encontrado com os filtros selecionados.</p>
        ) : (
          <>
            <div className="admin-table-wrap">
              <table className="admin-table">
                <thead>
                  <tr>
                    <th>Pedido</th>
                    <th>Cliente</th>
                    <th>Entrega / Rastreio</th>
                    <th>Total</th>
                    <th>Status</th>
                    <th>Ações</th>
                  </tr>
                </thead>
                <tbody>
                  {pageData.content.map((order) => {
                    const st = STATUS_MAP[order.status] || { label: order.status, cls: 'admin-badge-gray' }
                    const canDispatch = order.status === 'CONFIRMADO' || order.status === 'EM_SEPARACAO'

                    return (
                      <tr key={order.id}>
                        <td>
                          <strong className="mono">#{String(order.id).padStart(4, '0')}</strong>
                          <span className="admin-subtext mono">{formatDate(order.criadoEm)}</span>
                        </td>
                        <td>
                          <strong>{order.clienteNome}</strong>
                          <span className="admin-subtext">{order.clienteEmail}</span>
                        </td>
                        <td>
                          <span>
                            {order.entrega?.tipoEntrega === 'RETIRADA'
                              ? 'Retirada na loja'
                              : `${order.entrega?.cidade || '—'}/${order.entrega?.estado || ''}`}
                          </span>
                          <span className="admin-subtext mono">
                            {order.codigoRastreio ? `Rastreio: ${order.codigoRastreio}` : order.entrega?.prazoEntrega || '—'}
                          </span>
                        </td>
                        <td>
                          <strong className="mono">{formatCurrency(Number(order.total))}</strong>
                          <span className="admin-subtext mono">
                            {order.pagamento?.formaPagamento || '—'} · {order.itens.length} item(ns)
                          </span>
                        </td>
                        <td>
                          <select
                            className="admin-select"
                            value={order.status}
                            onChange={(e) => handleStatusChange(order.id, e.target.value)}
                            style={{ padding: '6px 8px', fontSize: '0.78rem' }}
                          >
                            {STATUS_OPTIONS.map((opt) => (
                              <option key={opt.value} value={opt.value}>
                                {opt.label}
                              </option>
                            ))}
                          </select>
                        </td>
                        <td>
                          <div className="admin-row-actions">
                            {canDispatch && (
                              <button
                                type="button"
                                className="admin-icon-btn is-primary"
                                onClick={() => openDispatchModal(order)}
                              >
                                <FaPaperPlane /> Despachar
                              </button>
                            )}
                            <button
                              type="button"
                              className="admin-icon-btn"
                              onClick={() => setDetailOrder(order)}
                            >
                              <FaEye /> Detalhes
                            </button>
                          </div>
                        </td>
                      </tr>
                    )
                  })}
                </tbody>
              </table>
            </div>

            <div className="admin-pagination">
              <span className="mono">
                Total: {pageData.totalElements} pedido(s) · Página {page + 1} de{' '}
                {Math.max(1, pageData.totalPages)}
              </span>
              <div className="admin-pagination-btns">
                <button
                  type="button"
                  className="admin-icon-btn"
                  disabled={page === 0}
                  onClick={() => setPage((p) => Math.max(0, p - 1))}
                >
                  Anterior
                </button>
                <button
                  type="button"
                  className="admin-icon-btn"
                  disabled={page + 1 >= pageData.totalPages}
                  onClick={() => setPage((p) => p + 1)}
                >
                  Próxima
                </button>
              </div>
            </div>
          </>
        )}
      </div>

      {/* Modal de Despacho */}
      {dispatchOrder && (
        <div className="admin-modal-backdrop" onClick={() => setDispatchOrder(null)}>
          <div className="admin-modal panel" onClick={(e) => e.stopPropagation()}>
            <div className="admin-modal-head">
              <h2>Despachar Pedido #{String(dispatchOrder.id).padStart(4, '0')}</h2>
              <button type="button" className="admin-modal-close" onClick={() => setDispatchOrder(null)}>
                <FaTimes />
              </button>
            </div>
            <form onSubmit={handleDispatchSubmit}>
              <div className="admin-form-grid">
                <div className="form-field admin-form-full">
                  <label htmlFor="transportadora">Transportadora</label>
                  <select
                    id="transportadora"
                    value={dispatchForm.transportadora}
                    onChange={(e) => setDispatchForm((p) => ({ ...p, transportadora: e.target.value }))}
                  >
                    <option value="GuinaCar Full Logística">GuinaCar Full Logística</option>
                    <option value="Correios SEDEX">Correios SEDEX</option>
                    <option value="Correios PAC">Correios PAC</option>
                    <option value="Jadlog Express">Jadlog Express</option>
                    <option value="Total Express">Total Express</option>
                  </select>
                </div>
                <div className="form-field admin-form-full">
                  <label htmlFor="rastreio">Código de Rastreio (deixe vazio para gerar automaticamente)</label>
                  <input
                    id="rastreio"
                    className="mono"
                    placeholder="Ex: GC94820183BR"
                    value={dispatchForm.codigoRastreio}
                    onChange={(e) => setDispatchForm((p) => ({ ...p, codigoRastreio: e.target.value }))}
                  />
                </div>
              </div>
              <div className="admin-modal-footer">
                <button type="button" className="btn btn-outline" onClick={() => setDispatchOrder(null)}>
                  Cancelar
                </button>
                <button type="submit" className="btn btn-primary" disabled={submitting}>
                  <FaTruck /> {submitting ? 'Despachando...' : 'Confirmar Despacho'}
                </button>
              </div>
            </form>
          </div>
        </div>
      )}

      {/* Modal de Detalhes do Pedido */}
      {detailOrder && (
        <div className="admin-modal-backdrop" onClick={() => setDetailOrder(null)}>
          <div className="admin-modal panel" onClick={(e) => e.stopPropagation()}>
            <div className="admin-modal-head">
              <h2>Detalhes do Pedido #{String(detailOrder.id).padStart(4, '0')}</h2>
              <button type="button" className="admin-modal-close" onClick={() => setDetailOrder(null)}>
                <FaTimes />
              </button>
            </div>
            <div style={{ display: 'flex', flexDirection: 'column', gap: 14, fontSize: '0.88rem' }}>
              <div>
                <strong style={{ color: 'var(--red)' }}>CLIENTE</strong>
                <div>{detailOrder.clienteNome} · {detailOrder.clienteEmail} · Tel: {detailOrder.clienteTelefone}</div>
              </div>
              <div>
                <strong style={{ color: 'var(--red)' }}>ENTREGA</strong>
                <div>
                  {detailOrder.entrega?.tipoEntrega === 'RETIRADA'
                    ? 'Retirada na loja física GuinaCar'
                    : `${detailOrder.entrega?.destinatario || ''} — ${detailOrder.entrega?.logradouro || ''}, ${detailOrder.entrega?.numero || ''} · ${detailOrder.entrega?.bairro || ''} — ${detailOrder.entrega?.cidade || ''}/${detailOrder.entrega?.estado || ''} (CEP ${detailOrder.entrega?.cep || ''})`}
                </div>
                {detailOrder.codigoRastreio && (
                  <div className="mono" style={{ color: '#4ade80', marginTop: 4 }}>
                    {detailOrder.transportadora} · Rastreio: {detailOrder.codigoRastreio}
                  </div>
                )}
              </div>
              <div>
                <strong style={{ color: 'var(--red)' }}>ITENS DO PEDIDO</strong>
                <div className="admin-table-wrap" style={{ marginTop: 8 }}>
                  <table className="admin-table">
                    <thead>
                      <tr>
                        <th>Peça</th>
                        <th>Qtd</th>
                        <th>Subtotal</th>
                      </tr>
                    </thead>
                    <tbody>
                      {detailOrder.itens.map((item) => (
                        <tr key={item.id}>
                          <td>{item.nome}</td>
                          <td className="mono">{item.quantidade}x</td>
                          <td className="mono">
                            {formatCurrency(Number(item.precoUnitario) * item.quantidade)}
                          </td>
                        </tr>
                      ))}
                    </tbody>
                  </table>
                </div>
              </div>
              <div className="mono" style={{ display: 'flex', justifyContent: 'space-between', paddingTop: 10, borderTop: '1px solid var(--line)' }}>
                <span>Subtotal: {formatCurrency(Number(detailOrder.subtotal))}</span>
                <span>Frete: {formatCurrency(Number(detailOrder.frete))}</span>
                <strong style={{ color: 'var(--red)' }}>Total: {formatCurrency(Number(detailOrder.total))}</strong>
              </div>
            </div>
          </div>
        </div>
      )}
    </AdminLayout>
  )
}
