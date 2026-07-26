import React, { useEffect, useState } from "react";
import {
  ImageBackground,
  ScrollView,
  StyleSheet,
  View,
  Text,
  Image,
  TouchableOpacity,
  ActivityIndicator,
} from "react-native";
import { SafeAreaView } from "react-native-safe-area-context";
import { router, useLocalSearchParams } from "expo-router";
import {
  fetchListingById,
  formatPrice,
  type ListingWithSeller,
} from "@/utils/listings";
import { Colors } from "@/constants/theme";

const FALLBACK_IMAGE = require("../../assets/images/favicon.png");

export default function ListingDetailScreen() {
  const params = useLocalSearchParams<{ id: string }>();
  const id = Array.isArray(params.id) ? params.id[0] : params.id;

  const [listing, setListing] = useState<ListingWithSeller | null>(null);
  const [isLoading, setIsLoading] = useState(true);
  const [error, setError] = useState<Error | null>(null);

  useEffect(() => {
    let active = true;
    setIsLoading(true);
    setError(null);
    fetchListingById(id)
      .then((row) => {
        if (active) setListing(row);
      })
      .catch((err) => {
        if (active)
          setError(err instanceof Error ? err : new Error("Failed to load"));
      })
      .finally(() => {
        if (active) setIsLoading(false);
      });
    return () => {
      active = false;
    };
  }, [id]);

  return (
    <ImageBackground
      source={require("../../assets/images/cork_board.png")}
      style={styles.background}
      resizeMode="cover"
    >
      <SafeAreaView edges={["top", "left", "right"]} style={styles.safeArea}>
        <TouchableOpacity
          style={styles.backButton}
          onPress={() => router.back()}
        >
          <Text style={styles.backText}>‹ Back</Text>
        </TouchableOpacity>

        {isLoading ? (
          <View style={styles.center}>
            <ActivityIndicator size="large" color="#fff" />
          </View>
        ) : error || !listing ? (
          <View style={styles.center}>
            <Text style={styles.stateText}>
              {error ? "Couldn't load this listing." : "Listing not found."}
            </Text>
          </View>
        ) : (
          <ScrollView contentContainerStyle={styles.content}>
            <View style={styles.card}>
              <Image
                source={
                  listing.image_url
                    ? { uri: listing.image_url }
                    : FALLBACK_IMAGE
                }
                style={styles.image}
              />
              <Text style={styles.price}>{formatPrice(listing.price_cents)}</Text>
              <Text style={styles.title}>{listing.title}</Text>
              {listing.category ? (
                <Text style={styles.category}>{listing.category}</Text>
              ) : null}
              {listing.description ? (
                <Text style={styles.description}>{listing.description}</Text>
              ) : null}
              <Text style={styles.seller}>
                Posted by {listing.seller?.display_name ?? "a student"}
              </Text>
            </View>
          </ScrollView>
        )}
      </SafeAreaView>
    </ImageBackground>
  );
}

const styles = StyleSheet.create({
  background: {
    width: "100%",
    height: "100%",
  },
  safeArea: {
    flex: 1,
  },
  backButton: {
    alignSelf: "flex-start",
    marginTop: 8,
    marginLeft: 12,
    marginBottom: 4,
    backgroundColor: "#ffffffcc",
    borderRadius: 8,
    paddingVertical: 6,
    paddingHorizontal: 14,
  },
  backText: {
    fontSize: 16,
    fontWeight: "700",
    color: "#333",
  },
  center: {
    flex: 1,
    alignItems: "center",
    justifyContent: "center",
    padding: 24,
  },
  stateText: {
    color: "#fff",
    fontSize: 16,
    fontWeight: "600",
    textAlign: "center",
    textShadowColor: "#00000088",
    textShadowRadius: 4,
  },
  content: {
    padding: 16,
    alignItems: "center",
  },
  card: {
    width: "100%",
    maxWidth: 520,
    backgroundColor: Colors.dark.background,
    borderRadius: 8,
    padding: 16,
    boxShadow: "2px 6px 10px #21212188",
  },
  image: {
    width: "100%",
    aspectRatio: 1,
    borderRadius: 6,
    marginBottom: 14,
    resizeMode: "cover",
  },
  price: {
    fontSize: 26,
    fontWeight: "800",
    color: Colors.dark.text,
  },
  title: {
    fontSize: 20,
    fontWeight: "600",
    color: Colors.dark.text,
    marginTop: 4,
  },
  category: {
    fontSize: 13,
    fontWeight: "600",
    color: "#666",
    textTransform: "capitalize",
    marginTop: 8,
  },
  description: {
    fontSize: 15,
    lineHeight: 22,
    color: "#222",
    marginTop: 14,
  },
  seller: {
    fontSize: 14,
    color: "#555",
    marginTop: 18,
  },
});
