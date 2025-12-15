import {
  Pressable,
  Text,
  Image,
  StyleSheet,
  View,
  useWindowDimensions,
  Platform,
} from "react-native";
import { useMemo } from "react";
import { Colors } from "@/constants/theme";

// interface ListingProps {
//   children: React.ReactNode;
//   onPress: () => void;
// }

// Listing component structure
//
// thumbtack
//  Main container box (white box, clickable)
//   listing image
//   listing price
//   listing title
//
// update component to take in props for:
//  onPress: redirecting to listing page
//    - the onPress function can just call the page route to the listing page and pass it the item ID from
//      the DB. Listing page will load the listing information that's grabbed from the DB by the item ID.
//  itemImage: the image of the item from the DB
//  itemPrice: the price of the item from the DB
//  itemTitle: the title of the item from the DB
//
//
// spread them out more

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

// Calculate columns based on ideal item width
const getColumns = (screenWidth: number, gap: number): number => {
  const horizontalPadding = 32; // 16px each side
  const idealItemWidth = 170; // Lower target width for each listing
  const maxItemWidth = 220; // Don't let items exceed this width
  const availableWidth = screenWidth - horizontalPadding;

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

export function Listing(/*{ children, onPress }: ListingProps */) {
  const { width: screenWidth } = useWindowDimensions();
  const gap = screenWidth >= 1024 ? 30 : screenWidth >= 640 ? 24 : 16;
  const columns = getColumns(screenWidth, gap);

  // Calculate item width based on screen and columns
  const horizontalPadding = 32;
  const totalGaps = gap * (columns - 1);
  const itemWidth = (screenWidth - horizontalPadding - totalGaps) / columns;

  // Scale font sizes slightly for larger screens
  const fontScale = screenWidth >= 1024 ? 1.1 : 1;

  // Generate random rotation and thumbtack once per component instance
  const { rotation, thumbtackImage } = useMemo(() => {
    const rotation = Math.random() * 60 - 30; // Random rotation between -30 and 30 degrees
    const thumbtackImage = getRandomThumbtack();
    return { rotation, thumbtackImage };
  }, []);

  // Calculate thumbtack size and positioning based on item width
  const thumbtackSize = itemWidth * 0.25; // 20% of item width
  const thumbtackOffset = thumbtackSize * 0.25; // Offset from top

  return (
    <View style={[styles.listingContainer, { paddingTop: thumbtackOffset }]}>
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
      <Pressable style={[styles.itemContainer, { width: itemWidth }]}>
        <View style={styles.imageContainer}>
          <Image
            source={require("../assets/images/favicon.png")}
            style={styles.itemImage}
          />
        </View>
        <Text style={[styles.itemPrice, { fontSize: 16 * fontScale }]}>
          $1,000,000
        </Text>
        <Text style={[styles.itemTitle, { fontSize: 14 * fontScale }]}>
          CHOW SUPP READING
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
