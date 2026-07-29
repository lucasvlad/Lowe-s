// component for searching products

import { useEffect, useState } from "react";
import { StyleSheet, View, TextInput } from "react-native";
import { Colors } from "@/constants/theme";

const DEBOUNCE_MS = 300;

interface SearchBarProps {
  /** Called with the trimmed query `DEBOUNCE_MS` after the user stops typing. */
  onSearch: (query: string) => void;
}

export const SearchBar = ({ onSearch }: SearchBarProps) => {
  const [value, setValue] = useState("");

  useEffect(() => {
    const timeout = setTimeout(() => onSearch(value.trim()), DEBOUNCE_MS);
    return () => clearTimeout(timeout);
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [value]);

  return (
    <View style={styles.searchContainer}>
      <TextInput
        style={styles.textInput}
        placeholder="Search for your jawns here!"
        placeholderTextColor={Colors.inkMuted}
        id="search_query"
        value={value}
        onChangeText={setValue}
        returnKeyType="search"
      />
    </View>
  );
};

const styles = StyleSheet.create({
  searchContainer: {
    width: "100%",
    maxWidth: 480,
  },
  textInput: {
    width: "100%",
    height: 42,
    paddingHorizontal: 14,
    borderWidth: 2,
    borderColor: Colors.ink,
    backgroundColor: Colors.card,
    color: Colors.ink,
    fontSize: 15,
  },
});
