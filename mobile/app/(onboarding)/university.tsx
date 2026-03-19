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

export default function UniversityOnboarding() {
  const [form, setForm] = useState({
    university_name: "",
    state: "",
    city: "",
    address: "",
    zipcode: "",
    phone_number: "",
  });

  const handleComplete = async () => {
    if (!form.university_name || !form.phone_number || !form.address) {
      Alert.alert("Error", "Please fill all required fields");
      return;
    }

    try {
      const { data, error } = await apiRequest("/auth/complete-profile", "POST", {
        ...form,
        user_type: 5 // Identifying as University
      });

      if (error) throw new Error(error);
      
      if (data?.user) {
        await AsyncStorage.setItem("user", JSON.stringify(data.user));
      }
      
      router.replace("/(university)");
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
          <Text style={styles.title}>Welcome, University! 🎓</Text>
          <Text style={styles.subtitle}>Let's complete your university profile to get started</Text>

          <View style={styles.card}>
            <Text style={styles.label}>University Name *</Text>
            <TextInput 
              style={styles.input} 
              placeholder="Enter university name" 
              placeholderTextColor="#999"
              value={form.university_name}
              onChangeText={(v) => setForm({...form, university_name: v})} 
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
              placeholder="Enter university address" 
              placeholderTextColor="#999"
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
                  onChangeText={(v) => setForm({...form, phone_number: v})} 
                />
              </View>
            </View>

            <TouchableOpacity style={styles.button} onPress={handleComplete} activeOpacity={0.8}>
              <Text style={styles.buttonText}>Complete Profile</Text>
            </TouchableOpacity>
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
    color: "#1A1A1B", 
    marginBottom: 5 
  },
  subtitle: { 
    fontSize: 14, 
    color: "#5C5C5C", 
    marginBottom: 30, 
    textAlign: 'center' 
  },
  card: { 
    backgroundColor: "#FFF", 
    width: '100%', 
    borderRadius: 12, 
    padding: 22, 
    shadowColor: "#000",
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.1,
    shadowRadius: 8,
    elevation: 3 
  },
  label: { 
    fontSize: 13, 
    fontWeight: "600", 
    color: "#333", 
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
    backgroundColor: "#2D3E50", // Matching the darker profile button color in image 4
    padding: 16, 
    borderRadius: 10, 
    alignItems: "center", 
    marginTop: 30 
  },
  buttonText: { 
    color: "#FFF", 
    fontWeight: "bold", 
    fontSize: 16 
  }
});