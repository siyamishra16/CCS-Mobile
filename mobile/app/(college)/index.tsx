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
import { Ionicons, MaterialCommunityIcons } from "@expo/vector-icons";
import { router } from "expo-router"; 
import AsyncStorage from "@react-native-async-storage/async-storage";

export default function CollegeDashboard() {

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
      
      {/* FIXED ROOF: Pushes content below the camera/notch */}
      <View style={styles.topPadding} />
      
      <SafeAreaView style={styles.safe}>
        <View style={styles.header}>
          <Text style={styles.headerTitle}>College Dashboard</Text>
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
              onPress={() => router.push("/(college)/profile")}
            >
              <View style={styles.iconCircle}>
                <Ionicons name="school-outline" size={30} color="#007AFF" />
              </View>
              <Text style={styles.cardText}>Profile</Text>
            </TouchableOpacity>

            {/* Departments/Management */}
            <TouchableOpacity style={styles.bigCard}>
              <View style={styles.iconCircle}>
                <Ionicons name="business-outline" size={30} color="#007AFF" />
              </View>
              <Text style={styles.cardText}>Departments</Text>
            </TouchableOpacity>

          </View>

          {/* LOGOUT: Sitting directly under the grid with NO gap */}
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
    // This physically blocks the top of the screen to prevent roof collision
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
  },
  grid: {
    flexDirection: "row",
    flexWrap: "wrap",
    justifyContent: "space-between",
  },
  bigCard: {
    backgroundColor: "#FFF",
    width: "48.5%", 
    height: 165, // Explicitly large boxes
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
    marginTop: 5, 
    width: '100%',
  },
  logoutText: {
    color: "#FFF",
    fontSize: 16,
    fontWeight: "600",
  },
});