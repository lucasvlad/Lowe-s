import React, { useState } from "react";
import {
  View,
  Text,
  TextInput,
  StyleSheet,
  KeyboardAvoidingView,
  Platform,
} from "react-native";
import { SafeAreaView } from "react-native-safe-area-context";
import { isAllowedEmail, ALLOWED_EMAIL_DOMAIN } from "@/contexts/AuthContext";
import { RetroButton } from "@/components/retro_button";
import { alertMessage } from "@/utils/alert";
import { Colors } from "@/constants/theme";
import type { LoginVariantProps } from "@/components/login_variants/types";

/**
 * Variant B: a simpler "classic web form" retro look — solid bordered box,
 * bold banner title, no paper texture or reveal animation.
 */
export function RetroLogin({
  email,
  setEmail,
  isLoading,
  onRequestCode,
}: LoginVariantProps) {
  const [submitting, setSubmitting] = useState(false);

  const handleLogin = async () => {
    if (!email.trim()) {
      alertMessage("Error", "Please enter your email");
      return;
    }
    if (!isAllowedEmail(email)) {
      alertMessage(
        "Covenant email required",
        `Please sign in with your @${ALLOWED_EMAIL_DOMAIN} email address.`,
      );
      return;
    }
    setSubmitting(true);
    try {
      await onRequestCode(email);
    } catch (err) {
      alertMessage(
        "Couldn't send code",
        err instanceof Error ? err.message : "Something went wrong, please try again.",
      );
    } finally {
      setSubmitting(false);
    }
  };

  const busy = isLoading || submitting;

  return (
    <View style={styles.background}>
      <SafeAreaView style={styles.container}>
        <KeyboardAvoidingView
          behavior={Platform.OS === "ios" ? "padding" : "height"}
          style={styles.keyboardView}
        >
          <View style={styles.banner}>
            <Text style={styles.title}>WELCOME TO LOWE&apos;S</Text>
            <View style={styles.rule} />
            <Text style={styles.subtitle}>Covenant&apos;s campus marketplace</Text>
          </View>

          <View style={styles.card}>
            <Text style={styles.label}>EMAIL ADDRESS</Text>
            <TextInput
              style={styles.input}
              placeholder="you@covenant.edu"
              placeholderTextColor={Colors.inkMuted}
              value={email}
              onChangeText={setEmail}
              autoCapitalize="none"
              keyboardType="email-address"
              editable={!busy}
              selectionColor={Colors.ink}
            />
            <RetroButton
              label={busy ? "Sending..." : "Sign In"}
              onPress={handleLogin}
              disabled={busy}
              loading={busy}
              style={styles.submitButton}
            />
          </View>
        </KeyboardAvoidingView>
      </SafeAreaView>
    </View>
  );
}

const styles = StyleSheet.create({
  background: {
    flex: 1,
    backgroundColor: Colors.paper,
  },
  container: {
    flex: 1,
  },
  keyboardView: {
    flex: 1,
    justifyContent: "center",
    padding: 24,
  },
  banner: {
    alignSelf: "center",
    alignItems: "center",
    marginBottom: 32,
  },
  title: {
    fontSize: 30,
    fontWeight: "800",
    color: Colors.ink,
    letterSpacing: 2,
    textAlign: "center",
  },
  rule: {
    width: 120,
    height: 4,
    backgroundColor: Colors.accent,
    marginTop: 10,
    marginBottom: 10,
  },
  subtitle: {
    fontSize: 13,
    color: Colors.inkMuted,
    fontWeight: "600",
    textAlign: "center",
  },
  card: {
    alignSelf: "center",
    width: "100%",
    maxWidth: 380,
    backgroundColor: Colors.card,
    borderWidth: 3,
    borderColor: Colors.ink,
    padding: 24,
  },
  label: {
    fontSize: 12,
    fontWeight: "800",
    color: Colors.ink,
    letterSpacing: 1,
    marginBottom: 6,
  },
  input: {
    borderWidth: 2,
    borderColor: Colors.ink,
    backgroundColor: "#fff",
    fontSize: 16,
    color: Colors.ink,
    paddingHorizontal: 12,
    paddingVertical: 10,
    marginBottom: 18,
  },
  submitButton: {
    width: "100%",
  },
});
