// import React, { useState } from "react";
// import {
//   View,
//   Text,
//   StyleSheet,
//   TouchableOpacity,
//   Alert,
//   ActivityIndicator,
// } from "react-native";
// import { SafeAreaView } from "react-native-safe-area-context";
// import { useLocalSearchParams, router } from "expo-router";
// import * as DocumentPicker from "expo-document-picker";
// import { Ionicons } from "@expo/vector-icons";
// import AsyncStorage from "@react-native-async-storage/async-storage";
// import axios from "axios";
// import API_BASE_URL from "../../config/api";

// export default function ApplyJob() {
//   const { jobId, jobTitle, company } = useLocalSearchParams();
//   const [file, setFile] = useState<any>(null);
//   const [uploading, setUploading] = useState(false);

//   const pickDocument = async () => {
//     const result = await DocumentPicker.getDocumentAsync({
//       type: "application/pdf",
//     });
//     if (!result.canceled) setFile(result.assets[0]);
//   };

//   const handleApply = async () => {
//     if (!file) return Alert.alert("Error", "Please upload your resume");

//     try {
//       setUploading(true);
//       const token = await AsyncStorage.getItem("token");

//       const formData = new FormData();
//       formData.append("resume", {
//         uri: file.uri,
//         name: file.name,
//         type: "application/pdf",
//       } as any);
//       formData.append("jobId", jobId as string);
//       formData.append("jobTitle", jobTitle as string);
//       formData.append("company", company as string);

//       await axios.post(`${API_BASE_URL}/student/jobs/apply`, formData, {
//         headers: {
//           "Content-Type": "multipart/form-data",
//           Authorization: `Bearer ${token}`,
//         },
//       });

//       Alert.alert("Success", "Application submitted successfully!", [
//         { text: "OK", onPress: () => router.replace("/(student)/applied") },
//       ]);
//     } catch (error: any) {
//       Alert.alert(
//         "Error",
//         error?.response?.data?.message || "Failed to submit application"
//       );
//     } finally {
//       setUploading(false);
//     }
//   };

//   return (
//     <SafeAreaView style={styles.container}>
//       {/* Header */}
//       <View style={styles.header}>
//         <TouchableOpacity style={styles.backBtn} onPress={() => router.back()}>
//           <Ionicons name="arrow-back" size={20} color="#333" />
//         </TouchableOpacity>
//         <Text style={styles.headerTitle}>Apply for Job</Text>
//         <View style={{ width: 34 }} />
//       </View>

//       <View style={styles.content}>
//         {/* Job Title */}
//         <View style={styles.jobCard}>
//           <Ionicons name="briefcase-outline" size={20} color="#4285F4" />
//           <Text style={styles.jobTitle} numberOfLines={2}>{jobTitle}</Text>
//         </View>

//         {/* Upload Area */}
//         <Text style={styles.label}>Upload Resume (PDF)</Text>
//         <TouchableOpacity style={styles.uploadArea} onPress={pickDocument}>
//           <Ionicons
//             name={file ? "document" : "cloud-upload-outline"}
//             size={40}
//             color="#4285F4"
//           />
//           <Text style={styles.uploadText}>
//             {file ? file.name : "Tap to select PDF"}
//           </Text>
//           {file && (
//             <Text style={styles.uploadSubText}>Tap to change file</Text>
//           )}
//         </TouchableOpacity>

//         {/* Submit Button */}
//         <TouchableOpacity
//           style={[styles.submitBtn, uploading && styles.submitBtnDisabled]}
//           onPress={handleApply}
//           disabled={uploading}
//         >
//           {uploading ? (
//             <ActivityIndicator color="#FFF" />
//           ) : (
//             <>
//               <Ionicons name="send-outline" size={16} color="#FFF" />
//               <Text style={styles.submitText}>Submit Application</Text>
//             </>
//           )}
//         </TouchableOpacity>
//       </View>
//     </SafeAreaView>
//   );
// }

// const styles = StyleSheet.create({
//   container: { flex: 1, backgroundColor: "#F8FAFC" },
//   header: { flexDirection: "row", justifyContent: "space-between", paddingHorizontal: 14, paddingVertical: 10, alignItems: "center", borderBottomWidth: 1, borderBottomColor: "#EEE", backgroundColor: "#FFF" },
//   headerTitle: { fontSize: 16, fontWeight: "700", color: "#1A1A1A" },
//   backBtn: { width: 34, height: 34, borderRadius: 17, backgroundColor: "#F1F5F9", justifyContent: "center", alignItems: "center" },
//   content: { flex: 1, padding: 20, justifyContent: "center" },
//   jobCard: { flexDirection: "row", alignItems: "center", backgroundColor: "#EFF6FF", padding: 14, borderRadius: 12, marginBottom: 30, gap: 10 },
//   jobTitle: { fontSize: 15, fontWeight: "700", color: "#1A1A1A", flex: 1 },
//   label: { fontSize: 14, fontWeight: "600", color: "#333", marginBottom: 10 },
//   uploadArea: { borderStyle: "dashed", borderWidth: 2, borderColor: "#4285F4", borderRadius: 14, height: 180, justifyContent: "center", alignItems: "center", backgroundColor: "#F9FBFF", marginBottom: 30, gap: 8 },
//   uploadText: { color: "#4285F4", fontWeight: "600", fontSize: 14, textAlign: "center", paddingHorizontal: 20 },
//   uploadSubText: { color: "#94A3B8", fontSize: 12 },
//   submitBtn: { flexDirection: "row", alignItems: "center", justifyContent: "center", gap: 8, backgroundColor: "#4285F4", padding: 15, borderRadius: 12, elevation: 4, shadowColor: "#4285F4", shadowOffset: { width: 0, height: 3 }, shadowOpacity: 0.25, shadowRadius: 6 },
//   submitBtnDisabled: { opacity: 0.7 },
//   submitText: { color: "#FFF", fontSize: 15, fontWeight: "700" },
// });


import React, { useState } from "react";
import {
  View,
  Text,
  StyleSheet,
  TouchableOpacity,
  Alert,
  ActivityIndicator,
} from "react-native";
import { SafeAreaView } from "react-native-safe-area-context";
import { useLocalSearchParams, router } from "expo-router";
import * as DocumentPicker from "expo-document-picker";
import { Ionicons } from "@expo/vector-icons";
import AsyncStorage from "@react-native-async-storage/async-storage";
import axios from "axios";
import API_BASE_URL from "../../config/api";

export default function ApplyJob() {
  const { jobId, jobTitle, company } = useLocalSearchParams();
  const [file, setFile] = useState<any>(null);
  const [uploading, setUploading] = useState(false);

  const pickDocument = async () => {
    const result = await DocumentPicker.getDocumentAsync({
      type: "application/pdf",
    });
    if (!result.canceled) setFile(result.assets[0]);
  };

  const handleApply = async () => {
    if (!file) return Alert.alert("Error", "Please upload your resume");
    try {
      setUploading(true);
      const token = await AsyncStorage.getItem("token");
      const formData = new FormData();
      formData.append("resume", {
        uri: file.uri,
        name: file.name,
        type: "application/pdf",
      } as any);
      formData.append("jobId", jobId as string);
      formData.append("jobTitle", jobTitle as string);
      formData.append("company", company as string);

      await axios.post(`${API_BASE_URL}/student/jobs/apply`, formData, {
        headers: {
          "Content-Type": "multipart/form-data",
          Authorization: `Bearer ${token}`,
        },
      });

      Alert.alert("Success", "Application submitted successfully!", [
        { text: "OK", onPress: () => router.replace("/(student)/applied") },
      ]);
    } catch (error: any) {
      Alert.alert("Error", error?.response?.data?.message || "Failed to submit application");
    } finally {
      setUploading(false);
    }
  };

  return (
    <SafeAreaView style={styles.container}>

      {/* Header */}
      <View style={styles.header}>
        <TouchableOpacity style={styles.backBtn} onPress={() => router.back()}>
          <Ionicons name="arrow-back" size={20} color="#1E293B" />
        </TouchableOpacity>
        <Text style={styles.headerTitle}>Apply</Text>
        <View style={{ width: 36 }} />
      </View>

      <View style={styles.body}>

        {/* Job Info */}
        <View style={styles.jobInfo}>
          <View style={styles.jobIconBox}>
            <Ionicons name="briefcase-outline" size={22} color="#0A66C2" />
          </View>
          <View style={styles.jobText}>
            <Text style={styles.jobTitle} numberOfLines={1}>{jobTitle}</Text>
            <Text style={styles.companyName} numberOfLines={1}>{company}</Text>
          </View>
        </View>

        <View style={styles.divider} />

        {/* Resume Section */}
        <Text style={styles.sectionLabel}>Resume</Text>
        <Text style={styles.sectionSub}>Upload your latest resume in PDF format</Text>

        <TouchableOpacity
          style={[styles.uploadBox, file && styles.uploadBoxFilled]}
          onPress={pickDocument}
          activeOpacity={0.7}
        >
          {file ? (
            <>
              <View style={styles.fileIconBox}>
                <Ionicons name="document-text" size={28} color="#0A66C2" />
              </View>
              <View style={styles.fileInfo}>
                <Text style={styles.fileName} numberOfLines={1}>{file.name}</Text>
                <Text style={styles.fileChange}>Tap to change</Text>
              </View>
              <Ionicons name="checkmark-circle" size={22} color="#10B981" />
            </>
          ) : (
            <View style={styles.uploadPlaceholder}>
              <Ionicons name="cloud-upload-outline" size={32} color="#94A3B8" />
              <Text style={styles.uploadTitle}>Select PDF File</Text>
              <Text style={styles.uploadSub}>Tap to browse files</Text>
            </View>
          )}
        </TouchableOpacity>

        {/* Submit */}
        <TouchableOpacity
          style={[styles.submitBtn, (!file || uploading) && styles.submitBtnDisabled]}
          onPress={handleApply}
          disabled={!file || uploading}
          activeOpacity={0.85}
        >
          {uploading ? (
            <ActivityIndicator color="#FFF" size="small" />
          ) : (
            <>
              <Ionicons name="send-outline" size={16} color="#FFF" />
              <Text style={styles.submitText}>Submit Application</Text>
            </>
          )}
        </TouchableOpacity>

        <Text style={styles.disclaimer}>
          By submitting, you agree to share your resume with the employer.
        </Text>

      </View>
    </SafeAreaView>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: "#F8FAFC",
  },
  header: {
    flexDirection: "row",
    alignItems: "center",
    justifyContent: "space-between",
    paddingHorizontal: 16,
    paddingVertical: 12,
    backgroundColor: "#FFF",
    borderBottomWidth: 1,
    borderBottomColor: "#F1F5F9",
  },
  backBtn: {
    width: 36,
    height: 36,
    borderRadius: 18,
    backgroundColor: "#F1F5F9",
    justifyContent: "center",
    alignItems: "center",
  },
  headerTitle: {
    fontSize: 16,
    fontWeight: "700",
    color: "#1E293B",
  },
  body: {
    flex: 1,
    padding: 20,
  },
  jobInfo: {
    flexDirection: "row",
    alignItems: "center",
    backgroundColor: "#FFF",
    borderRadius: 14,
    padding: 14,
    borderWidth: 1,
    borderColor: "#E2E8F0",
    gap: 12,
    marginBottom: 20,
  },
  jobIconBox: {
    width: 44,
    height: 44,
    borderRadius: 12,
    backgroundColor: "#EFF6FF",
    justifyContent: "center",
    alignItems: "center",
  },
  jobText: {
    flex: 1,
  },
  jobTitle: {
    fontSize: 15,
    fontWeight: "700",
    color: "#1E293B",
    marginBottom: 2,
  },
  companyName: {
    fontSize: 13,
    color: "#64748B",
    fontWeight: "500",
  },
  divider: {
    height: 1,
    backgroundColor: "#E2E8F0",
    marginBottom: 20,
  },
  sectionLabel: {
    fontSize: 14,
    fontWeight: "700",
    color: "#1E293B",
    marginBottom: 4,
  },
  sectionSub: {
    fontSize: 12,
    color: "#94A3B8",
    marginBottom: 14,
  },
  uploadBox: {
    backgroundColor: "#FFF",
    borderRadius: 14,
    borderWidth: 1.5,
    borderColor: "#E2E8F0",
    borderStyle: "dashed",
    padding: 20,
    alignItems: "center",
    justifyContent: "center",
    minHeight: 160,
    marginBottom: 24,
  },
  uploadBoxFilled: {
    flexDirection: "row",
    borderStyle: "solid",
    borderColor: "#BFDBFE",
    backgroundColor: "#F0F7FF",
    minHeight: 70,
    gap: 12,
  },
  uploadPlaceholder: {
    alignItems: "center",
    gap: 6,
  },
  uploadTitle: {
    fontSize: 14,
    fontWeight: "600",
    color: "#475569",
    marginTop: 4,
  },
  uploadSub: {
    fontSize: 12,
    color: "#94A3B8",
  },
  fileIconBox: {
    width: 44,
    height: 44,
    borderRadius: 10,
    backgroundColor: "#DBEAFE",
    justifyContent: "center",
    alignItems: "center",
  },
  fileInfo: {
    flex: 1,
  },
  fileName: {
    fontSize: 13,
    fontWeight: "600",
    color: "#1E293B",
    marginBottom: 2,
  },
  fileChange: {
    fontSize: 11,
    color: "#0A66C2",
    fontWeight: "500",
  },
  submitBtn: {
    flexDirection: "row",
    alignItems: "center",
    justifyContent: "center",
    gap: 8,
    backgroundColor: "#0A66C2",
    paddingVertical: 15,
    borderRadius: 12,
    elevation: 3,
    shadowColor: "#0A66C2",
    shadowOffset: { width: 0, height: 3 },
    shadowOpacity: 0.2,
    shadowRadius: 6,
  },
  submitBtnDisabled: {
    backgroundColor: "#94A3B8",
    elevation: 0,
    shadowOpacity: 0,
  },
  submitText: {
    color: "#FFF",
    fontSize: 15,
    fontWeight: "700",
  },
  disclaimer: {
    fontSize: 11,
    color: "#94A3B8",
    textAlign: "center",
    marginTop: 16,
    lineHeight: 16,
  },
});