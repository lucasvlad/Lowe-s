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
      <View style={styles.searchEntryContainer}>
        <TextInput
          style={styles.textInput}
          placeholder="🔍  Search for your jawns here!"
          placeholderTextColor={Colors.dark.search_text}
          id="search_query"
          value={value}
          onChangeText={setValue}
          returnKeyType="search"
        />
      </View>
    </View>
  );
};

const styles = StyleSheet.create({
  searchContainer: {
    backgroundColor: Colors.dark.background,
    width: "80%",
    height: 40,
    borderRadius: 10,
    alignContent: 'center',
    boxShadow: "5px 5px 5px #212121ff",
  },
  searchEntryContainer: {
    width: "98%",
    height: "70%",
    backgroundColor: Colors.dark.search_background_pt_2,
    borderRadius: 5,
    flexDirection: 'row',
    margin: "auto",
  },
  textInput: {
    overflow: "hidden",
    width: "100%",
    height: "100%",
    paddingLeft: "2%",
    color: Colors.dark.search_text,
    backgroundColor: Colors.dark.search_background_pt_2,
    borderRadius: 5,
    boxShadow: "inset 2px 2px 5px #212121ff",
    textShadowColor: "#828282ff",
    textShadowOffset: { width: 2, height: 2 },
    textShadowRadius: 0,
  },
});
