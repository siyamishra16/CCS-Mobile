// import React, { useState, useEffect } from "react";
// import { 
//   View, 
//   Text, 
//   StyleSheet, 
//   FlatList, 
//   TouchableOpacity, 
//   TextInput, 
//   ActivityIndicator, 
//   StatusBar 
// } from "react-native";
// import { useSafeAreaInsets } from "react-native-safe-area-context";
// import { Ionicons, MaterialCommunityIcons } from "@expo/vector-icons";
// import { supabase } from "../../lib/supabase";
// import { router } from "expo-router";

// export default function SkillTestsScreen() {
//   const insets = useSafeAreaInsets();
//   const [categories, setCategories] = useState<any[]>([]);
//   const [loading, setLoading] = useState(true);
//   const [search, setSearch] = useState("");

//   useEffect(() => { fetchCategories(); }, []);

//   const fetchCategories = async () => {
//     try {
//       setLoading(true);
//       // Fetching categories from Supabase
//       const { data, error } = await supabase
//         .from("skill_categories")
//         .select("*, subcategories_count:skill_subcategories(count), tests_count:skill_tests(count)");
      
//       if (error) throw error;
//       setCategories(data || []);
//     } catch (error) {
//       console.error("Supabase Error:", error);
//     } finally {
//       setLoading(false);
//     }
//   };

//   const filteredCategories = categories.filter(cat => 
//     cat.name?.toLowerCase().includes(search.toLowerCase())
//   );

//   const renderCategoryCard = ({ item }: { item: any }) => (
//     <TouchableOpacity 
//       style={styles.card}
//       onPress={() => router.push({ pathname: "/(student)/skill-subcategories", params: { id: item.id, name: item.name } })}
//     >
//       <Text style={styles.cardTitle}>{item.name}</Text>
//       <Text style={styles.cardSubtitle} numberOfLines={2}>{item.description || "Information Technology"}</Text>
      
//       <View style={styles.cardFooter}>
//         <View style={styles.statRow}>
//           <Text style={styles.statLabel}>Subcategories</Text>
//           <Text style={styles.statValue}>{item.subcategories_count?.[0]?.count || 0}</Text>
//         </View>
//         <View style={styles.statRow}>
//           <Text style={styles.statLabel}>Total Tests</Text>
//           <Text style={styles.statValue}>{item.tests_count?.[0]?.count || 0}</Text>
//         </View>
//       </View>
//     </TouchableOpacity>
//   );

//   return (
//     <View style={[styles.container, { paddingTop: insets.top }]}>
//       <StatusBar barStyle="dark-content" />
      
//       {/* Header */}
//       <View style={styles.header}>
//         <TouchableOpacity onPress={() => router.back()} style={styles.backBtn}>
//           <Ionicons name="arrow-back" size={22} color="#222222" />
//         </TouchableOpacity>
//         <Text style={styles.headerTitle}>Skill Tests</Text>
//         <View style={{ width: 32 }} />
//       </View>

//       <View style={styles.content}>
//         <Text style={styles.mainTitle}>Choose Your Category</Text>
//         <Text style={styles.mainSubtitle}>Select a category to begin your assessment</Text>

//         {/* Search Bar */}
//         <View style={styles.searchContainer}>
//           <Ionicons name="search-outline" size={18} color="#94A3B8" />
//           <TextInput
//             placeholder="Search categories..."
//             placeholderTextColor="#94A3B8"
//             style={styles.searchInput}
//             value={search}
//             onChangeText={setSearch}
//           />
//         </View>

//         {loading ? (
//           <View style={styles.center}><ActivityIndicator size="small" color="#1F4FA3" /></View>
//         ) : (
//           <FlatList
//             data={filteredCategories}
//             renderItem={renderCategoryCard}
//             keyExtractor={(item) => item.id.toString()}
//             numColumns={2}
//             columnWrapperStyle={styles.row}
//             showsVerticalScrollIndicator={false}
//             contentContainerStyle={{ paddingBottom: insets.bottom + 20 }}
//             ListEmptyComponent={
//               <View style={styles.center}>
//                 <Text style={{ color: "#94A3B8" }}>No categories found</Text>
//               </View>
//             }
//           />
//         )}
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
//     paddingHorizontal: 16,
//     height: 50,
//     borderBottomWidth: 1,
//     borderBottomColor: "#E2E8F0",
//   },
//   backBtn: { width: 32 },
//   headerTitle: { fontSize: 16, fontWeight: "700", color: "#222222" },
//   content: { flex: 1, paddingHorizontal: 20, paddingTop: 20 },
//   mainTitle: { fontSize: 24, fontWeight: "800", color: "#222222" },
//   mainSubtitle: { fontSize: 14, color: "#64748B", marginTop: 4, marginBottom: 20 },
//   searchContainer: {
//     flexDirection: "row",
//     alignItems: "center",
//     backgroundColor: "#F8FAFC",
//     borderWidth: 1,
//     borderColor: "#E2E8F0",
//     borderRadius: 10,
//     paddingHorizontal: 12,
//     height: 45,
//     marginBottom: 20,
//   },
//   searchInput: { flex: 1, marginLeft: 8, fontSize: 14, color: "#222222" },
//   row: { justifyContent: "space-between" },
//   card: {
//     backgroundColor: "#FFF",
//     width: "48%",
//     borderRadius: 16,
//     padding: 16,
//     marginBottom: 16,
//     borderWidth: 1,
//     borderColor: "#E2E8F0",
//     shadowColor: "#1F4FA3",
//     shadowOffset: { width: 0, height: 2 },
//     shadowOpacity: 0.05,
//     shadowRadius: 4,
//     elevation: 2,
//   },
//   cardTitle: { fontSize: 18, fontWeight: "800", color: "#222222" },
//   cardSubtitle: { fontSize: 12, color: "#64748B", marginTop: 4, height: 35 },
//   cardFooter: { marginTop: 15, paddingTop: 12, borderTopWidth: 1, borderTopColor: "#F1F5F9" },
//   statRow: { flexDirection: "row", justifyContent: "space-between", marginBottom: 4 },
//   statLabel: { fontSize: 11, color: "#64748B" },
//   statValue: { fontSize: 11, fontWeight: "700", color: "#1F4FA3" },
//   center: { flex: 1, justifyContent: "center", alignItems: "center", marginTop: 50 },
// });

import React, { useState, useEffect } from "react";
import { 
  View, 
  Text, 
  StyleSheet, 
  FlatList, 
  TouchableOpacity, 
  TextInput, 
  ActivityIndicator, 
  StatusBar,
  Dimensions
} from "react-native";
import { useSafeAreaInsets } from "react-native-safe-area-context";
import { Ionicons } from "@expo/vector-icons";
import { supabase } from "../../lib/supabase";
import { router } from "expo-router";

const { width } = Dimensions.get("window");

export default function SkillTestsScreen() {
  const insets = useSafeAreaInsets();
  const [categories, setCategories] = useState<any[]>([]);
  const [loading, setLoading] = useState(true);
  const [search, setSearch] = useState("");

  useEffect(() => { fetchCategories(); }, []);

  const fetchCategories = async () => {
    try {
      setLoading(true);
      
      // FIXED QUERY: This gets the counts correctly from related tables
      const { data, error } = await supabase
        .from("skill_categories")
        .select(`
          *,
          skill_subcategories(count),
          skill_tests(count)
        `);
      
      if (error) throw error;
      setCategories(data || []);
    } catch (error: any) {
      console.error("Supabase Error Details:", error.message);
    } finally {
      setLoading(false);
    }
  };

  const filteredCategories = categories.filter(cat => 
    cat.name?.toLowerCase().includes(search.toLowerCase())
  );

  const renderCategoryCard = ({ item }: { item: any }) => (
    <TouchableOpacity 
      style={styles.card}
      onPress={() => router.push({ 
        pathname: "/(student)/skill-subcategories", 
        params: { id: item.id, name: item.name } 
      })}
    >
      <Text style={styles.cardTitle}>{item.name}</Text>
      <Text style={styles.cardSubtitle} numberOfLines={2}>
        {item.description || "Information Technology"}
      </Text>
      
      <View style={styles.cardFooter}>
        <View style={styles.statRow}>
          <Text style={styles.statLabel}>Subcategories</Text>
          {/* Accessing the count correctly from the returned array */}
          <Text style={styles.statValue}>
            {item.skill_subcategories?.[0]?.count || 0}
          </Text>
        </View>
        <View style={styles.statRow}>
          <Text style={styles.statLabel}>Total Tests</Text>
          {/* Accessing the count correctly from the returned array */}
          <Text style={styles.statValue}>
            {item.skill_tests?.[0]?.count || 0}
          </Text>
        </View>
      </View>
    </TouchableOpacity>
  );

  return (
    <View style={[styles.container, { paddingTop: insets.top }]}>
      <StatusBar barStyle="dark-content" />
      
      <View style={styles.header}>
        <TouchableOpacity onPress={() => router.back()} style={styles.backBtn}>
          <Ionicons name="arrow-back" size={22} color="#222222" />
        </TouchableOpacity>
        <Text style={styles.headerTitle}>Skill Tests</Text>
        <View style={{ width: 32 }} />
      </View>

      <View style={styles.content}>
        <Text style={styles.mainTitle}>Choose Your Category</Text>
        <Text style={styles.mainSubtitle}>Select a category to begin your assessment</Text>

        <View style={styles.searchContainer}>
          <Ionicons name="search-outline" size={18} color="#94A3B8" />
          <TextInput
            placeholder="Search categories..."
            placeholderTextColor="#94A3B8"
            style={styles.searchInput}
            value={search}
            onChangeText={setSearch}
          />
        </View>

        {loading ? (
          <View style={styles.center}>
            <ActivityIndicator size="small" color="#1F4FA3" />
          </View>
        ) : (
          <FlatList
            data={filteredCategories}
            renderItem={renderCategoryCard}
            keyExtractor={(item) => item.id.toString()}
            numColumns={2}
            columnWrapperStyle={styles.row}
            showsVerticalScrollIndicator={false}
            contentContainerStyle={{ paddingBottom: insets.bottom + 20 }}
            ListEmptyComponent={
              <View style={styles.center}>
                <Text style={{ color: "#94A3B8" }}>No categories found</Text>
              </View>
            }
          />
        )}
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
    paddingHorizontal: 16,
    height: 50,
    borderBottomWidth: 1,
    borderBottomColor: "#E2E8F0",
  },
  backBtn: { width: 32 },
  headerTitle: { fontSize: 16, fontWeight: "700", color: "#222222" },
  content: { flex: 1, paddingHorizontal: 20, paddingTop: 20 },
  mainTitle: { fontSize: 24, fontWeight: "800", color: "#222222" },
  mainSubtitle: { fontSize: 14, color: "#64748B", marginTop: 4, marginBottom: 20 },
  searchContainer: {
    flexDirection: "row",
    alignItems: "center",
    backgroundColor: "#F8FAFC",
    borderWidth: 1,
    borderColor: "#E2E8F0",
    borderRadius: 10,
    paddingHorizontal: 12,
    height: 45,
    marginBottom: 20,
  },
  searchInput: { flex: 1, marginLeft: 8, fontSize: 14, color: "#222222" },
  row: { justifyContent: "space-between" },
  card: {
    backgroundColor: "#FFF",
    width: (width - 56) / 2, // More precise width for 2 columns
    borderRadius: 16,
    padding: 16,
    marginBottom: 16,
    borderWidth: 1,
    borderColor: "#E2E8F0",
    shadowColor: "#1F4FA3",
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.05,
    shadowRadius: 4,
    elevation: 2,
  },
  cardTitle: { fontSize: 18, fontWeight: "800", color: "#222222" },
  cardSubtitle: { fontSize: 12, color: "#64748B", marginTop: 4, height: 35 },
  cardFooter: { marginTop: 15, paddingTop: 12, borderTopWidth: 1, borderTopColor: "#F1F5F9" },
  statRow: { flexDirection: "row", justifyContent: "space-between", marginBottom: 4 },
  statLabel: { fontSize: 11, color: "#64748B" },
  statValue: { fontSize: 11, fontWeight: "700", color: "#1F4FA3" },
  center: { flex: 1, justifyContent: "center", alignItems: "center", marginTop: 50 },
});