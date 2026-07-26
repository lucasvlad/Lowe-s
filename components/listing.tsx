import { Pressable, Text, Image, StyleSheet, View } from "react-native";
import { useMemo } from "react";
import { Colors } from "@/constants/theme";
import { formatPrice, type ListingRecord } from "@/utils/listings";

// Regular thumbtack images
const REGULAR_THUMBTACKS = [
  require("../assets/images/thumbtacks/blue.png"),
  require("../assets/images/thumbtacks/green.png"),
  require("../assets/images/thumbtacks/pink.png"),
  require("../assets/images/thumbtacks/purple.png"),
  require("../assets/images/thumbtacks/red.png"),
  require("../assets/images/thumbtacks/yellow.png"),
];

// Special rare thumbtacks (1 in 300 chance each)
const SPECIAL_THUMBTACKS = [
  require("../assets/images/thumbtacks/rainbow.png"),
  require("../assets/images/thumbtacks/doge.png"),
];

// Shown while a listing has no image (e.g. seed data) or the URL fails.
const FALLBACK_IMAGE = require("../assets/images/favicon.png");

// Function to select a random thumbtack
const getRandomThumbtack = () => {
  const rareChance = Math.random();

  // 1 in 300 chance for random special thumbtacks
  if (rareChance < 1 / 300) {
    return SPECIAL_THUMBTACKS[
      Math.floor(Math.random() * SPECIAL_THUMBTACKS.length)
    ];
  }

  // Otherwise, pick a random regular thumbtack
  return REGULAR_THUMBTACKS[
    Math.floor(Math.random() * REGULAR_THUMBTACKS.length)
  ];
};

const HORIZONTAL_PADDING = 32; // 16px each side; matches the list content padding

// Calculate columns based on ideal item width
const getColumns = (screenWidth: number, gap: number): number => {
  const idealItemWidth = 170; // Lower target width for each listing
  const maxItemWidth = 220; // Don't let items exceed this width
  const availableWidth = screenWidth - HORIZONTAL_PADDING;

  // Calculate how many items can fit at ideal width
  let columns = Math.floor((availableWidth + gap) / (idealItemWidth + gap));

  // Ensure at least 2 columns on mobile, max 6 on desktop
  columns = Math.max(2, Math.min(6, columns));

  // Check if current column count would make items too wide
  const totalGaps = gap * (columns - 1);
  const actualItemWidth = (availableWidth - totalGaps) / columns;

  // If items would be too wide, add another column (unless at max)
  if (actualItemWidth > maxItemWidth && columns < 6) {
    columns++;
  }

  return columns;
};

/**
 * Responsive grid layout for the current screen width: how many columns, the
 * gap between them, and the resulting per-card width. Lifted out of the card so
 * the browse screen can drive a FlatList with the same numbers.
 */
export function getGridLayout(screenWidth: number): {
  columns: number;
  gap: number;
  itemWidth: number;
} {
  const gap = screenWidth >= 1024 ? 30 : screenWidth >= 640 ? 24 : 16;
  const columns = getColumns(screenWidth, gap);
  const totalGaps = gap * (columns - 1);
  const itemWidth = (screenWidth - HORIZONTAL_PADDING - totalGaps) / columns;
  return { columns, gap, itemWidth };
}

interface ListingProps {
  item: ListingRecord;
  width: number;
  onPress: () => void;
}

export function Listing({ item, width, onPress }: ListingProps) {
  // Random rotation + thumbtack, stable per card instance.
  const { rotation, thumbtackImage } = useMemo(() => {
    return {
      rotation: Math.random() * 60 - 30, // between -30 and 30 degrees
      thumbtackImage: getRandomThumbtack(),
    };
  }, []);

  const thumbtackSize = width * 0.25;
  const thumbtackOffset = thumbtackSize * 0.25;
  const fontScale = width >= 200 ? 1.1 : 1;

  return (
    <View style={[styles.listingContainer, { width, paddingTop: thumbtackOffset }]}>
      <Image
        source={thumbtackImage}
        style={[
          styles.thumbtack,
          {
            width: thumbtackSize,
            height: thumbtackSize,
            top: -thumbtackOffset,
            marginLeft: -thumbtackSize / 2, // Center horizontally
            transform: [{ rotate: `${rotation}deg` }],
          },
        ]}
      />
      <Pressable style={styles.itemContainer} onPress={onPress}>
        <View style={styles.imageContainer}>
          <Image
            source={item.image_url ? { uri: item.image_url } : FALLBACK_IMAGE}
            style={styles.itemImage}
          />
        </View>
        <Text
          style={[styles.itemPrice, { fontSize: 16 * fontScale }]}
          numberOfLines={1}
        >
          {formatPrice(item.price_cents)}
        </Text>
        <Text
          style={[styles.itemTitle, { fontSize: 14 * fontScale }]}
          numberOfLines={1}
        >
          {item.title}
        </Text>
      </Pressable>
    </View>
  );
}

const styles = StyleSheet.create({
  listingContainer: {
    position: "relative",
  },
  thumbtack: {
    position: "absolute",
    left: "50%",
    zIndex: 10,
    resizeMode: "contain",
    filter: "drop-shadow(2px 6px 6px #212121ff)",
  },
  itemContainer: {
    width: "100%",
    backgroundColor: Colors.dark.background,
    aspectRatio: 186 / 234,
    padding: 10,
    paddingTop: 12,
    borderRadius: 5,
    filter: "drop-shadow(2px 6px 6px #212121ff)",
  },
  imageContainer: {
    flex: 1,
    overflow: "hidden",
    borderRadius: 2,
    marginBottom: 5,
  },
  itemImage: {
    width: "100%",
    height: "100%",
    resizeMode: "cover",
  },
  itemPrice: {
    color: Colors.dark.text,
    textAlign: "left",
    fontWeight: "bold",
    paddingLeft: 2,
    paddingTop: 5,
  },
  itemTitle: {
    color: Colors.dark.text,
    textAlign: "left",
    paddingLeft: 2,
    paddingTop: 5,
  },
});
