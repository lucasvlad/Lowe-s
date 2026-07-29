import React, { useState } from "react";
import {
  Text,
  TextInput,
  TouchableOpacity,
  View,
  StyleSheet,
  ImageBackground,
  KeyboardAvoidingView,
  Platform,
  ActivityIndicator,
} from "react-native";
import { SafeAreaView } from "react-native-safe-area-context";
import { SvgBorder } from "@/components/login_field_border";
import { ScribbleLine } from "@/components/scribble_line";
import { EraseTransition } from "@/components/erase_transition";
import { Colors, PENCIL_FONT } from "@/constants/theme";
import type { VerifyVariantProps } from "@/components/login_variants/verify_types";

/** Variant A: matches PaperLogin — paper background, reveal-in transition, hand-drawn button. */
export function PaperVerify({
  digits,
  inputRefs,
  onDigitChange,
  onKeyPress,
  onVerify,
  isLoading,
  pendingEmail,
}: VerifyVariantProps) {
  // Start the reveal animation as soon as the screen mounts.
  const [revealing, setRevealing] = useState(true);

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
          <EraseTransition
            mode="reveal"
            running={revealing}
            backgroundColor={Colors.paper}
            onComplete={() => {
              setRevealing(false);
              setTimeout(() => inputRefs.current[0]?.focus(), 50);
            }}
          >
            <Text style={styles.title}>
              Enter the code we sent to{!pendingEmail ? " your email" : ""}
            </Text>
            {pendingEmail ? <Text style={styles.subtitle}>{pendingEmail}</Text> : null}

            <View style={styles.codeContainer}>
              {digits.map((digit, index) => (
                <View key={index} style={styles.digitWrapper}>
                  <TextInput
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
                    editable={!isLoading && !revealing}
                    textAlign="center"
                  />
                  <ScribbleLine />
                </View>
              ))}
            </View>

            <SvgBorder style={styles.buttonWrapper}>
              <TouchableOpacity
                style={[styles.button, isLoading && styles.buttonDisabled]}
                onPress={onVerify}
                disabled={isLoading || revealing}
              >
                {isLoading ? (
                  <ActivityIndicator color={Colors.ink} />
                ) : (
                  <Text style={styles.buttonText}>Enter</Text>
                )}
              </TouchableOpacity>
            </SvgBorder>
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
  title: {
    fontSize: 24,
    color: Colors.ink,
    marginBottom: 6,
    textAlign: "center",
    fontFamily: PENCIL_FONT,
  },
  subtitle: {
    fontSize: 20,
    color: Colors.ink,
    marginBottom: 40,
    textAlign: "center",
  },
  codeContainer: {
    flexDirection: "row",
    justifyContent: "center",
    gap: 10,
    marginBottom: 40,
    maxWidth: 380,
    alignSelf: "center",
    width: "100%",
  },
  digitWrapper: {
    flex: 1,
    maxWidth: 50,
    alignItems: "center",
    width: "100%",
  },
  digitInput: {
    fontSize: 32,
    color: Colors.ink,
    width: "100%",
    paddingBottom: 4,
    paddingHorizontal: 0,
    textAlign: "center",
  },
  buttonWrapper: {
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
