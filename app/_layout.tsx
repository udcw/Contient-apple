import { DarkTheme, DefaultTheme, ThemeProvider } from '@react-navigation/native';
import { Stack, useRouter } from 'expo-router';
import { StatusBar } from 'expo-status-bar';
import 'react-native-reanimated';
import { useEffect } from 'react';
import AsyncStorage from '@react-native-async-storage/async-storage';

import { useColorScheme } from '@/hooks/use-color-scheme';
import { supabase } from '@/lib/supabase';

export const unstable_settings = {
  anchor: '(tabs)',
};

export default function RootLayout() {
  const colorScheme = useColorScheme();
  const router = useRouter();

  useEffect(() => {
    const checkFirstTime = async () => {
      try {
        // Vérifier si c'est la première fois que l'utilisateur ouvre l'app
        const hasSeenIntro = await AsyncStorage.getItem('hasSeenIntro');
        
        // Vérifier l'état d'authentification
        const { data: { session } } = await supabase.auth.getSession();
        
        if (session) {
          // Utilisateur déjà connecté
          router.replace('/(tabs)/AppDrawer');
        } else {
          if (!hasSeenIntro) {
            // Première fois: montrer l'intro
            router.replace('/(intro)/welcome');
          } else {
            // A déjà vu l'intro: aller à l'inscription
            router.replace('/inscription');
          }
        }
      } catch (error) {
        console.error('Error checking first time:', error);
      }
    };

    checkFirstTime();

    // Écouter les changements d'authentification
    const { data: { subscription } } = supabase.auth.onAuthStateChange((event, session) => {
      if (session) {
        router.replace('/(tabs)/AppDrawer');
      } else {
        // Si déconnecté, vérifier s'il a déjà vu l'intro
        AsyncStorage.getItem('hasSeenIntro').then(hasSeenIntro => {
          if (hasSeenIntro) {
            router.replace('/inscription');
          } else {
            router.replace('/(intro)/welcome');
          }
        });
      }
    });

    return () => subscription.unsubscribe();
  }, []);

  return (
    <ThemeProvider value={colorScheme === 'dark' ? DarkTheme : DefaultTheme}>
      <Stack screenOptions={{ headerShown: false }}>
        <Stack.Screen name="(intro)" />
        <Stack.Screen name="(tabs)" />
        <Stack.Screen name="modal" options={{ presentation: 'modal', title: 'Modal' }} />
        {/* <Stack.Screen name="inscription" /> */}
        {/* <Stack.Screen name="login" /> */}
      </Stack>
      <StatusBar style="auto" />
    </ThemeProvider>
  );
}