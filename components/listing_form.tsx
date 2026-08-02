import { useState } from "react";
import {
  View,
  Text,
  TextInput,
  TouchableOpacity,
  Image,
  ScrollView,
  StyleSheet,
} from "react-native";
import * as ImagePicker from "expo-image-picker";
import { Colors } from "@/constants/theme";
import { Chip } from "@/components/chip";
import { RetroButton } from "@/components/retro_button";
import { CATEGORIES, categoryLabel } from "@/constants/categories";
import { parsePriceToCents } from "@/utils/listings";
import { alertMessage } from "@/utils/alert";

export interface ListingFormSubmitValues {
  title: string;
  description: string;
  price_cents: number;
  category: string;
  contact: string;
  /** Set only when the user picked a new local image that still needs uploading. */
  newImageUri: string | null;
}

export interface ListingFormInitialValues {
  title: string;
  description: string | null;
  price_cents: number;
  category: string | null;
  image_url: string | null;
  contact: string | null;
}

interface ListingFormProps {
  initialValues?: ListingFormInitialValues;
  submitLabel: string;
  isSubmitting: boolean;
  onSubmit: (values: ListingFormSubmitValues) => void;
}

const FALLBACK_IMAGE = require("../assets/images/favicon.png");
const TITLE_MAX_LENGTH = 120;

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
  const [contact, setContact] = useState(initialValues?.contact ?? "");
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
    if (trimmedTitle.length > TITLE_MAX_LENGTH) {
      alertMessage("Title too long", `Keep the title under ${TITLE_MAX_LENGTH} characters.`);
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
    const trimmedContact = contact.trim();
    if (!trimmedContact) {
      alertMessage(
        "Contact info required",
        "Add an email, phone number, or GroupMe link so buyers can reach you.",
      );
      return;
    }

    onSubmit({
      title: trimmedTitle,
      description: trimmedDescription,
      price_cents: priceCents,
      category,
      contact: trimmedContact,
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

      <View style={styles.labelRow}>
        <Text style={styles.labelInline}>TITLE</Text>
        <Text style={styles.charCount}>
          {title.length}/{TITLE_MAX_LENGTH}
        </Text>
      </View>
      <TextInput
        style={styles.input}
        value={title}
        onChangeText={setTitle}
        placeholder="e.g. Mini fridge"
        placeholderTextColor={Colors.inkMuted}
        maxLength={TITLE_MAX_LENGTH}
      />

      <Text style={styles.label}>PRICE</Text>
      <TextInput
        style={styles.input}
        value={price}
        onChangeText={setPrice}
        placeholder="0.00"
        placeholderTextColor={Colors.inkMuted}
        keyboardType="decimal-pad"
      />

      <Text style={styles.label}>CATEGORY</Text>
      <ScrollView
        horizontal
        showsHorizontalScrollIndicator={false}
        contentContainerStyle={styles.chipRow}
      >
        {CATEGORIES.map((c) => (
          <Chip
            key={c}
            label={categoryLabel(c)}
            selected={category === c}
            onPress={() => setCategory(c)}
          />
        ))}
      </ScrollView>

      <Text style={styles.label}>DESCRIPTION</Text>
      <TextInput
        style={[styles.input, styles.textArea]}
        value={description}
        onChangeText={setDescription}
        placeholder="Condition, details, why it's great..."
        placeholderTextColor={Colors.inkMuted}
        multiline
        numberOfLines={4}
      />

      <Text style={styles.label}>CONTACT</Text>
      <TextInput
        style={styles.input}
        value={contact}
        onChangeText={setContact}
        placeholder="Email, phone number, or GroupMe"
        placeholderTextColor={Colors.inkMuted}
        autoCapitalize="none"
      />

      <RetroButton
        label={submitLabel}
        onPress={handleSubmit}
        disabled={isSubmitting}
        loading={isSubmitting}
        style={styles.submitButton}
      />
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
    overflow: "hidden",
    marginBottom: 20,
    backgroundColor: Colors.card,
    borderWidth: 2,
    borderColor: Colors.ink,
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
    fontSize: 12,
    fontWeight: "800",
    letterSpacing: 1,
    color: Colors.ink,
    marginBottom: 6,
    marginTop: 16,
  },
  labelRow: {
    flexDirection: "row",
    justifyContent: "space-between",
    alignItems: "flex-end",
    marginBottom: 6,
    marginTop: 16,
  },
  labelInline: {
    fontSize: 12,
    fontWeight: "800",
    letterSpacing: 1,
    color: Colors.ink,
  },
  charCount: {
    fontSize: 11,
    fontWeight: "600",
    color: Colors.inkMuted,
  },
  input: {
    backgroundColor: Colors.card,
    borderWidth: 2,
    borderColor: Colors.ink,
    paddingHorizontal: 12,
    paddingVertical: 10,
    fontSize: 16,
    color: Colors.ink,
  },
  textArea: {
    height: 100,
    textAlignVertical: "top",
  },
  chipRow: {
    gap: 8,
    paddingVertical: 2,
  },
  submitButton: {
    marginTop: 26,
    marginBottom: 40,
    width: "100%",
  },
});
