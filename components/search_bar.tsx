// component for searching products

import { StyleSheet, View, TextInput } from "react-native";
import { Colors } from "@/constants/theme";

export const SearchBar = () => {
    return (
        <View style={styles.searchContainer}>
            <View style={styles.searchEntryContainer}>
                <TextInput 
                    style={styles.textInput} 
                    placeholder="   🔍  Search for your jawns here!" 
                    id="search_query"  
                />
            </View>
        </View>
    )
}

const styles = StyleSheet.create({
  searchContainer: {
    backgroundColor: Colors.dark.background,
    width: "80%",
    height: 40,
    borderRadius: 5,
    alignContent: 'center',
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
    width: "100%",
    height: "100%",
    
    color: Colors.dark.search_text,
    backgroundColor: Colors.dark.search_background_pt_2,
    borderRadius: 5,
  },
});