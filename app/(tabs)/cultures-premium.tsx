import ListItem from '@/components/molecules/ListItem';
import { Ionicons } from '@expo/vector-icons';
import { useRouter } from 'expo-router';
import React from 'react';
import { Dimensions, ImageBackground, ScrollView, StyleSheet, Text, TouchableOpacity, View } from 'react-native';

import { supabase } from "@/lib/supabase";
import { useEffect, useState } from "react";
import { ActivityIndicator } from "react-native";

const { width } = Dimensions.get('window');

const culturesData = [
  {
    id: '1',
    name: 'Grand Nord',
    description: 'Culture et traditions des peuples du Nord',
    color: '#D35400',
    route: '/grand-nord',
    icon: 'sunny',
  },
  {
    id: '2',
    name: 'Grand Sud',
    description: 'Héritage culturel des régions du Sud',
    color: '#27AE60',
    route: '/grand-sud',
    icon: 'leaf',
  },
  {
    id: '3',
    name: 'Grass Field',
    description: 'Royaumes et chefferies de l\'Ouest',
    color: '#2980B9',
    route: '/grass-field',
    icon: 'business',
  },
  {
    id: '4',
    name: 'Sawa',
    description: 'Culture côtière et traditions maritimes',
    color: '#8E44AD',
    route: '/sawa',
    icon: 'water',
  },
];

const villages = [
  {
    id: "1",
    name: "Bafoussam",
    desc: "Capitale de la région de l’Ouest.",
    image: "https://picsum.photos/200",
  },
  {
    id: "c59fb0a9-098c-419e-bd04-780babe2bd7a",
    name: "Bangangte",
    desc: "Village traditionnel du peuple Bamiléké.",
    image: "https://picsum.photos/201",
  },
  {
    id: "10",
    name: "Fufulde",
    desc: "Capitale de la région de l’Ouest.",
    image: "https://picsum.photos/200",
  },
  {
    id: "3",
    name: "Bafia",
    desc: "Village traditionnel du peuple Bamiléké.",
    image: "https://picsum.photos/201",
  },
  {
    id: "4",
    name: "Ewondo",
    desc: "Capitale de la région de l’Ouest.",
    image: "https://picsum.photos/200",
  },
  {
    id: "5",
    name: "Bassa",
    desc: "Village traditionnel du peuple Bamiléké.",
    image: "https://picsum.photos/201",
  },
  {
    id: "6",
    name: "Douala",
    desc: "Capitale de la région de l’Ouest.",
    image: "https://picsum.photos/200",
  },
  {
    id: "c59fb0a9-098c-419e-bd04-780babe2bd7a",
    name: "Eton",
    desc: "Village traditionnel du peuple Bamiléké.",
    image: "https://picsum.photos/201",
  },
  {
    id: "db8b0445-98c6-4a8c-a0f0-d939b761b5a7",
    name: "Bandjoun",
    desc: "Capitale de la région de l’Ouest.",
    image: "https://picsum.photos/200",
  },
  {
    id: "e074e125-cae8-44d0-9f66-cf7ee8b22380",
    name: "Bulu",
    desc: "Village traditionnel du peuple Bamiléké.",
    image: "https://picsum.photos/201",
  },
  {
    id: "9f9e8eb37-6f6b-4a59-8c66-84747338420a",
    name: "Bafang",
    desc: "Village traditionnel du peuple Bamiléké.",
    image: "https://picsum.photos/201",
  },
];

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
        console.log("❌ Erreur villages:", error);
      } else {
        setVillagesData(data);
      }

      setLoading(false);
    };

    fetchVillages();
  }, []);

  return (
    <ImageBackground
      source={require('@/assets/images/a.jpg')}
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

        {/* Cultures Grid */}
        {/* 
          <View style={styles.culturesSection}>
            <Text style={styles.sectionTitle}>Grandes Cultures du Cameroun</Text>
            <View style={styles.culturesGrid}>
              {culturesData.map((culture) => (
                <TouchableOpacity
                  key={culture.id}
                  style={[styles.cultureCard, { backgroundColor: culture.color }]}
                  onPress={() => router.push(culture.route as any)}
                >
                  <View style={styles.cultureIcon}>
                    <Ionicons name={culture.icon as any} size={32} color="#FFF" />
                  </View>
                  <Text style={styles.cultureName}>{culture.name}</Text>
                  <Text style={styles.cultureDescription}>{culture.description}</Text>
                  <View style={styles.cultureArrow}>
                    <Ionicons name="arrow-forward" size={20} color="#FFF" />
                  </View>
                </TouchableOpacity>
              ))}
            </View>
          </View>
         */}

         {/* Test des listes des tribues */}
         <View style={{ padding: 16 }}>
  {loading && (
    <ActivityIndicator size="large" color="#8B0000" style={{ marginTop: 30 }} />
  )}

  {!loading && villagesData.length === 0 && (
    <Text style={{ textAlign: "center", color: "#FFF", marginTop: 20 }}>
      Aucun village trouvé.
    </Text>
  )}

  {!loading &&
    villagesData.map((item) => (
      <ListItem
        key={item.id}
        title={item.name}
        subtitle={item.region}
        image={item.image_url || "https://picsum.photos/200"}
        onPress={() =>
          router.push({
            pathname: "/village-options",
            params: { village: JSON.stringify(item) }
          })
        }
      />
    ))}
</View>

        
        <View style={styles.culturesSection}>
          <Text style={styles.sectionTitle}>Grandes Cultures du Cameroun</Text>
          <View style={styles.culturesGrid}>
            {culturesData.map((culture) => (
              <TouchableOpacity
                key={culture.id}
                style={[styles.cultureCard, { backgroundColor: culture.color }]}
                onPress={() => router.push(culture.route as any)}
              >
                <View style={styles.cultureIcon}>
                  <Ionicons name={culture.icon as any} size={32} color="#FFF" />
                </View>
                <Text style={styles.cultureName}>{culture.name}</Text>
                <Text style={styles.cultureDescription}>{culture.description}</Text>
                <View style={styles.cultureArrow}>
                  <Ionicons name="arrow-forward" size={20} color="#FFF" />
                </View>
              </TouchableOpacity>
            ))}
          </View>
        </View>

        {/* Additional Premium Features */}
        <View style={styles.featuresSection}>
          <Text style={styles.sectionTitle}>Contenus Exclusifs</Text>
          <View style={styles.featuresGrid}>
            <View style={styles.featureCard}>
              <Ionicons name="images" size={30} color="#8B0000" />
              <Text style={styles.featureCardTitle}>Galerie Photo</Text>
              <Text style={styles.featureCardText}>+100 photos exclusives</Text>
            </View>
            <View style={styles.featureCard}>
              <Ionicons name="videocam" size={30} color="#8B0000" />
              <Text style={styles.featureCardTitle}>Vidéos</Text>
              <Text style={styles.featureCardText}>Cérémonies traditionnelles</Text>
            </View>
            <View style={styles.featureCard}>
              <Ionicons name="musical-notes" size={30} color="#8B0000" />
              <Text style={styles.featureCardTitle}>Musiques</Text>
              <Text style={styles.featureCardText}>Rythmes authentiques</Text>
            </View>
            <View style={styles.featureCard}>
              <Ionicons name="document-text" size={30} color="#8B0000" />
              <Text style={styles.featureCardTitle}>Documents</Text>
              <Text style={styles.featureCardText}>Textes historiques</Text>
            </View>
          </View>
        </View>

      </ScrollView>
    </ImageBackground>
  );
}

const styles = StyleSheet.create({
  background: {
    flex: 1,
  },
  container: {
    flex: 1,
  },
  header: {
    backgroundColor: 'rgba(139, 0, 0, 0.95)',
    padding: 20,
    paddingTop: 60,
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
  },
  backButton: {
    padding: 5,
  },
  title: {
    fontSize: 24,
    fontWeight: '700',
    color: '#FFF',
    textAlign: 'center',
  },
  subtitle: {
    fontSize: 14,
    color: '#FFD700',
    textAlign: 'center',
    fontWeight: '600',
  },
  premiumBadge: {
    backgroundColor: 'rgba(255, 255, 255, 0.2)',
    padding: 10,
    borderRadius: 50,
  },
  welcomeSection: {
    backgroundColor: 'rgba(255, 255, 240, 0.95)',
    margin: 20,
    padding: 20,
    borderRadius: 15,
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.25,
    shadowRadius: 4,
    elevation: 4,
  },
  welcomeTitle: {
    fontSize: 20,
    fontWeight: '700',
    color: '#27AE60',
    marginBottom: 10,
    textAlign: 'center',
  },
  welcomeText: {
    fontSize: 16,
    color: '#333',
    textAlign: 'center',
    lineHeight: 22,
  },
  culturesSection: {
    padding: 20,
    paddingTop: 0,
  },
  sectionTitle: {
    fontSize: 22,
    fontWeight: '700',
    color: '#8B0000',
    marginBottom: 20,
    textAlign: 'center',
  },
  culturesGrid: {
    flexDirection: 'row',
    flexWrap: 'wrap',
    justifyContent: 'space-between',
    gap: 15,
  },
  cultureCard: {
    width: (width - 70) / 2,
    borderRadius: 15,
    padding: 20,
    minHeight: 180,
    justifyContent: 'space-between',
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 4 },
    shadowOpacity: 0.3,
    shadowRadius: 8,
    elevation: 8,
    position: 'relative',
  },
  cultureIcon: {
    marginBottom: 10,
  },
  cultureName: {
    fontSize: 18,
    fontWeight: '700',
    color: '#FFF',
    marginBottom: 8,
    textShadowColor: 'rgba(0, 0, 0, 0.3)',
    textShadowOffset: { width: 1, height: 1 },
    textShadowRadius: 2,
  },
  cultureDescription: {
    fontSize: 12,
    color: 'rgba(255, 255, 255, 0.9)',
    lineHeight: 16,
  },
  cultureArrow: {
    position: 'absolute',
    bottom: 15,
    right: 15,
  },
  featuresSection: {
    padding: 20,
    paddingTop: 0,
  },
  featuresGrid: {
    flexDirection: 'row',
    flexWrap: 'wrap',
    justifyContent: 'space-between',
    gap: 15,
  },
  featureCard: {
    width: (width - 70) / 2,
    backgroundColor: 'rgba(255, 255, 240, 0.95)',
    borderRadius: 15,
    padding: 20,
    alignItems: 'center',
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.25,
    shadowRadius: 4,
    elevation: 4,
  },
  featureCardTitle: {
    fontSize: 16,
    fontWeight: '700',
    color: '#8B0000',
    marginTop: 10,
    marginBottom: 5,
    textAlign: 'center',
  },
  featureCardText: {
    fontSize: 12,
    color: '#333',
    textAlign: 'center',
    lineHeight: 16,
  },
});