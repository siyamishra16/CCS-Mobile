// import React from "react";
// import {
//   View,
//   Text,
//   StyleSheet,
//   TouchableOpacity,
//   StatusBar,
//   ScrollView,
//   ViewStyle,
//   TextStyle,
// } from "react-native";
// import { useSafeAreaInsets } from "react-native-safe-area-context";
// import { Ionicons, MaterialCommunityIcons, FontAwesome5 } from "@expo/vector-icons";
// import { router } from "expo-router"; 
// import AsyncStorage from "@react-native-async-storage/async-storage";

// // Constraints
// const BLUE_ACCENT = "#1F4FA3";
// const TEXT_GRAY_22 = "#222222";
// const BORDER_BLUE_200 = "#BFDBFE";

// interface Styles {
//   mainContainer: ViewStyle;
//   header: ViewStyle;
//   headerTitle: TextStyle;
//   scrollContent: ViewStyle;
//   grid: ViewStyle;
//   bigCard: ViewStyle;
//   iconCircle: ViewStyle;
//   cardText: TextStyle;
//   logoutButton: ViewStyle;
//   logoutText: TextStyle;
// }

// export default function StudentDashboard() {
//   const insets = useSafeAreaInsets(); 

//   const handleLogout = async () => {
//     try {
//       await AsyncStorage.clear(); 
//       router.replace("/(onboarding)"); 
//     } catch (e) {
//       console.error("Failed to logout", e);
//     }
//   };

//   return (
//     <View style={[styles.mainContainer, { paddingTop: insets.top }]}>
//       <StatusBar barStyle="dark-content" backgroundColor="#FFF" translucent={true} />
      
//       <View style={styles.header}>
//         <Text style={styles.headerTitle}>Dashboard</Text>
//       </View>

//       <ScrollView 
//         contentContainerStyle={[
//           styles.scrollContent, 
//           { paddingBottom: insets.bottom + 20 } 
//         ]}
//         bounces={true}
//         showsVerticalScrollIndicator={false}
//       >
//         <View style={styles.grid}>
//           {/* Profile */}
//           <TouchableOpacity 
//             style={styles.bigCard} 
//             onPress={() => router.push("/(student)/profile")}
//           >
//             <View style={styles.iconCircle}>
//               <Ionicons name="person-outline" size={26} color={BLUE_ACCENT} />
//             </View>
//             <Text style={styles.cardText}>Profile</Text>
//           </TouchableOpacity>

//           {/* Jobs */}
//           <TouchableOpacity 
//             style={styles.bigCard} 
//             onPress={() => router.push("/(student)/jobs")}
//           >
//             <View style={styles.iconCircle}>
//               <MaterialCommunityIcons name="briefcase-outline" size={26} color={BLUE_ACCENT} />
//             </View>
//             <Text style={styles.cardText}>Jobs</Text>
//           </TouchableOpacity>

//           {/* Applied Jobs */}
//           <TouchableOpacity 
//             style={styles.bigCard}
//             onPress={() => router.push("/(student)/applied")}
//           >
//             <View style={styles.iconCircle}>
//               <Ionicons name="document-text-outline" size={26} color={BLUE_ACCENT} />
//             </View>
//             <Text style={styles.cardText} numberOfLines={1}>Applied Jobs</Text>
//           </TouchableOpacity>

//           {/* Events */}
//           <TouchableOpacity 
//             style={styles.bigCard}
//             onPress={() => router.push("/(student)/events")}
//           >
//             <View style={styles.iconCircle}>
//               <Ionicons name="calendar-outline" size={26} color={BLUE_ACCENT} />
//             </View>
//             <Text style={styles.cardText}>Events</Text>
//           </TouchableOpacity>

//           {/* Skill Tests - FIXED: Added onPress */}
//           <TouchableOpacity 
//             style={styles.bigCard}
//             onPress={() => router.push("/(student)/skill-tests")}
//           >
//             <View style={styles.iconCircle}>
//               <FontAwesome5 name="graduation-cap" size={22} color={BLUE_ACCENT} />
//             </View>
//             <Text style={styles.cardText} numberOfLines={1}>Skill Tests</Text>
//           </TouchableOpacity>
//         </View>

//         <TouchableOpacity style={styles.logoutButton} onPress={handleLogout}>
//           <MaterialCommunityIcons name="logout" size={18} color="#FFF" style={{marginRight: 8}} />
//           <Text style={styles.logoutText}>Logout</Text>
//         </TouchableOpacity>
//       </ScrollView>
//     </View>
//   );
// }

// const styles = StyleSheet.create<Styles>({
//   mainContainer: {
//     flex: 1,
//     backgroundColor: "#FFF", 
//   },
//   header: {
//     height: 45, 
//     paddingHorizontal: 24,
//     justifyContent: "center",
//     backgroundColor: "#FFF",
//     borderBottomWidth: 1,
//     borderBottomColor: BORDER_BLUE_200,
//   },
//   headerTitle: {
//     fontSize: 16, 
//     fontWeight: "700",
//     color: TEXT_GRAY_22,
//   },
//   scrollContent: {
//     paddingHorizontal: 16, 
//     paddingTop: 20,
//   },
//   grid: {
//     flexDirection: "row",
//     flexWrap: "wrap",
//     justifyContent: "space-between",
//   },
//   bigCard: {
//     backgroundColor: "#FFF",
//     width: "48%", 
//     height: 145, 
//     borderRadius: 12, 
//     marginBottom: 16,
//     alignItems: "center",
//     justifyContent: "center",
//     borderWidth: 1.5,
//     borderColor: BORDER_BLUE_200,
//   },
//   iconCircle: {
//     width: 54, 
//     height: 54,
//     borderRadius: 27,
//     backgroundColor: "#F0F7FF",
//     alignItems: "center",
//     justifyContent: "center",
//     marginBottom: 12,
//   },
//   cardText: {
//     fontSize: 14, 
//     fontWeight: "700",
//     color: TEXT_GRAY_22,
//     textAlign: "center",
//   },
//   logoutButton: {
//     backgroundColor: BLUE_ACCENT,
//     flexDirection: "row",
//     height: 44, 
//     borderRadius: 8,
//     alignItems: "center",
//     justifyContent: "center",
//     marginTop: 20,
//     marginHorizontal: 4, 
//   },
//   logoutText: {
//     color: "#FFF",
//     fontSize: 14, 
//     fontWeight: "700",
//   },
// });


import React from "react";
import {
  View,
  Text,
  StyleSheet,
  TouchableOpacity,
  StatusBar,
  ScrollView,
  ViewStyle,
  TextStyle,
} from "react-native";
import { useSafeAreaInsets } from "react-native-safe-area-context";
import { Ionicons, MaterialCommunityIcons, FontAwesome5 } from "@expo/vector-icons";
import { router } from "expo-router"; 
import AsyncStorage from "@react-native-async-storage/async-storage";

const BLUE_ACCENT = "#1F4FA3";
const TEXT_GRAY_22 = "#222222";
const BORDER_BLUE_200 = "#BFDBFE";

interface Styles {
  mainContainer: ViewStyle;
  header: ViewStyle;
  headerTitle: TextStyle;
  scrollContent: ViewStyle;
  grid: ViewStyle;
  bigCard: ViewStyle;
  iconCircle: ViewStyle;
  cardText: TextStyle;
  logoutButton: ViewStyle;
  logoutText: TextStyle;
}

export default function StudentDashboard() {
  const insets = useSafeAreaInsets(); 

  const handleLogout = async () => {
    try {
      await AsyncStorage.clear(); 
      router.replace("/(onboarding)"); 
    } catch (e) {
      console.error("Failed to logout", e);
    }
  };

  return (
    <View style={[styles.mainContainer, { paddingTop: insets.top }]}>
      <StatusBar barStyle="dark-content" backgroundColor="#FFF" translucent={true} />
      
      <View style={styles.header}>
        <Text style={styles.headerTitle}>Dashboard</Text>
      </View>

      <ScrollView 
        contentContainerStyle={[
          styles.scrollContent, 
          { paddingBottom: insets.bottom + 20 } 
        ]}
        bounces={true}
        showsVerticalScrollIndicator={false}
      >
        <View style={styles.grid}>
          {/* Profile */}
          <TouchableOpacity 
            style={styles.bigCard} 
            onPress={() => router.push("/(student)/profile")}
          >
            <View style={styles.iconCircle}>
              <Ionicons name="person-outline" size={26} color={BLUE_ACCENT} />
            </View>
            <Text style={styles.cardText}>Profile</Text>
          </TouchableOpacity>

          {/* Jobs */}
          <TouchableOpacity 
            style={styles.bigCard} 
            onPress={() => router.push("/(student)/jobs")}
          >
            <View style={styles.iconCircle}>
              <MaterialCommunityIcons name="briefcase-outline" size={26} color={BLUE_ACCENT} />
            </View>
            <Text style={styles.cardText}>Jobs</Text>
          </TouchableOpacity>

          {/* Applied Jobs */}
          <TouchableOpacity 
            style={styles.bigCard}
            onPress={() => router.push("/(student)/applied")}
          >
            <View style={styles.iconCircle}>
              <Ionicons name="document-text-outline" size={26} color={BLUE_ACCENT} />
            </View>
            <Text style={styles.cardText} numberOfLines={1}>Applied Jobs</Text>
          </TouchableOpacity>

          {/* Events */}
          <TouchableOpacity 
            style={styles.bigCard}
            onPress={() => router.push("/(student)/events")}
          >
            <View style={styles.iconCircle}>
              <Ionicons name="calendar-outline" size={26} color={BLUE_ACCENT} />
            </View>
            <Text style={styles.cardText}>Events</Text>
          </TouchableOpacity>

          {/* Skill Tests */}
          <TouchableOpacity 
            style={styles.bigCard}
            onPress={() => router.push("/(student)/skill-tests")}
          >
            <View style={styles.iconCircle}>
              <FontAwesome5 name="graduation-cap" size={22} color={BLUE_ACCENT} />
            </View>
            <Text style={styles.cardText} numberOfLines={1}>Skill Tests</Text>
          </TouchableOpacity>

          {/* Certificates — NEW */}
          <TouchableOpacity 
            style={styles.bigCard}
            onPress={() => router.push("/(student)/certificates")}
          >
            <View style={styles.iconCircle}>
              <MaterialCommunityIcons name="certificate-outline" size={26} color={BLUE_ACCENT} />
            </View>
            <Text style={styles.cardText} numberOfLines={1}>Certificates</Text>
          </TouchableOpacity>
        </View>

        <TouchableOpacity style={styles.logoutButton} onPress={handleLogout}>
          <MaterialCommunityIcons name="logout" size={18} color="#FFF" style={{marginRight: 8}} />
          <Text style={styles.logoutText}>Logout</Text>
        </TouchableOpacity>
      </ScrollView>
    </View>
  );
}

const styles = StyleSheet.create<Styles>({
  mainContainer: {
    flex: 1,
    backgroundColor: "#FFF", 
  },
  header: {
    height: 45, 
    paddingHorizontal: 24,
    justifyContent: "center",
    backgroundColor: "#FFF",
    borderBottomWidth: 1,
    borderBottomColor: BORDER_BLUE_200,
  },
  headerTitle: {
    fontSize: 16, 
    fontWeight: "700",
    color: TEXT_GRAY_22,
  },
  scrollContent: {
    paddingHorizontal: 16, 
    paddingTop: 20,
  },
  grid: {
    flexDirection: "row",
    flexWrap: "wrap",
    justifyContent: "space-between",
  },
  bigCard: {
    backgroundColor: "#FFF",
    width: "48%", 
    height: 145, 
    borderRadius: 12, 
    marginBottom: 16,
    alignItems: "center",
    justifyContent: "center",
    borderWidth: 1.5,
    borderColor: BORDER_BLUE_200,
  },
  iconCircle: {
    width: 54, 
    height: 54,
    borderRadius: 27,
    backgroundColor: "#F0F7FF",
    alignItems: "center",
    justifyContent: "center",
    marginBottom: 12,
  },
  cardText: {
    fontSize: 14, 
    fontWeight: "700",
    color: TEXT_GRAY_22,
    textAlign: "center",
  },
  logoutButton: {
    backgroundColor: BLUE_ACCENT,
    flexDirection: "row",
    height: 44, 
    borderRadius: 8,
    alignItems: "center",
    justifyContent: "center",
    marginTop: 20,
    marginHorizontal: 4, 
  },
  logoutText: {
    color: "#FFF",
    fontSize: 14, 
    fontWeight: "700",
  },
});