import { Ionicons } from "@expo/vector-icons";
import { useRouter } from "expo-router";
import React, { useState } from "react";
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
  View,
} from "react-native";
import { supabase } from "../../lib/supabase";

export default function LoginScreen() {
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const [showPassword, setShowPassword] = useState(false);
  const [loading, setLoading] = useState(false);

  const router = useRouter();

  const handleLogin = async () => {
    if (!email || !password) {
      Alert.alert("Erreur", "Veuillez remplir tous les champs.");
      return;
    }

    setLoading(true);

    try {
      // 1) Login
      const { data: userAuth, error: authError } =
        await supabase.auth.signInWithPassword({
          email: email.trim().toLowerCase(),
          password,
        });

      if (authError) throw authError;

      const user = userAuth.user;
      if (!user) {
        throw new Error("Utilisateur introuvable après connexion.");
      }

      // 2) Charger le profil
      const { data: profile, error: profileError } = await supabase
        .from("profiles")
        .select("*")
        .eq("id", user.id)
        .single();

      if (profileError) throw profileError;

      console.log("Profil utilisateur:", profile);

      // 3) Redirection
      router.replace("/(tabs)/AppDrawer");
    } catch (err: any) {
      console.error("Erreur login:", err);

      const errorMap: Record<string, string> = {
        "Invalid login credentials": "Email ou mot de passe incorrect.",
        "Email not confirmed":
          "Veuillez vérifier votre email avant de vous connecter.",
      };

      const message =
        errorMap[err.message] ?? "Une erreur est survenue. Réessayez.";

      Alert.alert("Erreur", message);
      Alert.alert("Erreur", "Veuillez remplir tous les champs.");
      return;
    }

    setLoading(true);
    try {
      // Connexion avec Supabase
      const { data, error } = await supabase.auth.signInWithPassword({
        email: email.trim().toLowerCase(),
        password: password,
      });

      if (error) {
        throw error;
      }

      if (data.user) {
        // Récupération des infos utilisateur depuis la table profiles
        const { data: profile, error: profileError } = await supabase
          .from("profiles")
          .select("*")
          .eq("id", data.user.id)
          .single();

        if (profileError) {
          console.log("Erreur profil:", profileError);
        } else {
          console.log("Infos utilisateur:", profile);
        }

        Alert.alert("Succès", "Connexion réussie !");
        router.replace("/(tabs)/AppDrawer");
      }
    } catch (error: any) {
      console.error("Erreur connexion:", error);
      let errorMessage = "Une erreur est survenue";

      if (error.message.includes("Invalid login credentials")) {
        errorMessage = "Email ou mot de passe incorrect";
      }

      Alert.alert("Erreur", errorMessage);
    } finally {
      setLoading(false);
    }
  };

  return (
    <ImageBackground
      source={require("@/assets/images/1.jpeg")}
      style={styles.background}
      resizeMode="cover"
    >
      <KeyboardAvoidingView
        behavior={Platform.OS === "ios" ? "padding" : undefined}
        style={{ flex: 1 }}
      >
        <ScrollView contentContainerStyle={styles.scrollContainer}>
          <View style={styles.container}>
            <Text style={styles.title}>Se connecter</Text>

            <TextInput
              placeholder="Adresse e-mail"
              value={email}
              onChangeText={setEmail}
              style={styles.input}
              keyboardType="email-address"
              autoCapitalize="none"
            />

            <View style={styles.passwordContainer}>
              <TextInput
                placeholder="Mot de passe"
                value={password}
                onChangeText={setPassword}
                style={styles.passwordInput}
                secureTextEntry={!showPassword}
                autoCapitalize="none"
              />
              <TouchableOpacity onPress={() => setShowPassword(!showPassword)}>
                <Ionicons
                  name={showPassword ? "eye" : "eye-off"}
                  size={24}
                  color="#8B0000"
                />
              </TouchableOpacity>
            </View>

            <TouchableOpacity
              style={[styles.button, loading && { backgroundColor: "#aaa" }]}
              onPress={handleLogin}
              disabled={loading}
            >
              {loading ? (
                <ActivityIndicator color="#FFF" />
              ) : (
                <Text style={styles.buttonText}>Connexion</Text>
              )}
            </TouchableOpacity>

            <Text style={styles.link}>
              Pas encore de compte ?{" "}
              <TouchableOpacity
                onPress={() => router.push("/inscription")}
                activeOpacity={0.7}
              >
                <Text style={styles.linkHighlightStrong}>S'inscrire</Text>
              </TouchableOpacity>
            </Text>
          </View>
        </ScrollView>
      </KeyboardAvoidingView>
    </ImageBackground>
  );
}

const styles = StyleSheet.create({
  background: { flex: 1 },
  scrollContainer: { flexGrow: 1 },
  container: {
    flex: 1,
    backgroundColor: "rgba(255, 255, 240, 0.85)",
    margin: 20,
    borderRadius: 15,
    padding: 20,
    justifyContent: "center",
  },
  linkHighlightStrong: {
  fontSize: 16,
  fontWeight: "900",
  color: "#8B0000",
  textDecorationLine: "underline",

  backgroundColor: "rgba(13, 13, 65, 0.08)",
  paddingHorizontal: 10,
  paddingVertical: 4,
  borderRadius: 8,
},

  title: {
    fontSize: 28,
    fontWeight: "700",
    marginBottom: 25,
    color: "#8B0000",
    textAlign: "center",
  },
  input: {
    borderWidth: 1,
    borderColor: "#8B0000",
    borderRadius: 10,
    paddingHorizontal: 15,
    height: 50,
    marginBottom: 15,
    backgroundColor: "#FFF8DC",
  },
  passwordContainer: {
    flexDirection: "row",
    alignItems: "center",
    borderWidth: 1,
    borderColor: "#8B0000",
    borderRadius: 10,
    paddingHorizontal: 15,
    height: 50,
    marginBottom: 15,
    backgroundColor: "#FFF8DC",
  },
  passwordInput: {
    flex: 1,
    height: "100%",
  },
  button: {
    backgroundColor: "#FF8C00",
    paddingVertical: 15,
    borderRadius: 10,
    alignItems: "center",
    marginTop: 5,
  },
  buttonText: {
    color: "#FFF",
    fontWeight: "600",
    fontSize: 16,
  },
  link: {
    marginTop: 15,
    textAlign: "center",
    fontSize: 14,
    color: "#4B0082",
  },
  linkHighlight: {
    fontWeight: "700",
    color: "#8B0000",
  },
});
