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

interface Phrase {
  id: string;
  content: string;
  translation: string | null;
  audio_url: string | null;
}

export default function PhrasesPage() {
  const { village } = useLocalSearchParams();
  const router = useRouter();

  let data: { id: any; name: any } | null = null;
  try {
    data = JSON.parse(village as string);
  } catch (e) {
    data = { id: null, name: "Village inconnu" };
  }

  const [phrases, setPhrases] = useState<Phrase[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [fontSize, setFontSize] = useState(18);
  const [currentSound, setCurrentSound] = useState<Audio.Sound | null>(null);
  const [playingId, setPlayingId] = useState<string | null>(null);

  useEffect(() => {
    // Configuration audio pour mobile (essentiel pour le son)
    const setupAudio = async () => {
      await Audio.setAudioModeAsync({
        playsInSilentModeIOS: true,
        staysActiveInBackground: false,
        shouldDuckAndroid: true,
      });
    };
    setupAudio();

    if (!data?.id) {
      setError("ID du village non fourni");
      setLoading(false);
      return;
    }

    loadPhrases();

    return () => {
      if (currentSound) currentSound.unloadAsync();
    };
  }, [data?.id]);

  const loadPhrases = async () => {
    try {
      setLoading(true);
      setError(null);
      const { data: res, error: err } = await supabase
        .from("phrases")
        .select("*")
        .eq("village_id", data?.id)
        .order("created_at", { ascending: true });

      if (err) throw err;
      setPhrases(res || []);
    } catch (err: any) {
      setError(err.message || "Erreur de chargement");
    } finally {
      setLoading(false);
    }
  };

  const playSound = async (phraseId: string, audioUrl: string | null) => {
    try {
      if (playingId === phraseId && currentSound) {
        await currentSound.stopAsync();
        await currentSound.unloadAsync();
        setCurrentSound(null);
        setPlayingId(null);
        return;
      }

      if (currentSound) await currentSound.unloadAsync();
      if (!audioUrl) return;

      setPlayingId(phraseId);
      const { sound } = await Audio.Sound.createAsync(
        { uri: audioUrl.trim() },
        { shouldPlay: true }
      );
      setCurrentSound(sound);

      sound.setOnPlaybackStatusUpdate((status) => {
        if (status.isLoaded && status.didJustFinish) {
          sound.unloadAsync();
          setCurrentSound(null);
          setPlayingId(null);
        }
      });
    } catch (err) {
      setPlayingId(null);
    }
  };

  if (loading) {
    return (
      <SafeAreaView style={styles.container}>
        <Text style={styles.title}>Phrases de {data?.name}</Text>
        <View style={styles.centerContainer}>
          <ActivityIndicator size="large" color="#0A84FF" />
          <Text style={styles.loadingText}>Chargement...</Text>
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

      <Text style={styles.title}>Phrases de {data?.name}</Text>
      <Text style={styles.subtitle}>
        {phrases.length} {phrases.length > 1 ? "phrases" : "phrase"}
      </Text>

      <View style={styles.fontControls}>
        <TouchableOpacity onPress={() => setFontSize((p) => Math.max(12, p - 2))} style={styles.fontButton}>
          <Text style={styles.fontButtonText}>A-</Text>
        </TouchableOpacity>
        <Text style={styles.fontSizeLabel}>Taille du texte</Text>
        <TouchableOpacity onPress={() => setFontSize((p) => Math.min(40, p + 2))} style={styles.fontButton}>
          <Text style={styles.fontButtonText}>A+</Text>
        </TouchableOpacity>
      </View>

      <FlatList
        data={phrases}
        keyExtractor={(item) => item.id}
        showsVerticalScrollIndicator={false}
        contentContainerStyle={{ paddingBottom: 40 }}
        renderItem={({ item }) => (
          <View style={styles.card}>
            <View style={styles.cardHeader}>
              {item.audio_url && (
                <TouchableOpacity onPress={() => playSound(item.id, item.audio_url)} style={styles.audioButton}>
                  <Ionicons 
                    name={playingId === item.id ? "pause-circle" : "play-circle"} 
                    size={32} color="#0A84FF" 
                  />
                </TouchableOpacity>
              )}
            </View>
            <Text style={[styles.proverbText, { fontSize }]}>{item.content}</Text>
            {item.translation && (
              <View style={styles.translationContainer}>
                <Ionicons name="language-outline" size={16} color="#666" />
                <Text style={styles.translationText}>{item.translation}</Text>
              </View>
            )}
          </View>
        )}
        ListEmptyComponent={
          <View style={styles.centerContainer}>
            <Ionicons name="chatbubbles-outline" size={60} color="#ccc" />
            <Text style={styles.emptyText}>Aucune phrase disponible</Text>
          </View>
        }
      />
    </SafeAreaView>
  );
}

const styles = StyleSheet.create({
  container: { flex: 1, backgroundColor: "#fff", paddingHorizontal: 16 },
  header: { marginBottom: 10 },
  backButton: { flexDirection: "row", alignItems: "center" },
  backText: { color: "#0A84FF", marginLeft: 5, fontSize: 16 },
  title: { fontSize: 24, fontWeight: "bold", color: "#1C1C1E", marginTop: 10 },
  subtitle: { fontSize: 16, color: "#8E8E93", marginBottom: 20 },
  fontControls: { flexDirection: "row", alignItems: "center", justifyContent: "center", marginBottom: 20, backgroundColor: "#F2F2F7", borderRadius: 10, padding: 10 },
  fontButton: { padding: 10 },
  fontButtonText: { fontSize: 18, fontWeight: "bold", color: "#0A84FF" },
  fontSizeLabel: { marginHorizontal: 20, color: "#3A3A3C" },
  card: { backgroundColor: "#fff", borderRadius: 12, padding: 16, marginBottom: 16, elevation: 2, shadowColor: "#000", shadowOffset: { width: 0, height: 1 }, shadowOpacity: 0.1, shadowRadius: 2, borderLeftWidth: 4, borderLeftColor: "#0A84FF" },
  cardHeader: { flexDirection: "row", justifyContent: "flex-end" },
  audioButton: { padding: 5 },
  proverbText: { color: "#1C1C1E", lineHeight: 28, fontWeight: "500" },
  translationContainer: { flexDirection: "row", alignItems: "center", marginTop: 12, paddingTop: 12, borderTopWidth: 1, borderTopColor: "#F2F2F7" },
  translationText: { color: "#666", fontSize: 16, fontStyle: "italic", marginLeft: 8 },
  centerContainer: { flex: 1, justifyContent: "center", alignItems: "center", marginTop: 50 },
  loadingText: { marginTop: 10, color: "#8E8E93" },
  emptyText: { marginTop: 10, color: "#8E8E93", fontSize: 16 }
});
