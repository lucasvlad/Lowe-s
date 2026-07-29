import { useState } from "react";
import { ImageBackground, ScrollView, StyleSheet, Text } from "react-native";
import { SafeAreaView } from "react-native-safe-area-context";
import { router } from "expo-router";
import { useAuth } from "@/contexts/AuthContext";
import { ListingForm, type ListingFormSubmitValues } from "@/components/listing_form";
import { createListing, uploadListingImage } from "@/utils/listings";
import { alertMessage } from "@/utils/alert";

export default function PostScreen() {
  const { user } = useAuth();
  const [isSubmitting, setIsSubmitting] = useState(false);
  // Bumped after a successful post to remount ListingForm with a clean slate —
  // tabs stay mounted in Expo Router, so without this the form would keep
  // showing the just-submitted listing's data until manually cleared.
  const [formKey, setFormKey] = useState(0);

  const handleSubmit = async (values: ListingFormSubmitValues) => {
    if (!user) return;
    setIsSubmitting(true);
    try {
      const imageUrl = values.newImageUri
        ? await uploadListingImage(user.id, values.newImageUri)
        : null;

      await createListing(user.id, {
        title: values.title,
        description: values.description,
        price_cents: values.price_cents,
        category: values.category,
        image_url: imageUrl,
      });

      setFormKey((k) => k + 1);
      router.replace("/(tabs)/my-listings");
    } catch (err) {
      alertMessage(
        "Couldn't post listing",
        err instanceof Error ? err.message : "Something went wrong, please try again.",
      );
    } finally {
      setIsSubmitting(false);
    }
  };

  return (
    <ImageBackground
      source={require("../../assets/images/cork_board.png")}
      style={styles.background}
      resizeMode="cover"
    >
      <SafeAreaView edges={["top", "left", "right"]} style={styles.safeArea}>
        <ScrollView contentContainerStyle={styles.content}>
          <Text style={styles.title}>Post a listing</Text>
          <ListingForm
            key={formKey}
            submitLabel="Post listing"
            isSubmitting={isSubmitting}
            onSubmit={handleSubmit}
          />
        </ScrollView>
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
