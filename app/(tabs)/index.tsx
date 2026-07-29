import React, { useState } from "react";
import {
  ImageBackground,
  StyleSheet,
  View,
  Text,
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
import { TearReveal } from "@/components/tear_reveal";
import { useDesignVariant } from "@/contexts/DesignVariantContext";
import { useListings } from "@/hooks/use-listings";
import type { ListingRecord } from "@/utils/listings";

export default function HomeScreen() {
  const { width: screenWidth } = useWindowDimensions();
  const [searchQuery, setSearchQuery] = useState("");
  const [selectedCategory, setSelectedCategory] = useState<string | null>(null);
  const { variant, justSignedIn, clearJustSignedIn } = useDesignVariant();
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
        <SafeAreaView edges={["left", "right"]} style={styles.safeArea}>
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
      <TearReveal
        running={variant === "paper" && justSignedIn}
        onComplete={clearJustSignedIn}
      />
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
    paddingTop: 14,
    paddingBottom: 40,
  },
  column: {
    justifyContent: "flex-start",
  },
  headerArea: {
    alignItems: "center",
    marginBottom: 24,
  },
  categoryFilterRow: {
    width: "100%",
    marginTop: 14,
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
