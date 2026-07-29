import React, { useState } from "react";
import {
  ImageBackground,
  StyleSheet,
  View,
  Text,
  TouchableOpacity,
  FlatList,
  ActivityIndicator,
  RefreshControl,
  useWindowDimensions,
} from "react-native";
import { SafeAreaView, SafeAreaProvider } from "react-native-safe-area-context";
import { router } from "expo-router";
import { SearchBar } from "@/components/search_bar";
import { CategoryFilter } from "@/components/category_filter";
import { Listing, getGridLayout } from "@/components/listing";
import { useAuth } from "@/contexts/AuthContext";
import { useListings } from "@/hooks/use-listings";
import type { ListingRecord } from "@/utils/listings";

// Covenant emails are formatted first.last@covenant.edu, so the local part
// before the first "." is the first name. Capitalize it for the greeting.
// (Placeholder greeting — revisit when the home header gets its UI pass.)
function firstNameFromEmail(email?: string): string {
  const first = email?.split("@")[0]?.split(".")[0] ?? "";
  return first ? first.charAt(0).toUpperCase() + first.slice(1) : "there";
}

export default function HomeScreen() {
  const { width: screenWidth } = useWindowDimensions();
  const { signOut, user } = useAuth();
  const [searchQuery, setSearchQuery] = useState("");
  const [selectedCategory, setSelectedCategory] = useState<string | null>(null);
  const {
    listings,
    isLoading,
    isLoadingMore,
    isRefreshing,
    error,
    loadMore,
    refresh,
  } = useListings(searchQuery, selectedCategory);

  const { columns, gap, itemWidth } = getGridLayout(screenWidth);

  const renderItem = ({ item }: { item: ListingRecord }) => (
    <Listing
      item={item}
      width={itemWidth}
      onPress={() =>
        router.push({ pathname: "/listing/[id]", params: { id: item.id } })
      }
    />
  );

  const header = (
    <View style={styles.headerArea}>
      <View style={styles.header}>
        <Text style={styles.welcomeText}>
          Welcome, {firstNameFromEmail(user?.email)}
        </Text>
        <TouchableOpacity style={styles.logoutButton} onPress={signOut}>
          <Text style={styles.logoutText}>Logout</Text>
        </TouchableOpacity>
      </View>
      <SearchBar onSearch={setSearchQuery} />
      <View style={styles.categoryFilterRow}>
        <CategoryFilter selected={selectedCategory} onSelect={setSelectedCategory} />
      </View>
    </View>
  );

  const hasActiveFilter = !!searchQuery || !!selectedCategory;

  return (
    <SafeAreaProvider>
      <ImageBackground
        source={require("../../assets/images/cork_board.png")}
        style={styles.backgroundImage}
        resizeMode="cover"
      >
        <SafeAreaView edges={["top", "left", "right"]} style={styles.safeArea}>
          <FlatList
            key={`cols-${columns}`}
            style={styles.list}
            data={listings}
            renderItem={renderItem}
            keyExtractor={(item) => item.id}
            numColumns={columns}
            columnWrapperStyle={[styles.column, { gap, marginBottom: gap }]}
            ListHeaderComponent={header}
            contentContainerStyle={styles.listContent}
            onEndReached={loadMore}
            onEndReachedThreshold={0.4}
            refreshControl={
              <RefreshControl
                refreshing={isRefreshing}
                onRefresh={refresh}
                tintColor="#fff"
              />
            }
            ListEmptyComponent={
              isLoading ? null : (
                <View style={styles.stateBox}>
                  <Text style={styles.stateText}>
                    {error
                      ? "Couldn't load listings. Pull down to retry."
                      : hasActiveFilter
                        ? "No listings match your search."
                        : "No listings yet. Check back soon!"}
                  </Text>
                </View>
              )
            }
            ListFooterComponent={
              isLoadingMore ? (
                <ActivityIndicator style={styles.footer} color="#fff" />
              ) : null
            }
          />
          {isLoading ? (
            <View style={styles.centerOverlay} pointerEvents="none">
              <ActivityIndicator size="large" color="#fff" />
            </View>
          ) : null}
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
  list: {
    flex: 1,
    backgroundColor: "transparent",
  },
  listContent: {
    paddingHorizontal: 16,
    paddingTop: 10,
    paddingBottom: 40,
  },
  column: {
    justifyContent: "flex-start",
  },
  headerArea: {
    alignItems: "center",
    paddingTop: 10,
    marginBottom: 30,
  },
  header: {
    flexDirection: "row",
    justifyContent: "space-between",
    alignItems: "center",
    width: "100%",
    marginBottom: 20,
    paddingHorizontal: 10,
  },
  welcomeText: {
    fontSize: 16,
    fontWeight: "600",
    color: "#333",
  },
  categoryFilterRow: {
    width: "100%",
    marginTop: 14,
  },
  logoutButton: {
    backgroundColor: "#ff3b30",
    paddingHorizontal: 20,
    paddingVertical: 10,
    borderRadius: 8,
  },
  logoutText: {
    color: "#fff",
    fontWeight: "600",
    fontSize: 14,
  },
  stateBox: {
    alignItems: "center",
    paddingVertical: 60,
    paddingHorizontal: 24,
  },
  stateText: {
    color: "#fff",
    fontSize: 16,
    fontWeight: "600",
    textAlign: "center",
    textShadowColor: "#00000088",
    textShadowRadius: 4,
  },
  footer: {
    paddingVertical: 24,
  },
  centerOverlay: {
    ...StyleSheet.absoluteFillObject,
    alignItems: "center",
    justifyContent: "center",
  },
});
