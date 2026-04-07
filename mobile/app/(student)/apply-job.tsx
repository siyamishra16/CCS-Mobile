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
//       Alert.alert("Error", error?.response?.data?.message || "Failed to submit application");
//     } finally {
//       setUploading(false);
//     }
//   };

//   return (
//     <SafeAreaView style={styles.container}>

//       {/* Header */}
//       <View style={styles.header}>
//         <TouchableOpacity style={styles.backBtn} onPress={() => router.back()}>
//           <Ionicons name="arrow-back" size={20} color="#1E293B" />
//         </TouchableOpacity>
//         <Text style={styles.headerTitle}>Apply</Text>
//         <View style={{ width: 36 }} />
//       </View>

//       <View style={styles.body}>

//         {/* Job Info */}
//         <View style={styles.jobInfo}>
//           <View style={styles.jobIconBox}>
//             <Ionicons name="briefcase-outline" size={22} color="#0A66C2" />
//           </View>
//           <View style={styles.jobText}>
//             <Text style={styles.jobTitle} numberOfLines={1}>{jobTitle}</Text>
//             <Text style={styles.companyName} numberOfLines={1}>{company}</Text>
//           </View>
//         </View>

//         <View style={styles.divider} />

//         {/* Resume Section */}
//         <Text style={styles.sectionLabel}>Resume</Text>
//         <Text style={styles.sectionSub}>Upload your latest resume in PDF format</Text>

//         <TouchableOpacity
//           style={[styles.uploadBox, file && styles.uploadBoxFilled]}
//           onPress={pickDocument}
//           activeOpacity={0.7}
//         >
//           {file ? (
//             <>
//               <View style={styles.fileIconBox}>
//                 <Ionicons name="document-text" size={28} color="#0A66C2" />
//               </View>
//               <View style={styles.fileInfo}>
//                 <Text style={styles.fileName} numberOfLines={1}>{file.name}</Text>
//                 <Text style={styles.fileChange}>Tap to change</Text>
//               </View>
//               <Ionicons name="checkmark-circle" size={22} color="#10B981" />
//             </>
//           ) : (
//             <View style={styles.uploadPlaceholder}>
//               <Ionicons name="cloud-upload-outline" size={32} color="#94A3B8" />
//               <Text style={styles.uploadTitle}>Select PDF File</Text>
//               <Text style={styles.uploadSub}>Tap to browse files</Text>
//             </View>
//           )}
//         </TouchableOpacity>

//         {/* Submit */}
//         <TouchableOpacity
//           style={[styles.submitBtn, (!file || uploading) && styles.submitBtnDisabled]}
//           onPress={handleApply}
//           disabled={!file || uploading}
//           activeOpacity={0.85}
//         >
//           {uploading ? (
//             <ActivityIndicator color="#FFF" size="small" />
//           ) : (
//             <>
//               <Ionicons name="send-outline" size={16} color="#FFF" />
//               <Text style={styles.submitText}>Submit Application</Text>
//             </>
//           )}
//         </TouchableOpacity>

//         <Text style={styles.disclaimer}>
//           By submitting, you agree to share your resume with the employer.
//         </Text>

//       </View>
//     </SafeAreaView>
//   );
// }

// const styles = StyleSheet.create({
//   container: {
//     flex: 1,
//     backgroundColor: "#F8FAFC",
//   },
//   header: {
//     flexDirection: "row",
//     alignItems: "center",
//     justifyContent: "space-between",
//     paddingHorizontal: 16,
//     paddingVertical: 12,
//     backgroundColor: "#FFF",
//     borderBottomWidth: 1,
//     borderBottomColor: "#F1F5F9",
//   },
//   backBtn: {
//     width: 36,
//     height: 36,
//     borderRadius: 18,
//     backgroundColor: "#F1F5F9",
//     justifyContent: "center",
//     alignItems: "center",
//   },
//   headerTitle: {
//     fontSize: 16,
//     fontWeight: "700",
//     color: "#1E293B",
//   },
//   body: {
//     flex: 1,
//     padding: 20,
//   },
//   jobInfo: {
//     flexDirection: "row",
//     alignItems: "center",
//     backgroundColor: "#FFF",
//     borderRadius: 14,
//     padding: 14,
//     borderWidth: 1,
//     borderColor: "#E2E8F0",
//     gap: 12,
//     marginBottom: 20,
//   },
//   jobIconBox: {
//     width: 44,
//     height: 44,
//     borderRadius: 12,
//     backgroundColor: "#EFF6FF",
//     justifyContent: "center",
//     alignItems: "center",
//   },
//   jobText: {
//     flex: 1,
//   },
//   jobTitle: {
//     fontSize: 15,
//     fontWeight: "700",
//     color: "#1E293B",
//     marginBottom: 2,
//   },
//   companyName: {
//     fontSize: 13,
//     color: "#64748B",
//     fontWeight: "500",
//   },
//   divider: {
//     height: 1,
//     backgroundColor: "#E2E8F0",
//     marginBottom: 20,
//   },
//   sectionLabel: {
//     fontSize: 14,
//     fontWeight: "700",
//     color: "#1E293B",
//     marginBottom: 4,
//   },
//   sectionSub: {
//     fontSize: 12,
//     color: "#94A3B8",
//     marginBottom: 14,
//   },
//   uploadBox: {
//     backgroundColor: "#FFF",
//     borderRadius: 14,
//     borderWidth: 1.5,
//     borderColor: "#E2E8F0",
//     borderStyle: "dashed",
//     padding: 20,
//     alignItems: "center",
//     justifyContent: "center",
//     minHeight: 160,
//     marginBottom: 24,
//   },
//   uploadBoxFilled: {
//     flexDirection: "row",
//     borderStyle: "solid",
//     borderColor: "#BFDBFE",
//     backgroundColor: "#F0F7FF",
//     minHeight: 70,
//     gap: 12,
//   },
//   uploadPlaceholder: {
//     alignItems: "center",
//     gap: 6,
//   },
//   uploadTitle: {
//     fontSize: 14,
//     fontWeight: "600",
//     color: "#475569",
//     marginTop: 4,
//   },
//   uploadSub: {
//     fontSize: 12,
//     color: "#94A3B8",
//   },
//   fileIconBox: {
//     width: 44,
//     height: 44,
//     borderRadius: 10,
//     backgroundColor: "#DBEAFE",
//     justifyContent: "center",
//     alignItems: "center",
//   },
//   fileInfo: {
//     flex: 1,
//   },
//   fileName: {
//     fontSize: 13,
//     fontWeight: "600",
//     color: "#1E293B",
//     marginBottom: 2,
//   },
//   fileChange: {
//     fontSize: 11,
//     color: "#0A66C2",
//     fontWeight: "500",
//   },
//   submitBtn: {
//     flexDirection: "row",
//     alignItems: "center",
//     justifyContent: "center",
//     gap: 8,
//     backgroundColor: "#0A66C2",
//     paddingVertical: 15,
//     borderRadius: 12,
//     elevation: 3,
//     shadowColor: "#0A66C2",
//     shadowOffset: { width: 0, height: 3 },
//     shadowOpacity: 0.2,
//     shadowRadius: 6,
//   },
//   submitBtnDisabled: {
//     backgroundColor: "#94A3B8",
//     elevation: 0,
//     shadowOpacity: 0,
//   },
//   submitText: {
//     color: "#FFF",
//     fontSize: 15,
//     fontWeight: "700",
//   },
//   disclaimer: {
//     fontSize: 11,
//     color: "#94A3B8",
//     textAlign: "center",
//     marginTop: 16,
//     lineHeight: 16,
//   },
// });

// import React, { useState, useEffect } from "react";
// import {
//   View,
//   Text,
//   StyleSheet,
//   TouchableOpacity,
//   Alert,
//   ActivityIndicator,
//   StatusBar,
//   Platform,
// } from "react-native";
// import { SafeAreaView } from "react-native-safe-area-context";
// import { useLocalSearchParams, useRouter } from "expo-router";
// import * as DocumentPicker from "expo-document-picker";
// import { Ionicons } from "@expo/vector-icons";
// import AsyncStorage from "@react-native-async-storage/async-storage";
// import axios from "axios";
// import API_BASE_URL from "../../config/api";

// export default function ApplyJob() {
//   const router = useRouter();
//   const { jobId, jobTitle, company } = useLocalSearchParams();
  
//   const [file, setFile] = useState<any>(null);
//   const [uploading, setUploading] = useState(false);
//   const [fetchingProfile, setFetchingProfile] = useState(true);
//   const [isFromProfile, setIsFromProfile] = useState(false);

//   useEffect(() => {
//     checkExistingResume();
//   }, []);

//   const checkExistingResume = async () => {
//     try {
//       setFetchingProfile(true);
//       const token = await AsyncStorage.getItem("token");
//       if (!token) return;

//       // Fetching from your ACTUAL Node.js backend (same as profile.tsx)
//       const res = await axios.get(`${API_BASE_URL}/student`, {
//         headers: { Authorization: `Bearer ${token}` },
//       });

//       // Navigate the data structure your backend returns
//       const resumeUrl = res.data?.profile?.resume_url;

//       if (resumeUrl && resumeUrl.trim() !== "" && resumeUrl !== "empty") {
//         console.log("Resume found via API:", resumeUrl);
//         setFile({
//           uri: resumeUrl,
//           name: "My_Profile_Resume.pdf",
//           isRemote: true, // Flag to indicate this is a URL, not a new local file
//         });
//         setIsFromProfile(true);
//       } else {
//         console.log("No resume_url found in profile data.");
//       }
//     } catch (err: any) {
//       console.log("Error fetching profile:", err?.message);
//     } finally {
//       setFetchingProfile(false);
//     }
//   };

//   const pickDocument = async () => {
//     try {
//       const result = await DocumentPicker.getDocumentAsync({
//         type: "application/pdf",
//       });
//       if (!result.canceled) {
//         setFile(result.assets[0]);
//         setIsFromProfile(false); 
//       }
//     } catch (err) {
//       Alert.alert("Error", "Failed to pick document");
//     }
//   };

//   const handleApply = async () => {
//     if (!file) return Alert.alert("Error", "Please upload or select a resume");
    
//     try {
//       setUploading(true);
//       const token = await AsyncStorage.getItem("token");
//       const formData = new FormData();

//       // If using the remote URL from profile, we pass the string
//       // If using a newly picked file, we pass the file blob
//       if (file.isRemote) {
//         formData.append("resumeUrl", file.uri); 
//       } else {
//         formData.append("resume", {
//           uri: file.uri,
//           name: file.name || "resume.pdf",
//           type: "application/pdf",
//         } as any);
//       }

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
//       Alert.alert("Error", error?.response?.data?.message || "Failed to submit application");
//     } finally {
//       setUploading(false);
//     }
//   };

//   return (
//     <SafeAreaView style={styles.container}>
//       <StatusBar barStyle="dark-content" />
      
//       <View style={styles.header}>
//         <TouchableOpacity style={styles.backBtn} onPress={() => router.back()}>
//           <Ionicons name="arrow-back" size={20} color="#1E293B" />
//         </TouchableOpacity>
//         <Text style={styles.headerTitle}>Apply for Job</Text>
//         <View style={{ width: 36 }} />
//       </View>

//       <View style={styles.body}>
//         <View style={styles.jobInfo}>
//           <View style={styles.jobIconBox}>
//             <Ionicons name="briefcase" size={22} color="#0A66C2" />
//           </View>
//           <View style={styles.jobText}>
//             <Text style={styles.jobTitle} numberOfLines={1}>{jobTitle}</Text>
//             <Text style={styles.companyName} numberOfLines={1}>{company}</Text>
//           </View>
//         </View>

//         <View style={styles.divider} />

//         <Text style={styles.sectionLabel}>Resume</Text>
//         <Text style={styles.sectionSub}>
//           {isFromProfile 
//             ? "Your profile resume is ready to use. Tap to change if needed." 
//             : "Upload a PDF resume to apply."}
//         </Text>

//         <TouchableOpacity
//           style={[styles.uploadBox, file && styles.uploadBoxFilled]}
//           onPress={pickDocument}
//           disabled={fetchingProfile || uploading}
//           activeOpacity={0.7}
//         >
//           {fetchingProfile ? (
//             <ActivityIndicator color="#0A66C2" />
//           ) : file ? (
//             <>
//               <View style={styles.fileIconBox}>
//                 <Ionicons name={isFromProfile ? "cloud-done" : "document-text"} size={26} color="#0A66C2" />
//               </View>
//               <View style={styles.fileInfo}>
//                 <Text style={styles.fileName} numberOfLines={1}>
//                   {isFromProfile ? "Resume_from_Profile.pdf" : file.name}
//                 </Text>
//                 <Text style={styles.fileChange}>Tap to change</Text>
//               </View>
//               <Ionicons name="checkmark-circle" size={22} color="#10B981" />
//             </>
//           ) : (
//             <View style={styles.uploadPlaceholder}>
//               <Ionicons name="cloud-upload-outline" size={32} color="#94A3B8" />
//               <Text style={styles.uploadTitle}>Upload Resume</Text>
//             </View>
//           )}
//         </TouchableOpacity>

//         <TouchableOpacity
//           style={[styles.submitBtn, (!file || uploading) && styles.submitBtnDisabled]}
//           onPress={handleApply}
//           disabled={!file || uploading}
//         >
//           {uploading ? (
//             <ActivityIndicator color="#FFF" />
//           ) : (
//             <Text style={styles.submitText}>Submit Application</Text>
//           )}
//         </TouchableOpacity>
//       </View>
//     </SafeAreaView>
//   );
// }

// const styles = StyleSheet.create({
//   container: { flex: 1, backgroundColor: "#FFF" },
//   header: { flexDirection: "row", alignItems: "center", justifyContent: "space-between", padding: 16, borderBottomWidth: 1, borderBottomColor: "#F1F5F9" },
//   backBtn: { width: 36, height: 36, borderRadius: 18, backgroundColor: "#F1F5F9", justifyContent: "center", alignItems: "center" },
//   headerTitle: { fontSize: 16, fontWeight: "700", color: "#1E293B" },
//   body: { flex: 1, padding: 20 },
//   jobInfo: { flexDirection: "row", alignItems: "center", backgroundColor: "#F8FAFC", borderRadius: 12, padding: 15, borderWidth: 1, borderColor: "#E2E8F0", marginBottom: 20 },
//   jobIconBox: { width: 42, height: 42, borderRadius: 10, backgroundColor: "#E0F2FE", justifyContent: "center", alignItems: "center", marginRight: 12 },
//   jobText: { flex: 1 },
//   jobTitle: { fontSize: 16, fontWeight: "700", color: "#1E293B" },
//   companyName: { fontSize: 13, color: "#64748B", marginTop: 2 },
//   divider: { height: 1, backgroundColor: "#F1F5F9", marginBottom: 20 },
//   sectionLabel: { fontSize: 15, fontWeight: "700", color: "#1E293B", marginBottom: 4 },
//   sectionSub: { fontSize: 12, color: "#64748B", marginBottom: 15 },
//   uploadBox: { backgroundColor: "#FFF", borderRadius: 12, borderWidth: 1.5, borderColor: "#CBD5E1", borderStyle: "dashed", padding: 25, alignItems: "center", justifyContent: "center", minHeight: 120, marginBottom: 30 },
//   uploadBoxFilled: { flexDirection: "row", borderStyle: "solid", borderColor: "#0A66C2", backgroundColor: "#F0F9FF", minHeight: 80, padding: 15 },
//   uploadPlaceholder: { alignItems: "center" },
//   uploadTitle: { fontSize: 14, fontWeight: "600", color: "#475569", marginTop: 8 },
//   fileIconBox: { width: 44, height: 44, borderRadius: 8, backgroundColor: "#DBEAFE", justifyContent: "center", alignItems: "center", marginRight: 12 },
//   fileInfo: { flex: 1 },
//   fileName: { fontSize: 13, fontWeight: "700", color: "#1E293B" },
//   fileChange: { fontSize: 11, color: "#0A66C2", marginTop: 2, fontWeight: "600" },
//   submitBtn: { height: 54, borderRadius: 12, backgroundColor: "#0A66C2", justifyContent: "center", alignItems: "center" },
//   submitBtnDisabled: { backgroundColor: "#94A3B8" },
//   submitText: { color: "#FFF", fontSize: 16, fontWeight: "700" },
// });

import React, { useState, useEffect } from "react";
import {
  View,
  Text,
  StyleSheet,
  TouchableOpacity,
  Alert,
  ActivityIndicator,
  StatusBar,
  Platform,
} from "react-native";
import { SafeAreaView } from "react-native-safe-area-context";
import { useLocalSearchParams, useRouter } from "expo-router";
import * as DocumentPicker from "expo-document-picker";
import { Ionicons } from "@expo/vector-icons";
import AsyncStorage from "@react-native-async-storage/async-storage";
import axios from "axios";
import API_BASE_URL from "../../config/api";

const BLUE_ACCENT = "#1F4FA3";
const TEXT_GRAY_22 = "#222222";
const BORDER_BLUE_200 = "#BFDBFE";

export default function ApplyJob() {
  const router = useRouter();
  const { jobId, jobTitle, company } = useLocalSearchParams();
  
  const [file, setFile] = useState<any>(null);
  const [uploading, setUploading] = useState(false);
  const [fetchingProfile, setFetchingProfile] = useState(true);
  const [isFromProfile, setIsFromProfile] = useState(false);

  useEffect(() => {
    checkExistingResume();
  }, []);

  const checkExistingResume = async () => {
    try {
      setFetchingProfile(true);
      const token = await AsyncStorage.getItem("token");
      if (!token) return;

      const res = await axios.get(`${API_BASE_URL}/student`, {
        headers: { Authorization: `Bearer ${token}` },
      });

      const resumeUrl = res.data?.profile?.resume_url;

      if (resumeUrl && resumeUrl.trim() !== "" && resumeUrl !== "empty") {
        setFile({
          uri: resumeUrl,
          name: "Resume_from_Profile.pdf",
          isRemote: true, 
        });
        setIsFromProfile(true);
      }
    } catch (err: any) {
      console.log("Error fetching profile:", err?.message);
    } finally {
      setFetchingProfile(false);
    }
  };

  const pickDocument = async () => {
    try {
      const result = await DocumentPicker.getDocumentAsync({
        type: "application/pdf",
      });
      if (!result.canceled) {
        setFile(result.assets[0]);
        setIsFromProfile(false); 
      }
    } catch (err) {
      Alert.alert("Error", "Failed to pick document");
    }
  };

  const handleApply = async () => {
    if (!file) return Alert.alert("Error", "Please upload or select a resume");
    
    try {
      setUploading(true);
      const token = await AsyncStorage.getItem("token");
      const formData = new FormData();

      if (file.isRemote) {
        formData.append("resumeUrl", file.uri); 
      } else {
        formData.append("resume", {
          uri: file.uri,
          name: file.name || "resume.pdf",
          type: "application/pdf",
        } as any);
      }

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
      <StatusBar barStyle="dark-content" backgroundColor="white" />
      
      <View style={styles.header}>
        <TouchableOpacity style={styles.backBtn} onPress={() => router.back()}>
          <Ionicons name="arrow-back" size={20} color={TEXT_GRAY_22} />
        </TouchableOpacity>
        <Text style={styles.headerTitle}>Quick Apply</Text>
        <View style={{ width: 36 }} />
      </View>

      <View style={styles.body}>
        {/* Job Summary */}
        <View style={styles.jobInfo}>
          <View style={styles.jobIconBox}>
            <Ionicons name="briefcase" size={22} color={BLUE_ACCENT} />
          </View>
          <View style={styles.jobText}>
            <Text style={styles.jobTitle} numberOfLines={1}>{jobTitle}</Text>
            <Text style={styles.companyName} numberOfLines={1}>{company}</Text>
          </View>
        </View>

        <View style={styles.divider} />

        {/* Resume Section */}
        <Text style={styles.sectionLabel}>Resume Attachment</Text>
        <Text style={styles.sectionSub}>
          {isFromProfile 
            ? "Using resume from your profile. Tap to change." 
            : "Upload your PDF resume to apply."}
        </Text>

        <TouchableOpacity
          style={[styles.uploadBox, file && styles.uploadBoxFilled]}
          onPress={pickDocument}
          disabled={fetchingProfile || uploading}
          activeOpacity={0.7}
        >
          {fetchingProfile ? (
            <ActivityIndicator color={BLUE_ACCENT} />
          ) : file ? (
            <>
              <View style={styles.fileIconBox}>
                <Ionicons 
                  name={isFromProfile ? "cloud-done" : "document-text"} 
                  size={24} 
                  color={BLUE_ACCENT} 
                />
              </View>
              <View style={styles.fileInfo}>
                <Text style={styles.fileName} numberOfLines={1}>
                  {isFromProfile ? "Resume.pdf" : file.name}
                </Text>
                <Text style={styles.fileChange}>Change file</Text>
              </View>
              <Ionicons name="checkmark-circle" size={20} color="#10B981" />
            </>
          ) : (
            <View style={styles.uploadPlaceholder}>
              <Ionicons name="cloud-upload-outline" size={28} color="#94A3B8" />
              <Text style={styles.uploadTitle}>Upload Resume</Text>
            </View>
          )}
        </TouchableOpacity>

        {/* Thinner Submit Button */}
        <TouchableOpacity
          style={[styles.submitBtn, (!file || uploading) && styles.submitBtnDisabled]}
          onPress={handleApply}
          disabled={!file || uploading}
          activeOpacity={0.8}
        >
          {uploading ? (
            <ActivityIndicator color="#FFF" size="small" />
          ) : (
            <>
              <Text style={styles.submitText}>Submit Application</Text>
              <Ionicons name="chevron-forward" size={16} color="#FFF" />
            </>
          )}
        </TouchableOpacity>

        <Text style={styles.footerNote}>
          Your data will be shared securely with {company}.
        </Text>
      </View>
    </SafeAreaView>
  );
}

const styles = StyleSheet.create({
  container: { flex: 1, backgroundColor: "#FFF" },
  header: { 
    flexDirection: "row", 
    alignItems: "center", 
    justifyContent: "space-between", 
    paddingHorizontal: 16, 
    paddingVertical: 12, 
    borderBottomWidth: 1, 
    borderBottomColor: "#F1F5F9" 
  },
  backBtn: { width: 36, height: 36, borderRadius: 18, backgroundColor: "#F8FAFC", justifyContent: "center", alignItems: "center", borderWidth: 1, borderColor: BORDER_BLUE_200 },
  headerTitle: { fontSize: 16, fontWeight: "700", color: TEXT_GRAY_22 },
  body: { flex: 1, padding: 20 },
  jobInfo: { 
    flexDirection: "row", 
    alignItems: "center", 
    backgroundColor: "#F8FAFC", 
    borderRadius: 12, 
    padding: 15, 
    borderWidth: 1, 
    borderColor: BORDER_BLUE_200, 
    marginBottom: 20 
  },
  jobIconBox: { width: 42, height: 42, borderRadius: 10, backgroundColor: "#EFF6FF", justifyContent: "center", alignItems: "center", marginRight: 12 },
  jobText: { flex: 1 },
  jobTitle: { fontSize: 16, fontWeight: "700", color: TEXT_GRAY_22 },
  companyName: { fontSize: 13, color: "#64748B", marginTop: 2, fontWeight: "500" },
  divider: { height: 1, backgroundColor: "#F1F5F9", marginBottom: 20 },
  sectionLabel: { fontSize: 15, fontWeight: "700", color: TEXT_GRAY_22, marginBottom: 4 },
  sectionSub: { fontSize: 12, color: "#64748B", marginBottom: 15 },
  uploadBox: { 
    backgroundColor: "#FFF", 
    borderRadius: 12, 
    borderWidth: 1.5, 
    borderColor: BORDER_BLUE_200, 
    borderStyle: "dashed", 
    padding: 25, 
    alignItems: "center", 
    justifyContent: "center", 
    minHeight: 110, 
    marginBottom: 30 
  },
  uploadBoxFilled: { 
    flexDirection: "row", 
    borderStyle: "solid", 
    borderColor: BLUE_ACCENT, 
    backgroundColor: "#F8FAFC", 
    minHeight: 70, 
    padding: 15 
  },
  uploadPlaceholder: { alignItems: "center" },
  uploadTitle: { fontSize: 14, fontWeight: "600", color: BLUE_ACCENT, marginTop: 8 },
  fileIconBox: { width: 40, height: 40, borderRadius: 8, backgroundColor: "#EFF6FF", justifyContent: "center", alignItems: "center", marginRight: 12 },
  fileInfo: { flex: 1 },
  fileName: { fontSize: 13, fontWeight: "700", color: TEXT_GRAY_22 },
  fileChange: { fontSize: 11, color: BLUE_ACCENT, marginTop: 2, fontWeight: "600" },
  submitBtn: { 
    flexDirection: "row", 
    alignItems: "center", 
    justifyContent: "center", 
    backgroundColor: BLUE_ACCENT, 
    height: 44, // Thin style
    borderRadius: 8, 
    gap: 8,
    borderWidth: 1,
    borderColor: BORDER_BLUE_200
  },
  submitBtnDisabled: { backgroundColor: "#94A3B8", borderColor: "#CBD5E1" },
  submitText: { color: "#FFF", fontSize: 15, fontWeight: "700" },
  footerNote: { fontSize: 11, color: "#94A3B8", textAlign: "center", marginTop: 15 },
});