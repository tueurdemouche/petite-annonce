'use client'
import { useState, useEffect } from 'react'
import { useRouter } from 'next/navigation'
import Header from '../../components/Header'
import Footer from '../../components/Footer'

export default function ParametresPage() {
  const router = useRouter()
  const [user, setUser] = useState(null)
  const [darkMode, setDarkMode] = useState(false)
  const [notifications, setNotifications] = useState(true)
  const [loading, setLoading] = useState(false)
  const [success, setSuccess] = useState('')

  useEffect(() => {
    const token = localStorage.getItem('token')
    const savedUser = localStorage.getItem('user')
    if (!token) { router.push('/login'); return }
    if (savedUser) setUser(JSON.parse(savedUser))
    
    // Load theme preference
    const savedTheme = localStorage.getItem('theme')
    if (savedTheme === 'dark') {
      setDarkMode(true)
      document.documentElement.setAttribute('data-theme', 'dark')
    }
  }, [router])

  const toggleDarkMode = () => {
    const newMode = !darkMode
    setDarkMode(newMode)
    localStorage.setItem('theme', newMode ? 'dark' : 'light')
    document.documentElement.setAttribute('data-theme', newMode ? 'dark' : 'light')
    
    // Apply theme globally
    if (newMode) {
      document.body.style.background = '#1e293b'
      document.body.style.color = '#f1f5f9'
    } else {
      document.body.style.background = ''
      document.body.style.color = ''
    }
  }

  const handleLogout = () => {
    localStorage.removeItem('token')
    localStorage.removeItem('user')
    router.push('/')
  }

  const handleDeleteAccount = async () => {
    if (!confirm('Etes-vous sur de vouloir supprimer votre compte ? Cette action est irreversible.')) return
    if (!confirm('Toutes vos annonces et messages seront supprimes. Confirmer ?')) return
    
    alert('Fonctionnalite bientot disponible. Contactez-nous a contact@lapetiteannonce.fr')
  }

  const theme = {
    bg: darkMode ? '#0f172a' : '#f1f5f9',
    card: darkMode ? '#1e293b' : 'white',
    text: darkMode ? '#f1f5f9' : '#1e293b',
    textMuted: darkMode ? '#94a3b8' : '#64748b',
    border: darkMode ? '#334155' : '#e2e8f0'
  }

  if (!user) return <><Header /><div style={{ minHeight: '60vh', display: 'flex', alignItems: 'center', justifyContent: 'center' }}><p>Chargement...</p></div><Footer /></>

  return (
    <>
      <Header />
      <div style={{ background: theme.bg, minHeight: 'calc(100vh - 200px)', padding: '30px 20px', transition: 'background 0.3s' }}>
        <div style={{ maxWidth: '700px', margin: '0 auto' }}>
          <h1 style={{ color: theme.text, marginBottom: '30px' }}>Parametres</h1>

          {success && (
            <div style={{ background: '#dcfce7', color: '#166534', padding: '15px', borderRadius: '10px', marginBottom: '20px' }}>
              {success}
            </div>
          )}

          {/* Profile Section */}
          <div style={{ background: theme.card, borderRadius: '16px', padding: '25px', marginBottom: '20px', boxShadow: '0 2px 8px rgba(0,0,0,0.05)' }}>
            <h2 style={{ color: theme.text, marginBottom: '20px', fontSize: '18px' }}>Mon profil</h2>
            
            <div style={{ display: 'flex', alignItems: 'center', gap: '20px', marginBottom: '25px' }}>
              <div style={{ width: '70px', height: '70px', borderRadius: '50%', background: '#1e40af', color: 'white', display: 'flex', alignItems: 'center', justifyContent: 'center', fontSize: '28px', fontWeight: '600' }}>
                {user.pseudo?.charAt(0).toUpperCase() || user.first_name?.charAt(0).toUpperCase()}
              </div>
              <div>
                <div style={{ fontSize: '20px', fontWeight: '600', color: theme.text }}>{user.pseudo || user.first_name}</div>
                <div style={{ color: theme.textMuted }}>{user.email}</div>
                <div style={{ marginTop: '5px' }}>
                  {user.email_verified ? (
                    <span style={{ background: '#dcfce7', color: '#166534', padding: '4px 10px', borderRadius: '20px', fontSize: '12px' }}>Email verifie ✓</span>
                  ) : (
                    <span style={{ background: '#fef3c7', color: '#92400e', padding: '4px 10px', borderRadius: '20px', fontSize: '12px' }}>Email non verifie</span>
                  )}
                </div>
              </div>
            </div>

            <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: '15px' }}>
              <div>
                <label style={{ display: 'block', color: theme.textMuted, fontSize: '13px', marginBottom: '5px' }}>Prenom</label>
                <div style={{ color: theme.text, fontWeight: '500' }}>{user.first_name}</div>
              </div>
              <div>
                <label style={{ display: 'block', color: theme.textMuted, fontSize: '13px', marginBottom: '5px' }}>Nom</label>
                <div style={{ color: theme.text, fontWeight: '500' }}>{user.last_name}</div>
              </div>
              <div>
                <label style={{ display: 'block', color: theme.textMuted, fontSize: '13px', marginBottom: '5px' }}>Telephone</label>
                <div style={{ color: theme.text, fontWeight: '500' }}>{user.phone}</div>
              </div>
              <div>
                <label style={{ display: 'block', color: theme.textMuted, fontSize: '13px', marginBottom: '5px' }}>Date de naissance</label>
                <div style={{ color: theme.text, fontWeight: '500' }}>{user.birth_date}</div>
              </div>
            </div>
          </div>

          {/* Appearance Section */}
          <div style={{ background: theme.card, borderRadius: '16px', padding: '25px', marginBottom: '20px', boxShadow: '0 2px 8px rgba(0,0,0,0.05)' }}>
            <h2 style={{ color: theme.text, marginBottom: '20px', fontSize: '18px' }}>Apparence</h2>
            
            <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
              <div>
                <div style={{ color: theme.text, fontWeight: '500', marginBottom: '3px' }}>Mode sombre</div>
                <div style={{ color: theme.textMuted, fontSize: '14px' }}>Reduire la fatigue visuelle en soiree</div>
              </div>
              <button 
                onClick={toggleDarkMode}
                style={{ 
                  width: '56px', 
                  height: '30px', 
                  borderRadius: '15px', 
                  background: darkMode ? '#1e40af' : '#e2e8f0',
                  border: 'none',
                  cursor: 'pointer',
                  position: 'relative',
                  transition: 'background 0.3s'
                }}
              >
                <div style={{
                  width: '24px',
                  height: '24px',
                  borderRadius: '50%',
                  background: 'white',
                  position: 'absolute',
                  top: '3px',
                  left: darkMode ? '29px' : '3px',
                  transition: 'left 0.3s',
                  boxShadow: '0 1px 3px rgba(0,0,0,0.2)'
                }} />
              </button>
            </div>
          </div>

          {/* Notifications Section */}
          <div style={{ background: theme.card, borderRadius: '16px', padding: '25px', marginBottom: '20px', boxShadow: '0 2px 8px rgba(0,0,0,0.05)' }}>
            <h2 style={{ color: theme.text, marginBottom: '20px', fontSize: '18px' }}>Notifications</h2>
            
            <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '20px' }}>
              <div>
                <div style={{ color: theme.text, fontWeight: '500', marginBottom: '3px' }}>Notifications par email</div>
                <div style={{ color: theme.textMuted, fontSize: '14px' }}>Recevoir les nouveaux messages par email</div>
              </div>
              <button 
                onClick={() => setNotifications(!notifications)}
                style={{ 
                  width: '56px', 
                  height: '30px', 
                  borderRadius: '15px', 
                  background: notifications ? '#22c55e' : '#e2e8f0',
                  border: 'none',
                  cursor: 'pointer',
                  position: 'relative',
                  transition: 'background 0.3s'
                }}
              >
                <div style={{
                  width: '24px',
                  height: '24px',
                  borderRadius: '50%',
                  background: 'white',
                  position: 'absolute',
                  top: '3px',
                  left: notifications ? '29px' : '3px',
                  transition: 'left 0.3s',
                  boxShadow: '0 1px 3px rgba(0,0,0,0.2)'
                }} />
              </button>
            </div>
          </div>

          {/* Actions Section */}
          <div style={{ background: theme.card, borderRadius: '16px', padding: '25px', boxShadow: '0 2px 8px rgba(0,0,0,0.05)' }}>
            <h2 style={{ color: theme.text, marginBottom: '20px', fontSize: '18px' }}>Compte</h2>
            
            <button 
              onClick={handleLogout}
              style={{ 
                width: '100%', 
                padding: '14px', 
                background: '#eff6ff', 
                color: '#1e40af', 
                border: 'none', 
                borderRadius: '10px', 
                fontSize: '16px', 
                fontWeight: '600', 
                cursor: 'pointer',
                marginBottom: '12px'
              }}
            >
              Se deconnecter
            </button>
            
            <button 
              onClick={handleDeleteAccount}
              style={{ 
                width: '100%', 
                padding: '14px', 
                background: '#fef2f2', 
                color: '#dc2626', 
                border: 'none', 
                borderRadius: '10px', 
                fontSize: '16px', 
                fontWeight: '600', 
                cursor: 'pointer'
              }}
            >
              Supprimer mon compte
            </button>
          </div>
        </div>
      </div>
      <Footer />
    </>
  )
}
