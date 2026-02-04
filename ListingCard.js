import Link from 'next/link'
import { FaMapMarkerAlt, FaHeart, FaRegHeart, FaStar } from 'react-icons/fa'

export default function ListingCard({ listing, isBoosted = false }) {
  const formatPrice = (price) => {
    return new Intl.NumberFormat('fr-FR', {
      style: 'currency',
      currency: 'EUR',
      minimumFractionDigits: 0
    }).format(price)
  }

  const formatDate = (dateString) => {
    const date = new Date(dateString)
    const now = new Date()
    const diff = now - date
    const days = Math.floor(diff / (1000 * 60 * 60 * 24))
    
    if (days === 0) return "Aujourd'hui"
    if (days === 1) return "Hier"
    if (days < 7) return `Il y a ${days} jours`
    return date.toLocaleDateString('fr-FR')
  }

  const getCategoryLabel = (category, subCategory) => {
    const labels = {
      'auto': 'Voiture',
      'voiture': 'Voiture',
      'utilitaire': 'Utilitaire',
      'camion': 'Camion',
      'moto_homologuee': 'Moto',
      'moto_non_homologuee': 'Moto',
      'scooter_homologue': 'Scooter',
      'quad_homologue': 'Quad',
      'quad_non_homologue': 'Quad',
      'vente_maison': 'Maison',
      'vente_appartement': 'Appartement',
      'location_maison': 'Location',
      'location_appartement': 'Location',
      'terrain': 'Terrain',
      'local_commercial': 'Local',
      'parking': 'Parking'
    }
    return labels[subCategory] || category
  }

  const defaultImage = 'data:image/svg+xml;base64,PHN2ZyB3aWR0aD0iMjgwIiBoZWlnaHQ9IjIwMCIgdmlld0JveD0iMCAwIDI4MCAyMDAiIGZpbGw9Im5vbmUiIHhtbG5zPSJodHRwOi8vd3d3LnczLm9yZy8yMDAwL3N2ZyI+CjxyZWN0IHdpZHRoPSIyODAiIGhlaWdodD0iMjAwIiBmaWxsPSIjRjFGNUY5Ii8+CjxwYXRoIGQ9Ik0xMjAgODBIMTYwTDE3MCAxMjBIMTEwTDEyMCA4MFoiIGZpbGw9IiNDQkQzREMiLz4KPGNpcmNsZSBjeD0iMTQwIiBjeT0iMTQwIiByPSIyMCIgZmlsbD0iI0NCRDNEQyIvPgo8L3N2Zz4='

  return (
    <Link href={`/annonce/${listing.id}`} className="listing-card">
      <img 
        src={listing.photos?.[0] || defaultImage}
        alt={listing.title}
        className="listing-image"
        onError={(e) => { e.target.src = defaultImage }}
      />
      
      <div className="listing-content">
        <div className="listing-header">
          <div>
            <h3 className="listing-title">{listing.title}</h3>
            <div className="listing-location">
              <FaMapMarkerAlt size={12} />
              <span>{listing.location}</span>
            </div>
          </div>
          <div className="listing-price">{formatPrice(listing.price)}</div>
        </div>
        
        <p className="listing-description">
          {listing.description}
        </p>
        
        <div className="listing-footer">
          <div style={{ display: 'flex', alignItems: 'center', gap: '15px' }}>
            <span className="listing-date">{formatDate(listing.created_at)}</span>
            <span style={{ 
              background: '#eff6ff', 
              color: '#2563eb', 
              padding: '4px 10px', 
              borderRadius: '20px', 
              fontSize: '12px',
              fontWeight: '500'
            }}>
              {getCategoryLabel(listing.category, listing.sub_category)}
            </span>
          </div>
          
          <div className="listing-badges">
            {isBoosted && (
              <span className="badge badge-boost">
                <FaStar size={10} style={{ marginRight: '4px' }} />
                A la une
              </span>
            )}
            <button 
              className="favorite-btn" 
              onClick={(e) => {
                e.preventDefault()
                // Handle favorite toggle
              }}
              title="Ajouter aux favoris"
            >
              <FaRegHeart />
            </button>
          </div>
        </div>
      </div>
    </Link>
  )
}
