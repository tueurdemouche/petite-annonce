import React, { useState, useEffect } from 'react';
import {
  View,
  Text,
  StyleSheet,
  TextInput,
  TouchableOpacity,
  ScrollView,
  Image,
  Alert,
  ActivityIndicator,
  KeyboardAvoidingView,
  Platform,
} from 'react-native';
import { useRouter, useLocalSearchParams } from 'expo-router';
import { Ionicons } from '@expo/vector-icons';
import { SafeAreaView } from 'react-native-safe-area-context';
import * as ImagePicker from 'expo-image-picker';
import * as Location from 'expo-location';
import { listingsAPI, paymentsAPI } from '../../src/services/api';
import { useAuthStore } from '../../src/stores/authStore';
import { CATEGORIES, CAR_BRANDS, MOTO_BRANDS, FUEL_TYPES, VEHICLE_TYPES, PROPERTY_TYPES, TRANSMISSIONS } from '../../src/constants/data';

export default function CreateListingScreen() {
  const router = useRouter();
  const { edit } = useLocalSearchParams();
  const { user } = useAuthStore();
  const [loading, setLoading] = useState(false);
  const [step, setStep] = useState(1);

  const [formData, setFormData] = useState({
    title: '',
    description: '',
    price: '',
    category: '',
    sub_category: '',
    location: '',
    latitude: null as number | null,
    longitude: null as number | null,
    photos: [] as string[],
    // Auto/Moto
    brand: '',
    model: '',
    year: '',
    mileage: '',
    fuel_type: '',
    transmission: '',
    vehicle_type: '',
    // Immobilier
    surface_m2: '',
    rooms: '',
    floor: '',
    total_floors: '',
    handicap_access: false,
    has_garden: false,
    property_type: '',
  });

  const [hasExtraPhotos, setHasExtraPhotos] = useState(false);

  useEffect(() => {
    if (edit) {
      fetchListing();
    }
  }, [edit]);

  const fetchListing = async () => {
    try {
      setLoading(true);
      const response = await listingsAPI.getById(edit as string);
      const listing = response.data;
      setFormData({
        title: listing.title,
        description: listing.description,
        price: listing.price.toString(),
        category: listing.category,
        sub_category: listing.sub_category,
        location: listing.location,
        latitude: listing.latitude,
        longitude: listing.longitude,
        photos: listing.photos || [],
        brand: listing.brand || '',
        model: listing.model || '',
        year: listing.year?.toString() || '',
        mileage: listing.mileage?.toString() || '',
        fuel_type: listing.fuel_type || '',
        transmission: listing.transmission || '',
        vehicle_type: listing.vehicle_type || '',
        surface_m2: listing.surface_m2?.toString() || '',
        rooms: listing.rooms?.toString() || '',
        floor: listing.floor?.toString() || '',
        total_floors: listing.total_floors?.toString() || '',
        handicap_access: listing.handicap_access || false,
        has_garden: listing.has_garden || false,
        property_type: listing.property_type || '',
      });
      setHasExtraPhotos(listing.has_extra_photos || false);
    } catch (error) {
      console.error('Error fetching listing:', error);
    } finally {
      setLoading(false);
    }
  };

  const updateField = (field: string, value: any) => {
    setFormData({ ...formData, [field]: value });
  };

  const getLocation = async () => {
    try {
      const { status } = await Location.requestForegroundPermissionsAsync();
      if (status !== 'granted') {
        Alert.alert('Permission refusée', 'Autorisation de localisation requise');
        return;
      }

      const location = await Location.getCurrentPositionAsync({});
      const geocode = await Location.reverseGeocodeAsync({
        latitude: location.coords.latitude,
        longitude: location.coords.longitude,
      });

      if (geocode[0]) {
        const address = `${geocode[0].city || ''}, ${geocode[0].region || ''}`;
        updateField('location', address.replace(/, $/, ''));
        updateField('latitude', location.coords.latitude);
        updateField('longitude', location.coords.longitude);
      }
    } catch (error) {
      console.error('Error getting location:', error);
      Alert.alert('Erreur', 'Impossible de récupérer la localisation');
    }
  };

  const pickImage = async () => {
    const maxPhotos = hasExtraPhotos ? 10 : 5;
    if (formData.photos.length >= maxPhotos) {
      if (!hasExtraPhotos) {
        Alert.alert(
          'Limite atteinte',
          'Vous avez atteint la limite de 5 photos gratuites. Souhaitez-vous acheter 5 photos supplémentaires pour 9,99€ ?',
          [
            { text: 'Non', style: 'cancel' },
            { text: 'Oui', onPress: () => buyExtraPhotos() },
          ]
        );
      } else {
        Alert.alert('Limite', 'Maximum 10 photos par annonce');
      }
      return;
    }

    const result = await ImagePicker.launchImageLibraryAsync({
      mediaTypes: ['images'],
      allowsMultipleSelection: true,
      selectionLimit: maxPhotos - formData.photos.length,
      quality: 0.8,
      base64: true,
    });

    if (!result.canceled) {
      const newPhotos = result.assets
        .filter((asset) => asset.base64)
        .map((asset) => `data:image/jpeg;base64,${asset.base64}`);
      updateField('photos', [...formData.photos, ...newPhotos].slice(0, maxPhotos));
    }
  };

  const removePhoto = (index: number) => {
    const newPhotos = [...formData.photos];
    newPhotos.splice(index, 1);
    updateField('photos', newPhotos);
  };

  const buyExtraPhotos = async () => {
    if (!edit) {
      Alert.alert('Info', 'Créez d\'abord votre annonce, puis vous pourrez acheter l\'option photos supplémentaires');
      return;
    }

    try {
      await paymentsAPI.extraPhotos({ listing_id: edit, payment_method: 'stripe' });
      setHasExtraPhotos(true);
      Alert.alert('Succès', 'Vous pouvez maintenant ajouter jusqu\'à 10 photos !');
    } catch (error) {
      console.error('Error buying extra photos:', error);
    }
  };

  const validateStep = () => {
    switch (step) {
      case 1:
        if (!formData.category || !formData.sub_category) {
          Alert.alert('Erreur', 'Veuillez sélectionner une catégorie');
          return false;
        }
        break;
      case 2:
        if (!formData.title || !formData.description || !formData.price) {
          Alert.alert('Erreur', 'Veuillez remplir tous les champs obligatoires');
          return false;
        }
        break;
      case 3:
        if (!formData.location) {
          Alert.alert('Erreur', 'Veuillez indiquer une localisation');
          return false;
        }
        break;
    }
    return true;
  };

  const handleNext = () => {
    if (validateStep()) {
      setStep(step + 1);
    }
  };

  const handleSubmit = async () => {
    if (formData.photos.length === 0) {
      Alert.alert('Erreur', 'Ajoutez au moins une photo');
      return;
    }

    setLoading(true);
    try {
      const data: any = {
        title: formData.title,
        description: formData.description,
        price: parseFloat(formData.price),
        category: formData.category,
        sub_category: formData.sub_category,
        location: formData.location,
        latitude: formData.latitude,
        longitude: formData.longitude,
        photos: formData.photos,
      };

      if (formData.category === 'auto_moto') {
        if (formData.brand) data.brand = formData.brand;
        if (formData.model) data.model = formData.model;
        if (formData.year) data.year = parseInt(formData.year);
        if (formData.mileage) data.mileage = parseInt(formData.mileage);
        if (formData.fuel_type) data.fuel_type = formData.fuel_type;
        if (formData.transmission) data.transmission = formData.transmission;
        if (formData.vehicle_type) data.vehicle_type = formData.vehicle_type;
      } else {
        if (formData.property_type) data.property_type = formData.property_type;
        if (formData.surface_m2) data.surface_m2 = parseInt(formData.surface_m2);
        if (formData.rooms) data.rooms = parseInt(formData.rooms);
        if (formData.floor) data.floor = parseInt(formData.floor);
        if (formData.total_floors) data.total_floors = parseInt(formData.total_floors);
        data.handicap_access = formData.handicap_access;
        data.has_garden = formData.has_garden;
      }

      if (edit) {
        await listingsAPI.update(edit as string, data);
        Alert.alert('Succès', 'Annonce mise à jour ! Elle sera revue par notre équipe.');
      } else {
        await listingsAPI.create(data);
        Alert.alert('Succès', 'Annonce créée ! Elle sera validée sous peu.');
      }
      router.back();
    } catch (error: any) {
      console.error('Error submitting listing:', error);
      Alert.alert('Erreur', error.response?.data?.detail || 'Impossible de publier l\'annonce');
    } finally {
      setLoading(false);
    }
  };

  const currentCategory = formData.category ? CATEGORIES[formData.category as keyof typeof CATEGORIES] : null;
  const isAutoMoto = formData.category === 'auto_moto';
  const brands = formData.sub_category?.includes('moto') || formData.sub_category === 'scooter'
    ? MOTO_BRANDS
    : CAR_BRANDS;

  const renderStep1 = () => (
    <View style={styles.stepContent}>
      <Text style={styles.stepTitle}>Catégorie</Text>
      <Text style={styles.stepSubtitle}>Choisissez le type d'annonce</Text>

      {Object.entries(CATEGORIES).map(([key, cat]) => (
        <TouchableOpacity
          key={key}
          style={[
            styles.categoryOption,
            formData.category === key && styles.categoryOptionActive,
          ]}
          onPress={() => updateField('category', key)}
        >
          <Ionicons
            name={cat.icon as any}
            size={28}
            color={formData.category === key ? '#2563EB' : '#666'}
          />
          <Text
            style={[
              styles.categoryOptionText,
              formData.category === key && styles.categoryOptionTextActive,
            ]}
          >
            {cat.name}
          </Text>
        </TouchableOpacity>
      ))}

      {currentCategory && (
        <View style={styles.subCategories}>
          <Text style={styles.subCategoryLabel}>Sous-catégorie</Text>
          {currentCategory.sub_categories.map((sub) => (
            <TouchableOpacity
              key={sub.id}
              style={[
                styles.subCategoryOption,
                formData.sub_category === sub.id && styles.subCategoryOptionActive,
              ]}
              onPress={() => updateField('sub_category', sub.id)}
            >
              <Text
                style={[
                  styles.subCategoryText,
                  formData.sub_category === sub.id && styles.subCategoryTextActive,
                ]}
              >
                {sub.name}
              </Text>
            </TouchableOpacity>
          ))}
        </View>
      )}
    </View>
  );

  const renderStep2 = () => (
    <View style={styles.stepContent}>
      <Text style={styles.stepTitle}>Informations</Text>

      <View style={styles.inputGroup}>
        <Text style={styles.label}>Titre *</Text>
        <TextInput
          style={styles.input}
          placeholder="Ex: Peugeot 208 - Excellent état"
          value={formData.title}
          onChangeText={(v) => updateField('title', v)}
          maxLength={100}
        />
      </View>

      <View style={styles.inputGroup}>
        <Text style={styles.label}>Description *</Text>
        <TextInput
          style={[styles.input, styles.textArea]}
          placeholder="Décrivez votre bien en détail..."
          value={formData.description}
          onChangeText={(v) => updateField('description', v)}
          multiline
          numberOfLines={5}
        />
      </View>

      <View style={styles.inputGroup}>
        <Text style={styles.label}>Prix (€) *</Text>
        <TextInput
          style={styles.input}
          placeholder="Ex: 15000"
          value={formData.price}
          onChangeText={(v) => updateField('price', v)}
          keyboardType="numeric"
        />
      </View>

      {isAutoMoto && (
        <>
          <View style={styles.inputGroup}>
            <Text style={styles.label}>Marque</Text>
            <ScrollView horizontal showsHorizontalScrollIndicator={false}>
              {brands.slice(0, 20).map((brand) => (
                <TouchableOpacity
                  key={brand}
                  style={[
                    styles.chip,
                    formData.brand === brand && styles.chipActive,
                  ]}
                  onPress={() => updateField('brand', brand)}
                >
                  <Text
                    style={[
                      styles.chipText,
                      formData.brand === brand && styles.chipTextActive,
                    ]}
                  >
                    {brand}
                  </Text>
                </TouchableOpacity>
              ))}
            </ScrollView>
          </View>

          <View style={styles.inputGroup}>
            <Text style={styles.label}>Modèle</Text>
            <TextInput
              style={styles.input}
              placeholder="Ex: 208, Golf, Clio..."
              value={formData.model}
              onChangeText={(v) => updateField('model', v)}
            />
          </View>

          <View style={styles.row}>
            <View style={[styles.inputGroup, { flex: 1, marginRight: 8 }]}>
              <Text style={styles.label}>Année</Text>
              <TextInput
                style={styles.input}
                placeholder="2020"
                value={formData.year}
                onChangeText={(v) => updateField('year', v)}
                keyboardType="numeric"
              />
            </View>
            <View style={[styles.inputGroup, { flex: 1, marginLeft: 8 }]}>
              <Text style={styles.label}>Kilométrage</Text>
              <TextInput
                style={styles.input}
                placeholder="50000"
                value={formData.mileage}
                onChangeText={(v) => updateField('mileage', v)}
                keyboardType="numeric"
              />
            </View>
          </View>

          <View style={styles.inputGroup}>
            <Text style={styles.label}>Carburant</Text>
            <View style={styles.chipsRow}>
              {FUEL_TYPES.map((fuel) => (
                <TouchableOpacity
                  key={fuel.id}
                  style={[
                    styles.chip,
                    formData.fuel_type === fuel.id && styles.chipActive,
                  ]}
                  onPress={() => updateField('fuel_type', fuel.id)}
                >
                  <Text
                    style={[
                      styles.chipText,
                      formData.fuel_type === fuel.id && styles.chipTextActive,
                    ]}
                  >
                    {fuel.name}
                  </Text>
                </TouchableOpacity>
              ))}
            </View>
          </View>

          <View style={styles.inputGroup}>
            <Text style={styles.label}>Boîte de vitesses</Text>
            <View style={styles.chipsRow}>
              {TRANSMISSIONS.map((trans) => (
                <TouchableOpacity
                  key={trans.id}
                  style={[
                    styles.chip,
                    formData.transmission === trans.id && styles.chipActive,
                  ]}
                  onPress={() => updateField('transmission', trans.id)}
                >
                  <Text
                    style={[
                      styles.chipText,
                      formData.transmission === trans.id && styles.chipTextActive,
                    ]}
                  >
                    {trans.name}
                  </Text>
                </TouchableOpacity>
              ))}
            </View>
          </View>
        </>
      )}

      {!isAutoMoto && (
        <>
          <View style={styles.inputGroup}>
            <Text style={styles.label}>Type de bien</Text>
            <View style={styles.chipsRow}>
              {PROPERTY_TYPES.map((type) => (
                <TouchableOpacity
                  key={type.id}
                  style={[
                    styles.chip,
                    formData.property_type === type.id && styles.chipActive,
                  ]}
                  onPress={() => updateField('property_type', type.id)}
                >
                  <Text
                    style={[
                      styles.chipText,
                      formData.property_type === type.id && styles.chipTextActive,
                    ]}
                  >
                    {type.name}
                  </Text>
                </TouchableOpacity>
              ))}
            </View>
          </View>

          <View style={styles.row}>
            <View style={[styles.inputGroup, { flex: 1, marginRight: 8 }]}>
              <Text style={styles.label}>Surface (m²)</Text>
              <TextInput
                style={styles.input}
                placeholder="80"
                value={formData.surface_m2}
                onChangeText={(v) => updateField('surface_m2', v)}
                keyboardType="numeric"
              />
            </View>
            <View style={[styles.inputGroup, { flex: 1, marginLeft: 8 }]}>
              <Text style={styles.label}>Pièces</Text>
              <TextInput
                style={styles.input}
                placeholder="4"
                value={formData.rooms}
                onChangeText={(v) => updateField('rooms', v)}
                keyboardType="numeric"
              />
            </View>
          </View>

          <View style={styles.row}>
            <View style={[styles.inputGroup, { flex: 1, marginRight: 8 }]}>
              <Text style={styles.label}>Étage</Text>
              <TextInput
                style={styles.input}
                placeholder="2"
                value={formData.floor}
                onChangeText={(v) => updateField('floor', v)}
                keyboardType="numeric"
              />
            </View>
            <View style={[styles.inputGroup, { flex: 1, marginLeft: 8 }]}>
              <Text style={styles.label}>Total étages</Text>
              <TextInput
                style={styles.input}
                placeholder="5"
                value={formData.total_floors}
                onChangeText={(v) => updateField('total_floors', v)}
                keyboardType="numeric"
              />
            </View>
          </View>

          <View style={styles.switchRow}>
            <Text style={styles.switchLabel}>Accès handicapé</Text>
            <TouchableOpacity
              style={[
                styles.switchBtn,
                formData.handicap_access && styles.switchBtnActive,
              ]}
              onPress={() => updateField('handicap_access', !formData.handicap_access)}
            >
              <Text style={[styles.switchBtnText, formData.handicap_access && styles.switchBtnTextActive]}>
                {formData.handicap_access ? 'Oui' : 'Non'}
              </Text>
            </TouchableOpacity>
          </View>

          <View style={styles.switchRow}>
            <Text style={styles.switchLabel}>Jardin</Text>
            <TouchableOpacity
              style={[
                styles.switchBtn,
                formData.has_garden && styles.switchBtnActive,
              ]}
              onPress={() => updateField('has_garden', !formData.has_garden)}
            >
              <Text style={[styles.switchBtnText, formData.has_garden && styles.switchBtnTextActive]}>
                {formData.has_garden ? 'Oui' : 'Non'}
              </Text>
            </TouchableOpacity>
          </View>
        </>
      )}
    </View>
  );

  const renderStep3 = () => (
    <View style={styles.stepContent}>
      <Text style={styles.stepTitle}>Localisation</Text>

      <View style={styles.inputGroup}>
        <Text style={styles.label}>Ville / Région *</Text>
        <View style={styles.locationRow}>
          <TextInput
            style={[styles.input, { flex: 1 }]}
            placeholder="Ex: Paris, Île-de-France"
            value={formData.location}
            onChangeText={(v) => updateField('location', v)}
          />
          <TouchableOpacity style={styles.locationBtn} onPress={getLocation}>
            <Ionicons name="locate" size={24} color="#2563EB" />
          </TouchableOpacity>
        </View>
      </View>
    </View>
  );

  const renderStep4 = () => (
    <View style={styles.stepContent}>
      <Text style={styles.stepTitle}>Photos</Text>
      <Text style={styles.stepSubtitle}>
        {hasExtraPhotos ? '10 photos maximum' : '5 photos gratuites (+ 5 pour 9,99€)'}
      </Text>

      <View style={styles.photosGrid}>
        {formData.photos.map((photo, index) => (
          <View key={index} style={styles.photoItem}>
            <Image source={{ uri: photo }} style={styles.photoImage} />
            <TouchableOpacity
              style={styles.removePhotoBtn}
              onPress={() => removePhoto(index)}
            >
              <Ionicons name="close-circle" size={24} color="#FF4444" />
            </TouchableOpacity>
          </View>
        ))}
        
        <TouchableOpacity style={styles.addPhotoBtn} onPress={pickImage}>
          <Ionicons name="add" size={32} color="#999" />
          <Text style={styles.addPhotoText}>Ajouter</Text>
        </TouchableOpacity>
      </View>

      {formData.photos.length >= 5 && !hasExtraPhotos && (
        <TouchableOpacity style={styles.extraPhotosBtn} onPress={buyExtraPhotos}>
          <Ionicons name="images" size={20} color="#FFF" />
          <Text style={styles.extraPhotosBtnText}>+ 5 photos pour 9,99€</Text>
        </TouchableOpacity>
      )}
    </View>
  );

  if (loading && edit) {
    return (
      <View style={styles.loadingContainer}>
        <ActivityIndicator size="large" color="#2563EB" />
      </View>
    );
  }

  return (
    <SafeAreaView style={styles.container}>
      <KeyboardAvoidingView
        style={styles.container}
        behavior={Platform.OS === 'ios' ? 'padding' : undefined}
      >
        {/* Header */}
        <View style={styles.header}>
          <TouchableOpacity onPress={() => router.back()}>
            <Ionicons name="close" size={28} color="#333" />
          </TouchableOpacity>
          <Text style={styles.headerTitle}>
            {edit ? 'Modifier l\'annonce' : 'Nouvelle annonce'}
          </Text>
          <View style={{ width: 28 }} />
        </View>

        {/* Progress */}
        <View style={styles.progressBar}>
          {[1, 2, 3, 4].map((s) => (
            <View
              key={s}
              style={[
                styles.progressStep,
                s <= step && styles.progressStepActive,
              ]}
            />
          ))}
        </View>

        <ScrollView
          style={styles.scrollView}
          contentContainerStyle={styles.scrollContent}
          showsVerticalScrollIndicator={false}
        >
          {step === 1 && renderStep1()}
          {step === 2 && renderStep2()}
          {step === 3 && renderStep3()}
          {step === 4 && renderStep4()}
        </ScrollView>

        {/* Footer */}
        <View style={styles.footer}>
          {step > 1 && (
            <TouchableOpacity
              style={styles.prevBtn}
              onPress={() => setStep(step - 1)}
            >
              <Text style={styles.prevBtnText}>Précédent</Text>
            </TouchableOpacity>
          )}
          <TouchableOpacity
            style={[styles.nextBtn, step === 1 && { flex: 1 }]}
            onPress={step < 4 ? handleNext : handleSubmit}
            disabled={loading}
          >
            {loading ? (
              <ActivityIndicator color="#FFF" />
            ) : (
              <Text style={styles.nextBtnText}>
                {step < 4 ? 'Suivant' : edit ? 'Mettre à jour' : 'Publier'}
              </Text>
            )}
          </TouchableOpacity>
        </View>
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
  header: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    padding: 16,
    borderBottomWidth: 1,
    borderBottomColor: '#EEE',
  },
  headerTitle: {
    fontSize: 18,
    fontWeight: '600',
    color: '#333',
  },
  progressBar: {
    flexDirection: 'row',
    padding: 16,
    gap: 8,
  },
  progressStep: {
    flex: 1,
    height: 4,
    backgroundColor: '#EEE',
    borderRadius: 2,
  },
  progressStepActive: {
    backgroundColor: '#2563EB',
  },
  scrollView: {
    flex: 1,
  },
  scrollContent: {
    padding: 16,
  },
  stepContent: {},
  stepTitle: {
    fontSize: 24,
    fontWeight: '700',
    color: '#333',
    marginBottom: 8,
  },
  stepSubtitle: {
    fontSize: 15,
    color: '#666',
    marginBottom: 24,
  },
  categoryOption: {
    flexDirection: 'row',
    alignItems: 'center',
    padding: 16,
    backgroundColor: '#F9F9F9',
    borderRadius: 12,
    marginBottom: 12,
    borderWidth: 2,
    borderColor: 'transparent',
    gap: 16,
  },
  categoryOptionActive: {
    borderColor: '#2563EB',
    backgroundColor: '#FFF5EE',
  },
  categoryOptionText: {
    fontSize: 16,
    fontWeight: '500',
    color: '#666',
  },
  categoryOptionTextActive: {
    color: '#2563EB',
  },
  subCategories: {
    marginTop: 16,
  },
  subCategoryLabel: {
    fontSize: 15,
    fontWeight: '600',
    color: '#333',
    marginBottom: 12,
  },
  subCategoryOption: {
    padding: 14,
    backgroundColor: '#F5F5F5',
    borderRadius: 10,
    marginBottom: 8,
  },
  subCategoryOptionActive: {
    backgroundColor: '#2563EB',
  },
  subCategoryText: {
    fontSize: 15,
    color: '#666',
  },
  subCategoryTextActive: {
    color: '#FFF',
    fontWeight: '500',
  },
  inputGroup: {
    marginBottom: 20,
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
  row: {
    flexDirection: 'row',
  },
  chipsRow: {
    flexDirection: 'row',
    flexWrap: 'wrap',
    gap: 8,
  },
  chip: {
    paddingHorizontal: 14,
    paddingVertical: 8,
    backgroundColor: '#F0F0F0',
    borderRadius: 20,
    marginRight: 8,
    marginBottom: 8,
  },
  chipActive: {
    backgroundColor: '#2563EB',
  },
  chipText: {
    fontSize: 13,
    color: '#666',
  },
  chipTextActive: {
    color: '#FFF',
    fontWeight: '500',
  },
  switchRow: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    marginBottom: 16,
  },
  switchLabel: {
    fontSize: 15,
    color: '#333',
  },
  switchBtn: {
    paddingHorizontal: 20,
    paddingVertical: 8,
    backgroundColor: '#F0F0F0',
    borderRadius: 20,
  },
  switchBtnActive: {
    backgroundColor: '#2563EB',
  },
  switchBtnText: {
    fontSize: 14,
    color: '#666',
  },
  switchBtnTextActive: {
    color: '#FFF',
    fontWeight: '500',
  },
  locationRow: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 12,
  },
  locationBtn: {
    width: 52,
    height: 52,
    backgroundColor: '#FFF5EE',
    borderRadius: 12,
    justifyContent: 'center',
    alignItems: 'center',
  },
  photosGrid: {
    flexDirection: 'row',
    flexWrap: 'wrap',
    gap: 12,
  },
  photoItem: {
    width: 100,
    height: 100,
    borderRadius: 12,
    overflow: 'hidden',
  },
  photoImage: {
    width: '100%',
    height: '100%',
  },
  removePhotoBtn: {
    position: 'absolute',
    top: 4,
    right: 4,
  },
  addPhotoBtn: {
    width: 100,
    height: 100,
    borderRadius: 12,
    backgroundColor: '#F5F5F5',
    borderWidth: 2,
    borderColor: '#DDD',
    borderStyle: 'dashed',
    justifyContent: 'center',
    alignItems: 'center',
  },
  addPhotoText: {
    fontSize: 12,
    color: '#999',
    marginTop: 4,
  },
  extraPhotosBtn: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'center',
    backgroundColor: '#2563EB',
    padding: 14,
    borderRadius: 12,
    marginTop: 24,
    gap: 8,
  },
  extraPhotosBtnText: {
    color: '#FFF',
    fontSize: 15,
    fontWeight: '600',
  },
  footer: {
    flexDirection: 'row',
    padding: 16,
    borderTopWidth: 1,
    borderTopColor: '#EEE',
    gap: 12,
  },
  prevBtn: {
    flex: 1,
    height: 52,
    justifyContent: 'center',
    alignItems: 'center',
    backgroundColor: '#F5F5F5',
    borderRadius: 12,
  },
  prevBtnText: {
    fontSize: 16,
    fontWeight: '600',
    color: '#666',
  },
  nextBtn: {
    flex: 2,
    height: 52,
    justifyContent: 'center',
    alignItems: 'center',
    backgroundColor: '#2563EB',
    borderRadius: 12,
  },
  nextBtnText: {
    fontSize: 16,
    fontWeight: '600',
    color: '#FFF',
  },
});
