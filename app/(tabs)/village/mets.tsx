import { Ionicons } from "@expo/vector-icons";
import { useLocalSearchParams, useRouter } from "expo-router";
import { useEffect, useState } from "react";
import {
  ActivityIndicator,
  FlatList,
  Image,
  Modal,
  ScrollView,
  StyleSheet,
  Text,
  TextInput,
  TouchableOpacity,
  View,
} from "react-native";
import { SafeAreaView } from "react-native-safe-area-context";

import { supabase } from "@/lib/supabase";

interface Met {
  id: string;
  name: string;
  description: string | null;
  image_url: string | null;
}

export default function MetsPage() {
  const { village } = useLocalSearchParams();

  let data: { id: any; name: any; };
  try {
    data = JSON.parse(village as string);
  } catch (e) {
    console.warn("Village invalide :", village);
    data = { id: null, name: "Village inconnu" };
  }

  const router = useRouter();

  const [mets, setMets] = useState<Met[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [search, setSearch] = useState("");
  
  // État pour la modale
  const [selectedMet, setSelectedMet] = useState<Met | null>(null);
  const [modalVisible, setModalVisible] = useState(false);

  // Charger les mets depuis Supabase
  useEffect(() => {
    if (!data?.id) {
      setError("ID du village non fourni");
      setLoading(false);
      return;
    }

    loadMets();
  }, [data?.id]);

  const loadMets = async () => {
    try {
      setLoading(true);
      setError(null);

      const { data: metsData, error: metsError } = await supabase
        .from("mets")
        .select("*")
        .eq("village_id", data.id)
        .order("name", { ascending: true });

      if (metsError) throw metsError;

      setMets(metsData || []);
    } catch (err: any) {
      console.error("Erreur chargement mets:", err);
      setError(err.message || "Erreur lors du chargement des mets");
    } finally {
      setLoading(false);
    }
  };

  // Ouvrir la modale avec un met
  const openMetDetails = (met: Met) => {
    setSelectedMet(met);
    setModalVisible(true);
  };

  // Fermer la modale
  const closeModal = () => {
    setModalVisible(false);
    setTimeout(() => setSelectedMet(null), 300); // Délai pour l'animation
  };

  // Filtrer les résultats
  const filtered = mets.filter((m) =>
    m.name.toLowerCase().includes((search || "").toLowerCase())
  );

  // Affichage du chargement
  if (loading) {
    return (
      <SafeAreaView style={styles.container}>
        <Text style={styles.title}>Mets de {data.name}</Text>
        <View style={styles.centerContainer}>
          <ActivityIndicator size="large" color="#0A84FF" />
          <Text style={styles.loadingText}>Chargement...</Text>
        </View>
      </SafeAreaView>
    );
  }

  // Affichage des erreurs
  if (error) {
    return (
      <SafeAreaView style={styles.container}>
        <Text style={styles.title}>Mets de {data.name}</Text>
        <TouchableOpacity onPress={() => router.back()} style={styles.backButton}>
          <Ionicons name="arrow-back" size={24} color="#0A84FF" />
          <Text style={styles.backText}>Retour</Text>
        </TouchableOpacity>
        <View style={styles.centerContainer}>
          <Ionicons name="alert-circle-outline" size={60} color="#FF3B30" />
          <Text style={styles.errorText}>{error}</Text>
          <TouchableOpacity onPress={loadMets} style={styles.retryButton}>
            <Text style={styles.retryText}>Réessayer</Text>
          </TouchableOpacity>
        </View>
      </SafeAreaView>
    );
  }

  return (
    <SafeAreaView style={styles.container}>
      <View style={styles.header}>
        <TouchableOpacity onPress={() => router.back()} style={styles.backButton}>
          <Ionicons name="arrow-back" size={24} color="#0A84FF" />
          <Text style={styles.backText}>Retour</Text>
        </TouchableOpacity>
      </View>

      <Text style={styles.title}>Mets de {data.name}</Text>
      <Text style={styles.subtitle}>
        Découvrez les plats traditionnels du village
      </Text>

      {/* Barre de recherche */}
      <View style={styles.searchBox}>
        <Ionicons name="search" size={20} color="#666" />
        <TextInput
          placeholder="Rechercher un plat..."
          style={styles.searchInput}
          value={search}
          onChangeText={setSearch}
          placeholderTextColor="#999"
        />
        {search.length > 0 && (
          <TouchableOpacity onPress={() => setSearch("")}>
            <Ionicons name="close-circle" size={20} color="#999" />
          </TouchableOpacity>
        )}
      </View>

      {filtered.length === 0 ? (
        <View style={styles.centerContainer}>
          <Ionicons name="restaurant-outline" size={60} color="#ccc" />
          <Text style={styles.emptyText}>
            {search ? "Aucun résultat trouvé" : "Aucun plat disponible"}
          </Text>
        </View>
      ) : (
        <FlatList
          data={filtered}
          keyExtractor={(item) => item.id}
          showsVerticalScrollIndicator={false}
          style={{ marginTop: 10 }}
          contentContainerStyle={{ paddingBottom: 50 }}
          renderItem={({ item }) => (
            <TouchableOpacity 
              style={styles.card}
              onPress={() => openMetDetails(item)}
              activeOpacity={0.7}
            >
              {item.image_url ? (
                <Image
                  source={{ uri: item.image_url }}
                  style={styles.image}
                  resizeMode="cover"
                />
              ) : (
                <View style={[styles.image, styles.imagePlaceholder]}>
                  <Ionicons name="restaurant" size={32} color="#ccc" />
                </View>
              )}

              <View style={{ flex: 1 }}>
                <Text style={styles.cardTitle}>{item.name}</Text>
                {item.description && (
                  <Text style={styles.cardDesc} numberOfLines={2}>
                    {item.description}
                  </Text>
                )}
              </View>

              <Ionicons name="chevron-forward" size={24} color="#999" />
            </TouchableOpacity>
          )}
        />
      )}

      {/* Modale de détails */}
      <Modal
        animationType="slide"
        transparent={true}
        visible={modalVisible}
        onRequestClose={closeModal}
      >
        <View style={styles.modalOverlay}>
          <View style={styles.modalContent}>
            {/* Header de la modale */}
            <View style={styles.modalHeader}>
              <Text style={styles.modalTitle}>Détails du plat</Text>
              <TouchableOpacity onPress={closeModal} style={styles.closeButton}>
                <Ionicons name="close" size={28} color="#333" />
              </TouchableOpacity>
            </View>

            {/* Contenu scrollable */}
            <ScrollView 
              style={styles.modalBody}
              showsVerticalScrollIndicator={false}
            >
              {selectedMet && (
                <>
                  {/* Image principale */}
                  {selectedMet.image_url ? (
                    <Image
                      source={{ uri: selectedMet.image_url }}
                      style={styles.modalImage}
                      resizeMode="cover"
                    />
                  ) : (
                    <View style={[styles.modalImage, styles.modalImagePlaceholder]}>
                      <Ionicons name="restaurant" size={80} color="#ccc" />
                      <Text style={styles.noImageText}>Aucune image disponible</Text>
                    </View>
                  )}

                  {/* Nom du plat */}
                  <View style={styles.modalSection}>
                    <View style={styles.sectionHeader}>
                      <Ionicons name="restaurant-outline" size={24} color="#0A84FF" />
                      <Text style={styles.sectionTitle}>Nom du plat</Text>
                    </View>
                    <Text style={styles.metName}>{selectedMet.name}</Text>
                  </View>

                  {/* Description */}
                  <View style={styles.modalSection}>
                    <View style={styles.sectionHeader}>
                      <Ionicons name="document-text-outline" size={24} color="#0A84FF" />
                      <Text style={styles.sectionTitle}>Description</Text>
                    </View>
                    {selectedMet.description ? (
                      <Text style={styles.description}>{selectedMet.description}</Text>
                    ) : (
                      <Text style={styles.noDescription}>
                        Aucune description disponible pour ce plat.
                      </Text>
                    )}
                  </View>

                  {/* Informations supplémentaires */}
                  <View style={styles.modalSection}>
                    <View style={styles.sectionHeader}>
                      <Ionicons name="information-circle-outline" size={24} color="#0A84FF" />
                      <Text style={styles.sectionTitle}>Informations</Text>
                    </View>
                    <View style={styles.infoRow}>
                      <Text style={styles.infoLabel}>Village :</Text>
                      <Text style={styles.infoValue}>{data.name}</Text>
                    </View>
                    <View style={styles.infoRow}>
                      <Text style={styles.infoLabel}>ID :</Text>
                      <Text style={styles.infoValue}>{selectedMet.id}</Text>
                    </View>
                  </View>
                </>
              )}
            </ScrollView>

            {/* Bouton de fermeture en bas */}
            <TouchableOpacity 
              style={styles.closeButtonBottom}
              onPress={closeModal}
            >
              <Text style={styles.closeButtonText}>Fermer</Text>
            </TouchableOpacity>
          </View>
        </View>
      </Modal>
    </SafeAreaView>
  );
}

const styles = StyleSheet.create({
  container: {
    padding: 20,
    flex: 1,
    backgroundColor: "#fafafa",
  },
  header: {
    marginBottom: 10,
  },
  backButton: {
    flexDirection: "row",
    alignItems: "center",
    gap: 6,
  },
  backText: {
    fontSize: 16,
    color: "#0A84FF",
    fontWeight: "600",
  },
  title: {
    fontSize: 26,
    fontWeight: "700",
    marginBottom: 4,
  },
  subtitle: {
    fontSize: 16,
    color: "#666",
    marginBottom: 12,
  },

  searchBox: {
    flexDirection: "row",
    backgroundColor: "#eee",
    padding: 10,
    borderRadius: 12,
    alignItems: "center",
    gap: 10,
  },
  searchInput: {
    flex: 1,
    fontSize: 16,
  },

  card: {
    flexDirection: "row",
    backgroundColor: "#fff",
    padding: 12,
    borderRadius: 12,
    marginBottom: 12,
    alignItems: "center",
    elevation: 2,
    shadowColor: "#000",
    shadowOpacity: 0.08,
    shadowRadius: 4,
    shadowOffset: { width: 0, height: 2 },
  },
  image: {
    width: 70,
    height: 70,
    borderRadius: 10,
    marginRight: 12,
  },
  imagePlaceholder: {
    backgroundColor: "#f0f0f0",
    justifyContent: "center",
    alignItems: "center",
  },
  cardTitle: {
    fontSize: 18,
    fontWeight: "600",
  },
  cardDesc: {
    fontSize: 14,
    color: "#666",
    marginTop: 4,
  },

  // États
  centerContainer: {
    flex: 1,
    justifyContent: "center",
    alignItems: "center",
    gap: 12,
  },
  loadingText: {
    fontSize: 16,
    color: "#666",
  },
  errorText: {
    fontSize: 16,
    color: "#FF3B30",
    textAlign: "center",
    marginTop: 10,
  },
  emptyText: {
    fontSize: 16,
    color: "#999",
    textAlign: "center",
    marginTop: 10,
  },
  retryButton: {
    marginTop: 20,
    paddingVertical: 10,
    paddingHorizontal: 20,
    backgroundColor: "#0A84FF",
    borderRadius: 8,
  },
  retryText: {
    color: "#fff",
    fontSize: 16,
    fontWeight: "600",
  },

  // Styles de la modale
  modalOverlay: {
    flex: 1,
    backgroundColor: "rgba(0, 0, 0, 0.5)",
    justifyContent: "flex-end",
  },
  modalContent: {
    backgroundColor: "#fff",
    borderTopLeftRadius: 20,
    borderTopRightRadius: 20,
    maxHeight: "90%",
    paddingTop: 20,
  },
  modalHeader: {
    flexDirection: "row",
    justifyContent: "space-between",
    alignItems: "center",
    paddingHorizontal: 20,
    paddingBottom: 15,
    borderBottomWidth: 1,
    borderBottomColor: "#eee",
  },
  modalTitle: {
    fontSize: 20,
    fontWeight: "700",
    color: "#333",
  },
  closeButton: {
    padding: 4,
  },
  modalBody: {
    paddingHorizontal: 20,
    paddingTop: 20,
  },
  modalImage: {
    width: "100%",
    height: 250,
    borderRadius: 16,
    marginBottom: 20,
  },
  modalImagePlaceholder: {
    backgroundColor: "#f0f0f0",
    justifyContent: "center",
    alignItems: "center",
  },
  noImageText: {
    marginTop: 10,
    fontSize: 14,
    color: "#999",
  },
  modalSection: {
    marginBottom: 24,
  },
  sectionHeader: {
    flexDirection: "row",
    alignItems: "center",
    gap: 8,
    marginBottom: 12,
  },
  sectionTitle: {
    fontSize: 18,
    fontWeight: "600",
    color: "#333",
  },
  metName: {
    fontSize: 24,
    fontWeight: "700",
    color: "#000",
  },
  description: {
    fontSize: 16,
    lineHeight: 24,
    color: "#444",
  },
  noDescription: {
    fontSize: 16,
    color: "#999",
    fontStyle: "italic",
  },
  infoRow: {
    flexDirection: "row",
    paddingVertical: 8,
    borderBottomWidth: 1,
    borderBottomColor: "#f0f0f0",
  },
  infoLabel: {
    fontSize: 16,
    fontWeight: "600",
    color: "#666",
    width: 100,
  },
  infoValue: {
    fontSize: 16,
    color: "#333",
    flex: 1,
  },
  closeButtonBottom: {
    backgroundColor: "#0A84FF",
    marginHorizontal: 20,
    marginVertical: 20,
    paddingVertical: 14,
    borderRadius: 12,
    alignItems: "center",
  },
  closeButtonText: {
    color: "#fff",
    fontSize: 16,
    fontWeight: "600",
  },
});