import { useState, useEffect, useCallback } from 'react'
import toast from 'react-hot-toast'
import { FaDownload, FaChartBar, FaDollarSign, FaReceipt, FaTrophy } from 'react-icons/fa'
import AdminLayout from '../../components/AdminLayout'
import { adminFetch } from '../../services/adminApi'
import { formatCurrency } from '../../utils/formatCurrency'

function isoDaysAgo(days) {
  const d = new Date()
  d.setDate(d.getDate() - days)
  return d.toISOString().slice(0, 10)
}

export default function AdminReports() {
  const [inicio, setInicio] = useState(() => isoDaysAgo(29))
  const [fim, setFim] = useState(() => isoDaysAgo(0))
  const [report, setReport] = useState(null)
  const [loading, setLoading] = useState(true)

  const loadReport = useCallback(async () => {
    setLoading(true)
    try {
      const data = await adminFetch('/api/admin/relatorios/vendas', {
        params: { inicio, fim },
      })
      setReport(data)
    } catch (err) {
      toast.error(err.message || 'Erro ao gerar relatório')
    } finally {
      setLoading(false)
    }
  }, [inicio, fim])

  useEffect(() => {
    loadReport()
  }, [loadReport])

  const applyPreset = (days) => {
    setInicio(isoDaysAgo(days))
    setFim(isoDaysAgo(0))
  }

  const exportCsv = () => {
    if (!report) return
    const rows = [
      ['Relatório de Vendas GuinaCar', `${report.dataInicio} a ${report.dataFim}`],
      [],
      ['Indicador', 'Valor'],
      ['Pedidos Totais', report.totalPedidos],
      ['Pedidos Válidos', report.pedidosValidos],
      ['Pedidos Cancelados', report.pedidosCancelados],
      ['Receita Bruta', report.receitaBruta],
      ['Descontos', report.totalDescontos],
      ['Fretes', report.totalFretes],
      ['Receita Líquida', report.receitaLiquida],
      ['Ticket Médio', report.ticketMedio],
      [],
      ['Data', 'Pedidos', 'Total (R$)'],
      ...report.serieDiaria.map((d) => [d.data, d.pedidos, d.total]),
    ]
    const csv = '\uFEFF' + rows.map((r) => r.join(';')).join('\n')
    const blob = new Blob([csv], { type: 'text/csv;charset=utf-8;' })
    const url = URL.createObjectURL(blob)
    const a = document.createElement('a')
    a.href = url
    a.download = `relatorio-vendas-${report.dataInicio}-a-${report.dataFim}.csv`
    a.click()
    URL.revokeObjectURL(url)
    toast.success('Relatório CSV exportado!')
  }

  return (
    <AdminLayout
      eyebrow="Inteligência Comercial"
      title="Relatórios de Vendas"
      subtitle="Analise receita bruta, líquida, descontos, fretes e desempenho de peças por período."
      actions={
        <button type="button" className="btn btn-primary" onClick={exportCsv} disabled={!report}>
          <FaDownload /> Exportar CSV
        </button>
      }
    >
      <div className="admin-toolbar panel">
        <div className="admin-tabs">
          <button type="button" className="admin-icon-btn" onClick={() => applyPreset(0)}>
            Hoje
          </button>
          <button type="button" className="admin-icon-btn" onClick={() => applyPreset(6)}>
            7 dias
          </button>
          <button type="button" className="admin-icon-btn" onClick={() => applyPreset(29)}>
            30 dias
          </button>
          <button type="button" className="admin-icon-btn" onClick={() => applyPreset(89)}>
            90 dias
          </button>
        </div>
        <div style={{ display: 'flex', alignItems: 'center', gap: 10, marginLeft: 'auto', flexWrap: 'wrap' }}>
          <input
            type="date"
            className="admin-select mono"
            value={inicio}
            onChange={(e) => setInicio(e.target.value)}
          />
          <span style={{ color: 'var(--gray)' }}>até</span>
          <input
            type="date"
            className="admin-select mono"
            value={fim}
            onChange={(e) => setFim(e.target.value)}
          />
        </div>
      </div>

      {loading || !report ? (
        <div className="skeleton" style={{ height: 280 }} />
      ) : (
        <>
          <div className="admin-kpi-grid">
            <div className="admin-kpi-card panel">
              <div className="admin-kpi-top">
                <span className="admin-kpi-label">Receita Líquida</span>
                <span className="admin-kpi-icon is-green">
                  <FaDollarSign />
                </span>
              </div>
              <div className="admin-kpi-value mono">{formatCurrency(Number(report.receitaLiquida))}</div>
              <span className="admin-kpi-foot mono">
                Bruta: {formatCurrency(Number(report.receitaBruta))}
              </span>
            </div>

            <div className="admin-kpi-card panel">
              <div className="admin-kpi-top">
                <span className="admin-kpi-label">Ticket Médio</span>
                <span className="admin-kpi-icon is-blue">
                  <FaChartBar />
                </span>
              </div>
              <div className="admin-kpi-value mono">{formatCurrency(Number(report.ticketMedio))}</div>
              <span className="admin-kpi-foot mono">{report.pedidosValidos} pedidos válidos</span>
            </div>

            <div className="admin-kpi-card panel">
              <div className="admin-kpi-top">
                <span className="admin-kpi-label">Descontos & Fretes</span>
                <span className="admin-kpi-icon is-amber">
                  <FaReceipt />
                </span>
              </div>
              <div className="admin-kpi-value mono">{formatCurrency(Number(report.totalFretes))}</div>
              <span className="admin-kpi-foot mono">
                Descontos PIX: - {formatCurrency(Number(report.totalDescontos))}
              </span>
            </div>

            <div className="admin-kpi-card panel">
              <div className="admin-kpi-top">
                <span className="admin-kpi-label">Cancelamentos</span>
                <span className="admin-kpi-icon">
                  <FaReceipt />
                </span>
              </div>
              <div className="admin-kpi-value mono">{report.pedidosCancelados}</div>
              <span className="admin-kpi-foot mono">
                de {report.totalPedidos} pedidos no período
              </span>
            </div>
          </div>

          <div className="admin-grid-equal">
            <div className="admin-card panel">
              <div className="admin-card-head">
                <h2>
                  <FaTrophy /> Ranking de Peças no Período
                </h2>
              </div>
              {report.produtosMaisVendidos.length === 0 ? (
                <p className="admin-subtext">Sem vendas registradas neste período.</p>
              ) : (
                <div className="admin-table-wrap">
                  <table className="admin-table">
                    <thead>
                      <tr>
                        <th>Produto</th>
                        <th>Qtd</th>
                        <th>Receita</th>
                      </tr>
                    </thead>
                    <tbody>
                      {report.produtosMaisVendidos.map((p) => (
                        <tr key={p.produtoSlug}>
                          <td>{p.nome}</td>
                          <td className="mono">{p.quantidadeVendida}</td>
                          <td className="mono">{formatCurrency(Number(p.receita))}</td>
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
                  <FaChartBar /> Faturamento Diário (Dias com movimento)
                </h2>
              </div>
              <div className="admin-table-wrap" style={{ maxHeight: 340, overflowY: 'auto' }}>
                <table className="admin-table">
                  <thead>
                    <tr>
                      <th>Dia</th>
                      <th>Pedidos</th>
                      <th>Total</th>
                    </tr>
                  </thead>
                  <tbody>
                    {report.serieDiaria.filter((d) => d.pedidos > 0).length === 0 ? (
                      <tr>
                        <td colSpan={3} className="admin-subtext">
                          Sem movimentação financeira no período selecionado.
                        </td>
                      </tr>
                    ) : (
                      report.serieDiaria
                        .filter((d) => d.pedidos > 0)
                        .map((d) => (
                          <tr key={d.data}>
                            <td className="mono">{d.data}</td>
                            <td className="mono">{d.pedidos}</td>
                            <td className="mono">{formatCurrency(Number(d.total))}</td>
                          </tr>
                        ))
                    )}
                  </tbody>
                </table>
              </div>
            </div>
          </div>
        </>
      )}
    </AdminLayout>
  )
}
