import ListItem from "@/components/molecules/ListItem";
import { Ionicons } from "@expo/vector-icons";
import { useRouter } from "expo-router";
import React, { useEffect, useState, useCallback } from "react";
import {
  ImageBackground,
  StyleSheet,
  Text,
  TouchableOpacity,
  View,
  ActivityIndicator,
  Linking,
  TextInput,
  FlatList,
  ScrollView,
} from "react-native";
import { supabase } from "@/lib/supabase";

const PAGE_SIZE = 20;

export default function LivresScreen() {
  const router = useRouter();
  const [books, setBooks] = useState<any[]>([]);
  const [totalCount, setTotalCount] = useState<number>(0); // <-- État pour le nombre total
  const [categories, setCategories] = useState<string[]>(["Tous"]);
  const [loading, setLoading] = useState(false);
  const [loadingMore, setLoadingMore] = useState(false);
  const [page, setPage] = useState(0);
  const [hasMore, setHasMore] = useState(true);
  const [searchQuery, setSearchQuery] = useState("");
  const [activeCategory, setActiveCategory] = useState("Tous");

  useEffect(() => {
    const fetchCategories = async () => {
      try {
        const { data } = await supabase.from("cultures_books").select("category");
        if (data) {
          const uniqueCats = ["Tous", ...new Set(data.map((i) => i.category))];
          setCategories(uniqueCats);
        }
      } catch (err) {
        console.error("Erreur chargement catégories");
      }
    };
    fetchCategories();
  }, []);

  const fetchBooks = useCallback(async (pageIndex: number, reset: boolean = false) => {
    if (loading || (loadingMore && !reset)) return;

    reset ? setLoading(true) : setLoadingMore(true);

    try {
      let query = supabase.from("cultures_books").select("*", { count: "exact" });

      if (activeCategory !== "Tous") query = query.eq("category", activeCategory);
      if (searchQuery.trim()) query = query.ilike("title", `%${searchQuery.trim()}%`);

      query = query
        .order("title", { ascending: true })
        .range(pageIndex * PAGE_SIZE, (pageIndex + 1) * PAGE_SIZE - 1);

      const { data, count, error } = await query;
      if (error) throw error;

      if (count !== null) setTotalCount(count); // <-- Mise à jour du compteur

      const results = data || [];

      setBooks((prev) => {
        const combined = reset ? results : [...prev, ...results];
        return combined.filter((item, index, self) =>
          index === self.findIndex((t) => t.id === item.id)
        );
      });

      setPage(pageIndex);
      if (count !== null) {
        setHasMore(reset ? results.length < count : (books.length + results.length) < count);
      }
    } catch (e: any) {
      console.error("Erreur fetchBooks:", e.message);
    } finally {
      setLoading(false);
      setLoadingMore(false);
    }
  }, [searchQuery, activeCategory, books.length, loading, loadingMore]);

  useEffect(() => {
    fetchBooks(0, true);
  }, [searchQuery, activeCategory]);

  const getFileIcon = (item: any) => {
    if (item.thumbnail_url && item.thumbnail_url.startsWith('http')) return item.thumbnail_url;
    return "https://cdn-icons-png.flaticon.com";
  };

  return (
    <ImageBackground source={require("@/assets/images/bibio.png")} style={s.bg}>
      <View style={s.header}>
        <View style={s.row}>
          <TouchableOpacity onPress={() => router.back()}><Ionicons name="arrow-back" size={24} color="#FFF" /></TouchableOpacity>
          <Text style={s.title}>Ma Bibliothèque</Text>
          <View style={{width: 24}}/>
        </View>
        <View style={s.searchBox}>
          <Ionicons name="search" size={18} color="#666" />
          <TextInput 
            placeholder="Rechercher un titre..." 
            placeholderTextColor="#999"
            style={s.input} 
            onChangeText={(t) => { setSearchQuery(t); setPage(0); }}
          />
        </View>
        {/* AFFICHAGE DU COMPTEUR */}
        <View style={s.statsBar}>
          <Text style={s.statsText}>
            {loading ? "Calcul..." : `${totalCount} livre(s) trouvé(s)`}
          </Text>
        </View>
      </View>

      <View style={s.catBar}>
        <ScrollView horizontal showsHorizontalScrollIndicator={false}>
          {categories.map(c => (
            <TouchableOpacity 
              key={`cat-${c}`} 
              onPress={() => { setActiveCategory(c); setPage(0); }}
              style={[s.badge, activeCategory === c && s.badgeActive]}
            >
              <Text style={[s.btText, activeCategory === c && s.btTextActive]}>{c}</Text>
            </TouchableOpacity>
          ))}
        </ScrollView>
      </View>

      <FlatList
        data={books}
        keyExtractor={(item, index) => `${item.id}-${index}`}
        renderItem={({ item }) => (
          <View style={{ paddingHorizontal: 16 }}>
            <ListItem
              title={item.title}
              subtitle={`${item.category} • ${item.file_type || 'Archive'}`}
              image={getFileIcon(item)}
              onPress={() => Linking.openURL(item.pdf_url)}
            />
          </View>
        )}
        onEndReached={() => hasMore && fetchBooks(page + 1)}
        onEndReachedThreshold={0.5}
        ListFooterComponent={() => loadingMore ? <ActivityIndicator color="#FFD700" style={{margin: 20}} /> : null}
        ListEmptyComponent={!loading ? <Text style={s.empty}>Aucun livre trouvé.</Text> : null}
      />
    </ImageBackground>
  );
}

const s = StyleSheet.create({
  bg: { flex: 1 },
  header: { backgroundColor: "rgba(139, 0, 0, 0.95)", padding: 20, paddingTop: 50 },
  row: { flexDirection: 'row', justifyContent: 'space-between', alignItems: 'center', marginBottom: 15 },
  title: { fontSize: 20, fontWeight: "bold", color: "#FFF" },
  searchBox: { backgroundColor: "#FFF", flexDirection: "row", alignItems: "center", paddingHorizontal: 10, borderRadius: 8, height: 40 },
  input: { flex: 1, marginLeft: 8, color: '#000' },
  statsBar: { marginTop: 10, alignItems: 'flex-end' },
  statsText: { color: '#FFD700', fontSize: 12, fontWeight: '600', fontStyle: 'italic' },
  catBar: { backgroundColor: 'rgba(0,0,0,0.3)', paddingVertical: 10 },
  badge: { paddingHorizontal: 15, paddingVertical: 6, borderRadius: 15, backgroundColor: 'rgba(255,255,255,0.1)', marginLeft: 10, borderWidth: 1, borderColor: '#FFD700' },
  badgeActive: { backgroundColor: '#FFD700' },
  btText: { color: '#FFD700', fontSize: 13 },
  btTextActive: { color: '#8B0000', fontWeight: 'bold' },
  empty: { color: '#FFF', textAlign: 'center', marginTop: 50, opacity: 0.7 }
});
