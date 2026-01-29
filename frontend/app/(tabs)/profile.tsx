import React, { useState, useEffect } from 'react';
import {
  View,
  Text,
  StyleSheet,
  ScrollView,
  TouchableOpacity,
  ActivityIndicator,
  SafeAreaView,
  Alert,
} from 'react-native';
import { useRouter } from 'expo-router';
import { Ionicons } from '@expo/vector-icons';
import { useAuthStore } from '../../src/stores/authStore';
import { listingsAPI, favoritesAPI } from '../../src/services/api';
import ListingCard from '../../src/components/ListingCard';

export default function ProfileScreen() {
  const router = useRouter();
  const { isAuthenticated, user, logout } = useAuthStore();
  const [activeTab, setActiveTab] = useState('annonces');
  const [myListings, setMyListings] = useState<any[]>([]);
  const [favorites, setFavorites] = useState<any[]>([]);
  const [stats, setStats] = useState<any>(null);
  const [loading, setLoading] = useState(true);

  const fetchData = async () => {
    if (!isAuthenticated) {
      setLoading(false);
      return;
    }

    try {
      const [listingsRes, favRes, statsRes] = await Promise.all([
        listingsAPI.getMine(),
        favoritesAPI.getAll(),
        listingsAPI.getMyStats(),
      ]);
      setMyListings(listingsRes.data);
      setFavorites(favRes.data);
      setStats(statsRes.data);
    } catch (error) {
      console.error('Error fetching profile data:', error);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchData();
  }, [isAuthenticated]);

  const handleLogout = () => {
    Alert.alert(
      'Déconnexion',
      'Êtes-vous sûr de vouloir vous déconnecter ?',
      [
        { text: 'Annuler', style: 'cancel' },
        {
          text: 'Déconnexion',
          style: 'destructive',
          onPress: () => {
            logout();
            router.replace('/');
          },
        },
      ]
    );
  };

  if (!isAuthenticated) {
    return (
      <SafeAreaView style={styles.container}>
        <View style={styles.emptyContainer}>
          <Ionicons name="person-circle-outline" size={80} color="#DDD" />
          <Text style={styles.emptyTitle}>Mon Profil</Text>
          <Text style={styles.emptyText}>
            Connectez-vous pour accéder à votre espace personnel
          </Text>
          <TouchableOpacity
            style={styles.loginBtn}
            onPress={() => router.push('/auth/login')}
          >
            <Text style={styles.loginBtnText}>Se connecter</Text>
          </TouchableOpacity>
          <TouchableOpacity
            style={styles.registerBtn}
            onPress={() => router.push('/auth/register')}
          >
            <Text style={styles.registerBtnText}>Créer un compte</Text>
          </TouchableOpacity>
        </View>
      </SafeAreaView>
    );
  }

  if (loading) {
    return (
      <View style={styles.loadingContainer}>
        <ActivityIndicator size="large" color="#2563EB" />
      </View>
    );
  }

  return (
    <SafeAreaView style={styles.container}>
      <ScrollView>
        {/* Profile Header */}
        <View style={styles.profileHeader}>
          <View style={styles.avatarCircle}>
            <Text style={styles.avatarText}>
              {user?.first_name?.[0]}{user?.last_name?.[0]}
            </Text>
          </View>
          <Text style={styles.userName}>
            {user?.first_name} {user?.last_name}
          </Text>
          <Text style={styles.userEmail}>{user?.email}</Text>
          
          <View style={styles.badges}>
            {user?.identity_verified ? (
              <View style={styles.verifiedBadge}>
                <Ionicons name="shield-checkmark" size={14} color="#4CAF50" />
                <Text style={styles.verifiedText}>Identité vérifiée</Text>
              </View>
            ) : (
              <TouchableOpacity
                style={styles.verifyBtn}
                onPress={() => router.push('/auth/verify')}
              >
                <Ionicons name="shield-outline" size={14} color="#2563EB" />
                <Text style={styles.verifyBtnText}>Vérifier mon identité</Text>
              </TouchableOpacity>
            )}
            {user?.is_admin && (
              <TouchableOpacity
                style={styles.adminBadge}
                onPress={() => router.push('/admin/')}
              >
                <Ionicons name="settings" size={14} color="#FFF" />
                <Text style={styles.adminText}>Admin</Text>
              </TouchableOpacity>
            )}
          </View>
        </View>

        {/* Stats */}
        {stats && (
          <View style={styles.statsContainer}>
            <View style={styles.statItem}>
              <Text style={styles.statValue}>{stats.active_listings}</Text>
              <Text style={styles.statLabel}>Actives</Text>
            </View>
            <View style={styles.statItem}>
              <Text style={styles.statValue}>{stats.pending_listings}</Text>
              <Text style={styles.statLabel}>En attente</Text>
            </View>
            <View style={styles.statItem}>
              <Text style={styles.statValue}>{stats.total_views}</Text>
              <Text style={styles.statLabel}>Vues</Text>
            </View>
            <View style={styles.statItem}>
              <Text style={styles.statValue}>{stats.unread_messages}</Text>
              <Text style={styles.statLabel}>Messages</Text>
            </View>
          </View>
        )}

        {/* Tabs */}
        <View style={styles.tabsContainer}>
          <TouchableOpacity
            style={[styles.tab, activeTab === 'annonces' && styles.tabActive]}
            onPress={() => setActiveTab('annonces')}
          >
            <Text style={[styles.tabText, activeTab === 'annonces' && styles.tabTextActive]}>
              Mes annonces
            </Text>
          </TouchableOpacity>
          <TouchableOpacity
            style={[styles.tab, activeTab === 'favoris' && styles.tabActive]}
            onPress={() => setActiveTab('favoris')}
          >
            <Text style={[styles.tabText, activeTab === 'favoris' && styles.tabTextActive]}>
              Favoris
            </Text>
          </TouchableOpacity>
        </View>

        {/* Listings */}
        <View style={styles.listingsContainer}>
          {activeTab === 'annonces' ? (
            myListings.length > 0 ? (
              <View style={styles.listingsGrid}>
                {myListings.map((listing) => (
                  <ListingCard key={listing.id} listing={listing} />
                ))}
              </View>
            ) : (
              <View style={styles.emptyListings}>
                <Ionicons name="document-outline" size={48} color="#DDD" />
                <Text style={styles.emptyListingsText}>Aucune annonce</Text>
              </View>
            )
          ) : favorites.length > 0 ? (
            <View style={styles.listingsGrid}>
              {favorites.map((listing) => (
                <ListingCard key={listing.id} listing={listing} />
              ))}
            </View>
          ) : (
            <View style={styles.emptyListings}>
              <Ionicons name="heart-outline" size={48} color="#DDD" />
              <Text style={styles.emptyListingsText}>Aucun favori</Text>
            </View>
          )}
        </View>

        {/* Legal Section */}
        <View style={styles.legalSection}>
          <Text style={styles.legalTitle}>Informations légales</Text>
          
          <TouchableOpacity
            style={styles.legalItem}
            onPress={() => router.push('/legal/privacy')}
          >
            <Ionicons name="shield-checkmark-outline" size={20} color="#666" />
            <Text style={styles.legalItemText}>Politique de Confidentialité</Text>
            <Ionicons name="chevron-forward" size={20} color="#CCC" />
          </TouchableOpacity>

          <TouchableOpacity
            style={styles.legalItem}
            onPress={() => router.push('/legal/cgu')}
          >
            <Ionicons name="document-text-outline" size={20} color="#666" />
            <Text style={styles.legalItemText}>Conditions d'Utilisation</Text>
            <Ionicons name="chevron-forward" size={20} color="#CCC" />
          </TouchableOpacity>

          <TouchableOpacity
            style={styles.legalItem}
            onPress={() => router.push('/legal/terms')}
          >
            <Ionicons name="cart-outline" size={20} color="#666" />
            <Text style={styles.legalItemText}>Conditions de Vente</Text>
            <Ionicons name="chevron-forward" size={20} color="#CCC" />
          </TouchableOpacity>

          <TouchableOpacity
            style={styles.legalItem}
            onPress={() => router.push('/legal/contact')}
          >
            <Ionicons name="mail-outline" size={20} color="#666" />
            <Text style={styles.legalItemText}>Nous Contacter</Text>
            <Ionicons name="chevron-forward" size={20} color="#CCC" />
          </TouchableOpacity>
        </View>

        {/* Logout */}
        <TouchableOpacity style={styles.logoutBtn} onPress={handleLogout}>
          <Ionicons name="log-out-outline" size={22} color="#FF4444" />
          <Text style={styles.logoutText}>Se déconnecter</Text>
        </TouchableOpacity>
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
  profileHeader: {
    backgroundColor: '#FFF',
    alignItems: 'center',
    paddingVertical: 30,
    paddingHorizontal: 20,
  },
  avatarCircle: {
    width: 80,
    height: 80,
    borderRadius: 40,
    backgroundColor: '#2563EB',
    justifyContent: 'center',
    alignItems: 'center',
    marginBottom: 12,
  },
  avatarText: {
    color: '#FFF',
    fontSize: 28,
    fontWeight: '700',
  },
  userName: {
    fontSize: 22,
    fontWeight: '600',
    color: '#333',
    marginBottom: 4,
  },
  userEmail: {
    fontSize: 14,
    color: '#666',
    marginBottom: 16,
  },
  badges: {
    flexDirection: 'row',
    gap: 8,
  },
  verifiedBadge: {
    flexDirection: 'row',
    alignItems: 'center',
    backgroundColor: '#E8F5E9',
    paddingHorizontal: 12,
    paddingVertical: 6,
    borderRadius: 16,
    gap: 4,
  },
  verifiedText: {
    fontSize: 12,
    color: '#4CAF50',
    fontWeight: '500',
  },
  verifyBtn: {
    flexDirection: 'row',
    alignItems: 'center',
    backgroundColor: '#EFF6FF',
    paddingHorizontal: 12,
    paddingVertical: 6,
    borderRadius: 16,
    gap: 4,
  },
  verifyBtnText: {
    fontSize: 12,
    color: '#2563EB',
    fontWeight: '500',
  },
  adminBadge: {
    flexDirection: 'row',
    alignItems: 'center',
    backgroundColor: '#333',
    paddingHorizontal: 12,
    paddingVertical: 6,
    borderRadius: 16,
    gap: 4,
  },
  adminText: {
    fontSize: 12,
    color: '#FFF',
    fontWeight: '500',
  },
  statsContainer: {
    flexDirection: 'row',
    backgroundColor: '#FFF',
    marginTop: 8,
    paddingVertical: 20,
  },
  statItem: {
    flex: 1,
    alignItems: 'center',
  },
  statValue: {
    fontSize: 22,
    fontWeight: '700',
    color: '#2563EB',
  },
  statLabel: {
    fontSize: 12,
    color: '#666',
    marginTop: 4,
  },
  tabsContainer: {
    flexDirection: 'row',
    backgroundColor: '#FFF',
    marginTop: 8,
    paddingHorizontal: 16,
  },
  tab: {
    flex: 1,
    paddingVertical: 16,
    alignItems: 'center',
    borderBottomWidth: 2,
    borderBottomColor: 'transparent',
  },
  tabActive: {
    borderBottomColor: '#2563EB',
  },
  tabText: {
    fontSize: 15,
    fontWeight: '500',
    color: '#999',
  },
  tabTextActive: {
    color: '#2563EB',
  },
  listingsContainer: {
    padding: 16,
  },
  listingsGrid: {
    flexDirection: 'row',
    flexWrap: 'wrap',
    justifyContent: 'space-between',
  },
  emptyListings: {
    alignItems: 'center',
    paddingVertical: 60,
  },
  emptyListingsText: {
    fontSize: 15,
    color: '#999',
    marginTop: 12,
  },
  logoutBtn: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'center',
    backgroundColor: '#FFF',
    padding: 16,
    marginTop: 8,
    marginBottom: 30,
    gap: 8,
  },
  logoutText: {
    fontSize: 16,
    color: '#FF4444',
    fontWeight: '500',
  },
  legalSection: {
    backgroundColor: '#FFF',
    marginTop: 8,
    padding: 16,
  },
  legalTitle: {
    fontSize: 16,
    fontWeight: '600',
    color: '#333',
    marginBottom: 12,
  },
  legalItem: {
    flexDirection: 'row',
    alignItems: 'center',
    paddingVertical: 14,
    borderBottomWidth: 1,
    borderBottomColor: '#F0F0F0',
    gap: 12,
  },
  legalItemText: {
    flex: 1,
    fontSize: 15,
    color: '#333',
  },
  emptyContainer: {
    flex: 1,
    justifyContent: 'center',
    alignItems: 'center',
    padding: 24,
  },
  emptyTitle: {
    fontSize: 24,
    fontWeight: '600',
    color: '#333',
    marginTop: 16,
    marginBottom: 8,
  },
  emptyText: {
    fontSize: 15,
    color: '#666',
    textAlign: 'center',
    marginBottom: 24,
  },
  loginBtn: {
    backgroundColor: '#2563EB',
    paddingHorizontal: 48,
    paddingVertical: 14,
    borderRadius: 12,
    marginBottom: 12,
  },
  loginBtnText: {
    color: '#FFF',
    fontSize: 16,
    fontWeight: '600',
  },
  registerBtn: {
    paddingHorizontal: 48,
    paddingVertical: 14,
  },
  registerBtnText: {
    color: '#2563EB',
    fontSize: 16,
    fontWeight: '500',
  },
});
