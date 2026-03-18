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
} from "react-native";
import { SafeAreaView } from "react-native-safe-area-context";
import {
  moderateScale,
  verticalScale,
  scale,
} from "react-native-size-matters";
import { router } from "expo-router";
import { Ionicons } from "@expo/vector-icons";
import ButtonComp from "../../components/atoms/ButtonComp";
import { apiRequest } from "../../services/api"

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
      isValid: hasUpperCase && hasLowerCase && hasSpecialChar && hasNumber && hasMinLength,
    };
  };

  const passwordValidation = validatePassword(form.password);
  const passwordsMatch = form.password === form.confirm_password && form.confirm_password.length > 0;

  const handleSignup = async () => {
    if (!form.name || !form.email || !form.password || !form.confirm_password || !form.institution_type) {
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

    if (!passwordValidation.isValid) {
      Alert.alert("Error", "Password does not meet requirements");
      return;
    }

    try {
      const payload = {
        name: form.name.trim(),
        email: form.email.trim(),
        password: form.password,
        user_type: form.institution_type,
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
          keyboardShouldPersistTaps="handled"
          contentContainerStyle={styles.container}
        >
          <Text style={styles.title}>Sign up</Text>
          <Text style={styles.subtitle}>
            Make the most of your professional life
          </Text>

          {/* Toggle Between Individual and Institution */}
          <View style={styles.toggleContainer}>
            <TouchableOpacity
              style={styles.toggleButton}
              onPress={() => router.replace("/(auth)/signup")}
            >
              <Ionicons name="person" size={18} color="#666" />
              <Text style={styles.toggleText}>Individual</Text>
            </TouchableOpacity>

            <TouchableOpacity style={styles.toggleButtonActive}>
              <Ionicons name="business" size={18} color="#fff" />
              <Text style={styles.toggleTextActive}>Institution</Text>
            </TouchableOpacity>
          </View>

          {/* Institution Type Selection */}
          <Text style={styles.label}>Select institution type *</Text>
          <View style={styles.institutionGrid}>
            {INSTITUTION_TYPES.map((type) => (
              <TouchableOpacity
                key={type.id}
                style={[
                  styles.typeCard,
                  form.institution_type === type.id && styles.typeCardActive,
                ]}
                onPress={() => handleChange("institution_type", type.id)}
              >
                <Text
                  style={[
                    styles.typeText,
                    form.institution_type === type.id && styles.typeTextActive,
                  ]}
                >
                  {type.label}
                </Text>
              </TouchableOpacity>
            ))}
          </View>

          {/* Institution Name */}
          <TextInput
            style={styles.input}
            placeholder="Institution name"
            value={form.name}
            onChangeText={(v) => handleChange("name", v)}
          />

          {/* Email */}
          <TextInput
            style={[styles.input, emailError ? styles.inputError : null]}
            placeholder="Email"
            keyboardType="email-address"
            autoCapitalize="none"
            value={form.email}
            onChangeText={(v) => handleChange("email", v)}
          />
          {emailError ? <Text style={styles.errorText}>{emailError}</Text> : null}

          {/* Password */}
          <View style={styles.passwordWrapper}>
            <TextInput
              style={styles.passwordInput}
              placeholder="Password"
              secureTextEntry={!showPassword}
              value={form.password}
              onChangeText={(v) => handleChange("password", v)}
            />
            <TouchableOpacity onPress={() => setShowPassword(!showPassword)}>
              <Ionicons
                name={showPassword ? "eye-off" : "eye"}
                size={20}
                color="#999"
              />
            </TouchableOpacity>
          </View>

          {/* Confirm Password */}
          <View style={styles.passwordWrapper}>
            <TextInput
              style={styles.passwordInput}
              placeholder="Confirm password"
              secureTextEntry={!showConfirmPassword}
              value={form.confirm_password}
              onChangeText={(v) => handleChange("confirm_password", v)}
            />
            <TouchableOpacity
              onPress={() => setShowConfirmPassword(!showConfirmPassword)}
            >
              <Ionicons
                name={showConfirmPassword ? "eye-off" : "eye"}
                size={20}
                color="#999"
              />
            </TouchableOpacity>
          </View>

          {/* Password mismatch error */}
          {form.confirm_password.length > 0 && !passwordsMatch && (
            <Text style={styles.errorText}>Passwords do not match</Text>
          )}

          {/* Password Requirements */}
          {form.password.length > 0 && (
            <View style={styles.requirementsBox}>
              <Text style={styles.requirementsTitle}>Password must contain:</Text>
              <View style={styles.requirementRow}>
                <Text
                  style={[
                    styles.requirement,
                    passwordValidation.hasMinLength && styles.requirementMet,
                  ]}
                >
                  {passwordValidation.hasMinLength ? "✓" : "○"} 6+ characters
                </Text>
                <Text
                  style={[
                    styles.requirement,
                    passwordValidation.hasUpperCase && styles.requirementMet,
                  ]}
                >
                  {passwordValidation.hasUpperCase ? "✓" : "○"} Uppercase
                </Text>
              </View>
              <View style={styles.requirementRow}>
                <Text
                  style={[
                    styles.requirement,
                    passwordValidation.hasLowerCase && styles.requirementMet,
                  ]}
                >
                  {passwordValidation.hasLowerCase ? "✓" : "○"} Lowercase
                </Text>
                <Text
                  style={[
                    styles.requirement,
                    passwordValidation.hasNumber && styles.requirementMet,
                  ]}
                >
                  {passwordValidation.hasNumber ? "✓" : "○"} Number
                </Text>
              </View>
              <View style={styles.requirementRow}>
                <Text
                  style={[
                    styles.requirement,
                    passwordValidation.hasSpecialChar && styles.requirementMet,
                  ]}
                >
                  {passwordValidation.hasSpecialChar ? "✓" : "○"} Special char
                </Text>
              </View>
            </View>
          )}

          <ButtonComp title="Agree & Join" onPress={handleSignup} />

          <Text style={styles.footerText}>
            Already on CCS?{" "}
            <Text
              style={styles.footerLink}
              onPress={() => router.push("/(auth)/login")}
            >
              Sign in
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
  toggleContainer: {
    flexDirection: "row",
    gap: scale(10),
    marginBottom: verticalScale(20),
  },
  toggleButton: {
    flex: 1,
    flexDirection: "row",
    alignItems: "center",
    justifyContent: "center",
    gap: scale(6),
    paddingVertical: verticalScale(12),
    borderWidth: 1,
    borderColor: "#ddd",
    borderRadius: moderateScale(6),
    backgroundColor: "#fff",
  },
  toggleButtonActive: {
    flex: 1,
    flexDirection: "row",
    alignItems: "center",
    justifyContent: "center",
    gap: scale(6),
    paddingVertical: verticalScale(12),
    borderWidth: 1,
    borderColor: "#0A66C2",
    borderRadius: moderateScale(6),
    backgroundColor: "#0A66C2",
  },
  toggleText: {
    fontSize: moderateScale(14),
    color: "#666",
    fontWeight: "500",
  },
  toggleTextActive: {
    fontSize: moderateScale(14),
    color: "#fff",
    fontWeight: "600",
  },
  label: {
    fontSize: moderateScale(13),
    fontWeight: "600",
    color: "#333",
    marginBottom: verticalScale(10),
  },
  institutionGrid: {
    flexDirection: "row",
    flexWrap: "wrap",
    gap: scale(10),
    marginBottom: verticalScale(20),
  },
  typeCard: {
    width: "48%",
    paddingVertical: verticalScale(14),
    alignItems: "center",
    borderWidth: 1,
    borderColor: "#ddd",
    borderRadius: moderateScale(6),
    backgroundColor: "#fff",
  },
  typeCardActive: {
    borderColor: "#0A66C2",
    backgroundColor: "#E8F1FF",
  },
  typeText: {
    fontSize: moderateScale(14),
    color: "#666",
    fontWeight: "500",
  },
  typeTextActive: {
    color: "#0A66C2",
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
    marginBottom: verticalScale(4),
  },
  errorText: {
    color: "#EF4444",
    fontSize: moderateScale(11),
    marginBottom: verticalScale(12),
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
    padding: moderateScale(12),
    borderRadius: moderateScale(6),
    marginBottom: verticalScale(20),
  },
  requirementsTitle: {
    fontSize: moderateScale(12),
    fontWeight: "600",
    color: "#333",
    marginBottom: verticalScale(8),
  },
  requirementRow: {
    flexDirection: "row",
    gap: scale(20),
    marginBottom: verticalScale(4),
  },
  requirement: {
    fontSize: moderateScale(11),
    color: "#999",
  },
  requirementMet: {
    color: "#10B981",
    fontWeight: "500",
  },
  footerText: {
    marginTop: verticalScale(24),
    textAlign: "center",
    color: "#444",
    fontSize: moderateScale(13),
  },
  footerLink: {
    color: "#0A66C2",
    fontWeight: "600",
  },
});