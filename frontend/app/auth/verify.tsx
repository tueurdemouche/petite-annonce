import React, { useState } from 'react';
import {
  View,
  Text,
  StyleSheet,
  TouchableOpacity,
  Image,
  Alert,
  ActivityIndicator,
  ScrollView,
} from 'react-native';
import { useRouter } from 'expo-router';
import { Ionicons } from '@expo/vector-icons';
import { SafeAreaView } from 'react-native-safe-area-context';
import * as ImagePicker from 'expo-image-picker';
import { useAuthStore } from '../../src/stores/authStore';

export default function VerifyIdentityScreen() {
  const router = useRouter();
  const { verifyIdentity, isLoading, user } = useAuthStore();
  const [idPhoto, setIdPhoto] = useState<string | null>(null);
  const [selfiePhoto, setSelfiePhoto] = useState<string | null>(null);

  const pickImage = async (type: 'id' | 'selfie') => {
    const { status } = await ImagePicker.requestCameraPermissionsAsync();
    if (status !== 'granted') {
      Alert.alert('Permission requise', 'Nous avons besoin d\'acc\u00e9der \u00e0 votre cam\u00e9ra');
      return;
    }

    const result = await ImagePicker.launchCameraAsync({
      mediaTypes: ['images'],
      allowsEditing: true,
      aspect: type === 'id' ? [16, 10] : [1, 1],
      quality: 0.8,
      base64: true,
    });

    if (!result.canceled && result.assets[0].base64) {
      const base64Image = `data:image/jpeg;base64,${result.assets[0].base64}`;
      if (type === 'id') {
        setIdPhoto(base64Image);
      } else {
        setSelfiePhoto(base64Image);
      }
    }
  };

  const pickFromGallery = async (type: 'id' | 'selfie') => {
    const { status } = await ImagePicker.requestMediaLibraryPermissionsAsync();
    if (status !== 'granted') {
      Alert.alert('Permission requise', 'Nous avons besoin d\'acc\u00e9der \u00e0 vos photos');
      return;
    }

    const result = await ImagePicker.launchImageLibraryAsync({
      mediaTypes: ['images'],
      allowsEditing: true,
      aspect: type === 'id' ? [16, 10] : [1, 1],
      quality: 0.8,
      base64: true,
    });

    if (!result.canceled && result.assets[0].base64) {
      const base64Image = `data:image/jpeg;base64,${result.assets[0].base64}`;
      if (type === 'id') {
        setIdPhoto(base64Image);
      } else {
        setSelfiePhoto(base64Image);
      }
    }
  };

  const showImageOptions = (type: 'id' | 'selfie') => {
    Alert.alert(
      'Choisir une photo',
      '',
      [
        { text: 'Prendre une photo', onPress: () => pickImage(type) },
        { text: 'Galerie', onPress: () => pickFromGallery(type) },
        { text: 'Annuler', style: 'cancel' },
      ]
    );
  };

  const handleSubmit = async () => {
    if (!idPhoto || !selfiePhoto) {
      Alert.alert('Erreur', 'Veuillez fournir les deux photos');
      return;
    }

    const success = await verifyIdentity(idPhoto, selfiePhoto);
    if (success) {
      Alert.alert(
        'Documents envoy\u00e9s',
        'Votre demande de v\u00e9rification est en cours de traitement. Vous serez notifi\u00e9 une fois valid\u00e9e.',
        [{ text: 'OK', onPress: () => router.back() }]
      );
    }
  };

  if (user?.identity_verified) {
    return (
      <SafeAreaView style={styles.container}>
        <View style={styles.verifiedContainer}>
          <Ionicons name="shield-checkmark" size={80} color="#4CAF50" />
          <Text style={styles.verifiedTitle}>Identit\u00e9 v\u00e9rifi\u00e9e</Text>
          <Text style={styles.verifiedText}>
            Votre identit\u00e9 a d\u00e9j\u00e0 \u00e9t\u00e9 v\u00e9rifi\u00e9e
          </Text>
          <TouchableOpacity
            style={styles.backBtn}
            onPress={() => router.back()}
          >
            <Text style={styles.backBtnText}>Retour</Text>
          </TouchableOpacity>
        </View>
      </SafeAreaView>
    );
  }

  return (
    <SafeAreaView style={styles.container}>
      <ScrollView contentContainerStyle={styles.content}>
        <TouchableOpacity
          style={styles.closeBtn}
          onPress={() => router.back()}
        >
          <Ionicons name="close" size={28} color="#333" />
        </TouchableOpacity>

        <View style={styles.header}>
          <Ionicons name="shield-checkmark-outline" size={60} color="#FF6B00" />
          <Text style={styles.title}>V\u00e9rification d'identit\u00e9</Text>
          <Text style={styles.subtitle}>
            Pour publier des annonces, nous devons v\u00e9rifier votre identit\u00e9 (18+ requis)
          </Text>
        </View>

        {/* ID Photo */}
        <View style={styles.photoSection}>
          <Text style={styles.photoLabel}>1. Pi\u00e8ce d'identit\u00e9</Text>
          <Text style={styles.photoHint}>
            Carte d'identit\u00e9, passeport ou permis de conduire
          </Text>
          <TouchableOpacity
            style={styles.photoBox}
            onPress={() => showImageOptions('id')}
          >
            {idPhoto ? (
              <Image source={{ uri: idPhoto }} style={styles.photoImage} />
            ) : (
              <View style={styles.photoPlaceholder}>
                <Ionicons name="card-outline" size={48} color="#CCC" />
                <Text style={styles.photoPlaceholderText}>Ajouter une photo</Text>
              </View>
            )}
          </TouchableOpacity>
        </View>

        {/* Selfie */}
        <View style={styles.photoSection}>
          <Text style={styles.photoLabel}>2. Selfie</Text>
          <Text style={styles.photoHint}>
            Photo de votre visage bien visible
          </Text>
          <TouchableOpacity
            style={[styles.photoBox, styles.selfieBox]}
            onPress={() => showImageOptions('selfie')}
          >
            {selfiePhoto ? (
              <Image source={{ uri: selfiePhoto }} style={styles.selfieImage} />
            ) : (
              <View style={styles.photoPlaceholder}>
                <Ionicons name="person-circle-outline" size={48} color="#CCC" />
                <Text style={styles.photoPlaceholderText}>Prendre un selfie</Text>
              </View>
            )}
          </TouchableOpacity>
        </View>

        <TouchableOpacity
          style={[
            styles.submitBtn,
            (!idPhoto || !selfiePhoto) && styles.submitBtnDisabled,
          ]}
          onPress={handleSubmit}
          disabled={!idPhoto || !selfiePhoto || isLoading}
        >
          {isLoading ? (
            <ActivityIndicator color="#FFF" />
          ) : (
            <Text style={styles.submitBtnText}>Envoyer pour v\u00e9rification</Text>
          )}
        </TouchableOpacity>

        <Text style={styles.privacyNote}>
          Vos documents sont stock\u00e9s de mani\u00e8re s\u00e9curis\u00e9e et utilis\u00e9s uniquement pour la v\u00e9rification.
        </Text>
      </ScrollView>
    </SafeAreaView>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: '#FFF',
  },
  content: {
    padding: 24,
  },
  closeBtn: {
    alignSelf: 'flex-start',
    marginBottom: 16,
  },
  header: {
    alignItems: 'center',
    marginBottom: 32,
  },
  title: {
    fontSize: 24,
    fontWeight: '700',
    color: '#333',
    marginTop: 16,
    marginBottom: 8,
  },
  subtitle: {
    fontSize: 15,
    color: '#666',
    textAlign: 'center',
    lineHeight: 22,
  },
  photoSection: {
    marginBottom: 24,
  },
  photoLabel: {
    fontSize: 16,
    fontWeight: '600',
    color: '#333',
    marginBottom: 4,
  },
  photoHint: {
    fontSize: 13,
    color: '#999',
    marginBottom: 12,
  },
  photoBox: {
    height: 180,
    borderRadius: 12,
    backgroundColor: '#F5F5F5',
    borderWidth: 2,
    borderColor: '#EEE',
    borderStyle: 'dashed',
    overflow: 'hidden',
  },
  selfieBox: {
    height: 200,
  },
  photoPlaceholder: {
    flex: 1,
    justifyContent: 'center',
    alignItems: 'center',
  },
  photoPlaceholderText: {
    fontSize: 14,
    color: '#999',
    marginTop: 8,
  },
  photoImage: {
    width: '100%',
    height: '100%',
    resizeMode: 'cover',
  },
  selfieImage: {
    width: '100%',
    height: '100%',
    resizeMode: 'cover',
  },
  submitBtn: {
    backgroundColor: '#FF6B00',
    height: 56,
    borderRadius: 12,
    justifyContent: 'center',
    alignItems: 'center',
    marginTop: 16,
  },
  submitBtnDisabled: {
    backgroundColor: '#CCC',
  },
  submitBtnText: {
    color: '#FFF',
    fontSize: 17,
    fontWeight: '600',
  },
  privacyNote: {
    fontSize: 12,
    color: '#999',
    textAlign: 'center',
    marginTop: 16,
    lineHeight: 18,
  },
  verifiedContainer: {
    flex: 1,
    justifyContent: 'center',
    alignItems: 'center',
    padding: 24,
  },
  verifiedTitle: {
    fontSize: 24,
    fontWeight: '700',
    color: '#333',
    marginTop: 16,
    marginBottom: 8,
  },
  verifiedText: {
    fontSize: 15,
    color: '#666',
    textAlign: 'center',
  },
  backBtn: {
    marginTop: 24,
    backgroundColor: '#FF6B00',
    paddingHorizontal: 32,
    paddingVertical: 14,
    borderRadius: 12,
  },
  backBtnText: {
    color: '#FFF',
    fontSize: 16,
    fontWeight: '600',
  },
});
