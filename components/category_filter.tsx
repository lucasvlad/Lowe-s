import { ScrollView, StyleSheet } from "react-native";
import { Chip } from "@/components/chip";
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
      <Chip label="All" selected={selected === null} onPress={() => onSelect(null)} />
      {CATEGORIES.map((c) => (
        <Chip
          key={c}
          label={categoryLabel(c)}
          selected={selected === c}
          onPress={() => onSelect(selected === c ? null : c)}
        />
      ))}
    </ScrollView>
  );
}

const styles = StyleSheet.create({
  row: {
    gap: 8,
    paddingHorizontal: 10,
  },
});
