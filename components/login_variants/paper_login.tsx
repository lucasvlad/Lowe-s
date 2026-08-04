import React, { useState } from "react";
import {
  View,
  Text,
  TextInput,
  TouchableOpacity,
  StyleSheet,
  ImageBackground,
  KeyboardAvoidingView,
  Platform,
  ActivityIndicator,
} from "react-native";
import { SafeAreaView } from "react-native-safe-area-context";
import { isAllowedEmail, ALLOWED_EMAIL_DOMAIN } from "@/contexts/AuthContext";
import { SvgBorder } from "@/components/login_field_border";
import { EraseTransition } from "@/components/erase_transition";
import { alertMessage } from "@/utils/alert";
import { Colors, PENCIL_FONT } from "@/constants/theme";
import type { LoginVariantProps } from "@/components/login_variants/types";

/** Variant A: paper background, scribbled title, hand-drawn field borders, erase-transition submit. */
export function PaperLogin({
  email,
  setEmail,
  isLoading,
  onRequestCode,
}: LoginVariantProps) {
  const [erasing, setErasing] = useState(false);

  const handleLogin = () => {
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
    setErasing(true);
    // onRequestCode fires once the erase animation finishes (via onComplete)
  };

  return (
    <ImageBackground
      source={require("../../assets/images/login_background.png")}
      style={styles.backgroundImage}
      resizeMode="cover"
    >
      <SafeAreaView style={styles.container}>
        <KeyboardAvoidingView
          behavior={Platform.OS === "ios" ? "padding" : "height"}
          style={styles.keyboardView}
        >
          {/* EraseTransition wraps ONLY the content, not the background */}
          <EraseTransition
            mode="erase"
            running={erasing}
            backgroundColor={Colors.paper}
            onComplete={async () => {
              try {
                await onRequestCode(email);
              } catch (err) {
                setErasing(false);
                alertMessage(
                  "Couldn't send code",
                  err instanceof Error
                    ? err.message
                    : "Something went wrong, please try again.",
                );
              }
            }}
          >
            <Text style={styles.title}>Welcome To</Text>
            <Text style={styles.subtitle}>Lowe{"`"}s</Text>
            <View style={styles.formContainer}>
              <View style={styles.inputContainer}>
                <Text style={styles.label}>Email</Text>
                <SvgBorder style={styles.inputWrapper}>
                  <TextInput
                    style={styles.input}
                    placeholder="Enter your Covenant email"
                    placeholderTextColor={Colors.inkMuted}
                    value={email}
                    onChangeText={setEmail}
                    autoCapitalize="none"
                    keyboardType="email-address"
                    editable={!isLoading && !erasing}
                    selectionColor={Colors.ink}
                  />
                </SvgBorder>
              </View>
              <SvgBorder style={styles.buttonWrapper}>
                <TouchableOpacity
                  style={[
                    styles.button,
                    (isLoading || erasing) && styles.buttonDisabled,
                  ]}
                  onPress={handleLogin}
                  disabled={isLoading || erasing}
                >
                  {isLoading ? (
                    <ActivityIndicator color={Colors.ink} />
                  ) : (
                    <Text style={styles.buttonText}>Sign In</Text>
                  )}
                </TouchableOpacity>
              </SvgBorder>
            </View>
          </EraseTransition>
        </KeyboardAvoidingView>
      </SafeAreaView>
    </ImageBackground>
  );
}

const styles = StyleSheet.create({
  backgroundImage: {
    flex: 1,
    width: "100%",
    height: "100%",
  },
  container: {
    flex: 1,
  },
  keyboardView: {
    flex: 1,
    justifyContent: "center",
    padding: 20,
  },
  formContainer: {
    padding: 30,
    maxWidth: 400,
    alignSelf: "center",
    width: "100%",
  },
  title: {
    fontSize: 48,
    color: Colors.ink,
    marginBottom: 4,
    textAlign: "center",
    fontFamily: PENCIL_FONT,
  },
  subtitle: {
    fontSize: 60,
    color: Colors.ink,
    marginBottom: 26,
    textAlign: "center",
    fontFamily: PENCIL_FONT,
  },
  inputContainer: {
    marginBottom: 20,
  },
  label: {
    fontSize: 24,
    color: Colors.ink,
    marginBottom: 4,
    fontFamily: PENCIL_FONT,
    paddingLeft: 15,
  },
  inputWrapper: {
    height: 58,
  },
  input: {
    flex: 1,
    fontSize: 20,
    color: Colors.ink,
    paddingHorizontal: 0,
    fontFamily: PENCIL_FONT,
  },
  buttonWrapper: {
    marginTop: 14,
    height: 58,
    maxWidth: 150,
    alignSelf: "center",
    width: "100%",
  },
  button: {
    flex: 1,
    alignItems: "center",
    justifyContent: "center",
  },
  buttonText: {
    color: Colors.ink,
    fontSize: 24,
    fontFamily: PENCIL_FONT,
  },
  buttonDisabled: {
    opacity: 0.5,
  },
});
