import { Ionicons } from "@expo/vector-icons";
import { Audio } from "expo-av";
import { useLocalSearchParams, useRouter } from "expo-router";
import React, { useEffect, useState } from "react";
import {
  ActivityIndicator,
  FlatList,
  StyleSheet,
  Text,
  TouchableOpacity,
  View,
} from "react-native";
import { SafeAreaView } from "react-native-safe-area-context";

import { supabase } from "@/lib/supabase";

interface Proverbe {
  id: string;
  content: string;
  translation: string | null;
  audio_url: string | null;
}

export default function ProverbesPage() {
  const { village } = useLocalSearchParams();
  let data: { id: any; name: any; } | null = null;

  try {
    data = JSON.parse(village as string);
  } catch (e) {
    console.warn("⚠️ Paramètre 'village' invalide :", village);
    data = { id: null, name: "Village inconnu" };
  }

  const router = useRouter();

  const [proverbes, setProverbes] = useState<Proverbe[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [fontSize, setFontSize] = useState(18);
  const [currentSound, setCurrentSound] = useState<Audio.Sound | null>(null);
  const [playingId, setPlayingId] = useState<string | null>(null);

  // Charger les proverbes depuis Supabase
  useEffect(() => {
    if (!data?.id) {
      setError("ID du village non fourni");
      setLoading(false);
      return;
    }

    loadProverbes();

    // Cleanup du son lors du démontage
    return () => {
      if (currentSound) {
        currentSound.unloadAsync();
      }
    };
  }, [data?.id]);

  const loadProverbes = async () => {
    try {
      setLoading(true);
      setError(null);

      const { data: proverbsData, error: proverbsError } = await supabase
        .from("proverbes")
        .select("*")
        .eq("village_id", data?.id)
        .order("created_at", { ascending: true });

      if (proverbsError) throw proverbsError;

      setProverbes(proverbsData || []);
    } catch (err: any) {
      console.error("Erreur chargement proverbes:", err);
      setError(err.message || "Erreur lors du chargement des proverbes");
    } finally {
      setLoading(false);
    }
  };

  // Lecture audio
  const playSound = async (proverbeId: string, audioUrl: string | null) => {
    try {
      // Si c'est le même proverbe, arrêter la lecture
      if (playingId === proverbeId && currentSound) {
        await currentSound.stopAsync();
        await currentSound.unloadAsync();
        setCurrentSound(null);
        setPlayingId(null);
        return;
      }

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

      setPlayingId(proverbeId);

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
          setPlayingId(null);
        }
      });
    } catch (err) {
      console.error("Erreur lecture audio:", err);
      setPlayingId(null);
    }
  };

  // Affichage du chargement
  if (loading) {
    return (
      <SafeAreaView style={styles.container}>
        <Text style={styles.title}>Proverbes de {data?.name}</Text>
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
        <Text style={styles.title}>Proverbes de {data?.name}</Text>
        <TouchableOpacity onPress={() => router.back()} style={styles.backButton}>
          <Ionicons name="arrow-back" size={24} color="#0A84FF" />
          <Text style={styles.backText}>Retour</Text>
        </TouchableOpacity>
        <View style={styles.centerContainer}>
          <Ionicons name="alert-circle-outline" size={60} color="#FF3B30" />
          <Text style={styles.errorText}>{error}</Text>
          <TouchableOpacity onPress={loadProverbes} style={styles.retryButton}>
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

      <Text style={styles.title}>Proverbes de {data?.name}</Text>
      <Text style={styles.subtitle}>
        {proverbes.length} {proverbes.length > 1 ? "proverbes" : "proverbe"}
      </Text>

      <View style={styles.fontControls}>
        <TouchableOpacity
          onPress={() => setFontSize((prev) => Math.max(12, prev - 2))}
          style={styles.fontButton}
        >
          <Text style={styles.fontButtonText}>A-</Text>
        </TouchableOpacity>

        <Text style={styles.fontSizeLabel}>Taille du texte</Text>

        <TouchableOpacity
          onPress={() => setFontSize((prev) => Math.min(40, prev + 2))}
          style={styles.fontButton}
        >
          <Text style={styles.fontButtonText}>A+</Text>
        </TouchableOpacity>
      </View>

      {proverbes.length === 0 ? (
        <View style={styles.centerContainer}>
          <Ionicons name="book-outline" size={60} color="#ccc" />
          <Text style={styles.emptyText}>Aucun proverbe disponible</Text>
        </View>
      ) : (
        <FlatList
          data={proverbes}
          keyExtractor={(item) => item.id}
          showsVerticalScrollIndicator={false}
          contentContainerStyle={{ paddingBottom: 40 }}
          renderItem={({ item }) => (
            <View style={styles.card}>
              <View style={styles.cardHeader}>
                {item.audio_url && (
                  <TouchableOpacity
                    onPress={() => playSound(item.id, item.audio_url)}
                    style={styles.audioButton}
                  >
                    <Ionicons
                      name={
                        playingId === item.id
                          ? "pause-circle"
                          : "play-circle"
                      }
                      size={32}
                      color="#0A84FF"
                    />
                  </TouchableOpacity>
                )}
              </View>

              <Text style={[styles.proverbText, { fontSize }]}>
                {item.content}
              </Text>

              {item.translation && (
                <View style={styles.translationContainer}>
                  <Ionicons name="language-outline" size={16} color="#666" />
                  <Text style={styles.translationText}>
                    {item.translation}
                  </Text>
                </View>
              )}
            </View>
          )}
        />
      )}
    </SafeAreaView>
  );
}
const styles = StyleSheet.create({
  container: {
    padding: 18,
    flex: 1,
    backgroundColor: "#f8f8f8",
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
    fontSize: 28,
    fontWeight: "700",
    marginBottom: 4,
    color: "#222",
  },
  subtitle: {
    fontSize: 14,
    color: "#666",
    marginBottom: 10,
  },

  // Contrôles taille police
  fontControls: {
    flexDirection: "row",
    gap: 12,
    marginBottom: 16,
    alignItems: "center",
  },
  fontButton: {
    backgroundColor: "#ddd",
    paddingVertical: 6,
    paddingHorizontal: 14,
    borderRadius: 6,
  },
  fontButtonText: {
    fontSize: 18,
    fontWeight: "700",
  },
  fontSizeLabel: {
    fontSize: 14,
    color: "#666",
    flex: 1,
    textAlign: "center",
  },

  // Carte proverbe
  card: {
    backgroundColor: "#fff",
    padding: 16,
    borderRadius: 12,
    marginVertical: 8,
    elevation: 2,
    shadowColor: "#000",
    shadowOpacity: 0.08,
    shadowRadius: 4,
    shadowOffset: { width: 0, height: 2 },
  },
  cardHeader: {
    flexDirection: "row",
    justifyContent: "flex-end",
    marginBottom: 8,
  },
  audioButton: {
    padding: 4,
  },
  proverbText: {
    color: "#333",
    lineHeight: 26,
  },
  translationContainer: {
    flexDirection: "row",
    alignItems: "flex-start",
    marginTop: 12,
    paddingTop: 12,
    borderTopWidth: 1,
    borderTopColor: "#eee",
    gap: 8,
  },
  translationText: {
    flex: 1,
    fontSize: 14,
    color: "#666",
    fontStyle: "italic",
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
});