import React from "react";
import { ImageBackground, StyleSheet, View } from "react-native";
import { SafeAreaView, SafeAreaProvider } from "react-native-safe-area-context";
import { SearchBar } from "@/components/search_bar";

export default function HomeScreen() {
  return (
    <SafeAreaProvider>
      <ImageBackground
        source={require("../assets/images/cork_board.png")}
        style={styles.backgroundImage}
        resizeMode="cover"
      ></ImageBackground>
      <SafeAreaView edges={["left", "right"]}>
        <View style={styles.contentContainer}>
          <SearchBar />
        </View>
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
  contentContainer: {
    flex: 1,
    justifyContent: "center",
    alignItems: "center",
  },
});
