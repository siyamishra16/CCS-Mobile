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

export default function StudentProfile() {
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
      console.log("FETCH ERROR:", err?.response?.status, err?.message);
      if (err?.response?.status === 401) router.replace("/(auth)/login");
    } finally {
      setLoading(false);
    }
  };

  // ─── PROFILE PICTURE 
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
      console.log("IMAGE ERROR:", err?.response?.data || err?.message);
      Alert.alert("Error", "Failed to upload image");
    }
  };

  // ─── BIO / HEADLINE ────────────────────────────────────────────
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

  // ─── EXPERIENCE ────────────────────────────────────────────────
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
      console.log("EXP ERROR:", err?.response?.data, err?.response?.status);
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

  // ─── EDUCATION ─────────────────────────────────────────────────
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
      console.log("EDU ERROR:", err?.response?.data, err?.response?.status);
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

  // ─── SKILLS ────────────────────────────────────────────────────
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

  // ─── RESUME ────────────────────────────────────────────────────
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
      console.log("RESUME ERROR:", err?.response?.data || err?.message);
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
      <View style={{ flex: 1, justifyContent: "center", alignItems: "center" }}>
        <ActivityIndicator size="large" color="#0A66C2" />
      </View>
    );
  }

  return (
    <View style={styles.mainContainer}>
      <StatusBar barStyle="dark-content" backgroundColor="white" translucent={true} />

      <View style={styles.header}>
        <TouchableOpacity onPress={() => router.back()}>
          <Ionicons name="arrow-back" size={22} color="#333" />
        </TouchableOpacity>
        <Text style={styles.headerTitle}>Profile</Text>
        <TouchableOpacity>
          <Ionicons name="settings-outline" size={22} color="#333" />
        </TouchableOpacity>
      </View>

      <ScrollView contentContainerStyle={styles.scrollContent} showsVerticalScrollIndicator={false}>

        {/* Banner */}
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

        {/* Avatar */}
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
            <Ionicons name="pencil" size={13} color="#0A66C2" />
          </TouchableOpacity>

          {(profile?.city || profile?.state) && (
            <View style={styles.locationRow}>
              <Ionicons name="location-outline" size={13} color="#888" />
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
              <Ionicons name="pencil-outline" size={18} color="#0A66C2" />
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
              <Ionicons name="add" size={24} color="#0A66C2" />
            </TouchableOpacity>
          </View>
          {experience.length === 0 ? (
            <Text style={styles.sectionBodyLabel}>No experience added yet</Text>
          ) : (
            experience.map((exp, i) => (
              <View key={i} style={styles.itemCard}>
                <View style={styles.itemIconBox}>
                  <Ionicons name="briefcase-outline" size={16} color="#0A66C2" />
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
              <Ionicons name="add" size={24} color="#0A66C2" />
            </TouchableOpacity>
          </View>
          {education.length === 0 ? (
            <Text style={styles.sectionBodyLabel}>No education added yet</Text>
          ) : (
            education.map((edu, i) => (
              <View key={i} style={styles.itemCard}>
                <View style={styles.itemIconBox}>
                  <Ionicons name="school-outline" size={16} color="#0A66C2" />
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
              <Ionicons name="add" size={24} color="#0A66C2" />
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
                    <Ionicons name="close" size={14} color="#0A66C2" />
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
          {profile?.resume_url ? (
            <View>
              <View style={styles.resumeCard}>
                <Ionicons name="document-text" size={24} color="#0A66C2" />
                <Text style={styles.resumeText}>Resume uploaded ✓</Text>
                <Ionicons name="checkmark-circle" size={20} color="#10B981" />
              </View>
              <View style={styles.resumeBtnRow}>
                <TouchableOpacity style={styles.resumeBtn} onPress={handleUploadResume}>
                  <Ionicons name="refresh-outline" size={16} color="#0A66C2" />
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
              <Ionicons name="cloud-upload-outline" size={28} color="#0A66C2" />
              <Text style={styles.uploadMainText}>Upload your resume</Text>
              <Text style={styles.uploadSubText}>PDF format recommended</Text>
            </TouchableOpacity>
          )}
        </View>

        <View style={{ height: 100 }} />
      </ScrollView>

      {/* EDIT MODAL */}
      <Modal visible={editModalVisible} transparent animationType="slide">
        <View style={styles.modalOverlay}>
          <View style={styles.modalContent}>
            <Text style={styles.modalHeader}>
              Update {activeField.charAt(0).toUpperCase() + activeField.slice(1)}
            </Text>
            <TextInput style={styles.modalInput} value={tempValue} onChangeText={setTempValue} multiline={activeField === "bio"} placeholder={`Enter your ${activeField}`} />
            <TouchableOpacity style={styles.saveBtn} onPress={handleUpdate}>
              <Text style={styles.saveBtnText}>Save Changes</Text>
            </TouchableOpacity>
            <TouchableOpacity onPress={() => setEditModalVisible(false)}>
              <Text style={styles.cancelText}>Cancel</Text>
            </TouchableOpacity>
          </View>
        </View>
      </Modal>

      {/* ADD EXPERIENCE MODAL */}
      <Modal visible={expModalVisible} transparent animationType="slide">
        <View style={styles.modalOverlay}>
          <View style={styles.modalContent}>
            <Text style={styles.modalHeader}>Add Experience</Text>
            <TextInput style={styles.modalInput} placeholder="Job Title *" value={expForm.title} onChangeText={(v) => setExpForm({ ...expForm, title: v })} />
            <TextInput style={styles.modalInput} placeholder="Company *" value={expForm.company} onChangeText={(v) => setExpForm({ ...expForm, company: v })} />
            <TextInput style={styles.modalInput} placeholder="Start Date (YYYY-MM-DD)" value={expForm.start_date} onChangeText={(v) => setExpForm({ ...expForm, start_date: v })} />
            <TextInput style={styles.modalInput} placeholder="End Date (YYYY-MM-DD)" value={expForm.end_date} onChangeText={(v) => setExpForm({ ...expForm, end_date: v })} />
            <TextInput style={[styles.modalInput, { minHeight: 60 }]} placeholder="Description" value={expForm.description} onChangeText={(v) => setExpForm({ ...expForm, description: v })} multiline />
            <TouchableOpacity style={styles.saveBtn} onPress={handleAddExperience}>
              <Text style={styles.saveBtnText}>Add Experience</Text>
            </TouchableOpacity>
            <TouchableOpacity onPress={() => setExpModalVisible(false)}>
              <Text style={styles.cancelText}>Cancel</Text>
            </TouchableOpacity>
          </View>
        </View>
      </Modal>

      {/* ADD EDUCATION MODAL */}
      <Modal visible={eduModalVisible} transparent animationType="slide">
        <View style={styles.modalOverlay}>
          <View style={styles.modalContent}>
            <Text style={styles.modalHeader}>Add Education</Text>
            <TextInput style={styles.modalInput} placeholder="Degree *" value={eduForm.degree} onChangeText={(v) => setEduForm({ ...eduForm, degree: v })} />
            <TextInput style={styles.modalInput} placeholder="Institution *" value={eduForm.institution} onChangeText={(v) => setEduForm({ ...eduForm, institution: v })} />
            <TextInput style={styles.modalInput} placeholder="Field of Study" value={eduForm.field_of_study} onChangeText={(v) => setEduForm({ ...eduForm, field_of_study: v })} />
            <TextInput style={styles.modalInput} placeholder="Start Year (e.g. 2020)" value={eduForm.start_year} onChangeText={(v) => setEduForm({ ...eduForm, start_year: v })} keyboardType="numeric" />
            <TextInput style={styles.modalInput} placeholder="End Year (e.g. 2024)" value={eduForm.end_year} onChangeText={(v) => setEduForm({ ...eduForm, end_year: v })} keyboardType="numeric" />
            <TouchableOpacity style={styles.saveBtn} onPress={handleAddEducation}>
              <Text style={styles.saveBtnText}>Add Education</Text>
            </TouchableOpacity>
            <TouchableOpacity onPress={() => setEduModalVisible(false)}>
              <Text style={styles.cancelText}>Cancel</Text>
            </TouchableOpacity>
          </View>
        </View>
      </Modal>

      {/* ADD SKILL MODAL */}
      <Modal visible={skillModalVisible} transparent animationType="slide">
        <View style={styles.modalOverlay}>
          <View style={styles.modalContent}>
            <Text style={styles.modalHeader}>Add Skill</Text>
            <TextInput style={styles.modalInput} placeholder="e.g. React Native, Python..." value={skillInput} onChangeText={setSkillInput} />
            <TouchableOpacity style={styles.saveBtn} onPress={handleAddSkill}>
              <Text style={styles.saveBtnText}>Add Skill</Text>
            </TouchableOpacity>
            <TouchableOpacity onPress={() => setSkillModalVisible(false)}>
              <Text style={styles.cancelText}>Cancel</Text>
            </TouchableOpacity>
          </View>
        </View>
      </Modal>

    </View>
  );
}

const styles = StyleSheet.create({
  mainContainer: { flex: 1, backgroundColor: "#FFF" },
  header: { flexDirection: "row", justifyContent: "space-between", alignItems: "center", paddingHorizontal: 15, paddingBottom: 10, paddingTop: Platform.OS === "android" ? StatusBar.currentHeight : 50, backgroundColor: "#FFF", borderBottomWidth: 0.5, borderBottomColor: "#EEE" },
  headerTitle: { fontSize: 17, fontWeight: "700" },
  scrollContent: { flexGrow: 1 },
  bannerContainer: { width: "100%", height: 90 },
  bannerImage: { width: "100%", height: 90 },
  darkBanner: { height: 90, backgroundColor: "#1E293B" },
  bannerCam: { position: "absolute", bottom: 10, right: 15, backgroundColor: "rgba(0,0,0,0.6)", padding: 7, borderRadius: 20 },
  avatarWrapper: { alignItems: "center", marginTop: -45, marginBottom: 16 },
  avatarCircle: { width: 90, height: 90, borderRadius: 45, backgroundColor: "#0A66C2", justifyContent: "center", alignItems: "center", borderWidth: 3, borderColor: "#FFF", overflow: "hidden" },
  avatarImage: { width: 90, height: 90, borderRadius: 45 },
  camOverlay: { ...StyleSheet.absoluteFillObject, backgroundColor: "rgba(0,0,0,0.5)", justifyContent: "center", alignItems: "center" },
  avatarText: { fontSize: 36, color: "#FFF", fontWeight: "bold" },
  userName: { fontSize: 22, fontWeight: "700", marginTop: 10 },
  headlineRow: { flexDirection: "row", alignItems: "center", gap: 6, marginTop: 4, paddingHorizontal: 30 },
  headlineText: { color: "#64748B", fontSize: 13, textAlign: "center" },
  locationRow: { flexDirection: "row", alignItems: "center", gap: 4, marginTop: 4 },
  locationText: { color: "#888", fontSize: 12 },
  divider: { height: 8, backgroundColor: "#F3F3F3", width: "100%" },
  sectionContainer: { padding: 18 },
  sectionHeader: { flexDirection: "row", justifyContent: "space-between", alignItems: "center", marginBottom: 12 },
  sectionTitle: { fontSize: 17, fontWeight: "700", color: "#1E293B" },
  sectionBodyLabel: { color: "#64748B", fontSize: 14, lineHeight: 20 },
  itemCard: { flexDirection: "row", alignItems: "flex-start", gap: 12, marginBottom: 14 },
  itemIconBox: { width: 36, height: 36, borderRadius: 10, backgroundColor: "#EFF6FF", justifyContent: "center", alignItems: "center" },
  itemInfo: { flex: 1 },
  itemTitle: { fontSize: 14, fontWeight: "700", color: "#1E293B" },
  itemSub: { fontSize: 13, color: "#64748B", marginTop: 2 },
  itemDate: { fontSize: 12, color: "#94A3B8", marginTop: 2 },
  skillsRow: { flexDirection: "row", flexWrap: "wrap", gap: 8 },
  skillTag: { flexDirection: "row", alignItems: "center", gap: 6, backgroundColor: "#EFF6FF", paddingHorizontal: 12, paddingVertical: 6, borderRadius: 20, borderWidth: 1, borderColor: "#BFDBFE" },
  skillText: { fontSize: 13, color: "#0A66C2", fontWeight: "600" },
  resumeCard: { flexDirection: "row", alignItems: "center", gap: 12, backgroundColor: "#F0F7FF", padding: 14, borderRadius: 12, borderWidth: 1, borderColor: "#BFDBFE" },
  resumeText: { flex: 1, fontSize: 14, fontWeight: "600", color: "#1E293B" },
  resumeBtnRow: { flexDirection: "row", gap: 10, marginTop: 10 },
  resumeBtn: { flex: 1, flexDirection: "row", alignItems: "center", justifyContent: "center", gap: 6, padding: 10, borderRadius: 8, borderWidth: 1, borderColor: "#BFDBFE", backgroundColor: "#F0F7FF" },
  resumeDeleteBtn: { borderColor: "#FEE2E2", backgroundColor: "#FFF5F5" },
  resumeBtnText: { fontSize: 13, fontWeight: "600", color: "#0A66C2" },
  resumeDashedBox: { borderStyle: "dashed", borderWidth: 1.5, borderColor: "#CBD5E1", borderRadius: 12, padding: 24, alignItems: "center", marginTop: 10, gap: 6 },
  uploadMainText: { color: "#0A66C2", fontWeight: "700", fontSize: 14 },
  uploadSubText: { color: "#94A3B8", fontSize: 12 },
  modalOverlay: { flex: 1, backgroundColor: "rgba(0,0,0,0.7)", justifyContent: "flex-end" },
  modalContent: { backgroundColor: "#FFF", padding: 24, borderTopLeftRadius: 20, borderTopRightRadius: 20, maxHeight: "85%" },
  modalHeader: { fontSize: 17, fontWeight: "700", marginBottom: 14 },
  modalInput: { borderWidth: 1, borderColor: "#E2E8F0", padding: 12, borderRadius: 10, marginBottom: 12, fontSize: 14 },
  saveBtn: { backgroundColor: "#0A66C2", padding: 14, borderRadius: 10, alignItems: "center", marginTop: 4 },
  saveBtnText: { color: "#FFF", fontWeight: "700", fontSize: 15 },
  cancelText: { textAlign: "center", marginTop: 14, color: "#64748B", fontSize: 14 },
});


