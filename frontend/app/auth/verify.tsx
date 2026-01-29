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
      Alert.alert('Permission requise', 'Nous avons besoin d\'accéder à votre caméra');
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
      Alert.alert('Permission requise', 'Nous avons besoin d\'accéder à vos photos');
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
        'Documents envoyés',
        'Votre demande de vérification est en cours de traitement. Vous serez notifié une fois validée.',
        [{ text: 'OK', onPress: () => router.back() }]
      );
    }
  };

  if (user?.identity_verified) {
    return (
      <SafeAreaView style={styles.container}>
        <View style={styles.verifiedContainer}>
          <Ionicons name="shield-checkmark" size={80} color="#4CAF50" />
          <Text style={styles.verifiedTitle}>Identité vérifiée</Text>
          <Text style={styles.verifiedText}>
            Votre identité a déjà été vérifiée
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
          <Ionicons name="shield-checkmark-outline" size={60} color="#2563EB" />
          <Text style={styles.title}>Vérification d'identité</Text>
          <Text style={styles.subtitle}>
            Pour publier des annonces, nous devons vérifier votre identité (18+ requis)
          </Text>
        </View>

        {/* ID Photo */}
        <View style={styles.photoSection}>
          <Text style={styles.photoLabel}>1. Pièce d'identité</Text>
          <Text style={styles.photoHint}>
            Carte d'identité, passeport ou permis de conduire
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
            <Text style={styles.submitBtnText}>Envoyer pour vérification</Text>
          )}
        </TouchableOpacity>

        <Text style={styles.privacyNote}>
          Vos documents sont stockés de manière sécurisée et utilisés uniquement pour la vérification.
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
    backgroundColor: '#2563EB',
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
    backgroundColor: '#2563EB',
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
