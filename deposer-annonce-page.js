'use client'
import { useState, useEffect } from 'react'
import { useRouter } from 'next/navigation'
import Script from 'next/script'
import Header from '../../components/Header'
import Footer from '../../components/Footer'

const CATEGORIES = {
  'auto': { label: 'Auto', icon: '🚗', subcategories: [{ value: 'voiture', label: 'Voiture' }, { value: 'utilitaire', label: 'Utilitaire' }, { value: 'camion', label: 'Camion' }] },
  'moto': { label: 'Moto', icon: '🏍️', subcategories: [{ value: 'moto_homologuee', label: 'Moto homologuée' }, { value: 'moto_non_homologuee', label: 'Moto non homologuée' }, { value: 'scooter_homologue', label: 'Scooter homologué' }] },
  'quad': { label: 'Quad', icon: '🏎️', subcategories: [{ value: 'quad_homologue', label: 'Quad homologué' }, { value: 'quad_non_homologue', label: 'Quad non homologué' }] },
  'immobilier': { label: 'Immobilier', icon: '🏠', subcategories: [{ value: 'vente_maison', label: 'Vente maison' }, { value: 'vente_appartement', label: 'Vente appartement' }, { value: 'location_maison', label: 'Location maison' }, { value: 'location_appartement', label: 'Location appartement' }, { value: 'terrain', label: 'Terrain' }, { value: 'local_commercial', label: 'Local commercial' }, { value: 'parking', label: 'Parking / Garage' }] }
}

const FUEL_TYPES = ['Essence', 'Diesel', 'Électrique', 'Hybride', 'GPL', 'Autre']
const TRANSMISSIONS = ['Manuelle', 'Automatique']
const PROPERTY_TYPES = ['Maison', 'Appartement', 'Studio', 'Loft', 'Villa', 'Ferme', 'Terrain']

const compressImage = (file, maxWidth = 1200, quality = 0.7) => {
  return new Promise((resolve) => {
    const reader = new FileReader()
    reader.onload = (e) => {
      const img = new Image()
      img.onload = () => {
        const canvas = document.createElement('canvas')
        let width = img.width
        let height = img.height
        if (width > maxWidth) {
          height = (height * maxWidth) / width
          width = maxWidth
        }
        canvas.width = width
        canvas.height = height
        const ctx = canvas.getContext('2d')
        ctx.drawImage(img, 0, 0, width, height)
        const compressedBase64 = canvas.toDataURL('image/jpeg', quality)
        resolve(compressedBase64)
      }
      img.src = e.target.result
    }
    reader.readAsDataURL(file)
  })
}

export default function DeposerAnnoncePage() {
  const router = useRouter()
  const [user, setUser] = useState(null)
  const [loading, setLoading] = useState(false)
  const [uploadingPhotos, setUploadingPhotos] = useState(false)
  const [error, setError] = useState('')
  const [currentStep, setCurrentStep] = useState(1)
  const [paypalLoaded, setPaypalLoaded] = useState(false)
  const [showPaypalButton, setShowPaypalButton] = useState(false)
  const [success, setSuccess] = useState(false)
  
  const [formData, setFormData] = useState({
    title: '', category: '', sub_category: '', description: '', price: '',
    address_full: '', city: '', postal_code: '',
    brand: '', model: '', year: '', mileage: '', fuel_type: '', transmission: '',
    surface_m2: '', rooms: '', property_type: '', floor: '', has_garden: false, handicap_access: false,
    photos: []
  })

  useEffect(() => {
    const token = localStorage.getItem('token')
    const savedUser = localStorage.getItem('user')
    if (!token) { router.push('/login'); return }
    if (savedUser) {
      const userData = JSON.parse(savedUser)
      setUser(userData)
      if (!userData.email_verified) setError('Vous devez vérifier votre email avant de pouvoir déposer une annonce.')
    }
  }, [router])

  useEffect(() => {
    if (showPaypalButton && paypalLoaded && window.paypal) {
      const container = document.getElementById('paypal-container-5TX9ZYW3ZFK3Y')
      if (container && container.childNodes.length === 0) {
        window.paypal.HostedButtons({ hostedButtonId: "5TX9ZYW3ZFK3Y" }).render("#paypal-container-5TX9ZYW3ZFK3Y")
      }
    }
  }, [showPaypalButton, paypalLoaded])

  const validateDescription = (text) => !/(https?:\/\/|www\.|\.com|\.fr|\.net|\.org|@)/gi.test(text)

  const handleDescriptionChange = (e) => {
    const text = e.target.value
    if (!validateDescription(text)) { setError('Les liens et adresses email ne sont pas autorisés.'); return }
    setError('')
    setFormData({...formData, description: text})
  }

  const handlePhotoUpload = async (e) => {
    const files = Array.from(e.target.files)
    const remainingSlots = 5 - formData.photos.length
    const filesToProcess = files.slice(0, remainingSlots)
    if (filesToProcess.length === 0) return
    setUploadingPhotos(true)
    try {
      const compressedPhotos = await Promise.all(filesToProcess.map(file => compressImage(file, 1200, 0.7)))
      setFormData(prev => ({ ...prev, photos: [...prev.photos, ...compressedPhotos] }))
    } catch (err) {
      setError('Erreur lors du traitement des photos')
    } finally {
      setUploadingPhotos(false)
    }
  }

  const removePhoto = (index) => setFormData(prev => ({ ...prev, photos: prev.photos.filter((_, i) => i !== index) }))

  const handleSubmit = async (e) => {
    e.preventDefault()
    if (!user?.email_verified) { setError('Vous devez vérifier votre email.'); return }
    if (!validateDescription(formData.description)) { setError('Les liens ne sont pas autorisés.'); return }
    setLoading(true); setError('')
    try {
      const token = localStorage.getItem('token')
      const submitData = {
        title: formData.title, description: formData.description, price: parseFloat(formData.price) || 0,
        category: formData.category, sub_category: formData.sub_category,
        location: formData.city + ', ' + formData.postal_code, photos: formData.photos,
        brand: formData.brand || null, model: formData.model || null,
        year: formData.year ? parseInt(formData.year) : null, mileage: formData.mileage ? parseInt(formData.mileage) : null,
        fuel_type: formData.fuel_type || null, transmission: formData.transmission || null,
        surface_m2: formData.surface_m2 ? parseInt(formData.surface_m2) : null, rooms: formData.rooms ? parseInt(formData.rooms) : null,
        property_type: formData.property_type || null, floor: formData.floor ? parseInt(formData.floor) : null,
        has_garden: formData.has_garden, handicap_access: formData.handicap_access
      }
      const res = await fetch('/api/listings', { method: 'POST', headers: { 'Content-Type': 'application/json', 'Authorization': 'Bearer ' + token }, body: JSON.stringify(submitData) })
      const data = await res.json()
      if (res.ok) {
        setSuccess(true)
      } else {
        setError(data.detail || 'Erreur lors de la création')
      }
    } catch (err) { setError('Erreur de connexion') } finally { setLoading(false) }
  }

  const selectedCategory = CATEGORIES[formData.category]
  const isVehicleCategory = ['auto', 'moto', 'quad'].includes(formData.category)

  if (!user) return (<><Header /><div style={{ minHeight: '50vh', display: 'flex', alignItems: 'center', justifyContent: 'center' }}><p>Chargement...</p></div><Footer /></>)

  // Page de succès
  if (success) {
    return (
      <>
        <Header />
        <div style={{ background: '#f1f5f9', minHeight: 'calc(100vh - 200px)', padding: '40px 20px', display: 'flex', alignItems: 'center', justifyContent: 'center' }}>
          <div style={{ maxWidth: '500px', textAlign: 'center', background: 'white', borderRadius: '20px', padding: '50px 40px', boxShadow: '0 4px 6px rgba(0,0,0,0.05)' }}>
            <div style={{ width: '80px', height: '80px', background: '#dcfce7', borderRadius: '50%', display: 'flex', alignItems: 'center', justifyContent: 'center', margin: '0 auto 25px', fontSize: '40px' }}>
              ✓
            </div>
            <h1 style={{ color: '#166534', marginBottom: '15px', fontSize: '28px' }}>Annonce déposée !</h1>
            <p style={{ color: '#475569', fontSize: '16px', lineHeight: '1.6', marginBottom: '30px' }}>
              Votre annonce a été soumise avec succès.<br/>
              <strong>Elle est actuellement en cours de validation</strong> par notre équipe et sera publiée sous peu.
            </p>
            <div style={{ background: '#f0f9ff', border: '1px solid #bae6fd', borderRadius: '10px', padding: '15px', marginBottom: '30px' }}>
              <p style={{ color: '#0369a1', margin: 0, fontSize: '14px' }}>
                📧 Vous recevrez un email de confirmation dès que votre annonce sera approuvée.
              </p>
            </div>
            <button 
              onClick={() => router.push('/')} 
              style={{ 
                padding: '16px 40px', 
                background: '#1e40af', 
                color: 'white', 
                border: 'none', 
                borderRadius: '10px', 
                fontSize: '16px', 
                fontWeight: '600', 
                cursor: 'pointer',
                width: '100%'
              }}
            >
              Retour à l'accueil
            </button>
          </div>
        </div>
        <Footer />
      </>
    )
  }

  return (
    <>
      <Script src="https://www.paypal.com/sdk/js?client-id=BAAVXv2LRYGl9G5OG9LSQSlQR5ROrUdcCx_0oEJoUaRqx5L9AEsiJVUaLQrtLTyf-FLu4PZhnAfXiJq0e8&components=hosted-buttons&disable-funding=venmo&currency=EUR" onLoad={() => setPaypalLoaded(true)} />
      <Header />
      
      <div style={{ background: '#f1f5f9', minHeight: 'calc(100vh - 200px)', padding: '40px 20px' }}>
        <div style={{ maxWidth: '800px', margin: '0 auto' }}>
          <div style={{ textAlign: 'center', marginBottom: '30px' }}>
            <h1 style={{ color: '#1e293b', marginBottom: '10px' }}>Déposer une annonce</h1>
            <p style={{ color: '#64748b' }}>Publiez votre annonce gratuitement</p>
          </div>

          <div style={{ display: 'flex', justifyContent: 'center', gap: '10px', marginBottom: '30px' }}>
            {[1, 2, 3, 4].map(step => (
              <div key={step} style={{ display: 'flex', alignItems: 'center', gap: '8px' }}>
                <div style={{ width: '36px', height: '36px', borderRadius: '50%', background: currentStep >= step ? '#1e40af' : '#e2e8f0', color: currentStep >= step ? 'white' : '#94a3b8', display: 'flex', alignItems: 'center', justifyContent: 'center', fontWeight: 'bold' }}>{step}</div>
                {step < 4 && <div style={{ width: '40px', height: '3px', background: currentStep > step ? '#1e40af' : '#e2e8f0' }} />}
              </div>
            ))}
          </div>

          {error && <div style={{ background: '#fef2f2', border: '1px solid #fecaca', color: '#dc2626', padding: '15px 20px', borderRadius: '10px', marginBottom: '20px' }}>{error}</div>}

          <form onSubmit={handleSubmit}>
            <div style={{ background: 'white', borderRadius: '16px', padding: '30px', boxShadow: '0 4px 6px rgba(0,0,0,0.05)' }}>

              {currentStep === 1 && (
                <div>
                  <h2 style={{ marginBottom: '20px', color: '#1e293b' }}>Choisissez une catégorie</h2>
                  <div style={{ display: 'grid', gridTemplateColumns: 'repeat(4, 1fr)', gap: '15px', marginBottom: '30px' }}>
                    {Object.entries(CATEGORIES).map(([key, cat]) => (
                      <button key={key} type="button" onClick={() => setFormData({...formData, category: key, sub_category: ''})} style={{ padding: '25px 15px', border: formData.category === key ? '3px solid #1e40af' : '2px solid #e2e8f0', borderRadius: '12px', background: formData.category === key ? '#eff6ff' : 'white', cursor: 'pointer', textAlign: 'center' }}>
                        <div style={{ fontSize: '40px', marginBottom: '10px' }}>{cat.icon}</div>
                        <div style={{ fontSize: '16px', fontWeight: '600', color: '#1e293b' }}>{cat.label}</div>
                      </button>
                    ))}
                  </div>
                  {formData.category && (
                    <div style={{ marginBottom: '20px' }}>
                      <h3 style={{ marginBottom: '15px', color: '#475569' }}>Type</h3>
                      <div style={{ display: 'flex', flexWrap: 'wrap', gap: '10px' }}>
                        {selectedCategory.subcategories.map(sub => (
                          <button key={sub.value} type="button" onClick={() => setFormData({...formData, sub_category: sub.value})} style={{ padding: '12px 24px', border: formData.sub_category === sub.value ? '2px solid #1e40af' : '1px solid #e2e8f0', borderRadius: '25px', background: formData.sub_category === sub.value ? '#1e40af' : 'white', color: formData.sub_category === sub.value ? 'white' : '#475569', cursor: 'pointer', fontSize: '14px', fontWeight: '500' }}>{sub.label}</button>
                        ))}
                      </div>
                    </div>
                  )}
                  <button type="button" disabled={!formData.category || !formData.sub_category} onClick={() => setCurrentStep(2)} style={{ width: '100%', padding: '16px', background: formData.category && formData.sub_category ? '#1e40af' : '#e2e8f0', color: formData.category && formData.sub_category ? 'white' : '#94a3b8', border: 'none', borderRadius: '10px', fontSize: '16px', fontWeight: '600', cursor: formData.category && formData.sub_category ? 'pointer' : 'not-allowed' }}>Continuer →</button>
                </div>
              )}

              {currentStep === 2 && (
                <div>
                  <h2 style={{ marginBottom: '20px', color: '#1e293b' }}>Détails</h2>
                  <div style={{ marginBottom: '20px' }}>
                    <label style={{ display: 'block', marginBottom: '8px', color: '#475569', fontWeight: '500' }}>Titre *</label>
                    <input type="text" value={formData.title} onChange={(e) => setFormData({...formData, title: e.target.value.slice(0, 150)})} maxLength={150} required placeholder="Titre de votre annonce" style={{ width: '100%', padding: '14px', border: '1px solid #e2e8f0', borderRadius: '8px', fontSize: '16px', boxSizing: 'border-box' }} />
                    <div style={{ textAlign: 'right', fontSize: '12px', color: '#94a3b8', marginTop: '5px' }}>{formData.title.length}/150</div>
                  </div>
                  <div style={{ marginBottom: '20px' }}>
                    <label style={{ display: 'block', marginBottom: '8px', color: '#475569', fontWeight: '500' }}>Prix (€) *</label>
                    <input type="number" value={formData.price} onChange={(e) => setFormData({...formData, price: e.target.value})} required min="0" placeholder="0" style={{ width: '100%', padding: '14px', border: '1px solid #e2e8f0', borderRadius: '8px', fontSize: '16px', boxSizing: 'border-box' }} />
                  </div>
                  {isVehicleCategory && (
                    <>
                      <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: '15px', marginBottom: '20px' }}>
                        <div><label style={{ display: 'block', marginBottom: '8px', color: '#475569', fontWeight: '500' }}>Marque *</label><input type="text" value={formData.brand} onChange={(e) => setFormData({...formData, brand: e.target.value})} required style={{ width: '100%', padding: '14px', border: '1px solid #e2e8f0', borderRadius: '8px', fontSize: '16px', boxSizing: 'border-box' }} /></div>
                        <div><label style={{ display: 'block', marginBottom: '8px', color: '#475569', fontWeight: '500' }}>Modèle *</label><input type="text" value={formData.model} onChange={(e) => setFormData({...formData, model: e.target.value})} required style={{ width: '100%', padding: '14px', border: '1px solid #e2e8f0', borderRadius: '8px', fontSize: '16px', boxSizing: 'border-box' }} /></div>
                      </div>
                      <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: '15px', marginBottom: '20px' }}>
                        <div><label style={{ display: 'block', marginBottom: '8px', color: '#475569', fontWeight: '500' }}>Année *</label><input type="number" value={formData.year} onChange={(e) => setFormData({...formData, year: e.target.value})} required min="1900" max="2026" style={{ width: '100%', padding: '14px', border: '1px solid #e2e8f0', borderRadius: '8px', fontSize: '16px', boxSizing: 'border-box' }} /></div>
                        <div><label style={{ display: 'block', marginBottom: '8px', color: '#475569', fontWeight: '500' }}>Kilométrage *</label><input type="number" value={formData.mileage} onChange={(e) => setFormData({...formData, mileage: e.target.value})} required min="0" style={{ width: '100%', padding: '14px', border: '1px solid #e2e8f0', borderRadius: '8px', fontSize: '16px', boxSizing: 'border-box' }} /></div>
                      </div>
                      <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: '15px', marginBottom: '20px' }}>
                        <div><label style={{ display: 'block', marginBottom: '8px', color: '#475569', fontWeight: '500' }}>Carburant</label><select value={formData.fuel_type} onChange={(e) => setFormData({...formData, fuel_type: e.target.value})} style={{ width: '100%', padding: '14px', border: '1px solid #e2e8f0', borderRadius: '8px', fontSize: '16px', boxSizing: 'border-box' }}><option value="">Sélectionner</option>{FUEL_TYPES.map(f => <option key={f} value={f}>{f}</option>)}</select></div>
                        <div><label style={{ display: 'block', marginBottom: '8px', color: '#475569', fontWeight: '500' }}>Boîte</label><select value={formData.transmission} onChange={(e) => setFormData({...formData, transmission: e.target.value})} style={{ width: '100%', padding: '14px', border: '1px solid #e2e8f0', borderRadius: '8px', fontSize: '16px', boxSizing: 'border-box' }}><option value="">Sélectionner</option>{TRANSMISSIONS.map(t => <option key={t} value={t}>{t}</option>)}</select></div>
                      </div>
                    </>
                  )}
                  {formData.category === 'immobilier' && (
                    <>
                      <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: '15px', marginBottom: '20px' }}>
                        <div><label style={{ display: 'block', marginBottom: '8px', color: '#475569', fontWeight: '500' }}>Surface (m²) *</label><input type="number" value={formData.surface_m2} onChange={(e) => setFormData({...formData, surface_m2: e.target.value})} required min="1" style={{ width: '100%', padding: '14px', border: '1px solid #e2e8f0', borderRadius: '8px', fontSize: '16px', boxSizing: 'border-box' }} /></div>
                        <div><label style={{ display: 'block', marginBottom: '8px', color: '#475569', fontWeight: '500' }}>Pièces</label><input type="number" value={formData.rooms} onChange={(e) => setFormData({...formData, rooms: e.target.value})} min="1" style={{ width: '100%', padding: '14px', border: '1px solid #e2e8f0', borderRadius: '8px', fontSize: '16px', boxSizing: 'border-box' }} /></div>
                      </div>
                      <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: '15px', marginBottom: '20px' }}>
                        <div><label style={{ display: 'block', marginBottom: '8px', color: '#475569', fontWeight: '500' }}>Type *</label><select value={formData.property_type} onChange={(e) => setFormData({...formData, property_type: e.target.value})} required style={{ width: '100%', padding: '14px', border: '1px solid #e2e8f0', borderRadius: '8px', fontSize: '16px', boxSizing: 'border-box' }}><option value="">Sélectionner</option>{PROPERTY_TYPES.map(t => <option key={t} value={t}>{t}</option>)}</select></div>
                        <div><label style={{ display: 'block', marginBottom: '8px', color: '#475569', fontWeight: '500' }}>Étage</label><input type="number" value={formData.floor} onChange={(e) => setFormData({...formData, floor: e.target.value})} min="0" style={{ width: '100%', padding: '14px', border: '1px solid #e2e8f0', borderRadius: '8px', fontSize: '16px', boxSizing: 'border-box' }} /></div>
                      </div>
                      <div style={{ display: 'flex', gap: '30px', marginBottom: '20px' }}>
                        <label style={{ display: 'flex', alignItems: 'center', gap: '10px', cursor: 'pointer' }}><input type="checkbox" checked={formData.has_garden} onChange={(e) => setFormData({...formData, has_garden: e.target.checked})} /><span>Jardin</span></label>
                        <label style={{ display: 'flex', alignItems: 'center', gap: '10px', cursor: 'pointer' }}><input type="checkbox" checked={formData.handicap_access} onChange={(e) => setFormData({...formData, handicap_access: e.target.checked})} /><span>Accès handicapé</span></label>
                      </div>
                    </>
                  )}
                  <div style={{ marginBottom: '20px' }}>
                    <label style={{ display: 'block', marginBottom: '8px', color: '#475569', fontWeight: '500' }}>Description *</label>
                    <textarea value={formData.description} onChange={handleDescriptionChange} required rows={5} placeholder="Décrivez votre bien..." style={{ width: '100%', padding: '14px', border: '1px solid #e2e8f0', borderRadius: '8px', fontSize: '16px', resize: 'vertical', boxSizing: 'border-box' }} />
                    <p style={{ fontSize: '12px', color: '#94a3b8', marginTop: '5px' }}>Les liens sont interdits</p>
                  </div>
                  <div style={{ display: 'flex', gap: '15px' }}>
                    <button type="button" onClick={() => setCurrentStep(1)} style={{ padding: '16px 30px', background: 'white', color: '#475569', border: '2px solid #e2e8f0', borderRadius: '10px', fontSize: '16px', fontWeight: '600', cursor: 'pointer' }}>← Retour</button>
                    <button type="button" disabled={!formData.title || !formData.price || !formData.description} onClick={() => setCurrentStep(3)} style={{ flex: 1, padding: '16px', background: formData.title && formData.price && formData.description ? '#1e40af' : '#e2e8f0', color: formData.title && formData.price && formData.description ? 'white' : '#94a3b8', border: 'none', borderRadius: '10px', fontSize: '16px', fontWeight: '600', cursor: formData.title && formData.price && formData.description ? 'pointer' : 'not-allowed' }}>Continuer →</button>
                  </div>
                </div>
              )}

              {currentStep === 3 && (
                <div>
                  <h2 style={{ marginBottom: '20px', color: '#1e293b' }}>Photos</h2>
                  <p style={{ color: '#64748b', marginBottom: '20px' }}>Ajoutez jusqu'à 5 photos gratuitement (compressées automatiquement)</p>
                  
                  <div style={{ border: '2px dashed #e2e8f0', borderRadius: '12px', padding: '30px', textAlign: 'center', marginBottom: '20px', background: '#f8fafc' }}>
                    <div style={{ fontSize: '40px', marginBottom: '10px' }}>📷</div>
                    <input type="file" accept="image/*" multiple onChange={handlePhotoUpload} style={{ display: 'none' }} id="photo-upload" disabled={formData.photos.length >= 5 || uploadingPhotos} />
                    <label htmlFor="photo-upload" style={{ display: 'inline-block', padding: '12px 25px', background: formData.photos.length >= 5 ? '#94a3b8' : uploadingPhotos ? '#60a5fa' : '#1e40af', color: 'white', borderRadius: '8px', cursor: formData.photos.length >= 5 || uploadingPhotos ? 'not-allowed' : 'pointer', fontWeight: '500' }}>
                      {uploadingPhotos ? 'Compression...' : formData.photos.length >= 5 ? 'Maximum atteint' : 'Ajouter des photos'}
                    </label>
                    <p style={{ fontSize: '14px', color: '#64748b', marginTop: '10px' }}>{formData.photos.length}/5 photos</p>
                  </div>

                  {formData.photos.length > 0 && (
                    <div style={{ display: 'grid', gridTemplateColumns: 'repeat(5, 1fr)', gap: '10px', marginBottom: '20px' }}>
                      {formData.photos.map((photo, index) => (
                        <div key={index} style={{ position: 'relative' }}>
                          <img src={photo} alt="" style={{ width: '100%', height: '80px', objectFit: 'cover', borderRadius: '8px' }} />
                          <button type="button" onClick={() => removePhoto(index)} style={{ position: 'absolute', top: '3px', right: '3px', width: '20px', height: '20px', borderRadius: '50%', background: '#ef4444', color: 'white', border: 'none', cursor: 'pointer', fontSize: '10px' }}>✕</button>
                        </div>
                      ))}
                    </div>
                  )}

                  {formData.photos.length >= 5 && (
                    <div style={{ background: '#fefce8', border: '1px solid #fbbf24', borderRadius: '10px', padding: '20px', marginBottom: '20px' }}>
                      <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', flexWrap: 'wrap', gap: '15px' }}>
                        <div>
                          <p style={{ fontWeight: '600', color: '#92400e', margin: '0 0 5px 0' }}>📸 Besoin de plus de photos ?</p>
                          <p style={{ fontSize: '14px', color: '#a16207', margin: 0 }}>Ajoutez 5 photos supplémentaires pour seulement <strong>3,99€</strong></p>
                        </div>
                        {!showPaypalButton ? (
                          <button type="button" onClick={() => setShowPaypalButton(true)} style={{ padding: '12px 24px', background: '#f59e0b', color: 'white', border: 'none', borderRadius: '8px', fontWeight: '600', cursor: 'pointer', whiteSpace: 'nowrap' }}>+ 5 photos • 3,99€</button>
                        ) : (
                          <div id="paypal-container-5TX9ZYW3ZFK3Y" style={{ minWidth: '150px' }}></div>
                        )}
                      </div>
                    </div>
                  )}

                  <div style={{ display: 'flex', gap: '15px' }}>
                    <button type="button" onClick={() => setCurrentStep(2)} style={{ padding: '16px 30px', background: 'white', color: '#475569', border: '2px solid #e2e8f0', borderRadius: '10px', fontSize: '16px', fontWeight: '600', cursor: 'pointer' }}>← Retour</button>
                    <button type="button" onClick={() => setCurrentStep(4)} style={{ flex: 1, padding: '16px', background: '#1e40af', color: 'white', border: 'none', borderRadius: '10px', fontSize: '16px', fontWeight: '600', cursor: 'pointer' }}>Continuer →</button>
                  </div>
                </div>
              )}

              {currentStep === 4 && (
                <div>
                  <h2 style={{ marginBottom: '20px', color: '#1e293b' }}>Localisation</h2>
                  <div style={{ background: '#eff6ff', borderRadius: '10px', padding: '12px', marginBottom: '20px', fontSize: '13px', color: '#1e40af' }}>🔒 Seule la ville sera visible publiquement</div>
                  <div style={{ display: 'grid', gridTemplateColumns: '2fr 1fr', gap: '15px', marginBottom: '20px' }}>
                    <div><label style={{ display: 'block', marginBottom: '8px', color: '#475569', fontWeight: '500' }}>Ville *</label><input type="text" value={formData.city} onChange={(e) => setFormData({...formData, city: e.target.value})} required placeholder="Paris" style={{ width: '100%', padding: '14px', border: '1px solid #e2e8f0', borderRadius: '8px', fontSize: '16px', boxSizing: 'border-box' }} /></div>
                    <div><label style={{ display: 'block', marginBottom: '8px', color: '#475569', fontWeight: '500' }}>Code postal *</label><input type="text" value={formData.postal_code} onChange={(e) => setFormData({...formData, postal_code: e.target.value})} required placeholder="75001" maxLength={5} style={{ width: '100%', padding: '14px', border: '1px solid #e2e8f0', borderRadius: '8px', fontSize: '16px', boxSizing: 'border-box' }} /></div>
                  </div>
                  <div style={{ display: 'flex', gap: '15px' }}>
                    <button type="button" onClick={() => setCurrentStep(3)} style={{ padding: '16px 30px', background: 'white', color: '#475569', border: '2px solid #e2e8f0', borderRadius: '10px', fontSize: '16px', fontWeight: '600', cursor: 'pointer' }}>← Retour</button>
                    <button type="submit" disabled={loading || !formData.city || !formData.postal_code || !user?.email_verified} style={{ flex: 1, padding: '16px', background: !loading && formData.city && formData.postal_code && user?.email_verified ? '#22c55e' : '#e2e8f0', color: !loading && formData.city && formData.postal_code && user?.email_verified ? 'white' : '#94a3b8', border: 'none', borderRadius: '10px', fontSize: '16px', fontWeight: '600', cursor: !loading && formData.city && formData.postal_code && user?.email_verified ? 'pointer' : 'not-allowed' }}>{loading ? 'Publication...' : '✓ Publier'}</button>
                  </div>
                </div>
              )}
            </div>
          </form>
        </div>
      </div>

      <Footer />
    </>
  )
}
