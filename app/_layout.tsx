// import { DarkTheme, ThemeProvider } from "@react-navigation/native";
// import { Stack } from "expo-router";

// import "react-native-reanimated";

// export default function RootLayout() {
//   return (
//     <ThemeProvider value={DarkTheme}>
//       <Stack screenOptions={{ headerShown: false }}></Stack>
//     </ThemeProvider>
//   );
// }

import { DarkTheme, ThemeProvider } from "@react-navigation/native";
import { Slot, useRouter, useSegments } from "expo-router";
import { useEffect } from "react";
import "react-native-reanimated";
import { AuthProvider, useAuth } from "@/contexts/AuthContext";

// Navigation guard component
function NavigationGuard() {
  const { isAuthenticated, isLoading } = useAuth();
  const segments = useSegments();
  const router = useRouter();

  useEffect(() => {
    if (isLoading) return;

    const inAuthGroup = segments[0] === "(auth)";
    const inTabsGroup = segments[0] === "(tabs)";

    if (!isAuthenticated && !inAuthGroup) {
      // Redirect to login if not authenticated and not in auth group
      router.replace("/(auth)/login");
    } else if (isAuthenticated && inAuthGroup) {
      // Redirect to tabs if authenticated and in auth group
      router.replace("/(tabs)");
    }
  }, [isAuthenticated, segments, isLoading]);

  return <Slot />;
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
