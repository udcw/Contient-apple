// @ts-ignore
import { supabase } from "@/lib/supabase";
import {
  checkAvailibitity,
  getErrorMessage,
  getPaymentInfo,
  makePayment,
} from "@/services/maviance/services";
import { Ionicons, MaterialIcons, FontAwesome5 } from "@expo/vector-icons";
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
  Image,
} from "react-native";

// Méthodes de paiement supportées
const PAYMENT_METHODS = [
  { id: "mtn", name: "MTN Mobile Money", icon: "" },
  { id: "orange", name: "Orange Money", icon: "" },
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

// Données des 3 cultures gratuites
const FREE_CULTURES = [
  {
    id: "1",
    name: "Les Bamiléké",
    region: "Région de l'Ouest",
    population: "≈ 3 millions",
    language: "Bamiléké (langues bamiléké)",
    shortDescription: "Royaumes célèbres pour leurs chefferies et l'art de la perle",
    features: [
      "Architecture des chefferies",
      "Tissage et perlage",
      "Danses masquées",
      "Cérémonies d'initiation"
    ],
    color: "#8B0000",
    icon: "🏛️",
    image: require("@/assets/images/1.jpeg")
  },
  {
    id: "2",
    name: "Les Sawa",
    region: "Littoral (Douala, Édéa)",
    population: "≈ 2.5 millions",
    language: "Duala, Malimba, Bakoko",
    shortDescription: "Peuple côtier, gardiens des traditions maritimes et du Ngondo",
    features: [
      "Festival Ngondo",
      "Cuisine à base de poisson",
      "Migrations ancestrales",
      "Rites d'eau"
    ],
    color: "#0066CC",
    icon: "🌊",
    image: require("@/assets/images/onboarding2.jpg")
  },
  {
    id: "3",
    name: "Les Peuls (Fulbé)",
    region: "Extrême-Nord, Nord, Adamaoua",
    population: "≈ 4 millions",
    language: "Fulfuldé",
    shortDescription: "Éleveurs nomades célèbres pour leur littérature orale et code vestimentaire",
    features: [
      "Élevage transhumant",
      "Poésie et musique",
      "Habillement distinctif",
      "Savoir pastoral"
    ],
    color: "#228B22",
    icon: "🐄",
    image: require("@/assets/images/onboarding3.jpg")
  }
];

// Données des inventions et découvertes Continentises
const INVENTIONS = [
  {
    id: "1",
    title: "Piano numérique Njock",
    description: "Piano électronique inventé par le Continentis Jean-Claude Njock",
    year: "1980",
    category: "Musique",
    icon: "🎹"
  },
  {
    id: "2",
    title: "Foyer amélioré",
    description: "Foyer économe en bois inventé par le Dr. Thomas Ngijol",
    year: "1995",
    category: "Énergie",
    icon: "🔥"
  },
  {
    id: "3",
    title: "Plante médicinale Prunus africana",
    description: "Découverte des propriétés thérapeutiques contre les troubles prostatiques",
    year: "1970",
    category: "Médecine",
    icon: "🌿"
  },
  {
    id: "4",
    title: "Système d'irrigation goutte-à-goutte",
    description: "Adaptation innovante pour les zones arides du Nord",
    year: "2005",
    category: "Agriculture",
    icon: "💧"
  }
];

// Données des métiers traditionnels
const TRADITIONAL_JOBS = [
  {
    id: "1",
    name: "Forgeron Bamiléké",
    description: "Maîtrise du fer et création d'outils agricoles",
    region: "Ouest",
   
  },
  {
    id: "2",
    name: "Pêcheur Sawa",
    description: "Techniques de pêche traditionnelles en pirogue",
    region: "Littoral",
    
  },
  {
    id: "3",
    name: "Potière Bamoun",
    description: "Art de la poterie avec des motifs traditionnels",
    region: "Ouest",
    
  },
  {
    id: "4",
    name: "Tisseur de raphia",
    description: "Tissage du raphia pour vêtements et décorations",
    region: "Centre",
    
  }
];

// Contenu premium verrouillé
const PREMIUM_CONTENT = [
  {
    id: "1",
    title: "Mets Traditionnels",
    description: "Recettes authentiques avec vidéos de préparation",
    icon: "restaurant",
    color: "#E67E22",
    items: ["Ndolè", "Eru", "Koki", "Achu", "Nkui"]
  },
  {
    id: "2",
    title: "Alphabets Locaux",
    description: "Apprenez à lire et écrire les langues Continentises",
    icon: "language",
    color: "#2980B9",
    items: ["Bassa", "Bamoun", "Ewondo", "Fulfuldé", "Duala"]
  },
  {
    id: "3",
    title: "Proverbes & Sagesse",
    description: "500+ proverbes avec explications et audio",
    icon: "chatbubble-ellipses",
    color: "#27AE60",
    items: ["Proverbes Bamiléké", "Sagesse Peule", "Paroles Sawa", "Maximes Béti"]
  },
  {
    id: "4",
    title: "Histoire Complète",
    description: "De la préhistoire à l'époque contemporaine",
    icon: "book",
    color: "#9B59B6",
    items: ["Royaumes anciens", "Colonisation", "Indépendance", "Époque moderne"]
  },
  {
    id: "5",
    title: "Audio & Prononciation",
    description: "Enregistrements audio par des locuteurs natifs",
    icon: "volume-high",
    color: "#8B0000",
    items: ["Dialogues", "Chants", "Contes", "Prononciation"]
  },
  {
    id: "6",
    title: "Documentaires Exclusifs",
    description: "Vidéos HD sur les traditions vivantes",
    icon: "videocam",
    color: "#34495E",
    items: ["Cérémonies", "Festivals", "Rites", "Artisanat"]
  }
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
  const [selectedCulture, setSelectedCulture] = useState<any>(null);

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
    const maxAttempts = 60;
    const interval = setInterval(async () => {
      const paymentInfo = await getPaymentInfo(ptn);
      const paymentArray = paymentInfo.responseData as unknown as Array<
        Record<string, unknown>
      >;
      const status = paymentArray[0]?.status as string;
      const errorCode = paymentArray[0]?.errorCode as number;

      if (status != "PENDING") {
        if (status === "SUCCESS") {
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
          "Le paiement n'a pas été confirmé dans le délai imparti."
        );
      }
    }, 3000);
  };

  const renderCultureItem = ({ item }: { item: any }) => {
    return (
      <TouchableOpacity 
        style={[styles.cultureCard, { borderLeftColor: item.color }]}
        onPress={() => setSelectedCulture(item)}
      >
        <View style={styles.cultureHeader}>
          <Text style={[styles.cultureIcon, { fontSize: 28 }]}>{item.icon}</Text>
          <View style={styles.cultureTitleContainer}>
            <Text style={styles.cultureName}>{item.name}</Text>
            <Text style={styles.cultureRegion}>{item.region}</Text>
          </View>
        </View>
        
        <Text style={styles.cultureShortDesc}>{item.shortDescription}</Text>
        
        <View style={styles.cultureStats}>
          <View style={styles.stat}>
            <Ionicons name="people" size={14} color="#666" />
            <Text style={styles.statText}>{item.population}</Text>
          </View>
          <View style={styles.stat}>
            <Ionicons name="chatbubble" size={14} color="#666" />
            <Text style={styles.statText}>{item.language}</Text>
          </View>
        </View>
        
        <View style={styles.featuresContainer}>
          {item.features.slice(0, 2).map((feature: string, index: number) => (
            <View key={index} style={styles.featureTag}>
              <Ionicons name="checkmark" size={12} color="#27AE60" />
              <Text style={styles.featureTagText}>{feature}</Text>
            </View>
          ))}
        </View>
        
        <TouchableOpacity 
          style={styles.exploreButton}
          onPress={() => setSelectedCulture(item)}
        >
          <Text style={styles.exploreButtonText}>Explorer</Text>
          <Ionicons name="arrow-forward" size={16} color="#8B0000" />
        </TouchableOpacity>
      </TouchableOpacity>
    );
  };

  const renderInventionItem = ({ item }: { item: any }) => {
    return (
      <View style={styles.inventionCard}>
        <View style={styles.inventionIconContainer}>
          <Text style={styles.inventionIcon}>{item.icon}</Text>
        </View>
        <Text style={styles.inventionCategory}>{item.category}</Text>
        <Text style={styles.inventionTitle}>{item.title}</Text>
        <Text style={styles.inventionDescription}>{item.description}</Text>
        <View style={styles.inventionYear}>
          <Ionicons name="time" size={12} color="#8B0000" />
          <Text style={styles.yearText}>{item.year}</Text>
        </View>
      </View>
    );
  };

  const renderJobItem = ({ item }: { item: any }) => {
    return (
      <View style={styles.jobCard}>
        <Text style={styles.jobIcon}>{item.icon}</Text>
        <Text style={styles.jobName}>{item.name}</Text>
        <Text style={styles.jobDescription}>{item.description}</Text>
        <View style={styles.jobRegion}>
          <Ionicons name="location" size={12} color="#8B0000" />
          <Text style={styles.regionText}>{item.region}</Text>
        </View>
      </View>
    );
  };

  const renderPremiumItem = ({ item }: { item: any }) => {
    return (
      <TouchableOpacity 
        style={styles.premiumContentCard}
        onPress={() => {
          if (!isPremium) {
            handleBackendPayment();
          } else {
            // Navigation vers la page premium avec le contenu spécifique
            router.push({
              pathname: "/cultures-premium",
              params: { contentId: item.id }
            });
          }
        }}
      >
        <View style={[styles.premiumIconContainer, { backgroundColor: item.color + '20' }]}>
          <Ionicons name={item.icon as any} size={28} color={item.color} />
        </View>
        <Text style={styles.premiumContentTitle}>{item.title}</Text>
        <Text style={styles.premiumContentDescription}>{item.description}</Text>
        
        <View style={styles.premiumItemsContainer}>
          {item.items.slice(0, 3).map((subItem: string, index: number) => (
            <Text key={index} style={styles.premiumItemText}>• {subItem}</Text>
          ))}
          {item.items.length > 3 && (
            <Text style={styles.moreItemsText}>+ {item.items.length - 3} autres</Text>
          )}
        </View>
        
        {!isPremium && (
          <View style={styles.lockOverlay}>
            <Ionicons name="lock-closed" size={24} color="#FFF" />
            <Text style={styles.lockText}>Premium</Text>
          </View>
        )}
      </TouchableOpacity>
    );
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
            Accédez à tout le contenu culturel du Cameroun
          </Text>

          <View style={styles.phoneInputContainer}>
            <Text style={styles.inputLabel}>Numéro de téléphone</Text>
            <TextInput
              style={styles.phoneInput}
              placeholder="6XX XXX XXX"
              placeholderTextColor="#999"
              value={phoneNumber}
              onChangeText={setPhoneNumber}
              keyboardType="phone-pad"
              autoFocus={true}
              selectionColor="#8B0000"
            />
            <Text style={styles.phoneHint}>
              Entrez votre numéro MTN ou Orange Money
            </Text>
          </View>

          <Text style={styles.amountLabel}>Montant à payer</Text>
          <Text style={styles.amountValue}>1000 FCFA</Text>
          
          <Text style={styles.methodsLabel}>Choisissez votre opérateur</Text>
          
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
                <View style={styles.paymentMethodIconContainer}>
                  {method.id === "mtn" ? (
                    <Ionicons name="phone-portrait" size={24} color="#FFCC00" />
                  ) : (
                    <Ionicons name="phone-portrait" size={24} color="#FF6600" />
                  )}
                </View>
                <View style={styles.paymentMethodInfo}>
                  <Text style={styles.paymentMethodName}>{method.name}</Text>
                  <Text style={styles.paymentMethodHint}>
                    {method.id === "mtn" ? "Commence par 6" : "Commence par 6 ou 7"}
                  </Text>
                </View>
                {processingPayment && selectedMethod === method.id && (
                  <ActivityIndicator size="small" color="#8B0000" />
                )}
              </TouchableOpacity>
            ))}
          </View>

          <View style={styles.securityNotice}>
            <Ionicons name="shield-checkmark" size={20} color="#27AE60" />
            <Text style={styles.securityText}>
              Paiement 100% sécurisé par Maviance
            </Text>
          </View>

          <View style={styles.paymentInstructions}>
            <Text style={styles.instructionsTitle}>Comment procéder :</Text>
            <View style={styles.instructionStep}>
              <Text style={styles.instructionNumber}>1</Text>
              <Text style={styles.instructionText}>Choisissez votre opérateur</Text>
            </View>
            <View style={styles.instructionStep}>
              <Text style={styles.instructionNumber}>2</Text>
              <Text style={styles.instructionText}>Entrez votre numéro de téléphone</Text>
            </View>
            <View style={styles.instructionStep}>
              <Text style={styles.instructionNumber}>3</Text>
              <Text style={styles.instructionText}>Confirmez le paiement sur votre mobile</Text>
            </View>
            <View style={styles.instructionStep}>
              <Text style={styles.instructionNumber}>4</Text>
              <Text style={styles.instructionText}>Attendez la confirmation automatique</Text>
            </View>
          </View>

          <TouchableOpacity
            style={styles.cancelButton}
            onPress={() => setShowPaymentModal(false)}
          >
            <Text style={styles.cancelButtonText}>Annuler</Text>
          </TouchableOpacity>
        </View>
      </View>
    </Modal>
  );

  const renderCultureDetailModal = () => (
    <Modal
      visible={!!selectedCulture}
      animationType="slide"
      transparent={true}
      onRequestClose={() => setSelectedCulture(null)}
    >
      <View style={styles.cultureModalOverlay}>
        <View style={styles.cultureModalContent}>
          <ScrollView>
            <View style={styles.cultureModalHeader}>
              <Text style={styles.cultureModalTitle}>{selectedCulture?.name}</Text>
              <TouchableOpacity
                onPress={() => setSelectedCulture(null)}
                style={styles.cultureCloseButton}
              >
                <Ionicons name="close" size={24} color="#8B0000" />
              </TouchableOpacity>
            </View>
            
            <View style={styles.cultureDetailContent}>
              <View style={styles.cultureHero}>
                <Text style={[styles.cultureIconLarge, { fontSize: 50 }]}>
                  {selectedCulture?.icon}
                </Text>
                <View>
                  <Text style={styles.cultureModalRegion}>{selectedCulture?.region}</Text>
                  <Text style={styles.cultureModalPopulation}>{selectedCulture?.population}</Text>
                </View>
              </View>
              
              <Text style={styles.cultureDetailDescription}>
                {selectedCulture?.shortDescription}
              </Text>
              
              <View style={styles.cultureFeatures}>
                <Text style={styles.sectionSubtitle}>Caractéristiques</Text>
                {selectedCulture?.features.map((feature: string, index: number) => (
                  <View key={index} style={styles.featureDetailItem}>
                    <Ionicons name="checkmark-circle" size={18} color="#27AE60" />
                    <Text style={styles.featureDetailText}>{feature}</Text>
                  </View>
                ))}
              </View>
              
              {!isPremium && (
                <TouchableOpacity 
                  style={styles.upgradePrompt}
                  onPress={() => {
                    setSelectedCulture(null);
                    handleBackendPayment();
                  }}
                >
                  <Ionicons name="lock-open" size={24} color="#FFF" />
                  <View style={styles.upgradePromptContent}>
                    <Text style={styles.upgradePromptTitle}>Débloquer le contenu complet</Text>
                    <Text style={styles.upgradePromptSubtitle}>
                      Accédez aux recettes, proverbes, audio et vidéos
                    </Text>
                  </View>
                  <Ionicons name="arrow-forward" size={20} color="#FFF" />
                </TouchableOpacity>
              )}
            </View>
          </ScrollView>
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
    <ScrollView style={styles.container} showsVerticalScrollIndicator={false}>
      {/* Header avec image de fond */}
      <ImageBackground
        source={require("@/assets/images/1.jpeg")}
        style={styles.headerBackground}
        imageStyle={styles.headerImage}
      >
        <View style={styles.headerOverlay}>
          <View style={styles.headerContent}>
            <Text style={styles.appTitle}>Continent</Text>
            <Text style={styles.appSubtitle}>Le Panthéon Culturel du Cameroun</Text>
            <Text style={styles.appDescription}>
              Découvrez la richesse des 250 ethnies, leur histoire, leurs traditions et leurs innovations
            </Text>
            
            <View style={styles.headerStats}>
              <View style={styles.statCard}>
                <Text style={styles.statNumber}>250+</Text>
                <Text style={styles.statLabel}>Ethnies</Text>
              </View>
              <View style={styles.statCard}>
                <Text style={styles.statNumber}>280+</Text>
                <Text style={styles.statLabel}>Langues</Text>
              </View>
              <View style={styles.statCard}>
                <Text style={styles.statNumber}>∞</Text>
                <Text style={styles.statLabel}>Traditions</Text>
              </View>
            </View>
            
            {user && isPremium && (
              <View style={styles.premiumBadgeHeader}>
                <Ionicons name="star" size={16} color="#FFD700" />
                <Text style={styles.premiumBadgeText}>Compte Premium Actif</Text>
              </View>
            )}
          </View>
        </View>
      </ImageBackground>

      {/* Section Cultures Gratuites */}
      <View style={styles.section}>
        <View style={styles.sectionHeader}>
          <View style={styles.sectionTitleContainer}>
            <Ionicons name="people" size={24} color="#8B0000" />
            <Text style={styles.sectionTitle}>Cultures Continentises</Text>
          </View>
          <Text style={styles.sectionSubtitle}>
            Explorez 3 cultures gratuitement
          </Text>
        </View>
        
        <FlatList
          data={FREE_CULTURES}
          renderItem={renderCultureItem}
          keyExtractor={(item) => item.id}
          horizontal
          showsHorizontalScrollIndicator={false}
          contentContainerStyle={styles.culturesList}
        />
        
       
      </View>

      {/* Section Histoire du Cameroun */}
      <View style={styles.section}>
        <View style={styles.sectionHeader}>
          <View style={styles.sectionTitleContainer}>
            <Ionicons name="book" size={24} color="#2980B9" />
            <Text style={styles.sectionTitle}>Histoire du Cameroun</Text>
          </View>
        </View>
        
        <View style={styles.historyCard}>
          <View style={styles.historyTimeline}>
            <View style={styles.timelineItem}>
              <View style={styles.timelineDot} />
              <Text style={styles.timelineYear}>1884</Text>
              <Text style={styles.timelineText}>Protectorat allemand</Text>
            </View>
            <View style={styles.timelineItem}>
              <View style={styles.timelineDot} />
              <Text style={styles.timelineYear}>1916</Text>
              <Text style={styles.timelineText}>Partage franco-britannique</Text>
            </View>
            <View style={styles.timelineItem}>
              <View style={styles.timelineDot} />
              <Text style={styles.timelineYear}>1960</Text>
              <Text style={styles.timelineText}>Indépendance</Text>
            </View>
            <View style={styles.timelineItem}>
              <View style={styles.timelineDot} />
              <Text style={styles.timelineYear}>1972</Text>
              <Text style={styles.timelineText}>République Unie</Text>
            </View>
          </View>
          
          <Text style={styles.historyDescription}>
            De la civilisation Sao (VIe siècle av. J.-C.) aux royaumes Bamoun, Bamiléké et Duala, 
            le Cameroun a une histoire riche et complexe. Colonisé d'abord par les Allemands, 
            puis partagé entre Français et Britanniques, le pays a acquis son indépendance en 1960.
          </Text>
          
         
        </View>
      </View>

      {/* Section Inventions & Découvertes */}
      <View style={styles.section}>
        <View style={styles.sectionHeader}>
          <View style={styles.sectionTitleContainer}>
            <Ionicons name="bulb" size={24} color="#E67E22" />
            <Text style={styles.sectionTitle}>Inventions & Découvertes</Text>
          </View>
          <Text style={styles.sectionSubtitle}>
            Innovations Continentises qui ont marqué le monde
          </Text>
        </View>
        
        <FlatList
          data={INVENTIONS}
          renderItem={renderInventionItem}
          keyExtractor={(item) => item.id}
          horizontal
          showsHorizontalScrollIndicator={false}
          contentContainerStyle={styles.inventionsList}
        />
      </View>

      {/* Section Métiers Traditionnels */}
      <View style={styles.section}>
        <View style={styles.sectionHeader}>
          <View style={styles.sectionTitleContainer}>
            <FontAwesome5 name="tools" size={22} color="#27AE60" />
            <Text style={styles.sectionTitle}>Métiers Traditionnels</Text>
          </View>
        </View>
        
        <FlatList
          data={TRADITIONAL_JOBS}
          renderItem={renderJobItem}
          keyExtractor={(item) => item.id}
          horizontal
          showsHorizontalScrollIndicator={false}
          contentContainerStyle={styles.jobsList}
        />
      </View>

      {/* Section Contenu Premium */}
      <View style={styles.section}>
        <View style={styles.sectionHeader}>
          <View style={styles.sectionTitleContainer}>
            <Ionicons name="diamond" size={24} color="#FFD700" />
            <Text style={styles.sectionTitle}>Contenu Premium Exclusif</Text>
          </View>
          <Text style={styles.sectionSubtitle}>
            Débloquez l'accès complet avec audio, vidéo et documents
          </Text>
        </View>
        
        <View style={styles.premiumGrid}>
          {PREMIUM_CONTENT.map((item) => (
            <View key={item.id} style={styles.premiumGridItem}>
              <TouchableOpacity 
                style={[
                  styles.premiumContentCard,
                  !isPremium && styles.premiumContentCardLocked
                ]}
                onPress={() => {
                  if (!isPremium) {
                    handleBackendPayment();
                  } else {
                    router.push("/cultures-premium");
                  }
                }}
              >
                <View style={[styles.premiumIconContainer, { backgroundColor: item.color + '20' }]}>
                  <Ionicons name={item.icon as any} size={24} color={item.color} />
                </View>
                <Text style={styles.premiumContentTitle}>{item.title}</Text>
                <Text style={styles.premiumContentDescription}>{item.description}</Text>
                
                {!isPremium && (
                  <View style={styles.lockBadge}>
                    <Ionicons name="lock-closed" size={12} color="#FFF" />
                  </View>
                )}
              </TouchableOpacity>
            </View>
          ))}
        </View>
        
        {!isPremium ? (
          <View style={styles.premiumCTASection}>
            <View style={styles.premiumCTACard}>
              <View style={styles.premiumCTAHeader}>
                <Ionicons name="star" size={32} color="#FFD700" />
                <View>
                  <Text style={styles.premiumCTATitle}>Passez Premium</Text>
                  <Text style={styles.premiumCTASubtitle}>Accès illimité à tout le contenu</Text>
                </View>
              </View>
              
              <View style={styles.premiumFeatures}>
                <View style={styles.premiumFeatureItem}>
                  <Ionicons name="checkmark-circle" size={20} color="#27AE60" />
                  <Text style={styles.premiumFeatureText}>Toutes les cultures détaillées</Text>
                </View>
                <View style={styles.premiumFeatureItem}>
                  <Ionicons name="checkmark-circle" size={20} color="#27AE60" />
                  <Text style={styles.premiumFeatureText}>Audio des langues locales</Text>
                </View>
                <View style={styles.premiumFeatureItem}>
                  <Ionicons name="checkmark-circle" size={20} color="#27AE60" />
                  <Text style={styles.premiumFeatureText}>Vidéos documentaires HD</Text>
                </View>
                <View style={styles.premiumFeatureItem}>
                  <Ionicons name="checkmark-circle" size={20} color="#27AE60" />
                  <Text style={styles.premiumFeatureText}>Recettes traditionnelles</Text>
                </View>
              </View>
              
              <View style={styles.pricingSection}>
                <View style={styles.priceContainer}>
                  <Text style={styles.originalPrice}>2000 FCFA</Text>
                  <Text style={styles.discountedPrice}>1000 FCFA</Text>
                  <View style={styles.discountBadge}>
                    <Text style={styles.discountText}>-50%</Text>
                  </View>
                </View>
                
                <TouchableOpacity
                  style={[
                    styles.upgradeButton,
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
                      <Text style={styles.upgradeButtonText}>
                        Service indisponible
                      </Text>
                    </>
                  ) : (
                    <>
                      <Ionicons name="lock-open" size={20} color="#FFF" />
                      <Text style={styles.upgradeButtonText}>
                        Débloquer Premium - 1000 FCFA
                      </Text>
                    </>
                  )}
                </TouchableOpacity>
                
                <View style={styles.securityBadge}>
                  <Ionicons name="shield-checkmark" size={14} color="#27AE60" />
                  <Text style={styles.securityTextSmall}>
                    Paiement sécurisé par Maviance
                  </Text>
                </View>
              </View>
            </View>
          </View>
        ) : (
          <View style={styles.premiumActiveSection}>
            <View style={styles.premiumActiveCard}>
              <Ionicons name="star" size={40} color="#FFD700" />
              <Text style={styles.premiumActiveTitle}>Vous êtes Premium !</Text>
              <Text style={styles.premiumActiveSubtitle}>
                Profitez de l'accès complet à toutes les ressources
              </Text>
              <TouchableOpacity
                style={styles.accessButton}
                onPress={() => router.push("/cultures-premium")}
              >
                <Ionicons name="arrow-forward" size={20} color="#FFF" />
                <Text style={styles.accessButtonText}>
                  Accéder au contenu premium
                </Text>
              </TouchableOpacity>
            </View>
          </View>
        )}
      </View>

      {/* Footer */}
      <View style={styles.footer}>
        <Text style={styles.footerTitle}>Continent</Text>
        <Text style={styles.footerDescription}>
          Préservons et célébrons ensemble la richesse culturelle du Cameroun
        </Text>
        
       
        
        <Text style={styles.copyright}>
          © 2025 Continent. Tous droits réservés.
        </Text>
      </View>

      {renderPaymentModal()}
      {renderCultureDetailModal()}
    </ScrollView>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: "#F8F9FA",
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
  // Header Styles
  headerBackground: {
    height: 320,
    width: '100%',
  },
  headerImage: {
    opacity: 0.9,
  },
  headerOverlay: {
    flex: 1,
    backgroundColor: 'rgba(0, 0, 0, 0.5)',
    justifyContent: 'center',
    paddingHorizontal: 20,
  },
  headerContent: {
    alignItems: 'center',
  },
  appTitle: {
    fontSize: 48,
    fontWeight: "900",
    color: "#FFF",
    textShadowColor: 'rgba(0, 0, 0, 0.75)',
    textShadowOffset: {width: 2, height: 2},
    textShadowRadius: 5,
    marginBottom: 5,
  },
  appSubtitle: {
    fontSize: 18,
    fontWeight: "600",
    color: "#FFD700",
    marginBottom: 10,
  },
  appDescription: {
    fontSize: 14,
    color: "#FFF",
    textAlign: 'center',
    lineHeight: 20,
    marginBottom: 25,
    paddingHorizontal: 20,
  },
  headerStats: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    width: '100%',
    marginBottom: 20,
  },
  statCard: {
    alignItems: 'center',
    backgroundColor: 'rgba(255, 255, 255, 0.15)',
    padding: 15,
    borderRadius: 15,
    flex: 1,
    marginHorizontal: 5,
  },
  statNumber: {
    fontSize: 24,
    fontWeight: "800",
    color: "#FFD700",
  },
  statLabel: {
    fontSize: 12,
    color: "#FFF",
    marginTop: 5,
  },
  premiumBadgeHeader: {
    flexDirection: "row",
    alignItems: "center",
    backgroundColor: "rgba(139, 0, 0, 0.8)",
    paddingHorizontal: 20,
    paddingVertical: 10,
    borderRadius: 25,
    marginTop: 10,
  },
  premiumBadgeText: {
    color: "#FFD700",
    fontWeight: "700",
    fontSize: 14,
    marginLeft: 10,
  },
  // Section Styles
  section: {
    padding: 20,
    backgroundColor: "#FFF",
    marginBottom: 10,
    borderBottomWidth: 1,
    borderBottomColor: "#EEE",
  },
  sectionHeader: {
    marginBottom: 20,
  },
  sectionTitleContainer: {
    flexDirection: "row",
    alignItems: "center",
    marginBottom: 5,
  },
  sectionTitle: {
    fontSize: 24,
    fontWeight: "700",
    color: "#2C3E50",
    marginLeft: 10,
  },
  sectionSubtitle: {
    fontSize: 14,
    color: "#7F8C8D",
    marginTop: 5,
  },
  // Culture Cards
  culturesList: {
    paddingVertical: 10,
  },
  cultureCard: {
    backgroundColor: "#FFF",
    borderRadius: 20,
    padding: 20,
    marginRight: 15,
    width: 280,
    shadowColor: "#000",
    shadowOffset: { width: 0, height: 4 },
    shadowOpacity: 0.1,
    shadowRadius: 12,
    elevation: 5,
    borderLeftWidth: 5,
    borderTopWidth: 1,
    borderTopColor: "#EEE",
  },
  cultureHeader: {
    flexDirection: "row",
    alignItems: "center",
    marginBottom: 15,
  },
  cultureIcon: {
    marginRight: 15,
  },
  cultureTitleContainer: {
    flex: 1,
  },
  cultureName: {
    fontSize: 20,
    fontWeight: "700",
    color: "#2C3E50",
  },
  cultureRegion: {
    fontSize: 13,
    color: "#8B0000",
    fontWeight: "600",
    marginTop: 2,
  },
  cultureShortDesc: {
    fontSize: 14,
    color: "#34495E",
    lineHeight: 22,
    marginBottom: 15,
  },
  cultureStats: {
    flexDirection: "row",
    justifyContent: "space-between",
    marginBottom: 15,
    paddingBottom: 15,
    borderBottomWidth: 1,
    borderBottomColor: "#EEE",
  },
  stat: {
    flexDirection: "row",
    alignItems: "center",
    gap: 5,
  },
  statText: {
    fontSize: 12,
    color: "#666",
    fontWeight: "500",
  },
  featuresContainer: {
    marginBottom: 15,
  },
  featureTag: {
    flexDirection: "row",
    alignItems: "center",
    backgroundColor: "rgba(39, 174, 96, 0.1)",
    paddingHorizontal: 12,
    paddingVertical: 6,
    borderRadius: 8,
    marginBottom: 8,
    alignSelf: 'flex-start',
  },
  featureTagText: {
    fontSize: 12,
    color: "#27AE60",
    fontWeight: "600",
    marginLeft: 5,
  },
  exploreButton: {
    flexDirection: "row",
    alignItems: "center",
    justifyContent: "center",
    paddingVertical: 12,
    backgroundColor: "rgba(139, 0, 0, 0.05)",
    borderRadius: 10,
  },
  exploreButtonText: {
    fontSize: 14,
    color: "#8B0000",
    fontWeight: "700",
    marginRight: 8,
  },
  seeAllButton: {
    flexDirection: "row",
    alignItems: "center",
    justifyContent: "center",
    paddingVertical: 15,
    marginTop: 10,
  },
  seeAllText: {
    fontSize: 16,
    color: "#8B0000",
    fontWeight: "600",
    marginRight: 8,
  },
  // History Section
  historyCard: {
    backgroundColor: "#F8F9FA",
    borderRadius: 20,
    padding: 20,
  },
  historyTimeline: {
    marginBottom: 20,
  },
  timelineItem: {
    flexDirection: "row",
    alignItems: "center",
    marginBottom: 15,
  },
  timelineDot: {
    width: 12,
    height: 12,
    borderRadius: 6,
    backgroundColor: "#2980B9",
    marginRight: 15,
  },
  timelineYear: {
    fontSize: 16,
    fontWeight: "700",
    color: "#2980B9",
    width: 60,
  },
  timelineText: {
    fontSize: 14,
    color: "#2C3E50",
    flex: 1,
  },
  historyDescription: {
    fontSize: 15,
    color: "#34495E",
    lineHeight: 24,
    marginBottom: 20,
  },
  readMoreButton: {
    backgroundColor: "#2980B9",
    paddingVertical: 12,
    paddingHorizontal: 25,
    borderRadius: 25,
    alignSelf: 'flex-start',
  },
  readMoreText: {
    fontSize: 14,
    color: "#FFF",
    fontWeight: "600",
  },
  // Inventions Section
  inventionsList: {
    paddingVertical: 10,
  },
  inventionCard: {
    backgroundColor: "#FFF",
    borderRadius: 15,
    padding: 20,
    marginRight: 15,
    width: 200,
    shadowColor: "#000",
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.05,
    shadowRadius: 8,
    elevation: 3,
  },
  inventionIconContainer: {
    marginBottom: 15,
  },
  inventionIcon: {
    fontSize: 32,
  },
  inventionCategory: {
    fontSize: 12,
    color: "#E67E22",
    fontWeight: "600",
    marginBottom: 5,
  },
  inventionTitle: {
    fontSize: 16,
    fontWeight: "700",
    color: "#2C3E50",
    marginBottom: 8,
  },
  inventionDescription: {
    fontSize: 13,
    color: "#7F8C8D",
    lineHeight: 18,
    marginBottom: 15,
  },
  inventionYear: {
    flexDirection: "row",
    alignItems: "center",
    gap: 5,
  },
  yearText: {
    fontSize: 12,
    color: "#8B0000",
    fontWeight: "600",
  },
  // Jobs Section
  jobsList: {
    paddingVertical: 10,
  },
  jobCard: {
    backgroundColor: "#FFF",
    borderRadius: 15,
    padding: 20,
    marginRight: 15,
    width: 180,
    alignItems: 'center',
    shadowColor: "#000",
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.05,
    shadowRadius: 8,
    elevation: 3,
  },
  jobIcon: {
    fontSize: 32,
    marginBottom: 15,
  },
  jobName: {
    fontSize: 16,
    fontWeight: "700",
    color: "#2C3E50",
    marginBottom: 8,
    textAlign: 'center',
  },
  jobDescription: {
    fontSize: 12,
    color: "#7F8C8D",
    textAlign: 'center',
    marginBottom: 15,
    lineHeight: 16,
  },
  jobRegion: {
    flexDirection: "row",
    alignItems: "center",
    gap: 5,
  },
  regionText: {
    fontSize: 11,
    color: "#8B0000",
    fontWeight: "600",
  },
  // Premium Content
  premiumGrid: {
    flexDirection: "row",
    flexWrap: "wrap",
    justifyContent: "space-between",
    marginBottom: 20,
  },
  premiumGridItem: {
    width: '48%',
    marginBottom: 15,
  },
  premiumContentCard: {
    backgroundColor: "#FFF",
    borderRadius: 15,
    padding: 20,
    borderWidth: 1,
    borderColor: "#EEE",
    height: 180,
    position: 'relative',
  },
  premiumContentCardLocked: {
    opacity: 0.9,
  },
  premiumIconContainer: {
    width: 50,
    height: 50,
    borderRadius: 25,
    justifyContent: "center",
    alignItems: "center",
    marginBottom: 15,
  },
  premiumContentTitle: {
    fontSize: 16,
    fontWeight: "700",
    color: "#2C3E50",
    marginBottom: 5,
  },
  premiumContentDescription: {
    fontSize: 12,
    color: "#7F8C8D",
    lineHeight: 16,
  },
  lockBadge: {
    position: 'absolute',
    top: 15,
    right: 15,
    backgroundColor: "#8B0000",
    width: 24,
    height: 24,
    borderRadius: 12,
    justifyContent: 'center',
    alignItems: 'center',
  },
  premiumItemsContainer: {
    marginTop: 10,
  },
  premiumItemText: {
    fontSize: 11,
    color: "#666",
    marginBottom: 2,
  },
  moreItemsText: {
    fontSize: 10,
    color: "#8B0000",
    fontStyle: 'italic',
    marginTop: 5,
  },
  lockOverlay: {
    position: 'absolute',
    top: 0,
    left: 0,
    right: 0,
    bottom: 0,
    backgroundColor: 'rgba(0, 0, 0, 0.7)',
    borderRadius: 15,
    justifyContent: 'center',
    alignItems: 'center',
  },
  lockText: {
    color: "#FFF",
    fontSize: 14,
    fontWeight: "600",
    marginTop: 5,
  },
  // Premium CTA Section
  premiumCTASection: {
    marginTop: 10,
  },
  premiumCTACard: {
    backgroundColor: "#FFF",
    borderRadius: 25,
    padding: 30,
    shadowColor: "#000",
    shadowOffset: { width: 0, height: 10 },
    shadowOpacity: 0.1,
    shadowRadius: 20,
    elevation: 10,
    borderWidth: 2,
    borderColor: "#FFD700",
  },
  premiumCTAHeader: {
    flexDirection: "row",
    alignItems: "center",
    marginBottom: 25,
  },
  premiumCTATitle: {
    fontSize: 24,
    fontWeight: "800",
    color: "#8B0000",
    marginLeft: 15,
  },
  premiumCTASubtitle: {
    fontSize: 14,
    color: "#7F8C8D",
    marginLeft: 15,
    marginTop: 5,
  },
  premiumFeatures: {
    marginBottom: 25,
  },
  premiumFeatureItem: {
    flexDirection: "row",
    alignItems: "center",
    marginBottom: 12,
  },
  premiumFeatureText: {
    fontSize: 15,
    color: "#2C3E50",
    marginLeft: 12,
    flex: 1,
  },
  pricingSection: {
    alignItems: 'center',
  },
  priceContainer: {
    flexDirection: "row",
    alignItems: "center",
    marginBottom: 20,
    position: "relative",
  },
  originalPrice: {
    fontSize: 18,
    color: "#999",
    textDecorationLine: "line-through",
    marginRight: 15,
  },
  discountedPrice: {
    fontSize: 36,
    fontWeight: "800",
    color: "#27AE60",
  },
  discountBadge: {
    position: "absolute",
    right: -45,
    top: -10,
    backgroundColor: "#E74C3C",
    paddingHorizontal: 10,
    paddingVertical: 4,
    borderRadius: 10,
  },
  discountText: {
    fontSize: 12,
    fontWeight: "700",
    color: "#FFF",
  },
  upgradeButton: {
    backgroundColor: "#27AE60",
    flexDirection: "row",
    alignItems: "center",
    justifyContent: "center",
    paddingVertical: 18,
    paddingHorizontal: 30,
    borderRadius: 25,
    width: "100%",
    marginBottom: 15,
    shadowColor: "#000",
    shadowOffset: { width: 0, height: 4 },
    shadowOpacity: 0.3,
    shadowRadius: 8,
    elevation: 6,
  },
  upgradeButtonText: {
    fontSize: 18,
    fontWeight: "700",
    color: "#FFF",
    marginLeft: 10,
  },
  securityBadge: {
    flexDirection: "row",
    alignItems: "center",
    justifyContent: "center",
    marginTop: 10,
  },
  securityTextSmall: {
    fontSize: 11,
    color: "#27AE60",
    marginLeft: 5,
    fontWeight: "600",
  },
  // Premium Active Section
  premiumActiveSection: {
    marginTop: 20,
  },
  premiumActiveCard: {
    backgroundColor: "#8B0000",
    borderRadius: 25,
    padding: 30,
    alignItems: 'center',
    shadowColor: "#000",
    shadowOffset: { width: 0, height: 10 },
    shadowOpacity: 0.1,
    shadowRadius: 20,
    elevation: 10,
  },
  premiumActiveTitle: {
    fontSize: 24,
    fontWeight: "800",
    color: "#FFD700",
    marginTop: 15,
    marginBottom: 5,
  },
  premiumActiveSubtitle: {
    fontSize: 14,
    color: "rgba(255, 255, 255, 0.9)",
    textAlign: 'center',
    marginBottom: 25,
  },
  accessButton: {
    backgroundColor: "#27AE60",
    flexDirection: "row",
    alignItems: "center",
    justifyContent: "center",
    paddingVertical: 15,
    paddingHorizontal: 30,
    borderRadius: 25,
    width: '100%',
  },
  accessButtonText: {
    fontSize: 16,
    fontWeight: "700",
    color: "#FFF",
    marginLeft: 10,
  },
  // Culture Modal
  cultureModalOverlay: {
    flex: 1,
    backgroundColor: "rgba(0, 0, 0, 0.5)",
    justifyContent: "center",
    alignItems: "center",
  },
  cultureModalContent: {
    backgroundColor: "#FFF",
    borderRadius: 25,
    width: Dimensions.get("window").width - 40,
    maxHeight: Dimensions.get("window").height - 100,
    overflow: 'hidden',
  },
  cultureModalHeader: {
    flexDirection: "row",
    justifyContent: "space-between",
    alignItems: "center",
    padding: 25,
    backgroundColor: "#F8F9FA",
    borderBottomWidth: 1,
    borderBottomColor: "#EEE",
  },
  cultureModalTitle: {
    fontSize: 24,
    fontWeight: "700",
    color: "#8B0000",
    flex: 1,
  },
  cultureCloseButton: {
    padding: 5,
  },
  cultureDetailContent: {
    padding: 25,
  },
  cultureHero: {
    flexDirection: "row",
    alignItems: "center",
    marginBottom: 20,
  },
  cultureIconLarge: {
    marginRight: 20,
  },
  cultureModalRegion: {
    fontSize: 16,
    fontWeight: "600",
    color: "#4B0082",
  },
  cultureModalPopulation: {
    fontSize: 14,
    color: "#666",
    marginTop: 2,
  },
  cultureDetailDescription: {
    fontSize: 16,
    color: "#34495E",
    lineHeight: 24,
    marginBottom: 25,
  },
  cultureFeatures: {
    marginBottom: 25,
  },
  featureDetailItem: {
    flexDirection: "row",
    alignItems: "center",
    marginBottom: 10,
  },
  featureDetailText: {
    fontSize: 15,
    color: "#2C3E50",
    marginLeft: 10,
    flex: 1,
  },
  upgradePrompt: {
    backgroundColor: "#8B0000",
    flexDirection: "row",
    alignItems: "center",
    padding: 20,
    borderRadius: 15,
  },
  upgradePromptContent: {
    flex: 1,
    marginLeft: 15,
  },
  upgradePromptTitle: {
    fontSize: 16,
    fontWeight: "700",
    color: "#FFF",
    marginBottom: 5,
  },
  upgradePromptSubtitle: {
    fontSize: 13,
    color: "rgba(255, 255, 255, 0.8)",
  },
  // Payment Modal (CORRIGÉ)
  modalOverlay: {
    flex: 1,
    backgroundColor: "rgba(0, 0, 0, 0.5)",
    justifyContent: "center",
    alignItems: "center",
  },
  modalContent: {
    backgroundColor: "#FFF",
    borderRadius: 25,
    padding: 30,
    width: Dimensions.get("window").width - 40,
    maxHeight: Dimensions.get("window").height - 100,
  },
  modalHeader: {
    flexDirection: "row",
    justifyContent: "space-between",
    alignItems: "center",
    marginBottom: 20,
  },
  modalTitle: {
    fontSize: 24,
    fontWeight: "700",
    color: "#8B0000",
  },
  closeButton: {
    padding: 5,
  },
  modalDescription: {
    fontSize: 16,
    color: "#34495E",
    marginBottom: 25,
    textAlign: 'center',
    lineHeight: 22,
  },
  phoneInputContainer: {
    marginBottom: 25,
  },
  inputLabel: {
    fontSize: 14,
    fontWeight: "600",
    color: "#8B0000",
    marginBottom: 10,
  },
  phoneInput: {
    borderWidth: 1,
    borderColor: "#8B0000",
    borderRadius: 15,
    paddingHorizontal: 20,
    height: 55,
    backgroundColor: "#F8F9FA",
    fontSize: 16,
    color: "#2C3E50",
  },
  phoneHint: {
    fontSize: 12,
    color: "#666",
    marginTop: 8,
    fontStyle: 'italic',
  },
  amountLabel: {
    fontSize: 14,
    fontWeight: "600",
    color: "#2C3E50",
    marginBottom: 5,
    textAlign: 'center',
  },
  amountValue: {
    fontSize: 32,
    fontWeight: "800",
    color: "#27AE60",
    textAlign: 'center',
    marginBottom: 25,
  },
  methodsLabel: {
    fontSize: 16,
    fontWeight: "600",
    color: "#2C3E50",
    marginBottom: 15,
    textAlign: 'center',
  },
  paymentMethods: {
    marginBottom: 25,
  },
  paymentMethodButton: {
    flexDirection: "row",
    alignItems: "center",
    justifyContent: "space-between",
    backgroundColor: "#F8F9FA",
    borderRadius: 15,
    padding: 20,
    marginBottom: 15,
    borderWidth: 2,
    borderColor: "transparent",
  },
  paymentMethodIconContainer: {
    width: 40,
    height: 40,
    borderRadius: 20,
    backgroundColor: "#FFF",
    justifyContent: 'center',
    alignItems: 'center',
    marginRight: 15,
    borderWidth: 1,
    borderColor: "#EEE",
  },
  paymentMethodInfo: {
    flex: 1,
  },
  paymentMethodName: {
    fontSize: 16,
    fontWeight: "600",
    color: "#2C3E50",
    marginBottom: 5,
  },
  paymentMethodHint: {
    fontSize: 12,
    color: "#666",
  },
  securityNotice: {
    flexDirection: "row",
    alignItems: "center",
    justifyContent: "center",
    padding: 15,
    backgroundColor: "rgba(39, 174, 96, 0.1)",
    borderRadius: 15,
    marginBottom: 20,
  },
  securityText: {
    fontSize: 14,
    color: "#27AE60",
    fontWeight: "600",
    marginLeft: 10,
  },
  paymentInstructions: {
    marginBottom: 20,
    padding: 15,
    backgroundColor: "rgba(139, 0, 0, 0.05)",
    borderRadius: 15,
  },
  instructionsTitle: {
    fontSize: 16,
    fontWeight: "700",
    color: "#8B0000",
    marginBottom: 15,
    textAlign: 'center',
  },
  instructionStep: {
    flexDirection: "row",
    alignItems: "center",
    marginBottom: 10,
    paddingHorizontal: 10,
  },
  instructionNumber: {
    width: 24,
    height: 24,
    borderRadius: 12,
    backgroundColor: "#8B0000",
    color: "#FFF",
    textAlign: 'center',
    lineHeight: 24,
    fontWeight: "700",
    marginRight: 10,
  },
  instructionText: {
    fontSize: 14,
    color: "#2C3E50",
    flex: 1,
  },
  cancelButton: {
    padding: 15,
    alignItems: 'center',
    borderTopWidth: 1,
    borderTopColor: "#EEE",
    marginTop: 10,
  },
  cancelButtonText: {
    fontSize: 16,
    color: "#8B0000",
    fontWeight: "600",
  },
  // Footer
  footer: {
    backgroundColor: "#2C3E50",
    padding: 40,
    alignItems: 'center',
  },
  footerTitle: {
    fontSize: 24,
    fontWeight: "800",
    color: "#FFD700",
    marginBottom: 10,
  },
  footerDescription: {
    fontSize: 14,
    color: "rgba(255, 255, 255, 0.7)",
    textAlign: 'center',
    marginBottom: 25,
    lineHeight: 20,
  },
  footerLinks: {
    flexDirection: "row",
    justifyContent: "center",
    flexWrap: 'wrap',
    marginBottom: 25,
  },
  footerLink: {
    fontSize: 14,
    color: "#FFF",
    marginHorizontal: 15,
    marginBottom: 10,
    fontWeight: "500",
  },
  copyright: {
    fontSize: 12,
    color: "rgba(255, 255, 255, 0.5)",
    textAlign: 'center',
  },
});