import { DarkTheme, ThemeProvider } from "@react-navigation/native";
import { Stack } from "expo-router";
import "react-native-reanimated";

export default function RootLayout() {
  return (
    <ThemeProvider value={DarkTheme}>
      <Stack />
    </ThemeProvider>
  );
}
