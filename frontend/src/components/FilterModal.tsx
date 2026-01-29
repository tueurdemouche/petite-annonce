import React, { useState } from 'react';
import {
  View,
  Text,
  StyleSheet,
  Modal,
  TouchableOpacity,
  ScrollView,
  TextInput,
  Switch,
} from 'react-native';
import { Ionicons } from '@expo/vector-icons';
import { CAR_BRANDS, MOTO_BRANDS, FUEL_TYPES, VEHICLE_TYPES, PROPERTY_TYPES, TRANSMISSIONS } from '../constants/data';

interface FilterModalProps {
  visible: boolean;
  onClose: () => void;
  category: string;
  filters: any;
  onApply: (filters: any) => void;
}

export default function FilterModal({ visible, onClose, category, filters, onApply }: FilterModalProps) {
  const [localFilters, setLocalFilters] = useState(filters);

  const isAutoMoto = category === 'auto_moto';

  const handleApply = () => {
    onApply(localFilters);
    onClose();
  };

  const handleReset = () => {
    setLocalFilters({});
  };

  const renderPicker = (label: string, field: string, options: any[], valueKey = 'id', labelKey = 'name') => (
    <View style={styles.filterSection}>
      <Text style={styles.filterLabel}>{label}</Text>
      <ScrollView horizontal showsHorizontalScrollIndicator={false}>
        <TouchableOpacity
          style={[styles.chip, !localFilters[field] && styles.chipActive]}
          onPress={() => setLocalFilters({ ...localFilters, [field]: undefined })}
        >
          <Text style={[styles.chipText, !localFilters[field] && styles.chipTextActive]}>Tous</Text>
        </TouchableOpacity>
        {options.map((option) => {
          const value = typeof option === 'string' ? option : option[valueKey];
          const label = typeof option === 'string' ? option : option[labelKey];
          return (
            <TouchableOpacity
              key={value}
              style={[styles.chip, localFilters[field] === value && styles.chipActive]}
              onPress={() => setLocalFilters({ ...localFilters, [field]: value })}
            >
              <Text style={[styles.chipText, localFilters[field] === value && styles.chipTextActive]}>
                {label}
              </Text>
            </TouchableOpacity>
          );
        })}
      </ScrollView>
    </View>
  );

  return (
    <Modal visible={visible} animationType="slide" presentationStyle="pageSheet">
      <View style={styles.container}>
        <View style={styles.header}>
          <TouchableOpacity onPress={onClose}>
            <Ionicons name="close" size={28} color="#333" />
          </TouchableOpacity>
          <Text style={styles.headerTitle}>Filtres</Text>
          <TouchableOpacity onPress={handleReset}>
            <Text style={styles.resetText}>Réinitialiser</Text>
          </TouchableOpacity>
        </View>

        <ScrollView style={styles.content} showsVerticalScrollIndicator={false}>
          {/* Price Range */}
          <View style={styles.filterSection}>
            <Text style={styles.filterLabel}>Prix</Text>
            <View style={styles.rangeRow}>
              <TextInput
                style={styles.rangeInput}
                placeholder="Min"
                keyboardType="numeric"
                value={localFilters.min_price?.toString() || ''}
                onChangeText={(v) => setLocalFilters({ ...localFilters, min_price: v ? Number(v) : undefined })}
              />
              <Text style={styles.rangeSeparator}>-</Text>
              <TextInput
                style={styles.rangeInput}
                placeholder="Max"
                keyboardType="numeric"
                value={localFilters.max_price?.toString() || ''}
                onChangeText={(v) => setLocalFilters({ ...localFilters, max_price: v ? Number(v) : undefined })}
              />
              <Text style={styles.rangeUnit}>€</Text>
            </View>
          </View>

          {isAutoMoto ? (
            <>
              {/* Brand */}
              {renderPicker('Marque', 'brand', CAR_BRANDS)}

              {/* Fuel Type */}
              {renderPicker('Carburant', 'fuel_type', FUEL_TYPES)}

              {/* Transmission */}
              {renderPicker('Boîte de vitesses', 'transmission', TRANSMISSIONS)}

              {/* Vehicle Type */}
              {renderPicker('Type de véhicule', 'vehicle_type', VEHICLE_TYPES)}

              {/* Year Range */}
              <View style={styles.filterSection}>
                <Text style={styles.filterLabel}>Année</Text>
                <View style={styles.rangeRow}>
                  <TextInput
                    style={styles.rangeInput}
                    placeholder="Min"
                    keyboardType="numeric"
                    value={localFilters.min_year?.toString() || ''}
                    onChangeText={(v) => setLocalFilters({ ...localFilters, min_year: v ? Number(v) : undefined })}
                  />
                  <Text style={styles.rangeSeparator}>-</Text>
                  <TextInput
                    style={styles.rangeInput}
                    placeholder="Max"
                    keyboardType="numeric"
                    value={localFilters.max_year?.toString() || ''}
                    onChangeText={(v) => setLocalFilters({ ...localFilters, max_year: v ? Number(v) : undefined })}
                  />
                </View>
              </View>

              {/* Mileage */}
              <View style={styles.filterSection}>
                <Text style={styles.filterLabel}>Kilométrage maximum</Text>
                <TextInput
                  style={styles.input}
                  placeholder="Ex: 100000"
                  keyboardType="numeric"
                  value={localFilters.max_mileage?.toString() || ''}
                  onChangeText={(v) => setLocalFilters({ ...localFilters, max_mileage: v ? Number(v) : undefined })}
                />
              </View>
            </>
          ) : (
            <>
              {/* Property Type */}
              {renderPicker('Type de bien', 'property_type', PROPERTY_TYPES)}

              {/* Surface Range */}
              <View style={styles.filterSection}>
                <Text style={styles.filterLabel}>Surface</Text>
                <View style={styles.rangeRow}>
                  <TextInput
                    style={styles.rangeInput}
                    placeholder="Min"
                    keyboardType="numeric"
                    value={localFilters.min_surface?.toString() || ''}
                    onChangeText={(v) => setLocalFilters({ ...localFilters, min_surface: v ? Number(v) : undefined })}
                  />
                  <Text style={styles.rangeSeparator}>-</Text>
                  <TextInput
                    style={styles.rangeInput}
                    placeholder="Max"
                    keyboardType="numeric"
                    value={localFilters.max_surface?.toString() || ''}
                    onChangeText={(v) => setLocalFilters({ ...localFilters, max_surface: v ? Number(v) : undefined })}
                  />
                  <Text style={styles.rangeUnit}>m²</Text>
                </View>
              </View>

              {/* Rooms */}
              <View style={styles.filterSection}>
                <Text style={styles.filterLabel}>Pièces minimum</Text>
                <TextInput
                  style={styles.input}
                  placeholder="Ex: 3"
                  keyboardType="numeric"
                  value={localFilters.min_rooms?.toString() || ''}
                  onChangeText={(v) => setLocalFilters({ ...localFilters, min_rooms: v ? Number(v) : undefined })}
                />
              </View>

              {/* Handicap Access */}
              <View style={styles.filterSection}>
                <View style={styles.switchRow}>
                  <Text style={styles.filterLabel}>Accès handicapé</Text>
                  <Switch
                    value={localFilters.handicap_access || false}
                    onValueChange={(v) => setLocalFilters({ ...localFilters, handicap_access: v || undefined })}
                    trackColor={{ false: '#DDD', true: '#FF6B00' }}
                  />
                </View>
              </View>

              {/* Garden */}
              <View style={styles.filterSection}>
                <View style={styles.switchRow}>
                  <Text style={styles.filterLabel}>Avec jardin</Text>
                  <Switch
                    value={localFilters.has_garden || false}
                    onValueChange={(v) => setLocalFilters({ ...localFilters, has_garden: v || undefined })}
                    trackColor={{ false: '#DDD', true: '#FF6B00' }}
                  />
                </View>
              </View>
            </>
          )}
        </ScrollView>

        <View style={styles.footer}>
          <TouchableOpacity style={styles.applyBtn} onPress={handleApply}>
            <Text style={styles.applyBtnText}>Appliquer les filtres</Text>
          </TouchableOpacity>
        </View>
      </View>
    </Modal>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: '#FFF',
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
  resetText: {
    fontSize: 14,
    color: '#FF6B00',
    fontWeight: '500',
  },
  content: {
    flex: 1,
    padding: 16,
  },
  filterSection: {
    marginBottom: 24,
  },
  filterLabel: {
    fontSize: 15,
    fontWeight: '600',
    color: '#333',
    marginBottom: 12,
  },
  chip: {
    paddingHorizontal: 16,
    paddingVertical: 8,
    borderRadius: 20,
    backgroundColor: '#F0F0F0',
    marginRight: 8,
  },
  chipActive: {
    backgroundColor: '#FF6B00',
  },
  chipText: {
    fontSize: 13,
    color: '#666',
  },
  chipTextActive: {
    color: '#FFF',
    fontWeight: '500',
  },
  rangeRow: {
    flexDirection: 'row',
    alignItems: 'center',
  },
  rangeInput: {
    flex: 1,
    height: 44,
    borderWidth: 1,
    borderColor: '#DDD',
    borderRadius: 8,
    paddingHorizontal: 12,
    fontSize: 15,
  },
  rangeSeparator: {
    marginHorizontal: 12,
    fontSize: 16,
    color: '#666',
  },
  rangeUnit: {
    marginLeft: 8,
    fontSize: 15,
    color: '#666',
  },
  input: {
    height: 44,
    borderWidth: 1,
    borderColor: '#DDD',
    borderRadius: 8,
    paddingHorizontal: 12,
    fontSize: 15,
  },
  switchRow: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
  },
  footer: {
    padding: 16,
    borderTopWidth: 1,
    borderTopColor: '#EEE',
  },
  applyBtn: {
    backgroundColor: '#FF6B00',
    height: 52,
    borderRadius: 12,
    justifyContent: 'center',
    alignItems: 'center',
  },
  applyBtnText: {
    color: '#FFF',
    fontSize: 16,
    fontWeight: '600',
  },
});
