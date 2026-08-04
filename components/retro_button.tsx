import { TouchableOpacity, Text, ActivityIndicator, StyleSheet, ViewStyle } from "react-native";
import { SvgBorder } from "@/components/login_field_border";
import { Colors } from "@/constants/theme";

type RetroButtonVariant = "primary" | "danger" | "muted";

interface RetroButtonProps {
  label: string;
  onPress: () => void;
  disabled?: boolean;
  loading?: boolean;
  variant?: RetroButtonVariant;
  style?: ViewStyle;
}

// SvgBorder's frame is hollow in the middle (the parent background shows
// through, same as the login email field) — variants are expressed through
// the label color, not a filled background, to stay consistent with that.
const VARIANT_TEXT_COLOR: Record<RetroButtonVariant, string> = {
  primary: Colors.accent,
  danger: Colors.danger,
  muted: Colors.ink,
};

/** Tactile hand-drawn-bordered button (built on SvgBorder) used for actions across the app. */
export function RetroButton({
  label,
  onPress,
  disabled,
  loading,
  variant = "primary",
  style,
}: RetroButtonProps) {
  const textColor = VARIANT_TEXT_COLOR[variant];

  return (
    <TouchableOpacity
      style={[styles.wrapper, style, disabled && styles.disabled]}
      onPress={onPress}
      disabled={disabled || loading}
    >
      <SvgBorder style={styles.svgBorder}>
        {loading ? (
          <ActivityIndicator color={textColor} />
        ) : (
          <Text style={[styles.label, { color: textColor }]}>{label}</Text>
        )}
      </SvgBorder>
    </TouchableOpacity>
  );
}

const styles = StyleSheet.create({
  wrapper: {
    height: 52,
  },
  // The TouchableOpacity — not SvgBorder's own inset content area — is the
  // hit target now, so the whole drawn border is tappable, not just the
  // label in the middle.
  svgBorder: {
    flex: 1,
    alignItems: "center",
  },
  disabled: {
    opacity: 0.5,
  },
  label: {
    fontSize: 16,
    fontWeight: "700",
  },
});
