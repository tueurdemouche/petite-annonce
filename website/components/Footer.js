import Link from 'next/link'
import { FaFacebook, FaTwitter, FaInstagram, FaLinkedin, FaApple, FaGooglePlay } from 'react-icons/fa'

export default function Footer() {
  return (
    <footer className="footer">
      <div className="footer-content">
        <div className="footer-section">
          <h4>La Petite Annonce</h4>
          <ul>
            <li><Link href="/about">À propos</Link></li>
            <li><Link href="/faq">FAQ / Aide</Link></li>
            <li><Link href="/tarifs">Nos tarifs</Link></li>
            <li><Link href="/contact">Contact</Link></li>
          </ul>
        </div>
        
        <div className="footer-section">
          <h4>Catégories</h4>
          <ul>
            <li><Link href="/search?category=auto_moto&sub_category=auto">Voitures</Link></li>
            <li><Link href="/search?category=auto_moto&sub_category=moto_homologuee">Motos</Link></li>
            <li><Link href="/search?category=immobilier&sub_category=location">Location</Link></li>
            <li><Link href="/search?category=immobilier&sub_category=vente">Immobilier vente</Link></li>
          </ul>
        </div>
        
        <div className="footer-section">
          <h4>Informations légales</h4>
          <ul>
            <li><Link href="/legal/privacy">Politique de confidentialité</Link></li>
            <li><Link href="/legal/terms">Conditions d'utilisation</Link></li>
            <li><Link href="/legal/cgu">CGU</Link></li>
            <li><Link href="/legal/cookies">Gestion des cookies</Link></li>
          </ul>
        </div>
        
        <div className="footer-section">
          <h4>Téléchargez l'app</h4>
          <p style={{ color: '#94a3b8', marginBottom: '15px', fontSize: '14px' }}>
            Disponible gratuitement
          </p>
          <div style={{ display: 'flex', flexDirection: 'column', gap: '10px' }}>
            <a href="#" className="app-store-btn" style={{ justifyContent: 'center' }}>
              <FaApple /> App Store
            </a>
            <a href="#" className="app-store-btn" style={{ justifyContent: 'center' }}>
              <FaGooglePlay /> Google Play
            </a>
          </div>
        </div>
      </div>
      
      <div className="footer-bottom">
        <p>© 2026 La Petite Annonce - Tous droits réservés | lapetiteannonce.fr</p>
        <div className="social-links">
          <a href="#" aria-label="Facebook"><FaFacebook /></a>
          <a href="#" aria-label="Twitter"><FaTwitter /></a>
          <a href="#" aria-label="Instagram"><FaInstagram /></a>
          <a href="#" aria-label="LinkedIn"><FaLinkedin /></a>
        </div>
      </div>
    </footer>
  )
}