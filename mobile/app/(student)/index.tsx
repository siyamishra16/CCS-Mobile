import React from "react";
import {
  View,
  Text,
  StyleSheet,
  TouchableOpacity,
  StatusBar,
  Platform,
  ScrollView,
  ViewStyle,
  TextStyle,
} from "react-native";
import { useSafeAreaInsets } from "react-native-safe-area-context";
import { Ionicons, MaterialCommunityIcons, FontAwesome5 } from "@expo/vector-icons";
import { router } from "expo-router"; 
import AsyncStorage from "@react-native-async-storage/async-storage";

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
      
      {/* Sleek Header  */}
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
            <View style={styles.iconCircle}><Ionicons name="person-outline" size={26} color="#007AFF" /></View>
            <Text style={styles.cardText}>Profile</Text>
          </TouchableOpacity>

          {/* Jobs */}
          <TouchableOpacity 
            style={styles.bigCard} 
            onPress={() => router.push("/(student)/jobs")}
          >
            <View style={styles.iconCircle}><MaterialCommunityIcons name="briefcase-outline" size={26} color="#007AFF" /></View>
            <Text style={styles.cardText}>Jobs</Text>
          </TouchableOpacity>

          {/* Applied Jobs */}
          <TouchableOpacity 
            style={styles.bigCard}
            onPress={() => router.push("/(student)/applied")}
          >
            <View style={styles.iconCircle}><Ionicons name="document-text-outline" size={26} color="#007AFF" /></View>
            <Text style={styles.cardText} numberOfLines={1}>Applied Jobs</Text>
          </TouchableOpacity>

          {/* Events */}
          <TouchableOpacity 
            style={styles.bigCard}
            onPress={() => router.push("/(student)/events")}
          >
            <View style={styles.iconCircle}><Ionicons name="calendar-outline" size={26} color="#007AFF" /></View>
            <Text style={styles.cardText}>Events</Text>
          </TouchableOpacity>

          {/* Skill Tests */}
          <TouchableOpacity style={styles.bigCard}>
            <View style={styles.iconCircle}><FontAwesome5 name="graduation-cap" size={22} color="#007AFF" /></View>
            <Text style={styles.cardText} numberOfLines={1}>Skill Tests</Text>
          </TouchableOpacity>
        </View>

        {/* Logout Button */}
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
    backgroundColor: "#FBFBFB", 
  },
  header: {
    height: 45, 
    paddingHorizontal: 24,
    justifyContent: "center",
    backgroundColor: "#FFF",
    borderBottomWidth: 0.5,
    borderBottomColor: "#EEE",
  },
  headerTitle: {
    fontSize: 16, 
    fontWeight: "700",
    color: "#1A1A1A",
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
    borderRadius: 22, 
    marginBottom: 16,
    alignItems: "center",
    justifyContent: "center",
    borderWidth: 1,
    borderColor: "#F0F0F0",
    
    
    elevation: 3,
    shadowColor: "#000",
    shadowOffset: { width: 0, height: 4 },
    shadowOpacity: 0.05,
    shadowRadius: 12,
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
    fontWeight: "600",
    color: "#333",
    textAlign: "center",
  },
  logoutButton: {
    backgroundColor: "#1D85E1",
    flexDirection: "row",
    height: 42, 
    borderRadius: 12,
    alignItems: "center",
    justifyContent: "center",
    marginTop: 20,
    marginHorizontal: 4, 
  },
  logoutText: {
    color: "#FFF",
    fontSize: 14, 
    fontWeight: "600",
  },
});