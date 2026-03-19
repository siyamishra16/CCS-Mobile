import React from "react";
import {
  View,
  Text,
  StyleSheet,
  TouchableOpacity,
  SafeAreaView,
  StatusBar,
  Platform,
  ScrollView
} from "react-native";
import { Ionicons, MaterialCommunityIcons, FontAwesome5 } from "@expo/vector-icons";
import { router } from "expo-router"; 
import AsyncStorage from "@react-native-async-storage/async-storage";

export default function UniversityDashboard() {

  const handleLogout = async () => {
    try {
      await AsyncStorage.clear();
      router.replace("/(auth)/login");
    } catch (e) {
      console.error("Logout failed", e);
    }
  };

  return (
    <View style={styles.mainContainer}>
      <StatusBar barStyle="dark-content" />
      
      {/* FIXED ROOF: Pushes the "Dashboard" text down away from the notch */}
      <View style={styles.topPadding} />
      
      <SafeAreaView style={styles.safe}>
        <View style={styles.header}>
          <Text style={styles.headerTitle}>University Dashboard</Text>
        </View>

        <ScrollView 
          contentContainerStyle={styles.scrollContent}
          bounces={false}
          showsVerticalScrollIndicator={false}
        >
          <View style={styles.grid}>
            
            {/* Profile Card */}
            <TouchableOpacity 
              style={styles.bigCard}
              onPress={() => router.push("/(university)/profile")}
            >
              <View style={styles.iconCircle}>
                <Ionicons name="school" size={30} color="#007AFF" />
              </View>
              <Text style={styles.cardText}>Profile</Text>
            </TouchableOpacity>

            {/* Manage Colleges/Affiliates */}
            <TouchableOpacity style={styles.bigCard}>
              <View style={styles.iconCircle}>
                <FontAwesome5 name="university" size={26} color="#007AFF" />
              </View>
              <Text style={styles.cardText}>Colleges</Text>
            </TouchableOpacity>

            {/* Courses/Academics */}
            <TouchableOpacity style={styles.bigCard}>
              <View style={styles.iconCircle}>
                <Ionicons name="book-outline" size={30} color="#007AFF" />
              </View>
              <Text style={styles.cardText}>Academics</Text>
            </TouchableOpacity>

          </View>

          {/* LOGOUT: Positioned with 0 gap below the last row of boxes */}
          <TouchableOpacity style={styles.logoutButton} onPress={handleLogout}>
            <MaterialCommunityIcons name="logout" size={20} color="#FFF" style={{marginRight: 10}} />
            <Text style={styles.logoutText}>Logout</Text>
          </TouchableOpacity>
        </ScrollView>
      </SafeAreaView>
    </View>
  );
}

const styles = StyleSheet.create({
  mainContainer: {
    flex: 1,
    backgroundColor: "#FFF",
  },
  topPadding: {
    // Ensures the header doesn't collide with the phone's status bar/roof
    height: Platform.OS === "android" ? StatusBar.currentHeight : 44,
    backgroundColor: "#FFF",
  },
  safe: {
    flex: 1,
  },
  header: {
    height: 55,
    paddingHorizontal: 20,
    justifyContent: "center",
    borderBottomWidth: 1,
    borderBottomColor: "#F0F0F0",
  },
  headerTitle: {
    fontSize: 20,
    fontWeight: "700",
    color: "#000",
  },
  scrollContent: {
    paddingHorizontal: 16,
    paddingTop: 15,
    // Ensures items stay at the top and don't spread out
    justifyContent: 'flex-start',
  },
  grid: {
    flexDirection: "row",
    flexWrap: "wrap",
    justifyContent: "space-between",
  },
  bigCard: {
    backgroundColor: "#FFF",
    width: "48.5%", 
    height: 165, // Explicitly large boxes as requested
    borderRadius: 18,
    marginBottom: 15,
    alignItems: "center",
    justifyContent: "center",
    borderWidth: 1,
    borderColor: "#EEE",
    elevation: 4,
    shadowColor: "#000",
    shadowOpacity: 0.06,
    shadowRadius: 10,
  },
  iconCircle: {
    width: 65,
    height: 65,
    borderRadius: 32.5,
    backgroundColor: "#F0F7FF",
    alignItems: "center",
    justifyContent: "center",
    marginBottom: 15,
  },
  cardText: {
    fontSize: 15,
    fontWeight: "600",
    color: "#333",
    textAlign: "center",
  },
  logoutButton: {
    backgroundColor: "#1D85E1",
    flexDirection: "row",
    height: 48,
    borderRadius: 12,
    alignItems: "center",
    justifyContent: "center",
    marginTop: 5, // Tight gap to match the boxes
    width: '100%',
  },
  logoutText: {
    color: "#FFF",
    fontSize: 16,
    fontWeight: "600",
  },
});