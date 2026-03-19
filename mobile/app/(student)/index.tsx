import React from "react";
import {
  View,
  Text,
  StyleSheet,
  TouchableOpacity,
  SafeAreaView,
  StatusBar,
  Platform,
  ScrollView,
  ViewStyle,
  TextStyle,
  ImageStyle
} from "react-native";
import { Ionicons, MaterialCommunityIcons, FontAwesome5 } from "@expo/vector-icons";
import { router } from "expo-router"; 
import AsyncStorage from "@react-native-async-storage/async-storage";

// TypeScript Interface for Styles
interface Styles {
  mainContainer: ViewStyle;
  safe: ViewStyle;
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

  const handleLogout = async () => {
    try {
      await AsyncStorage.clear(); 
      router.replace("/(auth)/login"); 
    } catch (e) {
      console.error("Failed to logout", e);
    }
  };

  return (
    <View style={styles.mainContainer}>
      <StatusBar barStyle="dark-content" backgroundColor="white" translucent={false} />
      
      <SafeAreaView style={styles.safe}>
        {/* Thin Header */}
        <View style={styles.header}>
          <Text style={styles.headerTitle}>Dashboard</Text>
        </View>

        <ScrollView 
          contentContainerStyle={styles.scrollContent}
          bounces={false}
          showsVerticalScrollIndicator={false}
        >
          <View style={styles.grid}>
            <TouchableOpacity 
              style={styles.bigCard} 
              onPress={() => router.push("/(student)/profile")}
            >
              <View style={styles.iconCircle}><Ionicons name="person-outline" size={28} color="#007AFF" /></View>
              <Text style={styles.cardText}>Profile</Text>
            </TouchableOpacity>

            <TouchableOpacity 
              style={styles.bigCard} 
              onPress={() => router.push("/(student)/jobs")}
            >
              <View style={styles.iconCircle}><MaterialCommunityIcons name="briefcase-outline" size={28} color="#007AFF" /></View>
              <Text style={styles.cardText}>Jobs</Text>
            </TouchableOpacity>

            <TouchableOpacity 
              style={styles.bigCard}
              onPress={() => router.push("/(student)/applied")}
            >
              <View style={styles.iconCircle}><Ionicons name="document-text-outline" size={28} color="#007AFF" /></View>
              <Text style={styles.cardText} numberOfLines={1}>My Applied Jobs</Text>
            </TouchableOpacity>

            <TouchableOpacity style={styles.bigCard}>
              <View style={styles.iconCircle}><FontAwesome5 name="graduation-cap" size={24} color="#007AFF" /></View>
              <Text style={styles.cardText} numberOfLines={1}>Take Skill Tests</Text>
            </TouchableOpacity>
          </View>

          <TouchableOpacity style={styles.logoutButton} onPress={handleLogout}>
            <MaterialCommunityIcons name="logout" size={20} color="#FFF" style={{marginRight: 10}} />
            <Text style={styles.logoutText}>Logout</Text>
          </TouchableOpacity>
        </ScrollView>
      </SafeAreaView>
    </View>
  );
}

const styles = StyleSheet.create<Styles>({
  mainContainer: {
    flex: 1,
    backgroundColor: "#FFF",
  },
  safe: {
    flex: 1,
  },
  header: {
  paddingTop: Platform.OS === "android" ? (StatusBar.currentHeight || 0) : 0,
  height: Platform.OS === "android" ? 40 + (StatusBar.currentHeight || 0) : 40,
  paddingHorizontal: 20,
  justifyContent: "flex-end",
  paddingBottom: 8,
  backgroundColor: "#FFF",
  borderBottomWidth: 0.5,
  borderBottomColor: "#EEE",
},
  headerTitle: {
    fontSize: 18,
    fontWeight: "700",
    color: "#000",
  },
  scrollContent: {
    paddingHorizontal: 16,
    paddingTop: 10,
  },
  grid: {
    flexDirection: "row",
    flexWrap: "wrap",
    justifyContent: "space-between",
  },
  bigCard: {
    backgroundColor: "#FFF",
    width: "48%", 
    height: 140, 
    borderRadius: 16,
    marginBottom: 12,
    alignItems: "center",
    justifyContent: "center",
    borderWidth: 1,
    borderColor: "#EEE",
    elevation: 2,
    shadowColor: "#000",
    shadowOpacity: 0.05,
    shadowRadius: 10,
  },
  iconCircle: {
    width: 50,
    height: 50,
    borderRadius: 25,
    backgroundColor: "#F0F7FF",
    alignItems: "center",
    justifyContent: "center",
    marginBottom: 10,
  },
  cardText: {
    fontSize: 14,
    fontWeight: "500",
    color: "#333",
    textAlign: "center",
  },
  logoutButton: {
    backgroundColor: "#1D85E1",
    flexDirection: "row",
    height: 44,
    borderRadius: 12,
    alignItems: "center",
    justifyContent: "center",
    marginTop: 10,
  },
  logoutText: {
    color: "#FFF",
    fontSize: 15,
    fontWeight: "600",
  },
});