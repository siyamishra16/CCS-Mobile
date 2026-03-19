import React, { useState } from "react";
import { 
  View, 
  Text, 
  TextInput, 
  StyleSheet, 
  TouchableOpacity, 
  ScrollView, 
  KeyboardAvoidingView, 
  Platform,
  Alert 
} from "react-native";
import { SafeAreaView } from "react-native-safe-area-context";
import { router } from "expo-router";
import { apiRequest } from "../../services/api";
import AsyncStorage from "@react-native-async-storage/async-storage";

export default function SchoolOnboarding() {
  const [form, setForm] = useState({
    school_name: "",
    state: "",
    city: "",
    address: "",
    zipcode: "",
    phone_number: "",
  });

  const handleContinue = async () => {
    if (!form.school_name || !form.phone_number || !form.address) {
      Alert.alert("Error", "Please fill all required fields");
      return;
    }

    try {
      const { data, error } = await apiRequest("/auth/complete-profile", "POST", form);
      if (error) throw new Error(error);
      if (data?.user) await AsyncStorage.setItem("user", JSON.stringify(data.user));
      router.replace("/(school)");
    } catch (err: any) {
      Alert.alert("Error", err.message || "Failed to save profile");
    }
  };

  return (
    <SafeAreaView style={styles.safe}>
      <KeyboardAvoidingView 
        behavior={Platform.OS === "ios" ? "padding" : "height"} 
        style={{ flex: 1 }}
      >
        <ScrollView contentContainerStyle={styles.container}>
          <Text style={styles.title}>Welcome to CCS! 🎉</Text>
          <Text style={styles.subtitle}>Let's complete your school profile to get started</Text>

          <View style={styles.card}>
            <Text style={styles.label}>School Name *</Text>
            <TextInput 
              style={styles.input} 
              placeholder="Enter school name" 
              placeholderTextColor="#999"
              onChangeText={(v) => setForm({...form, school_name: v})} 
            />

            <View style={styles.row}>
              <View style={{ flex: 1, marginRight: 10 }}>
                <Text style={styles.label}>State *</Text>
                <TextInput 
                  style={styles.input} 
                  placeholder="State" 
                  placeholderTextColor="#999"
                  onChangeText={(v) => setForm({...form, state: v})} 
                />
              </View>
              <View style={{ flex: 1 }}>
                <Text style={styles.label}>City *</Text>
                <TextInput 
                  style={styles.input} 
                  placeholder="City" 
                  placeholderTextColor="#999"
                  onChangeText={(v) => setForm({...form, city: v})} 
                />
              </View>
            </View>

            <Text style={styles.label}>Address *</Text>
            <TextInput 
              style={styles.input} 
              placeholder="Enter complete school address" 
              placeholderTextColor="#999"
              onChangeText={(v) => setForm({...form, address: v})} 
            />

            <View style={styles.row}>
              <View style={{ flex: 1, marginRight: 10 }}>
                <Text style={styles.label}>Zipcode *</Text>
                <TextInput 
                  style={styles.input} 
                  placeholder="110001" 
                  placeholderTextColor="#999"
                  keyboardType="numeric" 
                  onChangeText={(v) => setForm({...form, zipcode: v})} 
                />
              </View>
              <View style={{ flex: 1.5 }}>
                <Text style={styles.label}>Phone Number *</Text>
                <TextInput 
                  style={styles.input} 
                  placeholder="+91 9876543210" 
                  placeholderTextColor="#999"
                  keyboardType="phone-pad" 
                  onChangeText={(v) => setForm({...form, phone_number: v})} 
                />
              </View>
            </View>

            <TouchableOpacity style={styles.button} onPress={handleContinue}>
              <Text style={styles.buttonText}>Continue</Text>
            </TouchableOpacity>
            
            <Text style={styles.footerNote}>
              All fields marked with * are required to access your dashboard
            </Text>
          </View>
        </ScrollView>
      </KeyboardAvoidingView>
    </SafeAreaView>
  );
}

const styles = StyleSheet.create({
  safe: { 
    flex: 1, 
    backgroundColor: "#F5F5F7" 
  },
  container: { 
    paddingVertical: 40, 
    alignItems: 'center',
    paddingHorizontal: 20
  },
  title: { 
    fontSize: 26, 
    fontWeight: "700", 
    color: "#333", 
    marginBottom: 5 
  },
  subtitle: { 
    fontSize: 14, 
    color: "#666", 
    marginBottom: 30, 
    textAlign: 'center' 
  },
  card: { 
    backgroundColor: "#FFF", 
    width: '100%', 
    borderRadius: 12, 
    padding: 20, 
    shadowColor: "#000",
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.1,
    shadowRadius: 4,
    elevation: 3 
  },
  label: { 
    fontSize: 13, 
    fontWeight: "600", 
    color: "#444", 
    marginTop: 15, 
    marginBottom: 5 
  },
  input: { 
    backgroundColor: "#F2F2F7", 
    borderRadius: 8, 
    padding: 12, 
    fontSize: 15,
    color: "#000"
  },
  row: { 
    flexDirection: "row", 
    justifyContent: "space-between" 
  },
  button: { 
    backgroundColor: "#007AFF", 
    padding: 15, 
    borderRadius: 10, 
    alignItems: "center", 
    marginTop: 25 
  },
  buttonText: { 
    color: "#FFF", 
    fontWeight: "bold", 
    fontSize: 16 
  },
  footerNote: { 
    textAlign: "center", 
    color: "#999", 
    fontSize: 11, 
    marginTop: 15 
  }
});