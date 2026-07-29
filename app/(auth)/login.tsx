import React, { useEffect, useState } from "react";
import { View, Text, TouchableOpacity, StyleSheet, Platform } from "react-native";
import { SafeAreaView } from "react-native-safe-area-context";
import { useAuth } from "@/contexts/AuthContext";
import { useDesignVariant } from "@/contexts/DesignVariantContext";
import { PaperLogin } from "@/components/login_variants/paper_login";
import { RetroLogin } from "@/components/login_variants/retro_login";
import { Colors } from "@/constants/theme";

export default function LoginScreen() {
  const [email, setEmail] = useState("");
  const { requestCode, isLoading } = useAuth();
  const { variant, setVariant } = useDesignVariant();

  useEffect(() => {
    if (Platform.OS === "web") {
      const style = document.createElement("style");
      style.textContent = `input:focus { outline: none !important; }`;
      document.head.appendChild(style);
      return () => {
        document.head.removeChild(style);
      };
    }
  }, []);

  const variantProps = { email, setEmail, isLoading, onRequestCode: requestCode };

  return (
    <View style={styles.container}>
      {variant === "paper" ? (
        <PaperLogin {...variantProps} />
      ) : (
        <RetroLogin {...variantProps} />
      )}

      {/* Temporary A/B toggle so the two login designs can be compared before one is picked. */}
      <SafeAreaView style={styles.toggleSafeArea} edges={["top", "right"]} pointerEvents="box-none">
        <View style={styles.toggleRow}>
          <TouchableOpacity
            style={[styles.toggleButton, variant === "paper" && styles.toggleButtonActive]}
            onPress={() => setVariant("paper")}
          >
            <Text
              style={[styles.toggleText, variant === "paper" && styles.toggleTextActive]}
            >
              Paper
            </Text>
          </TouchableOpacity>
          <TouchableOpacity
            style={[styles.toggleButton, variant === "retro" && styles.toggleButtonActive]}
            onPress={() => setVariant("retro")}
          >
            <Text
              style={[styles.toggleText, variant === "retro" && styles.toggleTextActive]}
            >
              Retro
            </Text>
          </TouchableOpacity>
        </View>
      </SafeAreaView>
    </View>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
  },
  toggleSafeArea: {
    position: "absolute",
    top: 0,
    left: 0,
    right: 0,
    alignItems: "flex-end",
  },
  toggleRow: {
    flexDirection: "row",
    gap: 6,
    backgroundColor: "#00000055",
    borderRadius: 20,
    padding: 4,
    margin: 12,
  },
  toggleButton: {
    paddingHorizontal: 12,
    paddingVertical: 6,
    borderRadius: 16,
  },
  toggleButtonActive: {
    backgroundColor: "#fff",
  },
  toggleText: {
    color: "#fff",
    fontSize: 12,
    fontWeight: "700",
  },
  toggleTextActive: {
    color: Colors.ink,
  },
});
