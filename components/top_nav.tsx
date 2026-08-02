import { View, Text, TouchableOpacity, StyleSheet } from "react-native";
import { router, usePathname, type Href } from "expo-router";
import { SafeAreaView } from "react-native-safe-area-context";
import { useAuth } from "@/contexts/AuthContext";
import { Colors, PENCIL_FONT } from "@/constants/theme";

const NAV_ITEMS: { label: string; href: Href; match: string }[] = [
  { label: "Home", href: "/(tabs)", match: "/" },
  { label: "Sell", href: "/(tabs)/post", match: "/post" },
  { label: "My Listings", href: "/(tabs)/my-listings", match: "/my-listings" },
];

// Covenant emails are formatted first.last@covenant.edu, so the local part
// before the first "." is the first name. Capitalize it for the greeting.
function firstNameFromEmail(email?: string): string {
  const first = email?.split("@")[0]?.split(".")[0] ?? "";
  return first ? first.charAt(0).toUpperCase() + first.slice(1) : "there";
}

/** 90s-web-style top nav replacing the native bottom tab bar. */
export function TopNav() {
  const pathname = usePathname();
  const { user, signOut } = useAuth();

  return (
    <SafeAreaView edges={["top", "left", "right"]} style={styles.safeArea}>
      <View style={styles.bar}>
        <TouchableOpacity onPress={() => router.push("/(tabs)")}>
          <Text style={styles.brand}>Lowe{"'"}s</Text>
        </TouchableOpacity>
        <View style={styles.links}>
          {NAV_ITEMS.map((item) => {
            const active = pathname === item.match;
            return (
              <TouchableOpacity key={item.match} onPress={() => router.push(item.href)}>
                <Text style={[styles.link, active && styles.linkActive]}>{item.label}</Text>
              </TouchableOpacity>
            );
          })}
        </View>
        <View style={styles.userArea}>
          <Text style={styles.welcome}>Hi, {firstNameFromEmail(user?.email)}</Text>
          <TouchableOpacity onPress={signOut}>
            <Text style={styles.logout}>Sign out</Text>
          </TouchableOpacity>
        </View>
      </View>
      <View style={styles.rule} />
    </SafeAreaView>
  );
}

const styles = StyleSheet.create({
  safeArea: {
    backgroundColor: Colors.paper,
  },
  bar: {
    flexDirection: "row",
    alignItems: "center",
    flexWrap: "wrap",
    paddingHorizontal: 16,
    paddingVertical: 10,
    gap: 16,
  },
  brand: {
    fontSize: 22,
    fontFamily: PENCIL_FONT,
    color: Colors.ink,
    marginRight: 4,
  },
  links: {
    flexDirection: "row",
    gap: 18,
    flexGrow: 1,
  },
  link: {
    fontSize: 14,
    fontWeight: "700",
    color: Colors.inkMuted,
  },
  linkActive: {
    color: Colors.accent,
    textDecorationLine: "underline",
  },
  userArea: {
    flexDirection: "row",
    alignItems: "center",
    gap: 14,
    marginLeft: "auto",
  },
  welcome: {
    fontSize: 13,
    fontWeight: "600",
    color: Colors.ink,
  },
  logout: {
    fontSize: 13,
    fontWeight: "700",
    color: Colors.danger,
  },
  rule: {
    height: 3,
    backgroundColor: Colors.ink,
  },
});
