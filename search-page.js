'use client'
import { useState, useEffect } from 'react'
import { useSearchParams } from 'next/navigation'
import Link from 'next/link'
import Header from '../components/Header'
import Footer from '../components/Footer'

// Configuration des filtres par catégorie
const FILTERS_CONFIG = {
  auto: {
    brands: ['Audi', 'BMW', 'Citroen', 'Dacia', 'Fiat', 'Ford', 'Honda', 'Hyundai', 'Kia', 'Mercedes', 'Nissan', 'Opel', 'Peugeot', 'Renault', 'Seat', 'Skoda', 'Toyota', 'Volkswagen', 'Volvo'],
    fuel_types: ['Essence', 'Diesel', 'Hybride', 'Electrique', 'GPL'],
    transmissions: ['Manuelle', 'Automatique'],
    body_types: ['Berline', 'Break', 'Cabriolet', 'Citadine', 'Coupe', 'Monospace', 'Pick-up', 'SUV', '4x4'],
    year_ranges: [
      { label: 'Moins de 1 an', min: new Date().getFullYear(), max: new Date().getFullYear() + 1 },
      { label: 'Moins de 3 ans', min: new Date().getFullYear() - 3, max: new Date().getFullYear() + 1 },
      { label: 'Moins de 5 ans', min: new Date().getFullYear() - 5, max: new Date().getFullYear() + 1 },
      { label: 'Moins de 10 ans', min: new Date().getFullYear() - 10, max: new Date().getFullYear() + 1 }
    ],
    mileage_ranges: [
      { label: 'Moins de 10 000 km', max: 10000 },
      { label: 'Moins de 50 000 km', max: 50000 },
      { label: 'Moins de 100 000 km', max: 100000 },
      { label: 'Moins de 150 000 km', max: 150000 }
    ]
  },
  moto: {
    brands: ['Aprilia', 'BMW', 'Ducati', 'Harley-Davidson', 'Honda', 'Kawasaki', 'KTM', 'Suzuki', 'Triumph', 'Yamaha'],
    fuel_types: ['Essence', 'Electrique'],
    cylinder_ranges: [
      { label: 'Moins de 125 cm³', max: 125 },
      { label: '125 - 500 cm³', min: 125, max: 500 },
      { label: '500 - 750 cm³', min: 500, max: 750 },
      { label: '750 - 1000 cm³', min: 750, max: 1000 },
      { label: 'Plus de 1000 cm³', min: 1000 }
    ],
    moto_types: ['Roadster', 'Sportive', 'Trail', 'Custom', 'Touring', 'Scooter']
  },
  immobilier: {
    property_types: ['Appartement', 'Maison', 'Villa', 'Studio', 'Loft', 'Duplex', 'Terrain'],
    surface_ranges: [
      { label: 'Moins de 30 m²', max: 30 },
      { label: '30 - 50 m²', min: 30, max: 50 },
      { label: '50 - 80 m²', min: 50, max: 80 },
      { label: '80 - 120 m²', min: 80, max: 120 },
      { label: 'Plus de 120 m²', min: 120 }
    ],
    rooms_options: [1, 2, 3, 4, 5, '6+'],
    dpe_ratings: ['A', 'B', 'C', 'D', 'E', 'F', 'G'],
    ges_ratings: ['A', 'B', 'C', 'D', 'E', 'F', 'G']
  }
}

const PRICE_RANGES = {
  auto: [
    { label: 'Moins de 5 000 €', max: 5000 },
    { label: '5 000 - 10 000 €', min: 5000, max: 10000 },
    { label: '10 000 - 20 000 €', min: 10000, max: 20000 },
    { label: '20 000 - 30 000 €', min: 20000, max: 30000 },
    { label: '30 000 - 50 000 €', min: 30000, max: 50000 },
    { label: 'Plus de 50 000 €', min: 50000 }
  ],
  moto: [
    { label: 'Moins de 2 000 €', max: 2000 },
    { label: '2 000 - 5 000 €', min: 2000, max: 5000 },
    { label: '5 000 - 10 000 €', min: 5000, max: 10000 },
    { label: '10 000 - 15 000 €', min: 10000, max: 15000 },
    { label: 'Plus de 15 000 €', min: 15000 }
  ],
  immobilier: [
    { label: 'Moins de 100 000 €', max: 100000 },
    { label: '100 000 - 200 000 €', min: 100000, max: 200000 },
    { label: '200 000 - 300 000 €', min: 200000, max: 300000 },
    { label: '300 000 - 500 000 €', min: 300000, max: 500000 },
    { label: 'Plus de 500 000 €', min: 500000 }
  ]
}

export default function SearchPage() {
  const searchParams = useSearchParams()
  const [category, setCategory] = useState(searchParams.get('category') || 'auto')
  const [subCategory, setSubCategory] = useState(searchParams.get('sub_category') || '')
  const [listings, setListings] = useState([])
  const [loading, setLoading] = useState(true)
  const [showFilters, setShowFilters] = useState(true)
  
  // Filtres communs
  const [filters, setFilters] = useState({
    minPrice: '',
    maxPrice: '',
    location: '',
    // Auto
    brand: '',
    fuel_type: '',
    transmission: '',
    body_type: '',
    minYear: '',
    maxYear: '',
    maxMileage: '',
    // Moto
    minCylinder: '',
    maxCylinder: '',
    moto_type: '',
    // Immobilier
    property_type: '',
    minSurface: '',
    maxSurface: '',
    minRooms: '',
    dpe: '',
    ges: '',
    has_garden: false,
    handicap_access: false
  })

  useEffect(() => {
    fetchListings()
  }, [category, subCategory])

  const fetchListings = async () => {
    setLoading(true)
    try {
      const params = new URLSearchParams()
      params.append('category', category)
      if (subCategory) params.append('sub_category', subCategory)
      if (filters.minPrice) params.append('min_price', filters.minPrice)
      if (filters.maxPrice) params.append('max_price', filters.maxPrice)
      if (filters.location) params.append('location', filters.location)
      if (filters.brand) params.append('brand', filters.brand)
      if (filters.fuel_type) params.append('fuel_type', filters.fuel_type)
      if (filters.transmission) params.append('transmission', filters.transmission)
      if (filters.minYear) params.append('min_year', filters.minYear)
      if (filters.maxYear) params.append('max_year', filters.maxYear)
      if (filters.maxMileage) params.append('max_mileage', filters.maxMileage)
      if (filters.minSurface) params.append('min_surface', filters.minSurface)
      if (filters.maxSurface) params.append('max_surface', filters.maxSurface)
      if (filters.minRooms) params.append('min_rooms', filters.minRooms)
      if (filters.property_type) params.append('property_type', filters.property_type)
      if (filters.has_garden) params.append('has_garden', 'true')
      if (filters.handicap_access) params.append('handicap_access', 'true')
      
      params.append('limit', '50')
      
      const res = await fetch(`/api/listings?${params.toString()}`)
      if (res.ok) {
        const data = await res.json()
        setListings(data)
      }
    } catch (err) {
      console.error(err)
    } finally {
      setLoading(false)
    }
  }

  const handleSearch = (e) => {
    e.preventDefault()
    fetchListings()
  }

  const resetFilters = () => {
    setFilters({
      minPrice: '', maxPrice: '', location: '', brand: '', fuel_type: '', transmission: '',
      body_type: '', minYear: '', maxYear: '', maxMileage: '', minCylinder: '', maxCylinder: '',
      moto_type: '', property_type: '', minSurface: '', maxSurface: '', minRooms: '', dpe: '', ges: '',
      has_garden: false, handicap_access: false
    })
  }

  const formatPrice = (price) => new Intl.NumberFormat('fr-FR', { style: 'currency', currency: 'EUR', maximumFractionDigits: 0 }).format(price)

  const categories = [
    { key: 'auto', label: 'Voitures', icon: '🚗' },
    { key: 'moto', label: 'Motos & Scooters', icon: '🏍️' },
    { key: 'immobilier', label: 'Immobilier', icon: '🏠' }
  ]

  const subCategories = {
    auto: [
      { value: '', label: 'Toutes' },
      { value: 'voiture', label: 'Voitures' },
      { value: 'utilitaire', label: 'Utilitaires' },
      { value: 'camion', label: 'Camions' }
    ],
    moto: [
      { value: '', label: 'Toutes' },
      { value: 'moto_homologuee', label: 'Motos' },
      { value: 'scooter_homologue', label: 'Scooters' },
      { value: 'quad_homologue', label: 'Quads' }
    ],
    immobilier: [
      { value: '', label: 'Tous' },
      { value: 'vente_maison', label: 'Maisons' },
      { value: 'vente_appartement', label: 'Appartements' },
      { value: 'location_maison', label: 'Locations maison' },
      { value: 'location_appartement', label: 'Locations appart.' },
      { value: 'terrain', label: 'Terrains' }
    ]
  }

  return (
    <>
      <Header />
      
      <div style={{ background: '#f1f5f9', minHeight: 'calc(100vh - 200px)' }}>
        {/* Category Tabs */}
        <div style={{ background: 'white', borderBottom: '1px solid #e2e8f0' }}>
          <div style={{ maxWidth: '1200px', margin: '0 auto', padding: '0 20px' }}>
            <div style={{ display: 'flex', gap: '5px', paddingTop: '15px' }}>
              {categories.map(cat => (
                <button
                  key={cat.key}
                  onClick={() => { setCategory(cat.key); setSubCategory(''); resetFilters() }}
                  style={{
                    padding: '12px 24px',
                    background: category === cat.key ? '#1e40af' : 'transparent',
                    color: category === cat.key ? 'white' : '#475569',
                    border: 'none',
                    borderRadius: '8px 8px 0 0',
                    fontSize: '15px',
                    fontWeight: '600',
                    cursor: 'pointer',
                    display: 'flex',
                    alignItems: 'center',
                    gap: '8px'
                  }}
                >
                  <span>{cat.icon}</span> {cat.label}
                </button>
              ))}
            </div>
          </div>
        </div>

        {/* Sub-category tabs */}
        <div style={{ background: 'white', borderBottom: '1px solid #e2e8f0' }}>
          <div style={{ maxWidth: '1200px', margin: '0 auto', padding: '10px 20px' }}>
            <div style={{ display: 'flex', gap: '10px', flexWrap: 'wrap' }}>
              {subCategories[category]?.map(sub => (
                <button
                  key={sub.value}
                  onClick={() => setSubCategory(sub.value)}
                  style={{
                    padding: '8px 16px',
                    background: subCategory === sub.value ? '#eff6ff' : 'transparent',
                    color: subCategory === sub.value ? '#1e40af' : '#64748b',
                    border: subCategory === sub.value ? '1px solid #1e40af' : '1px solid #e2e8f0',
                    borderRadius: '20px',
                    fontSize: '14px',
                    cursor: 'pointer'
                  }}
                >
                  {sub.label}
                </button>
              ))}
            </div>
          </div>
        </div>

        <div style={{ maxWidth: '1200px', margin: '0 auto', padding: '20px', display: 'grid', gridTemplateColumns: '280px 1fr', gap: '25px' }}>
          
          {/* Filters Sidebar */}
          <div>
            <div style={{ background: 'white', borderRadius: '12px', padding: '20px', boxShadow: '0 2px 8px rgba(0,0,0,0.05)' }}>
              <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '20px' }}>
                <h2 style={{ margin: 0, fontSize: '18px', color: '#1e293b' }}>Filtres</h2>
                <button onClick={resetFilters} style={{ background: 'none', border: 'none', color: '#1e40af', cursor: 'pointer', fontSize: '13px' }}>Réinitialiser</button>
              </div>

              <form onSubmit={handleSearch}>
                {/* Localisation */}
                <div style={{ marginBottom: '20px' }}>
                  <label style={{ display: 'block', marginBottom: '8px', fontWeight: '500', color: '#475569', fontSize: '14px' }}>Localisation</label>
                  <input
                    type="text"
                    placeholder="Ville ou code postal"
                    value={filters.location}
                    onChange={(e) => setFilters({...filters, location: e.target.value})}
                    style={{ width: '100%', padding: '10px 12px', border: '1px solid #e2e8f0', borderRadius: '8px', fontSize: '14px', boxSizing: 'border-box' }}
                  />
                </div>

                {/* Prix */}
                <div style={{ marginBottom: '20px' }}>
                  <label style={{ display: 'block', marginBottom: '8px', fontWeight: '500', color: '#475569', fontSize: '14px' }}>Prix</label>
                  <div style={{ display: 'flex', gap: '10px' }}>
                    <input type="number" placeholder="Min" value={filters.minPrice} onChange={(e) => setFilters({...filters, minPrice: e.target.value})} style={{ flex: 1, padding: '10px', border: '1px solid #e2e8f0', borderRadius: '8px', fontSize: '14px' }} />
                    <input type="number" placeholder="Max" value={filters.maxPrice} onChange={(e) => setFilters({...filters, maxPrice: e.target.value})} style={{ flex: 1, padding: '10px', border: '1px solid #e2e8f0', borderRadius: '8px', fontSize: '14px' }} />
                  </div>
                </div>

                {/* Filtres Auto */}
                {category === 'auto' && (
                  <>
                    <div style={{ marginBottom: '20px' }}>
                      <label style={{ display: 'block', marginBottom: '8px', fontWeight: '500', color: '#475569', fontSize: '14px' }}>Marque</label>
                      <select value={filters.brand} onChange={(e) => setFilters({...filters, brand: e.target.value})} style={{ width: '100%', padding: '10px', border: '1px solid #e2e8f0', borderRadius: '8px', fontSize: '14px' }}>
                        <option value="">Toutes les marques</option>
                        {FILTERS_CONFIG.auto.brands.map(b => <option key={b} value={b}>{b}</option>)}
                      </select>
                    </div>

                    <div style={{ marginBottom: '20px' }}>
                      <label style={{ display: 'block', marginBottom: '8px', fontWeight: '500', color: '#475569', fontSize: '14px' }}>Carburant</label>
                      <select value={filters.fuel_type} onChange={(e) => setFilters({...filters, fuel_type: e.target.value})} style={{ width: '100%', padding: '10px', border: '1px solid #e2e8f0', borderRadius: '8px', fontSize: '14px' }}>
                        <option value="">Tous</option>
                        {FILTERS_CONFIG.auto.fuel_types.map(f => <option key={f} value={f}>{f}</option>)}
                      </select>
                    </div>

                    <div style={{ marginBottom: '20px' }}>
                      <label style={{ display: 'block', marginBottom: '8px', fontWeight: '500', color: '#475569', fontSize: '14px' }}>Boîte de vitesse</label>
                      <select value={filters.transmission} onChange={(e) => setFilters({...filters, transmission: e.target.value})} style={{ width: '100%', padding: '10px', border: '1px solid #e2e8f0', borderRadius: '8px', fontSize: '14px' }}>
                        <option value="">Toutes</option>
                        {FILTERS_CONFIG.auto.transmissions.map(t => <option key={t} value={t}>{t}</option>)}
                      </select>
                    </div>

                    <div style={{ marginBottom: '20px' }}>
                      <label style={{ display: 'block', marginBottom: '8px', fontWeight: '500', color: '#475569', fontSize: '14px' }}>Type de carrosserie</label>
                      <select value={filters.body_type} onChange={(e) => setFilters({...filters, body_type: e.target.value})} style={{ width: '100%', padding: '10px', border: '1px solid #e2e8f0', borderRadius: '8px', fontSize: '14px' }}>
                        <option value="">Tous</option>
                        {FILTERS_CONFIG.auto.body_types.map(b => <option key={b} value={b}>{b}</option>)}
                      </select>
                    </div>

                    <div style={{ marginBottom: '20px' }}>
                      <label style={{ display: 'block', marginBottom: '8px', fontWeight: '500', color: '#475569', fontSize: '14px' }}>Année</label>
                      <div style={{ display: 'flex', gap: '10px' }}>
                        <input type="number" placeholder="Min" value={filters.minYear} onChange={(e) => setFilters({...filters, minYear: e.target.value})} style={{ flex: 1, padding: '10px', border: '1px solid #e2e8f0', borderRadius: '8px', fontSize: '14px' }} />
                        <input type="number" placeholder="Max" value={filters.maxYear} onChange={(e) => setFilters({...filters, maxYear: e.target.value})} style={{ flex: 1, padding: '10px', border: '1px solid #e2e8f0', borderRadius: '8px', fontSize: '14px' }} />
                      </div>
                    </div>

                    <div style={{ marginBottom: '20px' }}>
                      <label style={{ display: 'block', marginBottom: '8px', fontWeight: '500', color: '#475569', fontSize: '14px' }}>Kilométrage max</label>
                      <select value={filters.maxMileage} onChange={(e) => setFilters({...filters, maxMileage: e.target.value})} style={{ width: '100%', padding: '10px', border: '1px solid #e2e8f0', borderRadius: '8px', fontSize: '14px' }}>
                        <option value="">Sans limite</option>
                        {FILTERS_CONFIG.auto.mileage_ranges.map(m => <option key={m.max} value={m.max}>{m.label}</option>)}
                      </select>
                    </div>
                  </>
                )}

                {/* Filtres Moto */}
                {category === 'moto' && (
                  <>
                    <div style={{ marginBottom: '20px' }}>
                      <label style={{ display: 'block', marginBottom: '8px', fontWeight: '500', color: '#475569', fontSize: '14px' }}>Marque</label>
                      <select value={filters.brand} onChange={(e) => setFilters({...filters, brand: e.target.value})} style={{ width: '100%', padding: '10px', border: '1px solid #e2e8f0', borderRadius: '8px', fontSize: '14px' }}>
                        <option value="">Toutes les marques</option>
                        {FILTERS_CONFIG.moto.brands.map(b => <option key={b} value={b}>{b}</option>)}
                      </select>
                    </div>

                    <div style={{ marginBottom: '20px' }}>
                      <label style={{ display: 'block', marginBottom: '8px', fontWeight: '500', color: '#475569', fontSize: '14px' }}>Cylindrée (cm³)</label>
                      <select value={filters.maxCylinder} onChange={(e) => setFilters({...filters, maxCylinder: e.target.value})} style={{ width: '100%', padding: '10px', border: '1px solid #e2e8f0', borderRadius: '8px', fontSize: '14px' }}>
                        <option value="">Toutes</option>
                        {FILTERS_CONFIG.moto.cylinder_ranges.map((c, i) => <option key={i} value={c.max || '9999'}>{c.label}</option>)}
                      </select>
                    </div>

                    <div style={{ marginBottom: '20px' }}>
                      <label style={{ display: 'block', marginBottom: '8px', fontWeight: '500', color: '#475569', fontSize: '14px' }}>Type de moto</label>
                      <select value={filters.moto_type} onChange={(e) => setFilters({...filters, moto_type: e.target.value})} style={{ width: '100%', padding: '10px', border: '1px solid #e2e8f0', borderRadius: '8px', fontSize: '14px' }}>
                        <option value="">Tous</option>
                        {FILTERS_CONFIG.moto.moto_types.map(t => <option key={t} value={t}>{t}</option>)}
                      </select>
                    </div>

                    <div style={{ marginBottom: '20px' }}>
                      <label style={{ display: 'block', marginBottom: '8px', fontWeight: '500', color: '#475569', fontSize: '14px' }}>Carburant</label>
                      <select value={filters.fuel_type} onChange={(e) => setFilters({...filters, fuel_type: e.target.value})} style={{ width: '100%', padding: '10px', border: '1px solid #e2e8f0', borderRadius: '8px', fontSize: '14px' }}>
                        <option value="">Tous</option>
                        {FILTERS_CONFIG.moto.fuel_types.map(f => <option key={f} value={f}>{f}</option>)}
                      </select>
                    </div>
                  </>
                )}

                {/* Filtres Immobilier */}
                {category === 'immobilier' && (
                  <>
                    <div style={{ marginBottom: '20px' }}>
                      <label style={{ display: 'block', marginBottom: '8px', fontWeight: '500', color: '#475569', fontSize: '14px' }}>Type de bien</label>
                      <select value={filters.property_type} onChange={(e) => setFilters({...filters, property_type: e.target.value})} style={{ width: '100%', padding: '10px', border: '1px solid #e2e8f0', borderRadius: '8px', fontSize: '14px' }}>
                        <option value="">Tous</option>
                        {FILTERS_CONFIG.immobilier.property_types.map(t => <option key={t} value={t}>{t}</option>)}
                      </select>
                    </div>

                    <div style={{ marginBottom: '20px' }}>
                      <label style={{ display: 'block', marginBottom: '8px', fontWeight: '500', color: '#475569', fontSize: '14px' }}>Surface (m²)</label>
                      <div style={{ display: 'flex', gap: '10px' }}>
                        <input type="number" placeholder="Min" value={filters.minSurface} onChange={(e) => setFilters({...filters, minSurface: e.target.value})} style={{ flex: 1, padding: '10px', border: '1px solid #e2e8f0', borderRadius: '8px', fontSize: '14px' }} />
                        <input type="number" placeholder="Max" value={filters.maxSurface} onChange={(e) => setFilters({...filters, maxSurface: e.target.value})} style={{ flex: 1, padding: '10px', border: '1px solid #e2e8f0', borderRadius: '8px', fontSize: '14px' }} />
                      </div>
                    </div>

                    <div style={{ marginBottom: '20px' }}>
                      <label style={{ display: 'block', marginBottom: '8px', fontWeight: '500', color: '#475569', fontSize: '14px' }}>Nombre de pièces min</label>
                      <select value={filters.minRooms} onChange={(e) => setFilters({...filters, minRooms: e.target.value})} style={{ width: '100%', padding: '10px', border: '1px solid #e2e8f0', borderRadius: '8px', fontSize: '14px' }}>
                        <option value="">Tous</option>
                        {FILTERS_CONFIG.immobilier.rooms_options.map(r => <option key={r} value={r}>{r} pièce{r !== 1 ? 's' : ''}{r === '6+' ? '' : ' et +'}</option>)}
                      </select>
                    </div>

                    <div style={{ marginBottom: '20px' }}>
                      <label style={{ display: 'block', marginBottom: '8px', fontWeight: '500', color: '#475569', fontSize: '14px' }}>DPE (Diagnostic énergétique)</label>
                      <div style={{ display: 'flex', gap: '5px', flexWrap: 'wrap' }}>
                        {FILTERS_CONFIG.immobilier.dpe_ratings.map(d => (
                          <button
                            key={d}
                            type="button"
                            onClick={() => setFilters({...filters, dpe: filters.dpe === d ? '' : d})}
                            style={{
                              width: '36px', height: '36px',
                              border: filters.dpe === d ? '2px solid #1e40af' : '1px solid #e2e8f0',
                              borderRadius: '6px',
                              background: d <= 'C' ? '#22c55e' : d <= 'E' ? '#f59e0b' : '#ef4444',
                              color: 'white', fontWeight: '700', cursor: 'pointer'
                            }}
                          >{d}</button>
                        ))}
                      </div>
                    </div>

                    <div style={{ marginBottom: '20px' }}>
                      <label style={{ display: 'block', marginBottom: '8px', fontWeight: '500', color: '#475569', fontSize: '14px' }}>GES (Gaz à effet de serre)</label>
                      <div style={{ display: 'flex', gap: '5px', flexWrap: 'wrap' }}>
                        {FILTERS_CONFIG.immobilier.ges_ratings.map(g => (
                          <button
                            key={g}
                            type="button"
                            onClick={() => setFilters({...filters, ges: filters.ges === g ? '' : g})}
                            style={{
                              width: '36px', height: '36px',
                              border: filters.ges === g ? '2px solid #1e40af' : '1px solid #e2e8f0',
                              borderRadius: '6px',
                              background: g <= 'C' ? '#a855f7' : g <= 'E' ? '#8b5cf6' : '#6366f1',
                              color: 'white', fontWeight: '700', cursor: 'pointer'
                            }}
                          >{g}</button>
                        ))}
                      </div>
                    </div>

                    <div style={{ marginBottom: '20px' }}>
                      <label style={{ display: 'flex', alignItems: 'center', gap: '10px', cursor: 'pointer' }}>
                        <input type="checkbox" checked={filters.has_garden} onChange={(e) => setFilters({...filters, has_garden: e.target.checked})} />
                        <span style={{ color: '#475569', fontSize: '14px' }}>Avec jardin</span>
                      </label>
                    </div>

                    <div style={{ marginBottom: '20px' }}>
                      <label style={{ display: 'flex', alignItems: 'center', gap: '10px', cursor: 'pointer' }}>
                        <input type="checkbox" checked={filters.handicap_access} onChange={(e) => setFilters({...filters, handicap_access: e.target.checked})} />
                        <span style={{ color: '#475569', fontSize: '14px' }}>Accès handicapé</span>
                      </label>
                    </div>
                  </>
                )}

                <button type="submit" style={{ width: '100%', padding: '14px', background: '#1e40af', color: 'white', border: 'none', borderRadius: '8px', fontSize: '15px', fontWeight: '600', cursor: 'pointer' }}>
                  Rechercher
                </button>
              </form>
            </div>
          </div>

          {/* Results */}
          <div>
            <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '20px' }}>
              <h2 style={{ margin: 0, color: '#1e293b' }}>
                {loading ? 'Recherche...' : `${listings.length} annonce${listings.length > 1 ? 's' : ''} trouvée${listings.length > 1 ? 's' : ''}`}
              </h2>
            </div>

            {loading ? (
              <div style={{ textAlign: 'center', padding: '60px' }}>
                <div style={{ fontSize: '40px', marginBottom: '15px' }}>🔍</div>
                <p style={{ color: '#64748b' }}>Recherche en cours...</p>
              </div>
            ) : listings.length === 0 ? (
              <div style={{ background: 'white', borderRadius: '16px', padding: '60px', textAlign: 'center' }}>
                <div style={{ fontSize: '60px', marginBottom: '20px' }}>😕</div>
                <h3 style={{ color: '#1e293b', marginBottom: '10px' }}>Aucune annonce trouvée</h3>
                <p style={{ color: '#64748b' }}>Essayez de modifier vos critères de recherche</p>
              </div>
            ) : (
              <div style={{ display: 'flex', flexDirection: 'column', gap: '15px' }}>
                {listings.map(listing => (
                  <Link key={listing.id} href={`/annonce/${listing.id}`} style={{ textDecoration: 'none' }}>
                    <div style={{ background: 'white', borderRadius: '12px', overflow: 'hidden', display: 'flex', boxShadow: '0 2px 8px rgba(0,0,0,0.05)', transition: 'box-shadow 0.2s' }}>
                      <div style={{ width: '220px', height: '165px', flexShrink: 0, background: '#f1f5f9' }}>
                        {listing.photos?.[0] ? (
                          <img src={listing.photos[0]} alt="" style={{ width: '100%', height: '100%', objectFit: 'cover' }} />
                        ) : (
                          <div style={{ width: '100%', height: '100%', display: 'flex', alignItems: 'center', justifyContent: 'center', color: '#94a3b8' }}>📷</div>
                        )}
                      </div>
                      <div style={{ flex: 1, padding: '18px', display: 'flex', flexDirection: 'column' }}>
                        <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'flex-start' }}>
                          <div>
                            <h3 style={{ margin: '0 0 8px 0', fontSize: '17px', color: '#1e293b' }}>{listing.title}</h3>
                            <div style={{ color: '#64748b', fontSize: '14px' }}>📍 {listing.location}</div>
                          </div>
                          <div style={{ fontSize: '22px', fontWeight: '700', color: '#16a34a' }}>{formatPrice(listing.price)}</div>
                        </div>
                        <div style={{ marginTop: 'auto', display: 'flex', gap: '12px', flexWrap: 'wrap' }}>
                          {listing.year && <span style={{ background: '#f1f5f9', padding: '4px 10px', borderRadius: '6px', fontSize: '13px', color: '#475569' }}>{listing.year}</span>}
                          {listing.mileage && <span style={{ background: '#f1f5f9', padding: '4px 10px', borderRadius: '6px', fontSize: '13px', color: '#475569' }}>{listing.mileage.toLocaleString()} km</span>}
                          {listing.fuel_type && <span style={{ background: '#f1f5f9', padding: '4px 10px', borderRadius: '6px', fontSize: '13px', color: '#475569' }}>{listing.fuel_type}</span>}
                          {listing.transmission && <span style={{ background: '#f1f5f9', padding: '4px 10px', borderRadius: '6px', fontSize: '13px', color: '#475569' }}>{listing.transmission}</span>}
                          {listing.surface_m2 && <span style={{ background: '#f1f5f9', padding: '4px 10px', borderRadius: '6px', fontSize: '13px', color: '#475569' }}>{listing.surface_m2} m²</span>}
                          {listing.rooms && <span style={{ background: '#f1f5f9', padding: '4px 10px', borderRadius: '6px', fontSize: '13px', color: '#475569' }}>{listing.rooms} pièces</span>}
                        </div>
                      </div>
                    </div>
                  </Link>
                ))}
              </div>
            )}
          </div>
        </div>
      </div>

      <Footer />
    </>
  )
}
