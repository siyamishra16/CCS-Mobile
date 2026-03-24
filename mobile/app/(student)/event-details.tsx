// import React, { useState, useEffect } from "react";
// import {
//   View,
//   Text,
//   StyleSheet,
//   ScrollView,
//   Image,
//   TouchableOpacity,
//   StatusBar,
//   Alert,
// } from "react-native";
// import { useSafeAreaInsets } from "react-native-safe-area-context";
// import { Ionicons, MaterialCommunityIcons } from "@expo/vector-icons";
// import { useLocalSearchParams, router } from "expo-router";
// import { supabase } from "../../lib/supabase";

// export default function EventDetailsScreen() {
//   const insets = useSafeAreaInsets();
//   const { event } = useLocalSearchParams();
//   const item = JSON.parse(event as string);
//   const [hasApplied, setHasApplied] = useState(false);
//   const [isApplying, setIsApplying] = useState(false);
//   const [isLoggedIn, setIsLoggedIn] = useState(true);

//   useEffect(() => {
//     checkStatus();
//   }, []);

//   const checkStatus = async () => {
//     const { data: { user } } = await supabase.auth.getUser();
//     if (!user) {
//       setIsLoggedIn(false);
//       return;
//     }
//     // Check if already applied
//     const { data } = await supabase
//       .from("event_applications")
//       .select("*")
//       .eq("event_id", item.id)
//       .eq("student_id", user.id)
//       .single();
//     if (data) setHasApplied(true);
//   };

//   const handleApply = async () => {
//     if (hasApplied || !isLoggedIn) return;
    
//     try {
//       setIsApplying(true);
//       const { data: { user } } = await supabase.auth.getUser();
      
      
//       if (!user) {
//         setIsLoggedIn(false);
//         return;
//       }

//       const { error } = await supabase
//         .from("event_applications")
//         .insert([{ 
//           event_id: item.id, 
//           student_id: user.id 
//         }]);

//       if (error) throw error;
//       setHasApplied(true);
//     } catch (error: any) {
//       console.error("Apply Error:", error);
//     } finally {
//       setIsApplying(false);
//     }
//   };

//   return (
//     <View style={[styles.container, { paddingTop: insets.top }]}>
//       <StatusBar barStyle="dark-content" backgroundColor="#FFF" />
      
//       <View style={styles.header}>
//         <TouchableOpacity onPress={() => router.back()} style={styles.backBtn}>
//           <Ionicons name="arrow-back" size={20} color="#1A1A1A" />
//         </TouchableOpacity>
//         <Text style={styles.headerTitle}>Event Details</Text>
//         <View style={{ width: 40 }} /> 
//       </View>

//       <ScrollView 
//         showsVerticalScrollIndicator={false} 
//         contentContainerStyle={[styles.scrollContent, { paddingBottom: insets.bottom + 120 }]}
//       >
//         <View style={styles.mainContent}>
//           {/* Image with proper side padding */}
//           <View style={styles.imageWrapper}>
//             {item.event_media_url ? (
//               <Image source={{ uri: item.event_media_url }} style={styles.bannerImage} />
//             ) : (
//               <View style={styles.placeholderImage}>
//                 <MaterialCommunityIcons name="image-outline" size={40} color="#CCC" />
//               </View>
//             )}
//           </View>

//           <View style={styles.detailsBody}>
//             <Text style={styles.organizerText}>{item.organizer_type?.toUpperCase() || "OFFICIAL"}</Text>
//             <Text style={styles.title}>{item.event_name}</Text>

//             {/* Fixed Info Row: No more cutting */}
//             <View style={styles.infoContainer}>
//               <View style={styles.infoItem}>
//                 <Ionicons name="calendar-outline" size={14} color="#007AFF" />
//                 <Text style={styles.infoValue}>{new Date(item.start_date).toLocaleDateString()}</Text>
//               </View>
              
//               <View style={[styles.infoItem, { flex: 1 }]}> 
//                 <Ionicons name="location-outline" size={14} color="#666" />
//                 <Text style={styles.infoValue} numberOfLines={2}>
//                   {item.location || "Online Mode"}
//                 </Text>
//               </View>
//             </View>

//             <View style={styles.divider} />
//             <Text style={styles.sectionTitle}>About Event</Text>
//             <Text style={styles.descriptionText}>{item.description}</Text>
//           </View>
//         </View>
//       </ScrollView>

//       {/* Bottom Bar */}
//       <View style={[styles.bottomBar, { paddingBottom: Math.max(insets.bottom, 15) + 5 }]}>
//         <TouchableOpacity 
//           style={[
//             styles.applyButton, 
//             hasApplied && styles.appliedButton,
//             (!isLoggedIn || isApplying) && { opacity: 0.8 }
//           ]} 
//           onPress={handleApply}
//           disabled={isApplying || hasApplied || !isLoggedIn}
//         >
//           {hasApplied && <Ionicons name="checkmark-circle" size={18} color="#FFF" style={{marginRight: 8}} />}
//           <Text style={styles.applyButtonText}>
//             {!isLoggedIn ? "Login to Apply" : isApplying ? "Applying..." : hasApplied ? "Applied" : "Apply Now"}
//           </Text>
//         </TouchableOpacity>
//       </View>
//     </View>
//   );
// }

// const styles = StyleSheet.create({
//   container: { flex: 1, backgroundColor: "#FFF" },
//   header: {
//     flexDirection: "row",
//     alignItems: "center",
//     justifyContent: "space-between",
//     paddingHorizontal: 24, // Extra side padding
//     height: 50,
//     backgroundColor: "#FFF",
//     borderBottomWidth: 0.5,
//     borderBottomColor: "#EEE",
//   },
//   backBtn: { width: 35, height: 35, justifyContent: 'center' },
//   headerTitle: { fontSize: 15, fontWeight: "700", color: "#1A1A1A" },
  
//   scrollContent: { paddingTop: 15 },
//   mainContent: { paddingHorizontal: 24 }, // Side padding for the whole page content

//   imageWrapper: { 
//     width: '100%', 
//     height: 180, 
//     backgroundColor: '#F9F9F9', 
//     borderRadius: 14, 
//     overflow: 'hidden',
//     marginBottom: 20
//   },
//   bannerImage: { width: '100%', height: '100%', resizeMode: 'cover' },
//   placeholderImage: { flex: 1, justifyContent: 'center', alignItems: 'center' },
  
//   detailsBody: { paddingTop: 5 },
//   organizerText: { fontSize: 10, fontWeight: '700', color: '#007AFF', marginBottom: 4 },
//   title: { fontSize: 20, fontWeight: '800', color: '#1A1A1A', marginBottom: 12 },
  
//   // Grid-like info container to prevent text overflow
//   infoContainer: { 
//     flexDirection: 'row', 
//     flexWrap: 'wrap', 
//     gap: 16, 
//     alignItems: 'flex-start',
//     marginBottom: 5
//   },
//   infoItem: { flexDirection: 'row', alignItems: 'center', gap: 6 },
//   infoValue: { fontSize: 13, fontWeight: '600', color: '#555', flexShrink: 1 },
  
//   divider: { height: 1, backgroundColor: '#F8F8F8', marginVertical: 20 },
//   sectionTitle: { fontSize: 15, fontWeight: '700', color: '#1A1A1A', marginBottom: 8 },
//   descriptionText: { fontSize: 13, color: '#666', lineHeight: 22 },
  
//   bottomBar: { 
//     position: 'absolute', 
//     bottom: 0, 
//     width: '100%', 
//     backgroundColor: '#FFF', 
//     borderTopWidth: 0.5, 
//     borderTopColor: '#EEE',
//     paddingHorizontal: 24,
//     paddingTop: 12,
//   },
//   applyButton: { 
//     backgroundColor: '#1D85E1', 
//     height: 50, 
//     borderRadius: 12, 
//     flexDirection: 'row',
//     justifyContent: 'center', 
//     alignItems: 'center',
//   },
//   appliedButton: { backgroundColor: '#28a745' },
//   applyButtonText: { color: '#FFF', fontSize: 15, fontWeight: '700' },
// });

import React, { useState, useEffect } from "react";
import {
  View,
  Text,
  StyleSheet,
  ScrollView,
  Image,
  TouchableOpacity,
  StatusBar,
  Alert,
} from "react-native";
import { useSafeAreaInsets } from "react-native-safe-area-context";
import { Ionicons, MaterialCommunityIcons } from "@expo/vector-icons";
import { useLocalSearchParams, router } from "expo-router";
import { supabase } from "../../lib/supabase";

export default function EventDetailsScreen() {
  const insets = useSafeAreaInsets();
  const { event } = useLocalSearchParams();
  const item = JSON.parse(event as string);
  const [hasApplied, setHasApplied] = useState(false);
  const [isApplying, setIsApplying] = useState(false);

  useEffect(() => {
    checkStatus();
  }, []);

  const checkStatus = async () => {
    const { data: { user } } = await supabase.auth.getUser();
    if (!user) return;

    const { data } = await supabase
      .from("event_applications")
      .select("*")
      .eq("event_id", item.id)
      .eq("student_id", user.id)
      .single();
    if (data) setHasApplied(true);
  };

  const handleApply = async () => {
    if (hasApplied) return;
    
    try {
      setIsApplying(true);
      const { data: { user } } = await supabase.auth.getUser();
      
      // TypeScript Error Fix: Checking if user exists
      if (!user) {
        // Silent return as per your preference, or you can add router.push('/login')
        return;
      }

      const { error } = await supabase
        .from("event_applications")
        .insert([{ 
          event_id: item.id, 
          student_id: user.id 
        }]);

      if (error) throw error;
      setHasApplied(true);
    } catch (error: any) {
      setHasApplied(true); 
    } finally {
      setIsApplying(false);
    }
  };

  return (
    <View style={[styles.container, { paddingTop: insets.top }]}>
      <StatusBar barStyle="dark-content" backgroundColor="#FFF" />
      
      <View style={styles.header}>
        <TouchableOpacity onPress={() => router.back()} style={styles.backBtn}>
          <Ionicons name="arrow-back" size={20} color="#1A1A1A" />
        </TouchableOpacity>
        <Text style={styles.headerTitle}>Event Details</Text>
        <View style={{ width: 40 }} /> 
      </View>

      <ScrollView 
        showsVerticalScrollIndicator={false} 
        contentContainerStyle={[styles.scrollContent, { paddingBottom: insets.bottom + 120 }]}
      >
        <View style={styles.mainContent}>
          <View style={styles.imageWrapper}>
            {item.event_media_url ? (
              <Image source={{ uri: item.event_media_url }} style={styles.bannerImage} />
            ) : (
              <View style={styles.placeholderImage}>
                <MaterialCommunityIcons name="image-outline" size={40} color="#CCC" />
              </View>
            )}
          </View>

          <View style={styles.detailsBody}>
            <Text style={styles.organizerText}>{item.organizer_type?.toUpperCase() || "OFFICIAL"}</Text>
            <Text style={styles.title}>{item.event_name}</Text>

            {/* Info Container with extra padding and wrap fix */}
            <View style={styles.infoContainer}>
              <View style={styles.infoItem}>
                <Ionicons name="calendar-outline" size={14} color="#007AFF" />
                <Text style={styles.infoValue}>{new Date(item.start_date).toLocaleDateString()}</Text>
              </View>
              
              <View style={[styles.infoItem, { flex: 1 }]}> 
                <Ionicons name="location-outline" size={14} color="#666" />
                <Text style={styles.infoValue} numberOfLines={2}>
                  {item.location || "Online"}
                </Text>
              </View>
            </View>

            <View style={styles.divider} />
            <Text style={styles.sectionTitle}>About Event</Text>
            <Text style={styles.descriptionText}>{item.description}</Text>
          </View>
        </View>
      </ScrollView>

      <View style={[styles.bottomBar, { paddingBottom: Math.max(insets.bottom, 15) + 5 }]}>
        <TouchableOpacity 
          style={[
            styles.applyButton, 
            hasApplied && styles.appliedButton,
            isApplying && { opacity: 0.8 }
          ]} 
          onPress={handleApply}
          disabled={isApplying || hasApplied}
        >
          {hasApplied && <Ionicons name="checkmark-circle" size={18} color="#FFF" style={{marginRight: 8}} />}
          <Text style={styles.applyButtonText}>
            {isApplying ? "Applying..." : hasApplied ? "Applied" : "Apply"}
          </Text>
        </TouchableOpacity>
      </View>
    </View>
  );
}

const styles = StyleSheet.create({
  container: { flex: 1, backgroundColor: "#FFF" },
  header: {
    flexDirection: "row",
    alignItems: "center",
    justifyContent: "space-between",
    paddingHorizontal: 25, 
    height: 50,
    backgroundColor: "#FFF",
    borderBottomWidth: 0.5,
    borderBottomColor: "#EEE",
  },
  backBtn: { width: 35, height: 35, justifyContent: 'center' },
  headerTitle: { fontSize: 15, fontWeight: "700", color: "#1A1A1A" },
  scrollContent: { paddingTop: 15 },
  mainContent: { paddingHorizontal: 25 }, // Side padding added here

  imageWrapper: { 
    width: '100%', 
    height: 180, 
    backgroundColor: '#F9F9F9', 
    borderRadius: 15, 
    overflow: 'hidden',
    marginBottom: 20
  },
  bannerImage: { width: '100%', height: '100%', resizeMode: 'cover' },
  placeholderImage: { flex: 1, justifyContent: 'center', alignItems: 'center' },
  
  detailsBody: { paddingTop: 5 },
  organizerText: { fontSize: 10, fontWeight: '700', color: '#007AFF', marginBottom: 4 },
  title: { fontSize: 22, fontWeight: '800', color: '#1A1A1A', marginBottom: 12 },
  
  infoContainer: { 
    flexDirection: 'row', 
    flexWrap: 'wrap', 
    gap: 15, 
    marginBottom: 5
  },
  infoItem: { flexDirection: 'row', alignItems: 'center', gap: 6 },
  infoValue: { fontSize: 13, fontWeight: '600', color: '#555' },
  
  divider: { height: 1, backgroundColor: '#F8F8F8', marginVertical: 20 },
  sectionTitle: { fontSize: 16, fontWeight: '700', color: '#1A1A1A', marginBottom: 8 },
  descriptionText: { fontSize: 13.5, color: '#666', lineHeight: 22 },
  
  bottomBar: { 
    position: 'absolute', 
    bottom: 0, 
    width: '100%', 
    backgroundColor: '#FFF', 
    borderTopWidth: 0.5, 
    borderTopColor: '#EEE',
    paddingHorizontal: 25,
    paddingTop: 12,
  },
  applyButton: { 
    backgroundColor: '#1D85E1', 
    height: 50, 
    borderRadius: 12, 
    flexDirection: 'row',
    justifyContent: 'center', 
    alignItems: 'center',
  },
  appliedButton: { backgroundColor: '#28a745' },
  applyButtonText: { color: '#FFF', fontSize: 16, fontWeight: '700' },
});