import React, { useEffect, useState } from "react";
import { View, StyleSheet, Platform } from "react-native";
import { useAuth } from "@/contexts/AuthContext";
import { PaperLogin } from "@/components/login_variants/paper_login";

export default function LoginScreen() {
  const [email, setEmail] = useState("");
  const { requestCode, isLoading } = useAuth();

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

  return (
    <View style={styles.container}>
      <PaperLogin
        email={email}
        setEmail={setEmail}
        isLoading={isLoading}
        onRequestCode={requestCode}
      />
    </View>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
  },
});
