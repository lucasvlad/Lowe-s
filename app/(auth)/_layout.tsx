import { Redirect, Stack } from "expo-router";
import { useAuth } from "@/contexts/AuthContext";
import { View, ActivityIndicator, StyleSheet } from "react-native";
import { Colors } from "@/constants/theme";

export default function AuthLayout() {
  const { isAuthenticated, isInitializing } = useAuth();

  // Only the one-time cold-start session check gates the whole screen —
  // isLoading (per-action, e.g. mid "Sign In" tap) must NOT, or every login/
  // verify submit would unmount the screen into this spinner mid-flow.
  if (isInitializing) {
    return (
      <View style={styles.loadingContainer}>
        <ActivityIndicator size="large" color={Colors.accent} />
      </View>
    );
  }

  if (isAuthenticated) {
    return <Redirect href="/(tabs)" />;
  }

  return (
    <Stack screenOptions={{ headerShown: false, animation: "none" }}>
      <Stack.Screen name="login" />
      <Stack.Screen name="verify" />
    </Stack>
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
