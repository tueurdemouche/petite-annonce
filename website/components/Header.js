'use client'
import { useState, useEffect } from 'react'
import Link from 'next/link'
import { FaSearch, FaUser, FaHeart, FaEnvelope, FaPlus, FaBars, FaTimes } from 'react-icons/fa'

export default function Header() {
  const [user, setUser] = useState(null)
  const [mobileMenuOpen, setMobileMenuOpen] = useState(false)

  useEffect(() => {
    // Check if user is logged in
    const token = typeof window !== 'undefined' ? localStorage.getItem('token') : null
    if (token) {
      fetchUser(token)
    }
  }, [])

  const fetchUser = async (token) => {
    try {
      const res = await fetch('/api/auth/me', {
        headers: { 'Authorization': `Bearer ${token}` }
      })
      if (res.ok) {
        const data = await res.json()
        setUser(data)
      }
    } catch (error) {
      console.error('Error fetching user:', error)
    }
  }

  return (
    <header className="header">
      {/* Top Bar */}
      <div className="header-top">
        <div className="header-top-content">
          <div style={{ display: 'flex', gap: '20px', alignItems: 'center' }}>
            <span>✓ 100% Gratuit</span>
            <span>✓ Sécurisé</span>
            <span>✓ Simple</span>
          </div>
          <div style={{ display: 'flex', gap: '20px' }}>
            <Link href="/about">A propos</Link>
            <Link href="/faq">Aide</Link>
            <Link href="/tarifs">Tarifs</Link>
          </div>
        </div>
      </div>

      {/* Main Header */}
      <div className="header-main">
        <Link href="/" className="logo">
          <img 
            src="https://customer-assets.emergentagent.com/job_db24388a-82c2-4b3b-8ac9-16f4666fc823/artifacts/7aplztfv_134afb203c288a31b364d8e63e677cfc0e52421db3e304a4550b64f6c522ef7b.png" 
            alt="La Petite Annonce" 
          />
          <span className="logo-text">La Petite Annonce</span>
        </Link>

        <div className="search-bar">
          <input 
            type="text" 
            className="search-input" 
            placeholder="Rechercher une annonce..." 
          />
          <select className="search-input" style={{ maxWidth: '200px' }}>
            <option value="">Toute la France</option>
            <option value="ile-de-france">Île-de-France</option>
            <option value="auvergne-rhone-alpes">Auvergne-Rhône-Alpes</option>
            <option value="nouvelle-aquitaine">Nouvelle-Aquitaine</option>
            <option value="occitanie">Occitanie</option>
            <option value="hauts-de-france">Hauts-de-France</option>
            <option value="provence-alpes-cote-azur">PACA</option>
            <option value="grand-est">Grand Est</option>
            <option value="pays-de-la-loire">Pays de la Loire</option>
            <option value="bretagne">Bretagne</option>
            <option value="normandie">Normandie</option>
            <option value="bourgogne-franche-comte">Bourgogne-Franche-Comté</option>
            <option value="centre-val-de-loire">Centre-Val de Loire</option>
            <option value="corse">Corse</option>
          </select>
          <button className="search-btn">
            <FaSearch />
          </button>
        </div>

        <div className="header-actions">
          {user ? (
            <>
              <Link href="/favorites" style={{ color: '#64748b', fontSize: '1.3rem' }} title="Favoris">
                <FaHeart />
              </Link>
              <Link href="/messages" style={{ color: '#64748b', fontSize: '1.3rem' }} title="Messages">
                <FaEnvelope />
              </Link>
              <Link href="/profile" className="btn btn-outline" style={{ display: 'flex', alignItems: 'center', gap: '8px' }}>
                <FaUser /> {user.first_name}
              </Link>
              <Link href="/publish" className="btn btn-success" style={{ display: 'flex', alignItems: 'center', gap: '8px' }}>
                <FaPlus /> Déposer une annonce
              </Link>
            </>
          ) : (
            <>
              <Link href="/login" className="btn btn-outline">
                Se connecter
              </Link>
              <Link href="/publish" className="btn btn-success" style={{ display: 'flex', alignItems: 'center', gap: '8px' }}>
                <FaPlus /> Déposer une annonce
              </Link>
            </>
          )}
        </div>

        {/* Mobile Menu Toggle */}
        <button 
          className="mobile-menu-toggle" 
          onClick={() => setMobileMenuOpen(!mobileMenuOpen)}
          style={{ display: 'none', background: 'none', fontSize: '1.5rem', color: '#64748b' }}
        >
          {mobileMenuOpen ? <FaTimes /> : <FaBars />}
        </button>
      </div>
    </header>
  )
}