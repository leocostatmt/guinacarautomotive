import { useState, useEffect } from 'react'
import { Link } from 'react-router-dom'
import toast from 'react-hot-toast'
import {
  FaDollarSign,
  FaTruck,
  FaUsers,
  FaCubes,
  FaChartBar,
  FaTrophy,
  FaReceipt,
  FaSyncAlt,
  FaExclamationTriangle,
} from 'react-icons/fa'
import AdminLayout from '../../components/AdminLayout'
import { adminFetch } from '../../services/adminApi'
import { formatCurrency } from '../../utils/formatCurrency'

const STATUS_META = {
  AGUARDANDO_PAGAMENTO: { label: 'Aguardando Pgto', cls: 'admin-badge-amber' },
  CONFIRMADO: { label: 'Confirmado', cls: 'admin-badge-blue' },
  EM_SEPARACAO: { label: 'Em Separação', cls: 'admin-badge-amber' },
  ENVIADO: { label: 'Enviado', cls: 'admin-badge-purple' },
  ENTREGUE: { label: 'Entregue', cls: 'admin-badge-green' },
  CANCELADO: { label: 'Cancelado', cls: 'admin-badge-red' },
}

const PAYMENT_LABELS = {
  PIX: 'PIX',
  CARTAO_CREDITO: 'Cartão de Crédito',
  BOLETO: 'Boleto Bancário',
}

export default function AdminDashboard() {
  const [data, setData] = useState(null)
  const [loading, setLoading] = useState(true)

  const loadDashboard = async () => {
    setLoading(true)
    try {
      const res = await adminFetch('/api/admin/dashboard')
      setData(res)
    } catch (err) {
      toast.error(err.message || 'Erro ao carregar dashboard')
    } finally {
      setLoading(false)
    }
  }

  useEffect(() => {
    loadDashboard()
  }, [])

  const maxDayTotal = data?.vendasUltimos7Dias?.length
    ? Math.max(...data.vendasUltimos7Dias.map((d) => Number(d.total) || 0), 1)
    : 1

  const totalStatusCount = data?.pedidosPorStatus
    ? Object.values(data.pedidosPorStatus).reduce((sum, n) => sum + Number(n), 0) || 1
    : 1

  return (
    <AdminLayout
      eyebrow="Central do Vendedor"
      title="Visão Geral da Loja"
      subtitle="Acompanhe faturamento, vendas diárias, fila de envios e saúde do estoque em tempo real."
      actions={
        <button type="button" className="btn btn-outline" onClick={loadDashboard} disabled={loading}>
          <FaSyncAlt /> Atualizar
        </button>
      }
    >
      {loading || !data ? (
        <div className="admin-kpi-grid">
          <div className="skeleton" style={{ height: 120 }} />
          <div className="skeleton" style={{ height: 120 }} />
          <div className="skeleton" style={{ height: 120 }} />
          <div className="skeleton" style={{ height: 120 }} />
        </div>
      ) : (
        <>
          {/* KPIs */}
          <div className="admin-kpi-grid">
            <div className="admin-kpi-card panel">
              <div className="admin-kpi-top">
                <span className="admin-kpi-label">Faturamento Mês</span>
                <span className="admin-kpi-icon is-green">
                  <FaDollarSign />
                </span>
              </div>
              <div className="admin-kpi-value mono">{formatCurrency(Number(data.faturamentoMes))}</div>
              <span className="admin-kpi-foot mono">
                Hoje: {formatCurrency(Number(data.faturamentoHoje))} · Total:{' '}
                {formatCurrency(Number(data.faturamentoTotal))}
              </span>
            </div>

            <Link to="/admin/pedidos" className="admin-kpi-card panel">
              <div className="admin-kpi-top">
                <span className="admin-kpi-label">Envios Pendentes</span>
                <span className="admin-kpi-icon is-amber">
                  <FaTruck />
                </span>
              </div>
              <div className="admin-kpi-value mono">{data.enviosPendentes}</div>
              <span className="admin-kpi-foot mono">
                Pedidos hoje: {data.pedidosHoje} · Total: {data.totalPedidos}
              </span>
            </Link>

            <Link to="/admin/produtos" className="admin-kpi-card panel">
              <div className="admin-kpi-top">
                <span className="admin-kpi-label">Produtos Ativos</span>
                <span className="admin-kpi-icon is-blue">
                  <FaCubes />
                </span>
              </div>
              <div className="admin-kpi-value mono">{data.produtosAtivos}</div>
              <span className="admin-kpi-foot mono">
                {data.produtosEstoqueBaixo > 0 ? (
                  <span style={{ color: '#fbbf24' }}>
                    <FaExclamationTriangle /> {data.produtosEstoqueBaixo} com estoque baixo (≤ 5)
                  </span>
                ) : (
                  'Estoque saudável'
                )}
              </span>
            </Link>

            <Link to="/admin/clientes" className="admin-kpi-card panel">
              <div className="admin-kpi-top">
                <span className="admin-kpi-label">Base & Ticket Médio</span>
                <span className="admin-kpi-icon">
                  <FaUsers />
                </span>
              </div>
              <div className="admin-kpi-value mono">{formatCurrency(Number(data.ticketMedio))}</div>
              <span className="admin-kpi-foot mono">
                {data.totalClientes} clientes · {data.totalFuncionarios} equipe
              </span>
            </Link>
          </div>

          {/* Gráfico 7 dias + Status */}
          <div className="admin-grid-2">
            <div className="admin-card panel">
              <div className="admin-card-head">
                <h2>
                  <FaChartBar /> Vendas dos últimos 7 dias
                </h2>
                <Link to="/admin/relatorios" className="admin-card-link">
                  Ver relatório completo
                </Link>
              </div>
              <div className="admin-barchart">
                {data.vendasUltimos7Dias.map((day) => {
                  const pct = Math.max(4, Math.round((Number(day.total) / maxDayTotal) * 100))
                  return (
                    <div
                      key={day.data}
                      className="admin-bar-col"
                      title={`${day.data}: ${day.pedidos} pedido(s) — ${formatCurrency(Number(day.total))}`}
                    >
                      <span className="admin-bar-val">
                        {Number(day.total) > 0 ? `R$${Math.round(Number(day.total))}` : '—'}
                      </span>
                      <div className="admin-bar-track">
                        <div className="admin-bar-fill" style={{ height: `${pct}%` }} />
                      </div>
                      <span className="admin-bar-label">{day.data}</span>
                    </div>
                  )
                })}
              </div>
            </div>

            <div className="admin-card panel">
              <div className="admin-card-head">
                <h2>
                  <FaReceipt /> Pedidos por Status
                </h2>
                <Link to="/admin/pedidos" className="admin-card-link">
                  Gerenciar fila
                </Link>
              </div>
              <div className="admin-dist-list">
                {Object.entries(data.pedidosPorStatus || {}).map(([status, count]) => {
                  const meta = STATUS_META[status] || { label: status }
                  const pct = Math.round((Number(count) / totalStatusCount) * 100)
                  return (
                    <div key={status} className="admin-dist-row">
                      <div className="admin-dist-meta">
                        <span>{meta.label}</span>
                        <strong className="mono">
                          {count} ({pct}%)
                        </strong>
                      </div>
                      <div className="admin-dist-bar">
                        <span style={{ width: `${pct}%` }} />
                      </div>
                    </div>
                  )
                })}
              </div>
            </div>
          </div>

          {/* Top Produtos + Formas de Pagamento */}
          <div className="admin-grid-equal">
            <div className="admin-card panel">
              <div className="admin-card-head">
                <h2>
                  <FaTrophy /> Top 5 Peças Mais Vendidas
                </h2>
              </div>
              {data.topProdutos.length === 0 ? (
                <p className="admin-subtext">Nenhuma venda registrada ainda.</p>
              ) : (
                <div className="admin-table-wrap">
                  <table className="admin-table">
                    <thead>
                      <tr>
                        <th>Produto</th>
                        <th>Qtd.</th>
                        <th>Receita</th>
                      </tr>
                    </thead>
                    <tbody>
                      {data.topProdutos.map((prod) => (
                        <tr key={prod.produtoSlug}>
                          <td>
                            <strong>{prod.nome}</strong>
                            <span className="admin-subtext mono">{prod.produtoSlug}</span>
                          </td>
                          <td className="mono">{prod.quantidadeVendida} un.</td>
                          <td className="mono">{formatCurrency(Number(prod.receita))}</td>
                        </tr>
                      ))}
                    </tbody>
                  </table>
                </div>
              )}
            </div>

            <div className="admin-card panel">
              <div className="admin-card-head">
                <h2>
                  <FaDollarSign /> Receita por Forma de Pagamento
                </h2>
              </div>
              {data.vendasPorPagamento.length === 0 ? (
                <p className="admin-subtext">Nenhum pagamento registrado ainda.</p>
              ) : (
                <div className="admin-dist-list">
                  {data.vendasPorPagamento.map((pag) => {
                    const totalGeral = Number(data.faturamentoTotal) || 1
                    const pct = Math.round((Number(pag.total) / totalGeral) * 100)
                    return (
                      <div key={pag.formaPagamento} className="admin-dist-row">
                        <div className="admin-dist-meta">
                          <span>
                            {PAYMENT_LABELS[pag.formaPagamento] || pag.formaPagamento} (
                            {pag.quantidade}x)
                          </span>
                          <strong className="mono">{formatCurrency(Number(pag.total))}</strong>
                        </div>
                        <div className="admin-dist-bar">
                          <span style={{ width: `${pct}%` }} />
                        </div>
                      </div>
                    )
                  })}
                </div>
              )}
            </div>
          </div>

          {/* Pedidos Recentes */}
          <div className="admin-card panel">
            <div className="admin-card-head">
              <h2>
                <FaTruck /> Últimos Pedidos Recebidos
              </h2>
              <Link to="/admin/pedidos" className="admin-card-link">
                Ver todos os pedidos
              </Link>
            </div>
            {data.pedidosRecentes.length === 0 ? (
              <p className="admin-subtext">Nenhum pedido registrado até o momento.</p>
            ) : (
              <div className="admin-table-wrap">
                <table className="admin-table">
                  <thead>
                    <tr>
                      <th>Pedido</th>
                      <th>Cliente</th>
                      <th>Pagamento</th>
                      <th>Total</th>
                      <th>Status</th>
                    </tr>
                  </thead>
                  <tbody>
                    {data.pedidosRecentes.map((p) => {
                      const st = STATUS_META[p.status] || { label: p.status, cls: 'admin-badge-gray' }
                      return (
                        <tr key={p.id}>
                          <td className="mono">#{String(p.id).padStart(4, '0')}</td>
                          <td>
                            <strong>{p.clienteNome}</strong>
                            <span className="admin-subtext">{p.clienteEmail}</span>
                          </td>
                          <td className="mono">
                            {PAYMENT_LABELS[p.pagamento?.formaPagamento] || '—'}
                          </td>
                          <td className="mono">{formatCurrency(Number(p.total))}</td>
                          <td>
                            <span className={`admin-badge ${st.cls}`}>{st.label}</span>
                          </td>
                        </tr>
                      )
                    })}
                  </tbody>
                </table>
              </div>
            )}
          </div>
        </>
      )}
    </AdminLayout>
  )
}
