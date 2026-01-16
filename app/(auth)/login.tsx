import React, { useState } from "react";
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
import { Link } from "expo-router";
import { useFonts } from "expo-font";

export default function LoginScreen() {
  const [email, setEmail] = useState("");
  const { signIn, isLoading } = useAuth();

  const [fontsLoaded] = useFonts({
    PencilFont: require("../../assets/fonts/pencil_type_beat.ttf"),
  });

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
    } catch (error) {
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
              <TextInput
                style={styles.input}
                placeholder="Enter your Covenant email"
                placeholderTextColor="#000"
                value={email}
                onChangeText={setEmail}
                autoCapitalize="none"
                keyboardType="email-address"
                editable={!isLoading}
              />
            </View>
            <TouchableOpacity
              style={[styles.button, isLoading && styles.buttonDisabled]}
              onPress={handleLogin}
              disabled={isLoading}
            >
              {isLoading ? (
                <ActivityIndicator color="#fff" />
              ) : (
                <Text style={styles.buttonText}>Sign In</Text>
              )}
            </TouchableOpacity>
            <View style={styles.signupContainer}></View>
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
    marginBottom: 8,
    fontFamily: "PencilFont",
  },
  input: {
    borderWidth: 2,
    borderColor: "#666",
    borderRadius: 12,
    padding: 15,
    fontSize: 20,
    color: "#000",
    fontFamily: "PencilFont",
  },
  button: {
    padding: 16,
    alignItems: "center",
    marginTop: 10,
    borderWidth: 2,
    borderColor: "#666",
    borderRadius: 12,
    maxWidth: 150,
    alignSelf: "center",
    width: "100%",
  },
  buttonDisabled: {
    backgroundColor: "#999",
  },
  buttonText: {
    color: "#000",
    fontSize: 24,
    fontFamily: "PencilFont",
  },
  signupContainer: {
    flexDirection: "row",
    justifyContent: "center",
    marginTop: 20,
  },
  signupText: {
    color: "#666",
    fontSize: 16,
  },
  signupLink: {
    color: "#0066cc",
    fontSize: 16,
    fontWeight: "600",
  },
});
