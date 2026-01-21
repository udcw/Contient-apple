import { Ionicons } from "@expo/vector-icons";
import { Audio } from "expo-av";
import { useLocalSearchParams, useRouter } from "expo-router";
import { useEffect, useState } from "react";
import {
  ActivityIndicator,
  FlatList,
  StyleSheet,
  Text,
  TextInput,
  TouchableOpacity,
  View,
} from "react-native";
import { SafeAreaView } from "react-native-safe-area-context";

import { supabase } from "@/lib/supabase";

interface LexiqueEntry {
  id: string;
  french: string;
  local: string;
  audio_url: string | null;
}

export default function LexiquePage() {
  const { village } = useLocalSearchParams();
  let data: { id: any; name: any; } | null = null;

  try {
    data = JSON.parse(village as string);
  } catch (e) {
    console.warn("⚠️ Paramètre 'village' invalide :", village);
    data = { id: null, name: "Village inconnu" };
  }

  const router = useRouter();

  const [lexique, setLexique] = useState<LexiqueEntry[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [search, setSearch] = useState("");
  const [currentSound, setCurrentSound] = useState<Audio.Sound | null>(null);

  // Charger les données depuis Supabase
  useEffect(() => {
    if (!data?.id) {
      setError("ID du village non fourni");
      setLoading(false);
      return;
    }

    loadLexique();

    // Cleanup du son lors du démontage
    return () => {
      if (currentSound) {
        currentSound.unloadAsync();
      }
    };
  }, [data?.id]);

  const loadLexique = async () => {
    try {
      setLoading(true);
      setError(null);

      const { data: lexiqueData, error: lexiqueError } = await supabase
        .from("lexique")
        .select("*")
        .eq("village_id", data?.id)
        .order("french", { ascending: true });

      if (lexiqueError) throw lexiqueError;

      setLexique(lexiqueData || []);
    } catch (err: any) {
      console.error("Erreur chargement lexique:", err);
      setError(err.message || "Erreur lors du chargement du lexique");
    } finally {
      setLoading(false);
    }
  };

  // Filtrer les résultats
  const filtered = lexique.filter(
    (item) =>
      item.french.toLowerCase().includes(search.toLowerCase()) ||
      item.local.toLowerCase().includes(search.toLowerCase())
  );

  // Lecture audio
  const playSound = async (audioUrl: string | null) => {
    try {
      // Arrêter le son précédent s'il existe
      if (currentSound) {
        await currentSound.stopAsync();
        await currentSound.unloadAsync();
        setCurrentSound(null);
      }

      if (!audioUrl) {
        console.warn("Pas d'URL audio disponible");
        return;
      }

      // Créer et jouer le nouveau son
      const { sound } = await Audio.Sound.createAsync(
        { uri: audioUrl },
        { shouldPlay: true }
      );
      
      setCurrentSound(sound);

      // Libérer la ressource après lecture
      sound.setOnPlaybackStatusUpdate((status) => {
        if (status.isLoaded && status.didJustFinish) {
          sound.unloadAsync();
          setCurrentSound(null);
        }
      });
    } catch (err) {
      console.error("Erreur lecture audio:", err);
    }
  };

  // Affichage du chargement
  if (loading) {
    return (
      <SafeAreaView style={styles.container}>
        <Text style={styles.title}>Lexique de {data?.name}</Text>
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
        <Text style={styles.title}>Lexique de {data?.name}</Text>
        <TouchableOpacity onPress={() => router.back()} style={styles.backButton}>
          <Ionicons name="arrow-back" size={24} color="#0A84FF" />
          <Text style={styles.backText}>Retour</Text>
        </TouchableOpacity>
        <View style={styles.centerContainer}>
          <Ionicons name="alert-circle-outline" size={60} color="#FF3B30" />
          <Text style={styles.errorText}>{error}</Text>
          <TouchableOpacity onPress={loadLexique} style={styles.retryButton}>
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

      <Text style={styles.title}>Lexique de {data?.name}</Text>
      <Text style={styles.subtitle}>
        {filtered.length} {filtered.length > 1 ? "mots" : "mot"}
      </Text>

      {/* Barre de recherche */}
      <View style={styles.searchContainer}>
        <Ionicons name="search" size={20} color="#999" style={styles.searchIcon} />
        <TextInput
          value={search}
          onChangeText={setSearch}
          placeholder="Rechercher un mot..."
          placeholderTextColor="#aaa"
          style={styles.search}
        />
        {search.length > 0 && (
          <TouchableOpacity onPress={() => setSearch("")}>
            <Ionicons name="close-circle" size={20} color="#999" />
          </TouchableOpacity>
        )}
      </View>

      {/* Liste filtrée */}
      {filtered.length === 0 ? (
        <View style={styles.centerContainer}>
          <Ionicons name="search-outline" size={60} color="#ccc" />
          <Text style={styles.emptyText}>
            {search ? "Aucun résultat trouvé" : "Aucun mot disponible"}
          </Text>
        </View>
      ) : (
        <FlatList
          data={filtered}
          keyExtractor={(item) => item.id}
          contentContainerStyle={{ paddingBottom: 50 }}
          renderItem={({ item }) => (
            <View style={styles.row}>
              <View style={styles.textContainer}>
                <Text style={styles.word}>{item.french}</Text>
                <Text style={styles.trans}>{item.local}</Text>
              </View>

              <TouchableOpacity
                onPress={() => playSound(item.audio_url)}
                disabled={!item.audio_url}
                style={[
                  styles.audioButton,
                  !item.audio_url && styles.audioButtonDisabled,
                ]}
              >
                <Ionicons
                  name={item.audio_url ? "volume-high-outline" : "volume-mute-outline"}
                  size={26}
                  color={item.audio_url ? "#0A84FF" : "#ccc"}
                />
              </TouchableOpacity>
            </View>
          )}
        />
      )}
    </SafeAreaView>
  );
}

const styles = StyleSheet.create({
  modeIndicator: {
    fontSize: 12,
    color: "#666",
    marginBottom: 8,
    fontStyle: "italic",
  },
  container: {
    padding: 18,
    flex: 1,
    backgroundColor: "#fff",
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
    color: "#222",
  },
  subtitle: {
    fontSize: 14,
    color: "#666",
    marginBottom: 14,
  },
  searchContainer: {
    flexDirection: "row",
    alignItems: "center",
    backgroundColor: "#f2f2f2",
    paddingVertical: 10,
    paddingHorizontal: 14,
    borderRadius: 10,
    marginBottom: 16,
  },
  searchIcon: {
    marginRight: 8,
  },
  search: {
    flex: 1,
    fontSize: 16,
    color: "#333",
  },
  row: {
    flexDirection: "row",
    paddingVertical: 14,
    alignItems: "center",
    borderBottomWidth: 1,
    borderColor: "#eee",
  },
  textContainer: {
    flex: 1,
  },
  word: {
    fontSize: 16,
    fontWeight: "600",
    color: "#222",
    marginBottom: 4,
  },
  trans: {
    fontSize: 15,
    color: "#666",
  },
  audioButton: {
    padding: 8,
  },
  audioButtonDisabled: {
    opacity: 0.4,
  },
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
});