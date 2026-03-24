

// import React, { useState, useEffect } from "react";
// import {
//   View,
//   Text,
//   StyleSheet,
//   FlatList,
//   TouchableOpacity,
//   Image,
//   ActivityIndicator,
//   SafeAreaView,
//   StatusBar,
//   Platform
// } from "react-native";
// import { Ionicons, MaterialCommunityIcons } from "@expo/vector-icons";
// import { supabase } from "../../lib/supabase";
// import { router } from "expo-router";

// export default function EventsScreen() {
//   const [events, setEvents] = useState<any[]>([]);
//   const [loading, setLoading] = useState(true);

//   useEffect(() => {
//     fetchEvents();
//   }, []);

//   const fetchEvents = async () => {
//     try {
//       setLoading(true);
//       const { data, error } = await supabase
//         .from("events")
//         .select("*")
//         .order("start_date", { ascending: true });

//       if (error) throw error;
//       setEvents(data || []);
//     } catch (error) {
//       console.error("Error fetching events:", error);
//     } finally {
//       setLoading(false);
//     }
//   };

//   const renderEventCard = ({ item }: { item: any }) => (
//     <View style={styles.eventCard}>
//       <View style={styles.imageContainer}>
//         {item.event_media_url ? (
//           <Image source={{ uri: item.event_media_url }} style={styles.eventImage} />
//         ) : (
//           <View style={styles.placeholderImage}>
//             <MaterialCommunityIcons name="image-outline" size={30} color="#CCC" />
//           </View>
//         )}
//         <View style={styles.onlineBadge}>
//           <Text style={styles.onlineBadgeText}>{item.event_type?.toUpperCase() || 'EVENT'}</Text>
//         </View>
//       </View>

//       <View style={styles.cardContent}>
//         <Text style={styles.creatorText}>{item.organizer_type?.toUpperCase() || "ADMIN"}</Text>
//         <Text style={styles.eventTitle} numberOfLines={1}>{item.event_name}</Text>
//         <View style={styles.infoRow}>
//           <Ionicons name="calendar-outline" size={12} color="#666" />
//           <Text style={styles.infoText}>{new Date(item.start_date).toLocaleDateString()}</Text>
//           <Text style={styles.dot}>•</Text>
//           <Ionicons name="location-outline" size={12} color="#666" />
//           <Text style={styles.infoText} numberOfLines={1}>{item.location || 'Online'}</Text>
//         </View>
//         <View style={styles.footer}>
//           <Text style={styles.timeText}><Ionicons name="time-outline" size={12} color="#444" /> {item.start_time?.slice(0, 5)}</Text>
//           <TouchableOpacity 
//             style={styles.applyBtn}
//             onPress={() => router.push({ pathname: "/(student)/event-details", params: { event: JSON.stringify(item) } })}
//           >
//             <Text style={styles.applyBtnText}>View Details</Text>
//           </TouchableOpacity>
//         </View>
//       </View>
//     </View>
//   );

//   return (
//     <SafeAreaView style={styles.container}>
//       <StatusBar barStyle="dark-content" backgroundColor="#FFF" />
//       <View style={styles.header}>
//         <TouchableOpacity onPress={() => router.back()} style={styles.backBtn}>
//           <Ionicons name="arrow-back" size={20} color="#1A1A1A" />
//         </TouchableOpacity>
//         <Text style={styles.headerTitle}>Available Events</Text>
//         <View style={{ width: 32 }} />
//       </View>

//       {loading ? (
//         <View style={styles.center}><ActivityIndicator size="small" color="#4285F4" /></View>
//       ) : (
//         <FlatList
//           data={events}
//           renderItem={renderEventCard}
//           keyExtractor={(item) => item.id.toString()}
//           contentContainerStyle={styles.listContainer}
//           showsVerticalScrollIndicator={false}
//           ListFooterComponent={<View style={{ height: 120 }} />} // Extra space for bottom buttons
//           ListEmptyComponent={<Text style={styles.emptyText}>No events found.</Text>}
//         />
//       )}
//     </SafeAreaView>
//   );
// }

// const styles = StyleSheet.create({
//   container: { flex: 1, backgroundColor: "#FBFBFB" },
//   header: {
//     flexDirection: "row",
//     alignItems: "center",
//     justifyContent: "space-between",
//     paddingHorizontal: 16,
//     paddingTop: Platform.OS === 'android' ? (StatusBar.currentHeight || 0) + 10 : 10, 
//     paddingBottom: 10,
//     backgroundColor: "#FFF",
//     borderBottomWidth: 0.5,
//     borderBottomColor: "#EEE",
//   },
//   backBtn: { width: 32, height: 32, justifyContent: 'center' },
//   headerTitle: { fontSize: 15, fontWeight: "700", color: "#1A1A1A" },
//   listContainer: { paddingHorizontal: 16, paddingTop: 12 },
//   eventCard: { backgroundColor: "#FFF", borderRadius: 12, marginBottom: 16, overflow: "hidden", borderWidth: 1, borderColor: "#F0F0F0", elevation: 2 },
//   imageContainer: { height: 120, backgroundColor: "#F5F5F5" },
//   eventImage: { width: "100%", height: "100%" },
//   placeholderImage: { flex: 1, justifyContent: "center", alignItems: "center" },
//   onlineBadge: { position: "absolute", top: 8, right: 8, backgroundColor: "rgba(255,255,255,0.9)", paddingHorizontal: 6, paddingVertical: 2, borderRadius: 4 },
//   onlineBadgeText: { fontSize: 8, fontWeight: "800", color: "#4285F4" },
//   cardContent: { padding: 12 },
//   creatorText: { fontSize: 8, color: "#999", fontWeight: "700", marginBottom: 2 },
//   eventTitle: { fontSize: 15, fontWeight: "700", color: "#1A1A1A", marginBottom: 6 },
//   infoRow: { flexDirection: "row", alignItems: "center", marginBottom: 10 },
//   infoText: { fontSize: 11, color: "#666", marginLeft: 4 },
//   dot: { marginHorizontal: 6, color: "#DDD" },
//   footer: { flexDirection: "row", justifyContent: "space-between", alignItems: "center", paddingTop: 8, borderTopWidth: 0.5, borderTopColor: "#F5F5F5" },
//   timeText: { fontSize: 11, color: "#444", fontWeight: "500" },
//   applyBtn: { backgroundColor: "#2B59C3", paddingHorizontal: 14, paddingVertical: 6, borderRadius: 6 },
//   applyBtnText: { color: "#FFF", fontWeight: "600", fontSize: 12 },
//   center: { flex: 1, justifyContent: "center", alignItems: "center" },
//   emptyText: { textAlign: "center", marginTop: 50, color: "#999", fontSize: 12 },
// });

import React, { useState, useEffect } from "react";
import { 
  View, 
  Text, 
  StyleSheet, 
  FlatList, 
  TouchableOpacity, 
  Image, 
  ActivityIndicator, 
  StatusBar, 
  Platform 
} from "react-native";
// CRITICAL: Use this instead of SafeAreaView
import { useSafeAreaInsets } from "react-native-safe-area-context"; 
import { Ionicons, MaterialCommunityIcons } from "@expo/vector-icons";
import { supabase } from "../../lib/supabase";
import { router } from "expo-router";

export default function EventsScreen() {
  const insets = useSafeAreaInsets();
  const [events, setEvents] = useState<any[]>([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => { fetchEvents(); }, []);

  const fetchEvents = async () => {
    try {
      setLoading(true);
      const { data, error } = await supabase.from("events").select("*").order("start_date", { ascending: true });
      if (error) throw error;
      setEvents(data || []);
    } catch (error) { console.error(error); } finally { setLoading(false); }
  };

  const renderEventCard = ({ item }: { item: any }) => (
    <View style={styles.eventCard}>
      <View style={styles.imageContainer}>
        {item.event_media_url ? <Image source={{ uri: item.event_media_url }} style={styles.eventImage} /> : 
        <View style={styles.placeholderImage}><MaterialCommunityIcons name="image-outline" size={30} color="#CCC" /></View>}
      </View>
      <View style={styles.cardContent}>
        <Text style={styles.eventTitle}>{item.event_name}</Text>
        <View style={styles.footer}>
          <Text style={styles.timeText}>{new Date(item.start_date).toLocaleDateString()}</Text>
          <TouchableOpacity 
            style={styles.applyBtn} 
            onPress={() => router.push({ pathname: "/(student)/event-details", params: { event: JSON.stringify(item) } })}
          >
            <Text style={styles.applyBtnText}>View Details</Text>
          </TouchableOpacity>
        </View>
      </View>
    </View>
  );

  return (
    // Note: No SafeAreaView here, just a View with dynamic padding
    <View style={[styles.container, { paddingTop: insets.top }]}>
      <StatusBar barStyle="dark-content" backgroundColor="#FFF" />
      <View style={styles.header}>
        <TouchableOpacity onPress={() => router.back()} style={styles.backBtn}>
          <Ionicons name="arrow-back" size={20} color="#1A1A1A" />
        </TouchableOpacity>
        <Text style={styles.headerTitle}>Available Events</Text>
        <View style={{ width: 32 }} />
      </View>

      {loading ? (
        <View style={styles.center}><ActivityIndicator size="small" color="#4285F4" /></View>
      ) : (
        <FlatList
          data={events}
          renderItem={renderEventCard}
          keyExtractor={(item) => item.id.toString()}
          // This adds space at the bottom equal to the navigation bar + extra 80px
          contentContainerStyle={[styles.listContainer, { paddingBottom: insets.bottom + 80 }]}
          showsVerticalScrollIndicator={false}
        />
      )}
    </View>
  );
}

const styles = StyleSheet.create({
  container: { flex: 1, backgroundColor: "#FBFBFB" },
  header: { 
    flexDirection: "row", 
    alignItems: "center", 
    justifyContent: "space-between", 
    paddingHorizontal: 16, 
    height: 45, // Thinner header
    backgroundColor: "#FFF", 
    borderBottomWidth: 0.5, 
    borderBottomColor: "#EEE" 
  },
  backBtn: { width: 32, height: 32, justifyContent: 'center' },
  headerTitle: { fontSize: 15, fontWeight: "700", color: "#1A1A1A" },
  listContainer: { paddingHorizontal: 16, paddingTop: 12 },
  eventCard: { backgroundColor: "#FFF", borderRadius: 12, marginBottom: 16, overflow: "hidden", borderWidth: 1, borderColor: "#F0F0F0" },
  imageContainer: { height: 120, backgroundColor: "#F5F5F5" },
  eventImage: { width: "100%", height: "100%" },
  placeholderImage: { flex: 1, justifyContent: "center", alignItems: "center" },
  cardContent: { padding: 12 },
  eventTitle: { fontSize: 15, fontWeight: "700", marginBottom: 6 },
  footer: { flexDirection: "row", justifyContent: "space-between", alignItems: "center", paddingTop: 8, borderTopWidth: 0.5, borderTopColor: "#F5F5F5" },
  timeText: { fontSize: 11, color: "#444" },
  applyBtn: { backgroundColor: "#2B59C3", paddingHorizontal: 14, paddingVertical: 6, borderRadius: 6 },
  applyBtnText: { color: "#FFF", fontSize: 12, fontWeight: "600" },
  center: { flex: 1, justifyContent: "center", alignItems: "center" },
});