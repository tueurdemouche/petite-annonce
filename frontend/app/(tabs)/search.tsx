import React, { useState, useEffect } from 'react';
import {
  View,
  Text,
  StyleSheet,
  TextInput,
  TouchableOpacity,
  FlatList,
  ActivityIndicator,
  SafeAreaView,
} from 'react-native';
import { useLocalSearchParams, useRouter } from 'expo-router';
import { Ionicons } from '@expo/vector-icons';
import { listingsAPI, favoritesAPI } from '../../src/services/api';
import { useAuthStore } from '../../src/stores/authStore';
import { CATEGORIES } from '../../src/constants/data';
import ListingCard from '../../src/components/ListingCard';
import FilterModal from '../../src/components/FilterModal';

export default function SearchScreen() {
  const params = useLocalSearchParams();
  const router = useRouter();
  const { isAuthenticated } = useAuthStore();

  const [searchQuery, setSearchQuery] = useState('');
  const [category, setCategory] = useState<string | null>(params.category as string || null);
  const [subCategory, setSubCategory] = useState<string | null>(null);
  const [listings, setListings] = useState<any[]>([]);
  const [favorites, setFavorites] = useState<string[]>([]);
  const [loading, setLoading] = useState(false);
  const [filters, setFilters] = useState<any>({});
  const [showFilters, setShowFilters] = useState(false);

  const fetchListings = async () => {
    setLoading(true);
    try {
      const params: any = {
        ...filters,
        location: searchQuery || undefined,
      };
      if (category) params.category = category;
      if (subCategory) params.sub_category = subCategory;

      const response = await listingsAPI.getAll(params);
      setListings(response.data);

      if (isAuthenticated) {
        const favRes = await favoritesAPI.getAll();
        setFavorites(favRes.data.map((l: any) => l.id));
      }
    } catch (error) {
      console.error('Error fetching listings:', error);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchListings();
  }, [category, subCategory, filters]);

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

  const currentCategory = category ? CATEGORIES[category as keyof typeof CATEGORIES] : null;

  return (
    <SafeAreaView style={styles.container}>
      {/* Search Header */}
      <View style={styles.header}>
        <View style={styles.searchBar}>
          <Ionicons name="search" size={20} color="#999" />
          <TextInput
            style={styles.searchInput}
            placeholder="Rechercher par ville..."
            value={searchQuery}
            onChangeText={setSearchQuery}
            onSubmitEditing={fetchListings}
            returnKeyType="search"
          />
          {searchQuery.length > 0 && (
            <TouchableOpacity onPress={() => setSearchQuery('')}>
              <Ionicons name="close-circle" size={20} color="#999" />
            </TouchableOpacity>
          )}
        </View>
        <TouchableOpacity
          style={styles.filterBtn}
          onPress={() => setShowFilters(true)}
        >
          <Ionicons name="options" size={22} color="#2563EB" />
        </TouchableOpacity>
      </View>

      {/* Category Tabs */}
      <View style={styles.categoryTabs}>
        <TouchableOpacity
          style={[styles.categoryTab, !category && styles.categoryTabActive]}
          onPress={() => { setCategory(null); setSubCategory(null); }}
        >
          <Text style={[styles.categoryTabText, !category && styles.categoryTabTextActive]}>
            Tous
          </Text>
        </TouchableOpacity>
        {Object.entries(CATEGORIES).map(([key, cat]) => (
          <TouchableOpacity
            key={key}
            style={[styles.categoryTab, category === key && styles.categoryTabActive]}
            onPress={() => { setCategory(key); setSubCategory(null); }}
          >
            <Text style={[styles.categoryTabText, category === key && styles.categoryTabTextActive]}>
              {cat.name}
            </Text>
          </TouchableOpacity>
        ))}
      </View>

      {/* Sub-category Tabs */}
      {currentCategory && (
        <View style={styles.subCategoryTabs}>
          <FlatList
            horizontal
            showsHorizontalScrollIndicator={false}
            data={[{ id: null, name: 'Tous' }, ...currentCategory.sub_categories]}
            keyExtractor={(item) => item.id || 'all'}
            renderItem={({ item }) => (
              <TouchableOpacity
                style={[
                  styles.subCategoryChip,
                  subCategory === item.id && styles.subCategoryChipActive,
                ]}
                onPress={() => setSubCategory(item.id)}
              >
                <Text
                  style={[
                    styles.subCategoryText,
                    subCategory === item.id && styles.subCategoryTextActive,
                  ]}
                >
                  {item.name}
                </Text>
              </TouchableOpacity>
            )}
          />
        </View>
      )}

      {/* Results */}
      {loading ? (
        <View style={styles.loadingContainer}>
          <ActivityIndicator size="large" color="#2563EB" />
        </View>
      ) : (
        <FlatList
          data={listings}
          numColumns={2}
          keyExtractor={(item) => item.id}
          contentContainerStyle={styles.listContent}
          columnWrapperStyle={styles.columnWrapper}
          renderItem={({ item }) => (
            <ListingCard
              listing={item}
              onFavorite={() => toggleFavorite(item.id)}
              isFavorite={favorites.includes(item.id)}
            />
          )}
          ListEmptyComponent={
            <View style={styles.emptyContainer}>
              <Ionicons name="search-outline" size={64} color="#DDD" />
              <Text style={styles.emptyText}>Aucune annonce trouvée</Text>
              <Text style={styles.emptySubtext}>
                Essayez de modifier vos filtres
              </Text>
            </View>
          }
        />
      )}

      {/* Filter Modal */}
      <FilterModal
        visible={showFilters}
        onClose={() => setShowFilters(false)}
        category={category || 'auto_moto'}
        filters={filters}
        onApply={setFilters}
      />
    </SafeAreaView>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: '#F5F5F5',
  },
  header: {
    flexDirection: 'row',
    padding: 16,
    backgroundColor: '#FFF',
    gap: 12,
  },
  searchBar: {
    flex: 1,
    flexDirection: 'row',
    alignItems: 'center',
    backgroundColor: '#F5F5F5',
    borderRadius: 12,
    paddingHorizontal: 12,
    height: 48,
  },
  searchInput: {
    flex: 1,
    fontSize: 15,
    marginLeft: 8,
    color: '#333',
  },
  filterBtn: {
    width: 48,
    height: 48,
    borderRadius: 12,
    backgroundColor: '#FFF5EE',
    justifyContent: 'center',
    alignItems: 'center',
  },
  categoryTabs: {
    flexDirection: 'row',
    backgroundColor: '#FFF',
    paddingHorizontal: 16,
    paddingBottom: 12,
    gap: 8,
  },
  categoryTab: {
    paddingHorizontal: 16,
    paddingVertical: 8,
    borderRadius: 20,
    backgroundColor: '#F5F5F5',
  },
  categoryTabActive: {
    backgroundColor: '#2563EB',
  },
  categoryTabText: {
    fontSize: 13,
    fontWeight: '500',
    color: '#666',
  },
  categoryTabTextActive: {
    color: '#FFF',
  },
  subCategoryTabs: {
    backgroundColor: '#FFF',
    paddingHorizontal: 16,
    paddingBottom: 12,
  },
  subCategoryChip: {
    paddingHorizontal: 14,
    paddingVertical: 6,
    borderRadius: 16,
    backgroundColor: '#F0F0F0',
    marginRight: 8,
  },
  subCategoryChipActive: {
    backgroundColor: '#333',
  },
  subCategoryText: {
    fontSize: 12,
    color: '#666',
  },
  subCategoryTextActive: {
    color: '#FFF',
  },
  loadingContainer: {
    flex: 1,
    justifyContent: 'center',
    alignItems: 'center',
  },
  listContent: {
    padding: 16,
  },
  columnWrapper: {
    justifyContent: 'space-between',
  },
  emptyContainer: {
    flex: 1,
    justifyContent: 'center',
    alignItems: 'center',
    paddingTop: 100,
  },
  emptyText: {
    fontSize: 18,
    fontWeight: '600',
    color: '#333',
    marginTop: 16,
  },
  emptySubtext: {
    fontSize: 14,
    color: '#999',
    marginTop: 8,
  },
});
