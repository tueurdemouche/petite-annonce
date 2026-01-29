import React from 'react';
import { View, Text, StyleSheet, TouchableOpacity, Image, SafeAreaView } from 'react-native';
import { useRouter } from 'expo-router';
import { Ionicons } from '@expo/vector-icons';
import { useAuthStore } from '../src/stores/authStore';

export default function WelcomeScreen() {
  const router = useRouter();
  const { isAuthenticated } = useAuthStore();

  React.useEffect(() => {
    if (isAuthenticated) {
      router.replace('/(tabs)');
    }
  }, [isAuthenticated]);

  return (
    <SafeAreaView style={styles.container}>
      <View style={styles.content}>
        <View style={styles.logoContainer}>
          <View style={styles.logoCircle}>
            <Ionicons name="megaphone" size={60} color="#2563EB" />
          </View>
          <Text style={styles.appName}>Petite Annonce</Text>
          <Text style={styles.tagline}>Auto • Moto • Immobilier</Text>
        </View>

        <View style={styles.features}>
          <View style={styles.featureRow}>
            <Ionicons name="car" size={24} color="#2563EB" />
            <Text style={styles.featureText}>Véhicules Auto & Moto</Text>
          </View>
          <View style={styles.featureRow}>
            <Ionicons name="home" size={24} color="#2563EB" />
            <Text style={styles.featureText}>Immobilier & Location</Text>
          </View>
          <View style={styles.featureRow}>
            <Ionicons name="shield-checkmark" size={24} color="#2563EB" />
            <Text style={styles.featureText}>Annonces vérifiées</Text>
          </View>
        </View>

        <View style={styles.buttonContainer}>
          <TouchableOpacity
            style={styles.primaryButton}
            onPress={() => router.push('/auth/register')}
          >
            <Text style={styles.primaryButtonText}>Créer un compte</Text>
          </TouchableOpacity>

          <TouchableOpacity
            style={styles.secondaryButton}
            onPress={() => router.push('/auth/login')}
          >
            <Text style={styles.secondaryButtonText}>Se connecter</Text>
          </TouchableOpacity>

          <TouchableOpacity
            style={styles.guestButton}
            onPress={() => router.replace('/(tabs)')}
          >
            <Text style={styles.guestButtonText}>Continuer en tant qu'invité</Text>
          </TouchableOpacity>

          {/* Legal Links */}
          <View style={styles.legalLinks}>
            <TouchableOpacity onPress={() => router.push('/legal/about')}>
              <Text style={styles.legalLinkText}>À propos</Text>
            </TouchableOpacity>
            <Text style={styles.legalSeparator}>•</Text>
            <TouchableOpacity onPress={() => router.push('/legal/privacy')}>
              <Text style={styles.legalLinkText}>Confidentialité</Text>
            </TouchableOpacity>
            <Text style={styles.legalSeparator}>•</Text>
            <TouchableOpacity onPress={() => router.push('/legal/contact')}>
              <Text style={styles.legalLinkText}>Contact</Text>
            </TouchableOpacity>
          </View>
        </View>
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
    paddingHorizontal: 24,
    justifyContent: 'space-between',
    paddingTop: 60,
    paddingBottom: 40,
  },
  logoContainer: {
    alignItems: 'center',
  },
  logoCircle: {
    width: 120,
    height: 120,
    borderRadius: 60,
    backgroundColor: '#EFF6FF',
    justifyContent: 'center',
    alignItems: 'center',
    marginBottom: 20,
  },
  appName: {
    fontSize: 32,
    fontWeight: '700',
    color: '#333',
    marginBottom: 8,
  },
  tagline: {
    fontSize: 16,
    color: '#666',
  },
  features: {
    paddingVertical: 40,
  },
  featureRow: {
    flexDirection: 'row',
    alignItems: 'center',
    marginBottom: 20,
    paddingHorizontal: 20,
  },
  featureText: {
    fontSize: 16,
    color: '#333',
    marginLeft: 16,
  },
  buttonContainer: {
    gap: 12,
  },
  primaryButton: {
    backgroundColor: '#2563EB',
    height: 56,
    borderRadius: 12,
    justifyContent: 'center',
    alignItems: 'center',
  },
  primaryButtonText: {
    color: '#FFF',
    fontSize: 17,
    fontWeight: '600',
  },
  secondaryButton: {
    backgroundColor: '#FFF',
    height: 56,
    borderRadius: 12,
    justifyContent: 'center',
    alignItems: 'center',
    borderWidth: 2,
    borderColor: '#2563EB',
  },
  secondaryButtonText: {
    color: '#2563EB',
    fontSize: 17,
    fontWeight: '600',
  },
  guestButton: {
    height: 44,
    justifyContent: 'center',
    alignItems: 'center',
  },
  guestButtonText: {
    color: '#666',
    fontSize: 15,
  },
  legalLinks: {
    flexDirection: 'row',
    justifyContent: 'center',
    alignItems: 'center',
    marginTop: 20,
  },
  legalLinkText: {
    fontSize: 12,
    color: '#999',
  },
  legalSeparator: {
    fontSize: 12,
    color: '#CCC',
    marginHorizontal: 8,
  },
});
