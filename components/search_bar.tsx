// component for searching products

import { Pressable, Text, Image, StyleSheet, View } from "react-native";
import { Colors } from "@/constants/theme";

export const SearchBar = () => {
    return (
        <View style={styles.searchContainer}>
            <View style={styles.searchEntryContainer}>
            <form>
                <input type="text" id="search_query" name="search_query" placeholder="What are you looking for?"/>
                <input type="button" id="search_button" name="seach_button" />
            </form>
            </View>
        </View>
    )
}

const styles = StyleSheet.create({
  searchContainer: {
    backgroundColor: Colors.dark.background,
    width: 800,
    height: 40,
    padding: 10,
    borderRadius: 5,
    margin: 10,
  },
  searchEntryContainer: {
    backgroundColor: Colors.dark.search_background_pt_2,
    borderRadius: 5,
  },
  input: {
    backgroundColor: Colors.dark.search_background_pt_2,
  },
  button: {
    backgroundColor: Colors.dark.background,
  },
});