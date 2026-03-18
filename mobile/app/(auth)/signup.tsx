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
} from "react-native";
import { SafeAreaView } from "react-native-safe-area-context";
import {
  moderateScale,
  verticalScale,
  scale,
} from "react-native-size-matters";
import { router } from "expo-router";
import { Ionicons } from "@expo/vector-icons";
import ButtonComp from "../../components/atoms/ButtonComp"
import { apiRequest } from "../../services/api"

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
      if (value && !emailRegex.test(value)) {
        setEmailError("Please enter a valid email address");
      } else {
        setEmailError("");
      }
    }
  };

  const validatePassword = (password: string) => {
    const hasUpperCase = /[A-Z]/.test(password);
    const hasLowerCase = /[a-z]/.test(password);
    const hasSpecialChar = /[!@#$%^&*()_+\-=\[\]{};':"\\|,.<>\/?]/.test(password);
    const hasNumber = /[0-9]/.test(password);
    const hasMinLength = password.length >= 6;

    return {
      hasUpperCase,
      hasLowerCase,
      hasSpecialChar,
      hasNumber,
      hasMinLength,
    };
  };

  const passwordValidation = validatePassword(form.password);
  const passwordsMatch = form.password === form.confirm_password && form.confirm_password.length > 0;
  const showPasswordMismatch = form.confirm_password.length > 0 && !passwordsMatch;

  const handlePasswordFocus = () => {
    setTimeout(() => {
      scrollViewRef.current?.scrollTo({ y: 250, animated: true });
    }, 100);
  };

  const handleSignup = async () => {
    if (!form.name || !form.email || !form.password || !form.confirm_password) {
      Alert.alert("Error", "Please fill all required fields");
      return;
    }

    if (emailError) {
      Alert.alert("Error", "Please enter a valid email address");
      return;
    }

    if (form.password !== form.confirm_password) {
      Alert.alert("Error", "Passwords do not match");
      return;
    }

    if (
      !passwordValidation.hasMinLength ||
      !passwordValidation.hasUpperCase ||
      !passwordValidation.hasLowerCase ||
      !passwordValidation.hasSpecialChar ||
      !passwordValidation.hasNumber
    ) {
      Alert.alert("Error", "Password does not meet requirements");
      return;
    }

    try {
      const payload = {
        name: form.name.trim(),
        email: form.email.trim(),
        password: form.password,
        user_type: 3, // Student/Professional
      };

      const res = await apiRequest("/auth/register", "POST", payload);
      console.log("SIGNUP RESPONSE 👉", res);

      Alert.alert(
        "Success",
        "Registration successful! Please verify your email before login.",
        [
          {
            text: "OK",
            onPress: () => router.replace("/(auth)/login"),
          },
        ]
      );
    } catch (err: any) {
      console.log("SIGNUP ERROR 👉", err);
      Alert.alert("Error", err?.message || "Signup failed");
    }
  };

  return (
    <SafeAreaView style={{ flex: 1, backgroundColor: "white" }}>
      <KeyboardAvoidingView
        behavior={Platform.OS === "ios" ? "padding" : undefined}
        style={{ flex: 1 }}
      >
        <ScrollView
          ref={scrollViewRef}
          keyboardShouldPersistTaps="handled"
          contentContainerStyle={styles.container}
        >
          <Text style={styles.title}>Sign up</Text>
          <Text style={styles.subtitle}>Create your account to get started</Text>

          {/* User Type Toggle */}
          <Text style={styles.label}>User type *</Text>
          <View style={styles.toggleContainer}>
            <TouchableOpacity
              style={[styles.toggleButton, userType === "individual" && styles.toggleButtonActive]}
              onPress={() => setUserType("individual")}
            >
              <Ionicons name="person" size={16} color={userType === "individual" ? "#fff" : "#666"} style={{ marginRight: 6 }} />
              <Text style={[styles.toggleText, userType === "individual" && styles.toggleTextActive]}>Individual</Text>
            </TouchableOpacity>

            <TouchableOpacity
              style={[styles.toggleButton, userType === "institution" && styles.toggleButtonActive]}
              onPress={() => router.replace("/(auth)/signup-institution")}
            >
              <Ionicons name="business" size={16} color={userType === "institution" ? "#fff" : "#666"} style={{ marginRight: 6 }} />
              <Text style={[styles.toggleText, userType === "institution" && styles.toggleTextActive]}>Institution</Text>
            </TouchableOpacity>
          </View>

          {/* Name Input */}
          <Text style={styles.label}>Full Name *</Text>
          <TextInput
            style={styles.input}
            placeholder="Enter your full name"
            value={form.name}
            onChangeText={(v) => handleChange("name", v)}
          />

          {/* Email Input */}
          <Text style={styles.label}>Email *</Text>
          <TextInput
            style={[styles.input, emailError ? styles.inputError : null]}
            placeholder="email@example.com"
            keyboardType="email-address"
            autoCapitalize="none"
            value={form.email}
            onChangeText={(v) => handleChange("email", v)}
          />
          {emailError ? <Text style={styles.errorText}>{emailError}</Text> : null}

          {/* Password Inputs */}
          <View style={styles.row}>
            <View style={{ flex: 1 }}>
              <Text style={styles.label}>Password *</Text>
              <View style={styles.passwordWrapper}>
                <TextInput
                  style={styles.passwordInput}
                  placeholder="Password"
                  secureTextEntry={!showPassword}
                  value={form.password}
                  onChangeText={(v) => handleChange("password", v)}
                  onFocus={handlePasswordFocus}
                />
                <TouchableOpacity onPress={() => setShowPassword(!showPassword)}>
                  <Ionicons name={showPassword ? "eye-off" : "eye"} size={20} color="#999" />
                </TouchableOpacity>
              </View>
            </View>

            <View style={{ flex: 1 }}>
              <Text style={styles.label}>Confirm *</Text>
              <View style={styles.passwordWrapper}>
                <TextInput
                  style={styles.passwordInput}
                  placeholder="Confirm"
                  secureTextEntry={!showConfirmPassword}
                  value={form.confirm_password}
                  onChangeText={(v) => handleChange("confirm_password", v)}
                  onFocus={handlePasswordFocus}
                />
                <TouchableOpacity onPress={() => setShowConfirmPassword(!showConfirmPassword)}>
                  <Ionicons name={showConfirmPassword ? "eye-off" : "eye"} size={20} color="#999" />
                </TouchableOpacity>
              </View>
            </View>
          </View>

          {showPasswordMismatch ? <Text style={styles.errorText}>Passwords do not match</Text> : null}

          {/* Password Requirements UI */}
          {form.password.length > 0 && (
            <View style={styles.requirementsBox}>
              <Text style={styles.requirementsTitle}>Password must include:</Text>
              <View style={styles.requirementsList}>
                <View style={styles.requirementsColumn}>
                  <Text style={[styles.requirement, passwordValidation.hasMinLength && styles.requirementMet]}>
                    {passwordValidation.hasMinLength ? "✓" : "○"} At least 6 characters
                  </Text>
                  <Text style={[styles.requirement, passwordValidation.hasLowerCase && styles.requirementMet]}>
                    {passwordValidation.hasLowerCase ? "✓" : "○"} One lowercase letter
                  </Text>
                  <Text style={[styles.requirement, passwordValidation.hasSpecialChar && styles.requirementMet]}>
                    {passwordValidation.hasSpecialChar ? "✓" : "○"} One special character
                  </Text>
                </View>
                <View style={styles.requirementsColumn}>
                  <Text style={[styles.requirement, passwordValidation.hasUpperCase && styles.requirementMet]}>
                    {passwordValidation.hasUpperCase ? "✓" : "○"} One uppercase letter
                  </Text>
                  <Text style={[styles.requirement, passwordValidation.hasNumber && styles.requirementMet]}>
                    {passwordValidation.hasNumber ? "✓" : "○"} One number
                  </Text>
                </View>
              </View>
            </View>
          )}

          <ButtonComp title="Create Account" onPress={handleSignup} />

          <Text style={styles.footerText}>
            Already have an account?{" "}
            <Text style={styles.footerLink} onPress={() => router.push("/(auth)/login")}>
              Sign In
            </Text>
          </Text>
        </ScrollView>
      </KeyboardAvoidingView>
    </SafeAreaView>
  );
}

const styles = StyleSheet.create({
  container: {
    paddingHorizontal: scale(20),
    paddingTop: verticalScale(40),
    paddingBottom: verticalScale(40),
    backgroundColor: "white",
  },
  title: {
    fontSize: moderateScale(24),
    fontWeight: "700",
    color: "#000",
    marginBottom: verticalScale(4),
  },
  subtitle: {
    fontSize: moderateScale(14),
    color: "#666",
    marginBottom: verticalScale(24),
  },
  label: {
    fontSize: moderateScale(13),
    fontWeight: "600",
    color: "#333",
    marginBottom: verticalScale(8),
    marginTop: verticalScale(4),
  },
  toggleContainer: {
    flexDirection: "row",
    gap: scale(10),
    marginBottom: verticalScale(18),
  },
  toggleButton: {
    flex: 1,
    flexDirection: "row",
    alignItems: "center",
    justifyContent: "center",
    paddingVertical: verticalScale(10),
    borderWidth: 1,
    borderColor: "#ddd",
    borderRadius: moderateScale(6),
    backgroundColor: "#fff",
  },
  toggleButtonActive: {
    backgroundColor: "#0A66C2",
    borderColor: "#0A66C2",
  },
  toggleText: {
    fontSize: moderateScale(13),
    color: "#666",
    fontWeight: "500",
  },
  toggleTextActive: {
    color: "#fff",
    fontWeight: "600",
  },
  input: {
    borderWidth: 1,
    borderColor: "#ddd",
    borderRadius: moderateScale(6),
    padding: moderateScale(12),
    marginBottom: verticalScale(14),
    fontSize: moderateScale(14),
  },
  inputError: {
    borderColor: "#EF4444",
  },
  errorText: {
    color: "#EF4444",
    fontSize: moderateScale(11),
    marginBottom: verticalScale(12),
    marginTop: verticalScale(-10),
  },
  row: {
    flexDirection: "row",
    gap: scale(10),
  },
  passwordWrapper: {
    flexDirection: "row",
    alignItems: "center",
    borderWidth: 1,
    borderColor: "#ddd",
    borderRadius: moderateScale(6),
    paddingHorizontal: scale(12),
    marginBottom: verticalScale(14),
  },
  passwordInput: {
    flex: 1,
    paddingVertical: moderateScale(12),
    fontSize: moderateScale(14),
  },
  requirementsBox: {
    backgroundColor: "#F9F9F9",
    padding: moderateScale(10),
    borderRadius: moderateScale(6),
    marginBottom: verticalScale(18),
    borderWidth: 1,
    borderColor: "#f0f0f0",
  },
  requirementsTitle: {
    fontSize: moderateScale(11),
    fontWeight: "600",
    marginBottom: verticalScale(6),
    color: "#333",
  },
  requirementsList: {
    flexDirection: "row",
    gap: scale(10),
  },
  requirementsColumn: {
    flex: 1,
  },
  requirement: {
    fontSize: moderateScale(10),
    color: "#999",
    marginBottom: verticalScale(3),
    lineHeight: moderateScale(14),
  },
  requirementMet: {
    color: "#10B981",
    fontWeight: "500",
  },
  footerText: {
    marginTop: verticalScale(20),
    textAlign: "center",
    color: "#666",
    fontSize: moderateScale(14),
  },
  footerLink: {
    color: "#0A66C2",
    fontWeight: "600",
  },
});