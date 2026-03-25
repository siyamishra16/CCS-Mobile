import React, { useState } from "react";
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

const INSTITUTION_TYPES = [
  { id: 6, label: "School" },
  { id: 4, label: "College" },
  { id: 5, label: "University" },
  { id: 7, label: "Company" },
];

export default function SignupInstitution() {
  const [form, setForm] = useState({
    name: "",
    email: "",
    password: "",
    confirm_password: "",
    institution_type: null as number | null,
  });
  const [showPassword, setShowPassword] = useState(false);
  const [showConfirmPassword, setShowConfirmPassword] = useState(false);
  const [emailError, setEmailError] = useState("");

  const handleChange = (key: string, value: any) => {
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
    isValid: /[A-Z]/.test(password) && /[a-z]/.test(password) && /[0-9]/.test(password) && password.length >= 6
  });

  const passwordValidation = validatePassword(form.password);
  const passwordsMatch = form.password === form.confirm_password && form.confirm_password.length > 0;

  const handleSignup = async () => {
    if (!form.name || !form.email || !form.password || !form.confirm_password || !form.institution_type) {
      Alert.alert("Error", "Please fill all required fields");
      return;
    }
    try {
      const res = await apiRequest("/auth/register", "POST", {
        name: form.name.trim(),
        email: form.email.trim(),
        password: form.password,
        user_type: form.institution_type,
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
        <ScrollView keyboardShouldPersistTaps="handled" contentContainerStyle={styles.container}>
          
          <View style={styles.header}>
            <Text style={styles.title}>Sign up</Text>
            <Text style={styles.subtitle}>Make the most of your professional life</Text>
          </View>

          {/* User Type Label & Toggle */}
          <Text style={styles.label}>User type *</Text>
          <View style={styles.toggleContainer}>
            <TouchableOpacity style={styles.toggleButton} onPress={() => router.replace("/(auth)/signup")}>
              <Ionicons name="person" size={14} color="#64748B" />
              <Text style={styles.toggleText}>Individual</Text>
            </TouchableOpacity>

            <TouchableOpacity style={styles.toggleButtonActive}>
              <Ionicons name="business" size={14} color="#fff" />
              <Text style={styles.toggleTextActive}>Institution</Text>
            </TouchableOpacity>
          </View>

          {/* Institution Type Grid */}
          <Text style={styles.label}>Select institution type *</Text>
          <View style={styles.institutionGrid}>
            {INSTITUTION_TYPES.map((type) => (
              <TouchableOpacity
                key={type.id}
                style={[styles.typeCard, form.institution_type === type.id && styles.typeCardActive]}
                onPress={() => handleChange("institution_type", type.id)}
              >
                <Text style={[styles.typeText, form.institution_type === type.id && styles.typeTextActive]}>
                  {type.label}
                </Text>
              </TouchableOpacity>
            ))}
          </View>

          {/* Form Fields */}
          <Text style={styles.label}>Institution Name *</Text>
          <View style={styles.inputContainer}>
            <TextInput style={styles.input} placeholder="e.g. Stanford University" value={form.name} onChangeText={(v) => handleChange("name", v)} placeholderTextColor="#94A3B8" />
          </View>

          <Text style={styles.label}>Email *</Text>
          <View style={[styles.inputContainer, emailError ? styles.inputError : null]}>
            <TextInput style={styles.input} placeholder="admin@institution.com" keyboardType="email-address" autoCapitalize="none" value={form.email} onChangeText={(v) => handleChange("email", v)} placeholderTextColor="#94A3B8" />
          </View>
          {emailError ? <Text style={styles.errorText}>{emailError}</Text> : null}

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

          {form.confirm_password.length > 0 && !passwordsMatch && (
            <Text style={styles.errorText}>Passwords do not match</Text>
          )}

          {/* Password Requirements UI */}
          {form.password.length > 0 && (
            <View style={styles.requirementsBox}>
              <Text style={styles.requirementsTitle}>Must contain:</Text>
              <View style={styles.requirementsList}>
                <View style={styles.requirementsColumn}>
                  <Text style={[styles.requirement, passwordValidation.hasMinLength && styles.requirementMet]}>○ 6+ Characters</Text>
                  <Text style={[styles.requirement, passwordValidation.hasUpperCase && styles.requirementMet]}>○ Uppercase</Text>
                </View>
                <View style={styles.requirementsColumn}>
                  <Text style={[styles.requirement, passwordValidation.hasLowerCase && styles.requirementMet]}>○ Lowercase</Text>
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
  
  label: { fontSize: 13, fontWeight: "700", color: TEXT_GRAY_22, marginBottom: 8, marginTop: 4 },
  
  toggleContainer: { flexDirection: "row", gap: 10, marginBottom: 20 },
  toggleButton: { 
    flex: 1, flexDirection: "row", alignItems: "center", justifyContent: "center", 
    height: 38, borderWidth: 1.2, borderColor: BORDER_BLUE_200, borderRadius: 7, backgroundColor: "#fff", gap: 6
  },
  toggleButtonActive: { flex: 1, flexDirection: "row", alignItems: "center", justifyContent: "center", height: 38, backgroundColor: ACCENT_BLUE, borderRadius: 7, gap: 6 },
  toggleText: { fontSize: 13, color: "#64748B", fontWeight: "600" },
  toggleTextActive: { fontSize: 13, color: "#fff", fontWeight: "600" },

  institutionGrid: { flexDirection: "row", flexWrap: "wrap", gap: 8, marginBottom: 18 },
  typeCard: { 
    width: "48.5%", height: 42, justifyContent: "center", alignItems: "center", 
    borderWidth: 1.2, borderColor: BORDER_BLUE_200, borderRadius: 7, backgroundColor: "#fff"
  },
  typeCardActive: { borderColor: ACCENT_BLUE, backgroundColor: "#EFF6FF" },
  typeText: { fontSize: 13, color: "#64748B", fontWeight: "600" },
  typeTextActive: { color: ACCENT_BLUE, fontWeight: "700" },

  inputContainer: { 
    borderWidth: 1.2, borderColor: BORDER_BLUE_200, borderRadius: 7, 
    marginBottom: 14, paddingHorizontal: 12, height: 42, justifyContent: "center", backgroundColor: "#F8FAFC"
  },
  input: { flex: 1, fontSize: 13.5, color: TEXT_GRAY_22, fontWeight: "500" },
  row: { flexDirection: "row", gap: 10 },
  passwordRow: { flexDirection: "row", alignItems: "center", flex: 1 },
  inputError: { borderColor: "#EF4444" },
  errorText: { color: "#EF4444", fontSize: 11, marginBottom: 12, marginTop: -10, fontWeight: "600" },

  requirementsBox: { backgroundColor: "#F1F5F9", padding: 10, borderRadius: 7, marginBottom: 20, borderWidth: 1, borderColor: BORDER_BLUE_200 },
  requirementsTitle: { fontSize: 11, fontWeight: "700", marginBottom: 6, color: TEXT_GRAY_22 },
  requirementsList: { flexDirection: "row" },
  requirementsColumn: { flex: 1 },
  requirement: { fontSize: 10, color: "#94A3B8", marginBottom: 2, fontWeight: "600" },
  requirementMet: { color: "#10B981" },

  signUpBtn: { backgroundColor: ACCENT_BLUE, width: "100%", height: 42, borderRadius: 7, justifyContent: "center", alignItems: "center", marginBottom: 20, elevation: 1 },
  signUpBtnText: { color: "#fff", fontSize: 14, fontWeight: "700" },
  
  footer: { flexDirection: "row", justifyContent: "center", marginTop: 5 },
  footerText: { fontSize: 13, color: "#64748B" },
  footerLink: { fontSize: 13, color: ACCENT_BLUE, fontWeight: "700" },
});