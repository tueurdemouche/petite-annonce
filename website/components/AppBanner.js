'use client'
import { useState, useEffect } from 'react'
import { FaTimes, FaApple, FaGooglePlay, FaMobile } from 'react-icons/fa'

export default function AppBanner({ onClose }) {
  const [dismissed, setDismissed] = useState(false)

  useEffect(() => {
    const wasDismissed = localStorage.getItem('appBannerDismissed')
    if (wasDismissed) {
      setDismissed(true)
    }
  }, [])

  const handleDismiss = () => {
    localStorage.setItem('appBannerDismissed', 'true')
    setDismissed(true)
    if (onClose) onClose()
  }

  if (dismissed) return null

  return (
    <div className="app-banner">
      <div className="app-banner-content">
        <div style={{ display: 'flex', alignItems: 'center', gap: '15px' }}>
          <FaMobile size={30} style={{ color: '#3b82f6' }} />
          <div>
            <h3>Téléchargez notre application gratuite !</h3>
            <p>Accédez à vos annonces partout, recevez des notifications instantanées</p>
          </div>
        </div>
      </div>
      <div className="app-banner-buttons">
        <a href="#" className="app-store-btn">
          <FaApple size={20} /> App Store
        </a>
        <a href="#" className="app-store-btn">
          <FaGooglePlay size={18} /> Google Play
        </a>
      </div>
      <button className="close-banner" onClick={handleDismiss} aria-label="Fermer">
        <FaTimes />
      </button>
    </div>
  )
}