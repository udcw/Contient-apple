// @ts-ignore
import { supabase } from "@/lib/supabase";
import {
  checkAvailibitity,
  getErrorMessage,
  getPaymentInfo,
  makePayment,
} from "@/services/maviance/services";
import { Ionicons } from "@expo/vector-icons";
import { User } from "@supabase/supabase-js";
import { useRouter } from "expo-router";
import React, { useEffect, useState } from "react";
import {
  ActivityIndicator,
  Alert,
  Dimensions,
  FlatList,
  ImageBackground,
  Modal,
  ScrollView,
  StyleSheet,
  Text,
  TextInput,
  TouchableOpacity,
  View,
} from "react-native";

// Méthodes de paiement supportées
const PAYMENT_METHODS = [
  { id: "mtn", name: "MTN Mobile Money", icon: "📱" },
  { id: "orange", name: "Orange Money", icon: "🍊" },
];

// Validation du numéro de téléphone
const validatePhoneNumber = (phone: string, method: string) => {
  const cleaned = phone.replace(/\D/g, "");

  if (cleaned.length < 9) {
    return {
      isValid: false,
      message: "Le numéro doit avoir au moins 9 chiffres",
    };
  }

  if (method === "mtn") {
    if (!cleaned.startsWith("6")) {
      return { isValid: false, message: "Le numéro MTN doit commencer par 6" };
    }
  } else if (method === "orange") {
    if (!cleaned.startsWith("6") && !cleaned.startsWith("7")) {
      return {
        isValid: false,
        message: "Le numéro Orange doit commencer par 6 ou 7",
      };
    }
  }

  return { isValid: true, message: "" };
};

const newsData = [
  {
    id: "1",
    title: "Nouvelle découverte dans le village Baka",
    description:
      "Les Baka du sud-est célèbrent un festival culturel exceptionnel...",
    category: "Culture",
    date: "Il y a 2h",
  },
  {
    id: "2",
    title: "Festival des danses traditionnelles à l'Ouest",
    description: "La région de l'Ouest accueille des centaines de visiteurs...",
    category: "Événement",
    date: "Il y a 5h",
  },
  {
    id: "3",
    title: "Les traditions culinaires des tribus du Nord",
    description: "Découvrez les plats typiques et leur histoire...",
    category: "Gastronomie",
    date: "Hier",
  },
  {
    id: "4",
    title: "Cérémonie d'initiation chez les Bamiléké",
    description:
      "Une cérémonie ancestrale préservée à travers les générations...",
    category: "Tradition",
    date: "Il y a 3 jours",
  },
];

export default function HomeScreen() {
  const router = useRouter();
  const [user, setUser] = useState<User | null>(null);
  const [userData, setUserData] = useState<any>(null);
  const [isPremium, setIsPremium] = useState<boolean>(false);
  const [loading, setLoading] = useState<boolean>(true);
  const [processingPayment, setProcessingPayment] = useState<boolean>(false);
  const [showPaymentModal, setShowPaymentModal] = useState<boolean>(false);
  const [selectedMethod, setSelectedMethod] = useState<string>("");
  const [phoneNumber, setPhoneNumber] = useState<string>("");
  const [backendAvailable, setBackendAvailable] = useState<boolean>(true);

  // Vérifier la disponibilité du backend au chargement
  useEffect(() => {
    const checkBackend = async () => {
      const isAvailable = await checkAvailibitity();
      setBackendAvailable(isAvailable);
    };

    checkBackend();
  }, []);

  const fetchUserData = async () => {
    const {
      data: { user },
    } = await supabase.auth.getUser();

    if (user) {
      setUser(user);
      const { data: profile } = await supabase
        .from("profiles")
        .select("*")
        .eq("id", user.id)
        .single();
      setUserData(profile);
      setIsPremium(profile.is_premium || false);
      setPhoneNumber(profile.phone || "");
    } else {
      setIsPremium(false);
      setUserData(null);
    }
    setLoading(false);
  };

  useEffect(() => {
    fetchUserData();
  }, []);

  const handleBackendPayment = async () => {
    if (!backendAvailable) {
      Alert.alert(
        "Service indisponible",
        "Le service de paiement est temporairement indisponible."
      );
      return;
    }

    setShowPaymentModal(true);
  };

  const processBackendPayment = async (method: string) => {
    if (!backendAvailable) {
      Alert.alert(
        "Service indisponible",
        "Le service de paiement est temporairement indisponible."
      );
      return;
    }

    if (!phoneNumber) {
      Alert.alert("Erreur", "Veuillez entrer votre numéro de téléphone");
      return;
    }

    const validation = validatePhoneNumber(phoneNumber, method);
    if (!validation.isValid) {
      Alert.alert("Numéro invalide", validation.message);
      return;
    }

    setProcessingPayment(true);
    setSelectedMethod(method);

    try {
      const ptn = await makePayment({
        amount: 1000,
        serviceNumber: phoneNumber,
        customerName: `${userData.first_name} ${userData.last_name}`,
        customerAddress: "Douala",
        customerEmailaddress: userData.email,
      });

      Alert.alert(
        "Paiement initié",
        "Veuillez confirmer le paiement sur votre téléphone",
        [
          {
            text: "OK",
            onPress: () => {
              setShowPaymentModal(false);
              startBackendPaymentStatusCheck(ptn);
            },
          },
        ]
      );
    } catch (error) {
      console.error("Erreur paiement backend:", error);
      Alert.alert("Erreur", "Une erreur est survenue lors du paiement");
    } finally {
      setProcessingPayment(false);
    }
  };

  const startBackendPaymentStatusCheck = async (ptn: string) => {
    let attempts = 0;
    const maxAttempts = 60; // 60 tentatives sur 5 minutes
    const interval = setInterval(async () => {
      const paymentInfo = await getPaymentInfo(ptn);
      console.log(paymentInfo.responseData);

      const paymentArray = paymentInfo.responseData as unknown as Array<
        Record<string, unknown>
      >;
      const status = paymentArray[0]?.status as string;
      const errorCode = paymentArray[0]?.errorCode as number;
      console.log("Payment status:", status);

      if (status != "PENDING") {
        if (status === "SUCCESS") {
          console.log("Transaction terminée:", status);

          await supabase
            .from("profiles")
            .update({
              is_premium: true,
              last_payment_date: new Date(),
            })
            .eq("id", user?.id);

          Alert.alert("Succès", "Paiement confirmé! Accès premium activé.");
          setIsPremium(true);
          router.push("/cultures-premium");
        } else {
          Alert.alert("Error", getErrorMessage(errorCode));
        }
        clearInterval(interval);
      }
      if (attempts < maxAttempts) {
        attempts++;
      } else {
        clearInterval(interval);
        Alert.alert(
          "Délai dépassé",
          "Le paiement n'a pas été confirmé dans le délai imparti. Vous serez notifié lorsque le paiement sera traité.",
          [
            {
              text: "OK",
              onPress: () => {},
            },
          ]
        );
      }
    }, 3000);
  };

  const renderItem = ({
    item,
  }: {
    item: {
      id: string;
      title: string;
      description: string;
      category: string;
      date: string;
    };
  }) => {
    return (
      <TouchableOpacity style={styles.card} onPress={() => alert(item.title)}>
        <View style={styles.cardHeader}>
          <View
            style={[
              styles.categoryBadge,
              { backgroundColor: getCategoryColor(item.category) },
            ]}
          >
            <Text style={styles.categoryText}>{item.category}</Text>
          </View>
          <Text style={styles.dateText}>{item.date}</Text>
        </View>
        <Text style={styles.cardTitle}>{item.title}</Text>
        <Text style={styles.cardDescription}>{item.description}</Text>
        <View style={styles.cardFooter}>
          <Ionicons name="time-outline" size={14} color="#666" />
          <Text style={styles.readTime}>2 min de lecture</Text>
        </View>
      </TouchableOpacity>
    );
  };

  const getCategoryColor = (category: string) => {
    const colors: { [key: string]: string } = {
      Culture: "#E67E22",
      Événement: "#9B59B6",
      Gastronomie: "#27AE60",
      Tradition: "#2980B9",
    };
    return colors[category] || "#34495E";
  };

  const renderPaymentModal = () => (
    <Modal
      visible={showPaymentModal}
      animationType="slide"
      transparent={true}
      onRequestClose={() => setShowPaymentModal(false)}
    >
      <View style={styles.modalOverlay}>
        <View style={styles.modalContent}>
          <View style={styles.modalHeader}>
            <Text style={styles.modalTitle}>Paiement Premium</Text>
            <TouchableOpacity
              onPress={() => setShowPaymentModal(false)}
              style={styles.closeButton}
            >
              <Ionicons name="close" size={24} color="#8B0000" />
            </TouchableOpacity>
          </View>

          <Text style={styles.modalDescription}>
            Choisissez votre méthode de paiement et entrez votre numéro de
            téléphone
          </Text>

          <View style={styles.phoneInputContainer}>
            <Text style={styles.inputLabel}>Numéro de téléphone</Text>
            <TextInput
              style={styles.phoneInput}
              placeholder="6XX XXX XXX"
              value={phoneNumber}
              onChangeText={setPhoneNumber}
              keyboardType="phone-pad"
              autoFocus={true}
            />
            <Text style={styles.phoneHint}>
              Entrez votre numéro MTN ou Orange
            </Text>
          </View>

          <View style={styles.paymentMethods}>
            {PAYMENT_METHODS.map((method) => (
              <TouchableOpacity
                key={method.id}
                style={[
                  styles.paymentMethodButton,
                  processingPayment && { opacity: 0.6 },
                ]}
                onPress={() => processBackendPayment(method.id)}
                disabled={processingPayment}
              >
                <Text style={styles.paymentMethodIcon}>{method.icon}</Text>
                <View style={styles.paymentMethodInfo}>
                  <Text style={styles.paymentMethodName}>{method.name}</Text>
                  <Text style={styles.paymentMethodAmount}>1000 FCFA</Text>
                </View>
                {processingPayment && selectedMethod === method.id && (
                  <ActivityIndicator size="small" color="#8B0000" />
                )}
              </TouchableOpacity>
            ))}
          </View>

          <View style={styles.securityNotice}>
            <Ionicons name="shield-checkmark" size={16} color="#27AE60" />
            <Text style={styles.securityText}>
              Paiement sécurisé par NotchPay
            </Text>
          </View>

          <View style={styles.paymentInstructions}>
            <Text style={styles.instructionsTitle}>Instructions:</Text>
            <Text style={styles.instructionsText}>
              1. Choisissez votre opérateur{"\n"}
              2. Entrez votre numéro{"\n"}
              3. Confirmez le paiement sur votre mobile{"\n"}
              4. Attendez la confirmation automatique
            </Text>
          </View>
        </View>
      </View>
    </Modal>
  );

  if (loading) {
    return (
      <View style={styles.loadingContainer}>
        <ActivityIndicator size="large" color="#8B0000" />
        <Text style={styles.loadingText}>Chargement...</Text>
      </View>
    );
  }

  return (
    <ImageBackground
      source={require("@/assets/images/a.jpg")}
      style={styles.background}
      resizeMode="cover"
    >
      <ScrollView contentContainerStyle={styles.scrollContainer}>
        {/* Header Section */}
        <View style={styles.header}>
          <View style={styles.headerContent}>
            <Text style={styles.appTitle}>Kamerun News</Text>
            <Text style={styles.subtitle}>Actualités tribales du Cameroun</Text>
            <View style={styles.statsContainer}>
              <View style={styles.statItem}>
                <Ionicons name="eye" size={20} color="#8B0000" />
                <Text style={styles.statText}>+500 lectures</Text>
              </View>
              <View style={styles.statItem}>
                <Ionicons name="heart" size={20} color="#8B0000" />
                <Text style={styles.statText}>98% aiment</Text>
              </View>
            </View>
            {user && isPremium && (
              <View style={styles.premiumBadgeHeader}>
                <Ionicons name="star" size={16} color="#FFD700" />
                <Text style={styles.premiumBadgeText}>Compte Premium</Text>
              </View>
            )}
          </View>
        </View>

        {/* Featured News */}
        <View style={styles.featuredSection}>
          <Text style={styles.sectionTitle}>À la une</Text>
          <View style={styles.featuredCard}>
            <View style={styles.featuredBadge}>
              <Text style={styles.featuredBadgeText}>Populaire</Text>
            </View>
            <Text style={styles.featuredTitle}>Le Festival Ngondo 2024</Text>
            <Text style={styles.featuredDescription}>
              La plus grande célébration culturelle Sawa revient avec des
              traditions ancestrales...
            </Text>
          </View>
        </View>

        {/* Section Paiement Premium */}
        {!isPremium ? (
          <View style={styles.premiumSection}>
            <View style={styles.premiumCard}>
              <View style={styles.premiumBadge}>
                <Ionicons name="lock-closed" size={24} color="#FFD700" />
              </View>
              <Text style={styles.premiumTitle}>Contenu Premium</Text>
              <Text style={styles.premiumDescription}>
                Débloquez l'accès complet à toutes les cultures du Cameroun avec
                des détails exclusifs, photos et vidéos.
              </Text>

              <View style={styles.pricingContainer}>
                <Text style={styles.originalPrice}>2000 FCFA</Text>
                <Text style={styles.discountedPrice}>1000 FCFA</Text>
                <View style={styles.discountBadge}>
                  <Text style={styles.discountText}>-50%</Text>
                </View>
              </View>

              <TouchableOpacity
                style={[
                  styles.paymentButton,
                  (!backendAvailable || processingPayment) && {
                    backgroundColor: "#aaa",
                  },
                ]}
                onPress={handleBackendPayment}
                disabled={!backendAvailable || processingPayment}
              >
                {processingPayment ? (
                  <ActivityIndicator color="#FFF" />
                ) : !backendAvailable ? (
                  <>
                    <Ionicons name="warning" size={20} color="#FFF" />
                    <Text style={styles.paymentButtonText}>
                      Service indisponible
                    </Text>
                  </>
                ) : (
                  <>
                    <Ionicons name="card" size={20} color="#FFF" />
                    <Text style={styles.paymentButtonText}>
                      Payer 1000 FCFA
                    </Text>
                  </>
                )}
              </TouchableOpacity>

              {!backendAvailable && (
                <View style={styles.warningBox}>
                  <Ionicons
                    name="information-circle"
                    size={16}
                    color="#E67E22"
                  />
                  <Text style={styles.warningText}>
                    Le service de paiement est temporairement indisponible
                  </Text>
                </View>
              )}

              <View style={styles.paymentMethodsPreview}>
                <Text style={styles.paymentMethodsTitle}>
                  Paiements sécurisés:
                </Text>
                <View style={styles.paymentMethodsIcons}>
                  <Text style={styles.paymentMethodPreview}>📱 MTN Money</Text>
                  <Text style={styles.paymentMethodPreview}>
                    🍊 Orange Money
                  </Text>
                </View>
              </View>

              <View style={styles.securityBadge}>
                <Ionicons name="shield-checkmark" size={14} color="#27AE60" />
                <Text style={styles.securityTextSmall}>
                  Sécurisé par NotchPay
                </Text>
              </View>

              <View style={styles.featuresList}>
                <View style={styles.featureItem}>
                  <Ionicons name="checkmark-circle" size={16} color="#27AE60" />
                  <Text style={styles.featureText}>6 cultures détaillées</Text>
                </View>
                <View style={styles.featureItem}>
                  <Ionicons name="checkmark-circle" size={16} color="#27AE60" />
                  <Text style={styles.featureText}>Photos exclusives</Text>
                </View>
                <View style={styles.featureItem}>
                  <Ionicons name="checkmark-circle" size={16} color="#27AE60" />
                  <Text style={styles.featureText}>Vidéos traditionnelles</Text>
                </View>
                <View style={styles.featureItem}>
                  <Ionicons name="checkmark-circle" size={16} color="#27AE60" />
                  <Text style={styles.featureText}>Accès à vie</Text>
                </View>
              </View>
            </View>
          </View>
        ) : (
          <View style={styles.premiumSection}>
            <View style={styles.premiumCard}>
              <View style={styles.premiumBadge}>
                <Ionicons name="star" size={24} color="#FFD700" />
              </View>
              <Text style={styles.premiumTitle}>Vous êtes Premium !</Text>
              <Text style={styles.premiumDescription}>
                Profitez de l'accès complet à toutes les cultures du Cameroun.
              </Text>
              <TouchableOpacity
                style={styles.paymentButton}
                onPress={() => router.push("/cultures-premium")}
              >
                <Ionicons name="arrow-forward" size={20} color="#FFF" />
                <Text style={styles.paymentButtonText}>
                  Accéder aux cultures
                </Text>
              </TouchableOpacity>
            </View>
          </View>
        )}

        {/* News List */}
        <View style={styles.newsSection}>
          <View style={styles.sectionHeader}>
            <Text style={styles.sectionTitle}>Dernières actualités</Text>
            <TouchableOpacity style={styles.seeAllButton}>
              <Text style={styles.seeAllText}>Tout voir</Text>
              <Ionicons name="chevron-forward" size={16} color="#8B0000" />
            </TouchableOpacity>
          </View>

          <FlatList
            data={newsData}
            renderItem={renderItem}
            keyExtractor={(item) => item.id}
            scrollEnabled={false}
            contentContainerStyle={styles.listContent}
          />
        </View>

        {/* Quick Actions */}
        <View style={styles.actionsSection}>
          <Text style={styles.sectionTitle}>Explorer</Text>
          <View style={styles.actionsGrid}>
            <TouchableOpacity style={styles.actionButton}>
              <Ionicons name="map" size={24} color="#8B0000" />
              <Text style={styles.actionText}>Cartes</Text>
            </TouchableOpacity>
            <TouchableOpacity style={styles.actionButton}>
              <Ionicons name="calendar" size={24} color="#8B0000" />
              <Text style={styles.actionText}>Événements</Text>
            </TouchableOpacity>
            <TouchableOpacity style={styles.actionButton}>
              <Ionicons name="restaurant" size={24} color="#8B0000" />
              <Text style={styles.actionText}>Cuisine</Text>
            </TouchableOpacity>
            <TouchableOpacity style={styles.actionButton}>
              <Ionicons name="musical-notes" size={24} color="#8B0000" />
              <Text style={styles.actionText}>Danses</Text>
            </TouchableOpacity>
          </View>
        </View>
      </ScrollView>

      {renderPaymentModal()}
    </ImageBackground>
  );
}

const styles = StyleSheet.create({
  background: {
    flex: 1,
  },
  scrollContainer: {
    flexGrow: 1,
    padding: 20,
  },
  loadingContainer: {
    flex: 1,
    justifyContent: "center",
    alignItems: "center",
    backgroundColor: "#FFF8DC",
  },
  loadingText: {
    marginTop: 10,
    fontSize: 16,
    color: "#8B0000",
  },
  header: {
    marginBottom: 30,
    alignItems: "center",
  },
  headerContent: {
    alignItems: "center",
    backgroundColor: "rgba(255, 255, 240, 0.95)",
    padding: 20,
    borderRadius: 20,
    width: Dimensions.get("window").width - 40,
    shadowColor: "#000",
    shadowOffset: { width: 0, height: 4 },
    shadowOpacity: 0.3,
    shadowRadius: 8,
    elevation: 8,
  },
  appTitle: {
    fontSize: 36,
    fontWeight: "800",
    color: "#8B0000",
    marginBottom: 5,
    textAlign: "center",
  },
  subtitle: {
    fontSize: 16,
    fontWeight: "600",
    color: "#4B0082",
    marginBottom: 15,
    textAlign: "center",
  },
  statsContainer: {
    flexDirection: "row",
    justifyContent: "center",
    gap: 20,
  },
  statItem: {
    flexDirection: "row",
    alignItems: "center",
    gap: 5,
  },
  statText: {
    fontSize: 14,
    color: "#333",
    fontWeight: "500",
  },
  premiumBadgeHeader: {
    flexDirection: "row",
    alignItems: "center",
    backgroundColor: "#8B0000",
    paddingHorizontal: 12,
    paddingVertical: 6,
    borderRadius: 15,
    marginTop: 10,
  },
  premiumBadgeText: {
    color: "#FFD700",
    fontWeight: "700",
    fontSize: 12,
    marginLeft: 5,
  },
  featuredSection: {
    marginBottom: 30,
  },
  sectionTitle: {
    fontSize: 22,
    fontWeight: "700",
    color: "#8B0000",
    marginBottom: 15,
  },
  featuredCard: {
    backgroundColor: "rgba(139, 0, 0, 0.9)",
    borderRadius: 15,
    padding: 20,
    position: "relative",
    shadowColor: "#000",
    shadowOffset: { width: 0, height: 4 },
    shadowOpacity: 0.4,
    shadowRadius: 8,
    elevation: 8,
  },
  featuredBadge: {
    position: "absolute",
    top: -10,
    right: 20,
    backgroundColor: "#FFD700",
    paddingHorizontal: 12,
    paddingVertical: 4,
    borderRadius: 12,
  },
  featuredBadgeText: {
    fontSize: 12,
    fontWeight: "700",
    color: "#8B0000",
  },
  featuredTitle: {
    fontSize: 20,
    fontWeight: "700",
    color: "#FFF",
    marginBottom: 8,
  },
  featuredDescription: {
    fontSize: 14,
    color: "rgba(255, 255, 255, 0.9)",
    lineHeight: 20,
  },
  premiumSection: {
    marginBottom: 30,
  },
  premiumCard: {
    backgroundColor: "rgba(255, 255, 240, 0.95)",
    borderRadius: 20,
    padding: 25,
    alignItems: "center",
    shadowColor: "#000",
    shadowOffset: { width: 0, height: 4 },
    shadowOpacity: 0.3,
    shadowRadius: 8,
    elevation: 8,
    borderWidth: 2,
    borderColor: "#FFD700",
    position: "relative",
  },
  premiumBadge: {
    position: "absolute",
    top: -15,
    alignSelf: "center",
    backgroundColor: "#8B0000",
    padding: 10,
    borderRadius: 50,
    borderWidth: 3,
    borderColor: "#FFD700",
  },
  premiumTitle: {
    fontSize: 24,
    fontWeight: "800",
    color: "#8B0000",
    marginTop: 20,
    marginBottom: 10,
    textAlign: "center",
  },
  premiumDescription: {
    fontSize: 16,
    color: "#333",
    textAlign: "center",
    lineHeight: 22,
    marginBottom: 20,
  },
  pricingContainer: {
    flexDirection: "row",
    alignItems: "center",
    marginBottom: 20,
    position: "relative",
  },
  originalPrice: {
    fontSize: 18,
    color: "#999",
    textDecorationLine: "line-through",
    marginRight: 10,
  },
  discountedPrice: {
    fontSize: 28,
    fontWeight: "800",
    color: "#27AE60",
  },
  discountBadge: {
    position: "absolute",
    right: -50,
    top: -10,
    backgroundColor: "#E74C3C",
    paddingHorizontal: 8,
    paddingVertical: 2,
    borderRadius: 8,
  },
  discountText: {
    fontSize: 12,
    fontWeight: "700",
    color: "#FFF",
  },
  paymentButton: {
    backgroundColor: "#27AE60",
    flexDirection: "row",
    alignItems: "center",
    justifyContent: "center",
    paddingVertical: 15,
    paddingHorizontal: 30,
    borderRadius: 50,
    width: "100%",
    marginBottom: 20,
    shadowColor: "#000",
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.3,
    shadowRadius: 4,
    elevation: 4,
  },
  paymentButtonText: {
    fontSize: 18,
    fontWeight: "700",
    color: "#FFF",
    marginLeft: 10,
  },
  warningBox: {
    flexDirection: "row",
    alignItems: "center",
    backgroundColor: "rgba(230, 126, 34, 0.1)",
    padding: 12,
    borderRadius: 10,
    marginBottom: 15,
    borderWidth: 1,
    borderColor: "rgba(230, 126, 34, 0.3)",
  },
  warningText: {
    fontSize: 12,
    color: "#E67E22",
    fontWeight: "500",
    marginLeft: 8,
    flex: 1,
  },
  featuresList: {
    width: "100%",
  },
  featureItem: {
    flexDirection: "row",
    alignItems: "center",
    marginBottom: 10,
    paddingHorizontal: 10,
  },
  featureText: {
    fontSize: 14,
    color: "#333",
    marginLeft: 10,
    fontWeight: "500",
  },
  newsSection: {
    marginBottom: 30,
  },
  sectionHeader: {
    flexDirection: "row",
    justifyContent: "space-between",
    alignItems: "center",
    marginBottom: 15,
  },
  seeAllButton: {
    flexDirection: "row",
    alignItems: "center",
    gap: 4,
  },
  seeAllText: {
    fontSize: 14,
    color: "#8B0000",
    fontWeight: "600",
  },
  listContent: {
    paddingBottom: 10,
  },
  card: {
    backgroundColor: "rgba(255, 255, 240, 0.95)",
    borderRadius: 15,
    padding: 18,
    marginBottom: 15,
    shadowColor: "#000",
    shadowOffset: { width: 0, height: 3 },
    shadowOpacity: 0.25,
    shadowRadius: 6,
    elevation: 6,
    borderLeftWidth: 4,
    borderLeftColor: "#8B0000",
  },
  cardHeader: {
    flexDirection: "row",
    justifyContent: "space-between",
    alignItems: "center",
    marginBottom: 10,
  },
  categoryBadge: {
    paddingHorizontal: 10,
    paddingVertical: 4,
    borderRadius: 12,
  },
  categoryText: {
    fontSize: 12,
    fontWeight: "700",
    color: "#FFF",
  },
  dateText: {
    fontSize: 12,
    color: "#666",
    fontWeight: "500",
  },
  cardTitle: {
    fontSize: 17,
    fontWeight: "700",
    color: "#8B0000",
    marginBottom: 8,
    lineHeight: 22,
  },
  cardDescription: {
    fontSize: 14,
    color: "#333",
    lineHeight: 20,
    marginBottom: 12,
  },
  cardFooter: {
    flexDirection: "row",
    alignItems: "center",
    gap: 6,
  },
  readTime: {
    fontSize: 12,
    color: "#666",
    fontWeight: "500",
  },
  actionsSection: {
    marginBottom: 20,
  },
  actionsGrid: {
    flexDirection: "row",
    justifyContent: "space-between",
    flexWrap: "wrap",
    gap: 15,
  },
  actionButton: {
    backgroundColor: "rgba(255, 255, 240, 0.95)",
    borderRadius: 15,
    padding: 20,
    alignItems: "center",
    justifyContent: "center",
    shadowColor: "#000",
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.2,
    shadowRadius: 4,
    elevation: 4,
  },
  actionText: {
    marginTop: 8,
    fontSize: 14,
    fontWeight: "600",
    color: "#8B0000",
    textAlign: "center",
  },
  // Styles pour le modal de paiement
  modalOverlay: {
    flex: 1,
    backgroundColor: "rgba(0, 0, 0, 0.5)",
    justifyContent: "center",
    alignItems: "center",
  },
  modalContent: {
    backgroundColor: "#FFF8DC",
    borderRadius: 20,
    padding: 25,
    width: Dimensions.get("window").width - 40,
    maxHeight: Dimensions.get("window").height - 100,
  },
  modalHeader: {
    flexDirection: "row",
    justifyContent: "space-between",
    alignItems: "center",
    marginBottom: 15,
  },
  modalTitle: {
    fontSize: 22,
    fontWeight: "700",
    color: "#8B0000",
  },
  closeButton: {
    padding: 5,
  },
  modalDescription: {
    fontSize: 14,
    color: "#333",
    marginBottom: 20,
    lineHeight: 20,
  },
  phoneInputContainer: {
    marginBottom: 20,
  },
  inputLabel: {
    fontSize: 14,
    fontWeight: "600",
    color: "#8B0000",
    marginBottom: 8,
  },
  phoneInput: {
    borderWidth: 1,
    borderColor: "#8B0000",
    borderRadius: 10,
    paddingHorizontal: 15,
    height: 50,
    backgroundColor: "#FFF",
    fontSize: 16,
  },
  phoneHint: {
    fontSize: 12,
    color: "#666",
    marginTop: 5,
    fontStyle: "italic",
  },
  paymentMethods: {
    marginBottom: 20,
  },
  paymentMethodButton: {
    flexDirection: "row",
    alignItems: "center",
    backgroundColor: "#FFF",
    borderRadius: 12,
    padding: 15,
    marginBottom: 10,
    borderWidth: 1,
    borderColor: "#E0E0E0",
  },
  paymentMethodIcon: {
    fontSize: 24,
    marginRight: 15,
  },
  paymentMethodInfo: {
    flex: 1,
  },
  paymentMethodName: {
    fontSize: 16,
    fontWeight: "600",
    color: "#333",
  },
  paymentMethodAmount: {
    fontSize: 14,
    color: "#8B0000",
    fontWeight: "700",
  },
  securityNotice: {
    flexDirection: "row",
    alignItems: "center",
    justifyContent: "center",
    marginTop: 15,
    padding: 10,
    backgroundColor: "rgba(39, 174, 96, 0.1)",
    borderRadius: 8,
  },
  securityText: {
    fontSize: 12,
    color: "#27AE60",
    fontWeight: "600",
    marginLeft: 5,
  },
  paymentInstructions: {
    marginTop: 15,
    padding: 15,
    backgroundColor: "rgba(139, 0, 0, 0.05)",
    borderRadius: 10,
  },
  instructionsTitle: {
    fontSize: 14,
    fontWeight: "600",
    color: "#8B0000",
    marginBottom: 8,
  },
  instructionsText: {
    fontSize: 12,
    color: "#333",
    lineHeight: 18,
  },
  paymentMethodsPreview: {
    marginBottom: 15,
    alignItems: "center",
  },
  paymentMethodsTitle: {
    fontSize: 12,
    color: "#666",
    marginBottom: 8,
  },
  paymentMethodsIcons: {
    flexDirection: "row",
    gap: 15,
  },
  paymentMethodPreview: {
    fontSize: 12,
    color: "#8B0000",
    fontWeight: "500",
  },
  securityBadge: {
    flexDirection: "row",
    alignItems: "center",
    justifyContent: "center",
    marginTop: 10,
  },
  securityTextSmall: {
    fontSize: 10,
    color: "#27AE60",
    fontWeight: "500",
    marginLeft: 3,
  },
});
