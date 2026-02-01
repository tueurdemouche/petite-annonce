'use client'
import { useState, useEffect, Suspense } from 'react'
import { useSearchParams } from 'next/navigation'
import Header from '../../components/Header'
import Footer from '../../components/Footer'
import ListingCard from '../../components/ListingCard'
import { FaFilter, FaTimes } from 'react-icons/fa'

function SearchContent() {
  const searchParams = useSearchParams()
  const [listings, setListings] = useState([])
  const [loading, setLoading] = useState(true)
  const [showFilters, setShowFilters] = useState(false)
  
  // Filters
  const [filters, setFilters] = useState({
    category: searchParams.get('category') || '',
    sub_category: searchParams.get('sub_category') || '',
    location: searchParams.get('location') || '',
    min_price: '',
    max_price: '',
    sort: 'recent'
  })

  const regions = [
    'Île-de-France', 'Auvergne-Rhône-Alpes', 'Nouvelle-Aquitaine', 'Occitanie',
    'Hauts-de-France', 'PACA', 'Grand Est', 'Pays de la Loire', 'Bretagne',
    'Normandie', 'Bourgogne-Franche-Comté', 'Centre-Val de Loire', 'Corse'
  ]

  const categories = [
    { value: 'auto_moto', label: 'Automobile' },
    { value: 'immobilier', label: 'Immobilier' }
  ]

  const subCategories = {
    auto_moto: [
      { value: 'auto', label: 'Voitures' },
      { value: 'moto_homologuee', label: 'Motos homologuées' },
      { value: 'moto_non_homologuee', label: 'Motos non homologuées' },
      { value: 'scooter', label: 'Scooters' },
      { value: 'quad_homologue', label: 'Quads homologués' },
      { value: 'quad_non_homologue', label: 'Quads non homologués' }
    ],
    immobilier: [
      { value: 'location', label: 'Location' },
      { value: 'colocation', label: 'Colocation' },
      { value: 'vente', label: 'Vente' }
    ]
  }

  useEffect(() => {
    fetchListings()
  }, [])

  const fetchListings = async () => {
    setLoading(true)
    try {
      const params = new URLSearchParams()
      if (filters.category) params.append('category', filters.category)
      if (filters.sub_category) params.append('sub_category', filters.sub_category)
      if (filters.location) params.append('location', filters.location)
      if (filters.min_price) params.append('min_price', filters.min_price)
      if (filters.max_price) params.append('max_price', filters.max_price)
      params.append('limit', '50')
      
      const res = await fetch(`/api/listings?${params.toString()}`)
      const data = await res.json()
      setListings(data)
    } catch (error) {
      console.error('Error:', error)
    } finally {
      setLoading(false)
    }
  }

  const handleSearch = () => {
    fetchListings()
  }

  const clearFilters = () => {
    setFilters({
      category: '',
      sub_category: '',
      location: '',
      min_price: '',
      max_price: '',
      sort: 'recent'
    })
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

        <main className="main-content">
          <div className="ad-banner ad-banner-wide">
            <span>Espace Publicitaire - 728x90</span>
          </div>

          {/* Filters Section */}
          <section className="filters-section">
            <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '15px' }}>
              <h2 style={{ fontSize: '1.2rem', color: '#1e293b' }}>Filtrer les annonces</h2>
              <button 
                onClick={clearFilters}
                style={{ background: 'none', color: '#64748b', fontSize: '14px', display: 'flex', alignItems: 'center', gap: '5px' }}
              >
                <FaTimes size={12} /> Réinitialiser
              </button>
            </div>
            
            <div className="filters-row">
              <div className="filter-group">
                <label className="filter-label">Catégorie</label>
                <select 
                  className="filter-select"
                  value={filters.category}
                  onChange={(e) => setFilters({...filters, category: e.target.value, sub_category: ''})}
                >
                  <option value="">Toutes</option>
                  {categories.map(cat => (
                    <option key={cat.value} value={cat.value}>{cat.label}</option>
                  ))}
                </select>
              </div>
              
              {filters.category && (
                <div className="filter-group">
                  <label className="filter-label">Sous-catégorie</label>
                  <select 
                    className="filter-select"
                    value={filters.sub_category}
                    onChange={(e) => setFilters({...filters, sub_category: e.target.value})}
                  >
                    <option value="">Toutes</option>
                    {subCategories[filters.category]?.map(sub => (
                      <option key={sub.value} value={sub.value}>{sub.label}</option>
                    ))}
                  </select>
                </div>
              )}
              
              <div className="filter-group">
                <label className="filter-label">Région</label>
                <select 
                  className="filter-select"
                  value={filters.location}
                  onChange={(e) => setFilters({...filters, location: e.target.value})}
                >
                  <option value="">Toute la France</option>
                  {regions.map(region => (
                    <option key={region} value={region}>{region}</option>
                  ))}
                </select>
              </div>
              
              <div className="filter-group">
                <label className="filter-label">Prix min</label>
                <input 
                  type="number" 
                  className="filter-input"
                  placeholder="0 €"
                  value={filters.min_price}
                  onChange={(e) => setFilters({...filters, min_price: e.target.value})}
                />
              </div>
              
              <div className="filter-group">
                <label className="filter-label">Prix max</label>
                <input 
                  type="number" 
                  className="filter-input"
                  placeholder="Illimité"
                  value={filters.max_price}
                  onChange={(e) => setFilters({...filters, max_price: e.target.value})}
                />
              </div>
              
              <div className="filter-group" style={{ display: 'flex', alignItems: 'flex-end' }}>
                <button onClick={handleSearch} className="btn btn-primary" style={{ width: '100%' }}>
                  <FaFilter style={{ marginRight: '8px' }} /> Rechercher
                </button>
              </div>
            </div>
          </section>

          {/* Results */}
          <section className="listings-section">
            <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '20px' }}>
              <h2 className="section-title" style={{ margin: 0 }}>
                {listings.length} annonce{listings.length > 1 ? 's' : ''} trouvée{listings.length > 1 ? 's' : ''}
              </h2>
              <select 
                className="filter-select" 
                style={{ width: 'auto' }}
                value={filters.sort}
                onChange={(e) => setFilters({...filters, sort: e.target.value})}
              >
                <option value="recent">Plus récentes</option>
                <option value="price_asc">Prix croissant</option>
                <option value="price_desc">Prix décroissant</option>
              </select>
            </div>
            
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
                  Aucune annonce ne correspond à vos critères
                </p>
                <button onClick={clearFilters} className="btn btn-outline">
                  Réinitialiser les filtres
                </button>
              </div>
            )}
          </section>
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

export default function SearchPage() {
  return (
    <Suspense fallback={<div style={{ padding: '40px', textAlign: 'center' }}>Chargement...</div>}>
      <SearchContent />
    </Suspense>
  )
}