'use client'
import { useState, useEffect } from 'react'
import { useParams, useRouter } from 'next/navigation'
import Link from 'next/link'
import Header from '../../../components/Header'
import Footer from '../../../components/Footer'

export default function AnnoncePage() {
  const params = useParams()
  const router = useRouter()
  const [listing, setListing] = useState(null)
  const [loading, setLoading] = useState(true)
  const [error, setError] = useState('')
  const [currentPhotoIndex, setCurrentPhotoIndex] = useState(0)
  const [showPhone, setShowPhone] = useState(false)
  const [user, setUser] = useState(null)
  const [message, setMessage] = useState('')
  const [sendingMessage, setSendingMessage] = useState(false)
  const [messageSent, setMessageSent] = useState(false)

  useEffect(() => {
    const savedUser = localStorage.getItem('user')
    if (savedUser) {
      setUser(JSON.parse(savedUser))
    }
  }, [])

  useEffect(() => {
    if (params.id) {
      fetchListing()
    }
  }, [params.id])

  const fetchListing = async () => {
    try {
      const token = localStorage.getItem('token')
      const headers = token ? { 'Authorization': `Bearer ${token}` } : {}
      
      let res = await fetch(`/api/listings/${params.id}`, { headers })
      
      if (!res.ok) {
        throw new Error('Annonce non trouvee')
      }
      
      const data = await res.json()
      setListing(data)
    } catch (err) {
      setError(err.message || 'Erreur lors du chargement')
    } finally {
      setLoading(false)
    }
  }

  const sendMessage = async (e) => {
    e.preventDefault()
    if (!message.trim() || !user) return

    setSendingMessage(true)
    try {
      const token = localStorage.getItem('token')
      const res = await fetch('/api/messages', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
          'Authorization': `Bearer ${token}`
        },
        body: JSON.stringify({
          listing_id: params.id,
          content: message.trim()
        })
      })

      if (res.ok) {
        setMessageSent(true)
        setMessage('')
      } else {
        const data = await res.json()
        alert(data.detail || 'Erreur lors de l\'envoi')
      }
    } catch (err) {
      alert('Erreur de connexion')
    } finally {
      setSendingMessage(false)
    }
  }

  const formatPrice = (price) => {
    return new Intl.NumberFormat('fr-FR', { style: 'currency', currency: 'EUR', maximumFractionDigits: 0 }).format(price)
  }

  const formatDate = (dateString) => {
    const date = new Date(dateString)
    return date.toLocaleDateString('fr-FR', { day: 'numeric', month: 'long', year: 'numeric' })
  }

  const getCategoryLabel = (category, subCategory) => {
    const categories = { 'auto': 'Auto', 'moto': 'Moto', 'quad': 'Quad', 'immobilier': 'Immobilier' }
    const subCategories = {
      'voiture': 'Voiture', 'utilitaire': 'Utilitaire', 'camion': 'Camion',
      'moto_homologuee': 'Moto homologuee', 'moto_non_homologuee': 'Moto non homologuee', 'scooter_homologue': 'Scooter homologue',
      'quad_homologue': 'Quad homologue', 'quad_non_homologue': 'Quad non homologue',
      'vente_maison': 'Vente maison', 'vente_appartement': 'Vente appartement',
      'location_maison': 'Location maison', 'location_appartement': 'Location appartement',
      'terrain': 'Terrain', 'local_commercial': 'Local commercial', 'parking': 'Parking / Garage'
    }
    return `${categories[category] || category} > ${subCategories[subCategory] || subCategory}`
  }

  if (loading) {
    return (
      <><Header /><div style={{ minHeight: '60vh', display: 'flex', alignItems: 'center', justifyContent: 'center' }}><p style={{ color: '#64748b' }}>Chargement...</p></div><Footer /></>
    )
  }

  if (error || !listing) {
    return (
      <><Header />
        <div style={{ minHeight: '60vh', display: 'flex', alignItems: 'center', justifyContent: 'center' }}>
          <div style={{ textAlign: 'center', padding: '40px' }}>
            <div style={{ fontSize: '60px', marginBottom: '20px' }}>😕</div>
            <h2 style={{ color: '#1e293b', marginBottom: '15px' }}>Annonce introuvable</h2>
            <Link href="/" style={{ display: 'inline-block', padding: '14px 30px', background: '#1e40af', color: 'white', borderRadius: '8px', textDecoration: 'none' }}>Retour a l'accueil</Link>
          </div>
        </div>
      <Footer /></>
    )
  }

  const isVehicle = ['auto', 'moto', 'quad'].includes(listing.category)
  const isImmobilier = listing.category === 'immobilier'
  const isOwner = user && user.id === listing.user_id

  return (
    <>
      <Header />
      
      <div style={{ background: '#f1f5f9', minHeight: 'calc(100vh - 200px)', padding: '30px 20px' }}>
        <div style={{ maxWidth: '1100px', margin: '0 auto' }}>
          
          {/* Breadcrumb */}
          <div style={{ marginBottom: '20px', fontSize: '14px', color: '#64748b' }}>
            <Link href="/" style={{ color: '#1e40af', textDecoration: 'none' }}>Accueil</Link>
            <span style={{ margin: '0 10px' }}>/</span>
            <span>{listing.title}</span>
          </div>

          <div style={{ display: 'grid', gridTemplateColumns: '1fr 380px', gap: '30px' }}>
            
            {/* Left Column */}
            <div>
              {/* Photo Gallery */}
              <div style={{ background: 'white', borderRadius: '16px', overflow: 'hidden', marginBottom: '25px', boxShadow: '0 2px 8px rgba(0,0,0,0.05)' }}>
                {listing.photos && listing.photos.length > 0 ? (
                  <>
                    <div style={{ position: 'relative', height: '400px', background: '#1e293b' }}>
                      <img src={listing.photos[currentPhotoIndex]} alt={listing.title} style={{ width: '100%', height: '100%', objectFit: 'contain' }} />
                      {listing.photos.length > 1 && (
                        <>
                          <button onClick={() => setCurrentPhotoIndex(prev => prev > 0 ? prev - 1 : listing.photos.length - 1)} style={{ position: 'absolute', left: '15px', top: '50%', transform: 'translateY(-50%)', width: '45px', height: '45px', borderRadius: '50%', background: 'rgba(255,255,255,0.9)', border: 'none', fontSize: '20px', cursor: 'pointer' }}>←</button>
                          <button onClick={() => setCurrentPhotoIndex(prev => prev < listing.photos.length - 1 ? prev + 1 : 0)} style={{ position: 'absolute', right: '15px', top: '50%', transform: 'translateY(-50%)', width: '45px', height: '45px', borderRadius: '50%', background: 'rgba(255,255,255,0.9)', border: 'none', fontSize: '20px', cursor: 'pointer' }}>→</button>
                          <div style={{ position: 'absolute', bottom: '15px', left: '50%', transform: 'translateX(-50%)', background: 'rgba(0,0,0,0.7)', color: 'white', padding: '6px 14px', borderRadius: '20px', fontSize: '13px' }}>{currentPhotoIndex + 1} / {listing.photos.length}</div>
                        </>
                      )}
                    </div>
                    {listing.photos.length > 1 && (
                      <div style={{ display: 'flex', gap: '10px', padding: '15px', overflowX: 'auto' }}>
                        {listing.photos.map((photo, index) => (
                          <img key={index} src={photo} alt="" onClick={() => setCurrentPhotoIndex(index)} style={{ width: '80px', height: '60px', objectFit: 'cover', borderRadius: '8px', cursor: 'pointer', border: currentPhotoIndex === index ? '3px solid #1e40af' : '3px solid transparent', opacity: currentPhotoIndex === index ? 1 : 0.7 }} />
                        ))}
                      </div>
                    )}
                  </>
                ) : (
                  <div style={{ height: '300px', display: 'flex', alignItems: 'center', justifyContent: 'center', background: '#f1f5f9' }}>
                    <div style={{ textAlign: 'center', color: '#94a3b8' }}>
                      <div style={{ fontSize: '50px', marginBottom: '10px' }}>📷</div>
                      <p>Pas de photo</p>
                    </div>
                  </div>
                )}
              </div>

              {/* Description */}
              <div style={{ background: 'white', borderRadius: '16px', padding: '25px', marginBottom: '25px', boxShadow: '0 2px 8px rgba(0,0,0,0.05)' }}>
                <h2 style={{ color: '#1e293b', marginBottom: '20px', fontSize: '20px' }}>Description</h2>
                <p style={{ color: '#475569', lineHeight: '1.8', whiteSpace: 'pre-wrap' }}>{listing.description}</p>
              </div>

              {/* Caracteristiques */}
              {(isVehicle || isImmobilier) && (
                <div style={{ background: 'white', borderRadius: '16px', padding: '25px', boxShadow: '0 2px 8px rgba(0,0,0,0.05)' }}>
                  <h2 style={{ color: '#1e293b', marginBottom: '20px', fontSize: '20px' }}>Caracteristiques</h2>
                  <div style={{ display: 'grid', gridTemplateColumns: 'repeat(2, 1fr)', gap: '15px' }}>
                    {isVehicle && (
                      <>
                        {listing.brand && <div style={{ background: '#f8fafc', padding: '15px', borderRadius: '10px' }}><div style={{ color: '#64748b', fontSize: '13px', marginBottom: '5px' }}>Marque</div><div style={{ color: '#1e293b', fontWeight: '600' }}>{listing.brand}</div></div>}
                        {listing.model && <div style={{ background: '#f8fafc', padding: '15px', borderRadius: '10px' }}><div style={{ color: '#64748b', fontSize: '13px', marginBottom: '5px' }}>Modele</div><div style={{ color: '#1e293b', fontWeight: '600' }}>{listing.model}</div></div>}
                        {listing.year && <div style={{ background: '#f8fafc', padding: '15px', borderRadius: '10px' }}><div style={{ color: '#64748b', fontSize: '13px', marginBottom: '5px' }}>Annee</div><div style={{ color: '#1e293b', fontWeight: '600' }}>{listing.year}</div></div>}
                        {listing.mileage && <div style={{ background: '#f8fafc', padding: '15px', borderRadius: '10px' }}><div style={{ color: '#64748b', fontSize: '13px', marginBottom: '5px' }}>Kilometrage</div><div style={{ color: '#1e293b', fontWeight: '600' }}>{listing.mileage.toLocaleString('fr-FR')} km</div></div>}
                        {listing.fuel_type && <div style={{ background: '#f8fafc', padding: '15px', borderRadius: '10px' }}><div style={{ color: '#64748b', fontSize: '13px', marginBottom: '5px' }}>Carburant</div><div style={{ color: '#1e293b', fontWeight: '600' }}>{listing.fuel_type}</div></div>}
                        {listing.transmission && <div style={{ background: '#f8fafc', padding: '15px', borderRadius: '10px' }}><div style={{ color: '#64748b', fontSize: '13px', marginBottom: '5px' }}>Boite</div><div style={{ color: '#1e293b', fontWeight: '600' }}>{listing.transmission}</div></div>}
                      </>
                    )}
                    {isImmobilier && (
                      <>
                        {listing.surface_m2 && <div style={{ background: '#f8fafc', padding: '15px', borderRadius: '10px' }}><div style={{ color: '#64748b', fontSize: '13px', marginBottom: '5px' }}>Surface</div><div style={{ color: '#1e293b', fontWeight: '600' }}>{listing.surface_m2} m2</div></div>}
                        {listing.rooms && <div style={{ background: '#f8fafc', padding: '15px', borderRadius: '10px' }}><div style={{ color: '#64748b', fontSize: '13px', marginBottom: '5px' }}>Pieces</div><div style={{ color: '#1e293b', fontWeight: '600' }}>{listing.rooms}</div></div>}
                        {listing.property_type && <div style={{ background: '#f8fafc', padding: '15px', borderRadius: '10px' }}><div style={{ color: '#64748b', fontSize: '13px', marginBottom: '5px' }}>Type</div><div style={{ color: '#1e293b', fontWeight: '600' }}>{listing.property_type}</div></div>}
                        {listing.has_garden && <div style={{ background: '#dcfce7', padding: '15px', borderRadius: '10px' }}><div style={{ color: '#166534', fontWeight: '600' }}>✓ Jardin</div></div>}
                        {listing.handicap_access && <div style={{ background: '#dbeafe', padding: '15px', borderRadius: '10px' }}><div style={{ color: '#1e40af', fontWeight: '600' }}>♿ Acces handicape</div></div>}
                      </>
                    )}
                  </div>
                </div>
              )}
            </div>

            {/* Right Column */}
            <div>
              {/* Price Card */}
              <div style={{ background: 'white', borderRadius: '16px', padding: '25px', marginBottom: '20px', boxShadow: '0 2px 8px rgba(0,0,0,0.05)', position: 'sticky', top: '20px' }}>
                <div style={{ fontSize: '32px', fontWeight: '700', color: '#16a34a', marginBottom: '10px' }}>{formatPrice(listing.price)}</div>
                <h1 style={{ fontSize: '20px', color: '#1e293b', marginBottom: '15px', lineHeight: '1.4' }}>{listing.title}</h1>
                
                <div style={{ display: 'flex', alignItems: 'center', gap: '8px', color: '#64748b', fontSize: '14px', marginBottom: '8px' }}>
                  <span>📍</span><span>{listing.location}</span>
                </div>
                <div style={{ display: 'flex', alignItems: 'center', gap: '8px', color: '#64748b', fontSize: '14px', marginBottom: '8px' }}>
                  <span>📅</span><span>Publiee le {formatDate(listing.created_at)}</span>
                </div>
                <div style={{ display: 'flex', alignItems: 'center', gap: '8px', color: '#64748b', fontSize: '14px', marginBottom: '20px' }}>
                  <span>👁️</span><span>{listing.views || 0} vues</span>
                </div>

                <div style={{ background: '#f8fafc', borderRadius: '10px', padding: '12px', marginBottom: '20px', fontSize: '13px', color: '#475569' }}>
                  {getCategoryLabel(listing.category, listing.sub_category)}
                </div>

                {/* Seller Info */}
                <div style={{ borderTop: '1px solid #e2e8f0', paddingTop: '20px', marginBottom: '20px' }}>
                  <div style={{ display: 'flex', alignItems: 'center', gap: '12px', marginBottom: '15px' }}>
                    <div style={{ width: '50px', height: '50px', borderRadius: '50%', background: '#1e40af', color: 'white', display: 'flex', alignItems: 'center', justifyContent: 'center', fontSize: '20px', fontWeight: '600' }}>
                      {listing.user_name ? listing.user_name.charAt(0).toUpperCase() : '?'}
                    </div>
                    <div>
                      <div style={{ fontWeight: '600', color: '#1e293b' }}>{listing.user_name}</div>
                      <div style={{ fontSize: '13px', color: '#64748b' }}>Vendeur particulier</div>
                    </div>
                  </div>
                </div>

                {/* Contact */}
                {user ? (
                  isOwner ? (
                    <div style={{ background: '#f0f9ff', border: '1px solid #bae6fd', borderRadius: '10px', padding: '15px', textAlign: 'center' }}>
                      <p style={{ color: '#0369a1', margin: 0 }}>C'est votre annonce</p>
                    </div>
                  ) : messageSent ? (
                    <div style={{ background: '#dcfce7', border: '1px solid #86efac', borderRadius: '10px', padding: '20px', textAlign: 'center' }}>
                      <div style={{ fontSize: '30px', marginBottom: '10px' }}>✓</div>
                      <p style={{ color: '#166534', margin: '0 0 10px 0', fontWeight: '600' }}>Message envoye !</p>
                      <p style={{ color: '#15803d', margin: 0, fontSize: '14px' }}>Le vendeur vous repondra bientot.</p>
                      <Link href="/messages" style={{ display: 'inline-block', marginTop: '15px', color: '#1e40af', fontSize: '14px' }}>Voir mes messages →</Link>
                    </div>
                  ) : (
                    <>
                      {listing.user_phone && (
                        <button onClick={() => setShowPhone(!showPhone)} style={{ width: '100%', padding: '16px', background: showPhone ? '#22c55e' : '#1e40af', color: 'white', border: 'none', borderRadius: '10px', fontSize: '16px', fontWeight: '600', cursor: 'pointer', marginBottom: '12px' }}>
                          {showPhone ? `📞 ${listing.user_phone}` : '📞 Voir le telephone'}
                        </button>
                      )}
                      
                      {/* Message Form */}
                      <form onSubmit={sendMessage}>
                        <textarea
                          value={message}
                          onChange={(e) => setMessage(e.target.value)}
                          placeholder="Bonjour, je suis interesse par votre annonce..."
                          rows={4}
                          style={{ width: '100%', padding: '14px', border: '1px solid #e2e8f0', borderRadius: '10px', fontSize: '14px', resize: 'none', marginBottom: '12px', boxSizing: 'border-box' }}
                        />
                        <button
                          type="submit"
                          disabled={!message.trim() || sendingMessage}
                          style={{ 
                            width: '100%', 
                            padding: '16px', 
                            background: message.trim() && !sendingMessage ? '#1e40af' : '#e2e8f0', 
                            color: message.trim() && !sendingMessage ? 'white' : '#94a3b8', 
                            border: 'none', 
                            borderRadius: '10px', 
                            fontSize: '16px', 
                            fontWeight: '600', 
                            cursor: message.trim() && !sendingMessage ? 'pointer' : 'not-allowed'
                          }}
                        >
                          {sendingMessage ? 'Envoi...' : '✉️ Envoyer un message'}
                        </button>
                      </form>
                    </>
                  )
                ) : (
                  <div style={{ textAlign: 'center' }}>
                    <p style={{ color: '#64748b', marginBottom: '15px', fontSize: '14px' }}>Connectez-vous pour contacter le vendeur</p>
                    <Link href="/login" style={{ display: 'block', padding: '16px', background: '#1e40af', color: 'white', borderRadius: '10px', fontSize: '16px', fontWeight: '600', textDecoration: 'none', textAlign: 'center' }}>Se connecter</Link>
                  </div>
                )}
              </div>

              {/* Safety Tips */}
              <div style={{ background: '#fefce8', border: '1px solid #fbbf24', borderRadius: '12px', padding: '20px' }}>
                <h3 style={{ color: '#92400e', marginBottom: '12px', fontSize: '15px' }}>⚠️ Conseils de securite</h3>
                <ul style={{ color: '#a16207', fontSize: '13px', lineHeight: '1.8', margin: 0, paddingLeft: '18px' }}>
                  <li>Privilegiez les rencontres dans un lieu public</li>
                  <li>Ne payez jamais a l'avance</li>
                  <li>Verifiez le bien avant l'achat</li>
                </ul>
              </div>
            </div>
          </div>
        </div>
      </div>

      <Footer />
    </>
  )
}
