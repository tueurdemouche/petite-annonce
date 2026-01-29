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

export default function CGUScreen() {
  const router = useRouter();

  return (
    <SafeAreaView style={styles.container}>
      <View style={styles.header}>
        <TouchableOpacity onPress={() => router.back()} style={styles.backBtn}>
          <Ionicons name="arrow-back" size={24} color="#333" />
        </TouchableOpacity>
        <Text style={styles.headerTitle}>Conditions d'Utilisation</Text>
        <View style={{ width: 40 }} />
      </View>

      <ScrollView style={styles.content} showsVerticalScrollIndicator={false}>
        <Text style={styles.lastUpdate}>Dernière mise à jour : Janvier 2025</Text>

        <View style={styles.section}>
          <Text style={styles.sectionTitle}>Article 1 - Définitions</Text>
          <Text style={styles.text}>
            <Text style={styles.bold}>"Application"</Text> : L'application mobile Petite Annonce{"\n"}
            <Text style={styles.bold}>"Utilisateur"</Text> : Toute personne utilisant l'Application{"\n"}
            <Text style={styles.bold}>"Annonce"</Text> : Publication d'un bien ou service à vendre{"\n"}
            <Text style={styles.bold}>"Éditeur"</Text> : Petite Annonce SAS
          </Text>
        </View>

        <View style={styles.section}>
          <Text style={styles.sectionTitle}>Article 2 - Objet</Text>
          <Text style={styles.text}>
            Les présentes Conditions Générales d'Utilisation (CGU) ont pour objet de définir les conditions d'accès et d'utilisation de l'application Petite Annonce, plateforme de mise en relation entre particuliers pour la vente de véhicules et biens immobiliers.
          </Text>
        </View>

        <View style={styles.section}>
          <Text style={styles.sectionTitle}>Article 3 - Acceptation</Text>
          <Text style={styles.text}>
            L'utilisation de l'Application implique l'acceptation pleine et entière des présentes CGU. Si vous n'acceptez pas ces conditions, vous ne devez pas utiliser l'Application.
          </Text>
        </View>

        <View style={styles.section}>
          <Text style={styles.sectionTitle}>Article 4 - Inscription et Compte</Text>
          <Text style={styles.text}>
            <Text style={styles.bold}>4.1 Conditions d'inscription</Text>{"\n"}
            • Être âgé de 18 ans minimum (vérification obligatoire){"\n"}
            • Fournir des informations exactes et à jour{"\n"}
            • Une seule compte par personne{"\n\n"}
            <Text style={styles.bold}>4.2 Vérification d'identité</Text>{"\n"}
            Pour publier des annonces, vous devez vérifier votre identité en fournissant :{"\n"}
            • Une photo de pièce d'identité valide{"\n"}
            • Un selfie pour confirmation{"\n\n"}
            <Text style={styles.bold}>4.3 Responsabilité du compte</Text>{"\n"}
            Vous êtes responsable de la confidentialité de vos identifiants et de toute activité sur votre compte.
          </Text>
        </View>

        <View style={styles.section}>
          <Text style={styles.sectionTitle}>Article 5 - Publication d'Annonces</Text>
          <Text style={styles.text}>
            <Text style={styles.bold}>5.1 Catégories autorisées</Text>{"\n"}
            • Véhicules : Auto, Moto, Scooter, Quad{"\n"}
            • Immobilier : Location, Colocation, Vente{"\n\n"}
            <Text style={styles.bold}>5.2 Règles de publication</Text>{"\n"}
            • Annonces exactes et non trompeuses{"\n"}
            • Photos réelles du bien proposé{"\n"}
            • Prix réel (pas de prix d'appel){"\n"}
            • Maximum 5 photos gratuites (10 avec option payante){"\n"}
            • Durée : 30 jours, renouvelable 1 fois/mois{"\n\n"}
            <Text style={styles.bold}>5.3 Validation</Text>{"\n"}
            Chaque annonce est soumise à validation par notre équipe avant publication.
          </Text>
        </View>

        <View style={styles.section}>
          <Text style={styles.sectionTitle}>Article 6 - Contenus Interdits</Text>
          <Text style={styles.text}>
            Il est strictement interdit de publier :{"\n\n"}
            • Contenus illégaux, frauduleux ou trompeurs{"\n"}
            • Contenus à caractère discriminatoire ou haineux{"\n"}
            • Contenus portant atteinte aux droits d'autrui{"\n"}
            • Contenus à caractère pornographique{"\n"}
            • Biens volés ou contrefaits{"\n"}
            • Armes, drogues ou produits illicites{"\n"}
            • Annonces sans rapport avec les catégories autorisées{"\n"}
            • Spam ou publicité déguisée
          </Text>
        </View>

        <View style={styles.section}>
          <Text style={styles.sectionTitle}>Article 7 - Transactions</Text>
          <Text style={styles.text}>
            <Text style={styles.bold}>7.1 Rôle de l'Application</Text>{"\n"}
            Petite Annonce est une plateforme de mise en relation. Nous ne sommes pas partie aux transactions entre utilisateurs.{"\n\n"}
            <Text style={styles.bold}>7.2 Responsabilité</Text>{"\n"}
            Chaque utilisateur est seul responsable de ses transactions. Nous vous conseillons :{"\n"}
            • De vérifier l'identité de l'acheteur/vendeur{"\n"}
            • De privilégier les rencontres en personne{"\n"}
            • De vous méfier des offres trop attractives{"\n"}
            • De ne jamais envoyer d'argent avant d'avoir vu le bien
          </Text>
        </View>

        <View style={styles.section}>
          <Text style={styles.sectionTitle}>Article 8 - Messagerie</Text>
          <Text style={styles.text}>
            La messagerie intégrée doit être utilisée de manière respectueuse. Tout harcèlement ou comportement inapproprié entraînera la suspension du compte.
          </Text>
        </View>

        <View style={styles.section}>
          <Text style={styles.sectionTitle}>Article 9 - Propriété Intellectuelle</Text>
          <Text style={styles.text}>
            L'Application et son contenu (hors annonces utilisateurs) sont protégés par les droits de propriété intellectuelle. Toute reproduction non autorisée est interdite.{"\n\n"}
            En publiant du contenu, vous garantissez en être le propriétaire ou avoir les droits nécessaires.
          </Text>
        </View>

        <View style={styles.section}>
          <Text style={styles.sectionTitle}>Article 10 - Signalement</Text>
          <Text style={styles.text}>
            Les utilisateurs peuvent signaler tout contenu inapproprié. Notre équipe de modération examine chaque signalement et prend les mesures appropriées.
          </Text>
        </View>

        <View style={styles.section}>
          <Text style={styles.sectionTitle}>Article 11 - Sanctions</Text>
          <Text style={styles.text}>
            En cas de non-respect des CGU, nous pouvons :{"\n"}
            • Supprimer les annonces concernées{"\n"}
            • Suspendre temporairement le compte{"\n"}
            • Supprimer définitivement le compte{"\n"}
            • Engager des poursuites judiciaires
          </Text>
        </View>

        <View style={styles.section}>
          <Text style={styles.sectionTitle}>Article 12 - Limitation de Responsabilité</Text>
          <Text style={styles.text}>
            Petite Annonce ne peut être tenu responsable :{"\n"}
            • Des contenus publiés par les utilisateurs{"\n"}
            • Des transactions entre utilisateurs{"\n"}
            • Des dommages résultant de l'utilisation de l'Application{"\n"}
            • Des interruptions de service
          </Text>
        </View>

        <View style={styles.section}>
          <Text style={styles.sectionTitle}>Article 13 - Modification des CGU</Text>
          <Text style={styles.text}>
            Nous nous réservons le droit de modifier les présentes CGU à tout moment. Les utilisateurs seront informés des modifications importantes.
          </Text>
        </View>

        <View style={styles.section}>
          <Text style={styles.sectionTitle}>Article 14 - Droit Applicable</Text>
          <Text style={styles.text}>
            Les présentes CGU sont soumises au droit français. Tout litige sera de la compétence des tribunaux français.
          </Text>
        </View>

        <View style={styles.section}>
          <Text style={styles.sectionTitle}>Article 15 - Contact</Text>
          <Text style={styles.text}>
            Pour toute question concernant les CGU :{"\n\n"}
            Email : contact@petiteannonce.fr{"\n"}
            Petite Annonce SAS{"\n"}
            France
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
