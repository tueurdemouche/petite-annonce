import React, { useState, useEffect } from 'react';
import {
  View,
  Text,
  StyleSheet,
  ScrollView,
  TouchableOpacity,
  RefreshControl,
  ActivityIndicator,
  SafeAreaView,
  Dimensions,
} from 'react-native';
import { useRouter } from 'expo-router';
import { Ionicons } from '@expo/vector-icons';
import { listingsAPI, favoritesAPI } from '../../src/services/api';
import { useAuthStore } from '../../src/stores/authStore';
import { CATEGORIES } from '../../src/constants/data';
import ListingCard from '../../src/components/ListingCard';

const { width } = Dimensions.get('window');

export default function HomeScreen() {
  const router = useRouter();
  const { isAuthenticated } = useAuthStore();
  const [boostedListings, setBoostedListings] = useState<any[]>([]);
  const [recentListings, setRecentListings] = useState<any[]>([]);
  const [favorites, setFavorites] = useState<string[]>([]);
  const [loading, setLoading] = useState(true);
  const [refreshing, setRefreshing] = useState(false);

  const fetchData = async () => {
    try {
      const [boostedRes, recentRes] = await Promise.all([
        listingsAPI.getBoosted(6),
        listingsAPI.getAll({ limit: 10 }),
      ]);
      setBoostedListings(boostedRes.data);
      setRecentListings(recentRes.data);

      if (isAuthenticated) {
        const favRes = await favoritesAPI.getAll();
        setFavorites(favRes.data.map((l: any) => l.id));
      }
    } catch (error) {
      console.error('Error fetching data:', error);
    } finally {
      setLoading(false);
      setRefreshing(false);
    }
  };

  useEffect(() => {
    fetchData();
  }, [isAuthenticated]);

  const handleRefresh = () => {
    setRefreshing(true);
    fetchData();
  };

  const toggleFavorite = async (listingId: string) => {
    if (!isAuthenticated) {
      router.push('/auth/login');
      return;
    }

    try {
      if (favorites.includes(listingId)) {
        await favoritesAPI.remove(listingId);
        setFavorites(favorites.filter((id) => id !== listingId));
      } else {
        await favoritesAPI.add(listingId);
        setFavorites([...favorites, listingId]);
      }
    } catch (error) {
      console.error('Error toggling favorite:', error);
    }
  };

  if (loading) {
    return (
      <View style={styles.loadingContainer}>
        <ActivityIndicator size="large" color="#2563EB" />
      </View>
    );
  }

  return (
    <SafeAreaView style={styles.container}>
      <ScrollView
        refreshControl={
          <RefreshControl refreshing={refreshing} onRefresh={handleRefresh} />
        }
        showsVerticalScrollIndicator={false}
      >
        {/* Header */}
        <View style={styles.header}>
          <View>
            <Text style={styles.appTitle}>Petite Annonce</Text>
            <Text style={styles.subtitle}>Trouvez la bonne affaire</Text>
          </View>
        </View>

        {/* Categories */}
        <View style={styles.section}>
          <Text style={styles.sectionTitle}>Catégories</Text>
          <View style={styles.categoriesGrid}>
            {Object.entries(CATEGORIES).map(([key, cat]) => (
              <TouchableOpacity
                key={key}
                style={styles.categoryCard}
                onPress={() => router.push(`/(tabs)/search?category=${key}`)}
              >
                <View style={styles.categoryIcon}>
                  <Ionicons
                    name={cat.icon as any}
                    size={28}
                    color="#2563EB"
                  />
                </View>
                <Text style={styles.categoryName}>{cat.name}</Text>
                <Text style={styles.categoryCount}>
                  {cat.sub_categories.length} sous-catégories
                </Text>
              </TouchableOpacity>
            ))}
          </View>
        </View>

        {/* Boosted Listings */}
        {boostedListings.length > 0 && (
          <View style={styles.section}>
            <View style={styles.sectionHeader}>
              <Text style={styles.sectionTitle}>Annonces sponsorisées</Text>
              <Ionicons name="star" size={18} color="#2563EB" />
            </View>
            <ScrollView
              horizontal
              showsHorizontalScrollIndicator={false}
              contentContainerStyle={styles.horizontalList}
            >
              {boostedListings.map((listing) => (
                <View key={listing.id} style={styles.horizontalCard}>
                  <ListingCard
                    listing={listing}
                    onFavorite={() => toggleFavorite(listing.id)}
                    isFavorite={favorites.includes(listing.id)}
                  />
                </View>
              ))}
            </ScrollView>
          </View>
        )}

        {/* Recent Listings */}
        <View style={styles.section}>
          <View style={styles.sectionHeader}>
            <Text style={styles.sectionTitle}>Annonces récentes</Text>
            <TouchableOpacity onPress={() => router.push('/(tabs)/search')}>
              <Text style={styles.seeAll}>Voir tout</Text>
            </TouchableOpacity>
          </View>
          <View style={styles.listingsGrid}>
            {recentListings.map((listing) => (
              <ListingCard
                key={listing.id}
                listing={listing}
                onFavorite={() => toggleFavorite(listing.id)}
                isFavorite={favorites.includes(listing.id)}
              />
            ))}
          </View>
        </View>
      </ScrollView>
    </SafeAreaView>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: '#F5F5F5',
  },
  loadingContainer: {
    flex: 1,
    justifyContent: 'center',
    alignItems: 'center',
  },
  header: {
    padding: 20,
    backgroundColor: '#FFF',
    marginBottom: 8,
  },
  appTitle: {
    fontSize: 28,
    fontWeight: '700',
    color: '#333',
  },
  subtitle: {
    fontSize: 15,
    color: '#666',
    marginTop: 4,
  },
  section: {
    backgroundColor: '#FFF',
    padding: 16,
    marginBottom: 8,
  },
  sectionHeader: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    marginBottom: 16,
  },
  sectionTitle: {
    fontSize: 18,
    fontWeight: '600',
    color: '#333',
  },
  seeAll: {
    fontSize: 14,
    color: '#2563EB',
    fontWeight: '500',
  },
  categoriesGrid: {
    flexDirection: 'row',
    flexWrap: 'wrap',
    marginTop: 12,
    gap: 12,
  },
  categoryCard: {
    width: (width - 56) / 2,
    backgroundColor: '#FFF',
    borderRadius: 12,
    padding: 16,
    borderWidth: 1,
    borderColor: '#EEE',
  },
  categoryIcon: {
    width: 50,
    height: 50,
    borderRadius: 25,
    backgroundColor: '#FFF5EE',
    justifyContent: 'center',
    alignItems: 'center',
    marginBottom: 12,
  },
  categoryName: {
    fontSize: 15,
    fontWeight: '600',
    color: '#333',
    marginBottom: 4,
  },
  categoryCount: {
    fontSize: 12,
    color: '#999',
  },
  horizontalList: {
    paddingRight: 16,
  },
  horizontalCard: {
    marginRight: 12,
    width: (width - 64) / 2,
  },
  listingsGrid: {
    flexDirection: 'row',
    flexWrap: 'wrap',
    justifyContent: 'space-between',
  },
});
