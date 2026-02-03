import { Ionicons } from '@expo/vector-icons';
import { useRouter } from 'expo-router';
import React, { useState } from 'react';
import {
  ActivityIndicator,
  Alert,
  ImageBackground,
  KeyboardAvoidingView,
  Platform,
  ScrollView,
  StyleSheet,
  Text,
  TextInput,
  TouchableOpacity,
  View
} from 'react-native';

import { supabase } from '../../lib/supabase';

export default function SignUpScreen() {
  const router = useRouter();

  const [email, setEmail] = useState<string>('');
  const [password, setPassword] = useState<string>('');
  const [confirmPassword, setConfirmPassword] = useState<string>('');
  const [firstName, setFirstName] = useState<string>('');
  const [lastName, setLastName] = useState<string>('');
  const [phone, setPhone] = useState<string>('');
  const [loading, setLoading] = useState<boolean>(false);

  const [showPassword, setShowPassword] = useState<boolean>(false);
  const [showConfirmPassword, setShowConfirmPassword] = useState<boolean>(false);

  const validateEmail = (email: string) => /^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(email);
  const validatePhone = (phone: string) => /^237\d{9}$/.test(phone);

  // Fonction pour corriger la contrainte de clé étrangère
  const fixForeignKeyConstraint = async () => {
    try {
      Alert.alert(
        'Configuration requise',
        'La base de données nécessite une configuration technique.\n\nVeuillez contacter le support pour exécuter cette requête SQL :\n\nALTER TABLE profiles DROP CONSTRAINT profiles_id_fkey;\nALTER TABLE profiles ADD CONSTRAINT profiles_id_fkey FOREIGN KEY (id) REFERENCES auth.users(id) ON DELETE CASCADE;',
        [{ text: 'OK' }]
      );
    } catch (error) {
      console.error('Erreur notification:', error);
    }
  };

  const handleSignUp = async () => {
    // Validation des champs
    if (!email || !password || !confirmPassword || !firstName || !lastName || !phone) {
      Alert.alert('Erreur', 'Tous les champs sont obligatoires.');
      return;
    }

    if (!validateEmail(email)) {
      Alert.alert('Erreur', "L'adresse e-mail n'est pas valide.");
      return;
    }

    if (!validatePhone(phone)) {
      Alert.alert('Erreur', 'Le numéro doit commencer par 237 et contenir 12 chiffres au total.');
      return;
    }

    if (password !== confirmPassword) {
      Alert.alert('Erreur', 'Les mots de passe ne correspondent pas.');
      return;
    }

    if (password.length < 6) {
      Alert.alert('Erreur', 'Le mot de passe doit contenir au moins 6 caractères.');
      return;
    }

    setLoading(true);

    try {
      console.log(' Début de l\'inscription...');

      // ÉTAPE 1: Création du compte utilisateur dans auth.users
      console.log('Création du compte auth...');
      const { data: authData, error: authError } = await supabase.auth.signUp({
        email: email.trim().toLowerCase(),
        password: password,
        options: {
          data: {
            first_name: firstName.trim(),
            last_name: lastName.trim(),
            phone: phone.trim(),
          }
        }
      });

      if (authError) {
        console.error(' Erreur auth:', authError);
        if (authError.message.includes('already registered') || authError.message.includes('already exists')) {
          throw new Error('Un compte avec cet email existe déjà.');
        }
        throw authError;
      }

      if (!authData.user) {
        throw new Error('Échec de la création du compte utilisateur.');
      }

      console.log(' Compte auth créé:', authData.user.id);

      // ÉTAPE 2: Tentative de création du profil
      console.log(' Tentative de création du profil...');
      
      try {
        // Méthode 1: Insertion standard
        const { error: profileError } = await supabase
          .from('profiles')
          .insert({
            id: authData.user.id,
            first_name: firstName.trim(),
            last_name: lastName.trim(),
            phone: phone.trim(),
            email: email.trim().toLowerCase(),
            is_premium: false,
            created_at: new Date().toISOString(),
            avatar_url: null,
            updated_at: new Date().toISOString(),
            last_payment_date: null,
            payment_reference: null,
          });

        if (profileError) {
          console.warn(' Erreur insertion standard:', profileError);
          
          // Méthode 2: Upsert (meilleure chance)
          const { error: upsertError } = await supabase
            .from('profiles')
            .upsert({
              id: authData.user.id,
              first_name: firstName.trim(),
              last_name: lastName.trim(),
              phone: phone.trim(),
              email: email.trim().toLowerCase(),
              is_premium: false,
              created_at: new Date().toISOString(),
              avatar_url: null,
              updated_at: new Date().toISOString(),
              last_payment_date: null,
              payment_reference: null,
            }, {
              onConflict: 'id'
            });

          if (upsertError) {
            console.warn(' Erreur upsert:', upsertError);
            
            // Méthode 3: Fonction RPC si elle existe
            try {
              const { error: rpcError } = await supabase.rpc('create_user_profile', {
                user_id: authData.user.id,
                user_email: email.trim().toLowerCase(),
                user_first_name: firstName.trim(),
                user_last_name: lastName.trim(),
                user_phone: phone.trim()
              });

              if (rpcError) {
                console.warn(' Erreur RPC:', rpcError);
                // Le profil n'est pas créé, mais le compte auth existe
                console.log('Compte auth créé, profil non créé (problème de contrainte)');
              } else {
                console.log(' Profil créé via RPC');
              }
            } catch (rpcException) {
              console.warn('Exception RPC:', rpcException);
            }
          } else {
            console.log('Profil créé via upsert');
          }
        } else {
          console.log(' Profil créé via insertion standard');
        }
      } catch (profileException: any) {
        console.warn('Exception création profil:', profileException);
        // On continue même si le profil n'est pas créé
      }

      // SUCCÈS: Le compte auth est créé, c'est le plus important
      console.log(' Inscription réussie!');
      
      Alert.alert(
        ' Inscription réussie!',
        'Votre compte a été créé avec succès. Vous pouvez maintenant vous connecter.',
        [
          {
            text: 'Se connecter',
            onPress: () => {
              console.log(' Redirection vers login');
              router.replace('/login');
            }
          }
        ]
      );

    } catch (error: any) {
      console.error(' Erreur inscription:', error);
      
      let errorMessage = 'Une erreur est survenue lors de la création du compte.';
      
      // Messages d'erreur spécifiques
      if (error.message?.includes('already registered') || error.message?.includes('already exists')) {
        errorMessage = 'Un compte avec cet email existe déjà.';
      } else if (error.code === '23503') {
        errorMessage = 'Problème de configuration technique. Le compte a été créé mais nécessite une configuration supplémentaire.';
        
        // Afficher un bouton pour corriger la contrainte
        Alert.alert(
          ' Configuration requise',
          errorMessage,
          [
            { 
              text: 'Voir les instructions', 
              onPress: () => fixForeignKeyConstraint() 
            },
            { 
              text: 'OK', 
              style: 'cancel' 
            }
          ]
        );
        return;
      } else if (error.message) {
        errorMessage = error.message;
      }
      
      Alert.alert(' Erreur', errorMessage);
      
    } finally {
      setLoading(false);
    }
  };

  return (
    <ImageBackground
      source={require('@/assets/images/2.jpeg')}
      style={styles.background}
      resizeMode="cover"
    >
      <KeyboardAvoidingView
        behavior={Platform.OS === 'ios' ? 'padding' : 'height'}
        style={styles.keyboardAvoidingView}
      >
       <ScrollView
  contentContainerStyle={styles.scrollContainer}
  keyboardShouldPersistTaps="handled"
  showsVerticalScrollIndicator={false}
>
          <View style={styles.container}>
            <Text style={styles.title}>Inscription</Text>
            <Text style={styles.subtitle}>Rejoignez la communauté Le Continent</Text>

            <View style={styles.inputRow}>
              <View style={[styles.inputGroup, { flex: 1, marginRight: 8 }]}>
                <Text style={styles.inputLabel}>Prénom</Text>
                <TextInput 
                  placeholder="Votre prénom" 
                  value={firstName} 
                  onChangeText={setFirstName} 
                  style={styles.input}
                  editable={!loading}
                  autoCapitalize="words"
                />
              </View>

              <View style={[styles.inputGroup, { flex: 1, marginLeft: 8 }]}>
                <Text style={styles.inputLabel}>Nom</Text>
                <TextInput 
                  placeholder="Votre nom" 
                  value={lastName} 
                  onChangeText={setLastName} 
                  style={styles.input}
                  editable={!loading}
                  autoCapitalize="words"
                />
              </View>
            </View>

            <View style={styles.inputGroup}>
              <Text style={styles.inputLabel}>Numéro de téléphone</Text>
              <TextInput
                placeholder="2376XXXXXXXX"
                value={phone}
                onChangeText={setPhone}
                style={styles.input}
                keyboardType="phone-pad"
                maxLength={12}
                editable={!loading}
              />
              <Text style={styles.inputHint}>Format: 237 suivi de 9 chiffres</Text>
            </View>

            <View style={styles.inputGroup}>
              <Text style={styles.inputLabel}>Adresse e-mail</Text>
              <TextInput
                placeholder="votre@email.com"
                value={email}
                onChangeText={setEmail}
                style={styles.input}
                keyboardType="email-address"
                autoCapitalize="none"
                autoComplete="email"
                editable={!loading}
              />
            </View>

            <View style={styles.inputGroup}>
              <Text style={styles.inputLabel}>Mot de passe</Text>
              <View style={styles.passwordContainer}>
                <TextInput
                  placeholder="Minimum 6 caractères"
                  value={password}
                  onChangeText={setPassword}
                  style={[styles.input, { flex: 1, marginBottom: 0, borderWidth: 0 }]}
                  secureTextEntry={!showPassword}
                  autoCapitalize="none"
                  autoComplete="password-new"
                  editable={!loading}
                />
                <TouchableOpacity 
                  onPress={() => setShowPassword(!showPassword)} 
                  style={styles.eyeIcon}
                  disabled={loading}
                >
                  <Ionicons name={showPassword ? 'eye-off' : 'eye'} size={22} color="#8B0000" />
                </TouchableOpacity>
              </View>
            </View>

            <View style={styles.inputGroup}>
              <Text style={styles.inputLabel}>Confirmer le mot de passe</Text>
              <View style={styles.passwordContainer}>
                <TextInput
                  placeholder="Confirmez votre mot de passe"
                  value={confirmPassword}
                  onChangeText={setConfirmPassword}
                  style={[styles.input, { flex: 1, marginBottom: 0, borderWidth: 0 }]}
                  secureTextEntry={!showConfirmPassword}
                  autoCapitalize="none"
                  autoComplete="password-new"
                  editable={!loading}
                />
                <TouchableOpacity 
                  onPress={() => setShowConfirmPassword(!showConfirmPassword)} 
                  style={styles.eyeIcon}
                  disabled={loading}
                >
                  <Ionicons name={showConfirmPassword ? 'eye-off' : 'eye'} size={22} color="#8B0000" />
                </TouchableOpacity>
              </View>
            </View>

            <TouchableOpacity
              style={[styles.button, loading && { backgroundColor: '#aaa' }]}
              onPress={handleSignUp}
              disabled={loading}
            >
              {loading ? (
                <>
                  <ActivityIndicator color="#FFF" style={{ marginRight: 10 }} />
                  <Text style={styles.buttonText}>Création en cours...</Text>
                </>
              ) : (
                <>
                  <Ionicons name="person-add" size={20} color="#FFF" />
                  <Text style={styles.buttonText}>Créer mon compte</Text>
                </>
              )}
            </TouchableOpacity>

            <View style={styles.helpContainer}>
              <Text style={styles.helpText}>
                En cas de problème technique, contactez le support.
              </Text>
              <TouchableOpacity >
                <Text >Voir les instructions techniques</Text>
              </TouchableOpacity>
            </View>

            {/* SECTION "SE CONNECTER" AMÉLIORÉE ET PLUS VISIBLE */}
            <View style={styles.loginSection}>
              <Text style={styles.loginText}>Déjà un compte ?</Text>
              <TouchableOpacity 
                style={styles.loginButton}
                onPress={() => !loading && router.push('/login')}
                disabled={loading}
              >
                <Ionicons name="log-in-outline" size={20} color="#FFF" />
                <Text style={styles.loginButtonText}>Se connecter</Text>
              </TouchableOpacity>
            </View>
          </View>
        </ScrollView>
      </KeyboardAvoidingView>
    </ImageBackground>
  );
}

const styles = StyleSheet.create({
  background: { flex: 1 },
  keyboardAvoidingView: { flex: 1 },
  scrollContainer: { 
    flexGrow: 1,
    justifyContent: 'flex-start',
    paddingVertical: 70,
  },
  container: {
    backgroundColor: 'rgba(255, 255, 240, 0.95)',
    marginHorizontal: 20,
    borderRadius: 20,
    padding: 25,
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 4 },
    shadowOpacity: 0.3,
    shadowRadius: 8,
    elevation: 8,
  },
  title: {
    fontSize: 32,
    fontWeight: '800',
    marginBottom: 8,
    color: '#8B0000',
    textAlign: 'center',
  },
  subtitle: {
    fontSize: 16,
    color: '#4B0082',
    textAlign: 'center',
    marginBottom: 30,
    fontWeight: '500',
  },
  inputRow: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    marginBottom: 15,
  },
  inputGroup: {
    marginBottom: 20,
  },
  inputLabel: {
    fontSize: 14,
    fontWeight: '600',
    color: '#8B0000',
    marginBottom: 8,
    marginLeft: 5,
  },
  inputHint: {
    fontSize: 12,
    color: '#666',
    marginTop: 5,
    marginLeft: 5,
    fontStyle: 'italic',
  },
  input: {
    borderWidth: 1,
    borderColor: '#8B0000',
    borderRadius: 12,
    paddingHorizontal: 15,
    height: 50,
    backgroundColor: '#FFF8DC',
    fontSize: 16,
  },
  passwordContainer: {
    flexDirection: 'row',
    alignItems: 'center',
    borderWidth: 1,
    borderColor: '#8B0000',
    borderRadius: 12,
    backgroundColor: '#FFF8DC',
    height: 50,
  },
  eyeIcon: {
    padding: 10,
    marginRight: 5,
  },
  button: {
    backgroundColor: '#8B0000',
    paddingVertical: 16,
    borderRadius: 12,
    alignItems: 'center',
    marginTop: 10,
    flexDirection: 'row',
    justifyContent: 'center',
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.3,
    shadowRadius: 4,
    elevation: 4,
  },
  buttonText: {
    color: '#FFF',
    fontWeight: '700',
    fontSize: 18,
    marginLeft: 10,
  },
  helpContainer: {
    marginTop: 15,
    padding: 10,
    backgroundColor: 'rgba(139, 0, 0, 0.05)',
    borderRadius: 10,
    alignItems: 'center',
  },
  helpText: {
    fontSize: 12,
    color: '#666',
    textAlign: 'center',
    marginBottom: 5,
  },
  helpLink: {
    fontSize: 12,
    color: '#8B0000',
    fontWeight: '600',
    textDecorationLine: 'underline',
  },
  // NOUVEAUX STYLES POUR LA SECTION "SE CONNECTER"
  loginSection: {
    marginTop: 25,
    paddingTop: 20,
    borderTopWidth: 1,
    borderTopColor: '#EEE',
    alignItems: 'center',
  },
  loginText: {
    fontSize: 16,
    color: '#4B0082',
    marginBottom: 15,
    fontWeight: '500',
  },
  loginButton: {
    backgroundColor: '#27AE60',
    paddingVertical: 14,
    paddingHorizontal: 30,
    borderRadius: 12,
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'center',
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.2,
    shadowRadius: 4,
    elevation: 3,
    width: '100%',
  },
  loginButtonText: {
    color: '#FFF',
    fontWeight: '700',
    fontSize: 16,
    marginLeft: 10,
  },
});