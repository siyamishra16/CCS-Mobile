// import { useEffect } from "react";
// import { View, ActivityIndicator } from "react-native";
// import { router } from "expo-router";
// import AsyncStorage from "@react-native-async-storage/async-storage";

// export default function Index() {
//   useEffect(() => {
//     checkAuth();
//   }, []);

//   const checkAuth = async () => {
//     try {
//       const token = await AsyncStorage.getItem("token");
//       const userStr = await AsyncStorage.getItem("user");

//       if (token && userStr) {
//         const user = JSON.parse(userStr);
//         if (user.user_type === 3) router.replace("/(student)");
//         else if (user.user_type === 7) router.replace("/(company)");
//         else if (user.user_type === 6) router.replace("/(school)");
//         else if (user.user_type === 4) router.replace("/(college)");
//         else if (user.user_type === 5) router.replace("/(university)");
//         else router.replace("/(auth)/login");
//       } else {
//         router.replace("/(onboarding)");
//       }
//     } catch (error) {
//       console.error("Error checking auth:", error);
//       router.replace("/(auth)/login");
//     }
//   };

//   return (
//     <View style={{ flex: 1, justifyContent: "center", alignItems: "center" }}>
//       <ActivityIndicator size="large" color="#0A66C2" />
//     </View>
//   );
// }

import React, { useEffect } from "react";
import { View, ActivityIndicator, StyleSheet } from "react-native";
import { router } from "expo-router";
import AsyncStorage from "@react-native-async-storage/async-storage";

// Accent Colors based on your request
const ACCENT_BLUE = "#1F4FA3";
const TEXT_GRAY = "#222222"; // text-gray-22 equivalent

export default function Index() {
  useEffect(() => {
    checkAuth();
  }, []);

  const checkAuth = async () => {
    try {
      const token = await AsyncStorage.getItem("token");
      const userStr = await AsyncStorage.getItem("user");

      if (token && userStr) {
        const user = JSON.parse(userStr);
        // User Type Logic
        if (user.user_type === 3) router.replace("/(student)");
        else if (user.user_type === 7) router.replace("/(company)");
        else if (user.user_type === 6) router.replace("/(school)");
        else if (user.user_type === 4) router.replace("/(college)");
        else if (user.user_type === 5) router.replace("/(university)");
        else router.replace("/(auth)/login");
      } else {
        router.replace("/(onboarding)");
      }
    } catch (error) {
      console.error("Error checking auth:", error);
      router.replace("/(auth)/login");
    }
  };

  return (
    <View style={styles.container}>
      {/* Updated loading color to match your #1F4FA3 accent */}
      <ActivityIndicator size="large" color={ACCENT_BLUE} />
    </View>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
    justifyContent: "center",
    alignItems: "center",
    backgroundColor: "#FFFFFF",
  },
});