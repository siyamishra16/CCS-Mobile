// import React, { useEffect, useState } from "react";
// import {
//   View,
//   Text,
//   StyleSheet,
//   TouchableOpacity,
//   ActivityIndicator,
//   SafeAreaView,
//   StatusBar,
//   Platform
// } from "react-native";
// import { router } from "expo-router";
// import AsyncStorage from "@react-native-async-storage/async-storage";

// export default function Onboarding() {
//   const [isLoading, setIsLoading] = useState(true);
//   const [activeDot, setActiveDot] = useState(0);

//   useEffect(() => {
//     const checkAndLoad = async () => {
//       try {
//         const token = await AsyncStorage.getItem("token");
//         const userStr = await AsyncStorage.getItem("user");
//         if (token && userStr) {
//           const user = JSON.parse(userStr);
//           if (user.user_type === 3) router.replace("/(student)");
//           else if (user.user_type === 7) router.replace("/(company)");
//           else if (user.user_type === 6) router.replace("/(school)");
//           else if (user.user_type === 4) router.replace("/(college)");
//           else if (user.user_type === 5) router.replace("/(university)");
//           return;
//         }
//       } catch (e) {
//         console.log("Check session error:", e);
//       } finally {
//         setIsLoading(false);
//       }
//     };
//     checkAndLoad();
//   }, []);

//   useEffect(() => {
//     if (!isLoading) {
//       const interval = setInterval(() => {
//         setActiveDot((prev) => (prev + 1) % 3);
//       }, 2000);
//       return () => clearInterval(interval);
//     }
//   }, [isLoading]);

//   if (isLoading) {
//     return (
//       <View style={styles.loadingContainer}>
//         <ActivityIndicator size="small" color="#0047AB" />
//       </View>
//     );
//   }

//   return (
//     <SafeAreaView style={styles.safeArea}>
//       <StatusBar barStyle="dark-content" />
//       <View style={styles.container}>

//         <View style={{ flex: 2.2 }} />

//         <View style={styles.centerContent}>
//           <View style={styles.logoWrapper}>
//             <Text style={styles.logoText}>CCS</Text>
//           </View>
//           <Text style={styles.tagline}>The world's no. 1 job search site</Text>
//         </View>

//         <View style={{ flex: 1.8 }} />

//         <View style={styles.footer}>
//           <View style={styles.pagination}>
//             {[0, 1, 2].map((i) => (
//               <View
//                 key={i}
//                 style={[styles.dot, activeDot === i ? styles.activeDot : null]}
//               />
//             ))}
//           </View>

//           <TouchableOpacity
//             style={styles.primaryBtn}
//             onPress={() => router.push("/(auth)/login")}
//             activeOpacity={0.8}
//           >
//             <Text style={styles.primaryBtnText}>Sign in</Text>
//           </TouchableOpacity>

//           <TouchableOpacity
//             style={styles.secondaryBtn}
//             onPress={() => router.push("/(auth)/signup")}
//             activeOpacity={0.7}
//           >
//             <Text style={styles.secondaryBtnText}>Create account</Text>
//           </TouchableOpacity>

//           <View style={styles.legalContainer}>
//             <Text style={styles.legalText}>
//               By using this app, you agree to our{" "}
//               <Text style={styles.link}>Terms</Text> and{" "}
//               <Text style={styles.link}>Privacy Policy</Text>
//             </Text>
//           </View>
//         </View>
//       </View>
//     </SafeAreaView>
//   );
// }

// const styles = StyleSheet.create({
//   safeArea: { flex: 1, backgroundColor: "#FFFFFF" },
//   container: { flex: 1, paddingHorizontal: 25 },
//   loadingContainer: { flex: 1, justifyContent: "center", alignItems: "center", backgroundColor: "#FFF" },
//   centerContent: { alignItems: "center", justifyContent: "center" },
//   logoWrapper: { paddingRight: 10 },
//   logoText: { fontSize: 60, fontWeight: "900", color: "#0047AB", fontStyle: "italic", letterSpacing: -2.5, fontFamily: Platform.OS === "android" ? "sans-serif-condensed" : "HelveticaNeue-CondensedBold" },
//   tagline: { fontSize: 14, color: "#444", marginTop: 2, fontWeight: "500" },
//   footer: { alignItems: "center", paddingBottom: 40, width: "100%" },
//   pagination: { flexDirection: "row", marginBottom: 30, height: 6, alignItems: "center" },
//   dot: { width: 6, height: 6, borderRadius: 3, backgroundColor: "#F5F5F5", marginHorizontal: 4 },
//   activeDot: { width: 26, backgroundColor: "#0047AB" },
//   primaryBtn: { backgroundColor: "#0047AB", width: "100%", height: 44, borderRadius: 4, justifyContent: "center", alignItems: "center", marginBottom: 10 },
//   primaryBtnText: { color: "#FFFFFF", fontSize: 15, fontWeight: "600" },
//   secondaryBtn: { backgroundColor: "#FFFFFF", width: "100%", height: 44, borderRadius: 4, borderWidth: 1.2, borderColor: "#0047AB", justifyContent: "center", alignItems: "center", marginBottom: 25 },
//   secondaryBtnText: { color: "#0047AB", fontSize: 15, fontWeight: "600" },
//   legalContainer: { paddingHorizontal: 20 },
//   legalText: { fontSize: 10, color: "#BBB", textAlign: "center", lineHeight: 14 },
//   link: { color: "#0047AB", textDecorationLine: "underline" },
// });


import React, { useEffect, useState } from "react";
import {
  View,
  Text,
  StyleSheet,
  TouchableOpacity,
  ActivityIndicator,
  SafeAreaView,
  StatusBar,
  Platform
} from "react-native";
import { router } from "expo-router";
import AsyncStorage from "@react-native-async-storage/async-storage";

// Global Styles based on your requirements
const ACCENT_BLUE = "#1F4FA3";
const TEXT_GRAY = "#222222"; 
const BORDER_BLUE_200 = "#BFDBFE"; // border-blue-200 equivalent

export default function Onboarding() {
  const [isLoading, setIsLoading] = useState(true);
  const [activeDot, setActiveDot] = useState(0);

  useEffect(() => {
    const checkAndLoad = async () => {
      try {
        const token = await AsyncStorage.getItem("token");
        const userStr = await AsyncStorage.getItem("user");
        if (token && userStr) {
          const user = JSON.parse(userStr);
          const routes: { [key: number]: string } = {
            3: "/(student)",
            7: "/(company)",
            6: "/(school)",
            4: "/(college)",
            5: "/(university)"
          };
          if (routes[user.user_type]) {
            router.replace(routes[user.user_type] as any);
            return;
          }
        }
      } catch (e) {
        console.log("Check session error:", e);
      } finally {
        setIsLoading(false);
      }
    };
    checkAndLoad();
  }, []);

  useEffect(() => {
    if (!isLoading) {
      const interval = setInterval(() => {
        setActiveDot((prev) => (prev + 1) % 3);
      }, 2000);
      return () => clearInterval(interval);
    }
  }, [isLoading]);

  if (isLoading) {
    return (
      <View style={styles.loadingContainer}>
        <ActivityIndicator size="large" color={ACCENT_BLUE} />
      </View>
    );
  }

  return (
    <SafeAreaView style={styles.safeArea}>
      <StatusBar barStyle="dark-content" backgroundColor="#FFF" />
      <View style={styles.container}>

        <View style={{ flex: 2 }} />

        <View style={styles.centerContent}>
          <View style={styles.logoWrapper}>
            <Text style={styles.logoText}>CCS</Text>
          </View>
          <Text style={styles.tagline}>The world's no. 1 job search site</Text>
        </View>

        <View style={{ flex: 1.5 }} />

        <View style={styles.footer}>
          {/* Pagination Dots with Accent Blue */}
          <View style={styles.pagination}>
            {[0, 1, 2].map((i) => (
              <View
                key={i}
                style={[styles.dot, activeDot === i ? styles.activeDot : null]}
              />
            ))}
          </View>

          {/* Primary Button - Sign In */}
          <TouchableOpacity
            style={styles.primaryBtn}
            onPress={() => router.push("/(auth)/login")}
            activeOpacity={0.8}
          >
            <Text style={styles.primaryBtnText}>Sign in</Text>
          </TouchableOpacity>

          {/* Secondary Button - Create Account (Using border-blue-200) */}
          <TouchableOpacity
            style={styles.secondaryBtn}
            onPress={() => router.push("/(auth)/signup")}
            activeOpacity={0.7}
          >
            <Text style={styles.secondaryBtnText}>Create account</Text>
          </TouchableOpacity>

          <View style={styles.legalContainer}>
            <Text style={styles.legalText}>
              By using this app, you agree to our{" "}
              <Text style={styles.link}>Terms</Text> and{" "}
              <Text style={styles.link}>Privacy Policy</Text>
            </Text>
          </View>
        </View>
      </View>
    </SafeAreaView>
  );
}

const styles = StyleSheet.create({
  safeArea: { flex: 1, backgroundColor: "#FFFFFF" },
  container: { flex: 1, paddingHorizontal: 25 },
  loadingContainer: { flex: 1, justifyContent: "center", alignItems: "center", backgroundColor: "#FFF" },
  centerContent: { alignItems: "center", justifyContent: "center" },
  logoWrapper: { paddingRight: 0 },
  logoText: { 
    fontSize: 64, 
    fontWeight: "900", 
    color: ACCENT_BLUE, 
    fontStyle: "italic", 
    letterSpacing: -3,
    fontFamily: Platform.OS === "android" ? "sans-serif-condensed" : "HelveticaNeue-CondensedBold" 
  },
  tagline: { 
    fontSize: 14, 
    color: TEXT_GRAY, 
    marginTop: 6, 
    fontWeight: "600",
    letterSpacing: 0.2
  },
  footer: { alignItems: "center", paddingBottom: 40, width: "100%" },
  pagination: { flexDirection: "row", marginBottom: 35, height: 8, alignItems: "center" },
  dot: { width: 7, height: 7, borderRadius: 3.5, backgroundColor: "#F0F0F0", marginHorizontal: 5 },
  activeDot: { width: 24, backgroundColor: ACCENT_BLUE, borderRadius: 10 },
  
  // Slightly Thinner Buttons
  primaryBtn: { 
    backgroundColor: ACCENT_BLUE, 
    width: "100%", 
    height: 46, // Reduced from 52 to 46 for a sleeker look
    borderRadius: 8, // Slightly sharper corners to match the thin profile
    justifyContent: "center", 
    alignItems: "center", 
    marginBottom: 10,
    elevation: 1,
  },
  primaryBtnText: { color: "#FFFFFF", fontSize: 15, fontWeight: "700" },
  
  secondaryBtn: { 
    backgroundColor: "#FFFFFF", 
    width: "100%", 
    height: 46, // Reduced from 52 to 46
    borderRadius: 8, 
    borderWidth: 1.2, 
    borderColor: BORDER_BLUE_200, // border-blue-200
    justifyContent: "center", 
    alignItems: "center", 
    marginBottom: 25 
  },
  secondaryBtnText: { color: ACCENT_BLUE, fontSize: 15, fontWeight: "700" },
  
  legalContainer: { paddingHorizontal: 20 },
  legalText: { fontSize: 10, color: "#94A3B8", textAlign: "center", lineHeight: 14 },
  link: { color: ACCENT_BLUE, fontWeight: "600", textDecorationLine: "underline" },
});