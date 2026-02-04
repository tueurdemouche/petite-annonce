'use client'
import { useState, useEffect } from 'react'
import { useRouter } from 'next/navigation'
import Link from 'next/link'
import Header from '../../components/Header'
import Footer from '../../components/Footer'

export default function MesFavorisPage() {
  const router = useRouter()
  const [user, setUser] = useState(null)
  const [favorites, setFavorites] = useState([])
  const [loading, setLoading] = useState(true)

  useEffect(() => {
    const token = localStorage.getItem('token')
    const savedUser = localStorage.getItem('user')
    if (!token) { router.push('/login'); return }
    if (savedUser) setUser(JSON.parse(savedUser))
    fetchFavorites()
  }, [router])

  const fetchFavorites = async () => {
    try {
      const token = localStorage.getItem('token')
      const res = await fetch('/api/favorites', { headers: { 'Authorization': `Bearer ${token}` } })
      if (res.ok) setFavorites(await res.json())
    } catch (err) {
      console.error(err)
    } finally {
      setLoading(false)
    }
  }

  const removeFavorite = async (id) => {
    try {
      const token = localStorage.getItem('token')
      const res = await fetch(`/api/favorites/${id}`, {
        method: 'DELETE',
        headers: { 'Authorization': `Bearer ${token}` }
      })
      if (res.ok) setFavorites(prev => prev.filter(f => f.id !== id))
    } catch (err) {
      alert('Erreur')
    }
  }

  const formatPrice = (price) => new Intl.NumberFormat('fr-FR', { style: 'currency', currency: 'EUR', maximumFractionDigits: 0 }).format(price)

  if (!user) return <><Header /><div style={{ minHeight: '60vh', display: 'flex', alignItems: 'center', justifyContent: 'center' }}><p>Chargement...</p></div><Footer /></>

  return (
    <>
      <Header />
      <div style={{ background: '#f1f5f9', minHeight: 'calc(100vh - 200px)', padding: '30px 20px' }}>
        <div style={{ maxWidth: '1000px', margin: '0 auto' }}>
          <h1 style={{ color: '#1e293b', marginBottom: '30px' }}>Mes favoris</h1>

          {loading ? (
            <div style={{ textAlign: 'center', padding: '60px' }}><p style={{ color: '#64748b' }}>Chargement...</p></div>
          ) : favorites.length === 0 ? (
            <div style={{ background: 'white', borderRadius: '16px', padding: '60px', textAlign: 'center' }}>
              <div style={{ fontSize: '60px', marginBottom: '20px' }}>❤️</div>
              <h2 style={{ color: '#1e293b', marginBottom: '10px' }}>Aucun favori</h2>
              <p style={{ color: '#64748b', marginBottom: '25px' }}>Ajoutez des annonces a vos favoris pour les retrouver facilement.</p>
              <Link href="/" style={{ display: 'inline-block', padding: '14px 30px', background: '#1e40af', color: 'white', borderRadius: '8px', textDecoration: 'none', fontWeight: '600' }}>Parcourir les annonces</Link>
            </div>
          ) : (
            <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fill, minmax(300px, 1fr))', gap: '20px' }}>
              {favorites.map(listing => (
                <div key={listing.id} style={{ background: 'white', borderRadius: '12px', overflow: 'hidden', boxShadow: '0 2px 8px rgba(0,0,0,0.05)' }}>
                  <Link href={`/annonce/${listing.id}`} style={{ display: 'block', position: 'relative' }}>
                    <img src={listing.photos?.[0] || '/placeholder.jpg'} alt="" style={{ width: '100%', height: '180px', objectFit: 'cover' }} />
                    <button 
                      onClick={(e) => { e.preventDefault(); removeFavorite(listing.id) }}
                      style={{ position: 'absolute', top: '10px', right: '10px', width: '36px', height: '36px', borderRadius: '50%', background: 'white', border: 'none', cursor: 'pointer', fontSize: '18px', boxShadow: '0 2px 8px rgba(0,0,0,0.15)' }}
                    >
                      ❤️
                    </button>
                  </Link>
                  <div style={{ padding: '15px' }}>
                    <div style={{ fontSize: '20px', fontWeight: '700', color: '#16a34a', marginBottom: '8px' }}>{formatPrice(listing.price)}</div>
                    <Link href={`/annonce/${listing.id}`} style={{ fontSize: '16px', fontWeight: '600', color: '#1e293b', textDecoration: 'none', display: 'block', marginBottom: '8px' }}>{listing.title}</Link>
                    <div style={{ color: '#64748b', fontSize: '14px' }}>📍 {listing.location}</div>
                  </div>
                </div>
              ))}
            </div>
          )}
        </div>
      </div>
      <Footer />
    </>
  )
}
