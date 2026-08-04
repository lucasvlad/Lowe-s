import { useCallback, useRef, useState } from "react";
import {
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
import { Colors, PENCIL_FONT } from "@/constants/theme";
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
          onPress={() =>
            router.push({
              pathname: "/listing/[id]/edit",
              params: { id: item.id },
            })
          }
        >
          <Text style={styles.editLink}>Edit</Text>
        </TouchableOpacity>
        <TouchableOpacity onPress={() => handleDelete(item)}>
          <Text style={styles.deleteLink}>Delete</Text>
        </TouchableOpacity>
      </View>
    </View>
  );

  return (
    <View style={styles.background}>
      <SafeAreaView edges={["left", "right"]} style={styles.safeArea}>
        <Text style={styles.title}>My listings</Text>
        <FlatList
          data={listings}
          keyExtractor={(item) => item.id}
          renderItem={renderItem}
          contentContainerStyle={styles.listContent}
          refreshControl={
            <RefreshControl refreshing={isRefreshing} onRefresh={refresh} />
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
            <ActivityIndicator size="large" color={Colors.accent} />
          </View>
        ) : null}
      </SafeAreaView>
    </View>
  );
}

const styles = StyleSheet.create({
  background: {
    flex: 1,
    backgroundColor: Colors.paper,
  },
  safeArea: {
    flex: 1,
  },
  title: {
    fontSize: 26,
    color: Colors.ink,
    textAlign: "center",
    marginTop: 12,
    marginBottom: 16,
    fontFamily: PENCIL_FONT,
  },
  listContent: {
    paddingHorizontal: 16,
    paddingBottom: 40,
    gap: 12,
  },
  row: {
    flexDirection: "row",
    alignItems: "center",
    backgroundColor: Colors.card,
    borderWidth: 2,
    borderColor: Colors.ink,
    padding: 10,
    gap: 10,
  },
  rowImage: {
    width: 56,
    height: 56,
    resizeMode: "cover",
  },
  rowInfo: {
    flex: 1,
  },
  rowTitle: {
    fontSize: 15,
    fontWeight: "700",
    color: Colors.ink,
  },
  rowPrice: {
    fontSize: 14,
    color: Colors.ink,
    marginTop: 2,
  },
  rowStatus: {
    fontSize: 12,
    color: Colors.inkMuted,
    marginTop: 2,
    textTransform: "capitalize",
  },
  rowActions: {
    gap: 8,
    alignItems: "flex-end",
  },
  editLink: {
    color: Colors.accent,
    fontWeight: "700",
    fontSize: 13,
  },
  deleteLink: {
    color: Colors.danger,
    fontWeight: "700",
    fontSize: 13,
  },
  stateBox: {
    alignItems: "center",
    paddingVertical: 60,
    paddingHorizontal: 24,
  },
  stateText: {
    color: Colors.ink,
    fontSize: 16,
    fontWeight: "600",
    textAlign: "center",
  },
  centerOverlay: {
    ...StyleSheet.absoluteFillObject,
    alignItems: "center",
    justifyContent: "center",
  },
});
