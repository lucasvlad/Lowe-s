import { useEffect, useMemo, useState } from "react";
import {
  ActivityIndicator,
  Image,
  Modal,
  ScrollView,
  StyleSheet,
  Text,
  TouchableOpacity,
  View,
} from "react-native";
import { fetchListingById, formatPrice, type ListingWithSeller } from "@/utils/listings";
import { getThumbtackForId, getRandomThumbtackRotation } from "@/utils/thumbtacks";
import { Colors, CARD_SHADOW } from "@/constants/theme";

const FALLBACK_IMAGE = require("../assets/images/favicon.png");

// Matches the card-pin look from the browse grid, at a size that reads well
// at the modal's fixed width instead of scaling off the card's own width.
const THUMBTACK_SIZE = 64;
const THUMBTACK_OFFSET = THUMBTACK_SIZE * 0.25;

interface ListingDetailModalProps {
  /** The listing to show, or null when the modal should be closed. */
  listingId: string | null;
  onClose: () => void;
}

export function ListingDetailModal({ listingId, onClose }: ListingDetailModalProps) {
  const [listing, setListing] = useState<ListingWithSeller | null>(null);
  const [isLoading, setIsLoading] = useState(true);
  const [error, setError] = useState<Error | null>(null);

  useEffect(() => {
    if (!listingId) return;
    let active = true;
    setListing(null);
    setIsLoading(true);
    setError(null);
    fetchListingById(listingId)
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
  }, [listingId]);

  // Rotation rerolls each time a listing is opened; the thumbtack itself is
  // deterministic per listing id so it matches the one on its grid card.
  const rotation = useMemo(
    () => getRandomThumbtackRotation(),
    // eslint-disable-next-line react-hooks/exhaustive-deps
    [listingId],
  );
  const thumbtackImage = getThumbtackForId(listingId ?? "");

  return (
    <Modal
      visible={!!listingId}
      transparent
      animationType="fade"
      onRequestClose={onClose}
    >
      <View style={styles.backdrop}>
        <TouchableOpacity style={StyleSheet.absoluteFill} activeOpacity={1} onPress={onClose} />
        <View style={styles.pinWrap}>
          <Image
            source={thumbtackImage}
            style={[
              styles.thumbtack,
              {
                top: -THUMBTACK_OFFSET,
                marginLeft: -THUMBTACK_SIZE / 2,
                transform: [{ rotate: `${rotation}deg` }],
              },
            ]}
          />
          <View style={styles.cardWrap}>
            <TouchableOpacity style={styles.closeButton} onPress={onClose}>
              <Text style={styles.closeText}>✕</Text>
            </TouchableOpacity>

            {isLoading ? (
              <View style={styles.center}>
                <ActivityIndicator size="large" color={Colors.accent} />
              </View>
            ) : error || !listing ? (
              <View style={styles.center}>
                <Text style={styles.stateText}>
                  {error ? "Couldn't load this listing." : "Listing not found."}
                </Text>
              </View>
            ) : (
              <ScrollView style={styles.scroll} contentContainerStyle={styles.content}>
                <Image
                  source={listing.image_url ? { uri: listing.image_url } : FALLBACK_IMAGE}
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
                {listing.contact ? (
                  <Text style={styles.contact}>Contact: {listing.contact}</Text>
                ) : null}
              </ScrollView>
            )}
          </View>
        </View>
      </View>
    </Modal>
  );
}

const styles = StyleSheet.create({
  backdrop: {
    flex: 1,
    backgroundColor: "#00000099",
    alignItems: "center",
    justifyContent: "center",
    padding: 20,
  },
  pinWrap: {
    width: "100%",
    maxWidth: 520,
    maxHeight: "85%",
    paddingTop: THUMBTACK_OFFSET,
  },
  thumbtack: {
    position: "absolute",
    left: "50%",
    width: THUMBTACK_SIZE,
    height: THUMBTACK_SIZE,
    zIndex: 10,
    resizeMode: "contain",
    filter: `drop-shadow(${CARD_SHADOW})`,
  },
  cardWrap: {
    width: "100%",
    flexShrink: 1,
    overflow: "hidden",
    backgroundColor: Colors.card,
    borderWidth: 2,
    borderColor: Colors.ink,
    filter: `drop-shadow(${CARD_SHADOW})`,
  },
  closeButton: {
    position: "absolute",
    top: 8,
    right: 8,
    zIndex: 1,
    width: 32,
    height: 32,
    alignItems: "center",
    justifyContent: "center",
    backgroundColor: Colors.card,
    borderWidth: 2,
    borderColor: Colors.ink,
  },
  closeText: {
    fontSize: 16,
    fontWeight: "800",
    color: Colors.ink,
    lineHeight: 16,
  },
  center: {
    minHeight: 240,
    alignItems: "center",
    justifyContent: "center",
    padding: 24,
  },
  stateText: {
    color: Colors.ink,
    fontSize: 16,
    fontWeight: "600",
    textAlign: "center",
  },
  scroll: {
    flexShrink: 1,
  },
  content: {
    padding: 16,
  },
  image: {
    width: "100%",
    aspectRatio: 1,
    marginBottom: 14,
    resizeMode: "cover",
  },
  price: {
    fontSize: 26,
    fontWeight: "800",
    color: Colors.ink,
  },
  title: {
    // Plain system font, not the pencil/scribble one — that font has no
    // glyphs for digits or symbols, so listing titles containing them (a
    // model number, a price callout, etc.) would render broken characters.
    fontSize: 22,
    fontWeight: "700",
    color: Colors.ink,
    marginTop: 4,
  },
  category: {
    fontSize: 13,
    fontWeight: "600",
    color: Colors.inkMuted,
    textTransform: "capitalize",
    marginTop: 8,
  },
  description: {
    fontSize: 15,
    lineHeight: 22,
    color: Colors.ink,
    marginTop: 14,
  },
  seller: {
    fontSize: 14,
    color: Colors.inkMuted,
    marginTop: 18,
  },
  contact: {
    fontSize: 14,
    fontWeight: "700",
    color: Colors.ink,
    marginTop: 4,
  },
});
