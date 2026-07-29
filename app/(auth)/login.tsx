import React, { useState, useEffect } from "react";
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
import {
  useAuth,
  isAllowedEmail,
  ALLOWED_EMAIL_DOMAIN,
} from "@/contexts/AuthContext";
import { useFonts } from "expo-font";
import { SvgBorder } from "@/components/login_field_border";
import { EraseTransition } from "@/components/erase_transition";
import { alertMessage } from "@/utils/alert";

export default function LoginScreen() {
  const [email, setEmail] = useState("");
  const [erasing, setErasing] = useState(false);
  const { requestCode, isLoading } = useAuth();

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
    setErasing(true);
    // requestCode fires once the erase animation finishes (via onComplete)
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
            backgroundColor="#e8dcc8" // match your login_background.png colour
            onComplete={async () => {
              try {
                await requestCode(email);
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
                    placeholderTextColor="#000"
                    value={email}
                    onChangeText={setEmail}
                    autoCapitalize="none"
                    keyboardType="email-address"
                    editable={!isLoading && !erasing}
                    selectionColor="#000"
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
                    <ActivityIndicator color="#000" />
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
    fontSize: 52,
    color: "#000",
    marginBottom: 8,
    textAlign: "center",
    fontFamily: "PencilFont",
  },
  subtitle: {
    fontSize: 64,
    color: "#000",
    marginBottom: 30,
    textAlign: "center",
    fontFamily: "PencilFont",
  },
  inputContainer: {
    marginBottom: 20,
  },
  label: {
    fontSize: 26,
    color: "#000",
    marginBottom: 4,
    fontFamily: "PencilFont",
    paddingLeft: 15,
  },
  inputWrapper: {
    height: 58,
  },
  input: {
    flex: 1,
    fontSize: 20,
    color: "#000",
    paddingHorizontal: 0,
    fontFamily: "PencilFont",
  },
  buttonWrapper: {
    marginTop: 10,
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
  signupContainer: {
    flexDirection: "row",
    justifyContent: "center",
    marginTop: 20,
  },
});
