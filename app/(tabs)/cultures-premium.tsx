import ListItem from "@/components/molecules/ListItem";
import { Ionicons } from "@expo/vector-icons";
import { useRouter } from "expo-router";
import React, { useEffect, useState } from "react";
import {
  Dimensions,
  ImageBackground,
  ScrollView,
  StyleSheet,
  Text,
  TouchableOpacity,
  View,
  ActivityIndicator,
  Image,
} from "react-native";

import { supabase } from "@/lib/supabase";

const { width } = Dimensions.get("window");

// Import de l'image locale
import drapeauImage from '@/assets/images/drapeau.png';

export default function CulturesPremiumScreen() {
  const router = useRouter();

  const [villagesData, setVillagesData] = useState<any[]>([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    const fetchVillages = async () => {
      setLoading(true);

      const { data, error } = await supabase
        .from("villages")
        .select("*")
        .order("name", { ascending: true });

      if (error) {
        console.log("Erreur villages:", error);
      } else {
        setVillagesData(data);
      }

      setLoading(false);
    };

    fetchVillages();
  }, []);

  // Convertir l'image locale en URI
  const getDrapeauUri = () => {
    try {
      if (typeof drapeauImage === 'string') return drapeauImage;
      if (typeof drapeauImage === 'number') {
        return Image.resolveAssetSource(drapeauImage).uri;
      }
      return "https://upload.wikimedia.org/wikipedia/commons/4/4f/Flag_of_Cameroon.svg";
    } catch (error) {
      return "https://upload.wikimedia.org/wikipedia/commons/4/4f/Flag_of_Cameroon.svg";
    }
  };

  const drapeauUri = getDrapeauUri();

  return (
    <ImageBackground
      source={require("@/assets/images/2.jpeg")}
      style={styles.background}
      resizeMode="cover"
    >
      <ScrollView style={styles.container}>
        {/* Header */}
        <View style={styles.header}>
          <TouchableOpacity style={styles.backButton} onPress={() => router.back()}>
            <Ionicons name="arrow-back" size={24} color="#FFF" />
          </TouchableOpacity>
          <View>
            <Text style={styles.title}>Cultures Premium</Text>
            <Text style={styles.subtitle}>Accès complet débloqué</Text>
          </View>
          <View style={styles.premiumBadge}>
            <Ionicons name="diamond" size={20} color="#FFD700" />
          </View>
        </View>

        {/* Welcome Message */}
        <View style={styles.welcomeSection}>
          <Text style={styles.welcomeTitle}>Bienvenue dans l'espace Premium!</Text>
          <Text style={styles.welcomeText}>
            Vous avez maintenant accès à toutes les cultures du Cameroun avec des contenus exclusifs et détaillés.
          </Text>
        </View>

        {/* Villages List */}
        <View style={{ padding: 16 }}>
          {loading && (
            <ActivityIndicator size="large" color="#8B0000" style={{ marginTop: 30 }} />
          )}

          {!loading && villagesData.length === 0 && (
            <Text style={{ textAlign: "center", color: "#FFF", marginTop: 20 }}>
              Aucun village trouvé.
            </Text>
          )}

          {/* Affichage dynamique des villages depuis la DB */}
          {!loading &&
            villagesData.map((item) => (
              <ListItem
                key={item.id}
                title={item.name}
                subtitle={item.region}
                image={drapeauUri}
                onPress={() =>
                  router.push({
                    pathname: "/village-options",
                    params: { village: JSON.stringify(item) },
                  })
                }
              />
            ))}

          {/* --- ONGLET LIVRES (TOUJOURS À LA FIN) --- */}
          {!loading && (
            <ListItem
              key="fixed-books-tab"
              title="Bibliothèque & Livres"
              subtitle="Archives et documents PDF"
              image={require("@/assets/images/drapeau.png")}
              onPress={() => router.push("/livres-screen")} // Assure-toi que cette route existe
            />
          )}
        </View>
      </ScrollView>
    </ImageBackground>
  );
}

const styles = StyleSheet.create({
  background: { flex: 1 },
  container: { flex: 1 },
  header: {
    backgroundColor: "rgba(139, 0, 0, 0.95)",
    padding: 20,
    paddingTop: 60,
    flexDirection: "row",
    alignItems: "center",
    justifyContent: "space-between",
  },
  backButton: { padding: 5 },
  title: { fontSize: 24, fontWeight: "700", color: "#FFF", textAlign: "center" },
  subtitle: { fontSize: 14, color: "#FFD700", textAlign: "center", fontWeight: "600" },
  premiumBadge: { backgroundColor: "rgba(255, 255, 255, 0.2)", padding: 10, borderRadius: 50 },
  welcomeSection: {
    backgroundColor: "rgba(255, 255, 240, 0.95)",
    margin: 20,
    padding: 20,
    borderRadius: 15,
    elevation: 4,
  },
  welcomeTitle: { fontSize: 20, fontWeight: "700", color: "#27AE60", marginBottom: 10, textAlign: "center" },
  welcomeText: { fontSize: 16, color: "#333", textAlign: "center", lineHeight: 22 },
});
