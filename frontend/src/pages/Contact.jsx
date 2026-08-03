import { useState } from 'react'
import { FaPhoneAlt, FaWhatsapp, FaEnvelope, FaMapMarkerAlt } from 'react-icons/fa'
import toast from 'react-hot-toast'
import Breadcrumb from '../components/Breadcrumb'
import './Contact.css'

const faqs = [
  { q: 'Qual o prazo de entrega?', a: 'O prazo médio é de 2 a 7 dias úteis a partir da confirmação do pagamento, dependendo da sua região.' },
  { q: 'As peças possuem garantia?', a: 'Sim, todas as peças possuem garantia de no mínimo 3 meses' },
  { q: 'Posso trocar uma peça comprada?', a: 'Sim, você tem até 7 dias corridos após o recebimento para solicitar a troca.' },
  { q: 'Vocês entregam em todo o Brasil?', a: 'Sim, realizamos entregas para todos os estados brasileiros.' },
]

export default function Contact() {
  const [form, setForm] = useState({ nome: '', email: '', mensagem: '' })
  const [openFaq, setOpenFaq] = useState(null)

  const handleChange = (e) => setForm((f) => ({ ...f, [e.target.name]: e.target.value }))

  const handleSubmit = (e) => {
    e.preventDefault()
    if (!form.nome || !form.email || !form.mensagem) {
      toast.error('Preencha todos os campos para enviar sua mensagem.')
      return
    }
    toast.success('Mensagem enviada! Nossa equipe responderá em breve.')
    setForm({ nome: '', email: '', mensagem: '' })
  }

  return (
    <div className="page">
      <div className="container page-section">
        <Breadcrumb items={[{ label: 'Contato' }]} />
        <span className="eyebrow">Fale conosco</span>
        <h1 className="section-heading">Central de Ajuda</h1>
        <p className="section-sub">
          Dúvidas, sugestões ou problemas com seu pedido? Nossa equipe está pronta para ajudar.
        </p>

        <div className="contact-layout">
          <div className="contact-info panel">
            <h3>Informações de contato</h3>
            <ul>
              <li><FaPhoneAlt /> (11) 99820-9388</li>
              <li><FaWhatsapp /> (11) 99815-8461</li>
              <li><FaEnvelope /> guinacarautomotive@guinacar.com.br</li>
              <li><FaMapMarkerAlt /> Rua Iguape, 7, Jardim Maria Helena - Barueri/SP</li>
            </ul>
          </div>

          <form className="contact-form panel" onSubmit={handleSubmit}>
            <h3>Envie uma mensagem</h3>
            <div className="form-field">
              <label htmlFor="nome">Nome</label>
              <input id="nome" name="nome" value={form.nome} onChange={handleChange} placeholder="Seu nome" />
            </div>
            <div className="form-field">
              <label htmlFor="email">E-mail</label>
              <input id="email" name="email" type="email" value={form.email} onChange={handleChange} placeholder="voce@email.com" />
            </div>
            <div className="form-field">
              <label htmlFor="mensagem">Mensagem</label>
              <textarea id="mensagem" name="mensagem" rows="4" value={form.mensagem} onChange={handleChange} placeholder="Como podemos ajudar?" />
            </div>
            <button type="submit" className="btn btn-primary btn-block">Enviar mensagem</button>
          </form>
        </div>

        <div className="faq-section">
          <h2 className="section-heading">Perguntas Frequentes</h2>
          <div className="faq-list">
            {faqs.map((item, i) => (
              <div key={item.q} className={`faq-item panel ${openFaq === i ? 'is-open' : ''}`}>
                <button className="faq-question" onClick={() => setOpenFaq(openFaq === i ? null : i)}>
                  {item.q}
                  <span>{openFaq === i ? '−' : '+'}</span>
                </button>
                {openFaq === i && <p className="faq-answer">{item.a}</p>}
              </div>
            ))}
          </div>
        </div>
      </div>
    </div>
  )
}
