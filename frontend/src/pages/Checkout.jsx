import { useState, useEffect, useMemo } from 'react'
import { Link, useNavigate } from 'react-router-dom'
import toast from 'react-hot-toast'
import {
  FaTruck,
  FaBolt,
  FaStore,
  FaCreditCard,
  FaBarcode,
  FaQrcode,
  FaCheck,
  FaCheckCircle,
  FaClock,
  FaLock,
  FaShieldAlt,
  FaCopy,
  FaArrowLeft,
  FaArrowRight,
  FaExclamationTriangle,
  FaSearch,
  FaBoxOpen,
  FaMapMarkerAlt,
  FaPlus,
} from 'react-icons/fa'
import Breadcrumb from '../components/Breadcrumb'
import { useCart } from '../context/CartContext'
import { useAuth } from '../context/AuthContext'
import { formatCurrency } from '../utils/formatCurrency'
import './Checkout.css'

const STEPS = [
  { id: 1, title: 'Entrega', desc: 'Endereço e frete' },
  { id: 2, title: 'Pagamento', desc: 'Forma e dados' },
  { id: 3, title: 'Revisão', desc: 'Confira o pedido' },
  { id: 4, title: 'Confirmação', desc: 'Validação final' },
]

function formatCep(value) {
  const digits = value.replace(/\D/g, '').slice(0, 8)
  if (digits.length > 5) return `${digits.slice(0, 5)}-${digits.slice(5)}`
  return digits
}

function formatCardNumber(value) {
  const digits = value.replace(/\D/g, '').slice(0, 16)
  return digits.replace(/(\d{4})(?=\d)/g, '$1 ')
}

function formatExpiry(value) {
  const digits = value.replace(/\D/g, '').slice(0, 4)
  if (digits.length > 2) return `${digits.slice(0, 2)}/${digits.slice(2)}`
  return digits
}

function detectBrand(number) {
  const d = number.replace(/\D/g, '')
  if (/^4/.test(d)) return 'VISA'
  if (/^(5[1-5]|2[2-7])/.test(d)) return 'MASTERCARD'
  if (/^(34|37)/.test(d)) return 'AMEX'
  if (/^(4011|4312|4389|4514|4576|5041|5066|509|6277|6362|6363|650|6516|6550)/.test(d)) return 'ELO'
  if (/^6062/.test(d)) return 'HIPERCARD'
  return 'CARTÃO'
}

function luhnCheck(number) {
  const digits = number.replace(/\D/g, '')
  if (digits.length < 13 || digits.length > 19) return false
  let sum = 0
  let alternate = false
  for (let i = digits.length - 1; i >= 0; i--) {
    let n = parseInt(digits[i], 10)
    if (alternate) {
      n *= 2
      if (n > 9) n -= 9
    }
    sum += n
    alternate = !alternate
  }
  return sum % 10 === 0
}

function PixQrSvg() {
  // Visual QR code pattern for PIX checkout display
  const cells = [
    [1,1,1,1,1,1,1,0,1,0,1,1,0,0,1,1,1,1,1,1,1],
    [1,0,0,0,0,0,1,0,0,1,0,1,1,0,1,0,0,0,0,0,1],
    [1,0,1,1,1,0,1,0,1,1,1,0,0,0,1,0,1,1,1,0,1],
    [1,0,1,1,1,0,1,0,0,0,1,1,1,0,1,0,1,1,1,0,1],
    [1,0,1,1,1,0,1,0,1,0,0,1,0,0,1,0,1,1,1,0,1],
    [1,0,0,0,0,0,1,0,1,1,0,0,1,0,1,0,0,0,0,0,1],
    [1,1,1,1,1,1,1,0,1,0,1,0,1,0,1,1,1,1,1,1,1],
    [0,0,0,0,0,0,0,0,1,1,0,1,0,0,0,0,0,0,0,0,0],
    [1,1,0,1,1,0,1,1,0,1,1,0,1,1,1,0,1,0,1,1,0],
    [0,1,1,0,0,1,0,1,1,0,0,1,0,1,0,1,1,1,0,0,1],
    [1,0,1,1,0,1,1,0,1,1,1,0,1,0,1,1,0,1,1,0,1],
    [0,1,0,0,1,0,0,1,0,1,0,1,1,1,0,0,1,0,0,1,0],
    [1,1,1,0,1,1,1,0,1,0,1,1,0,1,1,1,0,1,1,0,1],
    [0,0,0,0,0,0,0,0,1,1,0,0,1,0,1,0,1,1,0,1,0],
    [1,1,1,1,1,1,1,0,0,1,1,1,0,1,0,1,1,0,1,0,1],
    [1,0,0,0,0,0,1,0,1,0,0,1,1,0,1,1,0,1,0,1,0],
    [1,0,1,1,1,0,1,0,1,1,1,0,0,1,0,0,1,1,1,0,1],
    [1,0,1,1,1,0,1,0,0,1,0,1,1,0,1,1,0,0,1,1,0],
    [1,0,1,1,1,0,1,0,1,0,1,0,1,1,0,1,1,1,0,0,1],
    [1,0,0,0,0,0,1,0,1,1,0,1,0,0,1,0,0,1,1,1,0],
    [1,1,1,1,1,1,1,0,0,1,1,0,1,1,0,1,1,0,1,0,1],
  ]

  return (
    <svg viewBox="0 0 21 21" width="168" height="168" aria-label="QR Code PIX">
      <rect width="21" height="21" fill="#ffffff" />
      {cells.map((row, y) =>
        row.map((val, x) =>
          val ? <rect key={`${x}-${y}`} x={x} y={y} width="1" height="1" fill="#111111" /> : null
        )
      )}
    </svg>
  )
}

export default function Checkout() {
  const { items, subtotal, clearCart } = useCart()
  const { user, logout } = useAuth()
  const navigate = useNavigate()

  const [step, setStep] = useState(1)
  const [cepLoading, setCepLoading] = useState(false)
  const [processingText, setProcessingText] = useState('')
  const [submitError, setSubmitError] = useState('')
  const [createdOrder, setCreatedOrder] = useState(null)
  const [validatingPayment, setValidatingPayment] = useState(false)
  const [pixSecondsLeft, setPixSecondsLeft] = useState(15 * 60)

  const [delivery, setDelivery] = useState({
    tipoEntrega: 'PADRAO',
    destinatario: '',
    cep: '',
    logradouro: '',
    numero: '',
    complemento: '',
    bairro: '',
    cidade: '',
    estado: '',
  })
  const [deliveryErrors, setDeliveryErrors] = useState({})
  const [savedAddresses, setSavedAddresses] = useState([])
  const [selectedAddressId, setSelectedAddressId] = useState('NEW')

  const [payment, setPayment] = useState({
    formaPagamento: 'PIX',
    parcelas: 1,
    numeroCartao: '',
    nomeTitular: '',
    validade: '',
    cvv: '',
  })
  const [paymentErrors, setPaymentErrors] = useState({})

  useEffect(() => {
    if (user?.nome && !delivery.destinatario) {
      setDelivery((prev) => ({ ...prev, destinatario: user.nome }))
    }
  }, [user, delivery.destinatario])

  // Carrega os endereços salvos da conta para seleção rápida no checkout
  useEffect(() => {
    const token = localStorage.getItem('token')
    if (!token) return
    let active = true

    fetch('http://localhost:8081/api/conta/enderecos', {
      headers: { Authorization: `Bearer ${token}` },
    })
      .then((res) => (res.ok ? res.json() : []))
      .then((list) => {
        if (!active || !Array.isArray(list)) return
        setSavedAddresses(list)
        if (list.length > 0) {
          const preferred = list.find((a) => a.principal) || list[0]
          setSelectedAddressId(preferred.id)
          setDelivery((prev) => ({
            ...prev,
            destinatario: preferred.destinatario || prev.destinatario,
            cep: formatCep(preferred.cep || ''),
            logradouro: preferred.logradouro || '',
            numero: preferred.numero || '',
            complemento: preferred.complemento || '',
            bairro: preferred.bairro || '',
            cidade: preferred.cidade || '',
            estado: preferred.estado || '',
          }))
        }
      })
      .catch(() => {})

    return () => {
      active = false
    }
  }, [])

  const handleSelectSavedAddress = (addr) => {
    setSelectedAddressId(addr.id)
    setDelivery((prev) => ({
      ...prev,
      destinatario: addr.destinatario || user?.nome || '',
      cep: formatCep(addr.cep || ''),
      logradouro: addr.logradouro || '',
      numero: addr.numero || '',
      complemento: addr.complemento || '',
      bairro: addr.bairro || '',
      cidade: addr.cidade || '',
      estado: addr.estado || '',
    }))
    setDeliveryErrors({})
  }

  const handleSelectNewAddress = () => {
    setSelectedAddressId('NEW')
    setDelivery((prev) => ({
      ...prev,
      destinatario: user?.nome || '',
      cep: '',
      logradouro: '',
      numero: '',
      complemento: '',
      bairro: '',
      cidade: '',
      estado: '',
    }))
    setDeliveryErrors({})
  }

  // Countdown for pending PIX
  useEffect(() => {
    if (step !== 4 || createdOrder?.pagamento?.statusPagamento !== 'PENDENTE') return
    if (createdOrder?.pagamento?.formaPagamento !== 'PIX') return
    const timer = setInterval(() => {
      setPixSecondsLeft((s) => (s > 0 ? s - 1 : 0))
    }, 1000)
    return () => clearInterval(timer)
  }, [step, createdOrder])

  const shippingCost = useMemo(() => {
    if (delivery.tipoEntrega === 'RETIRADA') return 0
    if (delivery.tipoEntrega === 'EXPRESSA') return 44.9
    return subtotal >= 300 ? 0 : 24.9
  }, [delivery.tipoEntrega, subtotal])

  const shippingEta = useMemo(() => {
    if (delivery.tipoEntrega === 'RETIRADA') return 'Pronto em até 2 horas úteis'
    if (delivery.tipoEntrega === 'EXPRESSA') return '1 a 2 dias úteis'
    return '5 a 7 dias úteis'
  }, [delivery.tipoEntrega])

  const pixDiscount = useMemo(() => {
    return payment.formaPagamento === 'PIX' ? Number((subtotal * 0.05).toFixed(2)) : 0
  }, [payment.formaPagamento, subtotal])

  const finalTotal = useMemo(() => {
    return Math.max(0, Number((subtotal + shippingCost - pixDiscount).toFixed(2)))
  }, [subtotal, shippingCost, pixDiscount])

  const lookupCep = async (rawCep) => {
    const digits = rawCep.replace(/\D/g, '')
    if (digits.length !== 8) return
    setCepLoading(true)
    try {
      const res = await fetch(`https://viacep.com.br/ws/${digits}/json/`)
      if (!res.ok) return
      const data = await res.json()
      if (data.erro) {
        toast.error('CEP não encontrado. Preencha o endereço manualmente.')
        return
      }
      setDelivery((prev) => ({
        ...prev,
        logradouro: data.logradouro || prev.logradouro,
        bairro: data.bairro || prev.bairro,
        cidade: data.localidade || prev.cidade,
        estado: data.uf || prev.estado,
      }))
      setDeliveryErrors((prev) => ({
        ...prev,
        cep: undefined,
        logradouro: undefined,
        bairro: undefined,
        cidade: undefined,
        estado: undefined,
      }))
      toast.success('Endereço preenchido pelo CEP!')
    } catch {
      // Fallback silencioso para preenchimento manual
    } finally {
      setCepLoading(false)
    }
  }

  const handleDeliveryChange = (e) => {
    const { name, value } = e.target
    const nextValue =
      name === 'cep'
        ? formatCep(value)
        : name === 'estado'
          ? value.toUpperCase().slice(0, 2)
          : value

    setDelivery((prev) => ({ ...prev, [name]: nextValue }))
    setDeliveryErrors((prev) => ({ ...prev, [name]: undefined }))

    if (name === 'cep' && nextValue.replace(/\D/g, '').length === 8) {
      lookupCep(nextValue)
    }
  }

  const handlePaymentChange = (e) => {
    const { name, value } = e.target
    let nextValue = value
    if (name === 'numeroCartao') nextValue = formatCardNumber(value)
    if (name === 'validade') nextValue = formatExpiry(value)
    if (name === 'cvv') nextValue = value.replace(/\D/g, '').slice(0, 4)
    if (name === 'parcelas') nextValue = Number(value)

    setPayment((prev) => ({ ...prev, [name]: nextValue }))
    setPaymentErrors((prev) => ({ ...prev, [name]: undefined }))
    setSubmitError('')
  }

  const validateDelivery = () => {
    const next = {}
    if (delivery.destinatario.trim().length < 3) {
      next.destinatario = 'Informe o nome de quem vai receber.'
    }
    if (delivery.tipoEntrega !== 'RETIRADA') {
      if (delivery.cep.replace(/\D/g, '').length !== 8) next.cep = 'CEP deve ter 8 dígitos.'
      if (!delivery.logradouro.trim()) next.logradouro = 'Informe a rua/avenida.'
      if (!delivery.numero.trim()) next.numero = 'Informe o número.'
      if (!delivery.bairro.trim()) next.bairro = 'Informe o bairro.'
      if (!delivery.cidade.trim()) next.cidade = 'Informe a cidade.'
      if (delivery.estado.trim().length !== 2) next.estado = 'UF inválida.'
    }
    setDeliveryErrors(next)
    return Object.keys(next).length === 0
  }

  const validatePayment = () => {
    if (payment.formaPagamento !== 'CARTAO_CREDITO') {
      setPaymentErrors({})
      return true
    }
    const next = {}
    if (!luhnCheck(payment.numeroCartao)) {
      next.numeroCartao = 'Número de cartão inválido.'
    }
    if (payment.nomeTitular.trim().length < 3) {
      next.nomeTitular = 'Informe o nome impresso no cartão.'
    }
    if (!/^(0[1-9]|1[0-2])\/\d{2}$/.test(payment.validade)) {
      next.validade = 'Use o formato MM/AA.'
    } else {
      const [mm, yy] = payment.validade.split('/').map(Number)
      const now = new Date()
      const exp = new Date(2000 + yy, mm, 0)
      if (exp < new Date(now.getFullYear(), now.getMonth(), 1)) {
        next.validade = 'Cartão vencido.'
      }
    }
    if (payment.cvv.length < 3) {
      next.cvv = 'CVV inválido.'
    }
    setPaymentErrors(next)
    return Object.keys(next).length === 0
  }

  const fillTestCard = () => {
    setPayment((prev) => ({
      ...prev,
      numeroCartao: '4532 1488 0343 6467',
      nomeTitular: (user?.nome || 'CLIENTE GUINACAR').toUpperCase(),
      validade: '12/29',
      cvv: '342',
    }))
    setPaymentErrors({})
    setSubmitError('')
    toast.success('Cartão de teste preenchido!')
  }

  const handlePlaceOrder = async () => {
    setSubmitError('')
    setProcessingText('Validando informações de entrega e segurança...')

    try {
      const token = localStorage.getItem('token')

      await new Promise((r) => setTimeout(r, 650))
      setProcessingText(
        payment.formaPagamento === 'CARTAO_CREDITO'
          ? 'Comunicando com a operadora do cartão...'
          : payment.formaPagamento === 'PIX'
            ? 'Gerando QR Code PIX no Banco Central...'
            : 'Emitindo boleto bancário registrado...'
      )

      const response = await fetch('http://localhost:8081/api/pedidos', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
          Authorization: `Bearer ${token}`,
        },
        body: JSON.stringify({
          itens: items,
          subtotal,
          frete: shippingCost,
          desconto: pixDiscount,
          total: finalTotal,
          entrega: {
            ...delivery,
            prazoEntrega: shippingEta,
          },
          pagamento: {
            formaPagamento: payment.formaPagamento,
            parcelas: payment.formaPagamento === 'CARTAO_CREDITO' ? payment.parcelas : 1,
            numeroCartao: payment.formaPagamento === 'CARTAO_CREDITO' ? payment.numeroCartao : null,
            nomeTitular: payment.formaPagamento === 'CARTAO_CREDITO' ? payment.nomeTitular : null,
            validade: payment.formaPagamento === 'CARTAO_CREDITO' ? payment.validade : null,
            cvv: payment.formaPagamento === 'CARTAO_CREDITO' ? payment.cvv : null,
          },
        }),
      })

      if (response.status === 401 || response.status === 403) {
        logout()
        toast.error('Sua sessão expirou. Faça login novamente.')
        navigate('/login', { state: { from: '/checkout' } })
        return
      }

      if (response.ok) {
        const orderData = await response.json()
        setCreatedOrder(orderData)
        clearCart()
        setStep(4)
        window.scrollTo({ top: 0, behavior: 'smooth' })
        toast.success('Pedido gerado com sucesso!')
      } else {
        const errData = await response.json().catch(() => ({}))
        const msg = errData.message || 'Não foi possível validar o pagamento.'
        setSubmitError(msg)
        toast.error(msg)
      }
    } catch (err) {
      console.error('Erro no checkout:', err)
      setSubmitError('Erro ao conectar com o servidor. Tente novamente.')
      toast.error('Erro ao conectar com o servidor.')
    } finally {
      setProcessingText('')
    }
  }

  const handleConfirmPendingPayment = async () => {
    if (!createdOrder) return
    setValidatingPayment(true)
    try {
      await new Promise((r) => setTimeout(r, 900))
      const token = localStorage.getItem('token')
      const res = await fetch(
        `http://localhost:8081/api/pedidos/${createdOrder.id}/confirmar-pagamento`,
        {
          method: 'POST',
          headers: { Authorization: `Bearer ${token}` },
        }
      )

      if (res.ok) {
        const updated = await res.json()
        setCreatedOrder(updated)
        toast.success('Pagamento validado e aprovado!')
      } else {
        const errData = await res.json().catch(() => ({}))
        toast.error(errData.message || 'Não foi possível validar o pagamento.')
      }
    } catch {
      toast.error('Erro ao conectar com o servidor.')
    } finally {
      setValidatingPayment(false)
    }
  }

  const copyToClipboard = (text, label) => {
    navigator.clipboard?.writeText(text)
    toast.success(`${label} copiado!`)
  }

  if (items.length === 0 && step !== 4) {
    return (
      <div className="page">
        <div className="container page-section">
          <Breadcrumb items={[{ label: 'Carrinho', to: '/carrinho' }, { label: 'Checkout' }]} />
          <div className="account-empty panel" style={{ marginTop: 24 }}>
            <FaBoxOpen />
            <h3>Seu carrinho está vazio</h3>
            <p>Adicione peças ao carrinho antes de prosseguir para o checkout.</p>
            <Link to="/catalogo" className="btn btn-primary">
              Ver Catálogo
            </Link>
          </div>
        </div>
      </div>
    )
  }

  const pixMinutes = String(Math.floor(pixSecondsLeft / 60)).padStart(2, '0')
  const pixSecs = String(pixSecondsLeft % 60).padStart(2, '0')
  const cardBrand = detectBrand(payment.numeroCartao)
  const paymentStatus = createdOrder?.pagamento?.statusPagamento
  const paymentMethod = createdOrder?.pagamento?.formaPagamento

  return (
    <div className="page">
      {processingText && (
        <div className="processing-overlay" role="alert" aria-live="assertive">
          <div className="processing-card panel">
            <div className="processing-spinner" />
            <h3>Processando seu pedido</h3>
            <p style={{ color: 'var(--gray)', margin: 0 }}>{processingText}</p>
          </div>
        </div>
      )}

      <div className="container page-section">
        <Breadcrumb items={[{ label: 'Carrinho', to: '/carrinho' }, { label: 'Checkout' }]} />
        <span className="eyebrow">Finalização segura</span>
        <h1 className="section-heading">Checkout GuinaCar</h1>

        {/* Stepper */}
        <div className="checkout-stepper">
          {STEPS.map((s) => {
            const isDone = step > s.id || (step === 4 && s.id === 4 && paymentStatus === 'APROVADO')
            const isActive = step === s.id
            const canClick = step < 4 && s.id < step

            return (
              <button
                key={s.id}
                type="button"
                className={`checkout-step ${isActive ? 'is-active' : ''} ${isDone ? 'is-done' : ''} ${canClick ? 'is-clickable' : ''}`}
                onClick={() => canClick && setStep(s.id)}
                disabled={!canClick}
              >
                <span className="checkout-step-num">{isDone ? <FaCheck /> : s.id}</span>
                <span className="checkout-step-label">
                  <strong>{s.title}</strong>
                  <span>{s.desc}</span>
                </span>
              </button>
            )
          })}
        </div>

        {/* Step 4: Confirmação e Validação do Pagamento */}
        {step === 4 && createdOrder ? (
          <div className="confirmation-wrap">
            <div className="confirmation-hero panel">
              <div
                className={`confirmation-icon ${paymentStatus === 'APROVADO' ? 'is-approved' : 'is-pending'}`}
              >
                {paymentStatus === 'APROVADO' ? <FaCheckCircle /> : <FaClock />}
              </div>
              <span className="eyebrow">
                {paymentStatus === 'APROVADO' ? 'Pagamento aprovado' : 'Aguardando pagamento'}
              </span>
              <h2>
                {paymentStatus === 'APROVADO'
                  ? `Pedido #${String(createdOrder.id).padStart(4, '0')} confirmado!`
                  : `Pedido #${String(createdOrder.id).padStart(4, '0')} reservado`}
              </h2>
              <p style={{ color: 'var(--gray)', maxWidth: 520, margin: 0 }}>
                {paymentStatus === 'APROVADO'
                  ? 'Recebemos a confirmação do seu pagamento. Suas peças já estão sendo preparadas para envio.'
                  : paymentMethod === 'PIX'
                    ? 'Escaneie o QR Code ou copie o código PIX abaixo e clique em validar pagamento.'
                    : 'Utilize a linha digitável abaixo para pagar o boleto bancário e validar o pagamento.'}
              </p>

              <div className="confirmation-meta mono">
                <span>
                  Transação: <strong>{createdOrder.pagamento?.codigoTransacao}</strong>
                </span>
                <span>
                  Total: <strong>{formatCurrency(Number(createdOrder.total))}</strong>
                </span>
                <span>
                  Previsão: <strong>{createdOrder.entrega?.prazoEntrega}</strong>
                </span>
              </div>
            </div>

            {paymentStatus === 'PENDENTE' && paymentMethod === 'PIX' && (
              <div className="pix-payment-box panel">
                <div className="pix-qr-frame">
                  <PixQrSvg />
                </div>
                <div>
                  <div className="pix-timer">
                    <FaClock /> Expira em {pixMinutes}:{pixSecs}
                  </div>
                  <h3>Pague com PIX Copia e Cola</h3>
                  <div className="pix-code-box">{createdOrder.pagamento?.codigoPix}</div>
                  <div style={{ display: 'flex', flexWrap: 'wrap', gap: 10 }}>
                    <button
                      type="button"
                      className="btn btn-outline"
                      onClick={() =>
                        copyToClipboard(createdOrder.pagamento?.codigoPix, 'Código PIX')
                      }
                    >
                      <FaCopy /> Copiar código PIX
                    </button>
                    <button
                      type="button"
                      className="btn btn-primary"
                      disabled={validatingPayment}
                      onClick={handleConfirmPendingPayment}
                    >
                      <FaCheckCircle />{' '}
                      {validatingPayment
                        ? 'Validando PIX...'
                        : 'Já fiz o PIX — Validar Pagamento'}
                    </button>
                  </div>
                </div>
              </div>
            )}

            {paymentStatus === 'PENDENTE' && paymentMethod === 'BOLETO' && (
              <div className="boleto-payment-box panel">
                <h3>Boleto Bancário Registrado</h3>
                <p style={{ color: 'var(--gray)', margin: 0, fontSize: '0.9rem' }}>
                  Vencimento em 3 dias úteis. Após o pagamento, a compensação ocorre em até 1 dia
                  útil — ou clique abaixo para simular a validação imediata.
                </p>
                <div className="boleto-barcode">
                  {createdOrder.pagamento?.linhaDigitavelBoleto}
                </div>
                <div style={{ display: 'flex', flexWrap: 'wrap', gap: 10 }}>
                  <button
                    type="button"
                    className="btn btn-outline"
                    onClick={() =>
                      copyToClipboard(
                        createdOrder.pagamento?.linhaDigitavelBoleto,
                        'Linha digitável'
                      )
                    }
                  >
                    <FaCopy /> Copiar linha digitável
                  </button>
                  <button
                    type="button"
                    className="btn btn-primary"
                    disabled={validatingPayment}
                    onClick={handleConfirmPendingPayment}
                  >
                    <FaCheckCircle />{' '}
                    {validatingPayment ? 'Validando boleto...' : 'Validar Pagamento do Boleto'}
                  </button>
                </div>
              </div>
            )}

            <div className="confirmation-actions">
              <Link to="/meus-pedidos" className="btn btn-primary">
                Acompanhar em Meus Pedidos
              </Link>
              <Link to="/catalogo" className="btn btn-outline">
                Continuar comprando
              </Link>
            </div>
          </div>
        ) : (
          <div className="checkout-layout">
            <div className="checkout-main">
              {/* STEP 1 — ENTREGA */}
              {step === 1 && (
                <div className="checkout-card panel">
                  <div className="checkout-card-title">
                    <h2>
                      <FaTruck /> Informações de entrega
                    </h2>
                    <span className="mono" style={{ fontSize: '0.75rem', color: 'var(--gray)' }}>
                      Passo 1 de 3
                    </span>
                  </div>

                  <div className="shipping-options">
                    <button
                      type="button"
                      className={`shipping-option ${delivery.tipoEntrega === 'PADRAO' ? 'is-selected' : ''}`}
                      onClick={() => setDelivery((p) => ({ ...p, tipoEntrega: 'PADRAO' }))}
                    >
                      <div className="shipping-option-top">
                        <strong>
                          <FaTruck /> Padrão
                        </strong>
                        <span className={`shipping-option-price ${subtotal < 300 ? 'is-paid' : ''}`}>
                          {subtotal >= 300 ? 'Grátis' : formatCurrency(24.9)}
                        </span>
                      </div>
                      <span className="shipping-option-eta">Receba em 5 a 7 dias úteis</span>
                    </button>

                    <button
                      type="button"
                      className={`shipping-option ${delivery.tipoEntrega === 'EXPRESSA' ? 'is-selected' : ''}`}
                      onClick={() => setDelivery((p) => ({ ...p, tipoEntrega: 'EXPRESSA' }))}
                    >
                      <div className="shipping-option-top">
                        <strong>
                          <FaBolt /> Expressa
                        </strong>
                        <span className="shipping-option-price is-paid">
                          {formatCurrency(44.9)}
                        </span>
                      </div>
                      <span className="shipping-option-eta">Envio Full — 1 a 2 dias úteis</span>
                    </button>

                    <button
                      type="button"
                      className={`shipping-option ${delivery.tipoEntrega === 'RETIRADA' ? 'is-selected' : ''}`}
                      onClick={() => setDelivery((p) => ({ ...p, tipoEntrega: 'RETIRADA' }))}
                    >
                      <div className="shipping-option-top">
                        <strong>
                          <FaStore /> Retirar na loja
                        </strong>
                        <span className="shipping-option-price">Grátis</span>
                      </div>
                      <span className="shipping-option-eta">Pronto em até 2 horas úteis</span>
                    </button>
                  </div>

                  <div className="checkout-grid">
                    <div className="form-field col-12">
                      <label htmlFor="destinatario">Nome do destinatário</label>
                      <input
                        id="destinatario"
                        name="destinatario"
                        value={delivery.destinatario}
                        onChange={handleDeliveryChange}
                        placeholder="Quem vai receber o pedido"
                      />
                      {deliveryErrors.destinatario && (
                        <span className="form-error">{deliveryErrors.destinatario}</span>
                      )}
                    </div>

                    {delivery.tipoEntrega === 'RETIRADA' ? (
                      <div className="col-12 store-pickup-box">
                        <strong>Loja Física GuinaCar Autopeças — Centro Automotivo</strong>
                        <span>Av. Automotiva, 1450 — São Paulo / SP</span>
                        <span>Segunda a Sábado, das 08h às 19h. Apresente documento com foto.</span>
                      </div>
                    ) : (
                      <>
                        {savedAddresses.length > 0 ? (
                          <div className="col-12 saved-addresses-section">
                            <span className="saved-addresses-label mono">
                              Selecione um endereço salvo ou cadastre um novo
                            </span>
                            <div className="saved-addresses-grid">
                              {savedAddresses.map((addr) => (
                                <button
                                  key={addr.id}
                                  type="button"
                                  className={`saved-address-card ${selectedAddressId === addr.id ? 'is-selected' : ''}`}
                                  onClick={() => handleSelectSavedAddress(addr)}
                                >
                                  <div className="saved-address-head">
                                    <strong>
                                      <FaMapMarkerAlt /> {addr.apelido}
                                    </strong>
                                    {addr.principal && (
                                      <span className="saved-address-badge mono">Principal</span>
                                    )}
                                  </div>
                                  <span>{addr.destinatario}</span>
                                  <span>
                                    {addr.logradouro}, {addr.numero}
                                    {addr.complemento ? ` — ${addr.complemento}` : ''}
                                  </span>
                                  <span>
                                    {addr.bairro} — {addr.cidade}/{addr.estado}
                                  </span>
                                  <span className="mono">CEP {formatCep(addr.cep)}</span>
                                </button>
                              ))}

                              <button
                                type="button"
                                className={`saved-address-card saved-address-new ${selectedAddressId === 'NEW' ? 'is-selected' : ''}`}
                                onClick={handleSelectNewAddress}
                              >
                                <FaPlus />
                                <strong>Usar outro endereço</strong>
                                <span>Será salvo automaticamente na sua conta</span>
                              </button>
                            </div>
                          </div>
                        ) : (
                          <div className="col-12 first-address-notice">
                            <FaMapMarkerAlt />
                            <span>
                              O endereço informado nesta compra ficará salvo automaticamente na sua
                              conta para agilizar seus próximos pedidos.
                            </span>
                          </div>
                        )}

                        {(savedAddresses.length === 0 || selectedAddressId === 'NEW') && (
                          <>
                            <div className="form-field col-5">
                              <label htmlFor="cep">CEP</label>
                              <div className="cep-row">
                                <input
                                  id="cep"
                                  name="cep"
                                  value={delivery.cep}
                                  onChange={handleDeliveryChange}
                                  placeholder="00000-000"
                                  className="mono"
                                />
                                <button
                                  type="button"
                                  className="btn btn-outline"
                                  onClick={() => lookupCep(delivery.cep)}
                                  disabled={cepLoading}
                                >
                                  <FaSearch /> {cepLoading ? '...' : 'Buscar'}
                                </button>
                              </div>
                              {deliveryErrors.cep && (
                                <span className="form-error">{deliveryErrors.cep}</span>
                              )}
                            </div>

                            <div className="form-field col-7">
                              <label htmlFor="logradouro">Rua / Avenida</label>
                              <input
                                id="logradouro"
                                name="logradouro"
                                value={delivery.logradouro}
                                onChange={handleDeliveryChange}
                                placeholder="Ex: Av. Paulista"
                              />
                              {deliveryErrors.logradouro && (
                                <span className="form-error">{deliveryErrors.logradouro}</span>
                              )}
                            </div>

                            <div className="form-field col-3">
                              <label htmlFor="numero">Número</label>
                              <input
                                id="numero"
                                name="numero"
                                value={delivery.numero}
                                onChange={handleDeliveryChange}
                                placeholder="123"
                              />
                              {deliveryErrors.numero && (
                                <span className="form-error">{deliveryErrors.numero}</span>
                              )}
                            </div>

                            <div className="form-field col-4">
                              <label htmlFor="complemento">Complemento</label>
                              <input
                                id="complemento"
                                name="complemento"
                                value={delivery.complemento}
                                onChange={handleDeliveryChange}
                                placeholder="Apto, bloco (opcional)"
                              />
                            </div>

                            <div className="form-field col-5">
                              <label htmlFor="bairro">Bairro</label>
                              <input
                                id="bairro"
                                name="bairro"
                                value={delivery.bairro}
                                onChange={handleDeliveryChange}
                                placeholder="Seu bairro"
                              />
                              {deliveryErrors.bairro && (
                                <span className="form-error">{deliveryErrors.bairro}</span>
                              )}
                            </div>

                            <div className="form-field col-8">
                              <label htmlFor="cidade">Cidade</label>
                              <input
                                id="cidade"
                                name="cidade"
                                value={delivery.cidade}
                                onChange={handleDeliveryChange}
                                placeholder="Sua cidade"
                              />
                              {deliveryErrors.cidade && (
                                <span className="form-error">{deliveryErrors.cidade}</span>
                              )}
                            </div>

                            <div className="form-field col-4">
                              <label htmlFor="estado">Estado (UF)</label>
                              <input
                                id="estado"
                                name="estado"
                                value={delivery.estado}
                                onChange={handleDeliveryChange}
                                placeholder="SP"
                                maxLength={2}
                                className="mono"
                              />
                              {deliveryErrors.estado && (
                                <span className="form-error">{deliveryErrors.estado}</span>
                              )}
                            </div>
                          </>
                        )}
                      </>
                    )}
                  </div>

                  <div className="checkout-nav-actions">
                    <Link to="/carrinho" className="btn btn-outline">
                      <FaArrowLeft /> Voltar ao carrinho
                    </Link>
                    <button
                      type="button"
                      className="btn btn-primary"
                      onClick={() => validateDelivery() && setStep(2)}
                    >
                      Ir para Pagamento <FaArrowRight />
                    </button>
                  </div>
                </div>
              )}

              {/* STEP 2 — PAGAMENTO */}
              {step === 2 && (
                <div className="checkout-card panel">
                  <div className="checkout-card-title">
                    <h2>
                      <FaCreditCard /> Forma de pagamento
                    </h2>
                    {payment.formaPagamento === 'CARTAO_CREDITO' && (
                      <button type="button" className="test-card-btn" onClick={fillTestCard}>
                        Preencher cartão de teste
                      </button>
                    )}
                  </div>

                  <div className="payment-methods">
                    <button
                      type="button"
                      className={`payment-method-card ${payment.formaPagamento === 'PIX' ? 'is-selected' : ''}`}
                      onClick={() =>
                        setPayment((p) => ({ ...p, formaPagamento: 'PIX', parcelas: 1 }))
                      }
                    >
                      <span className="payment-badge-off">5% OFF</span>
                      <FaQrcode className="payment-method-icon" />
                      <strong>PIX</strong>
                      <span>Aprovação imediata</span>
                    </button>

                    <button
                      type="button"
                      className={`payment-method-card ${payment.formaPagamento === 'CARTAO_CREDITO' ? 'is-selected' : ''}`}
                      onClick={() =>
                        setPayment((p) => ({ ...p, formaPagamento: 'CARTAO_CREDITO' }))
                      }
                    >
                      <FaCreditCard className="payment-method-icon" />
                      <strong>Cartão de Crédito</strong>
                      <span>Até 12x sem juros</span>
                    </button>

                    <button
                      type="button"
                      className={`payment-method-card ${payment.formaPagamento === 'BOLETO' ? 'is-selected' : ''}`}
                      onClick={() =>
                        setPayment((p) => ({ ...p, formaPagamento: 'BOLETO', parcelas: 1 }))
                      }
                    >
                      <FaBarcode className="payment-method-icon" />
                      <strong>Boleto Bancário</strong>
                      <span>Vence em 3 dias úteis</span>
                    </button>
                  </div>

                  {payment.formaPagamento === 'PIX' && (
                    <div className="payment-info-box">
                      <strong>Desconto exclusivo de 5% no PIX</strong>
                      <span>
                        O QR Code e o código Copia e Cola serão gerados assim que você finalizar o
                        pedido na próxima etapa.
                      </span>
                      <span className="payment-info-highlight">
                        Você economiza {formatCurrency(pixDiscount)} pagando com PIX!
                      </span>
                    </div>
                  )}

                  {payment.formaPagamento === 'BOLETO' && (
                    <div className="payment-info-box">
                      <strong>Pagamento via Boleto Bancário</strong>
                      <span>
                        Você poderá copiar a linha digitável ou pagar pelo app do seu banco. A
                        aprovação ocorre em até 1 dia útil após o pagamento.
                      </span>
                    </div>
                  )}

                  {payment.formaPagamento === 'CARTAO_CREDITO' && (
                    <div className="card-preview-layout">
                      <div className="credit-card-visual">
                        <div className="credit-card-top">
                          <div className="credit-card-chip" />
                          <span className="credit-card-brand">{cardBrand}</span>
                        </div>
                        <div className="credit-card-number">
                          {payment.numeroCartao || '•••• •••• •••• ••••'}
                        </div>
                        <div className="credit-card-bottom">
                          <div>
                            <small>Titular</small>
                            <span>{payment.nomeTitular || 'NOME NO CARTÃO'}</span>
                          </div>
                          <div>
                            <small>Validade</small>
                            <span>{payment.validade || 'MM/AA'}</span>
                          </div>
                        </div>
                      </div>

                      <div className="checkout-grid">
                        <div className="form-field col-12">
                          <label htmlFor="numeroCartao">Número do cartão</label>
                          <input
                            id="numeroCartao"
                            name="numeroCartao"
                            value={payment.numeroCartao}
                            onChange={handlePaymentChange}
                            placeholder="0000 0000 0000 0000"
                            className="mono"
                          />
                          {paymentErrors.numeroCartao && (
                            <span className="form-error">{paymentErrors.numeroCartao}</span>
                          )}
                        </div>

                        <div className="form-field col-12">
                          <label htmlFor="nomeTitular">Nome impresso no cartão</label>
                          <input
                            id="nomeTitular"
                            name="nomeTitular"
                            value={payment.nomeTitular}
                            onChange={handlePaymentChange}
                            placeholder="Como aparece no cartão"
                          />
                          {paymentErrors.nomeTitular && (
                            <span className="form-error">{paymentErrors.nomeTitular}</span>
                          )}
                        </div>

                        <div className="form-field col-6">
                          <label htmlFor="validade">Validade</label>
                          <input
                            id="validade"
                            name="validade"
                            value={payment.validade}
                            onChange={handlePaymentChange}
                            placeholder="MM/AA"
                            className="mono"
                          />
                          {paymentErrors.validade && (
                            <span className="form-error">{paymentErrors.validade}</span>
                          )}
                        </div>

                        <div className="form-field col-6">
                          <label htmlFor="cvv">CVV</label>
                          <input
                            id="cvv"
                            name="cvv"
                            value={payment.cvv}
                            onChange={handlePaymentChange}
                            placeholder="123"
                            className="mono"
                          />
                          {paymentErrors.cvv && (
                            <span className="form-error">{paymentErrors.cvv}</span>
                          )}
                        </div>

                        <div className="form-field col-12">
                          <label htmlFor="parcelas">Parcelamento</label>
                          <select
                            id="parcelas"
                            name="parcelas"
                            value={payment.parcelas}
                            onChange={handlePaymentChange}
                          >
                            {Array.from({ length: 12 }, (_, idx) => idx + 1).map((n) => (
                              <option key={n} value={n}>
                                {n}x de {formatCurrency(finalTotal / n)} sem juros
                              </option>
                            ))}
                          </select>
                        </div>
                      </div>
                    </div>
                  )}

                  <div className="checkout-nav-actions">
                    <button type="button" className="btn btn-outline" onClick={() => setStep(1)}>
                      <FaArrowLeft /> Voltar para Entrega
                    </button>
                    <button
                      type="button"
                      className="btn btn-primary"
                      onClick={() => validatePayment() && setStep(3)}
                    >
                      Revisar Pedido <FaArrowRight />
                    </button>
                  </div>
                </div>
              )}

              {/* STEP 3 — REVISÃO */}
              {step === 3 && (
                <div className="checkout-card panel">
                  <div className="checkout-card-title">
                    <h2>
                      <FaCheckCircle /> Revisão final do pedido
                    </h2>
                    <span className="mono" style={{ fontSize: '0.75rem', color: 'var(--gray)' }}>
                      Passo 3 de 3
                    </span>
                  </div>

                  {submitError && (
                    <div className="checkout-error-banner" style={{ marginBottom: 18 }}>
                      <FaExclamationTriangle />
                      <span>{submitError}</span>
                    </div>
                  )}

                  <div className="review-grid">
                    <div className="review-box">
                      <div className="review-box-head">
                        <strong>Entrega</strong>
                        <button
                          type="button"
                          className="review-edit-link"
                          onClick={() => setStep(1)}
                        >
                          Alterar
                        </button>
                      </div>
                      <span>
                        <strong style={{ color: 'var(--white)' }}>{delivery.destinatario}</strong>
                      </span>
                      {delivery.tipoEntrega === 'RETIRADA' ? (
                        <span>Retirada na Loja Física GuinaCar (São Paulo/SP)</span>
                      ) : (
                        <>
                          <span>
                            {delivery.logradouro}, {delivery.numero}
                            {delivery.complemento ? ` — ${delivery.complemento}` : ''}
                          </span>
                          <span>
                            {delivery.bairro} — {delivery.cidade}/{delivery.estado}
                          </span>
                          <span className="mono">CEP: {delivery.cep}</span>
                        </>
                      )}
                      <span style={{ color: '#4ade80', marginTop: 4 }}>{shippingEta}</span>
                    </div>

                    <div className="review-box">
                      <div className="review-box-head">
                        <strong>Pagamento</strong>
                        <button
                          type="button"
                          className="review-edit-link"
                          onClick={() => setStep(2)}
                        >
                          Alterar
                        </button>
                      </div>
                      {payment.formaPagamento === 'PIX' && (
                        <>
                          <span>
                            <strong style={{ color: 'var(--white)' }}>PIX (5% de desconto)</strong>
                          </span>
                          <span>Total à vista: {formatCurrency(finalTotal)}</span>
                          <span style={{ color: '#4ade80' }}>
                            Economia de {formatCurrency(pixDiscount)}
                          </span>
                        </>
                      )}
                      {payment.formaPagamento === 'CARTAO_CREDITO' && (
                        <>
                          <span>
                            <strong style={{ color: 'var(--white)' }}>
                              {cardBrand} final {payment.numeroCartao.replace(/\D/g, '').slice(-4)}
                            </strong>
                          </span>
                          <span>Titular: {payment.nomeTitular}</span>
                          <span>
                            {payment.parcelas}x de {formatCurrency(finalTotal / payment.parcelas)}{' '}
                            sem juros
                          </span>
                        </>
                      )}
                      {payment.formaPagamento === 'BOLETO' && (
                        <>
                          <span>
                            <strong style={{ color: 'var(--white)' }}>Boleto Bancário</strong>
                          </span>
                          <span>À vista: {formatCurrency(finalTotal)}</span>
                          <span>Vencimento em 3 dias úteis</span>
                        </>
                      )}
                    </div>
                  </div>

                  <div className="checkout-nav-actions">
                    <button type="button" className="btn btn-outline" onClick={() => setStep(2)}>
                      <FaArrowLeft /> Voltar para Pagamento
                    </button>
                    <button
                      type="button"
                      className="btn btn-primary"
                      disabled={Boolean(processingText)}
                      onClick={handlePlaceOrder}
                    >
                      <FaLock /> Finalizar e Pagar — {formatCurrency(finalTotal)}
                    </button>
                  </div>
                </div>
              )}
            </div>

            {/* Resumo Lateral Persistente */}
            <aside className="checkout-summary panel">
              <h3>Resumo da compra</h3>

              <div className="checkout-summary-items">
                {items.map((item) => (
                  <div key={item.id} className="checkout-summary-item">
                    <img src={item.image} alt={item.name} />
                    <div>
                      <span className="checkout-summary-item-name">{item.name}</span>
                      <span className="checkout-summary-item-qty mono">Qtd: {item.quantity}</span>
                    </div>
                    <span className="mono">{formatCurrency(item.price * item.quantity)}</span>
                  </div>
                ))}
              </div>

              <div className="checkout-summary-rows">
                <div className="checkout-summary-row">
                  <span>Subtotal</span>
                  <span className="mono">{formatCurrency(subtotal)}</span>
                </div>
                <div className="checkout-summary-row">
                  <span>Frete ({delivery.tipoEntrega.toLowerCase()})</span>
                  <span className="mono">
                    {shippingCost === 0 ? 'Grátis' : formatCurrency(shippingCost)}
                  </span>
                </div>
                {pixDiscount > 0 && (
                  <div className="checkout-summary-row is-discount">
                    <span>Desconto PIX (5%)</span>
                    <span className="mono">- {formatCurrency(pixDiscount)}</span>
                  </div>
                )}
              </div>

              <div className="checkout-summary-total">
                <span>Total</span>
                <strong className="mono">{formatCurrency(finalTotal)}</strong>
              </div>

              {payment.formaPagamento === 'CARTAO_CREDITO' && (
                <span className="checkout-installment-hint mono">
                  em {payment.parcelas}x de {formatCurrency(finalTotal / payment.parcelas)} sem juros
                </span>
              )}

              <div className="checkout-trust">
                <div>
                  <FaShieldAlt />
                  <span>Compra Garantida GuinaCar com garantia de fábrica</span>
                </div>
                <div>
                  <FaLock />
                  <span>Dados protegidos com criptografia de ponta a ponta</span>
                </div>
              </div>
            </aside>
          </div>
        )}
      </div>
    </div>
  )
}
