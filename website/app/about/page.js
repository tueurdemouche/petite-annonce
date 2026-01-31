import Header from '../../components/Header'
import Footer from '../../components/Footer'
import { FaUsers, FaShieldAlt, FaHeart, FaRocket, FaCheckCircle } from 'react-icons/fa'

export const metadata = {
  title: 'À propos - La Petite Annonce',
  description: 'Découvrez La Petite Annonce, votre plateforme de petites annonces gratuites en France.'
}

export default function AboutPage() {
  return (
    <>
      <Header />
      
      <div className="page-container">
        <div className="sidebar-left">
          <div className="ad-banner ad-banner-tall">
            <span>Espace<br/>Publicitaire<br/>160x600</span>
          </div>
        </div>

        <main className="main-content">
          <div className="ad-banner ad-banner-wide">
            <span>Espace Publicitaire - 728x90</span>
          </div>

          {/* Hero */}
          <section style={{
            background: 'linear-gradient(135deg, #2563EB 0%, #1d4ed8 100%)',
            color: 'white',
            padding: '60px 40px',
            borderRadius: '16px',
            textAlign: 'center',
            marginBottom: '40px'
          }}>
            <h1 style={{ fontSize: '2.5rem', marginBottom: '15px' }}>À propos de La Petite Annonce</h1>
            <p style={{ fontSize: '1.2rem', opacity: 0.9, maxWidth: '600px', margin: '0 auto' }}>
              La plateforme de petites annonces 100% gratuite, simple et sécurisée pour tous les Français.
            </p>
          </section>

          {/* Notre mission */}
          <section style={{
            background: 'white',
            padding: '40px',
            borderRadius: '16px',
            marginBottom: '30px',
            boxShadow: '0 4px 6px rgba(0,0,0,0.05)'
          }}>
            <h2 style={{ color: '#2563EB', marginBottom: '20px', fontSize: '1.8rem' }}>Notre mission</h2>
            <p style={{ color: '#64748b', fontSize: '1.1rem', lineHeight: '1.8' }}>
              La Petite Annonce est née d'une idée simple : permettre à chacun de vendre et d'acheter 
              facilement, gratuitement et en toute sécurité. Que vous souhaitiez vendre votre voiture, 
              trouver un appartement ou dénicher la moto de vos rêves, notre plateforme est là pour vous.
            </p>
          </section>

          {/* Nos valeurs */}
          <section style={{
            display: 'grid',
            gridTemplateColumns: 'repeat(auto-fit, minmax(250px, 1fr))',
            gap: '20px',
            marginBottom: '30px'
          }}>
            {[
              { icon: <FaHeart size={30} />, title: 'Gratuité', desc: 'Publication d\'annonces 100% gratuite, sans frais cachés' },
              { icon: <FaShieldAlt size={30} />, title: 'Sécurité', desc: 'Vérification d\'identité, messagerie sécurisée' },
              { icon: <FaUsers size={30} />, title: 'Communauté', desc: 'Des milliers d\'utilisateurs vérifiés partout en France' },
              { icon: <FaRocket size={30} />, title: 'Simplicité', desc: 'Interface intuitive, publication en 2 minutes' }
            ].map((item, idx) => (
              <div key={idx} style={{
                background: 'white',
                padding: '30px',
                borderRadius: '16px',
                textAlign: 'center',
                boxShadow: '0 4px 6px rgba(0,0,0,0.05)'
              }}>
                <div style={{ color: '#2563EB', marginBottom: '15px' }}>{item.icon}</div>
                <h3 style={{ marginBottom: '10px', color: '#1e293b' }}>{item.title}</h3>
                <p style={{ color: '#64748b', fontSize: '14px' }}>{item.desc}</p>
              </div>
            ))}
          </section>

          {/* Pourquoi nous choisir */}
          <section style={{
            background: 'white',
            padding: '40px',
            borderRadius: '16px',
            marginBottom: '30px',
            boxShadow: '0 4px 6px rgba(0,0,0,0.05)'
          }}>
            <h2 style={{ color: '#2563EB', marginBottom: '25px', fontSize: '1.8rem' }}>Pourquoi choisir La Petite Annonce ?</h2>
            <div style={{ display: 'grid', gap: '15px' }}>
              {[
                'Publication d\'annonces 100% gratuite',
                '5 photos incluses par annonce',
                'Messagerie intégrée sécurisée',
                'Vérification d\'identité des utilisateurs',
                'Application mobile gratuite (iOS & Android)',
                'Support client réactif',
                'Annonces visibles pendant 30 jours',
                'Options de boost pour plus de visibilité'
              ].map((item, idx) => (
                <div key={idx} style={{ display: 'flex', alignItems: 'center', gap: '12px' }}>
                  <FaCheckCircle style={{ color: '#22c55e', flexShrink: 0 }} />
                  <span style={{ color: '#475569' }}>{item}</span>
                </div>
              ))}
            </div>
          </section>

          {/* Contact */}
          <section style={{
            background: 'linear-gradient(135deg, #f0f9ff 0%, #e0f2fe 100%)',
            padding: '40px',
            borderRadius: '16px',
            textAlign: 'center'
          }}>
            <h2 style={{ color: '#2563EB', marginBottom: '15px' }}>Une question ?</h2>
            <p style={{ color: '#64748b', marginBottom: '20px' }}>
              Notre équipe est à votre disposition pour vous aider
            </p>
            <a href="mailto:contact@lapetiteannonce.fr" style={{
              display: 'inline-block',
              background: '#2563EB',
              color: 'white',
              padding: '15px 30px',
              borderRadius: '8px',
              fontWeight: '600',
              textDecoration: 'none'
            }}>
              Nous contacter
            </a>
          </section>
        </main>

        <div className="sidebar-right">
          <div className="ad-banner ad-banner-tall">
            <span>Espace<br/>Publicitaire<br/>160x600</span>
          </div>
        </div>
      </div>

      <Footer />
    </>
  )
}