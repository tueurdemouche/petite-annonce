'use client'
import { useState } from 'react'
import Header from '../../components/Header'
import Footer from '../../components/Footer'
import { FaChevronDown, FaChevronUp, FaSearch } from 'react-icons/fa'

export default function FAQPage() {
  const [openIndex, setOpenIndex] = useState(null)
  const [searchQuery, setSearchQuery] = useState('')

  const faqCategories = [
    {
      category: 'Publication d\'annonces',
      questions: [
        {
          q: 'Comment publier une annonce ?',
          a: 'Créez un compte gratuit, cliquez sur "Déposer une annonce", choisissez votre catégorie, ajoutez vos photos et votre description, puis publiez. Votre annonce sera visible après validation par notre équipe.'
        },
        {
          q: 'Combien coûte la publication d\'une annonce ?',
          a: 'La publication d\'annonces est 100% gratuite ! Vous pouvez publier autant d\'annonces que vous le souhaitez sans aucun frais.'
        },
        {
          q: 'Combien de photos puis-je ajouter ?',
          a: '5 photos sont incluses gratuitement par annonce. Vous pouvez ajouter 5 photos supplémentaires (total 10) pour seulement 2,99€.'
        },
        {
          q: 'Combien de temps mon annonce reste-t-elle visible ?',
          a: 'Votre annonce reste visible pendant 30 jours. Vous pouvez la renouveler gratuitement une fois par mois.'
        },
        {
          q: 'Pourquoi mon annonce est-elle en attente de validation ?',
          a: 'Toutes les annonces sont vérifiées manuellement par notre équipe pour garantir la qualité et la sécurité. La validation prend généralement moins de 24h.'
        }
      ]
    },
    {
      category: 'Compte utilisateur',
      questions: [
        {
          q: 'Comment créer un compte ?',
          a: 'Cliquez sur "Se connecter" puis "Créer un compte". Remplissez le formulaire avec vos informations. Vous devez avoir au moins 18 ans pour vous inscrire.'
        },
        {
          q: 'Comment vérifier mon identité ?',
          a: 'Dans votre profil, accédez à la section "Vérification d\'identité". Envoyez une photo recto/verso de votre pièce d\'identité et un selfie. Notre équipe validera votre demande sous 24-48h.'
        },
        {
          q: 'Comment supprimer mon compte ?',
          a: 'Rendez-vous dans Paramètres > Supprimer mon compte. Vous pouvez également nous contacter par email pour demander la suppression de vos données.'
        },
        {
          q: 'J\'ai oublié mon mot de passe',
          a: 'Cliquez sur "Se connecter" puis "Mot de passe oublié". Entrez votre email pour recevoir un lien de réinitialisation.'
        }
      ]
    },
    {
      category: 'Paiements et options',
      questions: [
        {
          q: 'Comment booster mon annonce ?',
          a: 'Depuis votre annonce, cliquez sur "Booster". Choisissez la durée (14 jours à 9,99€ ou 30 jours à 19,99€) et payez. Votre annonce apparaîtra en tête de liste avec le badge "À la une".'
        },
        {
          q: 'Quels moyens de paiement sont acceptés ?',
          a: 'Nous acceptons les cartes bancaires (Visa, Mastercard), PayPal et les crypto-monnaies (Bitcoin, Ethereum, USDT).'
        },
        {
          q: 'Puis-je être remboursé ?',
          a: 'Les options (boost, photos supplémentaires) ne sont pas remboursables une fois activées. Contactez-nous en cas de problème technique.'
        }
      ]
    },
    {
      category: 'Sécurité',
      questions: [
        {
          q: 'Comment signaler une annonce suspecte ?',
          a: 'Cliquez sur le bouton "Signaler" présent sur chaque annonce. Décrivez le problème et notre équipe examinera le signalement sous 24h.'
        },
        {
          q: 'Mes données sont-elles protégées ?',
          a: 'Oui, nous respectons le RGPD. Vos données sont chiffrées et ne sont jamais vendues à des tiers. Consultez notre politique de confidentialité pour plus de détails.'
        },
        {
          q: 'Comment éviter les arnaques ?',
          a: 'Ne payez jamais à l\'avance, privilégiez les rencontres en personne dans des lieux publics, méfiez-vous des offres trop belles pour être vraies, et utilisez notre messagerie intégrée.'
        }
      ]
    },
    {
      category: 'Application mobile',
      questions: [
        {
          q: 'Où télécharger l\'application ?',
          a: 'L\'application est disponible gratuitement sur l\'App Store (iOS) et Google Play (Android). Recherchez "La Petite Annonce" ou "Petite Annonce FR".'
        },
        {
          q: 'L\'application est-elle gratuite ?',
          a: 'Oui, l\'application est 100% gratuite au téléchargement et à l\'utilisation. Les mêmes options payantes que sur le site sont disponibles.'
        },
        {
          q: 'Puis-je utiliser le même compte sur l\'app et le site ?',
          a: 'Oui ! Votre compte est synchronisé entre l\'application mobile et le site web. Vos annonces, messages et favoris sont accessibles partout.'
        }
      ]
    }
  ]

  const filteredCategories = faqCategories.map(cat => ({
    ...cat,
    questions: cat.questions.filter(
      q => q.q.toLowerCase().includes(searchQuery.toLowerCase()) ||
           q.a.toLowerCase().includes(searchQuery.toLowerCase())
    )
  })).filter(cat => cat.questions.length > 0)

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
            <h1 style={{ fontSize: '2.5rem', marginBottom: '15px' }}>Questions fréquentes</h1>
            <p style={{ fontSize: '1.2rem', opacity: 0.9, marginBottom: '30px' }}>
              Trouvez rapidement les réponses à vos questions
            </p>
            
            {/* Search */}
            <div style={{
              maxWidth: '500px',
              margin: '0 auto',
              position: 'relative'
            }}>
              <input
                type="text"
                placeholder="Rechercher une question..."
                value={searchQuery}
                onChange={(e) => setSearchQuery(e.target.value)}
                style={{
                  width: '100%',
                  padding: '15px 20px 15px 50px',
                  borderRadius: '8px',
                  border: 'none',
                  fontSize: '16px'
                }}
              />
              <FaSearch style={{
                position: 'absolute',
                left: '20px',
                top: '50%',
                transform: 'translateY(-50%)',
                color: '#64748b'
              }} />
            </div>
          </section>

          {/* FAQ Accordion */}
          {filteredCategories.map((category, catIdx) => (
            <section key={catIdx} style={{ marginBottom: '30px' }}>
              <h2 style={{
                color: '#2563EB',
                fontSize: '1.4rem',
                marginBottom: '15px',
                paddingLeft: '15px',
                borderLeft: '4px solid #2563EB'
              }}>
                {category.category}
              </h2>
              
              <div style={{ display: 'flex', flexDirection: 'column', gap: '10px' }}>
                {category.questions.map((item, idx) => {
                  const globalIdx = `${catIdx}-${idx}`
                  const isOpen = openIndex === globalIdx
                  
                  return (
                    <div key={idx} style={{
                      background: 'white',
                      borderRadius: '12px',
                      overflow: 'hidden',
                      boxShadow: '0 2px 4px rgba(0,0,0,0.05)'
                    }}>
                      <button
                        onClick={() => setOpenIndex(isOpen ? null : globalIdx)}
                        style={{
                          width: '100%',
                          padding: '20px',
                          display: 'flex',
                          justifyContent: 'space-between',
                          alignItems: 'center',
                          background: 'none',
                          border: 'none',
                          cursor: 'pointer',
                          textAlign: 'left'
                        }}
                      >
                        <span style={{ fontWeight: '600', color: '#1e293b', fontSize: '16px' }}>
                          {item.q}
                        </span>
                        {isOpen ? <FaChevronUp color="#2563EB" /> : <FaChevronDown color="#64748b" />}
                      </button>
                      
                      {isOpen && (
                        <div style={{
                          padding: '0 20px 20px',
                          color: '#64748b',
                          lineHeight: '1.7'
                        }}>
                          {item.a}
                        </div>
                      )}
                    </div>
                  )
                })}
              </div>
            </section>
          ))}

          {/* Contact */}
          <section style={{
            background: 'linear-gradient(135deg, #f0f9ff 0%, #e0f2fe 100%)',
            padding: '40px',
            borderRadius: '16px',
            textAlign: 'center'
          }}>
            <h2 style={{ color: '#2563EB', marginBottom: '15px' }}>Vous n'avez pas trouvé votre réponse ?</h2>
            <p style={{ color: '#64748b', marginBottom: '20px' }}>
              Notre équipe support est là pour vous aider
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
              Contactez-nous
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