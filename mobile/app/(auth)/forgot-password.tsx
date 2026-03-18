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
} from "react-native";
import { SafeAreaView } from "react-native-safe-area-context";
import { router } from "expo-router";
import { moderateScale, scale, verticalScale } from "react-native-size-matters";
import { Ionicons } from "@expo/vector-icons";
import { apiRequest } from "../../services/api";
import ButtonComp from "../../components/atoms/ButtonComp";

export default function ForgotPassword() {
  const [email, setEmail] = useState("");
  const [emailError, setEmailError] = useState("");
  const [loading, setLoading] = useState(false);
  const [emailSent, setEmailSent] = useState(false);

  const validateEmail = (email: string) => {
    const emailRegex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
    if (email && !emailRegex.test(email)) {
      setEmailError("Please enter a valid email address");
      return false;
    }
    setEmailError("");
    return true;
  };

  const handleSubmit = async () => {
    if (!email) {
      Alert.alert("Error", "Please enter your email address");
      return;
    }
    if (!validateEmail(email)) return;

    try {
      setLoading(true);
      const { data, error } = await apiRequest("/auth/forgot-password", "POST", {
        email: email.trim(),
      });

      if (error) {
        Alert.alert("Error", error?.message || "Failed to send reset email");
      } else {
        setEmailSent(true);
      }
    } catch (err: any) {
      Alert.alert("Error", err?.message || "Failed to send reset email");
    } finally {
      setLoading(false);
    }
  };

  if (emailSent) {
    return (
      <SafeAreaView style={styles.container}>
        <View style={styles.successContainer}>
          <View style={styles.iconContainer}>
            <Ionicons name="mail" size={80} color="#0A66C2" />
          </View>
          <Text style={styles.successTitle}>Check your email</Text>
          <Text style={styles.successText}>
            We've sent a password reset link to:
          </Text>
          <Text style={styles.emailText}>{email}</Text>
          <Text style={styles.instructionText}>
            Click the link in the email to reset your password. If you don't
            see it, check your spam folder.
          </Text>
          <TouchableOpacity
            style={styles.backButton}
            onPress={() => router.replace("/(auth)/login")}
          >
            <Text style={styles.backButtonText}>Back to Login</Text>
          </TouchableOpacity>
        </View>
      </SafeAreaView>
    );
  }

  return (
    <SafeAreaView style={styles.container}>
      <KeyboardAvoidingView
        behavior={Platform.OS === "ios" ? "padding" : undefined}
        style={{ flex: 1 }}
      >
        <ScrollView
          keyboardShouldPersistTaps="handled"
          contentContainerStyle={styles.scrollContent}
        >
          <View style={styles.header}>
            <TouchableOpacity onPress={() => router.back()}>
              <Ionicons name="arrow-back" size={24} color="#1E293B" />
            </TouchableOpacity>
          </View>

          <View style={styles.content}>
            <View style={styles.iconContainer}>
              <Ionicons name="lock-closed" size={64} color="#0A66C2" />
            </View>

            <Text style={styles.title}>Forgot Password?</Text>
            <Text style={styles.subtitle}>
              No worries! Enter your email and we'll send you a reset link.
            </Text>

            <Text style={styles.label}>Email Address</Text>
            <TextInput
              style={[styles.input, emailError ? styles.inputError : null]}
              placeholder="email@example.com"
              keyboardType="email-address"
              autoCapitalize="none"
              value={email}
              onChangeText={(text) => {
                setEmail(text);
                if (emailError) validateEmail(text);
              }}
              onBlur={() => validateEmail(email)}
            />
            {emailError ? (
              <Text style={styles.errorText}>{emailError}</Text>
            ) : null}

            <ButtonComp
              title={loading ? "Sending..." : "Send Reset Link"}
              onPress={handleSubmit}
              disabled={loading}
            />

            <TouchableOpacity
              style={styles.loginLink}
              onPress={() => router.back()}
            >
              <Ionicons name="arrow-back" size={16} color="#0A66C2" />
              <Text style={styles.loginLinkText}>Back to Login</Text>
            </TouchableOpacity>
          </View>
        </ScrollView>
      </KeyboardAvoidingView>
    </SafeAreaView>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: "#fff",
  },
  scrollContent: {
    flexGrow: 1,
  },
  header: {
    paddingHorizontal: scale(20),
    paddingTop: verticalScale(10),
    paddingBottom: verticalScale(20),
  },
  content: {
    flex: 1,
    paddingHorizontal: scale(20),
    paddingTop: verticalScale(20),
  },
  iconContainer: {
    alignItems: "center",
    marginBottom: verticalScale(24),
  },
  title: {
    fontSize: moderateScale(28),
    fontWeight: "700",
    color: "#1E293B",
    marginBottom: verticalScale(12),
    textAlign: "center",
  },
  subtitle: {
    fontSize: moderateScale(15),
    color: "#64748B",
    textAlign: "center",
    marginBottom: verticalScale(32),
    lineHeight: moderateScale(22),
  },
  label: {
    fontSize: moderateScale(14),
    fontWeight: "600",
    color: "#333",
    marginBottom: verticalScale(8),
  },
  input: {
    borderWidth: 1,
    borderColor: "#ddd",
    borderRadius: moderateScale(8),
    padding: moderateScale(14),
    marginBottom: verticalScale(20),
    fontSize: moderateScale(15),
  },
  inputError: {
    borderColor: "#EF4444",
    marginBottom: verticalScale(4),
  },
  errorText: {
    color: "#EF4444",
    fontSize: moderateScale(12),
    marginBottom: verticalScale(16),
  },
  loginLink: {
    flexDirection: "row",
    alignItems: "center",
    justifyContent: "center",
    gap: scale(6),
    marginTop: verticalScale(20),
  },
  loginLinkText: {
    color: "#0A66C2",
    fontSize: moderateScale(14),
    fontWeight: "600",
  },
  successContainer: {
    flex: 1,
    justifyContent: "center",
    alignItems: "center",
    paddingHorizontal: scale(40),
  },
  successTitle: {
    fontSize: moderateScale(24),
    fontWeight: "700",
    color: "#1E293B",
    marginBottom: verticalScale(12),
    textAlign: "center",
  },
  successText: {
    fontSize: moderateScale(15),
    color: "#64748B",
    textAlign: "center",
    marginBottom: verticalScale(8),
  },
  emailText: {
    fontSize: moderateScale(16),
    fontWeight: "600",
    color: "#0A66C2",
    marginBottom: verticalScale(20),
  },
  instructionText: {
    fontSize: moderateScale(14),
    color: "#64748B",
    textAlign: "center",
    lineHeight: moderateScale(20),
    marginBottom: verticalScale(32),
  },
  backButton: {
    backgroundColor: "#0A66C2",
    paddingHorizontal: scale(32),
    paddingVertical: verticalScale(14),
    borderRadius: moderateScale(8),
  },
  backButtonText: {
    color: "#fff",
    fontSize: moderateScale(15),
    fontWeight: "600",
  },
});