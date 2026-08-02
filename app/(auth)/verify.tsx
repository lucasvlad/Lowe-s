import React, { useEffect, useRef, useState } from "react";
import { Platform, TextInput } from "react-native";
import { useAuth } from "@/contexts/AuthContext";
import { PaperVerify } from "@/components/login_variants/paper_verify";
import { alertMessage } from "@/utils/alert";

const CODE_LENGTH = 6;

export default function VerifyScreen() {
  const [digits, setDigits] = useState<string[]>(Array(CODE_LENGTH).fill(""));
  const inputRefs = useRef<(TextInput | null)[]>([]);
  const { verifyCode, pendingEmail, isLoading } = useAuth();

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

  const variantProps = {
    digits,
    inputRefs,
    onDigitChange: handleDigitChange,
    onKeyPress: handleKeyPress,
    onVerify: handleVerify,
    isLoading,
    pendingEmail,
  };

  return <PaperVerify {...variantProps} />;
}
