import Header from '../../components/Header'
import Footer from '../../components/Footer'
import { FaCheck, FaStar, FaRocket, FaCamera, FaCrown } from 'react-icons/fa'

export const metadata = {
  title: 'Tarifs - La Petite Annonce',
  description: 'Découvrez nos tarifs et options pour booster vos annonces sur La Petite Annonce.'
}

export default function TarifsPage() {
  const plans = [
    {
      name: 'Gratuit',
      price: '0€',
      period: 'pour toujours',
      icon: <FaStar size={30} />,
      color: '#22c55e',
      features: [
        'Publication d\'annonces illimitée',
        '5 photos par annonce',
        'Visible pendant 30 jours',
        'Messagerie intégrée',
        'Renouvellement gratuit mensuel',
        'Accès à l\'application mobile'
      ],
      cta: 'Commencer gratuitement',
      popular: true
    },
    {
      name: 'Photos +',
      price: '3,99€',
      period: 'par annonce',
      icon: <FaCamera size={30} />,
      color: '#3b82f6',
      features: [
        '+5 photos supplémentaires',
        'Total de 10 photos',
        'Meilleure visibilité',
        'Plus de détails pour les acheteurs',
        'Paiement unique',
        'Valable 30 jours'
      ],
      cta: 'Ajouter des photos',
      popular: false
    },
    {
      name: 'Boost 14 jours',
      price: '19,99€',
      period: 'pendant 14 jours',
      icon: <FaRocket size={30} />,
      color: '#f59e0b',
      features: [
        'Annonce en tête de liste',
        'Badge "À la une"',
        'Visibilité x5',
        'Plus de contacts',
        'Statistiques détaillées',
        'Support prioritaire'
      ],
      cta: 'Booster mon annonce',
      popular: false
    },
    {
      name: 'Boost 30 jours',
      price: '24,99€',
      period: 'pendant 30 jours',
      icon: <FaCrown size={30} />,
      color: '#8b5cf6',
      features: [
        'Tous les avantages Boost 14j',
        'Durée doublée',
        'Visibilité maximale',
        'Position premium',
        'Meilleur rapport qualité/prix',
        'Économisez 25%'
      ],
      cta: 'Boost maximum',
      popular: false
    }
  ]

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
            <h1 style={{ fontSize: '2.5rem', marginBottom: '15px' }}>Nos tarifs</h1>
            <p style={{ fontSize: '1.2rem', opacity: 0.9 }}>
              Publication gratuite, options payantes pour plus de visibilité
            </p>
            <div style={{ marginTop: '20px' }}>
              <span style={{
                background: '#22c55e',
                color: 'white',
                padding: '8px 20px',
                borderRadius: '20px',
                fontSize: '14px',
                fontWeight: '600'
              }}>
                ✓ Annonces 100% gratuites
              </span>
            </div>
          </section>

          {/* Pricing Cards */}
          <section style={{
            display: 'grid',
            gridTemplateColumns: 'repeat(auto-fit, minmax(250px, 1fr))',
            gap: '20px',
            marginBottom: '40px'
          }}>
            {plans.map((plan, idx) => (
              <div key={idx} style={{
                background: 'white',
                borderRadius: '16px',
                padding: '30px',
                boxShadow: '0 4px 6px rgba(0,0,0,0.05)',
                border: plan.popular ? '2px solid #22c55e' : '1px solid #e2e8f0',
                position: 'relative'
              }}>
                {plan.popular && (
                  <div style={{
                    position: 'absolute',
                    top: '-12px',
                    left: '50%',
                    transform: 'translateX(-50%)',
                    background: '#22c55e',
                    color: 'white',
                    padding: '5px 15px',
                    borderRadius: '20px',
                    fontSize: '12px',
                    fontWeight: '600'
                  }}>
                    Recommandé
                  </div>
                )}
                
                <div style={{ textAlign: 'center', marginBottom: '25px' }}>
                  <div style={{ color: plan.color, marginBottom: '15px' }}>{plan.icon}</div>
                  <h3 style={{ fontSize: '1.3rem', marginBottom: '10px' }}>{plan.name}</h3>
                  <div style={{ fontSize: '2.5rem', fontWeight: '700', color: '#1e293b' }}>
                    {plan.price}
                  </div>
                  <div style={{ color: '#64748b', fontSize: '14px' }}>{plan.period}</div>
                </div>
                
                <ul style={{ listStyle: 'none', marginBottom: '25px' }}>
                  {plan.features.map((feature, fidx) => (
                    <li key={fidx} style={{
                      display: 'flex',
                      alignItems: 'center',
                      gap: '10px',
                      padding: '8px 0',
                      borderBottom: '1px solid #f1f5f9'
                    }}>
                      <FaCheck style={{ color: '#22c55e', flexShrink: 0 }} size={14} />
                      <span style={{ color: '#475569', fontSize: '14px' }}>{feature}</span>
                    </li>
                  ))}
                </ul>
                
                <button style={{
                  width: '100%',
                  padding: '15px',
                  background: plan.popular ? '#22c55e' : plan.color,
                  color: 'white',
                  border: 'none',
                  borderRadius: '8px',
                  fontSize: '16px',
                  fontWeight: '600',
                  cursor: 'pointer'
                }}>
                  {plan.cta}
                </button>
              </div>
            ))}
          </section>

          {/* FAQ rapide */}
          <section style={{
            background: '#f8fafc',
            padding: '40px',
            borderRadius: '16px'
          }}>
            <h2 style={{ color: '#2563EB', marginBottom: '25px', textAlign: 'center' }}>Questions sur les tarifs</h2>
            <div style={{ display: 'grid', gap: '15px', maxWidth: '700px', margin: '0 auto' }}>
              {[
                { q: 'Les annonces sont-elles vraiment gratuites ?', a: 'Oui ! La publication d\'annonces est 100% gratuite, sans limite de nombre.' },
                { q: 'Quand dois-je payer ?', a: 'Uniquement si vous souhaitez ajouter des photos supplémentaires ou booster votre annonce.' },
                { q: 'Quels moyens de paiement acceptez-vous ?', a: 'Carte bancaire, PayPal et crypto-monnaies.' }
              ].map((item, idx) => (
                <div key={idx} style={{
                  background: 'white',
                  padding: '20px',
                  borderRadius: '12px'
                }}>
                  <h4 style={{ color: '#1e293b', marginBottom: '8px' }}>{item.q}</h4>
                  <p style={{ color: '#64748b', margin: 0, fontSize: '14px' }}>{item.a}</p>
                </div>
              ))}
            </div>
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