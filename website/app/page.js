'use client'
import { useState, useEffect } from 'react'
import Header from '../components/Header'
import Footer from '../components/Footer'
import ListingCard from '../components/ListingCard'
import AppBanner from '../components/AppBanner'
import { FaCar, FaHome, FaMotorcycle, FaBuilding } from 'react-icons/fa'

export default function Home() {
  const [listings, setListings] = useState([])
  const [boostedListings, setBoostedListings] = useState([])
  const [loading, setLoading] = useState(true)
  const [searchQuery, setSearchQuery] = useState('')
  const [location, setLocation] = useState('')
  const [showAppBanner, setShowAppBanner] = useState(true)

  useEffect(() => {
    fetchListings()
    fetchBoostedListings()
  }, [])

  const fetchListings = async () => {
    try {
      const res = await fetch('/api/listings?limit=10')
      const data = await res.json()
      setListings(data)
    } catch (error) {
      console.error('Error fetching listings:', error)
    } finally {
      setLoading(false)
    }
  }

  const fetchBoostedListings = async () => {
    try {
      const res = await fetch('/api/listings/boosted?limit=6')
      const data = await res.json()
      setBoostedListings(data)
    } catch (error) {
      console.error('Error fetching boosted listings:', error)
    }
  }

  const categories = [
    { id: 'auto_moto', name: 'Voitures', icon: <FaCar />, sub: 'auto' },
    { id: 'auto_moto', name: 'Motos', icon: <FaMotorcycle />, sub: 'moto_homologuee' },
    { id: 'immobilier', name: 'Location', icon: <FaHome />, sub: 'location' },
    { id: 'immobilier', name: 'Vente Immo', icon: <FaBuilding />, sub: 'vente' },
  ]

  return (
    <>
      <Header />
      
      {/* Categories Bar */}
      <div className="categories-bar">
        <div className="categories-list">
          {categories.map((cat, idx) => (
            <a key={idx} href={`/search?category=${cat.id}&sub_category=${cat.sub}`} className="category-item">
              <span className="category-icon">{cat.icon}</span>
              <span>{cat.name}</span>
            </a>
          ))}
        </div>
      </div>

      <div className="page-container">
        {/* Left Sidebar Ad */}
        <div className="sidebar-left">
          <div className="ad-banner ad-banner-tall">
            <span>Espace<br/>Publicitaire<br/>160x600</span>
          </div>
        </div>

        {/* Main Content */}
        <main className="main-content">
          {/* Top Banner Ad */}
          <div className="ad-banner ad-banner-wide">
            <span>Espace Publicitaire - 728x90</span>
          </div>

          {/* App Download Banner */}
          {showAppBanner && (
            <AppBanner onClose={() => setShowAppBanner(false)} />
          )}

          {/* Hero Section */}
          <section className="hero">
            <h1>Petites annonces 100% gratuites</h1>
            <p>Achetez et vendez près de chez vous, simplement et gratuitement</p>
            <div className="hero-search">
              <input 
                type="text" 
                placeholder="Que recherchez-vous ?" 
                value={searchQuery}
                onChange={(e) => setSearchQuery(e.target.value)}
              />
              <input 
                type="text" 
                placeholder="Ville, département..." 
                value={location}
                onChange={(e) => setLocation(e.target.value)}
              />
              <button onClick={() => window.location.href = `/search?q=${searchQuery}&location=${location}`}>
                Rechercher
              </button>
            </div>
            <div style={{ marginTop: '20px' }}>
              <span className="free-badge">✓ Publication gratuite</span>
            </div>
          </section>

          {/* Boosted Listings */}
          {boostedListings.length > 0 && (
            <section className="listings-section">
              <h2 className="section-title">⭐ Annonces à la une</h2>
              <div className="listings-list">
                {boostedListings.map((listing) => (
                  <ListingCard key={listing.id} listing={listing} isBoosted />
                ))}
              </div>
            </section>
          )}

          {/* Medium Ad Banner */}
          <div className="ad-banner ad-banner-medium">
            <span>Espace Publicitaire<br/>300x250</span>
          </div>

          {/* Recent Listings */}
          <section className="listings-section">
            <h2 className="section-title">Annonces récentes</h2>
            {loading ? (
              <p style={{ textAlign: 'center', padding: '40px', color: '#64748b' }}>
                Chargement des annonces...
              </p>
            ) : listings.length > 0 ? (
              <div className="listings-list">
                {listings.map((listing) => (
                  <ListingCard key={listing.id} listing={listing} />
                ))}
              </div>
            ) : (
              <div style={{ textAlign: 'center', padding: '60px', background: 'white', borderRadius: '12px' }}>
                <p style={{ fontSize: '1.2rem', color: '#64748b', marginBottom: '20px' }}>
                  Aucune annonce pour le moment
                </p>
                <a href="/publish" className="btn btn-primary">
                  Publiez la première annonce !
                </a>
              </div>
            )}
          </section>

          {/* View More Button */}
          <div style={{ textAlign: 'center', marginTop: '30px' }}>
            <a href="/search" className="btn btn-outline" style={{ padding: '15px 40px' }}>
              Voir toutes les annonces
            </a>
          </div>
        </main>

        {/* Right Sidebar Ad */}
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