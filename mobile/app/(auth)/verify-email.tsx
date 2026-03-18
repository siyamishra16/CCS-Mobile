import React, { useEffect, useState } from "react";
import {
  View,
  Text,
  StyleSheet,
  ActivityIndicator,
  TouchableOpacity,
} from "react-native";
import { SafeAreaView } from "react-native-safe-area-context";
import { router, useLocalSearchParams } from "expo-router";
import { moderateScale, scale, verticalScale } from "react-native-size-matters";
import { Ionicons } from "@expo/vector-icons";
import { apiRequest } from "../../services/api";

export default function VerifyEmail() {
  const { token } = useLocalSearchParams();
  const [loading, setLoading] = useState(true);
  const [success, setSuccess] = useState(false);
  const [error, setError] = useState("");

  useEffect(() => {
    if (token) {
      verifyEmail();
    } else {
      setError("Invalid verification link");
      setLoading(false);
    }
  }, [token]);

  const verifyEmail = async () => {
    try {
      const { data, error } = await apiRequest(
        `/auth/verify-email/${token}`,
        "GET",
        null
      );
      if (error) {
        setError(error?.message || "Verification failed");
      } else {
        setSuccess(true);
        setTimeout(() => {
          router.replace("/(auth)/login");
        }, 3000);
      }
    } catch (err: any) {
      setError(err?.message || "Verification failed");
    } finally {
      setLoading(false);
    }
  };

  return (
    <SafeAreaView style={styles.container}>
      <View style={styles.content}>
        {loading ? (
          <>
            <ActivityIndicator size="large" color="#0A66C2" />
            <Text style={styles.loadingText}>Verifying your email...</Text>
          </>
        ) : success ? (
          <>
            <View style={styles.iconContainer}>
              <Ionicons name="checkmark-circle" size={80} color="#10B981" />
            </View>
            <Text style={styles.title}>Email Verified!</Text>
            <Text style={styles.subtitle}>
              Your email has been successfully verified.
            </Text>
            <Text style={styles.redirectText}>Redirecting to login...</Text>
          </>
        ) : (
          <>
            <View style={styles.iconContainer}>
              <Ionicons name="close-circle" size={80} color="#EF4444" />
            </View>
            <Text style={styles.title}>Verification Failed</Text>
            <Text style={styles.subtitle}>{error}</Text>
            <TouchableOpacity
              style={styles.button}
              onPress={() => router.replace("/(auth)/login")}
            >
              <Text style={styles.buttonText}>Go to Login</Text>
            </TouchableOpacity>
          </>
        )}
      </View>
    </SafeAreaView>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: "#fff",
  },
  content: {
    flex: 1,
    justifyContent: "center",
    alignItems: "center",
    paddingHorizontal: scale(40),
  },
  loadingText: {
    marginTop: verticalScale(20),
    fontSize: moderateScale(16),
    color: "#64748B",
  },
  iconContainer: {
    marginBottom: verticalScale(24),
  },
  title: {
    fontSize: moderateScale(24),
    fontWeight: "700",
    color: "#1E293B",
    marginBottom: verticalScale(12),
    textAlign: "center",
  },
  subtitle: {
    fontSize: moderateScale(15),
    color: "#64748B",
    textAlign: "center",
    marginBottom: verticalScale(8),
  },
  redirectText: {
    fontSize: moderateScale(14),
    color: "#0A66C2",
    marginTop: verticalScale(16),
  },
  button: {
    backgroundColor: "#0A66C2",
    paddingHorizontal: scale(32),
    paddingVertical: verticalScale(14),
    borderRadius: moderateScale(8),
    marginTop: verticalScale(24),
  },
  buttonText: {
    color: "#fff",
    fontSize: moderateScale(15),
    fontWeight: "600",
  },
});