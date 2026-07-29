import { DefaultTheme, ThemeProvider } from "@react-navigation/native";
import { Stack, useRouter, useSegments } from "expo-router";
import { useEffect } from "react";
import { useFonts } from "expo-font";
import { View, ActivityIndicator, StyleSheet } from "react-native";
import "react-native-reanimated";
import { AuthProvider, useAuth } from "@/contexts/AuthContext";
import { DesignVariantProvider } from "@/contexts/DesignVariantContext";
import { Colors, PENCIL_FONT } from "@/constants/theme";

// The app's own screens always paint their own (paper/cork) background, but
// React Navigation's container shows this theme's background during any gap
// where they haven't yet — e.g. between screen transitions. The default
// DarkTheme's background is pure black, which is what was flashing behind
// every loading spinner; this keeps that gap on-theme instead.
const AppTheme = {
  ...DefaultTheme,
  colors: {
    ...DefaultTheme.colors,
    primary: Colors.accent,
    background: Colors.paper,
    card: Colors.card,
    text: Colors.ink,
    border: Colors.ink,
    notification: Colors.danger,
  },
};

// Redirects between the (auth) and (tabs) route groups based on auth state.
function NavigationGuard() {
  const { isAuthenticated, isInitializing } = useAuth();
  const segments = useSegments();
  const router = useRouter();

  useEffect(() => {
    if (isInitializing) return;

    const inAuthGroup = segments[0] === "(auth)";

    if (!isAuthenticated && !inAuthGroup) {
      router.replace("/(auth)/login");
    } else if (isAuthenticated && inAuthGroup) {
      router.replace("/(tabs)");
    }
  }, [isAuthenticated, segments, isInitializing, router]);

  // A root Stack lets the listing detail screen push over the (tabs) group.
  return <Stack screenOptions={{ headerShown: false }} />;
}

export default function RootLayout() {
  // Loaded once here (rather than per-screen) so every screen's headings can
  // use it, not just the auth flow.
  const [fontsLoaded] = useFonts({
    [PENCIL_FONT]: require("../assets/fonts/pencil_type_beat.ttf"),
  });

  if (!fontsLoaded) {
    return (
      <View style={styles.loadingContainer}>
        <ActivityIndicator size="large" color={Colors.accent} />
      </View>
    );
  }

  return (
    <ThemeProvider value={AppTheme}>
      <DesignVariantProvider>
        <AuthProvider>
          <NavigationGuard />
        </AuthProvider>
      </DesignVariantProvider>
    </ThemeProvider>
  );
}

const styles = StyleSheet.create({
  loadingContainer: {
    flex: 1,
    justifyContent: "center",
    alignItems: "center",
    backgroundColor: Colors.paper,
  },
});
