import React from "react";
import { View, Text, Image, StyleSheet, TouchableOpacity } from "react-native";

export interface VillageItemProps {
  title: string;
  subtitle: string;
  image?: string;
  onPress?: () => void;
}

const ListItem: React.FC<VillageItemProps> = ({ title, subtitle, image, onPress }) => {
  return (
    <TouchableOpacity onPress={onPress} activeOpacity={0.8} style={styles.container}>
      {image && (
        <Image
          source={{ uri: image }}
          style={styles.image}
        />
      )}

      <View style={styles.textContainer}>
        <Text style={styles.title}>{title}</Text>
        <Text style={styles.subtitle}>{subtitle}</Text>
      </View>
    </TouchableOpacity>
  );
};

const styles = StyleSheet.create({
  container: {
    flexDirection: "row",
    padding: 12,
    backgroundColor: "#fff",
    borderRadius: 10,
    alignItems: "center",
    marginVertical: 6,
  },
  image: {
    width: 60,
    height: 60,
    borderRadius: 8,
    marginRight: 12,
  },
  textContainer: {
    flex: 1,
  },
  title: {
    fontSize: 16,
    fontWeight: "700",
  },
  subtitle: {
    fontSize: 14,
    color: "#555",
  },
});

export default ListItem;
