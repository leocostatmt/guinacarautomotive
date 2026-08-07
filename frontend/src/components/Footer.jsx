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
            <a href="https://www.facebook.com/guinacarautomotive/" target="_blank" rel="noreferrer" aria-label="Facebook"><FaFacebookF /></a>
            <a href="https://instagram.com/autoguinacaroficial" target="_blank" rel="noreferrer" aria-label="Instagram"><FaInstagram /></a>
            <a href="https://wa.me/5511998158461" target="_blank" rel="noreferrer" aria-label="WhatsApp"><FaWhatsapp /></a>
            <a href="https://www.youtube.com/@121garage" target="_blank" rel="noreferrer" aria-label="YouTube"><FaYoutube /></a>
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
            <li><FaPhoneAlt /> (11) 99820-9388</li>
            <li><FaWhatsapp /> (11) 99815-8461</li>
            <li><FaEnvelope /> guinacarautomotive@guinacar.com.br</li>
            <li><FaMapMarkerAlt /> Rua Iguape, 7, Jardim Maria Helena - Barueri/SP</li>
          </ul>
        </div>

        <div className="footer-col">
          <h4>Sobre Nós</h4>
          <p className="footer-about">
            Desde a garagem até a estrada:
          </p>
          <p className="footer-about">
            A Guinacar Autopeças nasceu da paixão por carros e da vontade de oferecer peças automotivas de qualidade para todos os motoristas do Brasil.
          </p>
          <p className="footer-about"><strong>Missão:</strong> Manter o Brasil rodando com segurança.</p>
          <p className="footer-about"><strong>Visão:</strong> Ser a autopeças online mais confiável do país.</p>
          <p className="footer-about"><strong>Valores:</strong> Qualidade, transparência e agilidade.</p>
        </div>
      </div>

      {/* <div className="footer-stripe stripe-divider" /> */}

      <div className="container-footer-bottom">
        <span>© {year} Guinacar Autopeças. Todos os direitos reservados.</span>
        <span className="mono">CNPJ 24.642.205/0001-39</span>
      </div>
    </footer>
  )
}
