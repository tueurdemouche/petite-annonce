import React, { useState, useEffect } from 'react';
import {
  View,
  Text,
  StyleSheet,
  ScrollView,
  Image,
  TouchableOpacity,
  ActivityIndicator,
  Alert,
  Dimensions,
  TextInput,
  KeyboardAvoidingView,
  Platform,
} from 'react-native';
import { useLocalSearchParams, useRouter } from 'expo-router';
import { Ionicons } from '@expo/vector-icons';
import { SafeAreaView } from 'react-native-safe-area-context';
import { format } from 'date-fns';
import { fr } from 'date-fns/locale';
import { listingsAPI, favoritesAPI, messagesAPI, reportsAPI, paymentsAPI } from '../../src/services/api';
import { useAuthStore } from '../../src/stores/authStore';
import { CATEGORIES } from '../../src/constants/data';

const { width } = Dimensions.get('window');

export default function ListingDetailScreen() {
  const { id, chat } = useLocalSearchParams();
  const router = useRouter();
  const { isAuthenticated, user } = useAuthStore();

  const [listing, setListing] = useState<any>(null);
  const [loading, setLoading] = useState(true);
  const [isFavorite, setIsFavorite] = useState(false);
  const [showChat, setShowChat] = useState(!!chat);
  const [messages, setMessages] = useState<any[]>([]);
  const [newMessage, setNewMessage] = useState('');
  const [currentImageIndex, setCurrentImageIndex] = useState(0);
  const [showBoostModal, setShowBoostModal] = useState(false);

  const fetchListing = async () => {
    try {
      const response = isAuthenticated
        ? await listingsAPI.getById(id as string)
        : await listingsAPI.getPublic(id as string);
      setListing(response.data);

      if (isAuthenticated) {
        const favRes = await favoritesAPI.getAll();
        setIsFavorite(favRes.data.some((f: any) => f.id === id));
      }
    } catch (error) {
      console.error('Error fetching listing:', error);
      Alert.alert('Erreur', 'Impossible de charger l\'annonce');
    } finally {
      setLoading(false);
    }
  };

  const fetchMessages = async () => {
    if (!isAuthenticated || !listing) return;
    
    const otherUserId = chat || listing.user_id;
    if (otherUserId === user?.id) return;

    try {
      const response = await messagesAPI.getMessages(id as string, otherUserId as string);
      setMessages(response.data);
    } catch (error) {
      console.error('Error fetching messages:', error);
    }
  };

  useEffect(() => {
    fetchListing();
  }, [id]);

  useEffect(() => {
    if (showChat && listing) {
      fetchMessages();
    }
  }, [showChat, listing]);

  const toggleFavorite = async () => {
    if (!isAuthenticated) {
      router.push('/auth/login');
      return;
    }

    try {
      if (isFavorite) {
        await favoritesAPI.remove(id as string);
      } else {
        await favoritesAPI.add(id as string);
      }
      setIsFavorite(!isFavorite);
    } catch (error) {
      console.error('Error toggling favorite:', error);
    }
  };

  const sendMessage = async () => {
    if (!newMessage.trim() || !listing) return;

    try {
      await messagesAPI.send({
        listing_id: id,
        receiver_id: listing.user_id,
        content: newMessage.trim(),
      });
      setNewMessage('');
      fetchMessages();
    } catch (error) {
      console.error('Error sending message:', error);
      Alert.alert('Erreur', 'Impossible d\'envoyer le message');
    }
  };

  const handleReport = () => {
    Alert.alert(
      'Signaler cette annonce',
      'Choisissez une raison',
      [
        { text: 'Annuler', style: 'cancel' },
        { text: 'Contenu inapproprié', onPress: () => submitReport('inappropriate') },
        { text: 'Arnaque/Fraude', onPress: () => submitReport('scam') },
        { text: 'Informations incorrectes', onPress: () => submitReport('incorrect_info') },
      ]
    );
  };

  const submitReport = async (reason: string) => {
    try {
      await reportsAPI.create({ listing_id: id, reason });
      Alert.alert('Merci', 'Votre signalement a été envoyé');
    } catch (error) {
      console.error('Error reporting:', error);
    }
  };

  const handleBoost = async (days: number) => {
    try {
      await paymentsAPI.boost({
        listing_id: id,
        duration_days: days,
        payment_method: 'stripe',
      });
      Alert.alert('Succès', `Annonce boostée pour ${days} jours !`);
      setShowBoostModal(false);
      fetchListing();
    } catch (error) {
      console.error('Error boosting:', error);
      Alert.alert('Erreur', 'Impossible de booster l\'annonce');
    }
  };

  const formatPrice = (price: number) => {
    return new Intl.NumberFormat('fr-FR', {
      style: 'currency',
      currency: 'EUR',
      maximumFractionDigits: 0,
    }).format(price);
  };

  const getCategoryName = (cat: string, subCat: string) => {
    const category = CATEGORIES[cat as keyof typeof CATEGORIES];
    if (!category) return '';
    const subCategory = category.sub_categories.find((s) => s.id === subCat);
    return `${category.name} > ${subCategory?.name || ''}`;
  };

  if (loading) {
    return (
      <View style={styles.loadingContainer}>
        <ActivityIndicator size="large" color="#2563EB" />
      </View>
    );
  }

  if (!listing) {
    return (
      <SafeAreaView style={styles.container}>
        <View style={styles.errorContainer}>
          <Ionicons name="alert-circle-outline" size={64} color="#DDD" />
          <Text style={styles.errorText}>Annonce non trouvée</Text>
          <TouchableOpacity style={styles.backBtn} onPress={() => router.back()}>
            <Text style={styles.backBtnText}>Retour</Text>
          </TouchableOpacity>
        </View>
      </SafeAreaView>
    );
  }

  const isOwner = user?.id === listing.user_id;

  return (
    <SafeAreaView style={styles.container} edges={['top']}>
      <KeyboardAvoidingView 
        style={styles.container} 
        behavior={Platform.OS === 'ios' ? 'padding' : undefined}
      >
        {/* Header */}
        <View style={styles.header}>
          <TouchableOpacity onPress={() => router.back()} style={styles.headerBtn}>
            <Ionicons name="arrow-back" size={24} color="#333" />
          </TouchableOpacity>
          <View style={styles.headerActions}>
            <TouchableOpacity onPress={toggleFavorite} style={styles.headerBtn}>
              <Ionicons
                name={isFavorite ? 'heart' : 'heart-outline'}
                size={24}
                color={isFavorite ? '#FF4444' : '#333'}
              />
            </TouchableOpacity>
            {!isOwner && (
              <TouchableOpacity onPress={handleReport} style={styles.headerBtn}>
                <Ionicons name="flag-outline" size={24} color="#333" />
              </TouchableOpacity>
            )}
          </View>
        </View>

        <ScrollView showsVerticalScrollIndicator={false}>
          {/* Images */}
          <View style={styles.imageContainer}>
            {listing.photos && listing.photos.length > 0 ? (
              <>
                <ScrollView
                  horizontal
                  pagingEnabled
                  showsHorizontalScrollIndicator={false}
                  onMomentumScrollEnd={(e) => {
                    const index = Math.round(e.nativeEvent.contentOffset.x / width);
                    setCurrentImageIndex(index);
                  }}
                >
                  {listing.photos.map((photo: string, index: number) => (
                    <Image
                      key={index}
                      source={{ uri: photo }}
                      style={styles.image}
                      resizeMode="cover"
                    />
                  ))}
                </ScrollView>
                <View style={styles.imageIndicator}>
                  <Text style={styles.imageIndicatorText}>
                    {currentImageIndex + 1} / {listing.photos.length}
                  </Text>
                </View>
              </>
            ) : (
              <View style={styles.noImage}>
                <Ionicons name="image-outline" size={64} color="#CCC" />
              </View>
            )}
            {listing.is_boosted && (
              <View style={styles.boostedBadge}>
                <Ionicons name="star" size={14} color="#FFF" />
                <Text style={styles.boostedText}>Sponsorisé</Text>
              </View>
            )}
          </View>

          {/* Content */}
          <View style={styles.content}>
            <Text style={styles.price}>{formatPrice(listing.price)}</Text>
            <Text style={styles.title}>{listing.title}</Text>
            
            <View style={styles.locationRow}>
              <Ionicons name="location-outline" size={18} color="#666" />
              <Text style={styles.location}>{listing.location}</Text>
            </View>

            <View style={styles.categoryBadge}>
              <Text style={styles.categoryText}>
                {getCategoryName(listing.category, listing.sub_category)}
              </Text>
            </View>

            {/* Stats */}
            <View style={styles.statsRow}>
              <View style={styles.statItem}>
                <Ionicons name="eye-outline" size={18} color="#666" />
                <Text style={styles.statText}>{listing.views} vues</Text>
              </View>
              <View style={styles.statItem}>
                <Ionicons name="calendar-outline" size={18} color="#666" />
                <Text style={styles.statText}>
                  {format(new Date(listing.created_at), 'dd MMM yyyy', { locale: fr })}
                </Text>
              </View>
            </View>

            {/* Vehicle Details */}
            {listing.category === 'auto_moto' && (
              <View style={styles.detailsSection}>
                <Text style={styles.sectionTitle}>Caractéristiques</Text>
                <View style={styles.detailsGrid}>
                  {listing.brand && (
                    <View style={styles.detailItem}>
                      <Text style={styles.detailLabel}>Marque</Text>
                      <Text style={styles.detailValue}>{listing.brand}</Text>
                    </View>
                  )}
                  {listing.model && (
                    <View style={styles.detailItem}>
                      <Text style={styles.detailLabel}>Modèle</Text>
                      <Text style={styles.detailValue}>{listing.model}</Text>
                    </View>
                  )}
                  {listing.year && (
                    <View style={styles.detailItem}>
                      <Text style={styles.detailLabel}>Année</Text>
                      <Text style={styles.detailValue}>{listing.year}</Text>
                    </View>
                  )}
                  {listing.mileage && (
                    <View style={styles.detailItem}>
                      <Text style={styles.detailLabel}>Kilométrage</Text>
                      <Text style={styles.detailValue}>{listing.mileage.toLocaleString()} km</Text>
                    </View>
                  )}
                  {listing.fuel_type && (
                    <View style={styles.detailItem}>
                      <Text style={styles.detailLabel}>Carburant</Text>
                      <Text style={styles.detailValue}>{listing.fuel_type}</Text>
                    </View>
                  )}
                  {listing.transmission && (
                    <View style={styles.detailItem}>
                      <Text style={styles.detailLabel}>Boîte</Text>
                      <Text style={styles.detailValue}>
                        {listing.transmission === 'manual' ? 'Manuelle' : 'Automatique'}
                      </Text>
                    </View>
                  )}
                  {listing.vehicle_type && (
                    <View style={styles.detailItem}>
                      <Text style={styles.detailLabel}>Type</Text>
                      <Text style={styles.detailValue}>{listing.vehicle_type}</Text>
                    </View>
                  )}
                </View>
              </View>
            )}

            {/* Property Details */}
            {listing.category === 'immobilier' && (
              <View style={styles.detailsSection}>
                <Text style={styles.sectionTitle}>Caractéristiques</Text>
                <View style={styles.detailsGrid}>
                  {listing.property_type && (
                    <View style={styles.detailItem}>
                      <Text style={styles.detailLabel}>Type</Text>
                      <Text style={styles.detailValue}>{listing.property_type}</Text>
                    </View>
                  )}
                  {listing.surface_m2 && (
                    <View style={styles.detailItem}>
                      <Text style={styles.detailLabel}>Surface</Text>
                      <Text style={styles.detailValue}>{listing.surface_m2} m²</Text>
                    </View>
                  )}
                  {listing.rooms && (
                    <View style={styles.detailItem}>
                      <Text style={styles.detailLabel}>Pièces</Text>
                      <Text style={styles.detailValue}>{listing.rooms}</Text>
                    </View>
                  )}
                  {listing.floor !== undefined && (
                    <View style={styles.detailItem}>
                      <Text style={styles.detailLabel}>Étage</Text>
                      <Text style={styles.detailValue}>
                        {listing.floor}{listing.total_floors ? ` / ${listing.total_floors}` : ''}
                      </Text>
                    </View>
                  )}
                  {listing.handicap_access !== undefined && (
                    <View style={styles.detailItem}>
                      <Text style={styles.detailLabel}>Accès PMR</Text>
                      <Text style={styles.detailValue}>
                        {listing.handicap_access ? 'Oui' : 'Non'}
                      </Text>
                    </View>
                  )}
                  {listing.has_garden !== undefined && (
                    <View style={styles.detailItem}>
                      <Text style={styles.detailLabel}>Jardin</Text>
                      <Text style={styles.detailValue}>
                        {listing.has_garden ? 'Oui' : 'Non'}
                      </Text>
                    </View>
                  )}
                </View>
              </View>
            )}

            {/* Description */}
            <View style={styles.descriptionSection}>
              <Text style={styles.sectionTitle}>Description</Text>
              <Text style={styles.description}>{listing.description}</Text>
            </View>

            {/* Seller Info */}
            <View style={styles.sellerSection}>
              <Text style={styles.sectionTitle}>Vendeur</Text>
              <View style={styles.sellerCard}>
                <View style={styles.sellerAvatar}>
                  <Text style={styles.sellerInitials}>
                    {listing.user_name?.split(' ').map((n: string) => n[0]).join('')}
                  </Text>
                </View>
                <View style={styles.sellerInfo}>
                  <Text style={styles.sellerName}>{listing.user_name}</Text>
                  {listing.user_phone && isAuthenticated && (
                    <Text style={styles.sellerPhone}>{listing.user_phone}</Text>
                  )}
                </View>
              </View>
            </View>

            {/* Owner Actions */}
            {isOwner && (
              <View style={styles.ownerActions}>
                <TouchableOpacity
                  style={styles.editBtn}
                  onPress={() => router.push(`/listing/create?edit=${id}`)}
                >
                  <Ionicons name="create-outline" size={20} color="#2563EB" />
                  <Text style={styles.editBtnText}>Modifier</Text>
                </TouchableOpacity>
                {!listing.is_boosted && (
                  <TouchableOpacity
                    style={styles.boostBtn}
                    onPress={() => setShowBoostModal(true)}
                  >
                    <Ionicons name="rocket-outline" size={20} color="#FFF" />
                    <Text style={styles.boostBtnText}>Booster</Text>
                  </TouchableOpacity>
                )}
              </View>
            )}
          </View>
        </ScrollView>

        {/* Contact Button / Chat */}
        {!isOwner && (
          showChat ? (
            <View style={styles.chatContainer}>
              <ScrollView style={styles.messagesContainer}>
                {messages.map((msg) => (
                  <View
                    key={msg.id}
                    style={[
                      styles.messageBubble,
                      msg.sender_id === user?.id ? styles.myMessage : styles.theirMessage,
                    ]}
                  >
                    <Text style={[
                      styles.messageText,
                      msg.sender_id === user?.id && styles.myMessageText,
                    ]}>
                      {msg.content}
                    </Text>
                  </View>
                ))}
              </ScrollView>
              <View style={styles.inputContainer}>
                <TextInput
                  style={styles.messageInput}
                  placeholder="Votre message..."
                  value={newMessage}
                  onChangeText={setNewMessage}
                  multiline
                />
                <TouchableOpacity style={styles.sendBtn} onPress={sendMessage}>
                  <Ionicons name="send" size={22} color="#FFF" />
                </TouchableOpacity>
              </View>
            </View>
          ) : (
            <View style={styles.contactBar}>
              <TouchableOpacity
                style={styles.contactBtn}
                onPress={() => {
                  if (!isAuthenticated) {
                    router.push('/auth/login');
                    return;
                  }
                  setShowChat(true);
                }}
              >
                <Ionicons name="chatbubble-outline" size={22} color="#FFF" />
                <Text style={styles.contactBtnText}>Contacter le vendeur</Text>
              </TouchableOpacity>
            </View>
          )
        )}

        {/* Boost Modal */}
        {showBoostModal && (
          <View style={styles.modalOverlay}>
            <View style={styles.modalContent}>
              <Text style={styles.modalTitle}>Booster votre annonce</Text>
              <Text style={styles.modalSubtitle}>
                Votre annonce apparaîtra en tête des résultats
              </Text>
              
              <TouchableOpacity
                style={styles.boostOption}
                onPress={() => handleBoost(7)}
              >
                <View>
                  <Text style={styles.boostOptionTitle}>7 jours</Text>
                  <Text style={styles.boostOptionDesc}>Visibilité maximale pendant 1 semaine</Text>
                </View>
                <Text style={styles.boostOptionPrice}>29,99 €</Text>
              </TouchableOpacity>

              <TouchableOpacity
                style={styles.boostOption}
                onPress={() => handleBoost(14)}
              >
                <View>
                  <Text style={styles.boostOptionTitle}>14 jours</Text>
                  <Text style={styles.boostOptionDesc}>Meilleur rapport qualité/prix</Text>
                </View>
                <Text style={styles.boostOptionPrice}>49,99 €</Text>
              </TouchableOpacity>

              <TouchableOpacity
                style={styles.cancelBtn}
                onPress={() => setShowBoostModal(false)}
              >
                <Text style={styles.cancelBtnText}>Annuler</Text>
              </TouchableOpacity>
            </View>
          </View>
        )}
      </KeyboardAvoidingView>
    </SafeAreaView>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: '#FFF',
  },
  loadingContainer: {
    flex: 1,
    justifyContent: 'center',
    alignItems: 'center',
  },
  errorContainer: {
    flex: 1,
    justifyContent: 'center',
    alignItems: 'center',
  },
  errorText: {
    fontSize: 18,
    color: '#666',
    marginTop: 16,
  },
  backBtn: {
    marginTop: 24,
    backgroundColor: '#2563EB',
    paddingHorizontal: 24,
    paddingVertical: 12,
    borderRadius: 8,
  },
  backBtnText: {
    color: '#FFF',
    fontSize: 16,
    fontWeight: '600',
  },
  header: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    padding: 16,
    backgroundColor: '#FFF',
  },
  headerBtn: {
    width: 40,
    height: 40,
    borderRadius: 20,
    backgroundColor: '#F5F5F5',
    justifyContent: 'center',
    alignItems: 'center',
  },
  headerActions: {
    flexDirection: 'row',
    gap: 8,
  },
  imageContainer: {
    width,
    height: width * 0.75,
    backgroundColor: '#F0F0F0',
  },
  image: {
    width,
    height: width * 0.75,
  },
  noImage: {
    flex: 1,
    justifyContent: 'center',
    alignItems: 'center',
  },
  imageIndicator: {
    position: 'absolute',
    bottom: 16,
    right: 16,
    backgroundColor: 'rgba(0,0,0,0.6)',
    paddingHorizontal: 12,
    paddingVertical: 6,
    borderRadius: 16,
  },
  imageIndicatorText: {
    color: '#FFF',
    fontSize: 13,
    fontWeight: '500',
  },
  boostedBadge: {
    position: 'absolute',
    top: 16,
    left: 16,
    backgroundColor: '#2563EB',
    flexDirection: 'row',
    alignItems: 'center',
    paddingHorizontal: 12,
    paddingVertical: 6,
    borderRadius: 16,
    gap: 4,
  },
  boostedText: {
    color: '#FFF',
    fontSize: 12,
    fontWeight: '600',
  },
  content: {
    padding: 20,
  },
  price: {
    fontSize: 28,
    fontWeight: '700',
    color: '#2563EB',
    marginBottom: 8,
  },
  title: {
    fontSize: 22,
    fontWeight: '600',
    color: '#333',
    marginBottom: 12,
  },
  locationRow: {
    flexDirection: 'row',
    alignItems: 'center',
    marginBottom: 12,
  },
  location: {
    fontSize: 15,
    color: '#666',
    marginLeft: 6,
  },
  categoryBadge: {
    backgroundColor: '#F5F5F5',
    alignSelf: 'flex-start',
    paddingHorizontal: 12,
    paddingVertical: 6,
    borderRadius: 16,
    marginBottom: 16,
  },
  categoryText: {
    fontSize: 13,
    color: '#666',
  },
  statsRow: {
    flexDirection: 'row',
    gap: 24,
    marginBottom: 24,
  },
  statItem: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 6,
  },
  statText: {
    fontSize: 14,
    color: '#666',
  },
  detailsSection: {
    marginBottom: 24,
  },
  sectionTitle: {
    fontSize: 18,
    fontWeight: '600',
    color: '#333',
    marginBottom: 16,
  },
  detailsGrid: {
    flexDirection: 'row',
    flexWrap: 'wrap',
  },
  detailItem: {
    width: '50%',
    marginBottom: 16,
  },
  detailLabel: {
    fontSize: 13,
    color: '#999',
    marginBottom: 4,
  },
  detailValue: {
    fontSize: 15,
    color: '#333',
    fontWeight: '500',
  },
  descriptionSection: {
    marginBottom: 24,
  },
  description: {
    fontSize: 15,
    color: '#444',
    lineHeight: 24,
  },
  sellerSection: {
    marginBottom: 24,
  },
  sellerCard: {
    flexDirection: 'row',
    alignItems: 'center',
    backgroundColor: '#F9F9F9',
    padding: 16,
    borderRadius: 12,
  },
  sellerAvatar: {
    width: 50,
    height: 50,
    borderRadius: 25,
    backgroundColor: '#2563EB',
    justifyContent: 'center',
    alignItems: 'center',
    marginRight: 16,
  },
  sellerInitials: {
    color: '#FFF',
    fontSize: 18,
    fontWeight: '600',
  },
  sellerInfo: {
    flex: 1,
  },
  sellerName: {
    fontSize: 16,
    fontWeight: '600',
    color: '#333',
  },
  sellerPhone: {
    fontSize: 14,
    color: '#666',
    marginTop: 4,
  },
  ownerActions: {
    flexDirection: 'row',
    gap: 12,
  },
  editBtn: {
    flex: 1,
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'center',
    backgroundColor: '#FFF5EE',
    padding: 14,
    borderRadius: 12,
    gap: 8,
  },
  editBtnText: {
    fontSize: 15,
    fontWeight: '600',
    color: '#2563EB',
  },
  boostBtn: {
    flex: 1,
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'center',
    backgroundColor: '#2563EB',
    padding: 14,
    borderRadius: 12,
    gap: 8,
  },
  boostBtnText: {
    fontSize: 15,
    fontWeight: '600',
    color: '#FFF',
  },
  contactBar: {
    padding: 16,
    borderTopWidth: 1,
    borderTopColor: '#EEE',
    backgroundColor: '#FFF',
  },
  contactBtn: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'center',
    backgroundColor: '#2563EB',
    padding: 16,
    borderRadius: 12,
    gap: 8,
  },
  contactBtnText: {
    fontSize: 16,
    fontWeight: '600',
    color: '#FFF',
  },
  chatContainer: {
    height: 300,
    borderTopWidth: 1,
    borderTopColor: '#EEE',
  },
  messagesContainer: {
    flex: 1,
    padding: 16,
  },
  messageBubble: {
    maxWidth: '80%',
    padding: 12,
    borderRadius: 16,
    marginBottom: 8,
  },
  myMessage: {
    backgroundColor: '#2563EB',
    alignSelf: 'flex-end',
    borderBottomRightRadius: 4,
  },
  theirMessage: {
    backgroundColor: '#F0F0F0',
    alignSelf: 'flex-start',
    borderBottomLeftRadius: 4,
  },
  messageText: {
    fontSize: 15,
    color: '#333',
  },
  myMessageText: {
    color: '#FFF',
  },
  inputContainer: {
    flexDirection: 'row',
    padding: 12,
    borderTopWidth: 1,
    borderTopColor: '#EEE',
    alignItems: 'flex-end',
  },
  messageInput: {
    flex: 1,
    backgroundColor: '#F5F5F5',
    borderRadius: 20,
    paddingHorizontal: 16,
    paddingVertical: 10,
    fontSize: 15,
    maxHeight: 100,
    marginRight: 8,
  },
  sendBtn: {
    width: 44,
    height: 44,
    borderRadius: 22,
    backgroundColor: '#2563EB',
    justifyContent: 'center',
    alignItems: 'center',
  },
  modalOverlay: {
    ...StyleSheet.absoluteFillObject,
    backgroundColor: 'rgba(0,0,0,0.5)',
    justifyContent: 'flex-end',
  },
  modalContent: {
    backgroundColor: '#FFF',
    borderTopLeftRadius: 24,
    borderTopRightRadius: 24,
    padding: 24,
  },
  modalTitle: {
    fontSize: 22,
    fontWeight: '700',
    color: '#333',
    marginBottom: 8,
  },
  modalSubtitle: {
    fontSize: 15,
    color: '#666',
    marginBottom: 24,
  },
  boostOption: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    backgroundColor: '#F9F9F9',
    padding: 16,
    borderRadius: 12,
    marginBottom: 12,
  },
  boostOptionTitle: {
    fontSize: 16,
    fontWeight: '600',
    color: '#333',
  },
  boostOptionDesc: {
    fontSize: 13,
    color: '#666',
    marginTop: 4,
  },
  boostOptionPrice: {
    fontSize: 18,
    fontWeight: '700',
    color: '#2563EB',
  },
  cancelBtn: {
    alignItems: 'center',
    padding: 16,
    marginTop: 8,
  },
  cancelBtnText: {
    fontSize: 16,
    color: '#666',
  },
});
