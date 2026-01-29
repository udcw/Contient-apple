import React from 'react';
import {
  View,
  Text,
  StyleSheet,
  ImageBackground,
  TouchableOpacity,
  Image,
} from 'react-native';
import { useRouter } from 'expo-router';

export default function WelcomeScreen() {
  const router = useRouter();

  return (
    <ImageBackground
      source={require('@/assets/images/1.jpeg')}
      style={styles.background}
      resizeMode="cover"
    >
      <View style={styles.container}>

        {/* LOGO */}
        <Image
          source={require('@/assets/images/continent_logo.jpg')} 
          style={styles.logo}
          resizeMode="contain"
        />

        <Text style={styles.title}>Bienvenue</Text>

        <Text style={styles.subtitle}>
          Découvrez notre application exceptionnelle
        </Text>

        <TouchableOpacity
          style={styles.button}
          onPress={() => router.push('/(intro)/presentation')}
        >
          <Text style={styles.buttonText}>Suivant</Text>
        </TouchableOpacity>

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
  logo: {
  width: 120,
  height: 120,
  marginBottom: 20,
},

  container: {
    backgroundColor: 'rgba(0, 0, 0, 0.6)',
    padding: 30,
    borderRadius: 20,
    alignItems: 'center',
    width: '90%',
  },
  title: {
    fontSize: 36,
    fontWeight: 'bold',
    color: '#fff',
    marginBottom: 20,
  },
  subtitle: {
    fontSize: 18,
    color: '#fff',
    textAlign: 'center',
    marginBottom: 40,
  },
  button: {
    backgroundColor: '#4CAF50',
    paddingHorizontal: 40,
    paddingVertical: 15,
    borderRadius: 25,
  },
  buttonText: {
    color: '#fff',
    fontSize: 18,
    fontWeight: 'bold',
  },
});