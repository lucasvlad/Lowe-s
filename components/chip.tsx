import { TouchableOpacity, Text, StyleSheet } from "react-native";
import { Colors } from "@/constants/theme";

interface ChipProps {
  label: string;
  selected: boolean;
  onPress: () => void;
}

/** Shared pill/chip used for category selection (post form) and category filtering (browse). */
export function Chip({ label, selected, onPress }: ChipProps) {
  return (
    <TouchableOpacity
      style={[styles.chip, selected && styles.chipSelected]}
      onPress={onPress}
    >
      <Text style={[styles.label, selected && styles.labelSelected]}>{label}</Text>
    </TouchableOpacity>
  );
}

const styles = StyleSheet.create({
  chip: {
    paddingHorizontal: 14,
    paddingVertical: 8,
    borderRadius: 20,
    borderWidth: 2,
    borderColor: Colors.ink,
    backgroundColor: Colors.card,
  },
  chipSelected: {
    backgroundColor: Colors.accent,
    borderColor: Colors.accent,
  },
  label: {
    color: Colors.ink,
    fontWeight: "600",
    fontSize: 13,
  },
  labelSelected: {
    color: "#fff",
  },
});
