import { Redirect, Tabs } from "expo-router";
import { View, ActivityIndicator, StyleSheet } from "react-native";
import { useAuth } from "@/contexts/AuthContext";
import { TopNav } from "@/components/top_nav";
import { Colors } from "@/constants/theme";

export default function TabsLayout() {
  const { isAuthenticated, isInitializing } = useAuth();

  // Only the one-time cold-start session check gates the whole tab area —
  // isLoading (e.g. mid sign-out) must NOT, or it'd flash this over the
  // current screen for the brief moment before the redirect fires.
  if (isInitializing) {
    return (
      <View style={styles.loadingContainer}>
        <ActivityIndicator size="large" color={Colors.accent} />
      </View>
    );
  }

  // If not authenticated, redirect to login
  if (!isAuthenticated) {
    return <Redirect href="/(auth)/login" />;
  }

  return (
    <View style={styles.container}>
      <TopNav />
      {/*
        Still a real Tabs navigator (screens stay mounted across switches,
        which the Home/My Listings focus-based refresh relies on) — just with
        its own bar hidden in favor of TopNav above.
      */}
      <View style={styles.tabsContainer}>
        <Tabs
          tabBar={() => null}
          screenOptions={{ headerShown: false }}
        >
          <Tabs.Screen name="index" options={{ title: "Home" }} />
          <Tabs.Screen name="post" options={{ title: "Sell" }} />
          <Tabs.Screen name="my-listings" options={{ title: "My Listings" }} />
        </Tabs>
      </View>
    </View>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
  },
  tabsContainer: {
    flex: 1,
  },
  loadingContainer: {
    flex: 1,
    justifyContent: "center",
    alignItems: "center",
    backgroundColor: Colors.paper,
  },
});
