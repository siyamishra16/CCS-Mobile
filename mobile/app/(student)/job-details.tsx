// import React from "react";
// import { View, Text, StyleSheet, ScrollView, TouchableOpacity, SafeAreaView } from "react-native";
// import { useLocalSearchParams, router } from "expo-router";
// import { Ionicons } from "@expo/vector-icons";

// export default function JobDetails() {
//   const { job } = useLocalSearchParams();
//   const jobData = JSON.parse(job as string);

//   return (
//     <SafeAreaView style={styles.container}>
//       <View style={styles.header}>
//         <TouchableOpacity onPress={() => router.back()}><Ionicons name="arrow-back" size={24} color="#333" /></TouchableOpacity>
//         <Text style={styles.headerTitle}>Job Details</Text>
//         <View style={{ width: 24 }} />
//       </View>

//       <ScrollView contentContainerStyle={styles.content}>
//         <Text style={styles.title}>{jobData.title}</Text>
//         <Text style={styles.company}>Company Name</Text>
        
//         <View style={styles.row}>
//           <Ionicons name="location-outline" size={16} color="#666" />
//           <Text style={styles.infoText}>{jobData.location_type} • {jobData.location}</Text>
//         </View>

//         <View style={styles.divider} />
        
//         <Text style={styles.sectionTitle}>Job Description</Text>
//         <Text style={styles.description}>{jobData.description || "No description provided."}</Text>
        
//         <Text style={styles.sectionTitle}>Employment Type</Text>
//         <Text style={styles.description}>{jobData.employment_type}</Text>
//       </ScrollView>

//       <TouchableOpacity 
//         style={styles.applyBtn} 
//         onPress={() => router.push({
//             pathname: "/(student)/apply-job",
//             params: { jobId: jobData.id, jobTitle: jobData.title }
//         })}
//       >
//         <Text style={styles.applyBtnText}>Apply Now</Text>
//       </TouchableOpacity>
//     </SafeAreaView>
//   );
// }

// const styles = StyleSheet.create({
//   container: { flex: 1, backgroundColor: "#FFF" },
//   header: { flexDirection: "row", justifyContent: "space-between", padding: 15, alignItems: "center", borderBottomWidth: 1, borderBottomColor: "#EEE" },
//   headerTitle: { fontSize: 18, fontWeight: "700" },
//   content: { padding: 20 },
//   title: { fontSize: 24, fontWeight: "800", color: "#1A1A1A" },
//   company: { fontSize: 18, color: "#4285F4", marginVertical: 5 },
//   row: { flexDirection: "row", alignItems: "center", marginTop: 10 },
//   infoText: { marginLeft: 5, color: "#666" },
//   divider: { height: 1, backgroundColor: "#EEE", marginVertical: 20 },
//   sectionTitle: { fontSize: 18, fontWeight: "700", marginBottom: 10 },
//   description: { fontSize: 15, color: "#444", lineHeight: 22, marginBottom: 20 },
//   applyBtn: { backgroundColor: "#4285F4", margin: 20, padding: 16, borderRadius: 12, alignItems: "center" },
//   applyBtnText: { color: "#FFF", fontSize: 16, fontWeight: "700" }
// });


// import React, { useState } from "react";
// import { View, Text, StyleSheet, ScrollView, TouchableOpacity } from "react-native";
// import { SafeAreaView } from "react-native-safe-area-context";
// import { useLocalSearchParams, router } from "expo-router";
// import { Ionicons } from "@expo/vector-icons";

// export default function JobDetails() {
//   const { job } = useLocalSearchParams();
//   const jobData = JSON.parse(job as string);
//   const [isSaved, setIsSaved] = useState(false);

//   const companyInitial = (jobData.company || "C").charAt(0).toUpperCase();

//   return (
//     <SafeAreaView style={styles.container}>
//       {/* Header */}
//       <View style={styles.header}>
//         <TouchableOpacity style={styles.iconBtn} onPress={() => router.back()}>
//           <Ionicons name="arrow-back" size={22} color="#333" />
//         </TouchableOpacity>
//         <Text style={styles.headerTitle}>Job Details</Text>
//         <TouchableOpacity style={styles.iconBtn} onPress={() => setIsSaved(!isSaved)}>
//           <Ionicons name={isSaved ? "bookmark" : "bookmark-outline"} size={22} color={isSaved ? "#4285F4" : "#333"} />
//         </TouchableOpacity>
//       </View>

//       <ScrollView contentContainerStyle={styles.content} showsVerticalScrollIndicator={false}>

//         {/* Company Logo + Title */}
//         <View style={styles.heroCard}>
//           <View style={styles.logoBox}>
//             <Text style={styles.logoText}>{companyInitial}</Text>
//           </View>
//           <Text style={styles.title}>{jobData.title}</Text>
//           <Text style={styles.company}>{jobData.company || "Company Name"}</Text>

//           {/* Tags */}
//           <View style={styles.tagsRow}>
//             {jobData.location_type && (
//               <View style={styles.tag}>
//                 <Ionicons name="globe-outline" size={12} color="#4285F4" />
//                 <Text style={styles.tagText}>{jobData.location_type}</Text>
//               </View>
//             )}
//             {jobData.employment_type && (
//               <View style={styles.tag}>
//                 <Ionicons name="briefcase-outline" size={12} color="#4285F4" />
//                 <Text style={styles.tagText}>{jobData.employment_type}</Text>
//               </View>
//             )}
//             {jobData.location && (
//               <View style={styles.tag}>
//                 <Ionicons name="location-outline" size={12} color="#4285F4" />
//                 <Text style={styles.tagText}>{jobData.location}</Text>
//               </View>
//             )}
//           </View>
//         </View>

//         <View style={styles.divider} />

//         {/* Description */}
//         <Text style={styles.sectionTitle}>Job Description</Text>
//         <Text style={styles.description}>{jobData.description || "No description provided."}</Text>

//         {/* Employment Type */}
//         <Text style={styles.sectionTitle}>Employment Type</Text>
//         <Text style={styles.description}>{jobData.employment_type || "Not specified"}</Text>

//         {/* Posted Date */}
//         {jobData.posted_date && (
//           <>
//             <Text style={styles.sectionTitle}>Posted On</Text>
//             <Text style={styles.description}>{new Date(jobData.posted_date).toLocaleDateString()}</Text>
//           </>
//         )}

//         <View style={{ height: 100 }} />
//       </ScrollView>

//       {/* Apply Button */}
//       <TouchableOpacity
//         style={styles.applyBtn}
//         activeOpacity={0.85}
//         onPress={() => router.push({
//           pathname: "/(student)/apply-job",
//           params: { jobId: jobData.id, jobTitle: jobData.title }
//         })}
//       >
//         <Ionicons name="send-outline" size={18} color="#FFF" />
//         <Text style={styles.applyBtnText}>Apply Now</Text>
//       </TouchableOpacity>
//     </SafeAreaView>
//   );
// }

// const styles = StyleSheet.create({
//   container: { flex: 1, backgroundColor: "#F8FAFC" },
//   header: { flexDirection: "row", justifyContent: "space-between", paddingHorizontal: 16, paddingVertical: 12, alignItems: "center", borderBottomWidth: 1, borderBottomColor: "#EEE", backgroundColor: "#FFF" },
//   headerTitle: { fontSize: 18, fontWeight: "700", color: "#1A1A1A" },
//   iconBtn: { width: 38, height: 38, borderRadius: 19, backgroundColor: "#F1F5F9", justifyContent: "center", alignItems: "center" },
//   content: { padding: 20 },
//   heroCard: { backgroundColor: "#FFF", borderRadius: 16, padding: 20, alignItems: "center", borderWidth: 1, borderColor: "#E2E8F0", marginBottom: 20 },
//   logoBox: { width: 64, height: 64, borderRadius: 14, backgroundColor: "#4285F4", justifyContent: "center", alignItems: "center", marginBottom: 14, elevation: 4, shadowColor: "#4285F4", shadowOffset: { width: 0, height: 3 }, shadowOpacity: 0.25, shadowRadius: 6 },
//   logoText: { fontSize: 26, fontWeight: "800", color: "#FFF" },
//   title: { fontSize: 22, fontWeight: "800", color: "#1A1A1A", textAlign: "center", marginBottom: 6 },
//   company: { fontSize: 16, color: "#4285F4", fontWeight: "600", marginBottom: 14 },
//   tagsRow: { flexDirection: "row", flexWrap: "wrap", justifyContent: "center", gap: 8 },
//   tag: { flexDirection: "row", alignItems: "center", backgroundColor: "#EFF6FF", paddingHorizontal: 10, paddingVertical: 5, borderRadius: 20, gap: 4 },
//   tagText: { fontSize: 12, color: "#4285F4", fontWeight: "600" },
//   divider: { height: 1, backgroundColor: "#EEE", marginBottom: 20 },
//   sectionTitle: { fontSize: 17, fontWeight: "700", color: "#1A1A1A", marginBottom: 8 },
//   description: { fontSize: 15, color: "#444", lineHeight: 23, marginBottom: 20 },
//   applyBtn: { flexDirection: "row", alignItems: "center", justifyContent: "center", gap: 8, backgroundColor: "#4285F4", margin: 20, padding: 16, borderRadius: 12, elevation: 4, shadowColor: "#4285F4", shadowOffset: { width: 0, height: 3 }, shadowOpacity: 0.25, shadowRadius: 6 },
//   applyBtnText: { color: "#FFF", fontSize: 16, fontWeight: "700" },
// });

import React, { useState } from "react";
import { View, Text, StyleSheet, ScrollView, TouchableOpacity } from "react-native";
import { SafeAreaView } from "react-native-safe-area-context";
import { useLocalSearchParams, router } from "expo-router";
import { Ionicons } from "@expo/vector-icons";

export default function JobDetails() {
  const { job } = useLocalSearchParams();
  const jobData = JSON.parse(job as string);
  const [isSaved, setIsSaved] = useState(false);

  const companyInitial = (jobData.company || "C").charAt(0).toUpperCase();

  return (
    <SafeAreaView style={styles.container}>
      {/* Header */}
      <View style={styles.header}>
        <TouchableOpacity style={styles.iconBtn} onPress={() => router.back()}>
          <Ionicons name="arrow-back" size={20} color="#333" />
        </TouchableOpacity>
        <Text style={styles.headerTitle}>Job Details</Text>
        <TouchableOpacity style={styles.iconBtn} onPress={() => setIsSaved(!isSaved)}>
          <Ionicons name={isSaved ? "bookmark" : "bookmark-outline"} size={20} color={isSaved ? "#4285F4" : "#333"} />
        </TouchableOpacity>
      </View>

      <ScrollView contentContainerStyle={styles.content} showsVerticalScrollIndicator={false}>

        {/* Company Logo + Title */}
        <View style={styles.heroCard}>
          <View style={styles.logoBox}>
            <Text style={styles.logoText}>{companyInitial}</Text>
          </View>
          <Text style={styles.title}>{jobData.title}</Text>
          <Text style={styles.company}>{jobData.company || "Company Name"}</Text>

          {/* Tags */}
          <View style={styles.tagsRow}>
            {jobData.location_type && (
              <View style={styles.tag}>
                <Ionicons name="globe-outline" size={11} color="#4285F4" />
                <Text style={styles.tagText}>{jobData.location_type}</Text>
              </View>
            )}
            {jobData.employment_type && (
              <View style={styles.tag}>
                <Ionicons name="briefcase-outline" size={11} color="#4285F4" />
                <Text style={styles.tagText}>{jobData.employment_type}</Text>
              </View>
            )}
            {jobData.location && (
              <View style={styles.tag}>
                <Ionicons name="location-outline" size={11} color="#4285F4" />
                <Text style={styles.tagText}>{jobData.location}</Text>
              </View>
            )}
          </View>
        </View>

        <View style={styles.divider} />

        {/* Description */}
        <Text style={styles.sectionTitle}>Job Description</Text>
        <Text style={styles.description}>{jobData.description || "No description provided."}</Text>

        {/* Employment Type */}
        <Text style={styles.sectionTitle}>Employment Type</Text>
        <Text style={styles.description}>{jobData.employment_type || "Not specified"}</Text>

        {/* Posted Date */}
        {jobData.posted_date && (
          <>
            <Text style={styles.sectionTitle}>Posted On</Text>
            <Text style={styles.description}>{new Date(jobData.posted_date).toLocaleDateString()}</Text>
          </>
        )}

        <View style={{ height: 80 }} />
      </ScrollView>

      {/* Apply Button */}
      <TouchableOpacity
        style={styles.applyBtn}
        activeOpacity={0.85}
        onPress={() => router.push({
          pathname: "/(student)/apply-job",
          params: { jobId: jobData.id, jobTitle: jobData.title }
        })}
      >
        <Ionicons name="send-outline" size={16} color="#FFF" />
        <Text style={styles.applyBtnText}>Apply Now</Text>
      </TouchableOpacity>
    </SafeAreaView>
  );
}

const styles = StyleSheet.create({
  container: { flex: 1, backgroundColor: "#F8FAFC" },
  header: { flexDirection: "row", justifyContent: "space-between", paddingHorizontal: 14, paddingVertical: 10, alignItems: "center", borderBottomWidth: 1, borderBottomColor: "#EEE", backgroundColor: "#FFF" },
  headerTitle: { fontSize: 16, fontWeight: "700", color: "#1A1A1A" },
  iconBtn: { width: 34, height: 34, borderRadius: 17, backgroundColor: "#F1F5F9", justifyContent: "center", alignItems: "center" },
  content: { padding: 16 },
  heroCard: { backgroundColor: "#FFF", borderRadius: 14, padding: 16, alignItems: "center", borderWidth: 1, borderColor: "#E2E8F0", marginBottom: 16 },
  logoBox: { width: 52, height: 52, borderRadius: 12, backgroundColor: "#4285F4", justifyContent: "center", alignItems: "center", marginBottom: 10, elevation: 4, shadowColor: "#4285F4", shadowOffset: { width: 0, height: 3 }, shadowOpacity: 0.25, shadowRadius: 6 },
  logoText: { fontSize: 22, fontWeight: "800", color: "#FFF" },
  title: { fontSize: 18, fontWeight: "800", color: "#1A1A1A", textAlign: "center", marginBottom: 4 },
  company: { fontSize: 14, color: "#4285F4", fontWeight: "600", marginBottom: 12 },
  tagsRow: { flexDirection: "row", flexWrap: "wrap", justifyContent: "center", gap: 6 },
  tag: { flexDirection: "row", alignItems: "center", backgroundColor: "#EFF6FF", paddingHorizontal: 8, paddingVertical: 4, borderRadius: 20, gap: 3 },
  tagText: { fontSize: 11, color: "#4285F4", fontWeight: "600" },
  divider: { height: 1, backgroundColor: "#EEE", marginBottom: 16 },
  sectionTitle: { fontSize: 15, fontWeight: "700", color: "#1A1A1A", marginBottom: 6 },
  description: { fontSize: 13, color: "#444", lineHeight: 20, marginBottom: 16 },
  applyBtn: { flexDirection: "row", alignItems: "center", justifyContent: "center", gap: 6, backgroundColor: "#4285F4", margin: 16, padding: 14, borderRadius: 12, elevation: 4, shadowColor: "#4285F4", shadowOffset: { width: 0, height: 3 }, shadowOpacity: 0.25, shadowRadius: 6 },
  applyBtnText: { color: "#FFF", fontSize: 15, fontWeight: "700" },
});