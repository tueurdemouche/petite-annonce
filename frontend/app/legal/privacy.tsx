import React from 'react';
import {
  View,
  Text,
  StyleSheet,
  ScrollView,
  TouchableOpacity,
} from 'react-native';
import { useRouter } from 'expo-router';
import { Ionicons } from '@expo/vector-icons';
import { SafeAreaView } from 'react-native-safe-area-context';

export default function PrivacyPolicyScreen() {
  const router = useRouter();

  return (
    <SafeAreaView style={styles.container}>
      <View style={styles.header}>
        <TouchableOpacity onPress={() => router.back()} style={styles.backBtn}>
          <Ionicons name="arrow-back" size={24} color="#333" />
        </TouchableOpacity>
        <Text style={styles.headerTitle}>Politique de Confidentialité</Text>
        <View style={{ width: 40 }} />
      </View>

      <ScrollView style={styles.content} showsVerticalScrollIndicator={false}>
        <Text style={styles.lastUpdate}>Dernière mise à jour : Janvier 2025</Text>

        <View style={styles.section}>
          <Text style={styles.sectionTitle}>1. Introduction</Text>
          <Text style={styles.text}>
            Bienvenue sur Petite Annonce. Nous nous engageons à protéger votre vie privée et vos données personnelles. Cette politique de confidentialité explique comment nous collectons, utilisons et protégeons vos informations lorsque vous utilisez notre application mobile.
          </Text>
        </View>

        <View style={styles.section}>
          <Text style={styles.sectionTitle}>2. Données Collectées</Text>
          <Text style={styles.text}>
            Nous collectons les informations suivantes :{"\n\n"}
            • <Text style={styles.bold}>Informations d'identité</Text> : Nom, prénom, date de naissance, adresse email, numéro de téléphone{"\n"}
            • <Text style={styles.bold}>Documents d'identité</Text> : Photo de pièce d'identité et selfie pour la vérification de l'âge (18+){"\n"}
            • <Text style={styles.bold}>Données de localisation</Text> : Position géographique pour localiser vos annonces{"\n"}
            • <Text style={styles.bold}>Photos</Text> : Images téléchargées pour vos annonces{"\n"}
            • <Text style={styles.bold}>Communications</Text> : Messages échangés avec d'autres utilisateurs
          </Text>
        </View>

        <View style={styles.section}>
          <Text style={styles.sectionTitle}>3. Utilisation des Données</Text>
          <Text style={styles.text}>
            Vos données sont utilisées pour :{"\n\n"}
            • Créer et gérer votre compte utilisateur{"\n"}
            • Publier et gérer vos annonces{"\n"}
            • Vérifier votre identité et votre âge (18+ obligatoire){"\n"}
            • Permettre la communication entre acheteurs et vendeurs{"\n"}
            • Localiser géographiquement les annonces{"\n"}
            • Traiter les paiements (boost, photos supplémentaires){"\n"}
            • Améliorer nos services et votre expérience utilisateur{"\n"}
            • Prévenir les fraudes et assurer la sécurité
          </Text>
        </View>

        <View style={styles.section}>
          <Text style={styles.sectionTitle}>4. Stockage et Sécurité</Text>
          <Text style={styles.text}>
            Vos données sont stockées sur des serveurs sécurisés. Nous utilisons des mesures de sécurité techniques et organisationnelles pour protéger vos informations personnelles contre tout accès non autorisé, modification, divulgation ou destruction.{"\n\n"}
            Les documents d'identité sont stockés de manière chiffrée et ne sont accessibles qu'aux administrateurs autorisés pour la vérification.
          </Text>
        </View>

        <View style={styles.section}>
          <Text style={styles.sectionTitle}>5. Partage des Données</Text>
          <Text style={styles.text}>
            Nous ne vendons pas vos données personnelles. Vos informations peuvent être partagées avec :{"\n\n"}
            • <Text style={styles.bold}>Autres utilisateurs</Text> : Nom et localisation affichés sur vos annonces{"\n"}
            • <Text style={styles.bold}>Prestataires de paiement</Text> : Pour traiter les transactions{"\n"}
            • <Text style={styles.bold}>Autorités</Text> : Si requis par la loi
          </Text>
        </View>

        <View style={styles.section}>
          <Text style={styles.sectionTitle}>6. Vos Droits</Text>
          <Text style={styles.text}>
            Conformément au RGPD, vous avez le droit de :{"\n\n"}
            • Accéder à vos données personnelles{"\n"}
            • Rectifier vos données{"\n"}
            • Supprimer votre compte et vos données{"\n"}
            • Vous opposer au traitement de vos données{"\n"}
            • Exporter vos données (portabilité){"\n\n"}
            Pour exercer ces droits, contactez-nous à : victor-marouard@hotmail.com
          </Text>
        </View>

        <View style={styles.section}>
          <Text style={styles.sectionTitle}>7. Cookies et Traceurs</Text>
          <Text style={styles.text}>
            L'application peut utiliser des technologies de suivi pour améliorer votre expérience et analyser l'utilisation du service. Vous pouvez gérer ces paramètres dans les réglages de votre appareil.
          </Text>
        </View>

        <View style={styles.section}>
          <Text style={styles.sectionTitle}>8. Conservation des Données</Text>
          <Text style={styles.text}>
            Vos données sont conservées pendant la durée de votre utilisation du service et jusqu'à 3 ans après la suppression de votre compte pour les obligations légales.
          </Text>
        </View>

        <View style={styles.section}>
          <Text style={styles.sectionTitle}>9. Modifications</Text>
          <Text style={styles.text}>
            Nous pouvons modifier cette politique de confidentialité à tout moment. Les modifications seront notifiées dans l'application.
          </Text>
        </View>

        <View style={styles.section}>
          <Text style={styles.sectionTitle}>10. Contact</Text>
          <Text style={styles.text}>
            Pour toute question concernant cette politique de confidentialité :{"\n\n"}
            Email : contact@lapetiteannonce.fr{"\n"}
            Adresse : Petite Annonce SAS, France
          </Text>
        </View>

        <View style={styles.spacer} />
      </ScrollView>
    </SafeAreaView>
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
    padding: 20,
  },
  lastUpdate: {
    fontSize: 13,
    color: '#666',
    marginBottom: 24,
    fontStyle: 'italic',
  },
  section: {
    marginBottom: 24,
  },
  sectionTitle: {
    fontSize: 16,
    fontWeight: '700',
    color: '#2563EB',
    marginBottom: 12,
  },
  text: {
    fontSize: 14,
    color: '#444',
    lineHeight: 22,
  },
  bold: {
    fontWeight: '600',
    color: '#333',
  },
  spacer: {
    height: 40,
  },
});
