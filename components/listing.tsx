import { Pressable, Text, Image, StyleSheet, View } from "react-native";
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

export function Listing(/*{ children, onPress }: ListingProps */) {
  return (
    <Pressable style={[styles.itemContainer]}>
      <View style={styles.imageContainer}>
        <Image
          source={require("../assets/images/favicon.png")}
          style={styles.itemImage}
        />
      </View>
      <Text style={styles.itemPrice}>$1,000,000</Text>
      <Text style={styles.itemTitle}>CHOW SUPP READING</Text>
    </Pressable>
  );
}

/*
streamline the css so that it's responsive and doesn't rely so heavily on margins
that'll easily get messed up as the element size changes.

add in a min width & height so that at least two can fit next to each other comfortably
on a mobile view, and add in a max width & height so that it doesn't get so insanely
large as the responsiveness scales up as diplay size increases.
*/

const styles = StyleSheet.create({
  itemContainer: {
    backgroundColor: Colors.dark.background,
    width: 330,
    height: 400,
    padding: 10,
    borderRadius: 5,
    margin: 10,
  },
  imageContainer: {
    width: 300,
    height: 300,
    overflow: "hidden",
    marginTop: 5,
    marginBottom: 8,
    margin: "auto",
    borderRadius: 2,
  },
  itemImage: {
    width: "100%",
    height: "100%",
    resizeMode: "cover",
  },
  itemPrice: {
    color: Colors.dark.text,
    fontSize: 22,
    textAlign: "left",
    fontWeight: "bold",
    marginBottom: 8,
    marginLeft: 5,
  },
  itemTitle: {
    color: Colors.dark.text,
    fontSize: 18,
    textAlign: "left",
    marginLeft: 5,
  },
});
