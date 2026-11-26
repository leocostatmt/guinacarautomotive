import { useState, useEffect, useCallback } from 'react'
import toast from 'react-hot-toast'
import { FaPlus, FaEdit, FaTimes, FaToggleOn, FaToggleOff, FaTrash, FaExclamationTriangle } from 'react-icons/fa'
import AdminLayout from '../../components/AdminLayout'
import { useAuth } from '../../context/AuthContext'
import { adminFetch } from '../../services/adminApi'

function formatCpf(cpf = '') {
  const d = cpf.replace(/\D/g, '')
  if (d.length !== 11) return cpf
  return d.replace(/(\d{3})(\d{3})(\d{3})(\d{2})/, '$1.$2.$3-$4')
}

function formatPhone(phone = '') {
  const d = phone.replace(/\D/g, '')
  if (d.length === 11) return d.replace(/(\d{2})(\d{5})(\d{4})/, '($1) $2-$3')
  if (d.length === 10) return d.replace(/(\d{2})(\d{4})(\d{4})/, '($1) $2-$3')
  return phone
}

const ROLE_META = {
  ADMIN: { label: 'ADMIN · Dono', cls: 'admin-badge-red' },
  FUNCIONARIO: { label: 'Funcionário', cls: 'admin-badge-blue' },
  USER: { label: 'Cliente', cls: 'admin-badge-gray' },
}

export default function AdminUsers({ mode = 'CLIENTES' }) {
  const { user: currentUser } = useAuth()
  const isCurrentAdmin = currentUser?.role === 'ADMIN'
  const isStaff = mode === 'FUNCIONARIOS'

  const [busca, setBusca] = useState('')
  const [ativoFilter, setAtivoFilter] = useState('')
  const [page, setPage] = useState(0)
  const [pageData, setPageData] = useState({ content: [], totalElements: 0, totalPages: 0 })
  const [loading, setLoading] = useState(true)

  const [modalOpen, setModalOpen] = useState(false)
  const [editingUser, setEditingUser] = useState(null)
  const [saving, setSaving] = useState(false)
  const [deletingUser, setDeletingUser] = useState(null)
  const [deleting, setDeleting] = useState(false)

  const [form, setForm] = useState({
    nome: '',
    email: '',
    cpf: '',
    telefone: '',
    senha: '',
    role: isStaff ? 'FUNCIONARIO' : 'USER',
    cargo: '',
    departamento: '',
    ativo: true,
  })

  const loadUsers = useCallback(async () => {
    setLoading(true)
    try {
      const res = await adminFetch('/api/admin/usuarios', {
        params: {
          tipo: mode,
          busca,
          ativo: ativoFilter,
          page,
          size: 15,
        },
      })
      setPageData(res || { content: [], totalElements: 0, totalPages: 0 })
    } catch (err) {
      toast.error(err.message || 'Erro ao carregar usuários')
    } finally {
      setLoading(false)
    }
  }, [mode, busca, ativoFilter, page])

  useEffect(() => {
    setPage(0)
  }, [mode])

  useEffect(() => {
    const t = setTimeout(loadUsers, 220)
    return () => clearTimeout(t)
  }, [loadUsers])

  const openCreateModal = () => {
    setEditingUser(null)
    setForm({
      nome: '',
      email: '',
      cpf: '',
      telefone: '',
      senha: '',
      role: isStaff ? 'FUNCIONARIO' : 'USER',
      cargo: isStaff ? 'Vendedor' : '',
      departamento: isStaff ? 'Vendas' : '',
      ativo: true,
    })
    setModalOpen(true)
  }

  const openEditModal = (u) => {
    setEditingUser(u)
    setForm({
      nome: u.nome || '',
      email: u.email || '',
      cpf: formatCpf(u.cpf || ''),
      telefone: formatPhone(u.telefone || ''),
      senha: '',
      role: u.role || 'USER',
      cargo: u.cargo || '',
      departamento: u.departamento || '',
      ativo: Boolean(u.ativo),
    })
    setModalOpen(true)
  }

  const handleSubmit = async (e) => {
    e.preventDefault()
    setSaving(true)
    try {
      if (editingUser) {
        await adminFetch(`/api/admin/usuarios/${editingUser.id}`, {
          method: 'PUT',
          body: {
            nome: form.nome,
            email: form.email,
            telefone: form.telefone,
            role: form.role,
            cargo: form.cargo,
            departamento: form.departamento,
            ativo: form.ativo,
            novaSenha: form.senha.trim() || null,
          },
        })
        toast.success(`${isStaff ? 'Funcionário' : 'Cliente'} atualizado com sucesso!`)
      } else {
        await adminFetch('/api/admin/usuarios', {
          method: 'POST',
          body: {
            nome: form.nome,
            email: form.email,
            cpf: form.cpf,
            telefone: form.telefone,
            senha: form.senha,
            role: form.role,
            cargo: form.cargo,
            departamento: form.departamento,
            ativo: form.ativo,
          },
        })
        toast.success(`${isStaff ? 'Funcionário' : 'Cliente'} cadastrado com sucesso!`)
      }
      setModalOpen(false)
      loadUsers()
    } catch (err) {
      toast.error(err.message || 'Erro ao salvar cadastro')
    } finally {
      setSaving(false)
    }
  }

  const handleToggleStatus = async (u) => {
    try {
      await adminFetch(`/api/admin/usuarios/${u.id}/status`, {
        method: 'PATCH',
        body: { ativo: !u.ativo },
      })
      toast.success(u.ativo ? 'Acesso bloqueado.' : 'Acesso reativado.')
      loadUsers()
    } catch (err) {
      toast.error(err.message || 'Não foi possível alterar o status')
    }
  }

  const handleConfirmDelete = async () => {
    if (!deletingUser) return
    setDeleting(true)
    try {
      await adminFetch(`/api/admin/usuarios/${deletingUser.id}`, {
        method: 'DELETE',
      })
      toast.success(`Usuário "${deletingUser.nome}" excluído com sucesso.`)
      setDeletingUser(null)
      loadUsers()
    } catch (err) {
      toast.error(err.message || 'Não foi possível excluir o usuário')
    } finally {
      setDeleting(false)
    }
  }

  return (
    <AdminLayout
      eyebrow={isStaff ? 'Equipe & Permissões' : 'Base de Compradores'}
      title={isStaff ? 'Gestão de Funcionários' : 'Gestão de Clientes'}
      subtitle={
        isStaff
          ? 'Cadastre colaboradores, defina cargos, departamentos e controle níveis de acesso (Funcionário / Admin).'
          : 'Consulte, cadastre, edite dados e gerencie o status dos clientes da GuinaCar.'
      }
      actions={
        <button type="button" className="btn btn-primary" onClick={openCreateModal}>
          <FaPlus /> {isStaff ? 'Novo Funcionário' : 'Novo Cliente'}
        </button>
      }
    >
      <div className="admin-toolbar panel">
        <input
          className="admin-search-input"
          placeholder={
            isStaff
              ? 'Buscar por nome, e-mail, CPF ou cargo...'
              : 'Buscar cliente por nome, e-mail ou CPF...'
          }
          value={busca}
          onChange={(e) => {
            setBusca(e.target.value)
            setPage(0)
          }}
        />
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
          <option value="false">Inativos / Bloqueados</option>
        </select>
      </div>

      <div className="admin-card panel">
        {loading ? (
          <div className="skeleton" style={{ height: 240 }} />
        ) : pageData.content.length === 0 ? (
          <p className="admin-subtext">
            Nenhum {isStaff ? 'funcionário' : 'cliente'} encontrado.
          </p>
        ) : (
          <>
            <div className="admin-table-wrap">
              <table className="admin-table">
                <thead>
                  <tr>
                    <th>Nome / E-mail</th>
                    <th>CPF / Telefone</th>
                    {isStaff && <th>Cargo / Depto</th>}
                    <th>Perfil</th>
                    <th>Status</th>
                    <th>Ações</th>
                  </tr>
                </thead>
                <tbody>
                  {pageData.content.map((u) => {
                    const roleMeta = ROLE_META[u.role] || ROLE_META.USER
                    return (
                      <tr key={u.id}>
                        <td>
                          <strong>{u.nome}</strong>
                          <span className="admin-subtext">{u.email}</span>
                        </td>
                        <td>
                          <span className="mono">{formatCpf(u.cpf)}</span>
                          <span className="admin-subtext mono">{formatPhone(u.telefone)}</span>
                        </td>
                        {isStaff && (
                          <td>
                            <strong>{u.cargo || '—'}</strong>
                            <span className="admin-subtext">{u.departamento || '—'}</span>
                          </td>
                        )}
                        <td>
                          <span className={`admin-badge ${roleMeta.cls}`}>{roleMeta.label}</span>
                        </td>
                        <td>
                          <span
                            className={`admin-badge ${u.ativo ? 'admin-badge-green' : 'admin-badge-red'}`}
                          >
                            {u.ativo ? 'Ativo' : 'Bloqueado'}
                          </span>
                        </td>
                        <td>
                          <div className="admin-row-actions">
                            <button
                              type="button"
                              className="admin-icon-btn"
                              onClick={() => openEditModal(u)}
                            >
                              <FaEdit /> Editar
                            </button>
                            {isCurrentAdmin && u.role !== 'ADMIN' && currentUser?.id !== u.id && (
                              <>
                                <button
                                  type="button"
                                  className="admin-icon-btn"
                                  onClick={() => handleToggleStatus(u)}
                                  title={u.ativo ? 'Bloquear acesso' : 'Reativar acesso'}
                                >
                                  {u.ativo ? <FaToggleOn /> : <FaToggleOff />}
                                </button>
                                <button
                                  type="button"
                                  className="admin-icon-btn"
                                  onClick={() => setDeletingUser(u)}
                                  title="Excluir usuário"
                                >
                                  <FaTrash />
                                </button>
                              </>
                            )}
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
                Total: {pageData.totalElements} registro(s) · Página {page + 1} de{' '}
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

      {/* Modal Criar / Editar Usuário */}
      {modalOpen && (
        <div className="admin-modal-backdrop" onClick={() => setModalOpen(false)}>
          <div className="admin-modal panel" onClick={(e) => e.stopPropagation()}>
            <div className="admin-modal-head">
              <h2>
                {editingUser
                  ? `Editar ${isStaff ? 'Funcionário' : 'Cliente'}`
                  : `Cadastrar ${isStaff ? 'Funcionário' : 'Cliente'}`}
              </h2>
              <button type="button" className="admin-modal-close" onClick={() => setModalOpen(false)}>
                <FaTimes />
              </button>
            </div>
            <form onSubmit={handleSubmit}>
              <div className="admin-form-grid">
                <div className="form-field admin-form-full">
                  <label htmlFor="u-nome">Nome Completo *</label>
                  <input
                    id="u-nome"
                    value={form.nome}
                    onChange={(e) => setForm((p) => ({ ...p, nome: e.target.value }))}
                    required
                  />
                </div>

                <div className="form-field">
                  <label htmlFor="u-email">E-mail *</label>
                  <input
                    id="u-email"
                    type="email"
                    value={form.email}
                    onChange={(e) => setForm((p) => ({ ...p, email: e.target.value }))}
                    required
                  />
                </div>

                <div className="form-field">
                  <label htmlFor="u-telefone">Telefone *</label>
                  <input
                    id="u-telefone"
                    value={form.telefone}
                    onChange={(e) => setForm((p) => ({ ...p, telefone: e.target.value }))}
                    placeholder="(11) 90000-0000"
                    required
                  />
                </div>

                <div className="form-field">
                  <label htmlFor="u-cpf">CPF *</label>
                  <input
                    id="u-cpf"
                    className="mono"
                    value={form.cpf}
                    disabled={Boolean(editingUser)}
                    onChange={(e) => setForm((p) => ({ ...p, cpf: e.target.value }))}
                    placeholder="000.000.000-00"
                    required={!editingUser}
                  />
                </div>

                <div className="form-field">
                  <label htmlFor="u-role">Nível de Acesso *</label>
                  <select
                    id="u-role"
                    value={form.role}
                    onChange={(e) => setForm((p) => ({ ...p, role: e.target.value }))}
                  >
                    <option value="USER">Cliente (USER)</option>
                    <option value="FUNCIONARIO">Funcionário (Pedidos e Produtos)</option>
                    <option value="ADMIN">Administrador / Dono (Acesso Total)</option>
                  </select>
                </div>

                {(isStaff || form.role !== 'USER') && (
                  <>
                    <div className="form-field">
                      <label htmlFor="u-cargo">Cargo</label>
                      <input
                        id="u-cargo"
                        value={form.cargo}
                        onChange={(e) => setForm((p) => ({ ...p, cargo: e.target.value }))}
                        placeholder="Ex: Vendedor, Logística, Gerente"
                      />
                    </div>
                    <div className="form-field">
                      <label htmlFor="u-depto">Departamento</label>
                      <input
                        id="u-depto"
                        value={form.departamento}
                        onChange={(e) => setForm((p) => ({ ...p, departamento: e.target.value }))}
                        placeholder="Ex: Vendas, Expedição, Estoque"
                      />
                    </div>
                  </>
                )}

                <div className="form-field admin-form-full">
                  <label htmlFor="u-senha">
                    {editingUser ? 'Nova Senha (deixe em branco para manter a atual)' : 'Senha Inicial *'}
                  </label>
                  <input
                    id="u-senha"
                    type="password"
                    value={form.senha}
                    onChange={(e) => setForm((p) => ({ ...p, senha: e.target.value }))}
                    placeholder="Mínimo 8 caracteres, maiúscula, minúscula e número"
                    required={!editingUser}
                  />
                </div>

                {editingUser?.role !== 'ADMIN' && (
                  <div className="form-field admin-form-full">
                    <label style={{ display: 'flex', flexDirection: 'row', alignItems: 'center', gap: 8, cursor: 'pointer', color: 'var(--white)', textTransform: 'none' }}>
                      <input
                        type="checkbox"
                        checked={form.ativo}
                        onChange={(e) => setForm((p) => ({ ...p, ativo: e.target.checked }))}
                        style={{ accentColor: 'var(--red)', width: 16, height: 16 }}
                      />
                      Conta ativa (pode fazer login no sistema)
                    </label>
                  </div>
                )}
              </div>

              <div className="admin-modal-footer">
                <button type="button" className="btn btn-outline" onClick={() => setModalOpen(false)}>
                  Cancelar
                </button>
                <button type="submit" className="btn btn-primary" disabled={saving}>
                  {saving ? 'Salvando...' : editingUser ? 'Salvar Alterações' : 'Cadastrar'}
                </button>
              </div>
            </form>
          </div>
        </div>
      )}

      {/* Modal de Confirmação de Exclusão */}
      {deletingUser && (
        <div className="admin-modal-backdrop" onClick={() => !deleting && setDeletingUser(null)}>
          <div className="admin-modal panel" style={{ maxWidth: 480 }} onClick={(e) => e.stopPropagation()}>
            <div className="admin-modal-head">
              <h2 style={{ display: 'flex', alignItems: 'center', gap: 10 }}>
                <FaExclamationTriangle style={{ color: 'var(--red)' }} /> Excluir Usuário
              </h2>
              <button
                type="button"
                className="admin-modal-close"
                disabled={deleting}
                onClick={() => setDeletingUser(null)}
              >
                <FaTimes />
              </button>
            </div>
            <p style={{ color: 'var(--gray)', margin: '0 0 12px', lineHeight: 1.5 }}>
              Tem certeza que deseja excluir permanentemente o usuário{' '}
              <strong style={{ color: 'var(--white)' }}>{deletingUser.nome}</strong> (
              <span className="mono">{deletingUser.email}</span>)?
            </p>
            <p style={{ color: '#fca5a5', fontSize: '0.82rem', margin: 0, lineHeight: 1.5 }}>
              Esta ação não pode ser desfeita e removerá também endereços, favoritos, carrinho e
              pedidos vinculados a esta conta.
            </p>
            <div className="admin-modal-footer">
              <button
                type="button"
                className="btn btn-outline"
                disabled={deleting}
                onClick={() => setDeletingUser(null)}
              >
                Cancelar
              </button>
              <button
                type="button"
                className="btn btn-primary"
                disabled={deleting}
                onClick={handleConfirmDelete}
              >
                <FaTrash /> {deleting ? 'Excluindo...' : 'Sim, excluir usuário'}
              </button>
            </div>
          </div>
        </div>
      )}
    </AdminLayout>
  )
}
