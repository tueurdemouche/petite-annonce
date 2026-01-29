import React from 'react';
import { View, Text, StyleSheet, TouchableOpacity, Image, Dimensions } from 'react-native';
import { Ionicons } from '@expo/vector-icons';
import { useRouter } from 'expo-router';
import { format } from 'date-fns';
import { fr } from 'date-fns/locale';

const { width } = Dimensions.get('window');
const cardWidth = (width - 48) / 2;

interface ListingCardProps {
  listing: any;
  onFavorite?: () => void;
  isFavorite?: boolean;
}

export default function ListingCard({ listing, onFavorite, isFavorite }: ListingCardProps) {
  const router = useRouter();

  const formatPrice = (price: number) => {
    return new Intl.NumberFormat('fr-FR', {
      style: 'currency',
      currency: 'EUR',
      maximumFractionDigits: 0,
    }).format(price);
  };

  return (
    <TouchableOpacity
      style={[styles.card, listing.is_boosted && styles.boostedCard]}
      onPress={() => router.push(`/listing/${listing.id}`)}
    >
      {listing.is_boosted && (
        <View style={styles.boostedBadge}>
          <Ionicons name="star" size={12} color="#FFF" />
          <Text style={styles.boostedText}>Sponsorisé</Text>
        </View>
      )}
      
      <View style={styles.imageContainer}>
        {listing.photos && listing.photos.length > 0 ? (
          <Image
            source={{ uri: listing.photos[0] }}
            style={styles.image}
            resizeMode="cover"
          />
        ) : (
          <View style={styles.noImage}>
            <Ionicons name="image-outline" size={40} color="#CCC" />
          </View>
        )}
        
        {onFavorite && (
          <TouchableOpacity style={styles.favoriteBtn} onPress={onFavorite}>
            <Ionicons
              name={isFavorite ? 'heart' : 'heart-outline'}
              size={22}
              color={isFavorite ? '#FF4444' : '#FFF'}
            />
          </TouchableOpacity>
        )}
      </View>

      <View style={styles.content}>
        <Text style={styles.price}>{formatPrice(listing.price)}</Text>
        <Text style={styles.title} numberOfLines={2}>{listing.title}</Text>
        
        <View style={styles.locationRow}>
          <Ionicons name="location-outline" size={14} color="#666" />
          <Text style={styles.location} numberOfLines={1}>{listing.location}</Text>
        </View>
        
        <Text style={styles.date}>
          {format(new Date(listing.created_at), 'dd MMM', { locale: fr })}
        </Text>
      </View>
    </TouchableOpacity>
  );
}

const styles = StyleSheet.create({
  card: {
    width: cardWidth,
    backgroundColor: '#FFF',
    borderRadius: 12,
    marginBottom: 16,
    overflow: 'hidden',
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.1,
    shadowRadius: 4,
    elevation: 3,
  },
  boostedCard: {
    borderWidth: 2,
    borderColor: '#2563EB',
  },
  boostedBadge: {
    position: 'absolute',
    top: 8,
    left: 8,
    backgroundColor: '#2563EB',
    flexDirection: 'row',
    alignItems: 'center',
    paddingHorizontal: 8,
    paddingVertical: 4,
    borderRadius: 12,
    zIndex: 10,
  },
  boostedText: {
    color: '#FFF',
    fontSize: 10,
    fontWeight: '600',
    marginLeft: 4,
  },
  imageContainer: {
    width: '100%',
    height: cardWidth * 0.8,
    backgroundColor: '#F0F0F0',
  },
  image: {
    width: '100%',
    height: '100%',
  },
  noImage: {
    flex: 1,
    justifyContent: 'center',
    alignItems: 'center',
  },
  favoriteBtn: {
    position: 'absolute',
    top: 8,
    right: 8,
    width: 36,
    height: 36,
    borderRadius: 18,
    backgroundColor: 'rgba(0,0,0,0.4)',
    justifyContent: 'center',
    alignItems: 'center',
  },
  content: {
    padding: 10,
  },
  price: {
    fontSize: 16,
    fontWeight: '700',
    color: '#2563EB',
    marginBottom: 4,
  },
  title: {
    fontSize: 13,
    fontWeight: '500',
    color: '#333',
    marginBottom: 6,
    lineHeight: 18,
  },
  locationRow: {
    flexDirection: 'row',
    alignItems: 'center',
    marginBottom: 4,
  },
  location: {
    fontSize: 11,
    color: '#666',
    marginLeft: 4,
    flex: 1,
  },
  date: {
    fontSize: 10,
    color: '#999',
  },
});
