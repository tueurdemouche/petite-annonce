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

export default function TermsOfSaleScreen() {
  const router = useRouter();

  return (
    <SafeAreaView style={styles.container}>
      <View style={styles.header}>
        <TouchableOpacity onPress={() => router.back()} style={styles.backBtn}>
          <Ionicons name="arrow-back" size={24} color="#333" />
        </TouchableOpacity>
        <Text style={styles.headerTitle}>Conditions Générales de Vente</Text>
        <View style={{ width: 40 }} />
      </View>

      <ScrollView style={styles.content} showsVerticalScrollIndicator={false}>
        <Text style={styles.lastUpdate}>Dernière mise à jour : Janvier 2025</Text>

        <View style={styles.section}>
          <Text style={styles.sectionTitle}>Article 1 - Objet</Text>
          <Text style={styles.text}>
            Les présentes Conditions Générales de Vente (CGV) régissent les relations contractuelles entre Petite Annonce SAS ("le Vendeur") et tout utilisateur ("le Client") souhaitant acheter des services payants via l'application Petite Annonce.
          </Text>
        </View>

        <View style={styles.section}>
          <Text style={styles.sectionTitle}>Article 2 - Services Proposés</Text>
          <Text style={styles.text}>
            Petite Annonce propose les services payants suivants :{"\n\n"}
            <Text style={styles.bold}>2.1 Boost d'annonce</Text>{"\n"}
            • Boost 7 jours : 29,99 €{"\n"}
            • Boost 14 jours : 49,99 €{"\n"}
            Le boost permet à votre annonce d'apparaître en tête des résultats de recherche avec un badge "Sponsorisé".{"\n\n"}
            <Text style={styles.bold}>2.2 Photos supplémentaires</Text>{"\n"}
            • Option 5 photos supplémentaires : 9,99 €{"\n"}
            Cette option permet d'ajouter jusqu'à 10 photos au lieu de 5 gratuites par annonce.
          </Text>
        </View>

        <View style={styles.section}>
          <Text style={styles.sectionTitle}>Article 3 - Prix</Text>
          <Text style={styles.text}>
            Les prix sont indiqués en euros (€) TTC. Petite Annonce se réserve le droit de modifier ses prix à tout moment. Les services seront facturés au prix en vigueur au moment de la commande.
          </Text>
        </View>

        <View style={styles.section}>
          <Text style={styles.sectionTitle}>Article 4 - Commande et Paiement</Text>
          <Text style={styles.text}>
            <Text style={styles.bold}>4.1 Processus de commande</Text>{"\n"}
            L'achat d'un service payant constitue une commande ferme après validation du paiement.{"\n\n"}
            <Text style={styles.bold}>4.2 Moyens de paiement</Text>{"\n"}
            Les paiements peuvent être effectués par :{"\n"}
            • Carte bancaire (via Stripe){"\n"}
            • PayPal{"\n"}
            • Cryptomonnaie{"\n\n"}
            <Text style={styles.bold}>4.3 Sécurité des paiements</Text>{"\n"}
            Les transactions sont sécurisées par nos partenaires de paiement certifiés.
          </Text>
        </View>

        <View style={styles.section}>
          <Text style={styles.sectionTitle}>Article 5 - Exécution du Service</Text>
          <Text style={styles.text}>
            Les services payants sont activés immédiatement après confirmation du paiement. Le boost prend effet dans les minutes suivant l'achat.
          </Text>
        </View>

        <View style={styles.section}>
          <Text style={styles.sectionTitle}>Article 6 - Droit de Rétractation</Text>
          <Text style={styles.text}>
            Conformément à l'article L221-28 du Code de la consommation, le Client renonce expressément à son droit de rétractation pour les services numériques pleinement exécutés avant la fin du délai de rétractation.{"\n\n"}
            En achetant un boost ou des photos supplémentaires, vous acceptez que le service soit exécuté immédiatement et renoncez à votre droit de rétractation.
          </Text>
        </View>

        <View style={styles.section}>
          <Text style={styles.sectionTitle}>Article 7 - Remboursement</Text>
          <Text style={styles.text}>
            Aucun remboursement ne sera effectué pour :{"\n"}
            • Un boost dont la durée a commencé{"\n"}
            • L'option photos supplémentaires une fois activée{"\n\n"}
            Un remboursement peut être accordé en cas de problème technique avéré empêchant l'utilisation du service.
          </Text>
        </View>

        <View style={styles.section}>
          <Text style={styles.sectionTitle}>Article 8 - Responsabilité</Text>
          <Text style={styles.text}>
            Petite Annonce ne garantit pas un nombre de vues ou de contacts suite à l'achat d'un boost. Le service consiste uniquement en une meilleure visibilité de l'annonce.
          </Text>
        </View>

        <View style={styles.section}>
          <Text style={styles.sectionTitle}>Article 9 - Données Personnelles</Text>
          <Text style={styles.text}>
            Les données collectées lors du paiement sont traitées conformément à notre Politique de Confidentialité et au RGPD.
          </Text>
        </View>

        <View style={styles.section}>
          <Text style={styles.sectionTitle}>Article 10 - Litiges</Text>
          <Text style={styles.text}>
            En cas de litige, une solution amiable sera recherchée. À défaut, les tribunaux français seront compétents.{"\n\n"}
            Médiation : Conformément à l'article L612-1 du Code de la consommation, vous pouvez recourir gratuitement à un médiateur de la consommation.
          </Text>
        </View>

        <View style={styles.section}>
          <Text style={styles.sectionTitle}>Article 11 - Contact</Text>
          <Text style={styles.text}>
            Pour toute question relative aux CGV :{"\n\n"}
            Email : victor-marouard@hotmail.com{"\n"}
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
    fontSize: 16,
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
