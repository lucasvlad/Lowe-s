import { DarkTheme, ThemeProvider } from "@react-navigation/native";
import { Stack, useRouter, useSegments } from "expo-router";
import { useEffect } from "react";
import "react-native-reanimated";
import { AuthProvider, useAuth } from "@/contexts/AuthContext";

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
  return (
    <ThemeProvider value={DarkTheme}>
      <AuthProvider>
        <NavigationGuard />
      </AuthProvider>
    </ThemeProvider>
  );
}
