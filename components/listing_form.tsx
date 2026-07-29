import { useState } from "react";
import {
  View,
  Text,
  TextInput,
  TouchableOpacity,
  Image,
  ScrollView,
  StyleSheet,
  ActivityIndicator,
} from "react-native";
import * as ImagePicker from "expo-image-picker";
import { Colors } from "@/constants/theme";
import { CATEGORIES, categoryLabel } from "@/constants/categories";
import { parsePriceToCents } from "@/utils/listings";
import { alertMessage } from "@/utils/alert";

export interface ListingFormSubmitValues {
  title: string;
  description: string;
  price_cents: number;
  category: string;
  /** Set only when the user picked a new local image that still needs uploading. */
  newImageUri: string | null;
}

export interface ListingFormInitialValues {
  title: string;
  description: string | null;
  price_cents: number;
  category: string | null;
  image_url: string | null;
}

interface ListingFormProps {
  initialValues?: ListingFormInitialValues;
  submitLabel: string;
  isSubmitting: boolean;
  onSubmit: (values: ListingFormSubmitValues) => void;
}

const FALLBACK_IMAGE = require("../assets/images/favicon.png");

export function ListingForm({
  initialValues,
  submitLabel,
  isSubmitting,
  onSubmit,
}: ListingFormProps) {
  const [title, setTitle] = useState(initialValues?.title ?? "");
  const [price, setPrice] = useState(
    initialValues ? (initialValues.price_cents / 100).toFixed(2) : "",
  );
  const [description, setDescription] = useState(
    initialValues?.description ?? "",
  );
  const [category, setCategory] = useState<string | null>(
    initialValues?.category ?? null,
  );
  // Local uri once the user picks a new photo; otherwise show the existing remote image.
  const [newImageUri, setNewImageUri] = useState<string | null>(null);

  const previewSource = newImageUri
    ? { uri: newImageUri }
    : initialValues?.image_url
      ? { uri: initialValues.image_url }
      : FALLBACK_IMAGE;

  const pickImage = async () => {
    const permission = await ImagePicker.requestMediaLibraryPermissionsAsync();
    if (!permission.granted) {
      alertMessage(
        "Photo access needed",
        "Please allow photo library access to add a picture to your listing.",
      );
      return;
    }
    const result = await ImagePicker.launchImageLibraryAsync({
      mediaTypes: ["images"],
      allowsEditing: true,
      aspect: [1, 1],
      quality: 0.7,
    });
    if (!result.canceled && result.assets[0]) {
      setNewImageUri(result.assets[0].uri);
    }
  };

  const handleSubmit = () => {
    const trimmedTitle = title.trim();
    if (!trimmedTitle) {
      alertMessage("Title required", "Give your listing a title.");
      return;
    }
    if (trimmedTitle.length > 120) {
      alertMessage("Title too long", "Keep the title under 120 characters.");
      return;
    }
    const priceCents = parsePriceToCents(price);
    if (priceCents === null) {
      alertMessage("Invalid price", "Enter a price like 19.99.");
      return;
    }
    if (!category) {
      alertMessage("Category required", "Pick a category for your listing.");
      return;
    }
    const trimmedDescription = description.trim();
    if (!trimmedDescription) {
      alertMessage("Description required", "Add a short description.");
      return;
    }
    const hasImage = !!newImageUri || !!initialValues?.image_url;
    if (!hasImage) {
      alertMessage("Photo required", "Add a photo of your item.");
      return;
    }

    onSubmit({
      title: trimmedTitle,
      description: trimmedDescription,
      price_cents: priceCents,
      category,
      newImageUri,
    });
  };

  return (
    <View style={styles.form}>
      <TouchableOpacity style={styles.imagePicker} onPress={pickImage}>
        <Image source={previewSource} style={styles.imagePreview} />
        <View style={styles.imageOverlay}>
          <Text style={styles.imageOverlayText}>
            {newImageUri || initialValues?.image_url
              ? "Change photo"
              : "Add a photo"}
          </Text>
        </View>
      </TouchableOpacity>

      <Text style={styles.label}>Title</Text>
      <TextInput
        style={styles.input}
        value={title}
        onChangeText={setTitle}
        placeholder="e.g. Mini fridge"
        placeholderTextColor="#888"
        maxLength={120}
      />

      <Text style={styles.label}>Price</Text>
      <TextInput
        style={styles.input}
        value={price}
        onChangeText={setPrice}
        placeholder="0.00"
        placeholderTextColor="#888"
        keyboardType="decimal-pad"
      />

      <Text style={styles.label}>Category</Text>
      <ScrollView
        horizontal
        showsHorizontalScrollIndicator={false}
        contentContainerStyle={styles.chipRow}
      >
        {CATEGORIES.map((c) => (
          <TouchableOpacity
            key={c}
            style={[styles.chip, category === c && styles.chipSelected]}
            onPress={() => setCategory(c)}
          >
            <Text
              style={[
                styles.chipText,
                category === c && styles.chipTextSelected,
              ]}
            >
              {categoryLabel(c)}
            </Text>
          </TouchableOpacity>
        ))}
      </ScrollView>

      <Text style={styles.label}>Description</Text>
      <TextInput
        style={[styles.input, styles.textArea]}
        value={description}
        onChangeText={setDescription}
        placeholder="Condition, details, why it's great..."
        placeholderTextColor="#888"
        multiline
        numberOfLines={4}
      />

      <TouchableOpacity
        style={[styles.submitButton, isSubmitting && styles.submitDisabled]}
        onPress={handleSubmit}
        disabled={isSubmitting}
      >
        {isSubmitting ? (
          <ActivityIndicator color="#fff" />
        ) : (
          <Text style={styles.submitText}>{submitLabel}</Text>
        )}
      </TouchableOpacity>
    </View>
  );
}

const styles = StyleSheet.create({
  form: {
    width: "100%",
    maxWidth: 480,
    alignSelf: "center",
  },
  imagePicker: {
    width: "100%",
    aspectRatio: 1,
    borderRadius: 8,
    overflow: "hidden",
    marginBottom: 20,
    backgroundColor: Colors.dark.background,
  },
  imagePreview: {
    width: "100%",
    height: "100%",
    resizeMode: "cover",
  },
  imageOverlay: {
    position: "absolute",
    bottom: 0,
    left: 0,
    right: 0,
    backgroundColor: "#00000099",
    paddingVertical: 8,
    alignItems: "center",
  },
  imageOverlayText: {
    color: "#fff",
    fontWeight: "600",
  },
  label: {
    fontSize: 14,
    fontWeight: "700",
    color: "#fff",
    textShadowColor: "#00000088",
    textShadowRadius: 4,
    marginBottom: 6,
    marginTop: 14,
  },
  input: {
    backgroundColor: Colors.dark.background,
    borderRadius: 8,
    paddingHorizontal: 12,
    paddingVertical: 10,
    fontSize: 16,
    color: "#000",
  },
  textArea: {
    height: 100,
    textAlignVertical: "top",
  },
  chipRow: {
    gap: 8,
    paddingVertical: 2,
  },
  chip: {
    paddingHorizontal: 14,
    paddingVertical: 8,
    borderRadius: 20,
    backgroundColor: Colors.dark.background,
  },
  chipSelected: {
    backgroundColor: "#333",
  },
  chipText: {
    color: "#000",
    fontWeight: "600",
    fontSize: 13,
  },
  chipTextSelected: {
    color: "#fff",
  },
  submitButton: {
    marginTop: 24,
    marginBottom: 40,
    backgroundColor: "#2a7d3f",
    borderRadius: 8,
    paddingVertical: 14,
    alignItems: "center",
  },
  submitDisabled: {
    opacity: 0.6,
  },
  submitText: {
    color: "#fff",
    fontSize: 16,
    fontWeight: "700",
  },
});
