import React from "react";
import {
  ImageBackground,
  StyleSheet,
  View,
  ScrollView,
  useWindowDimensions,
} from "react-native";
import { SafeAreaView, SafeAreaProvider } from "react-native-safe-area-context";
import { SearchBar } from "@/components/search_bar";
import { Listing } from "@/components/listing";

export default function HomeScreen() {
  const { width: screenWidth } = useWindowDimensions();

  // Scale gap from 16 on mobile to 30 on desktop
  const gap = screenWidth >= 1024 ? 30 : screenWidth >= 640 ? 24 : 15;

  const listings = Array.from({ length: 500 }, (_, i) => i);

  return (
    <SafeAreaProvider>
      <ImageBackground
        source={require("../assets/images/cork_board.png")}
        style={styles.backgroundImage}
        resizeMode="cover"
      >
        <SafeAreaView edges={["top", "left", "right"]} style={styles.safeArea}>
          <ScrollView contentContainerStyle={styles.scrollContent}>
            <View style={styles.contentContainer}>
              <SearchBar />
              <View style={[styles.listingsContainer, { gap }]}>
                {listings.map((_, index) => (
                  <Listing key={index} />
                ))}
              </View>
            </View>
          </ScrollView>
        </SafeAreaView>
      </ImageBackground>
    </SafeAreaProvider>
  );
}

const styles = StyleSheet.create({
  safeArea: {
    height: "100%",
    flex: 1,
  },
  backgroundImage: {
    width: "100%",
    height: "100%",
  },
  contentContainer: {
    paddingTop: 10,
    justifyContent: "center",
    alignItems: "center",
    flex: 1,
    paddingVertical: 20,
    paddingHorizontal: 15,
  },
  scrollContent: {
    flexGrow: 1,
  },
  listingsContainer: {
    flexDirection: "row",
    flexWrap: "wrap",
    justifyContent: "center",
  },
});
