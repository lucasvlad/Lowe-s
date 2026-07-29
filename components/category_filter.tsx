import { ScrollView, TouchableOpacity, Text, StyleSheet } from "react-native";
import { CATEGORIES, categoryLabel } from "@/constants/categories";

interface CategoryFilterProps {
  selected: string | null;
  onSelect: (category: string | null) => void;
}

/** Horizontal "All" + category chips for filtering the browse grid. */
export function CategoryFilter({ selected, onSelect }: CategoryFilterProps) {
  return (
    <ScrollView
      horizontal
      showsHorizontalScrollIndicator={false}
      contentContainerStyle={styles.row}
    >
      <TouchableOpacity
        style={[styles.chip, selected === null && styles.chipSelected]}
        onPress={() => onSelect(null)}
      >
        <Text style={[styles.chipText, selected === null && styles.chipTextSelected]}>
          All
        </Text>
      </TouchableOpacity>
      {CATEGORIES.map((c) => (
        <TouchableOpacity
          key={c}
          style={[styles.chip, selected === c && styles.chipSelected]}
          onPress={() => onSelect(selected === c ? null : c)}
        >
          <Text style={[styles.chipText, selected === c && styles.chipTextSelected]}>
            {categoryLabel(c)}
          </Text>
        </TouchableOpacity>
      ))}
    </ScrollView>
  );
}

const styles = StyleSheet.create({
  row: {
    gap: 8,
    paddingHorizontal: 10,
  },
  chip: {
    paddingHorizontal: 14,
    paddingVertical: 8,
    borderRadius: 20,
    backgroundColor: "#ffffffcc",
  },
  chipSelected: {
    backgroundColor: "#333",
  },
  chipText: {
    color: "#000",
    fontWeight: "600",
    fontSize: 13,
  },
  chipTextSelected: {
    color: "#fff",
  },
});
