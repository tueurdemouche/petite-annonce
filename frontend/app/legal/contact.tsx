import React, { useState } from 'react';
import {
  View,
  Text,
  StyleSheet,
  ScrollView,
  TouchableOpacity,
  TextInput,
  Alert,
  Linking,
} from 'react-native';
import { useRouter } from 'expo-router';
import { Ionicons } from '@expo/vector-icons';
import { SafeAreaView } from 'react-native-safe-area-context';

export default function ContactScreen() {
  const router = useRouter();
  const [name, setName] = useState('');
  const [email, setEmail] = useState('');
  const [subject, setSubject] = useState('');
  const [message, setMessage] = useState('');

  const handleSubmit = () => {
    if (!name || !email || !subject || !message) {
      Alert.alert('Erreur', 'Veuillez remplir tous les champs');
      return;
    }

    // Open email client
    const mailtoUrl = `mailto:contact@lapetiteannonce.fr?subject=${encodeURIComponent(subject)}&body=${encodeURIComponent(`Nom: ${name}\nEmail: ${email}\n\n${message}`)}`;
    Linking.openURL(mailtoUrl);

    Alert.alert('Message envoyé', 'Nous vous répondrons dans les plus brefs délais.');
    setName('');
    setEmail('');
    setSubject('');
    setMessage('');
  };

  return (
    <SafeAreaView style={styles.container}>
      <View style={styles.header}>
        <TouchableOpacity onPress={() => router.back()} style={styles.backBtn}>
          <Ionicons name="arrow-back" size={24} color="#333" />
        </TouchableOpacity>
        <Text style={styles.headerTitle}>Contact</Text>
        <View style={{ width: 40 }} />
      </View>

      <ScrollView style={styles.content} showsVerticalScrollIndicator={false}>
        {/* Contact Info */}
        <View style={styles.infoSection}>
          <Text style={styles.sectionTitle}>Nous Contacter</Text>
          
          <TouchableOpacity 
            style={styles.contactCard}
            onPress={() => Linking.openURL('mailto:contact@lapetiteannonce.fr')}
          >
            <View style={styles.contactIconContainer}>
              <Ionicons name="mail" size={24} color="#2563EB" />
            </View>
            <View style={styles.contactInfo}>
              <Text style={styles.contactLabel}>Email</Text>
              <Text style={styles.contactValue}>victor-marouard@hotmail.com</Text>
            </View>
            <Ionicons name="chevron-forward" size={20} color="#CCC" />
          </TouchableOpacity>

          <TouchableOpacity 
            style={styles.contactCard}
            onPress={() => Linking.openURL('tel:+33123456789')}
          >
            <View style={styles.contactIconContainer}>
              <Ionicons name="call" size={24} color="#2563EB" />
            </View>
            <View style={styles.contactInfo}>
              <Text style={styles.contactLabel}>Téléphone</Text>
              <Text style={styles.contactValue}>+33 6 XX XX XX XX</Text>
            </View>
            <Ionicons name="chevron-forward" size={20} color="#CCC" />
          </TouchableOpacity>

          <View style={styles.contactCard}>
            <View style={styles.contactIconContainer}>
              <Ionicons name="location" size={24} color="#2563EB" />
            </View>
            <View style={styles.contactInfo}>
              <Text style={styles.contactLabel}>Adresse</Text>
              <Text style={styles.contactValue}>Petite Annonce SAS{"\n"}France</Text>
            </View>
          </View>

          <View style={styles.contactCard}>
            <View style={styles.contactIconContainer}>
              <Ionicons name="time" size={24} color="#2563EB" />
            </View>
            <View style={styles.contactInfo}>
              <Text style={styles.contactLabel}>Horaires Support</Text>
              <Text style={styles.contactValue}>Lun-Ven : 9h-18h</Text>
            </View>
          </View>
        </View>

        {/* Contact Form */}
        <View style={styles.formSection}>
          <Text style={styles.sectionTitle}>Formulaire de Contact</Text>

          <View style={styles.inputGroup}>
            <Text style={styles.label}>Nom complet</Text>
            <TextInput
              style={styles.input}
              placeholder="Votre nom"
              value={name}
              onChangeText={setName}
            />
          </View>

          <View style={styles.inputGroup}>
            <Text style={styles.label}>Email</Text>
            <TextInput
              style={styles.input}
              placeholder="votre@email.com"
              value={email}
              onChangeText={setEmail}
              keyboardType="email-address"
              autoCapitalize="none"
            />
          </View>

          <View style={styles.inputGroup}>
            <Text style={styles.label}>Sujet</Text>
            <TextInput
              style={styles.input}
              placeholder="Objet de votre message"
              value={subject}
              onChangeText={setSubject}
            />
          </View>

          <View style={styles.inputGroup}>
            <Text style={styles.label}>Message</Text>
            <TextInput
              style={[styles.input, styles.textArea]}
              placeholder="Décrivez votre demande..."
              value={message}
              onChangeText={setMessage}
              multiline
              numberOfLines={5}
            />
          </View>

          <TouchableOpacity style={styles.submitBtn} onPress={handleSubmit}>
            <Text style={styles.submitBtnText}>Envoyer le message</Text>
          </TouchableOpacity>
        </View>

        {/* FAQ Link */}
        <View style={styles.faqSection}>
          <Text style={styles.faqTitle}>Questions Fréquentes</Text>
          <Text style={styles.faqText}>
            Avant de nous contacter, consultez notre FAQ pour trouver rapidement une réponse à vos questions.
          </Text>
          <View style={styles.faqItems}>
            <View style={styles.faqItem}>
              <Ionicons name="help-circle" size={20} color="#2563EB" />
              <Text style={styles.faqItemText}>Comment publier une annonce ?</Text>
            </View>
            <View style={styles.faqItem}>
              <Ionicons name="help-circle" size={20} color="#2563EB" />
              <Text style={styles.faqItemText}>Comment vérifier mon identité ?</Text>
            </View>
            <View style={styles.faqItem}>
              <Ionicons name="help-circle" size={20} color="#2563EB" />
              <Text style={styles.faqItemText}>Comment booster mon annonce ?</Text>
            </View>
            <View style={styles.faqItem}>
              <Ionicons name="help-circle" size={20} color="#2563EB" />
              <Text style={styles.faqItemText}>Comment signaler un problème ?</Text>
            </View>
          </View>
        </View>

        <View style={styles.spacer} />
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
  infoSection: {
    backgroundColor: '#FFF',
    padding: 20,
    marginBottom: 8,
  },
  sectionTitle: {
    fontSize: 18,
    fontWeight: '700',
    color: '#333',
    marginBottom: 16,
  },
  contactCard: {
    flexDirection: 'row',
    alignItems: 'center',
    paddingVertical: 12,
    borderBottomWidth: 1,
    borderBottomColor: '#F0F0F0',
  },
  contactIconContainer: {
    width: 44,
    height: 44,
    borderRadius: 22,
    backgroundColor: '#EFF6FF',
    justifyContent: 'center',
    alignItems: 'center',
    marginRight: 12,
  },
  contactInfo: {
    flex: 1,
  },
  contactLabel: {
    fontSize: 12,
    color: '#999',
    marginBottom: 2,
  },
  contactValue: {
    fontSize: 14,
    color: '#333',
    fontWeight: '500',
  },
  formSection: {
    backgroundColor: '#FFF',
    padding: 20,
    marginBottom: 8,
  },
  inputGroup: {
    marginBottom: 16,
  },
  label: {
    fontSize: 14,
    fontWeight: '600',
    color: '#333',
    marginBottom: 8,
  },
  input: {
    backgroundColor: '#F5F5F5',
    borderRadius: 12,
    paddingHorizontal: 16,
    paddingVertical: 14,
    fontSize: 15,
    color: '#333',
  },
  textArea: {
    height: 120,
    textAlignVertical: 'top',
  },
  submitBtn: {
    backgroundColor: '#2563EB',
    height: 52,
    borderRadius: 12,
    justifyContent: 'center',
    alignItems: 'center',
    marginTop: 8,
  },
  submitBtnText: {
    color: '#FFF',
    fontSize: 16,
    fontWeight: '600',
  },
  faqSection: {
    backgroundColor: '#FFF',
    padding: 20,
  },
  faqTitle: {
    fontSize: 18,
    fontWeight: '700',
    color: '#333',
    marginBottom: 8,
  },
  faqText: {
    fontSize: 14,
    color: '#666',
    marginBottom: 16,
    lineHeight: 20,
  },
  faqItems: {
    gap: 12,
  },
  faqItem: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 10,
  },
  faqItemText: {
    fontSize: 14,
    color: '#333',
  },
  spacer: {
    height: 40,
  },
});
