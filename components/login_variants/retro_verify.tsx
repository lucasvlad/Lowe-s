import React, { useEffect } from "react";
import {
  Text,
  TextInput,
  View,
  StyleSheet,
  KeyboardAvoidingView,
  Platform,
} from "react-native";
import { SafeAreaView } from "react-native-safe-area-context";
import { RetroButton } from "@/components/retro_button";
import { Colors } from "@/constants/theme";
import type { VerifyVariantProps } from "@/components/login_variants/verify_types";

/** Variant B: matches RetroLogin — solid bordered boxes, no paper texture or reveal animation. */
export function RetroVerify({
  digits,
  inputRefs,
  onDigitChange,
  onKeyPress,
  onVerify,
  isLoading,
  pendingEmail,
}: VerifyVariantProps) {
  useEffect(() => {
    const timeout = setTimeout(() => inputRefs.current[0]?.focus(), 50);
    return () => clearTimeout(timeout);
  }, [inputRefs]);

  return (
    <View style={styles.background}>
      <SafeAreaView style={styles.container}>
        <KeyboardAvoidingView
          behavior={Platform.OS === "ios" ? "padding" : "height"}
          style={styles.keyboardView}
        >
          <View style={styles.banner}>
            <Text style={styles.title}>ENTER YOUR CODE</Text>
            <View style={styles.rule} />
            {pendingEmail ? <Text style={styles.subtitle}>Sent to {pendingEmail}</Text> : null}
          </View>

          <View style={styles.card}>
            <View style={styles.codeContainer}>
              {digits.map((digit, index) => (
                <TextInput
                  key={index}
                  ref={(ref) => {
                    inputRefs.current[index] = ref;
                  }}
                  style={styles.digitInput}
                  value={digit}
                  onChangeText={(text) => onDigitChange(text, index)}
                  onKeyPress={(e) => onKeyPress(e, index)}
                  keyboardType="number-pad"
                  maxLength={6}
                  selectionColor={Colors.ink}
                  editable={!isLoading}
                  textAlign="center"
                />
              ))}
            </View>
            <RetroButton
              label={isLoading ? "Verifying..." : "Enter"}
              onPress={onVerify}
              disabled={isLoading}
              loading={isLoading}
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
    fontSize: 26,
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
  codeContainer: {
    flexDirection: "row",
    justifyContent: "center",
    gap: 8,
    marginBottom: 20,
  },
  digitInput: {
    flex: 1,
    maxWidth: 44,
    fontSize: 24,
    fontWeight: "700",
    color: Colors.ink,
    borderWidth: 2,
    borderColor: Colors.ink,
    backgroundColor: "#fff",
    paddingVertical: 8,
  },
  submitButton: {
    width: "100%",
  },
});
