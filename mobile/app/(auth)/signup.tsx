import React, { useState, useRef } from "react";
import {
  View,
  Text,
  TextInput,
  StyleSheet,
  TouchableOpacity,
  Alert,
  ScrollView,
  KeyboardAvoidingView,
  Platform,
  StatusBar
} from "react-native";
import { SafeAreaView } from "react-native-safe-area-context";
import { router } from "expo-router";
import { Ionicons } from "@expo/vector-icons";
import { apiRequest } from "../../services/api";

// Style Constants
const ACCENT_BLUE = "#1F4FA3";
const TEXT_GRAY_22 = "#222222";
const BORDER_BLUE_200 = "#BFDBFE";

export default function SignupIndividual() {
  const scrollViewRef = useRef<ScrollView>(null);
  const [userType, setUserType] = useState("individual");
  const [form, setForm] = useState({
    name: "",
    email: "",
    password: "",
    confirm_password: "",
  });
  const [showPassword, setShowPassword] = useState(false);
  const [showConfirmPassword, setShowConfirmPassword] = useState(false);
  const [emailError, setEmailError] = useState("");

  const handleChange = (key: string, value: string) => {
    setForm({ ...form, [key]: value });
    if (key === "email") {
      const emailRegex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
      setEmailError(value && !emailRegex.test(value) ? "Please enter a valid email address" : "");
    }
  };

  const validatePassword = (password: string) => ({
    hasUpperCase: /[A-Z]/.test(password),
    hasLowerCase: /[a-z]/.test(password),
    hasSpecialChar: /[!@#$%^&*()_+\-=\[\]{};':"\\|,.<>\/?]/.test(password),
    hasNumber: /[0-9]/.test(password),
    hasMinLength: password.length >= 6,
  });

  const passwordValidation = validatePassword(form.password);
  const passwordsMatch = form.password === form.confirm_password && form.confirm_password.length > 0;
  const showPasswordMismatch = form.confirm_password.length > 0 && !passwordsMatch;

  const handleSignup = async () => {
    if (!form.name || !form.email || !form.password || !form.confirm_password) {
      Alert.alert("Error", "Please fill all required fields");
      return;
    }
    
    try {
      const res = await apiRequest("/auth/register", "POST", {
        name: form.name.trim(),
        email: form.email.trim(),
        password: form.password,
        user_type: 3,
      });
      Alert.alert("Success", "Registration successful! Verify your email.", [
        { text: "OK", onPress: () => router.replace("/(auth)/login") }
      ]);
    } catch (err: any) {
      Alert.alert("Error", err?.message || "Signup failed");
    }
  };

  return (
    <SafeAreaView style={styles.safeArea}>
      <StatusBar barStyle="dark-content" backgroundColor="#FFF" />
      <KeyboardAvoidingView behavior={Platform.OS === "ios" ? "padding" : undefined} style={{ flex: 1 }}>
        <ScrollView ref={scrollViewRef} keyboardShouldPersistTaps="handled" contentContainerStyle={styles.container}>
          
          <View style={styles.header}>
            <Text style={styles.title}>Sign up</Text>
            <Text style={styles.subtitle}>Create your account to get started</Text>
          </View>

          {/* User Type Toggle - Compact */}
          <Text style={styles.label}>User type *</Text>
          <View style={styles.toggleContainer}>
            <TouchableOpacity
              style={[styles.toggleButton, userType === "individual" && styles.toggleButtonActive]}
              onPress={() => setUserType("individual")}
            >
              <Ionicons name="person" size={14} color={userType === "individual" ? "#fff" : "#64748B"} />
              <Text style={[styles.toggleText, userType === "individual" && styles.toggleTextActive]}>Individual</Text>
            </TouchableOpacity>

            <TouchableOpacity
              style={[styles.toggleButton, styles.borderBlue]}
              onPress={() => router.replace("/(auth)/signup-institution")}
            >
              <Ionicons name="business" size={14} color="#64748B" />
              <Text style={styles.toggleText}>Institution</Text>
            </TouchableOpacity>
          </View>

          {/* Name Input */}
          <Text style={styles.label}>Full Name *</Text>
          <View style={styles.inputContainer}>
            <TextInput style={styles.input} placeholder="Enter full name" value={form.name} onChangeText={(v) => handleChange("name", v)} placeholderTextColor="#94A3B8" />
          </View>

          {/* Email Input */}
          <Text style={styles.label}>Email *</Text>
          <View style={[styles.inputContainer, emailError ? styles.inputError : null]}>
            <TextInput style={styles.input} placeholder="email@example.com" keyboardType="email-address" autoCapitalize="none" value={form.email} onChangeText={(v) => handleChange("email", v)} placeholderTextColor="#94A3B8" />
          </View>
          {emailError ? <Text style={styles.errorText}>{emailError}</Text> : null}

          {/* Password Inputs - Compact Row */}
          <View style={styles.row}>
            <View style={{ flex: 1 }}>
              <Text style={styles.label}>Password *</Text>
              <View style={styles.inputContainer}>
                <View style={styles.passwordRow}>
                  <TextInput style={styles.input} placeholder="Password" secureTextEntry={!showPassword} value={form.password} onChangeText={(v) => handleChange("password", v)} placeholderTextColor="#94A3B8" />
                  <TouchableOpacity onPress={() => setShowPassword(!showPassword)}>
                    <Ionicons name={showPassword ? "eye-outline" : "eye-off-outline"} size={18} color={ACCENT_BLUE} />
                  </TouchableOpacity>
                </View>
              </View>
            </View>

            <View style={{ flex: 1 }}>
              <Text style={styles.label}>Confirm *</Text>
              <View style={styles.inputContainer}>
                <View style={styles.passwordRow}>
                  <TextInput style={styles.input} placeholder="Confirm" secureTextEntry={!showConfirmPassword} value={form.confirm_password} onChangeText={(v) => handleChange("confirm_password", v)} placeholderTextColor="#94A3B8" />
                  <TouchableOpacity onPress={() => setShowConfirmPassword(!showConfirmPassword)}>
                    <Ionicons name={showConfirmPassword ? "eye-outline" : "eye-off-outline"} size={18} color={ACCENT_BLUE} />
                  </TouchableOpacity>
                </View>
              </View>
            </View>
          </View>

          {showPasswordMismatch ? <Text style={styles.errorText}>Passwords do not match</Text> : null}

         
          {form.password.length > 0 && (
            <View style={styles.requirementsBox}>
              <Text style={styles.requirementsTitle}>Must include:</Text>
              <View style={styles.requirementsList}>
                <View style={styles.requirementsColumn}>
                  <Text style={[styles.requirement, passwordValidation.hasMinLength && styles.requirementMet]}>○ 6+ Characters</Text>
                  <Text style={[styles.requirement, passwordValidation.hasLowerCase && styles.requirementMet]}>○ Lowercase</Text>
                  <Text style={[styles.requirement, passwordValidation.hasSpecialChar && styles.requirementMet]}>○ Special Char</Text>
                </View>
                <View style={styles.requirementsColumn}>
                  <Text style={[styles.requirement, passwordValidation.hasUpperCase && styles.requirementMet]}>○ Uppercase</Text>
                  <Text style={[styles.requirement, passwordValidation.hasNumber && styles.requirementMet]}>○ Number</Text>
                </View>
              </View>
            </View>
          )}

         
          <TouchableOpacity style={styles.signUpBtn} onPress={handleSignup} activeOpacity={0.8}>
            <Text style={styles.signUpBtnText}>Create Account</Text>
          </TouchableOpacity>

          <View style={styles.footer}>
            <Text style={styles.footerText}>Already have an account? </Text>
            <TouchableOpacity onPress={() => router.push("/(auth)/login")}>
              <Text style={styles.footerLink}>Sign In</Text>
            </TouchableOpacity>
          </View>
        </ScrollView>
      </KeyboardAvoidingView>
    </SafeAreaView>
  );
}

const styles = StyleSheet.create({
  safeArea: { flex: 1, backgroundColor: "white" },
  container: { paddingHorizontal: 22, paddingTop: 30, paddingBottom: 40 },
  header: { marginBottom: 25 },
  title: { fontSize: 24, fontWeight: "700", color: TEXT_GRAY_22, marginBottom: 4 },
  subtitle: { fontSize: 13, color: "#64748B", fontWeight: "500" },
  label: { fontSize: 13, fontWeight: "700", color: TEXT_GRAY_22, marginBottom: 6, marginTop: 4 },
  
  toggleContainer: { flexDirection: "row", gap: 10, marginBottom: 18 },
  toggleButton: { 
    flex: 1, flexDirection: "row", alignItems: "center", justifyContent: "center", 
    height: 38, borderWidth: 1.2, borderColor: BORDER_BLUE_200, borderRadius: 7, backgroundColor: "#fff", gap: 6
  },
  toggleButtonActive: { backgroundColor: ACCENT_BLUE, borderColor: ACCENT_BLUE },
  toggleText: { fontSize: 13, color: "#64748B", fontWeight: "600" },
  toggleTextActive: { color: "#fff" },

  inputContainer: { 
    borderWidth: 1.2, borderColor: BORDER_BLUE_200, borderRadius: 7, 
    marginBottom: 14, paddingHorizontal: 12, height: 42, justifyContent: "center", backgroundColor: "#F8FAFC"
  },
  input: { flex: 1, fontSize: 13.5, color: TEXT_GRAY_22, fontWeight: "500" },
  inputError: { borderColor: "#EF4444" },
  errorText: { color: "#EF4444", fontSize: 11, marginBottom: 12, marginTop: -10, fontWeight: "600" },
  
  row: { flexDirection: "row", gap: 10 },
  passwordRow: { flexDirection: "row", alignItems: "center", flex: 1 },

  requirementsBox: { 
    backgroundColor: "#F1F5F9", padding: 10, borderRadius: 7, marginBottom: 20, borderWidth: 1, borderColor: BORDER_BLUE_200 
  },
  requirementsTitle: { fontSize: 11, fontWeight: "700", marginBottom: 6, color: TEXT_GRAY_22 },
  requirementsList: { flexDirection: "row" },
  requirementsColumn: { flex: 1 },
  requirement: { fontSize: 10, color: "#94A3B8", marginBottom: 2, fontWeight: "600" },
  requirementMet: { color: "#10B981" },

  signUpBtn: { 
    backgroundColor: ACCENT_BLUE, width: "100%", height: 42, borderRadius: 7, 
    justifyContent: "center", alignItems: "center", marginBottom: 20, elevation: 1 
  },
  signUpBtnText: { color: "#fff", fontSize: 14, fontWeight: "700" },
  
  footer: { flexDirection: "row", justifyContent: "center", marginTop: 5 },
  footerText: { fontSize: 13, color: "#64748B" },
  footerLink: { fontSize: 13, color: ACCENT_BLUE, fontWeight: "700" },
  borderBlue: { borderColor: BORDER_BLUE_200 }
});