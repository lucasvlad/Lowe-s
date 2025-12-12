import React from "react";
import { ImageBackground, StyleSheet, View } from "react-native";
import { SafeAreaView, SafeAreaProvider } from "react-native-safe-area-context";
import { SearchBar } from "@/components/search_bar";
import { Listing } from "@/components/listing";

export default function HomeScreen() {
  return (
    <SafeAreaProvider>
      <ImageBackground
        source={require("../assets/images/cork_board.png")}
        style={styles.backgroundImage}
        resizeMode="cover"
        >
      <SafeAreaView edges={["top", "left", "right"]} style={styles.safeArea}>
          <View style={styles.contentContainer}>
            <SearchBar />
          </View>
      </SafeAreaView>
      </ImageBackground>
    </SafeAreaProvider>
  );
}

const styles = StyleSheet.create({
  safeArea: {
    height: "100%",
  },
  backgroundImage: {
    width: "100%",
    height: "100%",
  },
  contentContainer: {
    paddingTop: 10,
    justifyContent: "center",
    alignItems: "center",
  },
});
