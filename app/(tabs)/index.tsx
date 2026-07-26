// import React from "react";
// import {
//   ImageBackground,
//   StyleSheet,
//   View,
//   ScrollView,
//   useWindowDimensions,
// } from "react-native";
// import { SafeAreaView, SafeAreaProvider } from "react-native-safe-area-context";
// import { SearchBar } from "@/components/search_bar";
// import { Listing } from "@/components/listing";

// export default function HomeScreen() {
//   const { width: screenWidth } = useWindowDimensions();

//   // Scale gap from 16 on mobile to 30 on desktop
//   const gap = screenWidth >= 1024 ? 30 : screenWidth >= 640 ? 24 : 15;

//   const listings = Array.from({ length: 500 }, (_, i) => i);

//   return (
//     <SafeAreaProvider>
//       <ImageBackground
//         source={require("../assets/images/cork_board.png")}
//         style={styles.backgroundImage}
//         resizeMode="cover"
//       >
//         <SafeAreaView edges={["top", "left", "right"]} style={styles.safeArea}>
//           <ScrollView contentContainerStyle={styles.scrollContent}>
//             <View style={styles.contentContainer}>
//               <SearchBar />
//               <View style={[styles.listingsContainer, { gap }]}>
//                 {listings.map((_, index) => (
//                   <Listing key={index} />
//                 ))}
//               </View>
//             </View>
//           </ScrollView>
//         </SafeAreaView>
//       </ImageBackground>
//     </SafeAreaProvider>
//   );
// }

// const styles = StyleSheet.create({
//   safeArea: {
//     height: "100%",
//     flex: 1,
//   },
//   backgroundImage: {
//     width: "100%",
//     height: "100%",
//   },
//   contentContainer: {
//     paddingTop: 10,
//     justifyContent: "center",
//     alignItems: "center",
//     flex: 1,
//     paddingVertical: 20,
//     paddingHorizontal: 15,
//   },
//   scrollContent: {
//     flexGrow: 1,
//   },
//   listingsContainer: {
//     paddingTop: 40,
//     flexDirection: "row",
//     flexWrap: "wrap",
//     justifyContent: "center",
//   },
// });

import React from "react";
import {
  ImageBackground,
  StyleSheet,
  View,
  ScrollView,
  useWindowDimensions,
  TouchableOpacity,
  Text,
} from "react-native";
import { SafeAreaView, SafeAreaProvider } from "react-native-safe-area-context";
import { SearchBar } from "@/components/search_bar";
import { Listing } from "@/components/listing";
import { useAuth } from "@/contexts/AuthContext";

// Covenant emails are formatted first.last@covenant.edu, so the local part
// before the first "." is the first name. Capitalize it for the greeting.
// (Placeholder greeting — revisit when the home header gets its UI pass.)
function firstNameFromEmail(email?: string): string {
  const first = email?.split("@")[0]?.split(".")[0] ?? "";
  return first ? first.charAt(0).toUpperCase() + first.slice(1) : "there";
}

export default function HomeScreen() {
  const { width: screenWidth } = useWindowDimensions();
  const { signOut, user } = useAuth();

  // Scale gap from 16 on mobile to 30 on desktop
  const gap = screenWidth >= 1024 ? 30 : screenWidth >= 640 ? 24 : 15;

  const listings = Array.from({ length: 500 }, (_, i) => i);

  return (
    <SafeAreaProvider>
      <ImageBackground
        source={require("../../assets/images/cork_board.png")}
        style={styles.backgroundImage}
        resizeMode="cover"
      >
        <SafeAreaView edges={["top", "left", "right"]} style={styles.safeArea}>
          <ScrollView contentContainerStyle={styles.scrollContent}>
            <View style={styles.contentContainer}>
              {/* Header with user info and logout */}
              <View style={styles.header}>
                <Text style={styles.welcomeText}>
                  Welcome, {firstNameFromEmail(user?.email)}
                </Text>
                <TouchableOpacity style={styles.logoutButton} onPress={signOut}>
                  <Text style={styles.logoutText}>Logout</Text>
                </TouchableOpacity>
              </View>

              <SearchBar />
              <View style={[styles.listingsContainer, { gap }]}>
                {listings.map((_, index) => (
                  <Listing key={index} />
                ))}
              </View>
            </View>
          </ScrollView>
        </SafeAreaView>
      </ImageBackground>
    </SafeAreaProvider>
  );
}

const styles = StyleSheet.create({
  safeArea: {
    height: "100%",
    flex: 1,
  },
  backgroundImage: {
    width: "100%",
    height: "100%",
  },
  contentContainer: {
    paddingTop: 10,
    justifyContent: "center",
    alignItems: "center",
    flex: 1,
    paddingVertical: 20,
    paddingHorizontal: 15,
  },
  scrollContent: {
    flexGrow: 1,
  },
  listingsContainer: {
    paddingTop: 40,
    flexDirection: "row",
    flexWrap: "wrap",
    justifyContent: "center",
  },
  header: {
    flexDirection: "row",
    justifyContent: "space-between",
    alignItems: "center",
    width: "100%",
    marginBottom: 20,
    paddingHorizontal: 10,
  },
  welcomeText: {
    fontSize: 16,
    fontWeight: "600",
    color: "#333",
  },
  logoutButton: {
    backgroundColor: "#ff3b30",
    paddingHorizontal: 20,
    paddingVertical: 10,
    borderRadius: 8,
  },
  logoutText: {
    color: "#fff",
    fontWeight: "600",
    fontSize: 14,
  },
});
