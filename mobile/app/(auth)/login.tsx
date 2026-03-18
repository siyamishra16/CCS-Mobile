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
import { moderateScale, verticalScale, scale } from "react-native-size-matters";
import { router } from "expo-router";
import { Ionicons } from "@expo/vector-icons";
import AsyncStorage from "@react-native-async-storage/async-storage";
import { apiRequest } from "../../services/api";
import ButtonComp from "../../components/atoms/ButtonComp";

export default function Login() {
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const [showPassword, setShowPassword] = useState(false);
  const [emailError, setEmailError] = useState("");

  const validateEmail = (email: string) => {
    const emailRegex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
    if (email && !emailRegex.test(email)) {
      setEmailError("Please enter a valid email address");
      return false;
    }
    setEmailError("");
    return true;
  };

  const handleLogin = async () => {
    if (!email || !password) {
      Alert.alert("Error", "Please fill all fields");
      return;
    }
    if (!validateEmail(email)) return;

    try {
      const { data, error } = await apiRequest("/auth/login", "POST", {
        email: email.trim(),
        password,
      });

      if (error) throw error;

      if (data?.token && data?.user) {
        await AsyncStorage.setItem("token", data.token);
        await AsyncStorage.setItem("user", JSON.stringify(data.user));

        if (!data.user.profile_completed) {
          if (data.user.user_type === 3) router.replace("/(onboarding)/student");
          else if (data.user.user_type === 7) router.replace("/(onboarding)/company");
          else if (data.user.user_type === 6) router.replace("/(onboarding)/school");
          else if (data.user.user_type === 4) router.replace("/(onboarding)/college");
          else if (data.user.user_type === 5) router.replace("/(onboarding)/university");
        } else {
          if (data.user.user_type === 3) router.replace("/(student)");
          else if (data.user.user_type === 7) router.replace("/(company)");
          else if (data.user.user_type === 6) router.replace("/(school)");
          else if (data.user.user_type === 4) router.replace("/(college)");
          else if (data.user.user_type === 5) router.replace("/(university)");
        }
      }
    } catch (err: any) {
      Alert.alert("Error", err?.message || "Login failed");
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
          <Text style={styles.title}>Welcome back</Text>
          <Text style={styles.subtitle}>Sign in to continue</Text>

          <Text style={styles.label}>Email</Text>
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
          {emailError ? <Text style={styles.errorText}>{emailError}</Text> : null}

          <Text style={styles.label}>Password</Text>
          <View style={styles.passwordWrapper}>
            <TextInput
              style={styles.passwordInput}
              placeholder="Password"
              secureTextEntry={!showPassword}
              value={password}
              onChangeText={setPassword}
            />
            <TouchableOpacity onPress={() => setShowPassword(!showPassword)}>
              <Ionicons
                name={showPassword ? "eye-off" : "eye"}
                size={20}
                color="#999"
              />
            </TouchableOpacity>
          </View>

          <TouchableOpacity
            style={styles.forgotPassword}
            onPress={() => router.push("/(auth)/forgot-password")}
          >
            <Text style={styles.forgotPasswordText}>Forgot password?</Text>
          </TouchableOpacity>

          <ButtonComp title="Sign In" onPress={handleLogin} />

          <Text style={styles.footerText}>
            Don't have an account?{" "}
            <Text
              style={styles.footerLink}
              onPress={() => router.push("/(auth)/signup")}
            >
              Sign Up
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
    paddingTop: verticalScale(60),
    paddingBottom: verticalScale(40),
    backgroundColor: "white",
  },
  title: {
    fontSize: moderateScale(28),
    fontWeight: "700",
    color: "#000",
    marginBottom: verticalScale(8),
  },
  subtitle: {
    fontSize: moderateScale(15),
    color: "#666",
    marginBottom: verticalScale(40),
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
    marginBottom: verticalScale(16),
    fontSize: moderateScale(15),
  },
  inputError: {
    borderColor: "#EF4444",
    marginBottom: verticalScale(4),
  },
  errorText: {
    color: "#EF4444",
    fontSize: moderateScale(12),
    marginBottom: verticalScale(12),
  },
  passwordWrapper: {
    flexDirection: "row",
    alignItems: "center",
    borderWidth: 1,
    borderColor: "#ddd",
    borderRadius: moderateScale(8),
    paddingHorizontal: scale(14),
    marginBottom: verticalScale(12),
  },
  passwordInput: {
    flex: 1,
    paddingVertical: moderateScale(14),
    fontSize: moderateScale(15),
  },
  forgotPassword: {
    alignSelf: "flex-end",
    marginBottom: verticalScale(24),
  },
  forgotPasswordText: {
    color: "#0A66C2",
    fontSize: moderateScale(14),
    fontWeight: "600",
  },
  footerText: {
    marginTop: verticalScale(24),
    textAlign: "center",
    color: "#666",
    fontSize: moderateScale(14),
  },
  footerLink: {
    color: "#0A66C2",
    fontWeight: "600",
  },
});