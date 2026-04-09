// import React, { useState, useEffect } from "react";
// import {
//   View,
//   Text,
//   StyleSheet,
//   TouchableOpacity,
//   FlatList,
//   StatusBar,
//   ActivityIndicator,
//   Linking,
// } from "react-native";
// import { Ionicons, MaterialCommunityIcons } from "@expo/vector-icons";
// import { router } from "expo-router";
// import { useSafeAreaInsets } from "react-native-safe-area-context";
// import { supabase } from "../../lib/supabase";
// import AsyncStorage from "@react-native-async-storage/async-storage";

// const BLUE_ACCENT = "#1F4FA3";
// const BLUE_DARK = "#0F2D6B";
// const TEXT_DARK = "#222222";
// const BORDER_COLOR = "#E2E8F0";

// export default function CertificatesScreen() {
//   const [certs, setCerts] = useState<any[]>([]);
//   const [loading, setLoading] = useState(true);
//   const insets = useSafeAreaInsets();

//   useEffect(() => {
//     fetchCertificates();
//   }, []);

//   const fetchCertificates = async () => {
//     try {
//       setLoading(true);
//       const userString = await AsyncStorage.getItem("user");
//       if (!userString) return;
//       const userData = JSON.parse(userString);

//       const { data, error } = await supabase
//         .from("certificates")
//         .select("*")
//         .eq("student_id", userData.id)
//         .order("issued_at", { ascending: false });

//       if (error) throw error;
//       setCerts(data || []);
//     } catch (error) {
//       console.error(error);
//     } finally {
//       setLoading(false);
//     }
//   };

//   // MAGIC FIX: Google Docs Viewer works as a proxy to STOP auto-downloads
//   const handleView = (url: string) => {
//     const googleViewerUrl = `https://docs.google.com/viewer?url=${encodeURIComponent(url)}&embedded=true`;
//     Linking.openURL(googleViewerUrl).catch(err => Linking.openURL(url));
//   };

//   const renderCertCard = ({ item }: { item: any }) => {
//     const studentName = item.data_json?.student_name || "Student";
//     const examTitle = item.data_json?.exam_title || `Exam #${item.exam_id}`;
//     const issuedDate = item.issued_at
//       ? new Date(item.issued_at).toLocaleDateString("en-US", {
//           month: "numeric",
//           day: "numeric",
//           year: "numeric",
//         })
//       : "N/A";

//     return (
//       <View style={styles.certCard}>
//         <View style={styles.cardTopRow}>
//           <View style={styles.verifiedBadge}>
//             <MaterialCommunityIcons name="check-decagram" size={13} color={BLUE_ACCENT} />
//             <Text style={styles.verifiedText}>Verified Certificate</Text>
//           </View>
//           <Text style={styles.certNumber}>#{item.certificate_number}</Text>
//         </View>

//         <Text style={styles.studentName}>{studentName}</Text>
//         <Text style={styles.examTitle}>{examTitle}</Text>

//         <View style={styles.dateRow}>
//           <Ionicons name="calendar-outline" size={14} color={BLUE_ACCENT} />
//           <Text style={styles.dateText}>Issued on {issuedDate}</Text>
//         </View>

//         <View style={styles.divider} />

//         <View style={styles.actionRow}>
//           <TouchableOpacity
//             style={styles.viewBtn}
//             onPress={() => handleView(item.file_url)}
//           >
//             <Ionicons name="open-outline" size={15} color="#FFF" />
//             <Text style={styles.viewBtnText}>View Certificate</Text>
//           </TouchableOpacity>

//           <TouchableOpacity
//             style={styles.downloadBtn}
//             onPress={() => Linking.openURL(item.file_url)}
//           >
//             <Ionicons name="download-outline" size={15} color={BLUE_ACCENT} />
//             <Text style={styles.downloadBtnText}>Download PDF</Text>
//           </TouchableOpacity>
//         </View>
//       </View>
//     );
//   };

//   return (
//     <View style={[styles.container, { paddingTop: insets.top }]}>
//       <StatusBar barStyle="dark-content" backgroundColor="#FFF" />
//       <View style={styles.header}>
//         <TouchableOpacity style={styles.backBtn} onPress={() => router.back()}>
//           <Ionicons name="arrow-back" size={22} color={TEXT_DARK} />
//         </TouchableOpacity>
//         <Text style={styles.headerTitle}>My Certificates</Text>
//         <View style={{ width: 36 }} />
//       </View>

//       <View style={styles.heroBanner}>
//         <View>
//           <Text style={styles.heroTitle}>My Certificates</Text>
//           <Text style={styles.heroSub}>View and download your earned certifications.</Text>
//         </View>
//         <View style={styles.heroIconCircle}>
//           <MaterialCommunityIcons name="medal-outline" size={26} color="#FFF" />
//         </View>
//       </View>

//       {loading ? (
//         <View style={styles.centered}>
//           <ActivityIndicator size="large" color={BLUE_ACCENT} />
//         </View>
//       ) : (
//         <FlatList
//           data={certs}
//           renderItem={renderCertCard}
//           keyExtractor={(item) => item.id.toString()}
//           contentContainerStyle={styles.listContent}
//         />
//       )}
//     </View>
//   );
// }

// const styles = StyleSheet.create({
//   container: { flex: 1, backgroundColor: "#F1F5F9" },
//   header: { height: 50, flexDirection: "row", alignItems: "center", justifyContent: "space-between", paddingHorizontal: 16, backgroundColor: "#FFF", borderBottomWidth: 1, borderBottomColor: BORDER_COLOR },
//   backBtn: { width: 36, height: 36, borderRadius: 18, backgroundColor: "#F3F4F6", alignItems: "center", justifyContent: "center" },
//   headerTitle: { fontSize: 16, fontWeight: "700", color: TEXT_DARK },
//   heroBanner: { flexDirection: "row", alignItems: "center", justifyContent: "space-between", paddingHorizontal: 22, paddingVertical: 24, backgroundColor: BLUE_DARK },
//   heroTitle: { fontSize: 22, fontWeight: "800", color: "#FFF", marginBottom: 5 },
//   heroSub: { fontSize: 12, color: "rgba(255,255,255,0.7)", maxWidth: 220, lineHeight: 17 },
//   heroIconCircle: { width: 52, height: 52, borderRadius: 26, backgroundColor: "rgba(255,255,255,0.15)", borderWidth: 1.5, borderColor: "rgba(255,255,255,0.25)", alignItems: "center", justifyContent: "center" },
//   listContent: { paddingHorizontal: 16, paddingTop: 18, paddingBottom: 40 },
//   certCard: { backgroundColor: "#FFF", borderRadius: 14, padding: 16, marginBottom: 14, borderWidth: 1, borderColor: BORDER_COLOR, elevation: 2 },
//   cardTopRow: { flexDirection: "row", justifyContent: "space-between", alignItems: "center", marginBottom: 14 },
//   verifiedBadge: { flexDirection: "row", alignItems: "center", gap: 5, backgroundColor: "#EFF6FF", borderWidth: 1, borderColor: "#BFDBFE", paddingHorizontal: 10, paddingVertical: 4, borderRadius: 20 },
//   verifiedText: { fontSize: 11, fontWeight: "600", color: BLUE_ACCENT },
//   certNumber: { fontSize: 11, color: "#94A3B8", fontWeight: "500" },
//   studentName: { fontSize: 18, fontWeight: "800", color: TEXT_DARK, marginBottom: 4 },
//   examTitle: { fontSize: 13, color: "#64748B", marginBottom: 12, fontWeight: "500" },
//   dateRow: { flexDirection: "row", alignItems: "center", gap: 6, marginBottom: 2 },
//   dateText: { fontSize: 13, color: "#475569", fontWeight: "500" },
//   divider: { height: 1, backgroundColor: BORDER_COLOR, marginVertical: 14 },
//   actionRow: { flexDirection: "row", gap: 10 },
//   viewBtn: { flex: 1, flexDirection: "row", alignItems: "center", justifyContent: "center", gap: 6, backgroundColor: BLUE_DARK, paddingVertical: 10, borderRadius: 8 },
//   viewBtnText: { color: "#FFF", fontSize: 13, fontWeight: "700" },
//   downloadBtn: { flex: 1, flexDirection: "row", alignItems: "center", justifyContent: "center", gap: 6, backgroundColor: "#FFF", paddingVertical: 10, borderRadius: 8, borderWidth: 1.5, borderColor: BORDER_COLOR },
//   downloadBtnText: { color: BLUE_ACCENT, fontSize: 13, fontWeight: "700" },
//   centered: { flex: 1, alignItems: "center", justifyContent: "center" },
// });

import React, { useState, useEffect } from "react";
import {
  View,
  Text,
  StyleSheet,
  TouchableOpacity,
  FlatList,
  StatusBar,
  ActivityIndicator,
  Linking,
  Alert,
} from "react-native";
import { Ionicons, MaterialCommunityIcons } from "@expo/vector-icons";
import { router } from "expo-router";
import { useSafeAreaInsets } from "react-native-safe-area-context";
import { supabase } from "../../lib/supabase";
import AsyncStorage from "@react-native-async-storage/async-storage";
// FIX: Using the legacy import to stop SDK 54 errors
import * as FileSystem from "expo-file-system/legacy"; 
import * as Sharing from "expo-sharing";

const BLUE_ACCENT = "#1F4FA3";
const BLUE_DARK = "#0F2D6B";
const TEXT_DARK = "#222222";
const BORDER_COLOR = "#E2E8F0";

export default function CertificatesScreen() {
  const [certs, setCerts] = useState<any[]>([]);
  const [loading, setLoading] = useState(true);
  const [downloadingId, setDownloadingId] = useState<number | null>(null);
  const insets = useSafeAreaInsets();

  useEffect(() => {
    fetchCertificates();
  }, []);

  const fetchCertificates = async () => {
    try {
      setLoading(true);
      const userString = await AsyncStorage.getItem("user");
      if (!userString) {
        setLoading(false);
        return;
      }
      
      const userData = JSON.parse(userString);
      const userId = userData.id;

      const { data, error } = await supabase
        .from("certificates")
        .select("*")
        .eq("student_id", userId)
        .order("issued_at", { ascending: false });

      if (error) throw error;
      setCerts(data || []);
    } catch (error) {
      console.error("Error fetching certificates:", error);
    } finally {
      setLoading(false);
    }
  };

  const handleView = (url: string) => {
    const googleViewerUrl = `https://docs.google.com/viewer?url=${encodeURIComponent(url)}&embedded=true`;
    Linking.openURL(googleViewerUrl).catch(() => Linking.openURL(url));
  };

  const handleDownload = async (url: string, certNo: string, id: number) => {
    try {
      setDownloadingId(id);
      
      const filename = `Certificate_${certNo}.pdf`;
      // Using the legacy directory path
      const fileUri = FileSystem.documentDirectory + filename;

      const downloadRes = await FileSystem.downloadAsync(url, fileUri);

      if (downloadRes.status !== 200) {
        throw new Error("Download failed");
      }

      if (await Sharing.isAvailableAsync()) {
        await Sharing.shareAsync(downloadRes.uri, {
          mimeType: "application/pdf",
          dialogTitle: "Open Certificate",
        });
      } else {
        Alert.alert("Success", "Certificate downloaded successfully.");
      }
    } catch (error) {
      console.error("Download error:", error);
      Alert.alert("Error", "Could not process the PDF download.");
    } finally {
      setDownloadingId(null);
    }
  };

  const renderCertCard = ({ item }: { item: any }) => {
    const studentName = item.data_json?.student_name || "Student";
    const examTitle = item.data_json?.exam_title || `Exam #${item.exam_id}`;
    const issuedDate = item.issued_at
      ? new Date(item.issued_at).toLocaleDateString("en-US", {
          month: "numeric", day: "numeric", year: "numeric",
        })
      : "N/A";

    return (
      <View style={styles.certCard}>
        <View style={styles.cardTopRow}>
          <View style={styles.verifiedBadge}>
            <MaterialCommunityIcons name="check-decagram" size={13} color={BLUE_ACCENT} />
            <Text style={styles.verifiedText}>Verified Certificate</Text>
          </View>
          <Text style={styles.certNumber}>#{item.certificate_number}</Text>
        </View>

        <Text style={styles.studentName}>{studentName}</Text>
        <Text style={styles.examTitle}>{examTitle}</Text>

        <View style={styles.dateRow}>
          <Ionicons name="calendar-outline" size={14} color={BLUE_ACCENT} />
          <Text style={styles.dateText}>Issued on {issuedDate}</Text>
        </View>

        <View style={styles.divider} />

        <View style={styles.actionRow}>
          <TouchableOpacity
            style={styles.viewBtn}
            onPress={() => handleView(item.file_url)}
          >
            <Ionicons name="open-outline" size={15} color="#FFF" />
            <Text style={styles.viewBtnText}>View Certificate</Text>
          </TouchableOpacity>

          <TouchableOpacity
            style={styles.downloadBtn}
            disabled={downloadingId === item.id}
            onPress={() => handleDownload(item.file_url, item.certificate_number, item.id)}
          >
            {downloadingId === item.id ? (
              <ActivityIndicator size="small" color={BLUE_ACCENT} />
            ) : (
              <>
                <Ionicons name="download-outline" size={15} color={BLUE_ACCENT} />
                <Text style={styles.downloadBtnText}>Download PDF</Text>
              </>
            )}
          </TouchableOpacity>
        </View>
      </View>
    );
  };

  return (
    <View style={[styles.container, { paddingTop: insets.top }]}>
      <StatusBar barStyle="dark-content" backgroundColor="#FFF" />
      <View style={styles.header}>
        <TouchableOpacity style={styles.backBtn} onPress={() => router.back()}>
          <Ionicons name="arrow-back" size={22} color={TEXT_DARK} />
        </TouchableOpacity>
        <Text style={styles.headerTitle}>My Certificates</Text>
        <View style={{ width: 36 }} />
      </View>

      <View style={styles.heroBanner}>
        <View>
          <Text style={styles.heroTitle}>My Certificates</Text>
          <Text style={styles.heroSub}>View and download your earned certifications.</Text>
        </View>
        <View style={styles.heroIconCircle}>
          <MaterialCommunityIcons name="medal-outline" size={26} color="#FFF" />
        </View>
      </View>

      {loading ? (
        <View style={styles.centered}>
          <ActivityIndicator size="large" color={BLUE_ACCENT} />
        </View>
      ) : (
        <FlatList
          data={certs}
          renderItem={renderCertCard}
          keyExtractor={(item) => item.id.toString()}
          contentContainerStyle={styles.listContent}
        />
      )}
    </View>
  );
}

const styles = StyleSheet.create({
  container: { flex: 1, backgroundColor: "#F1F5F9" },
  header: { height: 50, flexDirection: "row", alignItems: "center", justifyContent: "space-between", paddingHorizontal: 16, backgroundColor: "#FFF", borderBottomWidth: 1, borderBottomColor: BORDER_COLOR },
  backBtn: { width: 36, height: 36, borderRadius: 18, backgroundColor: "#F3F4F6", alignItems: "center", justifyContent: "center" },
  headerTitle: { fontSize: 16, fontWeight: "700", color: TEXT_DARK },
  heroBanner: { flexDirection: "row", alignItems: "center", justifyContent: "space-between", paddingHorizontal: 22, paddingVertical: 24, backgroundColor: BLUE_DARK },
  heroTitle: { fontSize: 22, fontWeight: "800", color: "#FFF", marginBottom: 5 },
  heroSub: { fontSize: 12, color: "rgba(255,255,255,0.7)", maxWidth: 220, lineHeight: 17 },
  heroIconCircle: { width: 52, height: 52, borderRadius: 26, backgroundColor: "rgba(255,255,255,0.15)", borderWidth: 1.5, borderColor: "rgba(255,255,255,0.25)", alignItems: "center", justifyContent: "center" },
  listContent: { paddingHorizontal: 16, paddingTop: 18, paddingBottom: 40 },
  certCard: { backgroundColor: "#FFF", borderRadius: 14, padding: 16, marginBottom: 14, borderWidth: 1, borderColor: BORDER_COLOR, elevation: 2 },
  cardTopRow: { flexDirection: "row", justifyContent: "space-between", alignItems: "center", marginBottom: 14 },
  verifiedBadge: { flexDirection: "row", alignItems: "center", gap: 5, backgroundColor: "#EFF6FF", borderWidth: 1, borderColor: "#BFDBFE", paddingHorizontal: 10, paddingVertical: 4, borderRadius: 20 },
  verifiedText: { fontSize: 11, fontWeight: "600", color: BLUE_ACCENT },
  certNumber: { fontSize: 11, color: "#94A3B8", fontWeight: "500" },
  studentName: { fontSize: 18, fontWeight: "800", color: TEXT_DARK, marginBottom: 4 },
  examTitle: { fontSize: 13, color: "#64748B", marginBottom: 12, fontWeight: "500" },
  dateRow: { flexDirection: "row", alignItems: "center", gap: 6, marginBottom: 2 },
  dateText: { fontSize: 13, color: "#475569", fontWeight: "500" },
  divider: { height: 1, backgroundColor: BORDER_COLOR, marginVertical: 14 },
  actionRow: { flexDirection: "row", gap: 10 },
  viewBtn: { flex: 1, flexDirection: "row", alignItems: "center", justifyContent: "center", gap: 6, backgroundColor: BLUE_DARK, paddingVertical: 10, borderRadius: 8 },
  viewBtnText: { color: "#FFF", fontSize: 13, fontWeight: "700" },
  downloadBtn: { flex: 1, flexDirection: "row", alignItems: "center", justifyContent: "center", gap: 6, backgroundColor: "#FFF", paddingVertical: 10, borderRadius: 8, borderWidth: 1.5, borderColor: BORDER_COLOR },
  downloadBtnText: { color: BLUE_ACCENT, fontSize: 13, fontWeight: "700" },
  centered: { flex: 1, alignItems: "center", justifyContent: "center" },
});