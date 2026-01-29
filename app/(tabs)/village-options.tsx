import { Ionicons } from "@expo/vector-icons";
import { LinearGradient } from "expo-linear-gradient";
import * as Linking from "expo-linking";
import { router, useLocalSearchParams } from "expo-router";
import { ImageBackground, StyleSheet, Text, TouchableOpacity, View } from "react-native";
import { SafeAreaView } from "react-native-safe-area-context";
import { useRouter } from "expo-router";

export default function VillageOptionsScreen() {
  const { village } = useLocalSearchParams();
  const data = village ? JSON.parse(village as string) : null;
  const router = useRouter();
  const options = [
    { id: "proverbes", label: "Proverbes", icon: "chatbox-ellipses-outline" },
    { id: "lexique",     label: "Lexique", icon: "book-outline" },
    { id: "histoire",    label: "Histoire", icon: "time-outline" },
    { id: "mets",        label: "Mets", icon: "restaurant-outline" },
    { id: "alphabet",    label: "Alphabet", icon: "text-outline" },
    { id: "contact",     label: "Nous contacter", icon: "logo-whatsapp" },
  ];

  const handleOptionPress = (optionId: string) => {
    if (optionId === "contact") {
      Linking.openURL("https://wa.me/237691372897");
      return;
    }

    router.push({
      pathname: `/(tabs)/village/${optionId}`,
      params: { village: JSON.stringify(data) },
    });
  };

  return (
    <View style={{ flex: 1 }}>
      <ImageBackground
        source={require("@/assets/images/2.jpeg")}
        style={styles.bg}
        resizeMode="cover"
      >
        <View style={styles.overlay} />

        <LinearGradient
          colors={["rgba(0,0,0,0.6)", "transparent"]}
          style={styles.gradientTop}
        />

        <SafeAreaView style={styles.content}>
          <Text style={styles.title}>{data?.name}</Text>
          <TouchableOpacity onPress={() => router.back()} style={styles.backButton}>
            <Ionicons name="arrow-back" size={24} color="#0A84FF" />
            <Text style={styles.backText}>Retour</Text>
          </TouchableOpacity>
          <Text style={styles.subtitle}>Choisissez une option :</Text>

          {options.map((opt) => (
            <TouchableOpacity
              key={opt.id}
              style={styles.option}
              onPress={() => handleOptionPress(opt.id)}
            >
              <Ionicons
                name={opt.icon as any}
                size={24}
                color={opt.id === "contact" ? "#25D366" : "white"}
                style={{ marginRight: 12 }}
              />
              <Text style={styles.optionText}>{opt.label}</Text>
            </TouchableOpacity>
          ))}
        </SafeAreaView>
      </ImageBackground>
    </View>
  );
}

const styles = StyleSheet.create({
  bg: { flex: 1 },
  overlay: {
    ...StyleSheet.absoluteFillObject,
    backgroundColor: "rgba(0,0,0,0.45)",
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
  gradientTop: {
    position: "absolute",
    top: 0,
    height: 160,
    width: "100%",
  },
  content: {
    padding: 22,
    flex: 1,
  },
  title: {
    fontSize: 32,
    fontWeight: "800",
    color: "white",
    marginBottom: 8,
  },
  subtitle: {
    fontSize: 18,
    color: "#ddd",
    marginBottom: 20,
  },
  option: {
    flexDirection: "row",
    alignItems: "center",
    backgroundColor: "rgba(255,255,255,0.32)",
    paddingVertical: 14,
    paddingHorizontal: 16,
    borderRadius: 10,
    marginVertical: 6,
    backdropFilter: "blur(10px)",
  },
  optionText: {
    color: "white",
    fontSize: 18,
    fontWeight: "500",
  },
});
