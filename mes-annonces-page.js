'use client'
import { useState, useEffect } from 'react'
import { useRouter } from 'next/navigation'
import Link from 'next/link'
import Header from '../../components/Header'
import Footer from '../../components/Footer'

export default function MesAnnoncesPage() {
  const router = useRouter()
  const [user, setUser] = useState(null)
  const [listings, setListings] = useState([])
  const [loading, setLoading] = useState(true)
  const [stats, setStats] = useState(null)

  useEffect(() => {
    const token = localStorage.getItem('token')
    const savedUser = localStorage.getItem('user')
    if (!token) { router.push('/login'); return }
    if (savedUser) setUser(JSON.parse(savedUser))
    fetchData()
  }, [router])

  const fetchData = async () => {
    try {
      const token = localStorage.getItem('token')
      const [listingsRes, statsRes] = await Promise.all([
        fetch('/api/my-listings', { headers: { 'Authorization': `Bearer ${token}` } }),
        fetch('/api/my-stats', { headers: { 'Authorization': `Bearer ${token}` } })
      ])
      if (listingsRes.ok) setListings(await listingsRes.json())
      if (statsRes.ok) setStats(await statsRes.json())
    } catch (err) {
      console.error(err)
    } finally {
      setLoading(false)
    }
  }

  const deleteListing = async (id) => {
    if (!confirm('Supprimer cette annonce ?')) return
    try {
      const token = localStorage.getItem('token')
      const res = await fetch(`/api/listings/${id}`, {
        method: 'DELETE',
        headers: { 'Authorization': `Bearer ${token}` }
      })
      if (res.ok) setListings(prev => prev.filter(l => l.id !== id))
    } catch (err) {
      alert('Erreur lors de la suppression')
    }
  }

  const formatPrice = (price) => new Intl.NumberFormat('fr-FR', { style: 'currency', currency: 'EUR', maximumFractionDigits: 0 }).format(price)
  const formatDate = (date) => new Date(date).toLocaleDateString('fr-FR')

  const getStatusBadge = (status) => {
    const styles = {
      approved: { bg: '#dcfce7', color: '#166534', text: 'En ligne' },
      pending: { bg: '#fef3c7', color: '#92400e', text: 'En attente' },
      rejected: { bg: '#fee2e2', color: '#dc2626', text: 'Refusee' }
    }
    const s = styles[status] || styles.pending
    return <span style={{ background: s.bg, color: s.color, padding: '4px 12px', borderRadius: '20px', fontSize: '12px', fontWeight: '600' }}>{s.text}</span>
  }

  if (!user) return <><Header /><div style={{ minHeight: '60vh', display: 'flex', alignItems: 'center', justifyContent: 'center' }}><p>Chargement...</p></div><Footer /></>

  return (
    <>
      <Header />
      <div style={{ background: '#f1f5f9', minHeight: 'calc(100vh - 200px)', padding: '30px 20px' }}>
        <div style={{ maxWidth: '1000px', margin: '0 auto' }}>
          <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '30px' }}>
            <h1 style={{ color: '#1e293b', margin: 0 }}>Mes annonces</h1>
            <Link href="/deposer-annonce" style={{ padding: '12px 24px', background: '#1e40af', color: 'white', borderRadius: '8px', textDecoration: 'none', fontWeight: '600' }}>+ Nouvelle annonce</Link>
          </div>

          {stats && (
            <div style={{ display: 'grid', gridTemplateColumns: 'repeat(4, 1fr)', gap: '15px', marginBottom: '30px' }}>
              <div style={{ background: 'white', padding: '20px', borderRadius: '12px', textAlign: 'center' }}>
                <div style={{ fontSize: '28px', fontWeight: '700', color: '#1e40af' }}>{stats.total_listings}</div>
                <div style={{ color: '#64748b', fontSize: '14px' }}>Total</div>
              </div>
              <div style={{ background: 'white', padding: '20px', borderRadius: '12px', textAlign: 'center' }}>
                <div style={{ fontSize: '28px', fontWeight: '700', color: '#22c55e' }}>{stats.active_listings}</div>
                <div style={{ color: '#64748b', fontSize: '14px' }}>En ligne</div>
              </div>
              <div style={{ background: 'white', padding: '20px', borderRadius: '12px', textAlign: 'center' }}>
                <div style={{ fontSize: '28px', fontWeight: '700', color: '#f59e0b' }}>{stats.pending_listings}</div>
                <div style={{ color: '#64748b', fontSize: '14px' }}>En attente</div>
              </div>
              <div style={{ background: 'white', padding: '20px', borderRadius: '12px', textAlign: 'center' }}>
                <div style={{ fontSize: '28px', fontWeight: '700', color: '#8b5cf6' }}>{stats.unread_messages}</div>
                <div style={{ color: '#64748b', fontSize: '14px' }}>Messages</div>
              </div>
            </div>
          )}

          {loading ? (
            <div style={{ textAlign: 'center', padding: '60px' }}><p style={{ color: '#64748b' }}>Chargement...</p></div>
          ) : listings.length === 0 ? (
            <div style={{ background: 'white', borderRadius: '16px', padding: '60px', textAlign: 'center' }}>
              <div style={{ fontSize: '60px', marginBottom: '20px' }}>📝</div>
              <h2 style={{ color: '#1e293b', marginBottom: '10px' }}>Aucune annonce</h2>
              <p style={{ color: '#64748b', marginBottom: '25px' }}>Vous n'avez pas encore publie d'annonce.</p>
              <Link href="/deposer-annonce" style={{ display: 'inline-block', padding: '14px 30px', background: '#1e40af', color: 'white', borderRadius: '8px', textDecoration: 'none', fontWeight: '600' }}>Publier ma premiere annonce</Link>
            </div>
          ) : (
            <div style={{ display: 'flex', flexDirection: 'column', gap: '15px' }}>
              {listings.map(listing => (
                <div key={listing.id} style={{ background: 'white', borderRadius: '12px', overflow: 'hidden', display: 'flex', boxShadow: '0 2px 8px rgba(0,0,0,0.05)' }}>
                  <Link href={`/annonce/${listing.id}`} style={{ width: '200px', height: '150px', flexShrink: 0 }}>
                    <img src={listing.photos?.[0] || '/placeholder.jpg'} alt="" style={{ width: '100%', height: '100%', objectFit: 'cover' }} />
                  </Link>
                  <div style={{ flex: 1, padding: '20px', display: 'flex', flexDirection: 'column' }}>
                    <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'flex-start', marginBottom: '10px' }}>
                      <div>
                        <Link href={`/annonce/${listing.id}`} style={{ fontSize: '18px', fontWeight: '600', color: '#1e293b', textDecoration: 'none' }}>{listing.title}</Link>
                        <div style={{ color: '#64748b', fontSize: '14px', marginTop: '5px' }}>📍 {listing.location}</div>
                      </div>
                      <div style={{ fontSize: '20px', fontWeight: '700', color: '#16a34a' }}>{formatPrice(listing.price)}</div>
                    </div>
                    <div style={{ display: 'flex', gap: '15px', color: '#64748b', fontSize: '13px', marginBottom: '15px' }}>
                      <span>📅 {formatDate(listing.created_at)}</span>
                      <span>👁 {listing.views} vues</span>
                      {getStatusBadge(listing.status)}
                    </div>
                    <div style={{ marginTop: 'auto', display: 'flex', gap: '10px' }}>
                      <Link href={`/annonce/${listing.id}`} style={{ padding: '8px 16px', background: '#eff6ff', color: '#1e40af', borderRadius: '6px', textDecoration: 'none', fontSize: '14px', fontWeight: '500' }}>Voir</Link>
                      <button onClick={() => deleteListing(listing.id)} style={{ padding: '8px 16px', background: '#fef2f2', color: '#dc2626', border: 'none', borderRadius: '6px', fontSize: '14px', fontWeight: '500', cursor: 'pointer' }}>Supprimer</button>
                    </div>
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
