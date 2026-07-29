import { useCallback, useRef, useState } from "react";
import {
  ImageBackground,
  StyleSheet,
  View,
  Text,
  Image,
  FlatList,
  TouchableOpacity,
  ActivityIndicator,
  RefreshControl,
} from "react-native";
import { SafeAreaView } from "react-native-safe-area-context";
import { router } from "expo-router";
import { useFocusEffect } from "@react-navigation/native";
import { useAuth } from "@/contexts/AuthContext";
import { Colors } from "@/constants/theme";
import {
  deleteListing,
  fetchMyListings,
  formatPrice,
  type ListingRecord,
} from "@/utils/listings";
import { alertMessage, confirmAction } from "@/utils/alert";

const FALLBACK_IMAGE = require("../../assets/images/favicon.png");

export default function MyListingsScreen() {
  const { user } = useAuth();
  const [listings, setListings] = useState<ListingRecord[]>([]);
  const [isLoading, setIsLoading] = useState(true);
  const [isRefreshing, setIsRefreshing] = useState(false);
  const [error, setError] = useState<Error | null>(null);

  const load = useCallback(async () => {
    if (!user) return;
    try {
      const rows = await fetchMyListings(user.id);
      setListings(rows);
      setError(null);
    } catch (err) {
      setError(err instanceof Error ? err : new Error("Failed to load"));
    }
  }, [user]);

  // Refetch every time this tab regains focus (e.g. after posting or editing
  // a listing) rather than only once on first mount — tabs stay mounted, so a
  // plain useEffect would never see listings created after the initial load.
  const isFirstFocus = useRef(true);
  useFocusEffect(
    useCallback(() => {
      if (isFirstFocus.current) {
        isFirstFocus.current = false;
        setIsLoading(true);
        load().finally(() => setIsLoading(false));
      } else {
        load();
      }
    }, [load]),
  );

  const refresh = () => {
    setIsRefreshing(true);
    load().finally(() => setIsRefreshing(false));
  };

  const handleDelete = (listing: ListingRecord) => {
    confirmAction({
      title: "Delete listing?",
      message: `"${listing.title}" will be removed permanently.`,
      confirmLabel: "Delete",
      destructive: true,
      onConfirm: async () => {
        try {
          await deleteListing(listing.id);
          setListings((prev) => prev.filter((l) => l.id !== listing.id));
        } catch (err) {
          alertMessage(
            "Couldn't delete",
            err instanceof Error ? err.message : "Please try again.",
          );
        }
      },
    });
  };

  const renderItem = ({ item }: { item: ListingRecord }) => (
    <View style={styles.row}>
      <Image
        source={item.image_url ? { uri: item.image_url } : FALLBACK_IMAGE}
        style={styles.rowImage}
      />
      <View style={styles.rowInfo}>
        <Text style={styles.rowTitle} numberOfLines={1}>
          {item.title}
        </Text>
        <Text style={styles.rowPrice}>{formatPrice(item.price_cents)}</Text>
        <Text style={styles.rowStatus}>{item.status}</Text>
      </View>
      <View style={styles.rowActions}>
        <TouchableOpacity
          style={[styles.actionButton, styles.editButton]}
          onPress={() =>
            router.push({
              pathname: "/listing/[id]/edit",
              params: { id: item.id },
            })
          }
        >
          <Text style={styles.actionText}>Edit</Text>
        </TouchableOpacity>
        <TouchableOpacity
          style={[styles.actionButton, styles.deleteButton]}
          onPress={() => handleDelete(item)}
        >
          <Text style={styles.actionText}>Delete</Text>
        </TouchableOpacity>
      </View>
    </View>
  );

  return (
    <ImageBackground
      source={require("../../assets/images/cork_board.png")}
      style={styles.background}
      resizeMode="cover"
    >
      <SafeAreaView edges={["top", "left", "right"]} style={styles.safeArea}>
        <Text style={styles.title}>My listings</Text>
        <FlatList
          data={listings}
          keyExtractor={(item) => item.id}
          renderItem={renderItem}
          contentContainerStyle={styles.listContent}
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
                    ? "Couldn't load your listings. Pull down to retry."
                    : "You haven't posted anything yet."}
                </Text>
              </View>
            )
          }
        />
        {isLoading ? (
          <View style={styles.centerOverlay} pointerEvents="none">
            <ActivityIndicator size="large" color="#fff" />
          </View>
        ) : null}
      </SafeAreaView>
    </ImageBackground>
  );
}

const styles = StyleSheet.create({
  background: {
    width: "100%",
    height: "100%",
  },
  safeArea: {
    flex: 1,
  },
  title: {
    fontSize: 22,
    fontWeight: "800",
    color: "#fff",
    textShadowColor: "#00000088",
    textShadowRadius: 4,
    textAlign: "center",
    marginTop: 10,
    marginBottom: 12,
  },
  listContent: {
    paddingHorizontal: 16,
    paddingBottom: 40,
    gap: 12,
  },
  row: {
    flexDirection: "row",
    alignItems: "center",
    backgroundColor: Colors.dark.background,
    borderRadius: 8,
    padding: 10,
    gap: 10,
  },
  rowImage: {
    width: 56,
    height: 56,
    borderRadius: 6,
    resizeMode: "cover",
  },
  rowInfo: {
    flex: 1,
  },
  rowTitle: {
    fontSize: 15,
    fontWeight: "700",
    color: "#000",
  },
  rowPrice: {
    fontSize: 14,
    color: "#333",
    marginTop: 2,
  },
  rowStatus: {
    fontSize: 12,
    color: "#777",
    marginTop: 2,
    textTransform: "capitalize",
  },
  rowActions: {
    gap: 6,
  },
  actionButton: {
    paddingHorizontal: 12,
    paddingVertical: 6,
    borderRadius: 6,
  },
  editButton: {
    backgroundColor: "#0066cc",
  },
  deleteButton: {
    backgroundColor: "#cc3333",
  },
  actionText: {
    color: "#fff",
    fontWeight: "700",
    fontSize: 12,
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
  centerOverlay: {
    ...StyleSheet.absoluteFillObject,
    alignItems: "center",
    justifyContent: "center",
  },
});
