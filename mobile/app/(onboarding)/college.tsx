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

export default function CollegeOnboarding() {
  const [form, setForm] = useState({
    college_name: "",
    state: "",
    city: "",
    address: "",
    zipcode: "",
    phone_number: "",
  });

  const handleContinue = async () => {
    if (!form.college_name || !form.phone_number || !form.address) {
      Alert.alert("Error", "Please fill all required fields");
      return;
    }

    try {
      const { data, error } = await apiRequest("/auth/complete-profile", "POST", {
        ...form,
        user_type: 4 // Explicitly identifying as college if needed by your backend
      });

      if (error) throw new Error(error);
      
      if (data?.user) {
        await AsyncStorage.setItem("user", JSON.stringify(data.user));
      }
      
      router.replace("/(college)");
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
        <ScrollView contentContainerStyle={styles.container} showsVerticalScrollIndicator={false}>
          <Text style={styles.title}>Welcome! 🥳</Text>
          <Text style={styles.subtitle}>Let's complete your profile to get started</Text>

          <View style={styles.card}>
            <Text style={styles.label}>Clg Name *</Text>
            <TextInput 
              style={styles.input} 
              placeholder="Clg Name" 
              placeholderTextColor="#999"
              value={form.college_name}
              onChangeText={(v) => setForm({...form, college_name: v})} 
            />

            <View style={styles.row}>
              <View style={{ flex: 1, marginRight: 10 }}>
                <Text style={styles.label}>State *</Text>
                <TextInput 
                  style={styles.input} 
                  placeholder="Select state" 
                  placeholderTextColor="#999"
                  onChangeText={(v) => setForm({...form, state: v})} 
                />
              </View>
              <View style={{ flex: 1 }}>
                <Text style={styles.label}>City *</Text>
                <TextInput 
                  style={styles.input} 
                  placeholder="Select city" 
                  placeholderTextColor="#999"
                  onChangeText={(v) => setForm({...form, city: v})} 
                />
              </View>
            </View>

            <Text style={styles.label}>Address *</Text>
            <TextInput 
              style={styles.input} 
              placeholder="Enter your complete address" 
              placeholderTextColor="#999"
              multiline
              onChangeText={(v) => setForm({...form, address: v})} 
            />

            <View style={styles.row}>
              <View style={{ flex: 1, marginRight: 10 }}>
                <Text style={styles.label}>Zipcode *</Text>
                <TextInput 
                  style={styles.input} 
                  placeholder="e.g. 110001" 
                  placeholderTextColor="#999"
                  keyboardType="numeric" 
                  maxLength={6}
                  onChangeText={(v) => setForm({...form, zipcode: v})} 
                />
              </View>
              <View style={{ flex: 1.5 }}>
                <Text style={styles.label}>Phone Number *</Text>
                <TextInput 
                  style={styles.input} 
                  placeholder="e.g. +91 9876543210" 
                  placeholderTextColor="#999"
                  keyboardType="phone-pad" 
                  maxLength={10}
                  onChangeText={(v) => setForm({...form, phone_number: v})} 
                />
              </View>
            </View>

            <TouchableOpacity style={styles.button} onPress={handleContinue} activeOpacity={0.8}>
              <Text style={styles.buttonText}>Continue</Text>
            </TouchableOpacity>
            
            <Text style={styles.footerNote}>
              All fields are required to access your dashboard
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
    fontSize: 28, 
    fontWeight: "700", 
    color: "#333", 
    marginBottom: 5 
  },
  subtitle: { 
    fontSize: 15, 
    color: "#666", 
    marginBottom: 30, 
    textAlign: 'center' 
  },
  card: { 
    backgroundColor: "#FFF", 
    width: '100%', 
    borderRadius: 16, 
    padding: 20, 
    shadowColor: "#000",
    shadowOffset: { width: 0, height: 4 },
    shadowOpacity: 0.1,
    shadowRadius: 12,
    elevation: 4 
  },
  label: { 
    fontSize: 13, 
    fontWeight: "600", 
    color: "#444", 
    marginTop: 15, 
    marginBottom: 6 
  },
  input: { 
    backgroundColor: "#F2F2F7", 
    borderRadius: 10, 
    padding: 14, 
    fontSize: 15,
    color: "#000"
  },
  row: { 
    flexDirection: "row", 
    justifyContent: "space-between" 
  },
  button: { 
    backgroundColor: "#007AFF", 
    padding: 16, 
    borderRadius: 12, 
    alignItems: "center", 
    marginTop: 30 
  },
  buttonText: { 
    color: "#FFF", 
    fontWeight: "700", 
    fontSize: 16 
  },
  footerNote: { 
    textAlign: "center", 
    color: "#999", 
    fontSize: 12, 
    marginTop: 20 
  }
});