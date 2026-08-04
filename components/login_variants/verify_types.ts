import type { TextInput } from "react-native";

export interface VerifyVariantProps {
  digits: string[];
  inputRefs: React.MutableRefObject<(TextInput | null)[]>;
  onDigitChange: (text: string, index: number) => void;
  onKeyPress: (e: any, index: number) => void;
  onVerify: () => void;
  isLoading: boolean;
  pendingEmail: string | null;
}
