import React, { useState, useEffect } from 'react';
import {
  View,
  Text,
  StyleSheet,
  ScrollView,
  TouchableOpacity,
  ActivityIndicator,
  Alert,
  Image,
} from 'react-native';
import { useRouter } from 'expo-router';
import { Ionicons } from '@expo/vector-icons';
import { SafeAreaView } from 'react-native-safe-area-context';
import { adminAPI } from '../../src/services/api';
import { useAuthStore } from '../../src/stores/authStore';

export default function AdminScreen() {
  const router = useRouter();
  const { user } = useAuthStore();
  const [activeTab, setActiveTab] = useState('listings');
  const [stats, setStats] = useState<any>(null);
  const [pendingListings, setPendingListings] = useState<any[]>([]);
  const [pendingVerifications, setPendingVerifications] = useState<any[]>([]);
  const [reports, setReports] = useState<any[]>([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    if (!user?.is_admin) {
      router.replace('/');
      return;
    }
    fetchData();
  }, []);

  const fetchData = async () => {
    try {
      const [statsRes, listingsRes, verificationsRes, reportsRes] = await Promise.all([
        adminAPI.getStats(),
        adminAPI.getPendingListings(),
        adminAPI.getPendingVerifications(),
        adminAPI.getReports(),
      ]);
      setStats(statsRes.data);
      setPendingListings(listingsRes.data);
      setPendingVerifications(verificationsRes.data);
      setReports(reportsRes.data);
    } catch (error) {
      console.error('Error fetching admin data:', error);
    } finally {
      setLoading(false);
    }
  };

  const handleApproveListing = async (id: string) => {
    try {
      await adminAPI.approveListing(id);
      setPendingListings(pendingListings.filter((l) => l.id !== id));
      Alert.alert('Succès', 'Annonce approuvée');
    } catch (error) {
      console.error('Error approving listing:', error);
    }
  };

  const handleRejectListing = async (id: string) => {
    Alert.prompt(
      'Rejeter l\'annonce',
      'Raison du rejet (optionnel)',
      async (reason) => {
        try {
          await adminAPI.rejectListing(id, reason);
          setPendingListings(pendingListings.filter((l) => l.id !== id));
          Alert.alert('Succès', 'Annonce rejetée');
        } catch (error) {
          console.error('Error rejecting listing:', error);
        }
      },
      'plain-text'
    );
  };

  const handleVerifyIdentity = async (userId: string, approved: boolean) => {
    try {
      await adminAPI.verifyIdentity(userId, approved);
      setPendingVerifications(pendingVerifications.filter((v) => v.id !== userId));
      Alert.alert('Succès', `Identité ${approved ? 'vérifiée' : 'rejetée'}`);
    } catch (error) {
      console.error('Error verifying identity:', error);
    }
  };

  const handleResolveReport = async (reportId: string, action: string) => {
    try {
      await adminAPI.resolveReport(reportId, action);
      setReports(reports.filter((r) => r.id !== reportId));
      Alert.alert('Succès', 'Signalement traité');
    } catch (error) {
      console.error('Error resolving report:', error);
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
      {/* Header */}
      <View style={styles.header}>
        <TouchableOpacity onPress={() => router.back()}>
          <Ionicons name="arrow-back" size={24} color="#333" />
        </TouchableOpacity>
        <Text style={styles.headerTitle}>Administration</Text>
        <View style={{ width: 24 }} />
      </View>

      {/* Stats */}
      {stats && (
        <View style={styles.statsGrid}>
          <View style={styles.statCard}>
            <Text style={styles.statValue}>{stats.total_users}</Text>
            <Text style={styles.statLabel}>Utilisateurs</Text>
          </View>
          <View style={styles.statCard}>
            <Text style={styles.statValue}>{stats.pending_listings}</Text>
            <Text style={styles.statLabel}>En attente</Text>
          </View>
          <View style={styles.statCard}>
            <Text style={styles.statValue}>{stats.active_listings}</Text>
            <Text style={styles.statLabel}>Actives</Text>
          </View>
          <View style={styles.statCard}>
            <Text style={styles.statValue}>{stats.pending_reports}</Text>
            <Text style={styles.statLabel}>Signalements</Text>
          </View>
        </View>
      )}

      {/* Tabs */}
      <View style={styles.tabs}>
        <TouchableOpacity
          style={[styles.tab, activeTab === 'listings' && styles.tabActive]}
          onPress={() => setActiveTab('listings')}
        >
          <Text style={[styles.tabText, activeTab === 'listings' && styles.tabTextActive]}>
            Annonces ({pendingListings.length})
          </Text>
        </TouchableOpacity>
        <TouchableOpacity
          style={[styles.tab, activeTab === 'verifications' && styles.tabActive]}
          onPress={() => setActiveTab('verifications')}
        >
          <Text style={[styles.tabText, activeTab === 'verifications' && styles.tabTextActive]}>
            Vérifications ({pendingVerifications.length})
          </Text>
        </TouchableOpacity>
        <TouchableOpacity
          style={[styles.tab, activeTab === 'reports' && styles.tabActive]}
          onPress={() => setActiveTab('reports')}
        >
          <Text style={[styles.tabText, activeTab === 'reports' && styles.tabTextActive]}>
            Signalements ({reports.length})
          </Text>
        </TouchableOpacity>
      </View>

      <ScrollView style={styles.content}>
        {activeTab === 'listings' && (
          pendingListings.length === 0 ? (
            <View style={styles.emptyState}>
              <Ionicons name="checkmark-circle-outline" size={64} color="#4CAF50" />
              <Text style={styles.emptyText}>Aucune annonce en attente</Text>
            </View>
          ) : (
            pendingListings.map((listing) => (
              <View key={listing.id} style={styles.listingCard}>
                {listing.photos?.[0] && (
                  <Image source={{ uri: listing.photos[0] }} style={styles.listingImage} />
                )}
                <View style={styles.listingInfo}>
                  <Text style={styles.listingTitle}>{listing.title}</Text>
                  <Text style={styles.listingPrice}>{listing.price} €</Text>
                  <Text style={styles.listingMeta}>
                    {listing.user_name} \u2022 {listing.location}
                  </Text>
                </View>
                <View style={styles.listingActions}>
                  <TouchableOpacity
                    style={styles.approveBtn}
                    onPress={() => handleApproveListing(listing.id)}
                  >
                    <Ionicons name="checkmark" size={24} color="#4CAF50" />
                  </TouchableOpacity>
                  <TouchableOpacity
                    style={styles.rejectBtn}
                    onPress={() => handleRejectListing(listing.id)}
                  >
                    <Ionicons name="close" size={24} color="#FF4444" />
                  </TouchableOpacity>
                </View>
              </View>
            ))
          )
        )}

        {activeTab === 'verifications' && (
          pendingVerifications.length === 0 ? (
            <View style={styles.emptyState}>
              <Ionicons name="shield-checkmark-outline" size={64} color="#4CAF50" />
              <Text style={styles.emptyText}>Aucune vérification en attente</Text>
            </View>
          ) : (
            pendingVerifications.map((user) => (
              <View key={user.id} style={styles.verificationCard}>
                <Text style={styles.verificationName}>
                  {user.first_name} {user.last_name}
                </Text>
                <Text style={styles.verificationEmail}>{user.email}</Text>
                <Text style={styles.verificationBirth}>Né(e) le: {user.birth_date}</Text>
                
                <View style={styles.photosRow}>
                  {user.id_photo && (
                    <View style={styles.photoContainer}>
                      <Text style={styles.photoLabel}>Pièce d'identité</Text>
                      <Image source={{ uri: user.id_photo }} style={styles.verificationPhoto} />
                    </View>
                  )}
                  {user.selfie_photo && (
                    <View style={styles.photoContainer}>
                      <Text style={styles.photoLabel}>Selfie</Text>
                      <Image source={{ uri: user.selfie_photo }} style={styles.verificationPhoto} />
                    </View>
                  )}
                </View>

                <View style={styles.verificationActions}>
                  <TouchableOpacity
                    style={styles.approveVerificationBtn}
                    onPress={() => handleVerifyIdentity(user.id, true)}
                  >
                    <Ionicons name="checkmark" size={20} color="#FFF" />
                    <Text style={styles.approveVerificationText}>Approuver</Text>
                  </TouchableOpacity>
                  <TouchableOpacity
                    style={styles.rejectVerificationBtn}
                    onPress={() => handleVerifyIdentity(user.id, false)}
                  >
                    <Ionicons name="close" size={20} color="#FFF" />
                    <Text style={styles.rejectVerificationText}>Rejeter</Text>
                  </TouchableOpacity>
                </View>
              </View>
            ))
          )
        )}

        {activeTab === 'reports' && (
          reports.length === 0 ? (
            <View style={styles.emptyState}>
              <Ionicons name="flag-outline" size={64} color="#4CAF50" />
              <Text style={styles.emptyText}>Aucun signalement</Text>
            </View>
          ) : (
            reports.map((report) => (
              <View key={report.id} style={styles.reportCard}>
                <Text style={styles.reportTitle}>{report.listing_title}</Text>
                <Text style={styles.reportReason}>Raison: {report.reason}</Text>
                {report.details && (
                  <Text style={styles.reportDetails}>{report.details}</Text>
                )}
                <Text style={styles.reportMeta}>
                  Signalé par: {report.reporter_name}
                </Text>

                <View style={styles.reportActions}>
                  <TouchableOpacity
                    style={styles.ignoreBtn}
                    onPress={() => handleResolveReport(report.id, 'ignore')}
                  >
                    <Text style={styles.ignoreBtnText}>Ignorer</Text>
                  </TouchableOpacity>
                  <TouchableOpacity
                    style={styles.deleteBtn}
                    onPress={() => handleResolveReport(report.id, 'delete_listing')}
                  >
                    <Text style={styles.deleteBtnText}>Supprimer l'annonce</Text>
                  </TouchableOpacity>
                </View>
              </View>
            ))
          )
        )}
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
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    padding: 16,
    backgroundColor: '#FFF',
    borderBottomWidth: 1,
    borderBottomColor: '#EEE',
  },
  headerTitle: {
    fontSize: 18,
    fontWeight: '600',
    color: '#333',
  },
  statsGrid: {
    flexDirection: 'row',
    padding: 16,
    gap: 12,
    backgroundColor: '#FFF',
  },
  statCard: {
    flex: 1,
    backgroundColor: '#F9F9F9',
    padding: 12,
    borderRadius: 12,
    alignItems: 'center',
  },
  statValue: {
    fontSize: 24,
    fontWeight: '700',
    color: '#2563EB',
  },
  statLabel: {
    fontSize: 11,
    color: '#666',
    marginTop: 4,
  },
  tabs: {
    flexDirection: 'row',
    backgroundColor: '#FFF',
    borderBottomWidth: 1,
    borderBottomColor: '#EEE',
  },
  tab: {
    flex: 1,
    paddingVertical: 14,
    alignItems: 'center',
    borderBottomWidth: 2,
    borderBottomColor: 'transparent',
  },
  tabActive: {
    borderBottomColor: '#2563EB',
  },
  tabText: {
    fontSize: 13,
    fontWeight: '500',
    color: '#999',
  },
  tabTextActive: {
    color: '#2563EB',
  },
  content: {
    flex: 1,
    padding: 16,
  },
  emptyState: {
    alignItems: 'center',
    paddingVertical: 60,
  },
  emptyText: {
    fontSize: 16,
    color: '#666',
    marginTop: 16,
  },
  listingCard: {
    flexDirection: 'row',
    backgroundColor: '#FFF',
    borderRadius: 12,
    padding: 12,
    marginBottom: 12,
  },
  listingImage: {
    width: 80,
    height: 80,
    borderRadius: 8,
  },
  listingInfo: {
    flex: 1,
    marginLeft: 12,
  },
  listingTitle: {
    fontSize: 15,
    fontWeight: '600',
    color: '#333',
    marginBottom: 4,
  },
  listingPrice: {
    fontSize: 16,
    fontWeight: '700',
    color: '#2563EB',
    marginBottom: 4,
  },
  listingMeta: {
    fontSize: 12,
    color: '#999',
  },
  listingActions: {
    flexDirection: 'column',
    gap: 8,
  },
  approveBtn: {
    width: 44,
    height: 44,
    borderRadius: 22,
    backgroundColor: '#E8F5E9',
    justifyContent: 'center',
    alignItems: 'center',
  },
  rejectBtn: {
    width: 44,
    height: 44,
    borderRadius: 22,
    backgroundColor: '#FFEBEE',
    justifyContent: 'center',
    alignItems: 'center',
  },
  verificationCard: {
    backgroundColor: '#FFF',
    borderRadius: 12,
    padding: 16,
    marginBottom: 12,
  },
  verificationName: {
    fontSize: 18,
    fontWeight: '600',
    color: '#333',
    marginBottom: 4,
  },
  verificationEmail: {
    fontSize: 14,
    color: '#666',
    marginBottom: 4,
  },
  verificationBirth: {
    fontSize: 13,
    color: '#999',
    marginBottom: 12,
  },
  photosRow: {
    flexDirection: 'row',
    gap: 12,
    marginBottom: 16,
  },
  photoContainer: {
    flex: 1,
  },
  photoLabel: {
    fontSize: 12,
    color: '#666',
    marginBottom: 6,
  },
  verificationPhoto: {
    width: '100%',
    height: 120,
    borderRadius: 8,
  },
  verificationActions: {
    flexDirection: 'row',
    gap: 12,
  },
  approveVerificationBtn: {
    flex: 1,
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'center',
    backgroundColor: '#4CAF50',
    padding: 12,
    borderRadius: 8,
    gap: 6,
  },
  approveVerificationText: {
    color: '#FFF',
    fontWeight: '600',
  },
  rejectVerificationBtn: {
    flex: 1,
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'center',
    backgroundColor: '#FF4444',
    padding: 12,
    borderRadius: 8,
    gap: 6,
  },
  rejectVerificationText: {
    color: '#FFF',
    fontWeight: '600',
  },
  reportCard: {
    backgroundColor: '#FFF',
    borderRadius: 12,
    padding: 16,
    marginBottom: 12,
  },
  reportTitle: {
    fontSize: 16,
    fontWeight: '600',
    color: '#333',
    marginBottom: 8,
  },
  reportReason: {
    fontSize: 14,
    color: '#2563EB',
    marginBottom: 4,
  },
  reportDetails: {
    fontSize: 14,
    color: '#666',
    marginBottom: 8,
  },
  reportMeta: {
    fontSize: 12,
    color: '#999',
    marginBottom: 12,
  },
  reportActions: {
    flexDirection: 'row',
    gap: 12,
  },
  ignoreBtn: {
    flex: 1,
    padding: 12,
    borderRadius: 8,
    backgroundColor: '#F5F5F5',
    alignItems: 'center',
  },
  ignoreBtnText: {
    color: '#666',
    fontWeight: '500',
  },
  deleteBtn: {
    flex: 1,
    padding: 12,
    borderRadius: 8,
    backgroundColor: '#FF4444',
    alignItems: 'center',
  },
  deleteBtnText: {
    color: '#FFF',
    fontWeight: '600',
  },
});
