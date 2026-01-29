import React from 'react';
import { View, Text, StyleSheet, ImageBackground, TouchableOpacity } from 'react-native';
import { useRouter } from 'expo-router';

export default function PresentationScreen() {
  const router = useRouter();

  return (
    <ImageBackground 
      source={require('@/assets/images/3.jpeg')} // Remplacez par votre image
      style={styles.background}
      resizeMode="cover"
    >
      <View style={styles.container}>
        <Text style={styles.title}>Présentation</Text>
        <Text style={styles.description}>
          Notre application vous permet de découvrir des contenus exclusifs, 
          partager vos expériences et connecter avec une communauté passionnée.
          Profitez d'une expérience unique adaptée à vos besoins.
        </Text>
        
        <View style={styles.buttonContainer}>
          <TouchableOpacity 
            style={[styles.button, styles.backButton]}
            onPress={() => router.back()}
          >
            <Text style={styles.buttonText}>Retour</Text>
          </TouchableOpacity>
          
          <TouchableOpacity 
            style={[styles.button, styles.nextButton]}
            onPress={() => router.push('/(intro)/features')}
          >
            <Text style={styles.buttonText}>Suivant</Text>
          </TouchableOpacity>
        </View>
      </View>
    </ImageBackground>
  );
}

const styles = StyleSheet.create({
  background: {
    flex: 1,
    justifyContent: 'center',
    alignItems: 'center',
  },
  container: {
    backgroundColor: 'rgba(0, 0, 0, 0.7)',
    padding: 25,
    borderRadius: 20,
    alignItems: 'center',
    width: '90%',
  },
  title: {
    fontSize: 32,
    fontWeight: 'bold',
    color: '#fff',
    marginBottom: 20,
  },
  description: {
    fontSize: 16,
    color: '#fff',
    textAlign: 'center',
    lineHeight: 24,
    marginBottom: 40,
  },
  buttonContainer: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    width: '100%',
  },
  button: {
    paddingHorizontal: 30,
    paddingVertical: 12,
    borderRadius: 20,
    minWidth: 120,
    alignItems: 'center',
  },
  backButton: {
    backgroundColor: '#757575',
  },
  nextButton: {
    backgroundColor: '#2196F3',
  },
  buttonText: {
    color: '#fff',
    fontSize: 16,
    fontWeight: 'bold',
  },
});