'use client'
import { useState } from 'react'
import Link from 'next/link'
import { useRouter } from 'next/navigation'
import Header from '../../components/Header'
import Footer from '../../components/Footer'
import { FaEnvelope, FaLock, FaGoogle, FaFacebook, FaApple } from 'react-icons/fa'

export default function LoginPage() {
  const router = useRouter()
  const [formData, setFormData] = useState({ email: '', password: '' })
  const [loading, setLoading] = useState(false)
  const [error, setError] = useState('')

  const handleSubmit = async (e) => {
    e.preventDefault()
    setLoading(true)
    setError('')

    try {
      const res = await fetch('/api/auth/login', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(formData)
      })

      const data = await res.json()

      if (res.ok) {
        localStorage.setItem('token', data.access_token)
        router.push('/profile')
      } else {
        setError(data.detail || 'Erreur de connexion')
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

        <main className="main-content" style={{ maxWidth: '500px' }}>
          <div style={{
            background: 'white',
            padding: '40px',
            borderRadius: '16px',
            boxShadow: '0 4px 6px rgba(0,0,0,0.05)'
          }}>
            <div style={{ textAlign: 'center', marginBottom: '30px' }}>
              <h1 style={{ color: '#1e293b', marginBottom: '10px' }}>Connexion</h1>
              <p style={{ color: '#64748b' }}>Accédez à votre compte La Petite Annonce</p>
            </div>

            {/* Social Login */}
            <div style={{ display: 'flex', flexDirection: 'column', gap: '12px', marginBottom: '25px' }}>
              <button style={{
                display: 'flex',
                alignItems: 'center',
                justifyContent: 'center',
                gap: '12px',
                padding: '14px',
                border: '1px solid #e2e8f0',
                borderRadius: '8px',
                background: 'white',
                cursor: 'pointer',
                fontSize: '16px'
              }}>
                <FaGoogle color="#ea4335" size={20} />
                Continuer avec Google
              </button>
              <button style={{
                display: 'flex',
                alignItems: 'center',
                justifyContent: 'center',
                gap: '12px',
                padding: '14px',
                border: '1px solid #e2e8f0',
                borderRadius: '8px',
                background: '#1877f2',
                color: 'white',
                cursor: 'pointer',
                fontSize: '16px'
              }}>
                <FaFacebook size={20} />
                Continuer avec Facebook
              </button>
              <button style={{
                display: 'flex',
                alignItems: 'center',
                justifyContent: 'center',
                gap: '12px',
                padding: '14px',
                border: '1px solid #e2e8f0',
                borderRadius: '8px',
                background: '#000',
                color: 'white',
                cursor: 'pointer',
                fontSize: '16px'
              }}>
                <FaApple size={20} />
                Continuer avec Apple
              </button>
            </div>

            <div style={{
              display: 'flex',
              alignItems: 'center',
              gap: '15px',
              margin: '25px 0',
              color: '#94a3b8'
            }}>
              <div style={{ flex: 1, height: '1px', background: '#e2e8f0' }} />
              <span>ou</span>
              <div style={{ flex: 1, height: '1px', background: '#e2e8f0' }} />
            </div>

            {/* Email Login Form */}
            <form onSubmit={handleSubmit}>
              {error && (
                <div style={{
                  background: '#fef2f2',
                  color: '#dc2626',
                  padding: '12px',
                  borderRadius: '8px',
                  marginBottom: '20px',
                  fontSize: '14px'
                }}>
                  {error}
                </div>
              )}

              <div style={{ marginBottom: '20px' }}>
                <label style={{ display: 'block', marginBottom: '8px', color: '#475569', fontWeight: '500' }}>
                  Email
                </label>
                <div style={{ position: 'relative' }}>
                  <FaEnvelope style={{ position: 'absolute', left: '15px', top: '50%', transform: 'translateY(-50%)', color: '#94a3b8' }} />
                  <input
                    type="email"
                    value={formData.email}
                    onChange={(e) => setFormData({...formData, email: e.target.value})}
                    placeholder="votre@email.com"
                    required
                    style={{
                      width: '100%',
                      padding: '14px 14px 14px 45px',
                      border: '1px solid #e2e8f0',
                      borderRadius: '8px',
                      fontSize: '16px'
                    }}
                  />
                </div>
              </div>

              <div style={{ marginBottom: '20px' }}>
                <label style={{ display: 'block', marginBottom: '8px', color: '#475569', fontWeight: '500' }}>
                  Mot de passe
                </label>
                <div style={{ position: 'relative' }}>
                  <FaLock style={{ position: 'absolute', left: '15px', top: '50%', transform: 'translateY(-50%)', color: '#94a3b8' }} />
                  <input
                    type="password"
                    value={formData.password}
                    onChange={(e) => setFormData({...formData, password: e.target.value})}
                    placeholder="••••••••"
                    required
                    style={{
                      width: '100%',
                      padding: '14px 14px 14px 45px',
                      border: '1px solid #e2e8f0',
                      borderRadius: '8px',
                      fontSize: '16px'
                    }}
                  />
                </div>
              </div>

              <div style={{ textAlign: 'right', marginBottom: '20px' }}>
                <Link href="/forgot-password" style={{ color: '#2563eb', fontSize: '14px' }}>
                  Mot de passe oublié ?
                </Link>
              </div>

              <button
                type="submit"
                disabled={loading}
                style={{
                  width: '100%',
                  padding: '16px',
                  background: '#2563eb',
                  color: 'white',
                  border: 'none',
                  borderRadius: '8px',
                  fontSize: '16px',
                  fontWeight: '600',
                  cursor: loading ? 'not-allowed' : 'pointer',
                  opacity: loading ? 0.7 : 1
                }}
              >
                {loading ? 'Connexion...' : 'Se connecter'}
              </button>
            </form>

            <p style={{ textAlign: 'center', marginTop: '25px', color: '#64748b' }}>
              Pas encore de compte ?{' '}
              <Link href="/register" style={{ color: '#2563eb', fontWeight: '600' }}>
                S'inscrire gratuitement
              </Link>
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