'use client'
import { useState } from 'react'
import Link from 'next/link'
import { useRouter } from 'next/navigation'
import Header from '../../components/Header'
import Footer from '../../components/Footer'
import { FaUser, FaEnvelope, FaLock, FaPhone, FaCalendar, FaGoogle, FaFacebook } from 'react-icons/fa'

export default function RegisterPage() {
  const router = useRouter()
  const [formData, setFormData] = useState({
    first_name: '',
    last_name: '',
    email: '',
    phone: '',
    birth_date: '',
    password: '',
    confirmPassword: ''
  })
  const [loading, setLoading] = useState(false)
  const [error, setError] = useState('')
  const [acceptTerms, setAcceptTerms] = useState(false)

  const handleSubmit = async (e) => {
    e.preventDefault()
    
    if (formData.password !== formData.confirmPassword) {
      setError('Les mots de passe ne correspondent pas')
      return
    }
    
    if (!acceptTerms) {
      setError('Vous devez accepter les conditions d\'utilisation')
      return
    }

    // Check age (18+)
    const birthDate = new Date(formData.birth_date)
    const today = new Date()
    let age = today.getFullYear() - birthDate.getFullYear()
    if (today.getMonth() < birthDate.getMonth() || 
        (today.getMonth() === birthDate.getMonth() && today.getDate() < birthDate.getDate())) {
      age--
    }
    if (age < 18) {
      setError('Vous devez avoir au moins 18 ans pour vous inscrire')
      return
    }

    setLoading(true)
    setError('')

    try {
      const res = await fetch('/api/auth/register', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          first_name: formData.first_name,
          last_name: formData.last_name,
          email: formData.email,
          phone: formData.phone,
          birth_date: formData.birth_date,
          password: formData.password
        })
      })

      const data = await res.json()

      if (res.ok) {
        router.push('/login?registered=true')
      } else {
        setError(data.detail || 'Erreur lors de l\'inscription')
      }
    } catch (err) {
      setError('Erreur de connexion au serveur')
    } finally {
      setLoading(false)
    }
  }

  return (
    <>
      <Header />
      
      <div className="page-container">
        <div className="sidebar-left">
          <div className="ad-banner ad-banner-tall">
            <span>Espace<br/>Publicitaire<br/>160x600</span>
          </div>
        </div>

        <main className="main-content" style={{ maxWidth: '550px' }}>
          <div style={{
            background: 'white',
            padding: '40px',
            borderRadius: '16px',
            boxShadow: '0 4px 6px rgba(0,0,0,0.05)'
          }}>
            <div style={{ textAlign: 'center', marginBottom: '30px' }}>
              <h1 style={{ color: '#1e293b', marginBottom: '10px' }}>Créer un compte</h1>
              <p style={{ color: '#64748b' }}>Rejoignez La Petite Annonce gratuitement</p>
              <div style={{ marginTop: '15px' }}>
                <span className="free-badge">✓ 100% Gratuit</span>
              </div>
            </div>

            {/* Social Register */}
            <div style={{ display: 'flex', gap: '12px', marginBottom: '25px' }}>
              <button style={{
                flex: 1,
                display: 'flex',
                alignItems: 'center',
                justifyContent: 'center',
                gap: '10px',
                padding: '14px',
                border: '1px solid #e2e8f0',
                borderRadius: '8px',
                background: 'white',
                cursor: 'pointer'
              }}>
                <FaGoogle color="#ea4335" size={18} />
                Google
              </button>
              <button style={{
                flex: 1,
                display: 'flex',
                alignItems: 'center',
                justifyContent: 'center',
                gap: '10px',
                padding: '14px',
                border: 'none',
                borderRadius: '8px',
                background: '#1877f2',
                color: 'white',
                cursor: 'pointer'
              }}>
                <FaFacebook size={18} />
                Facebook
              </button>
            </div>

            <div style={{ display: 'flex', alignItems: 'center', gap: '15px', margin: '25px 0', color: '#94a3b8' }}>
              <div style={{ flex: 1, height: '1px', background: '#e2e8f0' }} />
              <span>ou par email</span>
              <div style={{ flex: 1, height: '1px', background: '#e2e8f0' }} />
            </div>

            <form onSubmit={handleSubmit}>
              {error && (
                <div style={{ background: '#fef2f2', color: '#dc2626', padding: '12px', borderRadius: '8px', marginBottom: '20px', fontSize: '14px' }}>
                  {error}
                </div>
              )}

              <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: '15px', marginBottom: '20px' }}>
                <div>
                  <label style={{ display: 'block', marginBottom: '8px', color: '#475569', fontWeight: '500' }}>Prénom</label>
                  <input
                    type="text"
                    value={formData.first_name}
                    onChange={(e) => setFormData({...formData, first_name: e.target.value})}
                    required
                    style={{ width: '100%', padding: '14px', border: '1px solid #e2e8f0', borderRadius: '8px', fontSize: '16px' }}
                  />
                </div>
                <div>
                  <label style={{ display: 'block', marginBottom: '8px', color: '#475569', fontWeight: '500' }}>Nom</label>
                  <input
                    type="text"
                    value={formData.last_name}
                    onChange={(e) => setFormData({...formData, last_name: e.target.value})}
                    required
                    style={{ width: '100%', padding: '14px', border: '1px solid #e2e8f0', borderRadius: '8px', fontSize: '16px' }}
                  />
                </div>
              </div>

              <div style={{ marginBottom: '20px' }}>
                <label style={{ display: 'block', marginBottom: '8px', color: '#475569', fontWeight: '500' }}>Email</label>
                <input
                  type="email"
                  value={formData.email}
                  onChange={(e) => setFormData({...formData, email: e.target.value})}
                  required
                  style={{ width: '100%', padding: '14px', border: '1px solid #e2e8f0', borderRadius: '8px', fontSize: '16px' }}
                />
              </div>

              <div style={{ marginBottom: '20px' }}>
                <label style={{ display: 'block', marginBottom: '8px', color: '#475569', fontWeight: '500' }}>Téléphone</label>
                <input
                  type="tel"
                  value={formData.phone}
                  onChange={(e) => setFormData({...formData, phone: e.target.value})}
                  required
                  placeholder="06 12 34 56 78"
                  style={{ width: '100%', padding: '14px', border: '1px solid #e2e8f0', borderRadius: '8px', fontSize: '16px' }}
                />
              </div>

              <div style={{ marginBottom: '20px' }}>
                <label style={{ display: 'block', marginBottom: '8px', color: '#475569', fontWeight: '500' }}>Date de naissance</label>
                <input
                  type="date"
                  value={formData.birth_date}
                  onChange={(e) => setFormData({...formData, birth_date: e.target.value})}
                  required
                  style={{ width: '100%', padding: '14px', border: '1px solid #e2e8f0', borderRadius: '8px', fontSize: '16px' }}
                />
                <p style={{ fontSize: '12px', color: '#94a3b8', marginTop: '5px' }}>Vous devez avoir au moins 18 ans</p>
              </div>

              <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: '15px', marginBottom: '20px' }}>
                <div>
                  <label style={{ display: 'block', marginBottom: '8px', color: '#475569', fontWeight: '500' }}>Mot de passe</label>
                  <input
                    type="password"
                    value={formData.password}
                    onChange={(e) => setFormData({...formData, password: e.target.value})}
                    required
                    minLength={6}
                    style={{ width: '100%', padding: '14px', border: '1px solid #e2e8f0', borderRadius: '8px', fontSize: '16px' }}
                  />
                </div>
                <div>
                  <label style={{ display: 'block', marginBottom: '8px', color: '#475569', fontWeight: '500' }}>Confirmer</label>
                  <input
                    type="password"
                    value={formData.confirmPassword}
                    onChange={(e) => setFormData({...formData, confirmPassword: e.target.value})}
                    required
                    style={{ width: '100%', padding: '14px', border: '1px solid #e2e8f0', borderRadius: '8px', fontSize: '16px' }}
                  />
                </div>
              </div>

              <div style={{ marginBottom: '25px' }}>
                <label style={{ display: 'flex', alignItems: 'flex-start', gap: '10px', cursor: 'pointer' }}>
                  <input
                    type="checkbox"
                    checked={acceptTerms}
                    onChange={(e) => setAcceptTerms(e.target.checked)}
                    style={{ marginTop: '3px' }}
                  />
                  <span style={{ fontSize: '14px', color: '#64748b' }}>
                    J'accepte les <Link href="/legal/terms" style={{ color: '#2563eb' }}>conditions d'utilisation</Link> et la <Link href="/legal/privacy" style={{ color: '#2563eb' }}>politique de confidentialité</Link>
                  </span>
                </label>
              </div>

              <button
                type="submit"
                disabled={loading}
                style={{
                  width: '100%',
                  padding: '16px',
                  background: '#22c55e',
                  color: 'white',
                  border: 'none',
                  borderRadius: '8px',
                  fontSize: '16px',
                  fontWeight: '600',
                  cursor: loading ? 'not-allowed' : 'pointer',
                  opacity: loading ? 0.7 : 1
                }}
              >
                {loading ? 'Création...' : 'Créer mon compte gratuit'}
              </button>
            </form>

            <p style={{ textAlign: 'center', marginTop: '25px', color: '#64748b' }}>
              Déjà un compte ?{' '}
              <Link href="/login" style={{ color: '#2563eb', fontWeight: '600' }}>Se connecter</Link>
            </p>
          </div>
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