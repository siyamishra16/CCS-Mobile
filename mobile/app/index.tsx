import React, { useEffect, useState } from "react";
import { 
  View, 
  Text, 
  StyleSheet, 
  TouchableOpacity, 
  ActivityIndicator, 
  SafeAreaView, 
  StatusBar, 
  Platform 
} from "react-native";
import { router } from "expo-router";
import AsyncStorage from "@react-native-async-storage/async-storage";
import { supabase } from "../lib/supabase"; 

export default function Index() {
  const [isLoading, setIsLoading] = useState(true);
  const [activeDot, setActiveDot] = useState(0);

  // 1. CLEAR SESSION ON MOUNT: This stops the auto-redirect to Profile
  useEffect(() => {
    const clearSessionAndLoad = async () => {
      try {
        await supabase.auth.signOut();
        await AsyncStorage.multiRemove(["token", "user"]);
      } catch (e) {
        console.log("Clear session error:", e);
      } finally {
        setIsLoading(false);
      }
    };
    clearSessionAndLoad();
  }, []);

  // 2. Pagination dots animation
  useEffect(() => {
    if (!isLoading) {
      const interval = setInterval(() => {
        setActiveDot((prev) => (prev + 1) % 3);
      }, 2000);
      return () => clearInterval(interval);
    }
  }, [isLoading]);

  if (isLoading) {
    return (
      <View style={styles.loadingContainer}>
        <ActivityIndicator size="small" color="#0047AB" />
      </View>
    );
  }

  return (
    <SafeAreaView style={styles.safeArea}>
      <StatusBar barStyle="dark-content" />
      <View style={styles.container}>
        
        {/* Upper Spacer: Positioned to keep logo slightly lower than top */}
        <View style={{ flex: 2.2 }} />

        <View style={styles.centerContent}>
          <View style={styles.logoWrapper}>
            <Text style={styles.logoText}>CCS</Text>
          </View>
          <Text style={styles.tagline}>The world's no. 1 job search site</Text>
        </View>

        {/* Middle Spacer */}
        <View style={{ flex: 1.8 }} />

        <View style={styles.footer}>
          <View style={styles.pagination}>
            {[0, 1, 2].map((i) => (
              <View 
                key={i} 
                style={[styles.dot, activeDot === i ? styles.activeDot : null]} 
              />
            ))}
          </View>

          {/* SIGN IN BUTTON: Explicit route to login file */}
          <TouchableOpacity 
            style={styles.primaryBtn} 
            onPress={() => router.push("/(auth)/login")}
            activeOpacity={0.8}
          >
            <Text style={styles.primaryBtnText}>Sign in</Text>
          </TouchableOpacity>

          {/* CREATE ACCOUNT BUTTON: Explicit route to signup file */}
          <TouchableOpacity 
            style={styles.secondaryBtn}
            onPress={() => router.push("/(auth)/signup")} 
            activeOpacity={0.7}
          >
            <Text style={styles.secondaryBtnText}>Create account</Text>
          </TouchableOpacity>

          <View style={styles.legalContainer}>
            <Text style={styles.legalText}>
              By using this app, you agree to our{" "}
              <Text style={styles.link}>Terms</Text> and <Text style={styles.link}>Privacy Policy</Text>
            </Text>
          </View>
        </View>
      </View>
    </SafeAreaView>
  );
}

const styles = StyleSheet.create({
  safeArea: { flex: 1, backgroundColor: "#FFFFFF" },
  container: { flex: 1, paddingHorizontal: 25 },
  loadingContainer: { 
    flex: 1, 
    justifyContent: "center", 
    alignItems: "center", 
    backgroundColor: "#FFF" 
  },
  centerContent: { alignItems: "center", justifyContent: "center" },
  logoWrapper: { paddingRight: 10 }, 
  logoText: { 
    fontSize: 60, 
    fontWeight: "900", 
    color: "#0047AB", 
    fontStyle: "italic",
    letterSpacing: -2.5,
    fontFamily: Platform.OS === 'android' ? 'sans-serif-condensed' : 'HelveticaNeue-CondensedBold',
  },
  tagline: { fontSize: 14, color: "#444", marginTop: 2, fontWeight: "500" },
  footer: { alignItems: "center", paddingBottom: 40, width: '100%' },
  pagination: { flexDirection: "row", marginBottom: 30, height: 6, alignItems: 'center' },
  dot: { width: 6, height: 6, borderRadius: 3, backgroundColor: "#F5F5F5", marginHorizontal: 4 },
  activeDot: { width: 26, backgroundColor: "#0047AB" },
  
  primaryBtn: { 
    backgroundColor: "#0047AB", 
    width: "100%", 
    height: 44, // THIN
    borderRadius: 4, // RECTANGULAR
    justifyContent: "center", 
    alignItems: "center", 
    marginBottom: 10 
  },
  primaryBtnText: { color: "#FFFFFF", fontSize: 15, fontWeight: "600" },
  
  secondaryBtn: { 
    backgroundColor: "#FFFFFF", 
    width: "100%", 
    height: 44, // THIN
    borderRadius: 4, // RECTANGULAR
    borderWidth: 1.2, 
    borderColor: "#0047AB", 
    justifyContent: "center", 
    alignItems: "center", 
    marginBottom: 25 
  },
  secondaryBtnText: { color: "#0047AB", fontSize: 15, fontWeight: "600" },
  
  legalContainer: { paddingHorizontal: 20 },
  legalText: { fontSize: 10, color: "#BBB", textAlign: "center", lineHeight: 14 },
  link: { color: "#0047AB", textDecorationLine: "underline" },
});