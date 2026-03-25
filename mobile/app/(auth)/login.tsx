import React, { useState } from "react";
import {
  View,
  Text,
  TextInput,
  StyleSheet,
  TouchableOpacity,
  Alert,
  KeyboardAvoidingView,
  Platform,
  ScrollView,
  StatusBar,
} from "react-native";
import { SafeAreaView } from "react-native-safe-area-context";
import { router } from "expo-router";
import { Ionicons } from "@expo/vector-icons";
import AsyncStorage from "@react-native-async-storage/async-storage";
import { apiRequest } from "../../services/api";

// Style Constants
const ACCENT_BLUE = "#1F4FA3";
const TEXT_GRAY_22 = "#222222";
const BORDER_BLUE_200 = "#BFDBFE";

export default function Login() {
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const [showPassword, setShowPassword] = useState(false);

  const handleLogin = async () => {
    if (!email || !password) {
      Alert.alert("Error", "Please fill all fields");
      return;
    }

    try {
      const { data, error } = await apiRequest("/auth/login", "POST", {
        email: email.trim(),
        password,
      });

      if (error) throw error;

      if (data?.token && data?.user) {
        await AsyncStorage.setItem("token", data.token);
        await AsyncStorage.setItem("user", JSON.stringify(data.user));

        const user = data.user;
        const type = user.user_type;

        if (user.profile_completed === false || user.profile_completed === 0) {
          const onboardingRoutes: Record<number, any> = {
            3: "/(onboarding)/student",
            7: "/(onboarding)/company",
            6: "/(onboarding)/school",
            4: "/(onboarding)/college",
            5: "/(onboarding)/university",
          };
          router.replace(onboardingRoutes[type] || "/(auth)/login");
        } else {
          const dashboardRoutes: Record<number, any> = {
            3: "/(student)", 
            7: "/(company)",
            6: "/(school)",
            4: "/(college)",
            5: "/(university)",
          };
          router.replace(dashboardRoutes[type] || "/(auth)/login");
        }
      }
    } catch (err: any) {
      Alert.alert("Error", err?.message || "Login failed");
    }
  };

  return (
    <SafeAreaView style={styles.safeArea}>
      <StatusBar barStyle="dark-content" backgroundColor="#FFF" />
      <KeyboardAvoidingView
        behavior={Platform.OS === "ios" ? "padding" : "height"}
        style={{ flex: 1 }}
      >
        <ScrollView
          keyboardShouldPersistTaps="handled"
          contentContainerStyle={styles.scrollContainer}
        >
          <View style={styles.header}>
            <Text style={styles.title}>Sign in</Text>
            <Text style={styles.subtitle}>Stay updated on your professional world</Text>
          </View>

          <View style={styles.form}>
           
            <View style={styles.inputContainer}>
              <TextInput
                style={styles.input}
                placeholder="Email"
                placeholderTextColor="#94A3B8"
                keyboardType="email-address"
                autoCapitalize="none"
                value={email}
                onChangeText={setEmail}
              />
            </View>

            
            <View style={styles.inputContainer}>
              <View style={styles.passwordRow}>
                <TextInput
                  style={styles.passwordInput}
                  placeholder="Password"
                  placeholderTextColor="#94A3B8"
                  secureTextEntry={!showPassword}
                  value={password}
                  onChangeText={setPassword}
                />
                <TouchableOpacity onPress={() => setShowPassword(!showPassword)}>
                  <Ionicons
                    name={showPassword ? "eye-outline" : "eye-off-outline"}
                    size={18} 
                    color={ACCENT_BLUE}
                  />
                </TouchableOpacity>
              </View>
            </View>

            <TouchableOpacity
              style={styles.forgotPassword}
              onPress={() => router.push("/(auth)/forgot-password")}
            >
              <Text style={styles.forgotPasswordText}>Forgot password?</Text>
            </TouchableOpacity>

            
            <TouchableOpacity 
              style={styles.signInBtn} 
              onPress={handleLogin}
              activeOpacity={0.8}
            >
              <Text style={styles.signInBtnText}>Sign in</Text>
            </TouchableOpacity>

            <View style={styles.footer}>
              <Text style={styles.footerText}>Don't have an account? </Text>
              <TouchableOpacity onPress={() => router.push("/(auth)/signup")}>
                <Text style={styles.footerLink}>Create account</Text>
              </TouchableOpacity>
            </View>
          </View>
        </ScrollView>
      </KeyboardAvoidingView>
    </SafeAreaView>
  );
}

const styles = StyleSheet.create({
  safeArea: { flex: 1, backgroundColor: "white" },
  scrollContainer: { paddingHorizontal: 22, paddingTop: 35 }, 
  header: { marginBottom: 35 }, 
  title: { 
    fontSize: 24, 
    fontWeight: "700", 
    color: TEXT_GRAY_22, 
    marginBottom: 4 
  },
  subtitle: { 
    fontSize: 13, 
    color: "#64748B", 
    fontWeight: "500" 
  },
  form: { width: "100%" },
  inputContainer: { 
    borderWidth: 1.2, 
    borderColor: BORDER_BLUE_200, 
    borderRadius: 7, 
    marginBottom: 16, 
    paddingHorizontal: 12, 
    height: 44, 
    justifyContent: "center",
    backgroundColor: "#F8FAFC"
  },
  input: { 
    fontSize: 14, 
    color: TEXT_GRAY_22, 
    height: "100%",
    fontWeight: "500"
  },
  passwordRow: { flexDirection: "row", alignItems: "center" },
  passwordInput: { 
    flex: 1, 
    fontSize: 14, 
    color: TEXT_GRAY_22, 
    height: "100%",
    fontWeight: "500"
  },
  forgotPassword: { marginBottom: 25, marginTop: 2, alignSelf: "flex-start" }, 
  forgotPasswordText: { 
    color: ACCENT_BLUE, 
    fontSize: 13, 
    fontWeight: "700" 
  },
  
  signInBtn: { 
    backgroundColor: ACCENT_BLUE, 
    width: "100%", 
    height: 44, 
    borderRadius: 7, 
    justifyContent: "center", 
    alignItems: "center", 
    marginBottom: 25, 
    elevation: 1,
  },
  signInBtnText: { 
    color: "#fff", 
    fontSize: 14, 
    fontWeight: "700" 
  },
  
  footer: { 
    flexDirection: "row", 
    justifyContent: "center", 
    alignItems: "center", 
    marginTop: 10 
  },
  footerText: { 
    fontSize: 13, 
    color: "#64748B" 
  },
  footerLink: { 
    fontSize: 13, 
    color: ACCENT_BLUE, 
    fontWeight: "700" 
  },
});