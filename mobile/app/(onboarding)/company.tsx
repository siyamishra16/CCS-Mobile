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

export default function CompanyOnboarding() {
  const [form, setForm] = useState({
    company_name: "",
    company_type: "",
    founded_year: "",
    headquarters: "",
    phone_number: "",
  });

  const handleContinue = async () => {
    // Basic validation for required fields
    if (!form.company_name || !form.company_type || !form.headquarters) {
      Alert.alert("Error", "Please fill all required fields");
      return;
    }

    try {
      const { data, error } = await apiRequest("/auth/complete-profile", "POST", {
        ...form,
        user_type: 7 // Identifying as Company
      });

      if (error) throw new Error(error);
      
      if (data?.user) {
        await AsyncStorage.setItem("user", JSON.stringify(data.user));
      }
      
      router.replace("/(company)");
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
          {/* Header matches image 5 */}
          <Text style={styles.title}>Welcome! 🥳</Text>
          <Text style={styles.subtitle}>Let's complete your profile to get started</Text>

          <View style={styles.card}>
            <Text style={styles.label}>Company Name *</Text>
            <TextInput 
              style={styles.input} 
              placeholder="Enter company name" 
              placeholderTextColor="#999"
              value={form.company_name}
              onChangeText={(v) => setForm({...form, company_name: v})} 
            />

            <View style={styles.row}>
              <View style={{ flex: 1, marginRight: 10 }}>
                <Text style={styles.label}>Company Type *</Text>
                <TextInput 
                  style={styles.input} 
                  placeholder="Non-Profit" 
                  placeholderTextColor="#999"
                  value={form.company_type}
                  onChangeText={(v) => setForm({...form, company_type: v})} 
                />
              </View>
              <View style={{ flex: 1 }}>
                <Text style={styles.label}>Founded Year *</Text>
                <TextInput 
                  style={styles.input} 
                  placeholder="2222" 
                  placeholderTextColor="#999"
                  keyboardType="numeric"
                  value={form.founded_year}
                  onChangeText={(v) => setForm({...form, founded_year: v})} 
                />
              </View>
            </View>

            <Text style={styles.label}>Headquarters *</Text>
            <TextInput 
              style={styles.input} 
              placeholder="Enter headquarters location" 
              placeholderTextColor="#999"
              value={form.headquarters}
              onChangeText={(v) => setForm({...form, headquarters: v})} 
            />

            <Text style={styles.label}>Phone Number *</Text>
            <TextInput 
              style={styles.input} 
              placeholder="098..." 
              placeholderTextColor="#999"
              keyboardType="phone-pad"
              value={form.phone_number}
              onChangeText={(v) => setForm({...form, phone_number: v})} 
            />

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
    padding: 24, 
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