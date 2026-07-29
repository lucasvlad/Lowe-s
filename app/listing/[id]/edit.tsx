import { useEffect, useState } from "react";
import {
  ImageBackground,
  ScrollView,
  StyleSheet,
  View,
  Text,
  TouchableOpacity,
  ActivityIndicator,
} from "react-native";
import { SafeAreaView } from "react-native-safe-area-context";
import { router, useLocalSearchParams } from "expo-router";
import { useAuth } from "@/contexts/AuthContext";
import { ListingForm, type ListingFormSubmitValues } from "@/components/listing_form";
import {
  fetchListingById,
  updateListing,
  uploadListingImage,
  type ListingWithSeller,
} from "@/utils/listings";
import { alertMessage } from "@/utils/alert";

export default function EditListingScreen() {
  const params = useLocalSearchParams<{ id: string }>();
  const id = Array.isArray(params.id) ? params.id[0] : params.id;
  const { user } = useAuth();

  const [listing, setListing] = useState<ListingWithSeller | null>(null);
  const [isLoading, setIsLoading] = useState(true);
  const [error, setError] = useState<Error | null>(null);
  const [isSubmitting, setIsSubmitting] = useState(false);

  useEffect(() => {
    let active = true;
    setIsLoading(true);
    fetchListingById(id)
      .then((row) => {
        if (active) setListing(row);
      })
      .catch((err) => {
        if (active) setError(err instanceof Error ? err : new Error("Failed to load"));
      })
      .finally(() => {
        if (active) setIsLoading(false);
      });
    return () => {
      active = false;
    };
  }, [id]);

  const isOwner = !!listing && !!user && listing.seller_id === user.id;

  const handleSubmit = async (values: ListingFormSubmitValues) => {
    if (!listing || !user) return;
    setIsSubmitting(true);
    try {
      const imageUrl = values.newImageUri
        ? await uploadListingImage(user.id, values.newImageUri)
        : null;

      await updateListing(listing.id, {
        title: values.title,
        description: values.description,
        price_cents: values.price_cents,
        category: values.category,
        ...(imageUrl ? { image_url: imageUrl } : {}),
      });

      router.replace("/(tabs)/my-listings");
    } catch (err) {
      alertMessage(
        "Couldn't save changes",
        err instanceof Error ? err.message : "Something went wrong, please try again.",
      );
    } finally {
      setIsSubmitting(false);
    }
  };

  return (
    <ImageBackground
      source={require("../../../assets/images/cork_board.png")}
      style={styles.background}
      resizeMode="cover"
    >
      <SafeAreaView edges={["top", "left", "right"]} style={styles.safeArea}>
        <TouchableOpacity style={styles.backButton} onPress={() => router.back()}>
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
        ) : !isOwner ? (
          <View style={styles.center}>
            <Text style={styles.stateText}>You can only edit your own listings.</Text>
          </View>
        ) : (
          <ScrollView contentContainerStyle={styles.content}>
            <Text style={styles.title}>Edit listing</Text>
            <ListingForm
              initialValues={{
                title: listing.title,
                description: listing.description,
                price_cents: listing.price_cents,
                category: listing.category,
                image_url: listing.image_url,
              }}
              submitLabel="Save changes"
              isSubmitting={isSubmitting}
              onSubmit={handleSubmit}
            />
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
  },
  title: {
    fontSize: 22,
    fontWeight: "800",
    color: "#fff",
    textShadowColor: "#00000088",
    textShadowRadius: 4,
    textAlign: "center",
    marginBottom: 12,
  },
});
