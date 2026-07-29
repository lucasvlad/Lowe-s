import React, { useState, useRef, useEffect } from "react";
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
import { useAuth } from "@/contexts/AuthContext";
import { useFonts } from "expo-font";
import { SvgBorder } from "@/components/login_field_border";
import { ScribbleLine } from "@/components/scribble_line";
import { EraseTransition } from "@/components/erase_transition";
import { alertMessage } from "@/utils/alert";

const CODE_LENGTH = 6;

export default function VerifyScreen() {
  const [digits, setDigits] = useState<string[]>(Array(CODE_LENGTH).fill(""));
  // Start the reveal animation as soon as the screen mounts
  const [revealing, setRevealing] = useState(true);
  const inputRefs = useRef<(TextInput | null)[]>([]);
  const { verifyCode, pendingEmail, isLoading } = useAuth();

  const [fontsLoaded] = useFonts({
    PencilFont: require("../../assets/fonts/pencil_type_beat.ttf"),
  });

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

  if (!fontsLoaded) return null;

  const handleDigitChange = (text: string, index: number) => {
    const cleaned = text.replace(/[^0-9]/g, "");
    if (cleaned.length > 1) {
      const pasted = cleaned.slice(0, CODE_LENGTH).split("");
      const newDigits = [...digits];
      pasted.forEach((char, i) => {
        if (index + i < CODE_LENGTH) newDigits[index + i] = char;
      });
      setDigits(newDigits);
      const nextIndex = Math.min(index + pasted.length, CODE_LENGTH - 1);
      inputRefs.current[nextIndex]?.focus();
      return;
    }
    const newDigits = [...digits];
    newDigits[index] = cleaned;
    setDigits(newDigits);
    if (cleaned && index < CODE_LENGTH - 1) {
      inputRefs.current[index + 1]?.focus();
    }
  };

  const handleKeyPress = (e: any, index: number) => {
    if (e.nativeEvent.key === "Backspace" && !digits[index] && index > 0) {
      const newDigits = [...digits];
      newDigits[index - 1] = "";
      setDigits(newDigits);
      inputRefs.current[index - 1]?.focus();
    }
  };

  const handleVerify = async () => {
    const code = digits.join("");
    if (code.length < CODE_LENGTH) {
      alertMessage("Error", "Please enter the full 6-digit code");
      return;
    }
    try {
      await verifyCode(code);
    } catch {
      alertMessage("Invalid Code", "That code didn't work, please try again");
      setDigits(Array(CODE_LENGTH).fill(""));
      inputRefs.current[0]?.focus();
    }
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
          <EraseTransition
            mode="reveal"
            running={revealing}
            backgroundColor="#e8dcc8"
            onComplete={() => {
              setRevealing(false);
              // Focus first input once reveal finishes
              setTimeout(() => inputRefs.current[0]?.focus(), 50);
            }}
          >
            <Text style={styles.title}>
              Enter the code we sent to{!pendingEmail ? " your email" : ""}
            </Text>
            {pendingEmail ? (
              <Text style={styles.subtitle}>{pendingEmail}</Text>
            ) : null}

            <View style={styles.codeContainer}>
              {digits.map((digit, index) => (
                <View key={index} style={styles.digitWrapper}>
                  <TextInput
                    ref={(ref) => {
                      inputRefs.current[index] = ref;
                    }}
                    style={styles.digitInput}
                    value={digit}
                    onChangeText={(text) => handleDigitChange(text, index)}
                    onKeyPress={(e) => handleKeyPress(e, index)}
                    keyboardType="number-pad"
                    maxLength={6}
                    selectionColor="#000"
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
                onPress={handleVerify}
                disabled={isLoading || revealing}
              >
                {isLoading ? (
                  <ActivityIndicator color="#000" />
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
    color: "#000",
    marginBottom: 6,
    textAlign: "center",
    fontFamily: "PencilFont",
  },
  subtitle: {
    fontSize: 20,
    color: "#000",
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
    color: "#000",
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
    color: "#000",
    fontSize: 24,
    fontFamily: "PencilFont",
  },
  buttonDisabled: {
    opacity: 0.5,
  },
});
