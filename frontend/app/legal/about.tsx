import React from 'react';
import {
  View,
  Text,
  StyleSheet,
  ScrollView,
  TouchableOpacity,
  Linking,
  Image,
} from 'react-native';
import { useRouter } from 'expo-router';
import { Ionicons } from '@expo/vector-icons';
import { SafeAreaView } from 'react-native-safe-area-context';

export default function AboutScreen() {
  const router = useRouter();

  const features = [
    {
      icon: 'car',
      title: 'Véhicules',
      description: 'Auto, Moto, Scooter, Quad - homologués ou non',
    },
    {
      icon: 'home',
      title: 'Immobilier',
      description: 'Location, Colocation, Vente - appartements, maisons, terrains',
    },
    {
      icon: 'shield-checkmark',
      title: 'Sécurité',
      description: 'Vérification d\'identité obligatoire pour tous les vendeurs',
    },
    {
      icon: 'chatbubbles',
      title: 'Messagerie',
      description: 'Communication directe et sécurisée entre acheteurs et vendeurs',
    },
    {
      icon: 'location',
      title: 'Géolocalisation',
      description: 'Trouvez des annonces près de chez vous',
    },
    {
      icon: 'rocket',
      title: 'Boost',
      description: 'Mettez en avant vos annonces pour plus de visibilité',
    },
  ];

  const stats = [
    { value: '100%', label: 'Gratuit' },
    { value: '5', label: 'Photos gratuites' },
    { value: '30j', label: 'Durée annonce' },
    { value: '18+', label: 'Vérifié' },
  ];

  return (
    <SafeAreaView style={styles.container}>
      <View style={styles.header}>
        <TouchableOpacity onPress={() => router.back()} style={styles.backBtn}>
          <Ionicons name="arrow-back" size={24} color="#333" />
        </TouchableOpacity>
        <Text style={styles.headerTitle}>À Propos</Text>
        <View style={{ width: 40 }} />
      </View>

      <ScrollView style={styles.content} showsVerticalScrollIndicator={false}>
        {/* Hero Section */}
        <View style={styles.heroSection}>
          <View style={styles.logoCircle}>
            <Ionicons name="megaphone" size={50} color="#2563EB" />
          </View>
          <Text style={styles.appName}>Petite Annonce</Text>
          <Text style={styles.tagline}>
            La plateforme de confiance pour vos annonces auto, moto et immobilier
          </Text>
          <Text style={styles.version}>Version 1.0.0</Text>
        </View>

        {/* Stats */}
        <View style={styles.statsSection}>
          {stats.map((stat, index) => (
            <View key={index} style={styles.statItem}>
              <Text style={styles.statValue}>{stat.value}</Text>
              <Text style={styles.statLabel}>{stat.label}</Text>
            </View>
          ))}
        </View>

        {/* Mission */}
        <View style={styles.section}>
          <Text style={styles.sectionTitle}>Notre Mission</Text>
          <Text style={styles.sectionText}>
            Petite Annonce a été créée pour offrir une alternative simple, sécurisée et transparente 
            pour la vente de véhicules et de biens immobiliers entre particuliers.{"\n\n"}
            Notre priorité : la sécurité de nos utilisateurs grâce à la vérification d'identité 
            obligatoire et la validation manuelle de chaque annonce.
          </Text>
        </View>

        {/* Features */}
        <View style={styles.section}>
          <Text style={styles.sectionTitle}>Nos Fonctionnalités</Text>
          {features.map((feature, index) => (
            <View key={index} style={styles.featureCard}>
              <View style={styles.featureIcon}>
                <Ionicons name={feature.icon as any} size={24} color="#2563EB" />
              </View>
              <View style={styles.featureContent}>
                <Text style={styles.featureTitle}>{feature.title}</Text>
                <Text style={styles.featureDescription}>{feature.description}</Text>
              </View>
            </View>
          ))}
        </View>

        {/* Pricing */}
        <View style={styles.section}>
          <Text style={styles.sectionTitle}>Tarifs</Text>
          
          <View style={styles.pricingCard}>
            <View style={styles.pricingHeader}>
              <Text style={styles.pricingTitle}>Publication Gratuite</Text>
              <Text style={styles.pricingPrice}>0€</Text>
            </View>
            <View style={styles.pricingFeatures}>
              <View style={styles.pricingFeature}>
                <Ionicons name="checkmark-circle" size={18} color="#4CAF50" />
                <Text style={styles.pricingFeatureText}>5 photos par annonce</Text>
              </View>
              <View style={styles.pricingFeature}>
                <Ionicons name="checkmark-circle" size={18} color="#4CAF50" />
                <Text style={styles.pricingFeatureText}>Visible 30 jours</Text>
              </View>
              <View style={styles.pricingFeature}>
                <Ionicons name="checkmark-circle" size={18} color="#4CAF50" />
                <Text style={styles.pricingFeatureText}>Messagerie incluse</Text>
              </View>
              <View style={styles.pricingFeature}>
                <Ionicons name="checkmark-circle" size={18} color="#4CAF50" />
                <Text style={styles.pricingFeatureText}>1 repost gratuit/mois</Text>
              </View>
            </View>
          </View>

          <View style={styles.pricingCard}>
            <View style={styles.pricingHeader}>
              <Text style={styles.pricingTitle}>Photos supplémentaires</Text>
              <Text style={styles.pricingPrice}>9,99€</Text>
            </View>
            <Text style={styles.pricingDesc}>+5 photos (10 au total)</Text>
          </View>

          <View style={styles.pricingCard}>
            <View style={styles.pricingHeader}>
              <Text style={styles.pricingTitle}>Boost 7 jours</Text>
              <Text style={styles.pricingPrice}>29,99€</Text>
            </View>
            <Text style={styles.pricingDesc}>Annonce en tête des résultats</Text>
          </View>

          <View style={styles.pricingCard}>
            <View style={styles.pricingHeader}>
              <Text style={styles.pricingTitle}>Boost 14 jours</Text>
              <Text style={styles.pricingPrice}>49,99€</Text>
            </View>
            <Text style={styles.pricingDesc}>Meilleur rapport qualité/prix</Text>
          </View>
        </View>

        {/* Contact */}
        <View style={styles.section}>
          <Text style={styles.sectionTitle}>Nous Contacter</Text>
          
          <TouchableOpacity 
            style={styles.contactBtn}
            onPress={() => Linking.openURL('mailto:victor-marouard@hotmail.com')}
          >
            <Ionicons name="mail" size={22} color="#FFF" />
            <Text style={styles.contactBtnText}>victor-marouard@hotmail.com</Text>
          </TouchableOpacity>

          <TouchableOpacity 
            style={styles.contactBtnSecondary}
            onPress={() => router.push('/legal/contact')}
          >
            <Ionicons name="chatbubble-ellipses" size={22} color="#2563EB" />
            <Text style={styles.contactBtnSecondaryText}>Formulaire de contact</Text>
          </TouchableOpacity>
        </View>

        {/* Legal Links */}
        <View style={styles.legalSection}>
          <TouchableOpacity 
            style={styles.legalLink}
            onPress={() => router.push('/legal/privacy')}
          >
            <Text style={styles.legalLinkText}>Politique de Confidentialité</Text>
            <Ionicons name="chevron-forward" size={18} color="#999" />
          </TouchableOpacity>
          <TouchableOpacity 
            style={styles.legalLink}
            onPress={() => router.push('/legal/cgu')}
          >
            <Text style={styles.legalLinkText}>Conditions d'Utilisation</Text>
            <Ionicons name="chevron-forward" size={18} color="#999" />
          </TouchableOpacity>
          <TouchableOpacity 
            style={styles.legalLink}
            onPress={() => router.push('/legal/terms')}
          >
            <Text style={styles.legalLinkText}>Conditions de Vente</Text>
            <Ionicons name="chevron-forward" size={18} color="#999" />
          </TouchableOpacity>
        </View>

        {/* Footer */}
        <View style={styles.footer}>
          <Text style={styles.footerText}>
            © 2025 Petite Annonce - Tous droits réservés
          </Text>
          <Text style={styles.footerSubtext}>
            Fait avec ❤️ en France
          </Text>
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
  header: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    padding: 16,
    backgroundColor: '#FFF',
    borderBottomWidth: 1,
    borderBottomColor: '#EEE',
  },
  backBtn: {
    width: 40,
    height: 40,
    borderRadius: 20,
    backgroundColor: '#F5F5F5',
    justifyContent: 'center',
    alignItems: 'center',
  },
  headerTitle: {
    fontSize: 17,
    fontWeight: '600',
    color: '#333',
  },
  content: {
    flex: 1,
  },
  heroSection: {
    backgroundColor: '#FFF',
    alignItems: 'center',
    paddingVertical: 40,
    paddingHorizontal: 20,
  },
  logoCircle: {
    width: 100,
    height: 100,
    borderRadius: 50,
    backgroundColor: '#EFF6FF',
    justifyContent: 'center',
    alignItems: 'center',
    marginBottom: 16,
  },
  appName: {
    fontSize: 28,
    fontWeight: '700',
    color: '#333',
    marginBottom: 8,
  },
  tagline: {
    fontSize: 15,
    color: '#666',
    textAlign: 'center',
    lineHeight: 22,
    paddingHorizontal: 20,
  },
  version: {
    fontSize: 13,
    color: '#999',
    marginTop: 12,
  },
  statsSection: {
    flexDirection: 'row',
    backgroundColor: '#2563EB',
    paddingVertical: 20,
  },
  statItem: {
    flex: 1,
    alignItems: 'center',
  },
  statValue: {
    fontSize: 24,
    fontWeight: '700',
    color: '#FFF',
  },
  statLabel: {
    fontSize: 12,
    color: 'rgba(255,255,255,0.8)',
    marginTop: 4,
  },
  section: {
    backgroundColor: '#FFF',
    padding: 20,
    marginTop: 8,
  },
  sectionTitle: {
    fontSize: 20,
    fontWeight: '700',
    color: '#333',
    marginBottom: 16,
  },
  sectionText: {
    fontSize: 15,
    color: '#555',
    lineHeight: 24,
  },
  featureCard: {
    flexDirection: 'row',
    alignItems: 'flex-start',
    paddingVertical: 12,
    borderBottomWidth: 1,
    borderBottomColor: '#F0F0F0',
  },
  featureIcon: {
    width: 44,
    height: 44,
    borderRadius: 22,
    backgroundColor: '#EFF6FF',
    justifyContent: 'center',
    alignItems: 'center',
    marginRight: 12,
  },
  featureContent: {
    flex: 1,
  },
  featureTitle: {
    fontSize: 16,
    fontWeight: '600',
    color: '#333',
    marginBottom: 4,
  },
  featureDescription: {
    fontSize: 14,
    color: '#666',
    lineHeight: 20,
  },
  pricingCard: {
    backgroundColor: '#F9F9F9',
    borderRadius: 12,
    padding: 16,
    marginBottom: 12,
  },
  pricingHeader: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
  },
  pricingTitle: {
    fontSize: 16,
    fontWeight: '600',
    color: '#333',
  },
  pricingPrice: {
    fontSize: 20,
    fontWeight: '700',
    color: '#2563EB',
  },
  pricingDesc: {
    fontSize: 14,
    color: '#666',
    marginTop: 8,
  },
  pricingFeatures: {
    marginTop: 12,
    gap: 8,
  },
  pricingFeature: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 8,
  },
  pricingFeatureText: {
    fontSize: 14,
    color: '#555',
  },
  contactBtn: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'center',
    backgroundColor: '#2563EB',
    padding: 16,
    borderRadius: 12,
    gap: 10,
    marginBottom: 12,
  },
  contactBtnText: {
    color: '#FFF',
    fontSize: 15,
    fontWeight: '600',
  },
  contactBtnSecondary: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'center',
    backgroundColor: '#EFF6FF',
    padding: 16,
    borderRadius: 12,
    gap: 10,
  },
  contactBtnSecondaryText: {
    color: '#2563EB',
    fontSize: 15,
    fontWeight: '600',
  },
  legalSection: {
    backgroundColor: '#FFF',
    marginTop: 8,
    paddingHorizontal: 20,
  },
  legalLink: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    paddingVertical: 16,
    borderBottomWidth: 1,
    borderBottomColor: '#F0F0F0',
  },
  legalLinkText: {
    fontSize: 15,
    color: '#333',
  },
  footer: {
    alignItems: 'center',
    paddingVertical: 30,
    paddingHorizontal: 20,
  },
  footerText: {
    fontSize: 13,
    color: '#999',
  },
  footerSubtext: {
    fontSize: 13,
    color: '#999',
    marginTop: 4,
  },
});
