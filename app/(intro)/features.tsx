import React from 'react';
import { View, Text, StyleSheet, ImageBackground, TouchableOpacity, ScrollView } from 'react-native';
import { useRouter } from 'expo-router';
import AsyncStorage from '@react-native-async-storage/async-storage';
import { Ionicons } from '@expo/vector-icons';

export default function FeaturesScreen() {
  const router = useRouter();

  const handleGetStarted = async () => {
    try {
      // Marquer que l'utilisateur a vu l'intro
      await AsyncStorage.setItem('hasSeenIntro', 'true');
      router.replace('/inscription');
    } catch (error) {
      console.error('Error saving intro status:', error);
      router.replace('/inscription');
    }
  };

  const features = [
    {
      id: 1,
      icon: 'language',
      title: 'Apprentissage des langues',
      description: 'Des dizaines de leçons pour apprendre les langues maternelles de votre choix'
    },
    {
      id: 2,
      icon: 'volume-high',
      title: 'Proverbes audio',
      description: 'Des centaines de proverbes représentant la sagesse de chaque Tribu Camerounaise en version audio'
    },
    {
      id: 3,
      icon: 'restaurant',
      title: 'Recettes traditionnelles',
      description: 'Des recettes et guides culinaires vous permettant de cuisiner tous nos plats Traditionnels'
    },
    {
      id: 4,
      icon: 'medical',
      title: 'Médecine traditionnelle',
      description: 'Des formules traditionnelles à bases de plantes pour traiter des petites maladies'
    },
    {
      id: 5,
      icon: 'book',
      title: 'Dictionnaires numériques',
      description: 'Des dictionnaires numériques pour traduire toutes nos langues'
    },
    {
      id: 6,
      icon: 'people',
      title: 'Histoire des tribus',
      description: 'L\'histoire et l\'origine de nos Tribus'
    }
  ];

  return (
    <ImageBackground 
      source={require('@/assets/images/3.jpeg')}
      style={styles.background}
      resizeMode="cover"
    >
      <ScrollView contentContainerStyle={styles.scrollContainer}>
        <View style={styles.container}>
          <View style={styles.headerSection}>
            <Text style={styles.title}>A travers l'application le Continent</Text>
            <Text style={styles.subtitle}>
              vous avez accès à des contenus et services variés tels que :
            </Text>
          </View>
          
          <View style={styles.featuresList}>
            {features.map((feature) => (
              <View key={feature.id} style={styles.featureItem}>
                <View style={styles.iconContainer}>
                  <Ionicons name={feature.icon as any} size={28} color="#8B0000" />
                </View>
                <View style={styles.textContainer}>
                  <Text style={styles.featureTitle}>{feature.title}</Text>
                  <Text style={styles.featureDescription}>{feature.description}</Text>
                </View>
              </View>
            ))}
          </View>
          
          <View style={styles.ctaSection}>
            <Text style={styles.ctaText}>
              Suivant
            </Text>
            
            <View style={styles.buttonContainer}>
              <TouchableOpacity 
                style={[styles.button, styles.backButton]}
                onPress={() => router.back()}
              >
                <Text style={styles.buttonText}>Retour</Text>
              </TouchableOpacity>
              
              <TouchableOpacity 
                style={[styles.button, styles.startButton]}
                onPress={handleGetStarted}
              >
                <Text style={styles.buttonText}>Commencer</Text>
              </TouchableOpacity>
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
  scrollContainer: {
    flexGrow: 1,
    justifyContent: 'center',
    alignItems: 'center',
    paddingVertical: 30,
  },
  container: {
    backgroundColor: 'rgba(0, 0, 0, 0.8)',
    padding: 25,
    borderRadius: 20,
    width: '90%',
    maxWidth: 500,
    marginVertical: 20,
  },
  headerSection: {
    marginBottom: 30,
    alignItems: 'center',
  },
  title: {
    fontSize: 22,
    fontWeight: 'bold',
    color: '#fff',
    textAlign: 'center',
    marginBottom: 10,
  },
  subtitle: {
    fontSize: 16,
    color: '#fff',
    textAlign: 'center',
    lineHeight: 22,
    fontStyle: 'italic',
  },
  featuresList: {
    width: '100%',
    marginBottom: 30,
  },
  featureItem: {
    flexDirection: 'row',
    alignItems: 'flex-start',
    marginBottom: 20,
    backgroundColor: 'rgba(255, 255, 255, 0.1)',
    padding: 15,
    borderRadius: 10,
    borderLeftWidth: 4,
    borderLeftColor: '#8B0000',
  },
  iconContainer: {
    marginRight: 15,
    marginTop: 2,
  },
  textContainer: {
    flex: 1,
  },
  featureTitle: {
    color: '#FFD700',
    fontSize: 16,
    fontWeight: 'bold',
    marginBottom: 5,
  },
  featureDescription: {
    color: '#fff',
    fontSize: 14,
    lineHeight: 18,
  },
  ctaSection: {
    alignItems: 'center',
  },
  ctaText: {
    color: '#fff',
    fontSize: 18,
    textAlign: 'center',
    marginBottom: 20,
    fontWeight: 'bold',
  },
  buttonContainer: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    width: '100%',
  },
  button: {
    paddingHorizontal: 25,
    paddingVertical: 12,
    borderRadius: 25,
    minWidth: 110,
    alignItems: 'center',
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.3,
    shadowRadius: 3,
    elevation: 4,
  },
  backButton: {
    backgroundColor: '#757575',
  },
  startButton: {
    backgroundColor: '#8B0000',
  },
  buttonText: {
    color: '#fff',
    fontSize: 16,
    fontWeight: 'bold',
  },
});