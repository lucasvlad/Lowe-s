import { Alert, Platform } from "react-native";

/**
 * `Alert.alert` is a documented no-op on react-native-web (it renders
 * nothing and never calls back), so anything gated behind it silently does
 * nothing on web. These wrappers fall back to `window.alert`/`confirm`
 * there while using the native `Alert` API everywhere else.
 */
export function alertMessage(title: string, message?: string): void {
  if (Platform.OS === "web") {
    window.alert(message ? `${title}\n\n${message}` : title);
    return;
  }
  Alert.alert(title, message);
}

export function confirmAction(options: {
  title: string;
  message: string;
  confirmLabel: string;
  destructive?: boolean;
  onConfirm: () => void;
}): void {
  const { title, message, confirmLabel, destructive, onConfirm } = options;

  if (Platform.OS === "web") {
    if (window.confirm(`${title}\n\n${message}`)) {
      onConfirm();
    }
    return;
  }

  Alert.alert(title, message, [
    { text: "Cancel", style: "cancel" },
    {
      text: confirmLabel,
      style: destructive ? "destructive" : "default",
      onPress: onConfirm,
    },
  ]);
}
