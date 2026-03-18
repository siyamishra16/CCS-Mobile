import React, { useState, useRef } from "react";
import {
  View,
  Text,
  TextInput,
  StyleSheet,
  Alert,
  ScrollView,
  KeyboardAvoidingView,
  Platform,
  TouchableOpacity,
  Modal,
  FlatList,
} from "react-native";
import { SafeAreaView } from "react-native-safe-area-context";
import { router } from "expo-router";
import { Ionicons } from "@expo/vector-icons";
import AsyncStorage from "@react-native-async-storage/async-storage";
import { apiRequest } from "../../services/api";

/* -------------------- STATES -------------------- */

const STATES_AND_CITIES: Record<string, string[]> = {
  "Maharashtra": ["Mumbai", "Pune", "Nagpur", "Nashik", "Aurangabad"],
  "Delhi": ["New Delhi", "Dwarka", "Rohini", "Saket", "Lajpat Nagar"],
  "Uttar Pradesh": ["Lucknow", "Kanpur", "Agra", "Varanasi", "Prayagraj"],
  "West Bengal": ["Kolkata", "Howrah", "Siliguri"],
  "Karnataka": ["Bengaluru", "Mysuru", "Mangaluru"],
};

const STATES = Object.keys(STATES_AND_CITIES).sort();

/* -------------------- DROPDOWN -------------------- */

const Dropdown = ({ value, options, onSelect, placeholder, disabled }: any) => {
  const [visible, setVisible] = useState(false);

  return (
    <>
      <TouchableOpacity
        style={styles.dropdown}
        disabled={disabled}
        onPress={() => setVisible(true)}
      >
        <Text style={[styles.dropdownText, !value && styles.placeholder]}>
          {value || placeholder}
        </Text>
        <Ionicons name="chevron-down" size={16} color="#C7C7CC" />
      </TouchableOpacity>

      <Modal visible={visible} transparent animationType="slide">
        <View style={styles.modalOverlay}>
          <View style={styles.modalBox}>
            <FlatList
              data={options}
              keyExtractor={(item) => item}
              renderItem={({ item }) => (
                <TouchableOpacity
                  style={styles.option}
                  onPress={() => {
                    onSelect(item);
                    setVisible(false);
                  }}
                >
                  <Text style={styles.optionText}>{item}</Text>
                </TouchableOpacity>
              )}
            />
          </View>
        </View>
      </Modal>
    </>
  );
};

/* -------------------- SCREEN -------------------- */

export default function StudentOnboarding() {
  const scrollRef = useRef<ScrollView | null>(null);

  const [form, setForm] = useState({
    full_name: "",
    state: "",
    city: "",
    address: "",
    zipcode: "",
    phone_number: "",
  });

  const [phoneError, setPhoneError] = useState("");

  const handleChange = (key: string, value: string) => {
    if (key === "state") {
      setForm({ ...form, state: value, city: "" });
    } else {
      setForm({ ...form, [key]: value });
    }

    if (key === "phone_number") setPhoneError("");
  };

  const cities = form.state ? STATES_AND_CITIES[form.state] || [] : [];

  const validatePhone = (phone: string): boolean => {
    const cleaned = phone.replace(/\s/g, "");

    if (!/^[6-9]\d{9}$/.test(cleaned)) {
      setPhoneError("Enter valid 10-digit mobile number");
      return false;
    }

    setPhoneError("");
    return true;
  };

  const handleContinue = async () => {
  if (
    !form.full_name ||
    !form.state ||
    !form.city ||
    !form.address ||
    !form.zipcode ||
    !form.phone_number
  ) {
    Alert.alert("Error", "All fields are required");
    return;
  }

  if (!validatePhone(form.phone_number)) return;

  try {
    const token = await AsyncStorage.getItem("token");

    if (!token) {
      router.replace("/(auth)/login");
      return;
    }

    const payload = {
      ...form,
      full_name: form.full_name.trim(),
      address: form.address.trim(),
      zipcode: form.zipcode.trim(),
      phone_number: form.phone_number.trim(),
    };

    const { data, error } = await apiRequest(
      "/auth/complete-profile",
      "POST",
      payload
    );

    if (error) {
      Alert.alert("Error", error);
      return;
    }

    if (data?.user) {
      await AsyncStorage.setItem("user", JSON.stringify(data.user));
    }

    router.replace("/(student)");
  } catch (err: any) {
    Alert.alert("Error", err?.message || "Failed to save profile");
  }
};

  return (
    <SafeAreaView style={styles.safe}>
      <KeyboardAvoidingView
        behavior={Platform.OS === "ios" ? "padding" : undefined}
        style={{ flex: 1 }}
      >
        <ScrollView
          ref={scrollRef as any}
          showsVerticalScrollIndicator={false}
          contentContainerStyle={{
            paddingTop: 6,
            paddingBottom: 20,
          }}
        >
          {/* Header */}
          <View style={styles.header}>
            <TouchableOpacity onPress={() => router.replace("/(auth)/login")}>
              <Ionicons name="chevron-back" size={24} color="#007AFF" />
            </TouchableOpacity>

            <Text style={styles.headerTitle}>Add Details</Text>
            <View style={{ width: 24 }} />
          </View>

          {/* Card */}
          <View style={styles.card}>
            <Text style={styles.label}>
              Full Name <Text style={styles.star}>*</Text>
            </Text>

            <TextInput
              style={styles.input}
              value={form.full_name}
              placeholder="Enter full name"
              onChangeText={(v) => handleChange("full_name", v)}
            />

            <Text style={styles.label}>
              State <Text style={styles.star}>*</Text>
            </Text>
            <Dropdown
              value={form.state}
              options={STATES}
              placeholder="Select state"
              onSelect={(v: string) => handleChange("state", v)}
            />

            <Text style={styles.label}>
              City <Text style={styles.star}>*</Text>
            </Text>
            <Dropdown
              value={form.city}
              options={cities}
              placeholder="Select city"
              disabled={!form.state}
              onSelect={(v: string) => handleChange("city", v)}
            />

            <Text style={styles.label}>
              Address <Text style={styles.star}>*</Text>
            </Text>
            <TextInput
              style={styles.input}
              value={form.address}
              placeholder="Enter address"
              onChangeText={(v) => handleChange("address", v)}
            />

            <Text style={styles.label}>
              Zipcode <Text style={styles.star}>*</Text>
            </Text>
            <TextInput
              style={styles.input}
              value={form.zipcode}
              keyboardType="numeric"
              maxLength={6}
              placeholder="Enter zipcode"
              onChangeText={(v) => handleChange("zipcode", v)}
            />

            <Text style={styles.label}>
              Phone Number <Text style={styles.star}>*</Text>
            </Text>
            <TextInput
              style={styles.input}
              value={form.phone_number}
              keyboardType="number-pad"
              maxLength={10}
              placeholder="Enter phone number"
              onBlur={() => validatePhone(form.phone_number)}
              onChangeText={(v) =>
                handleChange("phone_number", v.replace(/[^0-9]/g, ""))
              }
            />
          </View>

          {phoneError ? <Text style={styles.error}>{phoneError}</Text> : null}

          <TouchableOpacity style={styles.button} onPress={handleContinue}>
            <Text style={styles.buttonText}>Submit Details</Text>
          </TouchableOpacity>
        </ScrollView>
      </KeyboardAvoidingView>
    </SafeAreaView>
  );
}

/* -------------------- STYLES -------------------- */

const styles = StyleSheet.create({
  safe: {
    flex: 1,
    backgroundColor: "#F5F5F7",
  },

  header: {
    flexDirection: "row",
    alignItems: "center",
    justifyContent: "space-between",
    paddingHorizontal: 18,
    paddingVertical: 12,
    backgroundColor: "#FFFFFF",
    borderBottomWidth: 1,
    borderColor: "#F1F1F3",
  },

  headerTitle: {
    fontSize: 18,
    fontWeight: "600",
  },

  card: {
    backgroundColor: "#FFFFFF",
    marginHorizontal: 16,
    marginTop: 20,
    borderRadius: 16,
    padding: 18,
  },

  label: {
    fontSize: 13,
    marginBottom: 6,
    marginTop: 12,
    fontWeight: "500",
  },

  star: { color: "#FF3B30" },

  input: {
    backgroundColor: "#F2F2F7",
    borderRadius: 12,
    paddingHorizontal: 16,
    paddingVertical: 14,
    fontSize: 14,
  },

  dropdown: {
    backgroundColor: "#F2F2F7",
    borderRadius: 12,
    paddingHorizontal: 16,
    paddingVertical: 14,
    flexDirection: "row",
    justifyContent: "space-between",
    alignItems: "center",
  },

  dropdownText: {
    fontSize: 14,
  },

  placeholder: {
    color: "#A0A0A5",
  },

  button: {
    backgroundColor: "#007AFF",
    marginHorizontal: 16,
    marginTop: 14,
    marginBottom: 14,
    paddingVertical: 14,
    borderRadius: 12,
    alignItems: "center",
  },

  buttonText: {
    color: "#FFF",
    fontSize: 15,
    fontWeight: "600",
  },

  error: {
    color: "#FF3B30",
    marginHorizontal: 20,
    marginTop: 6,
    fontSize: 12,
  },

  modalOverlay: {
    flex: 1,
    backgroundColor: "rgba(0,0,0,0.2)",
    justifyContent: "flex-end",
  },

  modalBox: {
    backgroundColor: "#FFF",
    borderTopLeftRadius: 20,
    borderTopRightRadius: 20,
    maxHeight: "70%",
  },

  option: {
    padding: 16,
    borderBottomWidth: 0.5,
    borderColor: "#E5E5EA",
  },

  optionText: {
    fontSize: 15,
  },
});