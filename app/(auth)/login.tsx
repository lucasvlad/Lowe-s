import React, { useState, useEffect, useRef } from "react";
import {
  View,
  Text,
  TextInput,
  TouchableOpacity,
  StyleSheet,
  Alert,
  ImageBackground,
  KeyboardAvoidingView,
  Platform,
  ActivityIndicator,
} from "react-native";
import { SafeAreaView } from "react-native-safe-area-context";
import { useAuth } from "@/contexts/AuthContext";
import { useFonts } from "expo-font";
import { SvgBorder } from "@/components/login_field_border";

export default function LoginScreen() {
  const [email, setEmail] = useState("");
  const { signIn, isLoading } = useAuth();

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

  if (!fontsLoaded) {
    return null;
  }

  const handleLogin = async () => {
    if (!email) {
      Alert.alert("Error", "Please fill in all fields");
      return;
    }

    try {
      await signIn(email);
    } catch {
      Alert.alert("Login Failed", "Invalid email or password");
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
          <Text style={styles.title}>Welcome To</Text>
          {/* replace this with the lowe's logo */}
          <Text style={styles.subtitle}>Lowe{`'`}s</Text>
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
                  editable={!isLoading}
                  selectionColor="#000"
                />
              </SvgBorder>
            </View>
            <SvgBorder style={styles.buttonWrapper}>
              <TouchableOpacity
                style={[styles.button, isLoading && styles.buttonDisabled]}
                onPress={handleLogin}
                disabled={isLoading}
              >
                {isLoading ? (
                  <ActivityIndicator color="#000" />
                ) : (
                  <Text style={styles.buttonText}>Sign In</Text>
                )}
              </TouchableOpacity>
            </SvgBorder>
          </View>
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
    paddingLeft: 15, // container padding already aligns this with the box edge
  },
  inputWrapper: {
    height: 58, // fixed height — border SVG scales to fill this
  },
  input: {
    flex: 1, // fill the content area of SvgBorder
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
    flex: 1, // fill the content area of SvgBorder
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
