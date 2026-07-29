import { Link } from 'react-router-dom'
import { FaFacebookF, FaInstagram, FaWhatsapp, FaYoutube, FaPhoneAlt, FaEnvelope, FaMapMarkerAlt } from 'react-icons/fa'
import Logo from './Logo'
import './Footer.css'

export default function Footer() {
  const year = new Date().getFullYear()

  return (
    <footer className="footer">
      <div className="container footer-grid">
        <div className="footer-brand">
          <Logo />
          <p>
            Peças automotivas originais para as principais marcas do mercado, com entrega
            rápida e atendimento especializado em todo o Brasil.
          </p>
          <div className="footer-social">
            <a href="https://facebook.com" target="_blank" rel="noreferrer" aria-label="Facebook"><FaFacebookF /></a>
            <a href="https://instagram.com" target="_blank" rel="noreferrer" aria-label="Instagram"><FaInstagram /></a>
            <a href="https://wa.me/5511999999999" target="_blank" rel="noreferrer" aria-label="WhatsApp"><FaWhatsapp /></a>
            <a href="https://youtube.com" target="_blank" rel="noreferrer" aria-label="YouTube"><FaYoutube /></a>
          </div>
        </div>

        <div className="footer-col">
          <h4>Suporte</h4>
          <ul>
            <li><Link to="/contato">Central de Ajuda</Link></li>
            <li><Link to="/contato">Perguntas Frequentes</Link></li>
            <li><Link to="/contato">Política de Troca</Link></li>
          </ul>
        </div>

        <div className="footer-col">
          <h4>Contato</h4>
          <ul className="footer-contact">
            <li><FaPhoneAlt /> (11) 4002-8922</li>
            <li><FaWhatsapp /> (11) 99999-9999</li>
            <li><FaEnvelope /> contato@guinacar.com.br</li>
            <li><FaMapMarkerAlt /> Av. das Autopeças, 1234 — São Paulo/SP</li>
          </ul>
        </div>

        <div className="footer-col">
          <h4>Sobre Nós</h4>
          <p className="footer-about">
            Desde a garagem até a estrada: a GuinaCar nasceu da paixão por carros e da vontade
            de oferecer peças de confiança a um preço justo.
          </p>
          <p className="footer-about"><strong>Missão:</strong> manter o Brasil rodando com segurança.</p>
          <p className="footer-about"><strong>Visão:</strong> ser a autopeças online mais confiável do país.</p>
          <p className="footer-about"><strong>Valores:</strong> qualidade, transparência e agilidade.</p>
        </div>
      </div>

      <div className="footer-stripe stripe-divider" />

      <div className="container footer-bottom">
        <span>© {year} GuinaCar Autopeças. Todos os direitos reservados.</span>
        <span className="mono">CNPJ 00.000.000/0001-00</span>
      </div>
    </footer>
  )
}
