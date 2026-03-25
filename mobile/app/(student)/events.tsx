
// import React, { useState, useEffect } from "react";
// import { 
//   View, 
//   Text, 
//   StyleSheet, 
//   FlatList, 
//   TouchableOpacity, 
//   Image, 
//   ActivityIndicator, 
//   StatusBar, 
//   Platform 
// } from "react-native";
// // CRITICAL: Use this instead of SafeAreaView
// import { useSafeAreaInsets } from "react-native-safe-area-context"; 
// import { Ionicons, MaterialCommunityIcons } from "@expo/vector-icons";
// import { supabase } from "../../lib/supabase";
// import { router } from "expo-router";

// export default function EventsScreen() {
//   const insets = useSafeAreaInsets();
//   const [events, setEvents] = useState<any[]>([]);
//   const [loading, setLoading] = useState(true);

//   useEffect(() => { fetchEvents(); }, []);

//   const fetchEvents = async () => {
//     try {
//       setLoading(true);
//       const { data, error } = await supabase.from("events").select("*").order("start_date", { ascending: true });
//       if (error) throw error;
//       setEvents(data || []);
//     } catch (error) { console.error(error); } finally { setLoading(false); }
//   };

//   const renderEventCard = ({ item }: { item: any }) => (
//     <View style={styles.eventCard}>
//       <View style={styles.imageContainer}>
//         {item.event_media_url ? <Image source={{ uri: item.event_media_url }} style={styles.eventImage} /> : 
//         <View style={styles.placeholderImage}><MaterialCommunityIcons name="image-outline" size={30} color="#CCC" /></View>}
//       </View>
//       <View style={styles.cardContent}>
//         <Text style={styles.eventTitle}>{item.event_name}</Text>
//         <View style={styles.footer}>
//           <Text style={styles.timeText}>{new Date(item.start_date).toLocaleDateString()}</Text>
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
//     // Note: No SafeAreaView here, just a View with dynamic padding
//     <View style={[styles.container, { paddingTop: insets.top }]}>
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
//           // This adds space at the bottom equal to the navigation bar + extra 80px
//           contentContainerStyle={[styles.listContainer, { paddingBottom: insets.bottom + 80 }]}
//           showsVerticalScrollIndicator={false}
//         />
//       )}
//     </View>
//   );
// }

// const styles = StyleSheet.create({
//   container: { flex: 1, backgroundColor: "#FBFBFB" },
//   header: { 
//     flexDirection: "row", 
//     alignItems: "center", 
//     justifyContent: "space-between", 
//     paddingHorizontal: 16, 
//     height: 45, // Thinner header
//     backgroundColor: "#FFF", 
//     borderBottomWidth: 0.5, 
//     borderBottomColor: "#EEE" 
//   },
//   backBtn: { width: 32, height: 32, justifyContent: 'center' },
//   headerTitle: { fontSize: 15, fontWeight: "700", color: "#1A1A1A" },
//   listContainer: { paddingHorizontal: 16, paddingTop: 12 },
//   eventCard: { backgroundColor: "#FFF", borderRadius: 12, marginBottom: 16, overflow: "hidden", borderWidth: 1, borderColor: "#F0F0F0" },
//   imageContainer: { height: 120, backgroundColor: "#F5F5F5" },
//   eventImage: { width: "100%", height: "100%" },
//   placeholderImage: { flex: 1, justifyContent: "center", alignItems: "center" },
//   cardContent: { padding: 12 },
//   eventTitle: { fontSize: 15, fontWeight: "700", marginBottom: 6 },
//   footer: { flexDirection: "row", justifyContent: "space-between", alignItems: "center", paddingTop: 8, borderTopWidth: 0.5, borderTopColor: "#F5F5F5" },
//   timeText: { fontSize: 11, color: "#444" },
//   applyBtn: { backgroundColor: "#2B59C3", paddingHorizontal: 14, paddingVertical: 6, borderRadius: 6 },
//   applyBtnText: { color: "#FFF", fontSize: 12, fontWeight: "600" },
//   center: { flex: 1, justifyContent: "center", alignItems: "center" },
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
        <View style={styles.placeholderImage}><MaterialCommunityIcons name="image-outline" size={30} color="#E2E8F0" /></View>}
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
    <View style={[styles.container, { paddingTop: insets.top }]}>
      <StatusBar barStyle="dark-content" backgroundColor="#FFF" />
      <View style={styles.header}>
        <TouchableOpacity onPress={() => router.back()} style={styles.backBtn}>
          <Ionicons name="arrow-back" size={20} color="#222222" />
        </TouchableOpacity>
        <Text style={styles.headerTitle}>Available Events</Text>
        <View style={{ width: 32 }} />
      </View>

      {loading ? (
        <View style={styles.center}><ActivityIndicator size="small" color="#1F4FA3" /></View>
      ) : (
        <FlatList
          data={events}
          renderItem={renderEventCard}
          keyExtractor={(item) => item.id.toString()}
          contentContainerStyle={[styles.listContainer, { paddingBottom: insets.bottom + 80 }]}
          showsVerticalScrollIndicator={false}
        />
      )}
    </View>
  );
}

const styles = StyleSheet.create({
  container: { flex: 1, backgroundColor: "#FFF" },
  header: { 
    flexDirection: "row", 
    alignItems: "center", 
    justifyContent: "space-between", 
    paddingHorizontal: 16, 
    height: 45, 
    backgroundColor: "#FFF", 
    borderBottomWidth: 1, 
    borderBottomColor: "#E2E8F0" 
  },
  backBtn: { width: 32, height: 32, justifyContent: 'center' },
  headerTitle: { fontSize: 15, fontWeight: "700", color: "#222222" },
  listContainer: { paddingHorizontal: 16, paddingTop: 12 },
  eventCard: { 
    backgroundColor: "#FFF", 
    borderRadius: 12, 
    marginBottom: 16, 
    overflow: "hidden", 
    borderWidth: 1, 
    borderColor: "#E2E8F0" 
  },
  imageContainer: { height: 120, backgroundColor: "#F8FAFC" },
  eventImage: { width: "100%", height: "100%" },
  placeholderImage: { flex: 1, justifyContent: "center", alignItems: "center" },
  cardContent: { padding: 12 },
  eventTitle: { fontSize: 15, fontWeight: "700", color: "#222222", marginBottom: 6 },
  footer: { 
    flexDirection: "row", 
    justifyContent: "space-between", 
    alignItems: "center", 
    paddingTop: 8, 
    borderTopWidth: 1, 
    borderTopColor: "#E2E8F0" 
  },
  timeText: { fontSize: 11, color: "#444" },
  applyBtn: { backgroundColor: "#1F4FA3", paddingHorizontal: 14, paddingVertical: 6, borderRadius: 6 },
  applyBtnText: { color: "#FFF", fontSize: 12, fontWeight: "600" },
  center: { flex: 1, justifyContent: "center", alignItems: "center" },
});