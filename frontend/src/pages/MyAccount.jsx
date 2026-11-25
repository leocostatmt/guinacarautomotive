import { useState, useEffect, useCallback } from 'react'
import { Link } from 'react-router-dom'
import toast from 'react-hot-toast'
import {
  FaUserEdit,
  FaLock,
  FaEye,
  FaEyeSlash,
  FaHeart,
  FaShoppingCart,
  FaShieldAlt,
  FaMapMarkerAlt,
  FaPlus,
  FaTrash,
  FaEdit,
  FaStar,
  FaSearch,
} from 'react-icons/fa'
import AccountLayout from '../components/AccountLayout'
import { useAuth } from '../context/AuthContext'
import { useFavorites } from '../context/FavoritesContext'
import { useCart } from '../context/CartContext'

function formatCpf(cpf = '') {
  const digits = cpf.replace(/\D/g, '')
  if (digits.length !== 11) return cpf
  return digits.replace(/(\d{3})(\d{3})(\d{3})(\d{2})/, '$1.$2.$3-$4')
}

function formatPhone(phone = '') {
  const digits = phone.replace(/\D/g, '')
  if (digits.length === 11) {
    return digits.replace(/(\d{2})(\d{5})(\d{4})/, '($1) $2-$3')
  }
  if (digits.length === 10) {
    return digits.replace(/(\d{2})(\d{4})(\d{4})/, '($1) $2-$3')
  }
  return phone
}

function formatCep(cep = '') {
  const digits = cep.replace(/\D/g, '').slice(0, 8)
  if (digits.length > 5) return `${digits.slice(0, 5)}-${digits.slice(5)}`
  return digits
}

const emptyAddress = {
  apelido: 'Casa',
  destinatario: '',
  cep: '',
  logradouro: '',
  numero: '',
  complemento: '',
  bairro: '',
  cidade: '',
  estado: '',
  principal: false,
}

export default function MyAccount() {
  const { user, setUser, loadingUser, logout } = useAuth()
  const { favoritesCount } = useFavorites()
  const { itemCount } = useCart()

  const [profileForm, setProfileForm] = useState({ nome: '', telefone: '' })
  const [profileErrors, setProfileErrors] = useState({})
  const [savingProfile, setSavingProfile] = useState(false)

  const [passwordForm, setPasswordForm] = useState({
    senhaAtual: '',
    novaSenha: '',
    confirmarNovaSenha: '',
  })
  const [passwordErrors, setPasswordErrors] = useState({})
  const [savingPassword, setSavingPassword] = useState(false)
  const [showCurrent, setShowCurrent] = useState(false)
  const [showNew, setShowNew] = useState(false)
  const [showConfirm, setShowConfirm] = useState(false)

  // ---- Endereços ----
  const [addresses, setAddresses] = useState([])
  const [loadingAddresses, setLoadingAddresses] = useState(true)
  const [showAddressForm, setShowAddressForm] = useState(false)
  const [editingAddressId, setEditingAddressId] = useState(null)
  const [addressForm, setAddressForm] = useState(emptyAddress)
  const [addressErrors, setAddressErrors] = useState({})
  const [savingAddress, setSavingAddress] = useState(false)
  const [cepLoading, setCepLoading] = useState(false)

  useEffect(() => {
    if (user) {
      setProfileForm({
        nome: user.nome || '',
        telefone: formatPhone(user.telefone || ''),
      })
    }
  }, [user])

  const fetchAddresses = useCallback(async () => {
    setLoadingAddresses(true)
    try {
      const token = localStorage.getItem('token')
      const res = await fetch('http://localhost:8081/api/conta/enderecos', {
        headers: { Authorization: `Bearer ${token}` },
      })
      if (res.ok) {
        const data = await res.json()
        setAddresses(Array.isArray(data) ? data : [])
      }
    } catch (err) {
      console.error('Erro ao buscar endereços:', err)
    } finally {
      setLoadingAddresses(false)
    }
  }, [])

  useEffect(() => {
    fetchAddresses()
  }, [fetchAddresses])

  const lookupCep = async (rawCep) => {
    const digits = rawCep.replace(/\D/g, '')
    if (digits.length !== 8) return
    setCepLoading(true)
    try {
      const res = await fetch(`https://viacep.com.br/ws/${digits}/json/`)
      if (!res.ok) return
      const data = await res.json()
      if (data.erro) {
        toast.error('CEP não encontrado.')
        return
      }
      setAddressForm((prev) => ({
        ...prev,
        logradouro: data.logradouro || prev.logradouro,
        bairro: data.bairro || prev.bairro,
        cidade: data.localidade || prev.cidade,
        estado: data.uf || prev.estado,
      }))
      setAddressErrors((prev) => ({
        ...prev,
        cep: undefined,
        logradouro: undefined,
        bairro: undefined,
        cidade: undefined,
        estado: undefined,
      }))
      toast.success('Endereço encontrado pelo CEP!')
    } catch {
      // preenchimento manual
    } finally {
      setCepLoading(false)
    }
  }

  const openNewAddressForm = () => {
    setEditingAddressId(null)
    setAddressForm({
      ...emptyAddress,
      destinatario: user?.nome || '',
      principal: addresses.length === 0,
    })
    setAddressErrors({})
    setShowAddressForm(true)
  }

  const openEditAddressForm = (addr) => {
    setEditingAddressId(addr.id)
    setAddressForm({
      apelido: addr.apelido || 'Principal',
      destinatario: addr.destinatario || '',
      cep: formatCep(addr.cep || ''),
      logradouro: addr.logradouro || '',
      numero: addr.numero || '',
      complemento: addr.complemento || '',
      bairro: addr.bairro || '',
      cidade: addr.cidade || '',
      estado: addr.estado || '',
      principal: Boolean(addr.principal),
    })
    setAddressErrors({})
    setShowAddressForm(true)
  }

  const handleAddressChange = (e) => {
    const { name, value, type, checked } = e.target
    let nextValue = type === 'checkbox' ? checked : value
    if (name === 'cep') nextValue = formatCep(value)
    if (name === 'estado') nextValue = value.toUpperCase().slice(0, 2)

    setAddressForm((prev) => ({ ...prev, [name]: nextValue }))
    setAddressErrors((prev) => ({ ...prev, [name]: undefined }))

    if (name === 'cep' && String(nextValue).replace(/\D/g, '').length === 8) {
      lookupCep(nextValue)
    }
  }

  const handleAddressSubmit = async (e) => {
    e.preventDefault()
    const next = {}
    if (addressForm.destinatario.trim().length < 3) next.destinatario = 'Informe o destinatário.'
    if (addressForm.cep.replace(/\D/g, '').length !== 8) next.cep = 'CEP deve ter 8 dígitos.'
    if (!addressForm.logradouro.trim()) next.logradouro = 'Informe a rua/avenida.'
    if (!addressForm.numero.trim()) next.numero = 'Informe o número.'
    if (!addressForm.bairro.trim()) next.bairro = 'Informe o bairro.'
    if (!addressForm.cidade.trim()) next.cidade = 'Informe a cidade.'
    if (addressForm.estado.trim().length !== 2) next.estado = 'UF inválida.'
    setAddressErrors(next)
    if (Object.keys(next).length > 0) return

    setSavingAddress(true)
    try {
      const token = localStorage.getItem('token')
      const url = editingAddressId
        ? `http://localhost:8081/api/conta/enderecos/${editingAddressId}`
        : 'http://localhost:8081/api/conta/enderecos'
      const res = await fetch(url, {
        method: editingAddressId ? 'PUT' : 'POST',
        headers: {
          'Content-Type': 'application/json',
          Authorization: `Bearer ${token}`,
        },
        body: JSON.stringify({
          ...addressForm,
          cep: addressForm.cep.replace(/\D/g, ''),
        }),
      })

      if (res.status === 401 || res.status === 403) {
        logout()
        toast.error('Sua sessão expirou. Faça login novamente.')
        return
      }

      if (res.ok) {
        toast.success(
          editingAddressId ? 'Endereço atualizado com sucesso!' : 'Endereço cadastrado com sucesso!'
        )
        setShowAddressForm(false)
        setEditingAddressId(null)
        fetchAddresses()
      } else {
        const errData = await res.json().catch(() => ({}))
        toast.error(errData.message || 'Não foi possível salvar o endereço.')
      }
    } catch {
      toast.error('Erro ao conectar com o servidor.')
    } finally {
      setSavingAddress(false)
    }
  }

  const handleSetPrincipal = async (id) => {
    try {
      const token = localStorage.getItem('token')
      const res = await fetch(`http://localhost:8081/api/conta/enderecos/${id}/principal`, {
        method: 'PATCH',
        headers: { Authorization: `Bearer ${token}` },
      })
      if (res.ok) {
        const updated = await res.json()
        setAddresses(Array.isArray(updated) ? updated : [])
        toast.success('Endereço principal atualizado!')
      }
    } catch {
      toast.error('Erro ao atualizar endereço principal.')
    }
  }

  const handleDeleteAddress = async (id) => {
    try {
      const token = localStorage.getItem('token')
      const res = await fetch(`http://localhost:8081/api/conta/enderecos/${id}`, {
        method: 'DELETE',
        headers: { Authorization: `Bearer ${token}` },
      })
      if (res.ok) {
        toast.success('Endereço removido.')
        fetchAddresses()
      }
    } catch {
      toast.error('Erro ao remover endereço.')
    }
  }

  const handleProfileChange = (e) => {
    setProfileForm((prev) => ({ ...prev, [e.target.name]: e.target.value }))
    setProfileErrors((prev) => ({ ...prev, [e.target.name]: undefined }))
  }

  const handleProfileSubmit = async (e) => {
    e.preventDefault()
    const nextErrors = {}
    if (profileForm.nome.trim().split(/\s+/).filter(Boolean).length < 2) {
      nextErrors.nome = 'Informe seu nome completo.'
    }
    const phoneDigits = profileForm.telefone.replace(/\D/g, '')
    if (phoneDigits.length < 10 || phoneDigits.length > 11) {
      nextErrors.telefone = 'Informe um telefone válido com DDD.'
    }
    setProfileErrors(nextErrors)
    if (Object.keys(nextErrors).length > 0) return

    setSavingProfile(true)
    try {
      const token = localStorage.getItem('token')
      const res = await fetch('http://localhost:8081/api/conta/perfil', {
        method: 'PUT',
        headers: {
          'Content-Type': 'application/json',
          Authorization: `Bearer ${token}`,
        },
        body: JSON.stringify({
          nome: profileForm.nome.trim(),
          telefone: phoneDigits,
        }),
      })

      if (res.status === 401 || res.status === 403) {
        logout()
        toast.error('Sua sessão expirou. Faça login novamente.')
        return
      }

      if (res.ok) {
        const updated = await res.json()
        setUser(updated)
        toast.success('Dados atualizados com sucesso!')
      } else {
        const errData = await res.json().catch(() => ({}))
        toast.error(errData.message || 'Não foi possível atualizar seus dados.')
      }
    } catch (err) {
      console.error(err)
      toast.error('Erro ao conectar com o servidor.')
    } finally {
      setSavingProfile(false)
    }
  }

  const handlePasswordChange = (e) => {
    setPasswordForm((prev) => ({ ...prev, [e.target.name]: e.target.value }))
    setPasswordErrors((prev) => ({ ...prev, [e.target.name]: undefined }))
  }

  const handlePasswordSubmit = async (e) => {
    e.preventDefault()
    const nextErrors = {}
    if (!passwordForm.senhaAtual) {
      nextErrors.senhaAtual = 'Informe sua senha atual.'
    }
    if (passwordForm.novaSenha.length < 8) {
      nextErrors.novaSenha = 'A nova senha deve ter no mínimo 8 caracteres.'
    } else if (
      !/[A-Z]/.test(passwordForm.novaSenha) ||
      !/[a-z]/.test(passwordForm.novaSenha) ||
      !/\d/.test(passwordForm.novaSenha)
    ) {
      nextErrors.novaSenha = 'Use letra maiúscula, minúscula e número.'
    }
    if (passwordForm.confirmarNovaSenha !== passwordForm.novaSenha) {
      nextErrors.confirmarNovaSenha = 'As senhas não coincidem.'
    }
    setPasswordErrors(nextErrors)
    if (Object.keys(nextErrors).length > 0) return

    setSavingPassword(true)
    try {
      const token = localStorage.getItem('token')
      const res = await fetch('http://localhost:8081/api/conta/senha', {
        method: 'PUT',
        headers: {
          'Content-Type': 'application/json',
          Authorization: `Bearer ${token}`,
        },
        body: JSON.stringify(passwordForm),
      })

      if (res.status === 401 || res.status === 403) {
        logout()
        toast.error('Sua sessão expirou. Faça login novamente.')
        return
      }

      if (res.ok) {
        toast.success('Senha alterada com sucesso!')
        setPasswordForm({ senhaAtual: '', novaSenha: '', confirmarNovaSenha: '' })
      } else {
        const errData = await res.json().catch(() => ({}))
        toast.error(errData.message || 'Não foi possível alterar a senha.')
      }
    } catch (err) {
      console.error(err)
      toast.error('Erro ao conectar com o servidor.')
    } finally {
      setSavingPassword(false)
    }
  }

  return (
    <AccountLayout
      eyebrow="Área do cliente"
      title="Minha Conta"
      subtitle="Gerencie seus dados pessoais, endereços de entrega e segurança da sua conta."
      breadcrumbLabel="Minha Conta"
    >
      <div className="account-stats">
        <div className="account-stat-card panel">
          <div className="account-stat-icon">
            <FaShieldAlt />
          </div>
          <div>
            <span className="account-stat-label">Status da conta</span>
            <span className="account-stat-value">
              {user?.role === 'ADMIN' ? 'Administrador' : 'Cliente Ativo'}
            </span>
          </div>
        </div>

        <Link to="/meus-favoritos" className="account-stat-card panel">
          <div className="account-stat-icon">
            <FaHeart />
          </div>
          <div>
            <span className="account-stat-label">Favoritos salvos</span>
            <span className="account-stat-value">{favoritesCount}</span>
          </div>
        </Link>

        <Link to="/carrinho" className="account-stat-card panel">
          <div className="account-stat-icon">
            <FaShoppingCart />
          </div>
          <div>
            <span className="account-stat-label">Itens no carrinho</span>
            <span className="account-stat-value">{itemCount}</span>
          </div>
        </Link>
      </div>

      {/* Dados Pessoais */}
      <div className="account-card panel">
        <div className="account-card-head">
          <h2>
            <FaUserEdit /> Dados pessoais
          </h2>
          <span className="mono">Cadastro GuinaCar</span>
        </div>

        {loadingUser && !user ? (
          <div className="skeleton" style={{ height: 140 }} />
        ) : (
          <form onSubmit={handleProfileSubmit} noValidate>
            <div className="account-form-grid">
              <div className="form-field account-form-full">
                <label htmlFor="nome">Nome completo</label>
                <input
                  id="nome"
                  name="nome"
                  value={profileForm.nome}
                  onChange={handleProfileChange}
                  disabled={savingProfile}
                />
                {profileErrors.nome && <span className="form-error">{profileErrors.nome}</span>}
              </div>

              <div className="form-field">
                <label htmlFor="email">E-mail</label>
                <input id="email" value={user?.email || ''} disabled />
                <span className="form-hint">O e-mail de acesso não pode ser alterado.</span>
              </div>

              <div className="form-field">
                <label htmlFor="cpf">CPF</label>
                <input id="cpf" value={formatCpf(user?.cpf || '')} disabled className="mono" />
                <span className="form-hint">Vinculado ao seu cadastro.</span>
              </div>

              <div className="form-field account-form-full">
                <label htmlFor="telefone">Telefone / WhatsApp</label>
                <input
                  id="telefone"
                  name="telefone"
                  value={profileForm.telefone}
                  onChange={handleProfileChange}
                  placeholder="(11) 90000-0000"
                  disabled={savingProfile}
                />
                {profileErrors.telefone && (
                  <span className="form-error">{profileErrors.telefone}</span>
                )}
              </div>
            </div>

            <div className="account-form-actions">
              <button type="submit" className="btn btn-primary" disabled={savingProfile}>
                {savingProfile ? 'Salvando...' : 'Salvar alterações'}
              </button>
            </div>
          </form>
        )}
      </div>

      {/* Endereços de Entrega */}
      <div className="account-card panel">
        <div className="account-card-head">
          <h2>
            <FaMapMarkerAlt /> Endereços de entrega
          </h2>
          {!showAddressForm && (
            <button
              type="button"
              className="btn btn-primary"
              style={{ padding: '8px 16px', fontSize: '0.78rem' }}
              onClick={openNewAddressForm}
            >
              <FaPlus /> Novo endereço
            </button>
          )}
        </div>

        {showAddressForm && (
          <form onSubmit={handleAddressSubmit} className="address-form-panel" noValidate>
            <h3 style={{ fontSize: '1rem', marginBottom: 16 }}>
              {editingAddressId ? 'Editar endereço' : 'Cadastrar novo endereço'}
            </h3>
            <div className="account-form-grid">
              <div className="form-field">
                <label htmlFor="apelido">Apelido (ex: Casa, Oficina)</label>
                <input
                  id="apelido"
                  name="apelido"
                  value={addressForm.apelido}
                  onChange={handleAddressChange}
                  placeholder="Casa"
                  disabled={savingAddress}
                />
              </div>

              <div className="form-field">
                <label htmlFor="addr-destinatario">Destinatário</label>
                <input
                  id="addr-destinatario"
                  name="destinatario"
                  value={addressForm.destinatario}
                  onChange={handleAddressChange}
                  placeholder="Quem vai receber"
                  disabled={savingAddress}
                />
                {addressErrors.destinatario && (
                  <span className="form-error">{addressErrors.destinatario}</span>
                )}
              </div>

              <div className="form-field">
                <label htmlFor="addr-cep">CEP</label>
                <div className="address-cep-row">
                  <input
                    id="addr-cep"
                    name="cep"
                    value={addressForm.cep}
                    onChange={handleAddressChange}
                    placeholder="00000-000"
                    className="mono"
                    disabled={savingAddress}
                  />
                  <button
                    type="button"
                    className="btn btn-outline"
                    onClick={() => lookupCep(addressForm.cep)}
                    disabled={cepLoading}
                  >
                    <FaSearch /> {cepLoading ? '...' : 'Buscar'}
                  </button>
                </div>
                {addressErrors.cep && <span className="form-error">{addressErrors.cep}</span>}
              </div>

              <div className="form-field">
                <label htmlFor="addr-logradouro">Rua / Avenida</label>
                <input
                  id="addr-logradouro"
                  name="logradouro"
                  value={addressForm.logradouro}
                  onChange={handleAddressChange}
                  placeholder="Ex: Av. Paulista"
                  disabled={savingAddress}
                />
                {addressErrors.logradouro && (
                  <span className="form-error">{addressErrors.logradouro}</span>
                )}
              </div>

              <div className="form-field">
                <label htmlFor="addr-numero">Número</label>
                <input
                  id="addr-numero"
                  name="numero"
                  value={addressForm.numero}
                  onChange={handleAddressChange}
                  placeholder="123"
                  disabled={savingAddress}
                />
                {addressErrors.numero && (
                  <span className="form-error">{addressErrors.numero}</span>
                )}
              </div>

              <div className="form-field">
                <label htmlFor="addr-complemento">Complemento</label>
                <input
                  id="addr-complemento"
                  name="complemento"
                  value={addressForm.complemento}
                  onChange={handleAddressChange}
                  placeholder="Apto, bloco (opcional)"
                  disabled={savingAddress}
                />
              </div>

              <div className="form-field">
                <label htmlFor="addr-bairro">Bairro</label>
                <input
                  id="addr-bairro"
                  name="bairro"
                  value={addressForm.bairro}
                  onChange={handleAddressChange}
                  placeholder="Seu bairro"
                  disabled={savingAddress}
                />
                {addressErrors.bairro && (
                  <span className="form-error">{addressErrors.bairro}</span>
                )}
              </div>

              <div className="form-field">
                <label htmlFor="addr-cidade">Cidade</label>
                <input
                  id="addr-cidade"
                  name="cidade"
                  value={addressForm.cidade}
                  onChange={handleAddressChange}
                  placeholder="Sua cidade"
                  disabled={savingAddress}
                />
                {addressErrors.cidade && (
                  <span className="form-error">{addressErrors.cidade}</span>
                )}
              </div>

              <div className="form-field">
                <label htmlFor="addr-estado">Estado (UF)</label>
                <input
                  id="addr-estado"
                  name="estado"
                  value={addressForm.estado}
                  onChange={handleAddressChange}
                  placeholder="SP"
                  maxLength={2}
                  className="mono"
                  disabled={savingAddress}
                />
                {addressErrors.estado && (
                  <span className="form-error">{addressErrors.estado}</span>
                )}
              </div>

              <div className="form-field address-checkbox-field">
                <label className="address-checkbox-label">
                  <input
                    type="checkbox"
                    name="principal"
                    checked={addressForm.principal}
                    onChange={handleAddressChange}
                    disabled={savingAddress}
                  />
                  <span>Definir como endereço principal</span>
                </label>
              </div>
            </div>

            <div className="account-form-actions">
              <button
                type="button"
                className="btn btn-outline"
                onClick={() => {
                  setShowAddressForm(false)
                  setEditingAddressId(null)
                }}
              >
                Cancelar
              </button>
              <button type="submit" className="btn btn-primary" disabled={savingAddress}>
                {savingAddress ? 'Salvando...' : 'Salvar endereço'}
              </button>
            </div>
          </form>
        )}

        {loadingAddresses ? (
          <div className="skeleton" style={{ height: 100 }} />
        ) : addresses.length === 0 ? (
          !showAddressForm && (
            <div className="address-empty">
              <p>
                Você ainda não cadastrou nenhum endereço. Cadastre agora ou informe na sua primeira
                compra — ele será salvo automaticamente para futuros pedidos.
              </p>
            </div>
          )
        ) : (
          <div className="address-list">
            {addresses.map((addr) => (
              <div
                key={addr.id}
                className={`address-item ${addr.principal ? 'is-principal' : ''}`}
              >
                <div className="address-item-head">
                  <div className="address-item-title">
                    <strong>{addr.apelido}</strong>
                    {addr.principal && <span className="address-principal-badge mono">Principal</span>}
                  </div>
                  <div className="address-item-actions">
                    {!addr.principal && (
                      <button
                        type="button"
                        className="address-action-btn"
                        onClick={() => handleSetPrincipal(addr.id)}
                        title="Definir como principal"
                      >
                        <FaStar /> Principal
                      </button>
                    )}
                    <button
                      type="button"
                      className="address-action-btn"
                      onClick={() => openEditAddressForm(addr)}
                      title="Editar endereço"
                    >
                      <FaEdit /> Editar
                    </button>
                    <button
                      type="button"
                      className="address-action-btn is-danger"
                      onClick={() => handleDeleteAddress(addr.id)}
                      title="Remover endereço"
                    >
                      <FaTrash />
                    </button>
                  </div>
                </div>
                <p className="address-item-recipient">{addr.destinatario}</p>
                <p className="address-item-line">
                  {addr.logradouro}, {addr.numero}
                  {addr.complemento ? ` — ${addr.complemento}` : ''}
                </p>
                <p className="address-item-line">
                  {addr.bairro} — {addr.cidade}/{addr.estado} ·{' '}
                  <span className="mono">CEP {formatCep(addr.cep)}</span>
                </p>
              </div>
            ))}
          </div>
        )}
      </div>

      {/* Segurança / Alterar Senha */}
      <div className="account-card panel">
        <div className="account-card-head">
          <h2>
            <FaLock /> Segurança da conta
          </h2>
          <span className="mono">Alterar senha</span>
        </div>

        <form onSubmit={handlePasswordSubmit} noValidate>
          <div className="account-form-grid">
            <div className="form-field account-form-full">
              <label htmlFor="senhaAtual">Senha atual</label>
              <div className="password-input-wrap">
                <input
                  id="senhaAtual"
                  name="senhaAtual"
                  type={showCurrent ? 'text' : 'password'}
                  value={passwordForm.senhaAtual}
                  onChange={handlePasswordChange}
                  placeholder="••••••••"
                  disabled={savingPassword}
                />
                <button
                  type="button"
                  className="password-toggle-btn"
                  onClick={() => setShowCurrent((v) => !v)}
                  tabIndex={-1}
                  aria-label="Mostrar senha atual"
                >
                  {showCurrent ? <FaEyeSlash size={17} /> : <FaEye size={17} />}
                </button>
              </div>
              {passwordErrors.senhaAtual && (
                <span className="form-error">{passwordErrors.senhaAtual}</span>
              )}
            </div>

            <div className="form-field">
              <label htmlFor="novaSenha">Nova senha</label>
              <div className="password-input-wrap">
                <input
                  id="novaSenha"
                  name="novaSenha"
                  type={showNew ? 'text' : 'password'}
                  value={passwordForm.novaSenha}
                  onChange={handlePasswordChange}
                  placeholder="••••••••"
                  disabled={savingPassword}
                />
                <button
                  type="button"
                  className="password-toggle-btn"
                  onClick={() => setShowNew((v) => !v)}
                  tabIndex={-1}
                  aria-label="Mostrar nova senha"
                >
                  {showNew ? <FaEyeSlash size={17} /> : <FaEye size={17} />}
                </button>
              </div>
              <span className="form-hint">Mínimo 8 caracteres, maiúscula, minúscula e número.</span>
              {passwordErrors.novaSenha && (
                <span className="form-error">{passwordErrors.novaSenha}</span>
              )}
            </div>

            <div className="form-field">
              <label htmlFor="confirmarNovaSenha">Confirmar nova senha</label>
              <div className="password-input-wrap">
                <input
                  id="confirmarNovaSenha"
                  name="confirmarNovaSenha"
                  type={showConfirm ? 'text' : 'password'}
                  value={passwordForm.confirmarNovaSenha}
                  onChange={handlePasswordChange}
                  placeholder="••••••••"
                  disabled={savingPassword}
                />
                <button
                  type="button"
                  className="password-toggle-btn"
                  onClick={() => setShowConfirm((v) => !v)}
                  tabIndex={-1}
                  aria-label="Mostrar confirmação de senha"
                >
                  {showConfirm ? <FaEyeSlash size={17} /> : <FaEye size={17} />}
                </button>
              </div>
              {passwordErrors.confirmarNovaSenha && (
                <span className="form-error">{passwordErrors.confirmarNovaSenha}</span>
              )}
            </div>
          </div>

          <div className="account-form-actions">
            <button type="submit" className="btn btn-primary" disabled={savingPassword}>
              {savingPassword ? 'Atualizando...' : 'Atualizar senha'}
            </button>
          </div>
        </form>
      </div>
    </AccountLayout>
  )
}
