// import React, { useState, useEffect } from "react";
// import {
//   View, Text, StyleSheet, TouchableOpacity, ScrollView,
//   TextInput, Modal, ActivityIndicator, Alert, Platform, StatusBar, Image,
// } from "react-native";
// import { Ionicons } from "@expo/vector-icons";
// import { router } from "expo-router";
// import * as ImagePicker from "expo-image-picker";
// import * as DocumentPicker from "expo-document-picker";
// import AsyncStorage from "@react-native-async-storage/async-storage";
// import axios from "axios";
// import API_BASE_URL from "../../config/api";

// import { useSafeAreaInsets, SafeAreaProvider } from "react-native-safe-area-context";

// const BLUE_ACCENT = "#1F4FA3";
// const TEXT_GRAY_22 = "#222222";
// const BORDER_BLUE_200 = "#BFDBFE";

// export default function StudentProfileWithSafeArea() {
//   return (
//     <SafeAreaProvider>
//       <StudentProfile />
//     </SafeAreaProvider>
//   );
// }

// function StudentProfile() {
//   const insets = useSafeAreaInsets(); 
//   const [loading, setLoading] = useState(true);
//   const [profile, setProfile] = useState<any>(null);
//   const [user, setUser] = useState<any>(null);
//   const [education, setEducation] = useState<any[]>([]);
//   const [experience, setExperience] = useState<any[]>([]);
//   const [skills, setSkills] = useState<any[]>([]);
//   const [showCam, setShowCam] = useState(false);

//   const [editModalVisible, setEditModalVisible] = useState(false);
//   const [activeField, setActiveField] = useState("");
//   const [tempValue, setTempValue] = useState("");

//   const [expModalVisible, setExpModalVisible] = useState(false);
//   const [expForm, setExpForm] = useState({ title: "", company: "", start_date: "", end_date: "", is_current: false, description: "" });

//   const [eduModalVisible, setEduModalVisible] = useState(false);
//   const [eduForm, setEduForm] = useState({ degree: "", field_of_study: "", institution: "", start_year: "", end_year: "", is_current: false });

//   const [skillModalVisible, setSkillModalVisible] = useState(false);
//   const [skillInput, setSkillInput] = useState("");

//   useEffect(() => { fetchProfile(); }, []);

//   const getHeaders = async () => {
//     const token = await AsyncStorage.getItem("token");
//     return { Authorization: `Bearer ${token}` };
//   };

//   const fetchProfile = async () => {
//     try {
//       const token = await AsyncStorage.getItem("token");
//       if (!token) { router.replace("/(auth)/login"); return; }
//       const res = await axios.get(`${API_BASE_URL}/student`, {
//         headers: { Authorization: `Bearer ${token}` },
//         timeout: 15000,
//       });
//       const data = res.data;
//       setUser({ name: data.full_name, email: data.email });
//       setProfile(data.profile);
//       setEducation(data.education || []);
//       setExperience(data.experience || []);
//       setSkills(data.skills || []);
//     } catch (err: any) {
//       if (err?.response?.status === 401) router.replace("/(auth)/login");
//     } finally {
//       setLoading(false);
//     }
//   };

//   const pickImage = async (type: "avatar" | "banner") => {
//     try {
//       const { status } = await ImagePicker.requestMediaLibraryPermissionsAsync();
//       if (status !== "granted") { Alert.alert("Permission denied"); return; }
//       const result = await ImagePicker.launchImageLibraryAsync({
//         mediaTypes: ImagePicker.MediaTypeOptions.Images,
//         allowsEditing: true,
//         aspect: type === "avatar" ? [1, 1] : [16, 9],
//         quality: 0.7,
//       });
//       if (!result.canceled) {
//         const token = await AsyncStorage.getItem("token");
//         const formData = new FormData();
//         const field = type === "avatar" ? "profileImage" : "bannerImage";
//         formData.append(field, {
//           uri: result.assets[0].uri,
//           name: `${field}_${Date.now()}.jpg`,
//           type: "image/jpeg",
//         } as any);
//         await axios.patch(`${API_BASE_URL}/student/media`, formData, {
//           headers: { Authorization: `Bearer ${token}`, "Content-Type": "multipart/form-data" },
//           timeout: 30000,
//         });
//         setShowCam(false);
//         fetchProfile();
//         Alert.alert("Success", "Image updated!");
//       }
//     } catch (err: any) {
//       Alert.alert("Error", "Failed to upload image");
//     }
//   };

//   const openEdit = (field: string, currentVal: string) => {
//     setActiveField(field);
//     setTempValue(currentVal || "");
//     setEditModalVisible(true);
//   };

//   const handleUpdate = async () => {
//     try {
//       const headers = await getHeaders();
//       await axios.put(`${API_BASE_URL}/student`, { [activeField]: tempValue }, { headers });
//       setEditModalVisible(false);
//       fetchProfile();
//       Alert.alert("Success", "Profile updated!");
//     } catch (err) {
//       Alert.alert("Error", "Update failed");
//     }
//   };

//   const handleAddExperience = async () => {
//     if (!expForm.title || !expForm.company) {
//       Alert.alert("Error", "Title and company are required");
//       return;
//     }
//     try {
//       const headers = await getHeaders();
//       await axios.post(`${API_BASE_URL}/student/experience`, expForm, { headers });
//       setExpModalVisible(false);
//       setExpForm({ title: "", company: "", start_date: "", end_date: "", is_current: false, description: "" });
//       fetchProfile();
//       Alert.alert("Success", "Experience added!");
//     } catch (err: any) {
//       Alert.alert("Error", err?.response?.data?.message || "Failed to add experience");
//     }
//   };

//   const handleDeleteExperience = (id: string) => {
//     Alert.alert("Delete", "Remove this experience?", [
//       { text: "Cancel", style: "cancel" },
//       {
//         text: "Delete", style: "destructive",
//         onPress: async () => {
//           try {
//             const headers = await getHeaders();
//             await axios.delete(`${API_BASE_URL}/student/experience/${id}`, { headers });
//             fetchProfile();
//           } catch (err) {
//             Alert.alert("Error", "Failed to delete");
//           }
//         },
//       },
//     ]);
//   };

//   const handleAddEducation = async () => {
//     if (!eduForm.degree || !eduForm.institution) {
//       Alert.alert("Error", "Degree and institution are required");
//       return;
//     }
//     try {
//       const headers = await getHeaders();
//       await axios.post(`${API_BASE_URL}/student/education`, eduForm, { headers });
//       setEduModalVisible(false);
//       setEduForm({ degree: "", field_of_study: "", institution: "", start_year: "", end_year: "", is_current: false });
//       fetchProfile();
//       Alert.alert("Success", "Education added!");
//     } catch (err: any) {
//       Alert.alert("Error", err?.response?.data?.message || "Failed to add education");
//     }
//   };

//   const handleDeleteEducation = (id: string) => {
//     Alert.alert("Delete", "Remove this education?", [
//       { text: "Cancel", style: "cancel" },
//       {
//         text: "Delete", style: "destructive",
//         onPress: async () => {
//           try {
//             const headers = await getHeaders();
//             await axios.delete(`${API_BASE_URL}/student/education/${id}`, { headers });
//             fetchProfile();
//           } catch (err) {
//             Alert.alert("Error", "Failed to delete");
//           }
//         },
//       },
//     ]);
//   };

//   const handleAddSkill = async () => {
//     if (!skillInput.trim()) { Alert.alert("Error", "Enter a skill"); return; }
//     try {
//       const headers = await getHeaders();
//       await axios.post(`${API_BASE_URL}/student/skills`, { skill_name: skillInput.trim() }, { headers });
//       setSkillModalVisible(false);
//       setSkillInput("");
//       fetchProfile();
//     } catch (err: any) {
//       Alert.alert("Error", err?.response?.data?.message || "Failed to add skill");
//     }
//   };

//   const handleDeleteSkill = (skillId: string) => {
//     Alert.alert("Delete", "Remove this skill?", [
//       { text: "Cancel", style: "cancel" },
//       {
//         text: "Delete", style: "destructive",
//         onPress: async () => {
//           try {
//             const headers = await getHeaders();
//             await axios.delete(`${API_BASE_URL}/student/skills/${skillId}`, { headers });
//             fetchProfile();
//           } catch (err) {
//             Alert.alert("Error", "Failed to delete skill");
//           }
//         },
//       },
//     ]);
//   };

//   const handleUploadResume = async () => {
//     try {
//       const result = await DocumentPicker.getDocumentAsync({ type: "application/pdf" });
//       if (!result.canceled) {
//         const token = await AsyncStorage.getItem("token");
//         const formData = new FormData();
//         formData.append("resume", {
//           uri: result.assets[0].uri,
//           name: result.assets[0].name,
//           type: "application/pdf",
//         } as any);
//         await axios.patch(`${API_BASE_URL}/student/resume`, formData, {
//           headers: { Authorization: `Bearer ${token}`, "Content-Type": "multipart/form-data" },
//           timeout: 30000,
//         });
//         fetchProfile();
//         Alert.alert("Success", "Resume uploaded!");
//       }
//     } catch (err: any) {
//       Alert.alert("Error", "Failed to upload resume");
//     }
//   };

//   const handleDeleteResume = () => {
//     Alert.alert("Delete Resume", "Remove your resume?", [
//       { text: "Cancel", style: "cancel" },
//       {
//         text: "Delete", style: "destructive",
//         onPress: async () => {
//           try {
//             const headers = await getHeaders();
//             await axios.delete(`${API_BASE_URL}/student/resume`, { headers });
//             fetchProfile();
//             Alert.alert("Success", "Resume removed!");
//           } catch (err) {
//             Alert.alert("Error", "Failed to delete resume");
//           }
//         },
//       },
//     ]);
//   };

//   if (loading) {
//     return (
//       <View style={{ flex: 1, justifyContent: "center", alignItems: "center", backgroundColor: "#FFF" }}>
//         <ActivityIndicator size="large" color={BLUE_ACCENT} />
//       </View>
//     );
//   }

//   return (
//     <View style={styles.mainContainer}>
//       <StatusBar barStyle="dark-content" backgroundColor="white" translucent={true} />

//       <View style={styles.header}>
//         <TouchableOpacity onPress={() => router.back()}>
//           <Ionicons name="arrow-back" size={22} color={TEXT_GRAY_22} />
//         </TouchableOpacity>
//         <Text style={styles.headerTitle}>Profile</Text>
//         <TouchableOpacity>
//           <Ionicons name="settings-outline" size={22} color={TEXT_GRAY_22} />
//         </TouchableOpacity>
//       </View>

//       <ScrollView 
//         contentContainerStyle={[styles.scrollContent, { paddingBottom: insets.bottom + 20 }]} 
//         showsVerticalScrollIndicator={false}
//       >
//         <View style={styles.bannerContainer}>
//           {profile?.banner_image_url ? (
//             <Image source={{ uri: profile.banner_image_url }} style={styles.bannerImage} />
//           ) : (
//             <View style={styles.darkBanner} />
//           )}
//           <TouchableOpacity style={styles.bannerCam} onPress={() => pickImage("banner")}>
//             <Ionicons name="camera" size={18} color="#FFF" />
//           </TouchableOpacity>
//         </View>

//         <View style={styles.avatarWrapper}>
//           <TouchableOpacity activeOpacity={0.9} onPress={() => setShowCam(!showCam)} style={styles.avatarCircle}>
//             {profile?.profile_image_url ? (
//               <Image source={{ uri: profile.profile_image_url }} style={styles.avatarImage} />
//             ) : (
//               <Text style={styles.avatarText}>{user?.name?.charAt(0)?.toUpperCase() || "S"}</Text>
//             )}
//             {showCam && (
//               <TouchableOpacity style={styles.camOverlay} onPress={() => pickImage("avatar")}>
//                 <Ionicons name="camera" size={28} color="#FFF" />
//               </TouchableOpacity>
//             )}
//           </TouchableOpacity>

//           <Text style={styles.userName}>{user?.name || "Your Name"}</Text>

//           <TouchableOpacity onPress={() => openEdit("headline", profile?.headline)} style={styles.headlineRow}>
//             <Text style={styles.headlineText}>{profile?.headline || "Add a headline"}</Text>
//             <Ionicons name="pencil" size={13} color={BLUE_ACCENT} />
//           </TouchableOpacity>

//           {(profile?.city || profile?.state) && (
//             <View style={styles.locationRow}>
//               <Ionicons name="location-outline" size={13} color="#64748B" />
//               <Text style={styles.locationText}>{[profile?.city, profile?.state].filter(Boolean).join(", ")}</Text>
//             </View>
//           )}
//         </View>

//         <View style={styles.divider} />

//         {/* About */}
//         <View style={styles.sectionContainer}>
//           <View style={styles.sectionHeader}>
//             <Text style={styles.sectionTitle}>About</Text>
//             <TouchableOpacity onPress={() => openEdit("bio", profile?.bio)}>
//               <Ionicons name="pencil-outline" size={18} color={BLUE_ACCENT} />
//             </TouchableOpacity>
//           </View>
//           <Text style={styles.sectionBodyLabel}>
//             {profile?.bio || "Add a bio to tell people about yourself"}
//           </Text>
//         </View>

//         <View style={styles.divider} />

//         {/* Experience */}
//         <View style={styles.sectionContainer}>
//           <View style={styles.sectionHeader}>
//             <Text style={styles.sectionTitle}>Experience</Text>
//             <TouchableOpacity onPress={() => setExpModalVisible(true)}>
//               <Ionicons name="add" size={24} color={BLUE_ACCENT} />
//             </TouchableOpacity>
//           </View>
//           {experience.length === 0 ? (
//             <Text style={styles.sectionBodyLabel}>No experience added yet</Text>
//           ) : (
//             experience.map((exp, i) => (
//               <View key={i} style={styles.itemCard}>
//                 <View style={styles.itemIconBox}>
//                   <Ionicons name="briefcase-outline" size={16} color={BLUE_ACCENT} />
//                 </View>
//                 <View style={styles.itemInfo}>
//                   <Text style={styles.itemTitle}>{exp.title}</Text>
//                   <Text style={styles.itemSub}>{exp.company}</Text>
//                   {exp.start_date && (
//                     <Text style={styles.itemDate}>
//                       {new Date(exp.start_date).getFullYear()} — {exp.is_current ? "Present" : exp.end_date ? new Date(exp.end_date).getFullYear() : ""}
//                     </Text>
//                   )}
//                 </View>
//                 <TouchableOpacity onPress={() => handleDeleteExperience(exp.id)}>
//                   <Ionicons name="trash-outline" size={18} color="#EF4444" />
//                 </TouchableOpacity>
//               </View>
//             ))
//           )}
//         </View>

//         <View style={styles.divider} />

//         {/* Education */}
//         <View style={styles.sectionContainer}>
//           <View style={styles.sectionHeader}>
//             <Text style={styles.sectionTitle}>Education</Text>
//             <TouchableOpacity onPress={() => setEduModalVisible(true)}>
//               <Ionicons name="add" size={24} color={BLUE_ACCENT} />
//             </TouchableOpacity>
//           </View>
//           {education.length === 0 ? (
//             <Text style={styles.sectionBodyLabel}>No education added yet</Text>
//           ) : (
//             education.map((edu, i) => (
//               <View key={i} style={styles.itemCard}>
//                 <View style={styles.itemIconBox}>
//                   <Ionicons name="school-outline" size={16} color={BLUE_ACCENT} />
//                 </View>
//                 <View style={styles.itemInfo}>
//                   <Text style={styles.itemTitle}>{edu.institution}</Text>
//                   <Text style={styles.itemSub}>{edu.degree}{edu.field_of_study ? `, ${edu.field_of_study}` : ""}</Text>
//                   {edu.start_year && (
//                     <Text style={styles.itemDate}>
//                       {edu.start_year} — {edu.is_current ? "Present" : edu.end_year || ""}
//                     </Text>
//                   )}
//                 </View>
//                 <TouchableOpacity onPress={() => handleDeleteEducation(edu.id)}>
//                   <Ionicons name="trash-outline" size={18} color="#EF4444" />
//                 </TouchableOpacity>
//               </View>
//             ))
//           )}
//         </View>

//         <View style={styles.divider} />

//         {/* Skills */}
//         <View style={styles.sectionContainer}>
//           <View style={styles.sectionHeader}>
//             <Text style={styles.sectionTitle}>Skills</Text>
//             <TouchableOpacity onPress={() => setSkillModalVisible(true)}>
//               <Ionicons name="add" size={24} color={BLUE_ACCENT} />
//             </TouchableOpacity>
//           </View>
//           {skills.length === 0 ? (
//             <Text style={styles.sectionBodyLabel}>No skills added yet</Text>
//           ) : (
//             <View style={styles.skillsRow}>
//               {skills.map((skill, i) => (
//                 <View key={i} style={styles.skillTag}>
//                   <Text style={styles.skillText}>{skill.skill_name}</Text>
//                   <TouchableOpacity onPress={() => handleDeleteSkill(skill.id)}>
//                     <Ionicons name="close" size={14} color={BLUE_ACCENT} />
//                   </TouchableOpacity>
//                 </View>
//               ))}
//             </View>
//           )}
//         </View>

//         <View style={styles.divider} />

//         {/* Resume */}
//         <View style={styles.sectionContainer}>
//           <View style={styles.sectionHeader}>
//             <Text style={styles.sectionTitle}>Resume</Text>
//           </View>
//           {profile?.resume_url ? (
//             <View>
//               <View style={styles.resumeCard}>
//                 <Ionicons name="document-text" size={24} color={BLUE_ACCENT} />
//                 <Text style={styles.resumeText}>Resume uploaded ✓</Text>
//                 <Ionicons name="checkmark-circle" size={20} color="#10B981" />
//               </View>
//               <View style={styles.resumeBtnRow}>
//                 <TouchableOpacity style={styles.resumeBtn} onPress={handleUploadResume}>
//                   <Ionicons name="refresh-outline" size={16} color={BLUE_ACCENT} />
//                   <Text style={styles.resumeBtnText}>Replace</Text>
//                 </TouchableOpacity>
//                 <TouchableOpacity style={[styles.resumeBtn, styles.resumeDeleteBtn]} onPress={handleDeleteResume}>
//                   <Ionicons name="trash-outline" size={16} color="#EF4444" />
//                   <Text style={[styles.resumeBtnText, { color: "#EF4444" }]}>Delete</Text>
//                 </TouchableOpacity>
//               </View>
//             </View>
//           ) : (
//             <TouchableOpacity style={styles.resumeDashedBox} onPress={handleUploadResume}>
//               <Ionicons name="cloud-upload-outline" size={28} color={BLUE_ACCENT} />
//               <Text style={styles.uploadMainText}>Upload your resume</Text>
//               <Text style={styles.uploadSubText}>PDF format recommended</Text>
//             </TouchableOpacity>
//           )}
//         </View>

        
//         <View style={{ height: insets.bottom }} />
//       </ScrollView>

//       {/* MODALS */}
//       {[
//         { visible: editModalVisible, setVisible: setEditModalVisible, title: `Update ${activeField}`, btn: "Save Changes", action: handleUpdate },
//         { visible: expModalVisible, setVisible: setExpModalVisible, title: "Add Experience", btn: "Add Experience", action: handleAddExperience },
//         { visible: eduModalVisible, setVisible: setEduModalVisible, title: "Add Education", btn: "Add Education", action: handleAddEducation },
//         { visible: skillModalVisible, setVisible: setSkillModalVisible, title: "Add Skill", btn: "Add Skill", action: handleAddSkill }
//       ].map((m, idx) => (
//         <Modal key={idx} visible={m.visible} transparent animationType="slide">
//           <View style={styles.modalOverlay}>
//             <View style={styles.modalContent}>
//               <Text style={styles.modalHeader}>{m.title}</Text>
//               {m.title.includes("Skill") ? (
//                 <TextInput style={styles.modalInput} placeholder="e.g. React Native" value={skillInput} onChangeText={setSkillInput} />
//               ) : m.title.includes("Experience") ? (
//                 <>
//                   <TextInput style={styles.modalInput} placeholder="Job Title *" value={expForm.title} onChangeText={(v) => setExpForm({ ...expForm, title: v })} />
//                   <TextInput style={styles.modalInput} placeholder="Company *" value={expForm.company} onChangeText={(v) => setExpForm({ ...expForm, company: v })} />
//                   <TextInput style={styles.modalInput} placeholder="Start Date (YYYY-MM-DD)" value={expForm.start_date} onChangeText={(v) => setExpForm({ ...expForm, start_date: v })} />
//                   <TextInput style={styles.modalInput} placeholder="End Date (YYYY-MM-DD)" value={expForm.end_date} onChangeText={(v) => setExpForm({ ...expForm, end_date: v })} />
//                 </>
//               ) : m.title.includes("Education") ? (
//                 <>
//                   <TextInput style={styles.modalInput} placeholder="Degree *" value={eduForm.degree} onChangeText={(v) => setEduForm({ ...eduForm, degree: v })} />
//                   <TextInput style={styles.modalInput} placeholder="Institution *" value={eduForm.institution} onChangeText={(v) => setEduForm({ ...eduForm, institution: v })} />
//                   <TextInput style={styles.modalInput} placeholder="Start Year" value={eduForm.start_year} onChangeText={(v) => setEduForm({ ...eduForm, start_year: v })} />
//                   <TextInput style={styles.modalInput} placeholder="End Year" value={eduForm.end_year} onChangeText={(v) => setEduForm({ ...eduForm, end_year: v })} />
//                 </>
//               ) : (
//                 <TextInput style={styles.modalInput} value={tempValue} onChangeText={setTempValue} multiline={activeField === "bio"} />
//               )}
//               <TouchableOpacity style={styles.saveBtn} onPress={m.action}>
//                 <Text style={styles.saveBtnText}>{m.btn}</Text>
//               </TouchableOpacity>
//               <TouchableOpacity onPress={() => m.setVisible(false)}>
//                 <Text style={styles.cancelText}>Cancel</Text>
//               </TouchableOpacity>
//             </View>
//           </View>
//         </Modal>
//       ))}
//     </View>
//   );
// }

// const styles = StyleSheet.create({
//   mainContainer: { flex: 1, backgroundColor: "#FFF" },
//   header: { 
//     flexDirection: "row", justifyContent: "space-between", alignItems: "center", 
//     paddingHorizontal: 22, paddingBottom: 12, paddingTop: Platform.OS === "android" ? (StatusBar.currentHeight || 0) + 10 : 50, 
//     backgroundColor: "#FFF", borderBottomWidth: 1, borderBottomColor: BORDER_BLUE_200 
//   },
//   headerTitle: { fontSize: 17, fontWeight: "700", color: TEXT_GRAY_22 },
//   scrollContent: { flexGrow: 1 },
//   bannerContainer: { width: "100%", height: 100 },
//   bannerImage: { width: "100%", height: 100 },
//   darkBanner: { height: 100, backgroundColor: "#1E293B" },
//   bannerCam: { position: "absolute", bottom: 10, right: 15, backgroundColor: "rgba(0,0,0,0.6)", padding: 7, borderRadius: 20 },
//   avatarWrapper: { alignItems: "center", marginTop: -50, marginBottom: 16 },
//   avatarCircle: { width: 100, height: 100, borderRadius: 50, backgroundColor: BLUE_ACCENT, justifyContent: "center", alignItems: "center", borderWidth: 4, borderColor: "#FFF", overflow: "hidden" },
//   avatarImage: { width: 100, height: 100, borderRadius: 50 },
//   camOverlay: { ...StyleSheet.absoluteFillObject, backgroundColor: "rgba(0,0,0,0.5)", justifyContent: "center", alignItems: "center" },
//   avatarText: { fontSize: 40, color: "#FFF", fontWeight: "bold" },
//   userName: { fontSize: 22, fontWeight: "700", marginTop: 10, color: TEXT_GRAY_22 },
//   headlineRow: { flexDirection: "row", alignItems: "center", gap: 6, marginTop: 6, paddingHorizontal: 30 },
//   headlineText: { color: "#64748B", fontSize: 13, textAlign: "center", fontWeight: "600" },
//   locationRow: { flexDirection: "row", alignItems: "center", gap: 4, marginTop: 6 },
//   locationText: { color: "#64748B", fontSize: 12, fontWeight: "500" },
//   divider: { height: 8, backgroundColor: "#F8FAFC", width: "100%" },
//   sectionContainer: { padding: 22 },
//   sectionHeader: { flexDirection: "row", justifyContent: "space-between", alignItems: "center", marginBottom: 15 },
//   sectionTitle: { fontSize: 17, fontWeight: "700", color: TEXT_GRAY_22 },
//   sectionBodyLabel: { color: "#64748B", fontSize: 13.5, lineHeight: 20, fontWeight: "500" },
//   itemCard: { flexDirection: "row", alignItems: "flex-start", gap: 12, marginBottom: 18 },
//   itemIconBox: { width: 40, height: 40, borderRadius: 8, backgroundColor: "#EFF6FF", justifyContent: "center", alignItems: "center", borderWidth: 1, borderColor: BORDER_BLUE_200 },
//   itemInfo: { flex: 1 },
//   itemTitle: { fontSize: 14.5, fontWeight: "700", color: TEXT_GRAY_22 },
//   itemSub: { fontSize: 13, color: "#64748B", marginTop: 2, fontWeight: "600" },
//   itemDate: { fontSize: 12, color: "#94A3B8", marginTop: 2, fontWeight: "500" },
//   skillsRow: { flexDirection: "row", flexWrap: "wrap", gap: 8 },
//   skillTag: { flexDirection: "row", alignItems: "center", gap: 6, backgroundColor: "#F8FAFC", paddingHorizontal: 14, paddingVertical: 7, borderRadius: 20, borderWidth: 1.2, borderColor: BORDER_BLUE_200 },
//   skillText: { fontSize: 13, color: BLUE_ACCENT, fontWeight: "700" },
//   resumeCard: { flexDirection: "row", alignItems: "center", gap: 12, backgroundColor: "#F8FAFC", padding: 14, borderRadius: 10, borderWidth: 1.2, borderColor: BORDER_BLUE_200 },
//   resumeText: { flex: 1, fontSize: 14, fontWeight: "700", color: TEXT_GRAY_22 },
//   resumeBtnRow: { flexDirection: "row", gap: 10, marginTop: 12 },
//   resumeBtn: { flex: 1, flexDirection: "row", alignItems: "center", justifyContent: "center", gap: 6, height: 40, borderRadius: 8, borderWidth: 1.2, borderColor: BORDER_BLUE_200, backgroundColor: "#FFF" },
//   resumeDeleteBtn: { borderColor: "#FEE2E2", backgroundColor: "#FFF5F5" },
//   resumeBtnText: { fontSize: 13, fontWeight: "700", color: BLUE_ACCENT },
//   resumeDashedBox: { borderStyle: "dashed", borderWidth: 1.5, borderColor: BORDER_BLUE_200, borderRadius: 12, padding: 25, alignItems: "center", marginTop: 10, backgroundColor: "#F8FAFC" },
//   uploadMainText: { color: BLUE_ACCENT, fontWeight: "700", fontSize: 14 },
//   uploadSubText: { color: "#94A3B8", fontSize: 12, fontWeight: "500" },
//   modalOverlay: { flex: 1, backgroundColor: "rgba(0,0,0,0.5)", justifyContent: "flex-end" },
//   modalContent: { backgroundColor: "#FFF", padding: 24, borderTopLeftRadius: 20, borderTopRightRadius: 20 },
//   modalHeader: { fontSize: 18, fontWeight: "700", marginBottom: 18, color: TEXT_GRAY_22 },
//   modalInput: { borderWidth: 1.2, borderColor: BORDER_BLUE_200, padding: 12, borderRadius: 8, marginBottom: 12, fontSize: 14, backgroundColor: "#F8FAFC", color: TEXT_GRAY_22 },
//   saveBtn: { backgroundColor: BLUE_ACCENT, height: 44, borderRadius: 8, alignItems: "center", justifyContent: "center", marginTop: 8 },
//   saveBtnText: { color: "#FFF", fontWeight: "700", fontSize: 15 },
//   cancelText: { textAlign: "center", marginTop: 16, color: "#64748B", fontSize: 14, fontWeight: "600" },
// });


import React, { useState, useEffect } from "react";
import {
  View, Text, StyleSheet, TouchableOpacity, ScrollView,
  TextInput, Modal, ActivityIndicator, Alert, Platform, StatusBar, Image,
} from "react-native";
import { Ionicons } from "@expo/vector-icons";
import { router } from "expo-router";
import * as ImagePicker from "expo-image-picker";
import * as DocumentPicker from "expo-document-picker";
import AsyncStorage from "@react-native-async-storage/async-storage";
import axios from "axios";
import API_BASE_URL from "../../config/api";

import { useSafeAreaInsets, SafeAreaProvider } from "react-native-safe-area-context";

const BLUE_ACCENT = "#1F4FA3";
const TEXT_GRAY_22 = "#222222";
const BORDER_BLUE_200 = "#BFDBFE";

export default function StudentProfileWithSafeArea() {
  return (
    <SafeAreaProvider>
      <StudentProfile />
    </SafeAreaProvider>
  );
}

function StudentProfile() {
  const insets = useSafeAreaInsets(); 
  const [loading, setLoading] = useState(true);
  const [profile, setProfile] = useState<any>(null);
  const [user, setUser] = useState<any>(null);
  const [education, setEducation] = useState<any[]>([]);
  const [experience, setExperience] = useState<any[]>([]);
  const [skills, setSkills] = useState<any[]>([]);
  const [showCam, setShowCam] = useState(false);

  const [editModalVisible, setEditModalVisible] = useState(false);
  const [activeField, setActiveField] = useState("");
  const [tempValue, setTempValue] = useState("");

  const [expModalVisible, setExpModalVisible] = useState(false);
  const [expForm, setExpForm] = useState({ title: "", company: "", start_date: "", end_date: "", is_current: false, description: "" });

  const [eduModalVisible, setEduModalVisible] = useState(false);
  const [eduForm, setEduForm] = useState({ degree: "", field_of_study: "", institution: "", start_year: "", end_year: "", is_current: false });

  const [skillModalVisible, setSkillModalVisible] = useState(false);
  const [skillInput, setSkillInput] = useState("");

  useEffect(() => { fetchProfile(); }, []);

  const getHeaders = async () => {
    const token = await AsyncStorage.getItem("token");
    return { Authorization: `Bearer ${token}` };
  };

  const fetchProfile = async () => {
    try {
      const token = await AsyncStorage.getItem("token");
      if (!token) { router.replace("/(auth)/login"); return; }
      const res = await axios.get(`${API_BASE_URL}/student`, {
        headers: { Authorization: `Bearer ${token}` },
        timeout: 15000,
      });
      const data = res.data;
      setUser({ name: data.full_name, email: data.email });
      setProfile(data.profile);
      setEducation(data.education || []);
      setExperience(data.experience || []);
      setSkills(data.skills || []);
    } catch (err: any) {
      if (err?.response?.status === 401) router.replace("/(auth)/login");
    } finally {
      setLoading(false);
    }
  };

  const pickImage = async (type: "avatar" | "banner") => {
    try {
      const { status } = await ImagePicker.requestMediaLibraryPermissionsAsync();
      if (status !== "granted") { Alert.alert("Permission denied"); return; }
      const result = await ImagePicker.launchImageLibraryAsync({
        mediaTypes: ImagePicker.MediaTypeOptions.Images,
        allowsEditing: true,
        aspect: type === "avatar" ? [1, 1] : [16, 9],
        quality: 0.7,
      });
      if (!result.canceled) {
        const token = await AsyncStorage.getItem("token");
        const formData = new FormData();
        const field = type === "avatar" ? "profileImage" : "bannerImage";
        formData.append(field, {
          uri: result.assets[0].uri,
          name: `${field}_${Date.now()}.jpg`,
          type: "image/jpeg",
        } as any);
        await axios.patch(`${API_BASE_URL}/student/media`, formData, {
          headers: { Authorization: `Bearer ${token}`, "Content-Type": "multipart/form-data" },
          timeout: 30000,
        });
        setShowCam(false);
        fetchProfile();
        Alert.alert("Success", "Image updated!");
      }
    } catch (err: any) {
      Alert.alert("Error", "Failed to upload image");
    }
  };

  const openEdit = (field: string, currentVal: string) => {
    setActiveField(field);
    setTempValue(currentVal || "");
    setEditModalVisible(true);
  };

  const handleUpdate = async () => {
    try {
      const headers = await getHeaders();
      await axios.put(`${API_BASE_URL}/student`, { [activeField]: tempValue }, { headers });
      setEditModalVisible(false);
      fetchProfile();
      Alert.alert("Success", "Profile updated!");
    } catch (err) {
      Alert.alert("Error", "Update failed");
    }
  };

  const handleAddExperience = async () => {
    if (!expForm.title || !expForm.company) {
      Alert.alert("Error", "Title and company are required");
      return;
    }
    try {
      const headers = await getHeaders();
      await axios.post(`${API_BASE_URL}/student/experience`, expForm, { headers });
      setExpModalVisible(false);
      setExpForm({ title: "", company: "", start_date: "", end_date: "", is_current: false, description: "" });
      fetchProfile();
      Alert.alert("Success", "Experience added!");
    } catch (err: any) {
      Alert.alert("Error", err?.response?.data?.message || "Failed to add experience");
    }
  };

  const handleDeleteExperience = (id: string) => {
    Alert.alert("Delete", "Remove this experience?", [
      { text: "Cancel", style: "cancel" },
      {
        text: "Delete", style: "destructive",
        onPress: async () => {
          try {
            const headers = await getHeaders();
            await axios.delete(`${API_BASE_URL}/student/experience/${id}`, { headers });
            fetchProfile();
          } catch (err) {
            Alert.alert("Error", "Failed to delete");
          }
        },
      },
    ]);
  };

  const handleAddEducation = async () => {
    if (!eduForm.degree || !eduForm.institution) {
      Alert.alert("Error", "Degree and institution are required");
      return;
    }
    try {
      const headers = await getHeaders();
      await axios.post(`${API_BASE_URL}/student/education`, eduForm, { headers });
      setEduModalVisible(false);
      setEduForm({ degree: "", field_of_study: "", institution: "", start_year: "", end_year: "", is_current: false });
      fetchProfile();
      Alert.alert("Success", "Education added!");
    } catch (err: any) {
      Alert.alert("Error", err?.response?.data?.message || "Failed to add education");
    }
  };

  const handleDeleteEducation = (id: string) => {
    Alert.alert("Delete", "Remove this education?", [
      { text: "Cancel", style: "cancel" },
      {
        text: "Delete", style: "destructive",
        onPress: async () => {
          try {
            const headers = await getHeaders();
            await axios.delete(`${API_BASE_URL}/student/education/${id}`, { headers });
            fetchProfile();
          } catch (err) {
            Alert.alert("Error", "Failed to delete");
          }
        },
      },
    ]);
  };

  const handleAddSkill = async () => {
    if (!skillInput.trim()) { Alert.alert("Error", "Enter a skill"); return; }
    try {
      const headers = await getHeaders();
      await axios.post(`${API_BASE_URL}/student/skills`, { skill_name: skillInput.trim() }, { headers });
      setSkillModalVisible(false);
      setSkillInput("");
      fetchProfile();
    } catch (err: any) {
      Alert.alert("Error", err?.response?.data?.message || "Failed to add skill");
    }
  };

  const handleDeleteSkill = (skillId: string) => {
    Alert.alert("Delete", "Remove this skill?", [
      { text: "Cancel", style: "cancel" },
      {
        text: "Delete", style: "destructive",
        onPress: async () => {
          try {
            const headers = await getHeaders();
            await axios.delete(`${API_BASE_URL}/student/skills/${skillId}`, { headers });
            fetchProfile();
          } catch (err) {
            Alert.alert("Error", "Failed to delete skill");
          }
        },
      },
    ]);
  };

  const handleUploadResume = async () => {
    try {
      const result = await DocumentPicker.getDocumentAsync({ type: "application/pdf" });
      if (!result.canceled) {
        const token = await AsyncStorage.getItem("token");
        const formData = new FormData();
        formData.append("resume", {
          uri: result.assets[0].uri,
          name: result.assets[0].name,
          type: "application/pdf",
        } as any);
        await axios.patch(`${API_BASE_URL}/student/resume`, formData, {
          headers: { Authorization: `Bearer ${token}`, "Content-Type": "multipart/form-data" },
          timeout: 30000,
        });
        fetchProfile();
        Alert.alert("Success", "Resume uploaded!");
      }
    } catch (err: any) {
      Alert.alert("Error", "Failed to upload resume");
    }
  };

  const handleDeleteResume = () => {
    Alert.alert("Delete Resume", "Remove your resume?", [
      { text: "Cancel", style: "cancel" },
      {
        text: "Delete", style: "destructive",
        onPress: async () => {
          try {
            const headers = await getHeaders();
            await axios.delete(`${API_BASE_URL}/student/resume`, { headers });
            fetchProfile();
            Alert.alert("Success", "Resume removed!");
          } catch (err) {
            Alert.alert("Error", "Failed to delete resume");
          }
        },
      },
    ]);
  };

  if (loading) {
    return (
      <View style={{ flex: 1, justifyContent: "center", alignItems: "center", backgroundColor: "#FFF" }}>
        <ActivityIndicator size="large" color={BLUE_ACCENT} />
      </View>
    );
  }

  // Helper to check if resume exists and is not just an empty string
  const hasResume = profile?.resume_url && profile.resume_url.trim() !== "" && profile.resume_url !== "empty";

  return (
    <View style={styles.mainContainer}>
      <StatusBar barStyle="dark-content" backgroundColor="white" translucent={true} />

      <View style={styles.header}>
        <TouchableOpacity onPress={() => router.back()}>
          <Ionicons name="arrow-back" size={22} color={TEXT_GRAY_22} />
        </TouchableOpacity>
        <Text style={styles.headerTitle}>Profile</Text>
        <TouchableOpacity>
          <Ionicons name="settings-outline" size={22} color={TEXT_GRAY_22} />
        </TouchableOpacity>
      </View>

      <ScrollView 
        contentContainerStyle={[styles.scrollContent, { paddingBottom: insets.bottom + 20 }]} 
        showsVerticalScrollIndicator={false}
      >
        <View style={styles.bannerContainer}>
          {profile?.banner_image_url ? (
            <Image source={{ uri: profile.banner_image_url }} style={styles.bannerImage} />
          ) : (
            <View style={styles.darkBanner} />
          )}
          <TouchableOpacity style={styles.bannerCam} onPress={() => pickImage("banner")}>
            <Ionicons name="camera" size={18} color="#FFF" />
          </TouchableOpacity>
        </View>

        <View style={styles.avatarWrapper}>
          <TouchableOpacity activeOpacity={0.9} onPress={() => setShowCam(!showCam)} style={styles.avatarCircle}>
            {profile?.profile_image_url ? (
              <Image source={{ uri: profile.profile_image_url }} style={styles.avatarImage} />
            ) : (
              <Text style={styles.avatarText}>{user?.name?.charAt(0)?.toUpperCase() || "S"}</Text>
            )}
            {showCam && (
              <TouchableOpacity style={styles.camOverlay} onPress={() => pickImage("avatar")}>
                <Ionicons name="camera" size={28} color="#FFF" />
              </TouchableOpacity>
            )}
          </TouchableOpacity>

          <Text style={styles.userName}>{user?.name || "Your Name"}</Text>

          <TouchableOpacity onPress={() => openEdit("headline", profile?.headline)} style={styles.headlineRow}>
            <Text style={styles.headlineText}>{profile?.headline || "Add a headline"}</Text>
            <Ionicons name="pencil" size={13} color={BLUE_ACCENT} />
          </TouchableOpacity>

          {(profile?.city || profile?.state) && (
            <View style={styles.locationRow}>
              <Ionicons name="location-outline" size={13} color="#64748B" />
              <Text style={styles.locationText}>{[profile?.city, profile?.state].filter(Boolean).join(", ")}</Text>
            </View>
          )}
        </View>

        <View style={styles.divider} />

        {/* About */}
        <View style={styles.sectionContainer}>
          <View style={styles.sectionHeader}>
            <Text style={styles.sectionTitle}>About</Text>
            <TouchableOpacity onPress={() => openEdit("bio", profile?.bio)}>
              <Ionicons name="pencil-outline" size={18} color={BLUE_ACCENT} />
            </TouchableOpacity>
          </View>
          <Text style={styles.sectionBodyLabel}>
            {profile?.bio || "Add a bio to tell people about yourself"}
          </Text>
        </View>

        <View style={styles.divider} />

        {/* Experience */}
        <View style={styles.sectionContainer}>
          <View style={styles.sectionHeader}>
            <Text style={styles.sectionTitle}>Experience</Text>
            <TouchableOpacity onPress={() => setExpModalVisible(true)}>
              <Ionicons name="add" size={24} color={BLUE_ACCENT} />
            </TouchableOpacity>
          </View>
          {experience.length === 0 ? (
            <Text style={styles.sectionBodyLabel}>No experience added yet</Text>
          ) : (
            experience.map((exp, i) => (
              <View key={i} style={styles.itemCard}>
                <View style={styles.itemIconBox}>
                  <Ionicons name="briefcase-outline" size={16} color={BLUE_ACCENT} />
                </View>
                <View style={styles.itemInfo}>
                  <Text style={styles.itemTitle}>{exp.title}</Text>
                  <Text style={styles.itemSub}>{exp.company}</Text>
                  {exp.start_date && (
                    <Text style={styles.itemDate}>
                      {new Date(exp.start_date).getFullYear()} — {exp.is_current ? "Present" : exp.end_date ? new Date(exp.end_date).getFullYear() : ""}
                    </Text>
                  )}
                </View>
                <TouchableOpacity onPress={() => handleDeleteExperience(exp.id)}>
                  <Ionicons name="trash-outline" size={18} color="#EF4444" />
                </TouchableOpacity>
              </View>
            ))
          )}
        </View>

        <View style={styles.divider} />

        {/* Education */}
        <View style={styles.sectionContainer}>
          <View style={styles.sectionHeader}>
            <Text style={styles.sectionTitle}>Education</Text>
            <TouchableOpacity onPress={() => setEduModalVisible(true)}>
              <Ionicons name="add" size={24} color={BLUE_ACCENT} />
            </TouchableOpacity>
          </View>
          {education.length === 0 ? (
            <Text style={styles.sectionBodyLabel}>No education added yet</Text>
          ) : (
            education.map((edu, i) => (
              <View key={i} style={styles.itemCard}>
                <View style={styles.itemIconBox}>
                  <Ionicons name="school-outline" size={16} color={BLUE_ACCENT} />
                </View>
                <View style={styles.itemInfo}>
                  <Text style={styles.itemTitle}>{edu.institution}</Text>
                  <Text style={styles.itemSub}>{edu.degree}{edu.field_of_study ? `, ${edu.field_of_study}` : ""}</Text>
                  {edu.start_year && (
                    <Text style={styles.itemDate}>
                      {edu.start_year} — {edu.is_current ? "Present" : edu.end_year || ""}
                    </Text>
                  )}
                </View>
                <TouchableOpacity onPress={() => handleDeleteEducation(edu.id)}>
                  <Ionicons name="trash-outline" size={18} color="#EF4444" />
                </TouchableOpacity>
              </View>
            ))
          )}
        </View>

        <View style={styles.divider} />

        {/* Skills */}
        <View style={styles.sectionContainer}>
          <View style={styles.sectionHeader}>
            <Text style={styles.sectionTitle}>Skills</Text>
            <TouchableOpacity onPress={() => setSkillModalVisible(true)}>
              <Ionicons name="add" size={24} color={BLUE_ACCENT} />
            </TouchableOpacity>
          </View>
          {skills.length === 0 ? (
            <Text style={styles.sectionBodyLabel}>No skills added yet</Text>
          ) : (
            <View style={styles.skillsRow}>
              {skills.map((skill, i) => (
                <View key={i} style={styles.skillTag}>
                  <Text style={styles.skillText}>{skill.skill_name}</Text>
                  <TouchableOpacity onPress={() => handleDeleteSkill(skill.id)}>
                    <Ionicons name="close" size={14} color={BLUE_ACCENT} />
                  </TouchableOpacity>
                </View>
              ))}
            </View>
          )}
        </View>

        <View style={styles.divider} />

        {/* Resume */}
        <View style={styles.sectionContainer}>
          <View style={styles.sectionHeader}>
            <Text style={styles.sectionTitle}>Resume</Text>
          </View>
          
          {hasResume ? (
            <View>
              <View style={styles.resumeCard}>
                <Ionicons name="document-text" size={24} color={BLUE_ACCENT} />
                <Text style={styles.resumeText}>Resume uploaded ✓</Text>
                <Ionicons name="checkmark-circle" size={20} color="#10B981" />
              </View>
              <View style={styles.resumeBtnRow}>
                <TouchableOpacity style={styles.resumeBtn} onPress={handleUploadResume}>
                  <Ionicons name="refresh-outline" size={16} color={BLUE_ACCENT} />
                  <Text style={styles.resumeBtnText}>Replace</Text>
                </TouchableOpacity>
                <TouchableOpacity style={[styles.resumeBtn, styles.resumeDeleteBtn]} onPress={handleDeleteResume}>
                  <Ionicons name="trash-outline" size={16} color="#EF4444" />
                  <Text style={[styles.resumeBtnText, { color: "#EF4444" }]}>Delete</Text>
                </TouchableOpacity>
              </View>
            </View>
          ) : (
            <TouchableOpacity style={styles.resumeDashedBox} onPress={handleUploadResume}>
              <Ionicons name="cloud-upload-outline" size={28} color={BLUE_ACCENT} />
              <Text style={styles.uploadMainText}>Upload your resume</Text>
              <Text style={styles.uploadSubText}>PDF format recommended</Text>
            </TouchableOpacity>
          )}
        </View>
        
        <View style={{ height: insets.bottom }} />
      </ScrollView>

      {/* MODALS */}
      {[
        { visible: editModalVisible, setVisible: setEditModalVisible, title: `Update ${activeField}`, btn: "Save Changes", action: handleUpdate },
        { visible: expModalVisible, setVisible: setExpModalVisible, title: "Add Experience", btn: "Add Experience", action: handleAddExperience },
        { visible: eduModalVisible, setVisible: setEduModalVisible, title: "Add Education", btn: "Add Education", action: handleAddEducation },
        { visible: skillModalVisible, setVisible: setSkillModalVisible, title: "Add Skill", btn: "Add Skill", action: handleAddSkill }
      ].map((m, idx) => (
        <Modal key={idx} visible={m.visible} transparent animationType="slide">
          <View style={styles.modalOverlay}>
            <View style={styles.modalContent}>
              <Text style={styles.modalHeader}>{m.title}</Text>
              {m.title.includes("Skill") ? (
                <TextInput style={styles.modalInput} placeholder="e.g. React Native" value={skillInput} onChangeText={setSkillInput} />
              ) : m.title.includes("Experience") ? (
                <>
                  <TextInput style={styles.modalInput} placeholder="Job Title *" value={expForm.title} onChangeText={(v) => setExpForm({ ...expForm, title: v })} />
                  <TextInput style={styles.modalInput} placeholder="Company *" value={expForm.company} onChangeText={(v) => setExpForm({ ...expForm, company: v })} />
                  <TextInput style={styles.modalInput} placeholder="Start Date (YYYY-MM-DD)" value={expForm.start_date} onChangeText={(v) => setExpForm({ ...expForm, start_date: v })} />
                  <TextInput style={styles.modalInput} placeholder="End Date (YYYY-MM-DD)" value={expForm.end_date} onChangeText={(v) => setExpForm({ ...expForm, end_date: v })} />
                </>
              ) : m.title.includes("Education") ? (
                <>
                  <TextInput style={styles.modalInput} placeholder="Degree *" value={eduForm.degree} onChangeText={(v) => setEduForm({ ...eduForm, degree: v })} />
                  <TextInput style={styles.modalInput} placeholder="Institution *" value={eduForm.institution} onChangeText={(v) => setEduForm({ ...eduForm, institution: v })} />
                  <TextInput style={styles.modalInput} placeholder="Start Year" value={eduForm.start_year} onChangeText={(v) => setEduForm({ ...eduForm, start_year: v })} />
                  <TextInput style={styles.modalInput} placeholder="End Year" value={eduForm.end_year} onChangeText={(v) => setEduForm({ ...eduForm, end_year: v })} />
                </>
              ) : (
                <TextInput style={styles.modalInput} value={tempValue} onChangeText={setTempValue} multiline={activeField === "bio"} />
              )}
              <TouchableOpacity style={styles.saveBtn} onPress={m.action}>
                <Text style={styles.saveBtnText}>{m.btn}</Text>
              </TouchableOpacity>
              <TouchableOpacity onPress={() => m.setVisible(false)}>
                <Text style={styles.cancelText}>Cancel</Text>
              </TouchableOpacity>
            </View>
          </View>
        </Modal>
      ))}
    </View>
  );
}

const styles = StyleSheet.create({
  mainContainer: { flex: 1, backgroundColor: "#FFF" },
  header: { 
    flexDirection: "row", justifyContent: "space-between", alignItems: "center", 
    paddingHorizontal: 22, paddingBottom: 12, paddingTop: Platform.OS === "android" ? (StatusBar.currentHeight || 0) + 10 : 50, 
    backgroundColor: "#FFF", borderBottomWidth: 1, borderBottomColor: BORDER_BLUE_200 
  },
  headerTitle: { fontSize: 17, fontWeight: "700", color: TEXT_GRAY_22 },
  scrollContent: { flexGrow: 1 },
  bannerContainer: { width: "100%", height: 100 },
  bannerImage: { width: "100%", height: 100 },
  darkBanner: { height: 100, backgroundColor: "#1E293B" },
  bannerCam: { position: "absolute", bottom: 10, right: 15, backgroundColor: "rgba(0,0,0,0.6)", padding: 7, borderRadius: 20 },
  avatarWrapper: { alignItems: "center", marginTop: -50, marginBottom: 16 },
  avatarCircle: { width: 100, height: 100, borderRadius: 50, backgroundColor: BLUE_ACCENT, justifyContent: "center", alignItems: "center", borderWidth: 4, borderColor: "#FFF", overflow: "hidden" },
  avatarImage: { width: 100, height: 100, borderRadius: 50 },
  camOverlay: { ...StyleSheet.absoluteFillObject, backgroundColor: "rgba(0,0,0,0.5)", justifyContent: "center", alignItems: "center" },
  avatarText: { fontSize: 40, color: "#FFF", fontWeight: "bold" },
  userName: { fontSize: 22, fontWeight: "700", marginTop: 10, color: TEXT_GRAY_22 },
  headlineRow: { flexDirection: "row", alignItems: "center", gap: 6, marginTop: 6, paddingHorizontal: 30 },
  headlineText: { color: "#64748B", fontSize: 13, textAlign: "center", fontWeight: "600" },
  locationRow: { flexDirection: "row", alignItems: "center", gap: 4, marginTop: 6 },
  locationText: { color: "#64748B", fontSize: 12, fontWeight: "500" },
  divider: { height: 8, backgroundColor: "#F8FAFC", width: "100%" },
  sectionContainer: { padding: 22 },
  sectionHeader: { flexDirection: "row", justifyContent: "space-between", alignItems: "center", marginBottom: 15 },
  sectionTitle: { fontSize: 17, fontWeight: "700", color: TEXT_GRAY_22 },
  sectionBodyLabel: { color: "#64748B", fontSize: 13.5, lineHeight: 20, fontWeight: "500" },
  itemCard: { flexDirection: "row", alignItems: "flex-start", gap: 12, marginBottom: 18 },
  itemIconBox: { width: 40, height: 40, borderRadius: 8, backgroundColor: "#EFF6FF", justifyContent: "center", alignItems: "center", borderWidth: 1, borderColor: BORDER_BLUE_200 },
  itemInfo: { flex: 1 },
  itemTitle: { fontSize: 14.5, fontWeight: "700", color: TEXT_GRAY_22 },
  itemSub: { fontSize: 13, color: "#64748B", marginTop: 2, fontWeight: "600" },
  itemDate: { fontSize: 12, color: "#94A3B8", marginTop: 2, fontWeight: "500" },
  skillsRow: { flexDirection: "row", flexWrap: "wrap", gap: 8 },
  skillTag: { flexDirection: "row", alignItems: "center", gap: 6, backgroundColor: "#F8FAFC", paddingHorizontal: 14, paddingVertical: 7, borderRadius: 20, borderWidth: 1.2, borderColor: BORDER_BLUE_200 },
  skillText: { fontSize: 13, color: BLUE_ACCENT, fontWeight: "700" },
  resumeCard: { flexDirection: "row", alignItems: "center", gap: 12, backgroundColor: "#F8FAFC", padding: 14, borderRadius: 10, borderWidth: 1.2, borderColor: BORDER_BLUE_200 },
  resumeText: { flex: 1, fontSize: 14, fontWeight: "700", color: TEXT_GRAY_22 },
  resumeBtnRow: { flexDirection: "row", gap: 10, marginTop: 12 },
  resumeBtn: { flex: 1, flexDirection: "row", alignItems: "center", justifyContent: "center", gap: 6, height: 40, borderRadius: 8, borderWidth: 1.2, borderColor: BORDER_BLUE_200, backgroundColor: "#FFF" },
  resumeDeleteBtn: { borderColor: "#FEE2E2", backgroundColor: "#FFF5F5" },
  resumeBtnText: { fontSize: 13, fontWeight: "700", color: BLUE_ACCENT },
  resumeDashedBox: { borderStyle: "dashed", borderWidth: 1.5, borderColor: BORDER_BLUE_200, borderRadius: 12, padding: 25, alignItems: "center", marginTop: 10, backgroundColor: "#F8FAFC" },
  uploadMainText: { color: BLUE_ACCENT, fontWeight: "700", fontSize: 14 },
  uploadSubText: { color: "#94A3B8", fontSize: 12, fontWeight: "500" },
  modalOverlay: { flex: 1, backgroundColor: "rgba(0,0,0,0.5)", justifyContent: "flex-end" },
  modalContent: { backgroundColor: "#FFF", padding: 24, borderTopLeftRadius: 20, borderTopRightRadius: 20 },
  modalHeader: { fontSize: 18, fontWeight: "700", marginBottom: 18, color: TEXT_GRAY_22 },
  modalInput: { borderWidth: 1.2, borderColor: BORDER_BLUE_200, padding: 12, borderRadius: 8, marginBottom: 12, fontSize: 14, backgroundColor: "#F8FAFC", color: TEXT_GRAY_22 },
  saveBtn: { backgroundColor: BLUE_ACCENT, height: 44, borderRadius: 8, alignItems: "center", justifyContent: "center", marginTop: 8 },
  saveBtnText: { color: "#FFF", fontWeight: "700", fontSize: 15 },
  cancelText: { textAlign: "center", marginTop: 16, color: "#64748B", fontSize: 14, fontWeight: "600" },
});