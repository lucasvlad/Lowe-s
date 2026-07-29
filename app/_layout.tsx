import { DarkTheme, ThemeProvider } from "@react-navigation/native";
import { Stack, useRouter, useSegments } from "expo-router";
import { useEffect } from "react";
import { useFonts } from "expo-font";
import "react-native-reanimated";
import { AuthProvider, useAuth } from "@/contexts/AuthContext";
import { DesignVariantProvider } from "@/contexts/DesignVariantContext";
import { PENCIL_FONT } from "@/constants/theme";

// Redirects between the (auth) and (tabs) route groups based on auth state.
function NavigationGuard() {
  const { isAuthenticated, isLoading } = useAuth();
  const segments = useSegments();
  const router = useRouter();

  useEffect(() => {
    if (isLoading) return;

    const inAuthGroup = segments[0] === "(auth)";

    if (!isAuthenticated && !inAuthGroup) {
      router.replace("/(auth)/login");
    } else if (isAuthenticated && inAuthGroup) {
      router.replace("/(tabs)");
    }
  }, [isAuthenticated, segments, isLoading, router]);

  // A root Stack lets the listing detail screen push over the (tabs) group.
  return <Stack screenOptions={{ headerShown: false }} />;
}

export default function RootLayout() {
  // Loaded once here (rather than per-screen) so every screen's headings can
  // use it, not just the auth flow.
  const [fontsLoaded] = useFonts({
    [PENCIL_FONT]: require("../assets/fonts/pencil_type_beat.ttf"),
  });

  if (!fontsLoaded) return null;

  return (
    <ThemeProvider value={DarkTheme}>
      <DesignVariantProvider>
        <AuthProvider>
          <NavigationGuard />
        </AuthProvider>
      </DesignVariantProvider>
    </ThemeProvider>
  );
}
