import React, { useRef } from "react";
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
import Logo from "@/components/logo";

export default function HomeScreen() {
  const { width: screenWidth } = useWindowDimensions();
  const logoRef = useRef<any>(null);

  // Scale gap from 16 on mobile to 30 on desktop
  const gap = screenWidth >= 1024 ? 30 : screenWidth >= 640 ? 24 : 15;

  const listings = Array.from({ length: 500 }, (_, i) => i);

  const handleScroll = (event: any) => {
    const scrollOffset = event.nativeEvent.contentOffset.y;
    logoRef.current?.triggerBounce(scrollOffset);
  };

  return (
    <SafeAreaProvider>
      <ImageBackground
        source={require("../assets/images/cork_board.png")}
        style={styles.backgroundImage}
        resizeMode="cover"
      >
        <SafeAreaView edges={["top", "left", "right"]} style={styles.safeArea}>
          <ScrollView
            contentContainerStyle={styles.scrollContent}
            onScroll={handleScroll}
            scrollEventThrottle={16}
          >
            <View style={styles.contentContainer}>
              <Logo />
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
    paddingTop: 40,
    flexDirection: "row",
    flexWrap: "wrap",
    justifyContent: "center",
  },
});
