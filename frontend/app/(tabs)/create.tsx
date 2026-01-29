import React from 'react';
import {
  View,
  Text,
  StyleSheet,
  TouchableOpacity,
  SafeAreaView,
} from 'react-native';
import { useRouter } from 'expo-router';
import { Ionicons } from '@expo/vector-icons';
import { useAuthStore } from '../../src/stores/authStore';

export default function CreateScreen() {
  const router = useRouter();
  const { isAuthenticated, user } = useAuthStore();

  const handleCreate = () => {
    if (!isAuthenticated) {
      router.push('/auth/login');
      return;
    }

    if (!user?.identity_verified) {
      router.push('/auth/verify');
      return;
    }

    router.push('/listing/create');
  };

  return (
    <SafeAreaView style={styles.container}>
      <View style={styles.content}>
        <View style={styles.iconContainer}>
          <Ionicons name="add-circle" size={80} color="#2563EB" />
        </View>
        <Text style={styles.title}>Publier une annonce</Text>
        <Text style={styles.description}>
          Vendez votre véhicule ou votre bien immobilier en quelques clics
        </Text>

        <View style={styles.features}>
          <View style={styles.featureRow}>
            <Ionicons name="checkmark-circle" size={20} color="#4CAF50" />
            <Text style={styles.featureText}>5 photos gratuites</Text>
          </View>
          <View style={styles.featureRow}>
            <Ionicons name="checkmark-circle" size={20} color="#4CAF50" />
            <Text style={styles.featureText}>Annonce visible 30 jours</Text>
          </View>
          <View style={styles.featureRow}>
            <Ionicons name="checkmark-circle" size={20} color="#4CAF50" />
            <Text style={styles.featureText}>Messagerie intégrée</Text>
          </View>
        </View>

        <TouchableOpacity style={styles.createBtn} onPress={handleCreate}>
          <Ionicons name="create" size={22} color="#FFF" />
          <Text style={styles.createBtnText}>Créer mon annonce</Text>
        </TouchableOpacity>

        {!isAuthenticated && (
          <Text style={styles.note}>
            Vous devez être connecté pour publier une annonce
          </Text>
        )}

        {isAuthenticated && !user?.identity_verified && (
          <Text style={styles.note}>
            Vérifiez votre identité pour publier des annonces
          </Text>
        )}
      </View>
    </SafeAreaView>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: '#FFF',
  },
  content: {
    flex: 1,
    padding: 24,
    alignItems: 'center',
    justifyContent: 'center',
  },
  iconContainer: {
    marginBottom: 24,
  },
  title: {
    fontSize: 24,
    fontWeight: '700',
    color: '#333',
    marginBottom: 12,
  },
  description: {
    fontSize: 15,
    color: '#666',
    textAlign: 'center',
    marginBottom: 32,
    lineHeight: 22,
  },
  features: {
    alignSelf: 'stretch',
    marginBottom: 32,
  },
  featureRow: {
    flexDirection: 'row',
    alignItems: 'center',
    marginBottom: 12,
  },
  featureText: {
    fontSize: 15,
    color: '#333',
    marginLeft: 12,
  },
  createBtn: {
    flexDirection: 'row',
    alignItems: 'center',
    backgroundColor: '#2563EB',
    paddingHorizontal: 32,
    paddingVertical: 16,
    borderRadius: 12,
    gap: 8,
  },
  createBtnText: {
    color: '#FFF',
    fontSize: 17,
    fontWeight: '600',
  },
  note: {
    fontSize: 13,
    color: '#999',
    marginTop: 16,
    textAlign: 'center',
  },
});
