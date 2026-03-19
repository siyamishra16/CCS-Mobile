// import React, { useState, useEffect } from "react";
// import {
//   View,
//   Text,
//   StyleSheet,
//   TouchableOpacity,
//   SafeAreaView,
//   ScrollView,
//   TextInput,
//   Modal,
//   ActivityIndicator,
//   Alert,
//   Platform,
//   StatusBar,
// } from "react-native";
// import { Ionicons, MaterialCommunityIcons } from "@expo/vector-icons";
// import { router } from "expo-router";
// import { supabase } from "../../lib/supabase";

// export default function StudentProfile() {
//   const [loading, setLoading] = useState(true);
//   const [student, setStudent] = useState<any>(null);
  
//   // Modal States
//   const [editModalVisible, setEditModalVisible] = useState(false);
//   const [activeField, setActiveField] = useState(""); 
//   const [tempValue, setTempValue] = useState("");
//   const [showCam, setShowCam] = useState(false);

//   useEffect(() => {
//     fetchProfile();
//   }, []);

//   const fetchProfile = async () => {
//     try {
//       const { data: { user } } = await supabase.auth.getUser();
//       if (!user) return;

//       const { data, error } = await supabase
//         .from("students")
//         .select("*")
//         .eq("id", user.id)
//         .single();

//       if (data) {
//         setStudent(data);
//       }
//     } catch (error) {
//       console.log("Fetch error:", error);
//     } finally {
//       setLoading(false);
//     }
//   };

//   const openEdit = (field: string, currentVal: string) => {
//     setActiveField(field);
//     setTempValue(currentVal || "");
//     setEditModalVisible(true);
//   };

//   const handleUpdate = async () => {
//     try {
//       const { data: { user } } = await supabase.auth.getUser();
//       const updatePayload = { [activeField]: tempValue };

//       const { error } = await supabase
//         .from("students")
//         .update(updatePayload)
//         .eq("id", user?.id);

//       if (error) throw error;
      
//       setEditModalVisible(false);
//       fetchProfile();
//       Alert.alert("Success", "Profile updated!");
//     } catch (error) {
//       Alert.alert("Error", "Update failed");
//     }
//   };

//   if (loading && !student) return <ActivityIndicator size="large" style={{flex: 1}} color="#007AFF" />;

//   return (
//     <View style={styles.mainContainer}>
//       <StatusBar barStyle="dark-content" />
//       <View style={styles.topPadding} />

//       <View style={styles.header}>
//         <TouchableOpacity onPress={() => router.back()}>
//           <Ionicons name="arrow-back" size={24} color="#333" />
//         </TouchableOpacity>
//         <Text style={styles.headerTitle}>Profile</Text>
//         <TouchableOpacity>
//           <Ionicons name="settings-outline" size={24} color="#333" />
//         </TouchableOpacity>
//       </View>

//       <ScrollView contentContainerStyle={styles.scrollContent} showsVerticalScrollIndicator={false}>
        
//         {/* Banner Section */}
//         <View style={styles.bannerContainer}>
//             <View style={styles.darkBanner} />
//             <TouchableOpacity style={styles.bannerCam}>
//                 <Ionicons name="camera" size={20} color="#FFF" />
//             </TouchableOpacity>
//         </View>

//         {/* Avatar Section */}
//         <View style={styles.avatarWrapper}>
//           <TouchableOpacity 
//             activeOpacity={0.9} 
//             onPress={() => setShowCam(!showCam)}
//             style={styles.avatarCircle}
//           >
//             <Text style={styles.avatarText}>{student?.name?.charAt(0) || "S"}</Text>
//             {showCam && (
//                 <View style={styles.camOverlay}>
//                     <Ionicons name="camera" size={30} color="#FFF" />
//                 </View>
//             )}
//           </TouchableOpacity>
          
//           <TouchableOpacity onPress={() => openEdit("name", student?.name)} style={styles.nameEditRow}>
//             <Text style={styles.userName}>{student?.name || "Siya Mishra"}</Text>
//             <Ionicons name="pencil" size={16} color="#007AFF" style={{marginLeft: 8, marginTop: 10}}/>
//           </TouchableOpacity>

//           <TouchableOpacity onPress={() => openEdit("headline", student?.headline)} style={styles.headlineRow}>
//              <Text style={styles.headlineText}>{student?.headline || "Add a headline to describe yourself"}</Text>
//              <Ionicons name="pencil" size={14} color="#007AFF" />
//           </TouchableOpacity>
//         </View>

//         <View style={styles.divider} />

//         <Section 
//             title="About" 
//             label={student?.about || "Share your story, skills, and what you're looking for"} 
//             onAdd={() => openEdit("about", student?.about)}
//         />
        
//         <View style={styles.divider} />

//         <Section 
//             title="Experience" 
//             icon="briefcase-outline" 
//             label={student?.experience || "Showcase your work experience"} 
//             btn="Add Experience"
//             onAdd={() => openEdit("experience", student?.experience)}
//         />

//         <View style={styles.divider} />

//         <Section 
//             title="Education" 
//             icon="school-outline" 
//             label={student?.education || "Add your educational background"} 
//             btn="Add Education" 
//             onAdd={() => openEdit("education", student?.education)}
//         />

//         <View style={styles.divider} />
        
//         <View style={styles.sectionContainer}>
//           <Text style={styles.sectionTitle}>Resume</Text>
//           <TouchableOpacity style={styles.resumeDashedBox}>
//             <Ionicons name="cloud-upload-outline" size={32} color="#007AFF" />
//             <Text style={styles.uploadMainText}>Upload your resume</Text>
//             <Text style={styles.uploadSubText}>PDF, DOC up to 10MB</Text>
//           </TouchableOpacity>
//         </View>

//         {/* Extra bottom padding to prevent cutoff */}
//         <View style={{ height: 60 }} />
//       </ScrollView>

//       {/* Dynamic Edit Modal */}
//       <Modal visible={editModalVisible} transparent animationType="slide">
//         <View style={styles.modalOverlay}>
//           <View style={styles.modalContent}>
//             <Text style={styles.modalHeader}>Update {activeField}</Text>
//             <TextInput 
//                 style={[styles.modalInput, activeField === "about" && {height: 100}]} 
//                 value={tempValue} 
//                 onChangeText={setTempValue}
//                 multiline={activeField === "about"}
//                 placeholder={`Enter your ${activeField}...`}
//             />
//             <TouchableOpacity style={styles.saveBtn} onPress={handleUpdate}>
//               <Text style={styles.saveBtnText}>Save Changes</Text>
//             </TouchableOpacity>
//             <TouchableOpacity onPress={() => setEditModalVisible(false)}>
//                 <Text style={styles.cancelText}>Cancel</Text>
//             </TouchableOpacity>
//           </View>
//         </View>
//       </Modal>
//     </View>
//   );
// }

// const Section = ({ title, icon, label, btn, onAdd }: any) => (
//   <View style={styles.sectionContainer}>
//     <View style={styles.sectionHeader}>
//         <Text style={styles.sectionTitle}>{title}</Text>
//         <TouchableOpacity onPress={onAdd}>
//             <Ionicons name="add" size={26} color="#007AFF" />
//         </TouchableOpacity>
//     </View>
//     <View style={styles.sectionBody}>
//       {icon && !label.includes("Showcase") ? null : icon && <MaterialCommunityIcons name={icon} size={48} color="#D1D1D1" />}
//       <Text style={styles.sectionBodyLabel}>{label}</Text>
//       {btn && (
//         <TouchableOpacity style={styles.sectionAddBtn} onPress={onAdd}>
//           <Ionicons name="add" size={18} color="#007AFF" />
//           <Text style={styles.sectionAddBtnText}>{btn}</Text>
//         </TouchableOpacity>
//       )}
//     </View>
//   </View>
// );

// const styles = StyleSheet.create({
//   mainContainer: { flex: 1, backgroundColor: "#FFF" },
//   topPadding: { height: Platform.OS === "android" ? StatusBar.currentHeight : 44 },
//   header: { flexDirection: 'row', justifyContent: 'space-between', padding: 15, alignItems: 'center' },
//   headerTitle: { fontSize: 18, fontWeight: '700' },
//   scrollContent: { flexGrow: 1 },
//   bannerContainer: { width: '100%', height: 100 },
//   darkBanner: { height: 100, backgroundColor: '#2D3E50' },
//   bannerCam: { position: 'absolute', top: 15, right: 15, backgroundColor: 'rgba(0,0,0,0.4)', padding: 8, borderRadius: 20 },
//   avatarWrapper: { alignItems: 'center', marginTop: -50, marginBottom: 20 },
//   avatarCircle: { width: 100, height: 100, borderRadius: 50, backgroundColor: '#007AFF', justifyContent: 'center', alignItems: 'center', borderWidth: 4, borderColor: '#FFF', overflow: 'hidden' },
//   camOverlay: { position: 'absolute', width: '100%', height: '100%', backgroundColor: 'rgba(0,0,0,0.5)', justifyContent: 'center', alignItems: 'center' },
//   avatarText: { fontSize: 42, color: '#FFF', fontWeight: 'bold' },
//   nameEditRow: { flexDirection: 'row', alignItems: 'center' },
//   userName: { fontSize: 24, fontWeight: '700', marginTop: 10 },
//   headlineRow: { flexDirection: 'row', alignItems: 'center', marginTop: 5, paddingHorizontal: 30 },
//   headlineText: { color: '#888', marginRight: 8, textAlign: 'center' },
//   divider: { height: 8, backgroundColor: '#F3F3F3', width: '100%' },
//   sectionContainer: { padding: 20 },
//   sectionHeader: { flexDirection: 'row', justifyContent: 'space-between', alignItems: 'center' },
//   sectionTitle: { fontSize: 18, fontWeight: '700' },
//   sectionBody: { alignItems: 'flex-start', paddingVertical: 10 },
//   sectionBodyLabel: { color: '#444', fontSize: 14, lineHeight: 20, marginBottom: 10 },
//   sectionAddBtn: { flexDirection: 'row', alignItems: 'center', borderWidth: 1, borderColor: '#007AFF', paddingHorizontal: 20, paddingVertical: 8, borderRadius: 25, marginTop: 5 },
//   sectionAddBtnText: { color: '#007AFF', fontWeight: '600', marginLeft: 5 },
//   resumeDashedBox: { borderStyle: 'dashed', borderWidth: 1, borderColor: '#CCC', borderRadius: 12, padding: 30, alignItems: 'center', marginTop: 15 },
//   uploadMainText: { color: '#007AFF', fontWeight: '700', marginTop: 10 },
//   uploadSubText: { color: '#AAA', fontSize: 12 },
//   modalOverlay: { flex: 1, backgroundColor: 'rgba(0,0,0,0.5)', justifyContent: 'flex-end' },
//   modalContent: { backgroundColor: '#FFF', padding: 25, borderTopLeftRadius: 20, borderTopRightRadius: 20 },
//   modalHeader: { fontSize: 18, fontWeight: '700', marginBottom: 15, textTransform: 'capitalize' },
//   modalInput: { borderWidth: 1, borderColor: '#DDD', padding: 12, borderRadius: 8, marginBottom: 20, textAlignVertical: 'top' },
//   saveBtn: { backgroundColor: '#007AFF', padding: 15, borderRadius: 10, alignItems: 'center' },
//   saveBtnText: { color: '#FFF', fontWeight: '700' },
//   cancelText: { textAlign: 'center', marginTop: 15, color: '#666', fontWeight: '500' }
// });

import React, { useState, useEffect } from "react";
import {
  View,
  Text,
  StyleSheet,
  TouchableOpacity,
  SafeAreaView,
  ScrollView,
  TextInput,
  Modal,
  ActivityIndicator,
  Alert,
  Platform,
  StatusBar,
} from "react-native";
import { Ionicons, MaterialCommunityIcons } from "@expo/vector-icons";
import { router } from "expo-router";
import * as ImagePicker from 'expo-image-picker'; 
import { supabase } from "../../lib/supabase";

export default function StudentProfile() {
  const [loading, setLoading] = useState(true);
  const [student, setStudent] = useState<any>(null);
  
  const [editModalVisible, setEditModalVisible] = useState(false);
  const [activeField, setActiveField] = useState(""); 
  const [tempValue, setTempValue] = useState("");
  const [showCam, setShowCam] = useState(false);

  useEffect(() => {
    fetchProfile();
  }, []);

  const fetchProfile = async () => {
    try {
      const { data: { user } } = await supabase.auth.getUser();
      if (!user) return;

      const { data, error } = await supabase
        .from("students")
        .select("*")
        .eq("id", user.id)
        .single();

      if (data) {
        setStudent(data);
      }
    } catch (error) {
      console.log("Fetch error:", error);
    } finally {
      setLoading(false);
    }
  };

  const pickImage = async (type: 'avatar' | 'banner') => {
    const { status } = await ImagePicker.requestMediaLibraryPermissionsAsync();
    if (status !== 'granted') {
      Alert.alert("Permission denied", "We need access to your gallery");
      return;
    }

    const result = await ImagePicker.launchImageLibraryAsync({
      mediaTypes: ImagePicker.MediaTypeOptions.Images,
      allowsEditing: true,
      aspect: type === 'avatar' ? [1, 1] : [16, 9],
      quality: 0.7,
    });

    if (!result.canceled) {
      Alert.alert("Success", "Image selected!");
      setShowCam(false);
    }
  };

  const openEdit = (field: string, currentVal: string) => {
    setActiveField(field);
    setTempValue(currentVal || "");
    setEditModalVisible(true);
  };

  const handleUpdate = async () => {
    try {
      const { data: { user } } = await supabase.auth.getUser();
      const updatePayload = { [activeField]: tempValue };

      const { error } = await supabase
        .from("students")
        .update(updatePayload)
        .eq("id", user?.id);

      if (error) throw error;
      
      setEditModalVisible(false);
      fetchProfile();
      Alert.alert("Success", "Profile updated!");
    } catch (error) {
      Alert.alert("Error", "Update failed");
    }
  };

  if (loading && !student) return <ActivityIndicator size="large" style={{flex: 1}} color="#007AFF" />;

  return (
    <View style={styles.mainContainer}>
      <StatusBar barStyle="dark-content" backgroundColor="white" translucent={true} />
      
      {/* FIXED TOP BAR: Added dynamic padding so it's not cut off but stays thin */}
      <View style={styles.header}>
        <TouchableOpacity onPress={() => router.back()}>
          <Ionicons name="arrow-back" size={24} color="#333" />
        </TouchableOpacity>
        <Text style={styles.headerTitle}>Profile</Text>
        <TouchableOpacity>
          <Ionicons name="settings-outline" size={24} color="#333" />
        </TouchableOpacity>
      </View>

      <ScrollView contentContainerStyle={styles.scrollContent} showsVerticalScrollIndicator={false}>
        <View style={styles.bannerContainer}>
            <View style={styles.darkBanner} />
            <TouchableOpacity style={styles.bannerCam} onPress={() => pickImage('banner')}>
                <Ionicons name="camera" size={20} color="#FFF" />
            </TouchableOpacity>
        </View>

        <View style={styles.avatarWrapper}>
          <TouchableOpacity 
            activeOpacity={0.9} 
            onPress={() => setShowCam(!showCam)}
            style={styles.avatarCircle}
          >
            <Text style={styles.avatarText}>{student?.name?.charAt(0) || "S"}</Text>
            {showCam && (
                <TouchableOpacity style={styles.camOverlay} onPress={() => pickImage('avatar')}>
                    <Ionicons name="camera" size={30} color="#FFF" />
                </TouchableOpacity>
            )}
          </TouchableOpacity>
          
          <TouchableOpacity onPress={() => openEdit("name", student?.name)} style={styles.nameEditRow}>
            <Text style={styles.userName}>{student?.name || "Siya Mishra"}</Text>
            <Ionicons name="pencil" size={16} color="#007AFF" style={{marginLeft: 8, marginTop: 10}}/>
          </TouchableOpacity>

          <TouchableOpacity onPress={() => openEdit("headline", student?.headline)} style={styles.headlineRow}>
             <Text style={styles.headlineText}>{student?.headline || "Add a headline"}</Text>
             <Ionicons name="pencil" size={14} color="#007AFF" />
          </TouchableOpacity>
        </View>

        <View style={styles.divider} />

        <Section title="About" label={student?.about || "No bio added"} onAdd={() => openEdit("about", student?.about)} />
        <View style={styles.divider} />
        <Section title="Experience" label={student?.experience || "No experience added"} onAdd={() => openEdit("experience", student?.experience)} />
        <View style={styles.divider} />
        <Section title="Education" label={student?.education || "No education added"} onAdd={() => openEdit("education", student?.education)} />

        <View style={styles.divider} />
        <View style={styles.sectionContainer}>
          <Text style={styles.sectionTitle}>Resume</Text>
          <TouchableOpacity style={styles.resumeDashedBox}>
            <Ionicons name="cloud-upload-outline" size={32} color="#007AFF" />
            <Text style={styles.uploadMainText}>Upload your resume</Text>
          </TouchableOpacity>
        </View>

        {/* BOTTOM SPACER: To avoid phone navigation icons */}
        <View style={{ height: 120 }} />
      </ScrollView>

      <Modal visible={editModalVisible} transparent animationType="slide">
        <View style={styles.modalOverlay}>
          <View style={styles.modalContent}>
            <Text style={styles.modalHeader}>Update {activeField}</Text>
            <TextInput 
                style={styles.modalInput} 
                value={tempValue} 
                onChangeText={setTempValue}
                multiline={activeField === "about"}
            />
            <TouchableOpacity style={styles.saveBtn} onPress={handleUpdate}>
              <Text style={styles.saveBtnText}>Save Changes</Text>
            </TouchableOpacity>
            <TouchableOpacity onPress={() => setEditModalVisible(false)}>
                <Text style={styles.cancelText}>Cancel</Text>
            </TouchableOpacity>
          </View>
        </View>
      </Modal>
    </View>
  );
}

const Section = ({ title, label, onAdd }: any) => (
  <View style={styles.sectionContainer}>
    <View style={styles.sectionHeader}>
        <Text style={styles.sectionTitle}>{title}</Text>
        <TouchableOpacity onPress={onAdd}><Ionicons name="add" size={26} color="#007AFF" /></TouchableOpacity>
    </View>
    <Text style={styles.sectionBodyLabel}>{label}</Text>
  </View>
);

const styles = StyleSheet.create({
  mainContainer: { flex: 1, backgroundColor: "#FFF" },
  header: { 
    flexDirection: 'row', 
    justifyContent: 'space-between', 
    alignItems: 'center',
    paddingHorizontal: 15,
    paddingBottom: 10,
    // This is the trick: it adds just enough space for the notch/status bar
    paddingTop: Platform.OS === "android" ? StatusBar.currentHeight : 50, 
    backgroundColor: '#FFF',
    borderBottomWidth: 0.5,
    borderBottomColor: '#EEE'
  },
  headerTitle: { fontSize: 18, fontWeight: '700' },
  scrollContent: { flexGrow: 1 },
  bannerContainer: { width: '100%', height: 100 },
  darkBanner: { height: 100, backgroundColor: '#2D3E50' },
  bannerCam: { position: 'absolute', bottom: 10, right: 15, backgroundColor: 'rgba(0,0,0,0.6)', padding: 8, borderRadius: 20 },
  avatarWrapper: { alignItems: 'center', marginTop: -50, marginBottom: 20 },
  avatarCircle: { width: 100, height: 100, borderRadius: 50, backgroundColor: '#007AFF', justifyContent: 'center', alignItems: 'center', borderWidth: 4, borderColor: '#FFF', overflow: 'hidden' },
  camOverlay: { ...StyleSheet.absoluteFillObject, backgroundColor: 'rgba(0,0,0,0.5)', justifyContent: 'center', alignItems: 'center' },
  avatarText: { fontSize: 42, color: '#FFF', fontWeight: 'bold' },
  nameEditRow: { flexDirection: 'row', alignItems: 'center' },
  userName: { fontSize: 24, fontWeight: '700', marginTop: 10 },
  headlineRow: { flexDirection: 'row', alignItems: 'center', marginTop: 5, paddingHorizontal: 30 },
  headlineText: { color: '#888', marginRight: 8, textAlign: 'center' },
  divider: { height: 8, backgroundColor: '#F3F3F3', width: '100%' },
  sectionContainer: { padding: 20 },
  sectionHeader: { flexDirection: 'row', justifyContent: 'space-between', alignItems: 'center', marginBottom: 10 },
  sectionTitle: { fontSize: 18, fontWeight: '700' },
  sectionBodyLabel: { color: '#444', fontSize: 14, lineHeight: 20 },
  resumeDashedBox: { borderStyle: 'dashed', borderWidth: 1, borderColor: '#CCC', borderRadius: 12, padding: 25, alignItems: 'center', marginTop: 10 },
  uploadMainText: { color: '#007AFF', fontWeight: '700', marginTop: 10 },
  modalOverlay: { flex: 1, backgroundColor: 'rgba(0,0,0,0.8)', justifyContent: 'flex-end' },
  modalContent: { backgroundColor: '#FFF', padding: 25, borderTopLeftRadius: 20, borderTopRightRadius: 20 },
  modalHeader: { fontSize: 18, fontWeight: '700', marginBottom: 15 },
  modalInput: { borderWidth: 1, borderColor: '#DDD', padding: 12, borderRadius: 8, marginBottom: 20, minHeight: 80, textAlignVertical: 'top' },
  saveBtn: { backgroundColor: '#007AFF', padding: 15, borderRadius: 10, alignItems: 'center' },
  saveBtnText: { color: '#FFF', fontWeight: '700' },
  cancelText: { textAlign: 'center', marginTop: 15, color: '#666' }
});