import React from "react";
import {
  ImageBackground,
  StyleSheet,
  View,
  ScrollView,
  useWindowDimensions,
} from "react-native";
import { SafeAreaView, SafeAreaProvider } from "react-native-safe-area-context";
import { Listing } from "@/components/listing";

export default function HomeScreen() {
  const { width: screenWidth } = useWindowDimensions();

  // Scale gap from 16 on mobile to 30 on desktop
  const gap = screenWidth >= 1024 ? 30 : screenWidth >= 640 ? 24 : 15;

  // You can add more listings for testing
  const listings = Array.from({ length: 20 }, (_, i) => i);

  return (
    <SafeAreaProvider>
      <ImageBackground
        source={require("../assets/images/cork_board.png")}
        style={styles.backgroundImage}
        resizeMode="cover"
      ></ImageBackground>
      <SafeAreaView edges={["left", "right"]} style={styles.safeArea}>
        <ScrollView contentContainerStyle={styles.scrollContent}>
          <View style={styles.contentContainer}>
            <View style={[styles.listingsContainer, { gap }]}>
              {listings.map((_, index) => (
                <Listing key={index} />
              ))}
            </View>
          </View>
        </ScrollView>
      </SafeAreaView>
    </SafeAreaProvider>
  );
}

const styles = StyleSheet.create({
  backgroundImage: {
    flex: 1,
    width: "100%",
    height: "100%",
  },
  safeArea: {
    flex: 1,
  },
  scrollContent: {
    flexGrow: 1,
  },
  contentContainer: {
    flex: 1,
    paddingVertical: 20,
    paddingHorizontal: 15,
  },
  listingsContainer: {
    flexDirection: "row",
    flexWrap: "wrap",
    justifyContent: "center",
  },
});
