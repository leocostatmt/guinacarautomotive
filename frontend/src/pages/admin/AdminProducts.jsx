import { useState, useEffect, useCallback, useRef } from 'react'
import toast from 'react-hot-toast'
import {
  FaPlus,
  FaEdit,
  FaTrash,
  FaTimes,
  FaToggleOn,
  FaToggleOff,
  FaExclamationTriangle,
  FaUpload,
  FaStar,
  FaCar,
  FaClipboardList,
  FaImages,
  FaBoxOpen,
  FaLink,
} from 'react-icons/fa'
import AdminLayout from '../../components/AdminLayout'
import { useAuth } from '../../context/AuthContext'
import { adminFetch, adminUpload } from '../../services/adminApi'
import { formatCurrency } from '../../utils/formatCurrency'

const QUICK_SPECS = [
  'Posição',
  'Lado',
  'Material',
  'Código OEM',
  'Garantia',
  'Voltagem',
  'Peso',
  'Aplicação',
]

const EMPTY_PRODUCT = {
  name: '',
  slug: '',
  manufacturer: '',
  categoryId: '',
  price: '',
  stock: 0,
  images: [],
  description: '',
  active: true,
  specs: [{ label: '', value: '' }],
  compatibilidades: [],
}

export default function AdminProducts() {
  const { user } = useAuth()
  const isAdmin = user?.role === 'ADMIN'
  const fileInputRef = useRef(null)

  const [busca, setBusca] = useState('')
  const [categoriaId, setCategoriaId] = useState('')
  const [ativoFilter, setAtivoFilter] = useState('')
  const [estoqueBaixo, setEstoqueBaixo] = useState(false)
  const [page, setPage] = useState(0)

  const [categories, setCategories] = useState([])
  const [montadoras, setMontadoras] = useState([])
  const [pageData, setPageData] = useState({ content: [], totalElements: 0, totalPages: 0 })
  const [loading, setLoading] = useState(true)

  const [modalOpen, setModalOpen] = useState(false)
  const [activeTab, setActiveTab] = useState('GERAL') // GERAL | FOTOS | SPECS | APLICACOES
  const [editingId, setEditingId] = useState(null)
  const [form, setForm] = useState(EMPTY_PRODUCT)
  const [saving, setSaving] = useState(false)

  // Upload de fotos
  const [uploading, setUploading] = useState(false)
  const [dragOver, setDragOver] = useState(false)
  const [urlInput, setUrlInput] = useState('')

  // Seletor de Aplicações de Veículos
  const [selMontadoraId, setSelMontadoraId] = useState('')
  const [selModeloId, setSelModeloId] = useState('')
  const [selAnoInicio, setSelAnoInicio] = useState(String(new Date().getFullYear() - 5))
  const [selAnoFim, setSelAnoFim] = useState('')
  const [addingModel, setAddingModel] = useState(false)
  const [newModelName, setNewModelName] = useState('')

  const loadAuxData = useCallback(async () => {
    try {
      const [cats, monts] = await Promise.all([
        adminFetch('/api/admin/categorias'),
        adminFetch('/api/admin/montadoras'),
      ])
      setCategories(Array.isArray(cats) ? cats : [])
      setMontadoras(Array.isArray(monts) ? monts : [])
    } catch {
      // silencioso
    }
  }, [])

  useEffect(() => {
    loadAuxData()
  }, [loadAuxData])

  const loadProducts = useCallback(async () => {
    setLoading(true)
    try {
      const res = await adminFetch('/api/admin/produtos', {
        params: {
          busca,
          categoriaId,
          ativo: ativoFilter,
          estoqueBaixo: estoqueBaixo ? true : '',
          page,
          size: 12,
        },
      })
      setPageData(res || { content: [], totalElements: 0, totalPages: 0 })
    } catch (err) {
      toast.error(err.message || 'Erro ao carregar produtos')
    } finally {
      setLoading(false)
    }
  }, [busca, categoriaId, ativoFilter, estoqueBaixo, page])

  useEffect(() => {
    const t = setTimeout(loadProducts, 220)
    return () => clearTimeout(t)
  }, [loadProducts])

  const openCreateModal = () => {
    setEditingId(null)
    setActiveTab('GERAL')
    setUrlInput('')
    setForm({
      ...EMPTY_PRODUCT,
      categoryId: categories[0]?.id || '',
      specs: [{ label: '', value: '' }],
      compatibilidades: [],
    })
    if (montadoras.length > 0) {
      setSelMontadoraId(String(montadoras[0].id))
      setSelModeloId(montadoras[0].modelos?.[0]?.id ? String(montadoras[0].modelos[0].id) : '')
    }
    setModalOpen(true)
  }

  const openEditModal = (prod) => {
    setEditingId(prod.id)
    setActiveTab('GERAL')
    setUrlInput('')
    const imgs =
      prod.images && prod.images.length > 0
        ? [...prod.images]
        : prod.image
          ? [prod.image]
          : []
    setForm({
      name: prod.name || '',
      slug: prod.slug || '',
      manufacturer: prod.manufacturer || '',
      categoryId: prod.category?.id || '',
      price: String(prod.price ?? ''),
      stock: prod.stock ?? 0,
      images: imgs,
      description: prod.description || '',
      active: Boolean(prod.active),
      specs: prod.specs?.length ? prod.specs.map((s) => ({ ...s })) : [{ label: '', value: '' }],
      compatibilidades: (prod.compatibilidades || []).map((c) => ({
        modeloId: c.modeloId,
        montadora: c.montadora,
        modelo: c.modelo,
        anoInicio: c.anoInicio,
        anoFim: c.anoFim,
      })),
    })
    if (montadoras.length > 0) {
      setSelMontadoraId(String(montadoras[0].id))
      setSelModeloId(montadoras[0].modelos?.[0]?.id ? String(montadoras[0].modelos[0].id) : '')
    }
    setModalOpen(true)
  }

  // ---- Fotos ----
  const handleFilesSelected = async (fileList) => {
    if (!fileList || fileList.length === 0) return
    setUploading(true)
    try {
      const res = await adminUpload('/api/admin/uploads/produtos', fileList)
      const uploadedUrls = res?.urls || (res?.url ? [res.url] : [])
      if (uploadedUrls.length > 0) {
        setForm((prev) => ({
          ...prev,
          images: [...prev.images, ...uploadedUrls.filter((u) => !prev.images.includes(u))],
        }))
        toast.success(
          uploadedUrls.length === 1
            ? 'Foto enviada com sucesso!'
            : `${uploadedUrls.length} fotos enviadas com sucesso!`
        )
      }
    } catch (err) {
      toast.error(err.message || 'Erro ao enviar foto')
    } finally {
      setUploading(false)
      if (fileInputRef.current) fileInputRef.current.value = ''
    }
  }

  const handleAddImageUrl = () => {
    const clean = urlInput.trim()
    if (!clean) return
    if (!/^https?:\/\//i.test(clean)) {
      toast.error('Informe uma URL válida começando com http:// ou https://')
      return
    }
    setForm((prev) => ({
      ...prev,
      images: prev.images.includes(clean) ? prev.images : [...prev.images, clean],
    }))
    setUrlInput('')
    toast.success('Imagem adicionada à galeria!')
  }

  const setCoverImage = (idx) => {
    setForm((prev) => {
      const next = [...prev.images]
      const [chosen] = next.splice(idx, 1)
      next.unshift(chosen)
      return { ...prev, images: next }
    })
    toast.success('Foto principal (capa) atualizada!')
  }

  const removeImage = (idx) => {
    setForm((prev) => ({
      ...prev,
      images: prev.images.filter((_, i) => i !== idx),
    }))
  }

  // ---- Especificações ----
  const handleSpecChange = (idx, field, val) => {
    setForm((prev) => ({
      ...prev,
      specs: prev.specs.map((s, i) => (i === idx ? { ...s, [field]: val } : s)),
    }))
  }

  const addSpecRow = (presetLabel = '') => {
    setForm((prev) => {
      // Se existir uma linha vazia, preenche ela com o preset
      if (presetLabel) {
        const emptyIdx = prev.specs.findIndex((s) => !s.label.trim() && !s.value.trim())
        if (emptyIdx !== -1) {
          const next = [...prev.specs]
          next[emptyIdx] = { label: presetLabel, value: '' }
          return { ...prev, specs: next }
        }
      }
      return { ...prev, specs: [...prev.specs, { label: presetLabel, value: '' }] }
    })
  }

  const removeSpecRow = (idx) => {
    setForm((prev) => {
      const next = prev.specs.filter((_, i) => i !== idx)
      return { ...prev, specs: next.length ? next : [{ label: '', value: '' }] }
    })
  }

  // ---- Aplicações de Veículos ----
  const currentMontadora = montadoras.find((m) => String(m.id) === String(selMontadoraId))
  const availableModelos = currentMontadora?.modelos || []

  const handleMontadoraChange = (newMontId) => {
    setSelMontadoraId(newMontId)
    const found = montadoras.find((m) => String(m.id) === String(newMontId))
    setSelModeloId(found?.modelos?.[0]?.id ? String(found.modelos[0].id) : '')
  }

  const handleAddApplication = () => {
    if (!selModeloId) {
      toast.error('Selecione o modelo do veículo.')
      return
    }
    const anoIni = Number(selAnoInicio)
    const anoFim = selAnoFim.trim() ? Number(selAnoFim) : null
    if (!anoIni || anoIni < 1950 || anoIni > 2035) {
      toast.error('Informe um ano inicial válido (ex: 2018).')
      return
    }
    if (anoFim !== null && (anoFim < anoIni || anoFim > 2035)) {
      toast.error('Ano final deve ser maior ou igual ao ano inicial.')
      return
    }

    const modeloObj = availableModelos.find((m) => String(m.id) === String(selModeloId))
    if (!modeloObj || !currentMontadora) return

    const exists = form.compatibilidades.some(
      (c) =>
        Number(c.modeloId) === Number(modeloObj.id) &&
        Number(c.anoInicio) === anoIni &&
        (c.anoFim ?? null) === anoFim
    )
    if (exists) {
      toast.error('Esta aplicação já foi adicionada.')
      return
    }

    setForm((prev) => ({
      ...prev,
      compatibilidades: [
        ...prev.compatibilidades,
        {
          modeloId: modeloObj.id,
          montadora: currentMontadora.name,
          modelo: modeloObj.nome,
          anoInicio: anoIni,
          anoFim,
        },
      ],
    }))
    toast.success(`Aplicação ${currentMontadora.name} ${modeloObj.nome} adicionada!`)
  }

  const removeApplication = (idx) => {
    setForm((prev) => ({
      ...prev,
      compatibilidades: prev.compatibilidades.filter((_, i) => i !== idx),
    }))
  }

  const handleCreateVehicleModel = async () => {
    if (!selMontadoraId || newModelName.trim().length < 2) {
      toast.error('Informe o nome do novo modelo.')
      return
    }
    try {
      const created = await adminFetch(`/api/admin/montadoras/${selMontadoraId}/modelos`, {
        method: 'POST',
        body: { nome: newModelName.trim() },
      })
      toast.success(`Modelo "${created.nome}" cadastrado!`)
      setNewModelName('')
      setAddingModel(false)
      await loadAuxData()
      setSelModeloId(String(created.id))
    } catch (err) {
      toast.error(err.message || 'Não foi possível cadastrar o modelo')
    }
  }

  // ---- Salvar Produto ----
  const handleSubmit = async (e) => {
    e.preventDefault()
    if (!form.name.trim() || !form.manufacturer.trim() || !form.categoryId || !form.price) {
      setActiveTab('GERAL')
      toast.error('Preencha nome, fabricante, categoria e preço na aba Dados Gerais.')
      return
    }
    setSaving(true)
    try {
      const payload = {
        name: form.name.trim(),
        slug: form.slug.trim(),
        manufacturer: form.manufacturer.trim(),
        categoryId: Number(form.categoryId),
        price: Number(form.price),
        stock: Number(form.stock),
        image: form.images[0] || null,
        images: form.images,
        description: form.description.trim() || null,
        active: Boolean(form.active),
        specs: form.specs.filter((s) => s.label.trim() && s.value.trim()),
        compatibilidades: form.compatibilidades.map((c) => ({
          modeloId: Number(c.modeloId),
          anoInicio: Number(c.anoInicio),
          anoFim: c.anoFim ? Number(c.anoFim) : null,
        })),
      }

      if (editingId) {
        await adminFetch(`/api/admin/produtos/${editingId}`, { method: 'PUT', body: payload })
        toast.success('Produto atualizado com sucesso!')
      } else {
        await adminFetch('/api/admin/produtos', { method: 'POST', body: payload })
        toast.success('Produto cadastrado com sucesso!')
      }
      setModalOpen(false)
      loadProducts()
    } catch (err) {
      toast.error(err.message || 'Não foi possível salvar o produto')
    } finally {
      setSaving(false)
    }
  }

  const handleToggleActive = async (prod) => {
    try {
      await adminFetch(`/api/admin/produtos/${prod.id}/status`, {
        method: 'PATCH',
        body: { ativo: !prod.active },
      })
      toast.success(prod.active ? 'Produto desativado.' : 'Produto ativado.')
      loadProducts()
    } catch (err) {
      toast.error(err.message || 'Erro ao alterar status')
    }
  }

  const handleDelete = async (prod) => {
    if (!window.confirm(`Tem certeza que deseja excluir "${prod.name}"?`)) return
    try {
      await adminFetch(`/api/admin/produtos/${prod.id}`, { method: 'DELETE' })
      toast.success('Produto excluído.')
      loadProducts()
    } catch (err) {
      toast.error(err.message || 'Não foi possível excluir o produto')
    }
  }

  const validSpecsCount = form.specs.filter((s) => s.label.trim() && s.value.trim()).length

  return (
    <AdminLayout
      eyebrow="Catálogo & Estoque"
      title="Gestão de Produtos"
      subtitle="Cadastre peças com galeria de fotos, especificações técnicas e ficha de aplicações de veículos."
      actions={
        <button type="button" className="btn btn-primary" onClick={openCreateModal}>
          <FaPlus /> Novo Produto
        </button>
      }
    >
      <div className="admin-toolbar panel">
        <input
          className="admin-search-input"
          placeholder="Buscar por nome, fabricante ou descrição..."
          value={busca}
          onChange={(e) => {
            setBusca(e.target.value)
            setPage(0)
          }}
        />
        <select
          className="admin-select"
          value={categoriaId}
          onChange={(e) => {
            setCategoriaId(e.target.value)
            setPage(0)
          }}
        >
          <option value="">Todas categorias</option>
          {categories.map((c) => (
            <option key={c.id} value={c.id}>
              {c.name}
            </option>
          ))}
        </select>
        <select
          className="admin-select"
          value={ativoFilter}
          onChange={(e) => {
            setAtivoFilter(e.target.value)
            setPage(0)
          }}
        >
          <option value="">Todos status</option>
          <option value="true">Ativos</option>
          <option value="false">Inativos</option>
        </select>
        <label
          style={{
            display: 'flex',
            alignItems: 'center',
            gap: 6,
            fontSize: '0.82rem',
            color: 'var(--gray)',
            cursor: 'pointer',
          }}
        >
          <input
            type="checkbox"
            checked={estoqueBaixo}
            onChange={(e) => {
              setEstoqueBaixo(e.target.checked)
              setPage(0)
            }}
            style={{ accentColor: 'var(--red)' }}
          />
          Estoque baixo (≤ 5)
        </label>
      </div>

      <div className="admin-card panel">
        {loading ? (
          <div className="skeleton" style={{ height: 260 }} />
        ) : pageData.content.length === 0 ? (
          <p className="admin-subtext">Nenhum produto encontrado.</p>
        ) : (
          <>
            <div className="admin-table-wrap">
              <table className="admin-table">
                <thead>
                  <tr>
                    <th>Produto</th>
                    <th>Categoria</th>
                    <th>Ficha</th>
                    <th>Preço</th>
                    <th>Estoque</th>
                    <th>Status</th>
                    <th>Ações</th>
                  </tr>
                </thead>
                <tbody>
                  {pageData.content.map((prod) => (
                    <tr key={prod.id}>
                      <td>
                        <div className="admin-prod-cell">
                          {prod.image && (
                            <img src={prod.image} alt={prod.name} className="admin-prod-thumb" />
                          )}
                          <div>
                            <strong>{prod.name}</strong>
                            <span className="admin-subtext mono">
                              {prod.manufacturer} · {prod.slug}
                            </span>
                          </div>
                        </div>
                      </td>
                      <td>{prod.category?.name || '—'}</td>
                      <td>
                        <span className="admin-subtext mono">
                          {prod.specs?.length || 0} specs · {prod.compatibilidades?.length || 0}{' '}
                          veículos
                        </span>
                      </td>
                      <td className="mono">{formatCurrency(Number(prod.price))}</td>
                      <td>
                        <span
                          className={`admin-badge ${prod.stock <= 5 ? 'admin-badge-amber' : 'admin-badge-gray'}`}
                        >
                          {prod.stock <= 5 && <FaExclamationTriangle />} {prod.stock} un.
                        </span>
                      </td>
                      <td>
                        <span
                          className={`admin-badge ${prod.active ? 'admin-badge-green' : 'admin-badge-red'}`}
                        >
                          {prod.active ? 'Ativo' : 'Inativo'}
                        </span>
                      </td>
                      <td>
                        <div className="admin-row-actions">
                          <button
                            type="button"
                            className="admin-icon-btn"
                            onClick={() => openEditModal(prod)}
                            title="Editar produto"
                          >
                            <FaEdit /> Editar
                          </button>
                          <button
                            type="button"
                            className="admin-icon-btn"
                            onClick={() => handleToggleActive(prod)}
                            title={prod.active ? 'Desativar' : 'Ativar'}
                          >
                            {prod.active ? <FaToggleOn /> : <FaToggleOff />}
                          </button>
                          {isAdmin && (
                            <button
                              type="button"
                              className="admin-icon-btn"
                              onClick={() => handleDelete(prod)}
                              title="Excluir produto"
                            >
                              <FaTrash />
                            </button>
                          )}
                        </div>
                      </td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>

            <div className="admin-pagination">
              <span className="mono">
                Total: {pageData.totalElements} produto(s) · Página {page + 1} de{' '}
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

      {/* Modal Criar / Editar Produto com 4 Abas */}
      {modalOpen && (
        <div className="admin-modal-backdrop" onClick={() => setModalOpen(false)}>
          <div className="admin-modal admin-modal-lg panel" onClick={(e) => e.stopPropagation()}>
            <div className="admin-modal-head">
              <h2>{editingId ? 'Editar Produto' : 'Cadastrar Novo Produto'}</h2>
              <button
                type="button"
                className="admin-modal-close"
                onClick={() => setModalOpen(false)}
              >
                <FaTimes />
              </button>
            </div>

            {/* Navegação de Abas */}
            <div className="product-modal-tabs" role="tablist">
              <button
                type="button"
                role="tab"
                className={`product-modal-tab ${activeTab === 'GERAL' ? 'is-active' : ''}`}
                onClick={() => setActiveTab('GERAL')}
              >
                <FaBoxOpen /> Dados Gerais
              </button>

              <button
                type="button"
                role="tab"
                className={`product-modal-tab ${activeTab === 'FOTOS' ? 'is-active' : ''}`}
                onClick={() => setActiveTab('FOTOS')}
              >
                <FaImages /> Fotos
                <span className="product-tab-count mono">{form.images.length}</span>
              </button>

              <button
                type="button"
                role="tab"
                className={`product-modal-tab ${activeTab === 'SPECS' ? 'is-active' : ''}`}
                onClick={() => setActiveTab('SPECS')}
              >
                <FaClipboardList /> Especificações
                <span className="product-tab-count mono">{validSpecsCount}</span>
              </button>

              <button
                type="button"
                role="tab"
                className={`product-modal-tab ${activeTab === 'APLICACOES' ? 'is-active' : ''}`}
                onClick={() => setActiveTab('APLICACOES')}
              >
                <FaCar /> Aplicações
                <span className="product-tab-count mono">{form.compatibilidades.length}</span>
              </button>
            </div>

            <form onSubmit={handleSubmit}>
              {/* ABA 1: DADOS GERAIS */}
              {activeTab === 'GERAL' && (
                <div className="admin-form-grid">
                  <div className="form-field admin-form-full">
                    <label htmlFor="p-name">Nome da Peça *</label>
                    <input
                      id="p-name"
                      value={form.name}
                      onChange={(e) => setForm((p) => ({ ...p, name: e.target.value }))}
                      placeholder="Ex: Pastilha de Freio Cerâmica Bosch"
                      required
                    />
                  </div>

                  <div className="form-field">
                    <label htmlFor="p-manufacturer">Fabricante *</label>
                    <input
                      id="p-manufacturer"
                      value={form.manufacturer}
                      onChange={(e) => setForm((p) => ({ ...p, manufacturer: e.target.value }))}
                      placeholder="Ex: Bosch, Cofap, Moura"
                      required
                    />
                  </div>

                  <div className="form-field">
                    <label htmlFor="p-category">Categoria *</label>
                    <select
                      id="p-category"
                      value={form.categoryId}
                      onChange={(e) => setForm((p) => ({ ...p, categoryId: e.target.value }))}
                      required
                    >
                      <option value="">Selecione...</option>
                      {categories.map((c) => (
                        <option key={c.id} value={c.id}>
                          {c.name}
                        </option>
                      ))}
                    </select>
                  </div>

                  <div className="form-field">
                    <label htmlFor="p-price">Preço (R$) *</label>
                    <input
                      id="p-price"
                      type="number"
                      step="0.01"
                      min="0.01"
                      className="mono"
                      value={form.price}
                      onChange={(e) => setForm((p) => ({ ...p, price: e.target.value }))}
                      placeholder="189.90"
                      required
                    />
                  </div>

                  <div className="form-field">
                    <label htmlFor="p-stock">Estoque *</label>
                    <input
                      id="p-stock"
                      type="number"
                      min="0"
                      className="mono"
                      value={form.stock}
                      onChange={(e) => setForm((p) => ({ ...p, stock: e.target.value }))}
                      required
                    />
                  </div>

                  <div className="form-field admin-form-full">
                    <label htmlFor="p-slug">Slug / Código URL (opcional — gerado do nome)</label>
                    <input
                      id="p-slug"
                      className="mono"
                      value={form.slug}
                      onChange={(e) => setForm((p) => ({ ...p, slug: e.target.value }))}
                      placeholder="pastilha-freio-bosch"
                    />
                  </div>

                  <div className="form-field admin-form-full">
                    <label htmlFor="p-desc">Descrição Comercial</label>
                    <textarea
                      id="p-desc"
                      value={form.description}
                      onChange={(e) => setForm((p) => ({ ...p, description: e.target.value }))}
                      placeholder="Detalhes da peça, benefícios, recomendações de instalação e garantia..."
                    />
                  </div>

                  <div className="form-field admin-form-full">
                    <label
                      style={{
                        display: 'flex',
                        flexDirection: 'row',
                        alignItems: 'center',
                        gap: 8,
                        cursor: 'pointer',
                        color: 'var(--white)',
                        textTransform: 'none',
                      }}
                    >
                      <input
                        type="checkbox"
                        checked={form.active}
                        onChange={(e) => setForm((p) => ({ ...p, active: e.target.checked }))}
                        style={{ accentColor: 'var(--red)', width: 16, height: 16 }}
                      />
                      Produto ativo e visível no catálogo
                    </label>
                  </div>
                </div>
              )}

              {/* ABA 2: FOTOS DO PRODUTO */}
              {activeTab === 'FOTOS' && (
                <div className="product-tab-section">
                  <div
                    className={`upload-dropzone ${dragOver ? 'is-dragover' : ''}`}
                    onClick={() => fileInputRef.current?.click()}
                    onDragOver={(e) => {
                      e.preventDefault()
                      setDragOver(true)
                    }}
                    onDragLeave={() => setDragOver(false)}
                    onDrop={(e) => {
                      e.preventDefault()
                      setDragOver(false)
                      handleFilesSelected(e.dataTransfer.files)
                    }}
                  >
                    <input
                      ref={fileInputRef}
                      type="file"
                      accept="image/jpeg,image/png,image/webp,image/gif"
                      multiple
                      hidden
                      onChange={(e) => handleFilesSelected(e.target.files)}
                    />
                    <FaUpload className="upload-dropzone-icon" />
                    <strong>
                      {uploading
                        ? 'Enviando imagens...'
                        : 'Arraste fotos aqui ou clique para selecionar do computador'}
                    </strong>
                    <span>Formatos aceitos: JPG, PNG, WEBP ou GIF (até 10 MB por foto)</span>
                  </div>

                  <div className="upload-url-row">
                    <input
                      className="admin-search-input"
                      placeholder="Ou cole a URL de uma imagem externa (https://...)"
                      value={urlInput}
                      onChange={(e) => setUrlInput(e.target.value)}
                    />
                    <button type="button" className="btn btn-outline" onClick={handleAddImageUrl}>
                      <FaLink /> Adicionar URL
                    </button>
                  </div>

                  {form.images.length === 0 ? (
                    <p className="admin-subtext">
                      Nenhuma foto adicionada ainda. A primeira foto será usada como capa do anúncio.
                    </p>
                  ) : (
                    <div className="upload-gallery">
                      {form.images.map((url, idx) => (
                        <div key={url + idx} className={`upload-thumb-card ${idx === 0 ? 'is-cover' : ''}`}>
                          <img src={url} alt={`Foto ${idx + 1}`} />
                          {idx === 0 && <span className="upload-cover-badge mono">Capa</span>}
                          <div className="upload-thumb-actions">
                            {idx !== 0 && (
                              <button
                                type="button"
                                className="admin-icon-btn"
                                onClick={() => setCoverImage(idx)}
                                title="Definir como capa"
                              >
                                <FaStar /> Capa
                              </button>
                            )}
                            <button
                              type="button"
                              className="admin-icon-btn"
                              onClick={() => removeImage(idx)}
                              title="Remover foto"
                            >
                              <FaTrash />
                            </button>
                          </div>
                        </div>
                      ))}
                    </div>
                  )}
                </div>
              )}

              {/* ABA 3: ESPECIFICAÇÕES TÉCNICAS */}
              {activeTab === 'SPECS' && (
                <div className="product-tab-section">
                  <div className="quick-specs-bar">
                    <span className="mono" style={{ fontSize: '0.72rem', color: 'var(--gray)' }}>
                      ATALHOS RÁPIDOS:
                    </span>
                    <div className="quick-specs-chips">
                      {QUICK_SPECS.map((label) => (
                        <button
                          key={label}
                          type="button"
                          className="quick-spec-chip"
                          onClick={() => addSpecRow(label)}
                        >
                          + {label}
                        </button>
                      ))}
                    </div>
                  </div>

                  <div>
                    {form.specs.map((spec, idx) => (
                      <div key={idx} className="admin-specs-row">
                        <input
                          className="admin-search-input"
                          placeholder="Atributo (ex: Posição, Código OEM)"
                          value={spec.label}
                          onChange={(e) => handleSpecChange(idx, 'label', e.target.value)}
                        />
                        <input
                          className="admin-search-input"
                          placeholder="Valor (ex: Dianteira, 0986BB0456)"
                          value={spec.value}
                          onChange={(e) => handleSpecChange(idx, 'value', e.target.value)}
                        />
                        <button
                          type="button"
                          className="admin-icon-btn"
                          onClick={() => removeSpecRow(idx)}
                          title="Remover linha"
                        >
                          <FaTimes />
                        </button>
                      </div>
                    ))}
                  </div>

                  <button
                    type="button"
                    className="admin-icon-btn"
                    style={{ alignSelf: 'flex-start' }}
                    onClick={() => addSpecRow('')}
                  >
                    <FaPlus /> Nova especificação
                  </button>
                </div>
              )}

              {/* ABA 4: APLICAÇÕES DE VEÍCULOS */}
              {activeTab === 'APLICACOES' && (
                <div className="product-tab-section">
                  <div className="application-builder">
                    <div className="admin-form-grid">
                      <div className="form-field">
                        <label htmlFor="app-montadora">Montadora</label>
                        <select
                          id="app-montadora"
                          value={selMontadoraId}
                          onChange={(e) => handleMontadoraChange(e.target.value)}
                        >
                          <option value="">Selecione a montadora...</option>
                          {montadoras.map((m) => (
                            <option key={m.id} value={m.id}>
                              {m.name}
                            </option>
                          ))}
                        </select>
                      </div>

                      <div className="form-field">
                        <label htmlFor="app-modelo">
                          Modelo do Veículo{' '}
                          <button
                            type="button"
                            className="inline-link-btn"
                            onClick={() => setAddingModel((v) => !v)}
                          >
                            {addingModel ? 'Cancelar' : '+ Novo modelo'}
                          </button>
                        </label>
                        {addingModel ? (
                          <div style={{ display: 'flex', gap: 6 }}>
                            <input
                              value={newModelName}
                              onChange={(e) => setNewModelName(e.target.value)}
                              placeholder="Ex: Tracker, T-Cross..."
                            />
                            <button
                              type="button"
                              className="admin-icon-btn is-primary"
                              onClick={handleCreateVehicleModel}
                            >
                              Salvar
                            </button>
                          </div>
                        ) : (
                          <select
                            id="app-modelo"
                            value={selModeloId}
                            onChange={(e) => setSelModeloId(e.target.value)}
                          >
                            <option value="">Selecione o modelo...</option>
                            {availableModelos.map((mod) => (
                              <option key={mod.id} value={mod.id}>
                                {mod.nome}
                              </option>
                            ))}
                          </select>
                        )}
                      </div>

                      <div className="form-field">
                        <label htmlFor="app-ano-ini">Ano Inicial *</label>
                        <input
                          id="app-ano-ini"
                          type="number"
                          min="1950"
                          max="2035"
                          className="mono"
                          value={selAnoInicio}
                          onChange={(e) => setSelAnoInicio(e.target.value)}
                          placeholder="2019"
                        />
                      </div>

                      <div className="form-field">
                        <label htmlFor="app-ano-fim">Ano Final (vazio = Atual)</label>
                        <input
                          id="app-ano-fim"
                          type="number"
                          min="1950"
                          max="2035"
                          className="mono"
                          value={selAnoFim}
                          onChange={(e) => setSelAnoFim(e.target.value)}
                          placeholder="Ex: 2024 ou deixe vazio"
                        />
                      </div>
                    </div>

                    <button
                      type="button"
                      className="btn btn-outline"
                      style={{ marginTop: 12 }}
                      onClick={handleAddApplication}
                    >
                      <FaPlus /> Adicionar Aplicação
                    </button>
                  </div>

                  {form.compatibilidades.length === 0 ? (
                    <p className="admin-subtext">
                      Nenhuma aplicação de veículo vinculada ainda. Adicione acima os carros
                      compatíveis com esta peça.
                    </p>
                  ) : (
                    <div className="admin-table-wrap">
                      <table className="admin-table">
                        <thead>
                          <tr>
                            <th>Montadora</th>
                            <th>Modelo</th>
                            <th>Anos Compatíveis</th>
                            <th></th>
                          </tr>
                        </thead>
                        <tbody>
                          {form.compatibilidades.map((c, idx) => (
                            <tr key={`${c.modeloId}-${c.anoInicio}-${idx}`}>
                              <td>
                                <strong>{c.montadora}</strong>
                              </td>
                              <td>{c.modelo}</td>
                              <td className="mono">
                                {c.anoInicio} — {c.anoFim ? c.anoFim : 'Atual'}
                              </td>
                              <td style={{ textAlign: 'right' }}>
                                <button
                                  type="button"
                                  className="admin-icon-btn"
                                  onClick={() => removeApplication(idx)}
                                  title="Remover aplicação"
                                >
                                  <FaTrash />
                                </button>
                              </td>
                            </tr>
                          ))}
                        </tbody>
                      </table>
                    </div>
                  )}
                </div>
              )}

              <div className="admin-modal-footer">
                <button
                  type="button"
                  className="btn btn-outline"
                  onClick={() => setModalOpen(false)}
                >
                  Cancelar
                </button>
                <button type="submit" className="btn btn-primary" disabled={saving || uploading}>
                  {saving ? 'Salvando...' : editingId ? 'Salvar Alterações' : 'Cadastrar Produto'}
                </button>
              </div>
            </form>
          </div>
        </div>
      )}
    </AdminLayout>
  )
}
