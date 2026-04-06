// import React, { useEffect, useState } from "react";
// import {
//   View, Text, StyleSheet, TouchableOpacity,
//   ScrollView, ActivityIndicator, StatusBar,
// } from "react-native";
// import { useRouter, useLocalSearchParams } from "expo-router";
// import { Ionicons } from "@expo/vector-icons";
// import { useSafeAreaInsets } from "react-native-safe-area-context";
// import { apiRequest } from "../../../services/api";
// import { supabase } from "../../../lib/supabase";

// interface Level {
//   id: number;
//   name: string;
//   display_order: number;
//   color_class: string;
// }

// interface Exam {
//   id: number;
//   level_id: number;
//   duration_minutes: number;
//   passing_score: number;
//   total_marks: number;
//   is_active: boolean;
//   status: string;
//   subcategory_id: number;
// }

// const ACCENT = "#1F4FA3";

// function LevelCard({
//   level, exam, onTakeExam, attempted,
// }: {
//   level: Level;
//   exam: Exam | undefined;
//   onTakeExam: (examId: number) => void;
//   attempted: boolean;
// }) {
//   const available = !!exam && exam.is_active === true;

//   return (
//     <View style={[styles.card, !available && styles.cardDisabled]}>
//       <View style={[styles.accentBar, {
//         backgroundColor: attempted ? "#22c55e" : available ? ACCENT : "#cbd5e1"
//       }]} />
//       <View style={styles.cardInner}>
//         <View style={styles.cardHeader}>
//           <Text style={[styles.levelName, !available && styles.textMuted]}>
//             {level.name}
//           </Text>
//           {attempted ? (
//             <View style={styles.takenBadge}>
//               <Ionicons name="checkmark-circle" size={13} color="#22c55e" />
//               <Text style={styles.takenText}>Exam Taken</Text>
//             </View>
//           ) : !available ? (
//             <View style={styles.comingSoonBadge}>
//               <Text style={styles.comingSoonText}>Coming Soon</Text>
//             </View>
//           ) : (
//             <View style={styles.availableBadge}>
//               <Ionicons name="checkmark-circle" size={13} color={ACCENT} />
//               <Text style={styles.availableText}>Available</Text>
//             </View>
//           )}
//         </View>

//         <View style={styles.statsRow}>
//           <View style={styles.statItem}>
//             <Ionicons name="time-outline" size={13} color={available ? ACCENT : "#94a3b8"} />
//             <Text style={[styles.statItemLabel, !available && styles.textMuted]}>
//               {exam ? `${exam.duration_minutes} min` : "-- min"}
//             </Text>
//           </View>
//           <View style={styles.statDot} />
//           <View style={styles.statItem}>
//             <Ionicons name="help-circle-outline" size={13} color={available ? ACCENT : "#94a3b8"} />
//             <Text style={[styles.statItemLabel, !available && styles.textMuted]}>
//               {exam ? `${exam.total_marks} Qs` : "-- Qs"}
//             </Text>
//           </View>
//           <View style={styles.statDot} />
//           <View style={styles.statItem}>
//             <Ionicons name="ribbon-outline" size={13} color={available ? ACCENT : "#94a3b8"} />
//             <Text style={[styles.statItemLabel, !available && styles.textMuted]}>
//               Pass {exam ? `${exam.passing_score}%` : "--%"}
//             </Text>
//           </View>
//         </View>

//         <TouchableOpacity
//           style={[
//             styles.ctaButton,
//             attempted ? styles.ctaRetake :
//             available ? styles.ctaActive : styles.ctaDisabled
//           ]}
//           onPress={() => available && exam && onTakeExam(exam.id)}
//           disabled={!available}
//           activeOpacity={0.75}
//         >
//           {available && (
//             <Ionicons
//               name={attempted ? "refresh-circle-outline" : "play-circle-outline"}
//               size={15} color="#fff" style={{ marginRight: 5 }}
//             />
//           )}
//           <Text style={[styles.ctaText, !available && styles.ctaTextDisabled]}>
//             {attempted ? "Retake Exam" : available ? "Take Exam" : "Coming Soon"}
//           </Text>
//         </TouchableOpacity>
//       </View>
//     </View>
//   );
// }

// export default function ExamLevelsScreen() {
//   const router = useRouter();
//   const insets = useSafeAreaInsets();
//   const { examId, examTitle } = useLocalSearchParams<{ examId: string; examTitle: string }>();

//   const [levels, setLevels] = useState<Level[]>([]);
//   const [exams, setExams] = useState<Exam[]>([]);
//   const [attemptedExamIds, setAttemptedExamIds] = useState<Set<number>>(new Set());
//   const [loading, setLoading] = useState(true);
//   const [error, setError] = useState<string | null>(null);

//   useEffect(() => {
//     if (examId) fetchData();
//   }, [examId]);

//   async function fetchData() {
//     try {
//       setLoading(true);
//       setError(null);

//       // Fetch exams, levels, and user's attempts in parallel
//       const [examsRes, levelsRes, userRes] = await Promise.all([
//         apiRequest("/exam-management/exams", "GET"),
//         supabase.from("levels").select("*").order("display_order", { ascending: true }),
//         supabase.auth.getUser(),
//       ]);

//       const allExams: Exam[] = examsRes?.data?.data ?? [];
//       const allLevels: Level[] = levelsRes.data ?? [];
//       const user = userRes.data.user;

//       // Find the selected exam
//       const selectedExam = allExams.find((e) => String(e.id) === String(examId));
//       if (!selectedExam) throw new Error("Exam not found.");

//       // Fetch attempts for this user for this specific exam
//       if (user) {
//         const { data: attempts } = await supabase
//           .from("exam_attempts")
//           .select("exam_id")
//           .eq("user_id", user.id)
//           .eq("exam_id", selectedExam.id);

//         const attemptedIds = new Set<number>(
//           (attempts ?? []).map((a: any) => a.exam_id)
//         );
//         setAttemptedExamIds(attemptedIds);
//       }

//       setLevels(allLevels);
//       setExams([selectedExam]);
//     } catch (e: any) {
//       setError(e.message ?? "Failed to load levels.");
//     } finally {
//       setLoading(false);
//     }
//   }

//   function handleTakeExam(targetExamId: number) {
//     router.push({
//       pathname: "/(student)/instructions/[id]",
//       params: { id: targetExamId },
//     });
//   }

//   return (
//     <View style={styles.safe}>
//       <StatusBar barStyle="dark-content" backgroundColor="#f8fafc" />

//       <View style={[styles.header, { paddingTop: insets.top + 10 }]}>
//         <TouchableOpacity
//           style={styles.backBtn}
//           onPress={() => router.back()}
//           hitSlop={{ top: 8, bottom: 8, left: 8, right: 8 }}
//         >
//           <Ionicons name="arrow-back" size={20} color={ACCENT} />
//         </TouchableOpacity>
//         <View style={styles.headerText}>
//           <Text style={styles.title} numberOfLines={1}>
//             {examTitle ?? "Exam Levels"}
//           </Text>
//           <Text style={styles.subtitle}>Select your level and take the exam</Text>
//         </View>
//       </View>

//       <View style={styles.headerDivider} />

//       {loading ? (
//         <View style={styles.centered}>
//           <ActivityIndicator size="large" color={ACCENT} />
//           <Text style={styles.loadingText}>Loading levels…</Text>
//         </View>
//       ) : error ? (
//         <View style={styles.centered}>
//           <Ionicons name="alert-circle-outline" size={36} color="#ef4444" />
//           <Text style={styles.errorText}>{error}</Text>
//           <TouchableOpacity style={styles.retryBtn} onPress={fetchData}>
//             <Text style={styles.retryText}>Retry</Text>
//           </TouchableOpacity>
//         </View>
//       ) : levels.length === 0 ? (
//         <View style={styles.centered}>
//           <Ionicons name="layers-outline" size={36} color="#94a3b8" />
//           <Text style={styles.loadingText}>No levels found.</Text>
//         </View>
//       ) : (
//         <ScrollView contentContainerStyle={styles.scrollContent} showsVerticalScrollIndicator={false}>
//           {levels.map((level) => {
//             const matchedExam = exams.find((e) => e.level_id === level.id);
//             const attempted = matchedExam ? attemptedExamIds.has(matchedExam.id) : false;
//             return (
//               <LevelCard
//                 key={level.id}
//                 level={level}
//                 exam={matchedExam}
//                 onTakeExam={handleTakeExam}
//                 attempted={attempted}
//               />
//             );
//           })}
//         </ScrollView>
//       )}
//     </View>
//   );
// }

// const styles = StyleSheet.create({
//   safe: { flex: 1, backgroundColor: "#f8fafc" },
//   header: {
//     flexDirection: "row", alignItems: "center",
//     paddingHorizontal: 16, paddingBottom: 12, gap: 12, backgroundColor: "#f8fafc",
//   },
//   headerDivider: { height: 1, backgroundColor: "#bfdbfe", marginHorizontal: 16, marginBottom: 10 },
//   backBtn: {
//     width: 36, height: 36, borderRadius: 10, borderWidth: 1,
//     borderColor: "#bfdbfe", backgroundColor: "#fff",
//     alignItems: "center", justifyContent: "center",
//   },
//   headerText: { flex: 1 },
//   title: { fontSize: 18, fontWeight: "700", color: "#222222", letterSpacing: -0.3 },
//   subtitle: { fontSize: 12, color: "#94a3b8", marginTop: 1 },
//   scrollContent: { paddingHorizontal: 16, paddingTop: 6, paddingBottom: 32, gap: 10 },
//   card: {
//     flexDirection: "row", backgroundColor: "#ffffff",
//     borderRadius: 12, borderWidth: 1, borderColor: "#bfdbfe", overflow: "hidden",
//   },
//   cardDisabled: { borderColor: "#e2e8f0", opacity: 0.9 },
//   accentBar: { width: 4 },
//   cardInner: { flex: 1, paddingHorizontal: 14, paddingVertical: 12, gap: 10 },
//   cardHeader: { flexDirection: "row", alignItems: "center", justifyContent: "space-between" },
//   levelName: { fontSize: 15, fontWeight: "700", color: "#222222" },
//   textMuted: { color: "#94a3b8" },
//   takenBadge: {
//     flexDirection: "row", alignItems: "center", gap: 4,
//     backgroundColor: "#f0fdf4", borderRadius: 20,
//     paddingVertical: 3, paddingHorizontal: 9,
//     borderWidth: 1, borderColor: "#bbf7d0",
//   },
//   takenText: { fontSize: 10, fontWeight: "600", color: "#22c55e", letterSpacing: 0.3 },
//   comingSoonBadge: {
//     backgroundColor: "#f1f5f9", borderRadius: 20,
//     paddingVertical: 3, paddingHorizontal: 9,
//     borderWidth: 1, borderColor: "#e2e8f0",
//   },
//   comingSoonText: { fontSize: 10, fontWeight: "600", color: "#94a3b8", letterSpacing: 0.3 },
//   availableBadge: {
//     flexDirection: "row", alignItems: "center", gap: 4,
//     backgroundColor: "#eff6ff", borderRadius: 20,
//     paddingVertical: 3, paddingHorizontal: 9,
//     borderWidth: 1, borderColor: "#bfdbfe",
//   },
//   availableText: { fontSize: 10, fontWeight: "600", color: ACCENT, letterSpacing: 0.3 },
//   statsRow: { flexDirection: "row", alignItems: "center", gap: 8 },
//   statItem: { flexDirection: "row", alignItems: "center", gap: 4 },
//   statItemLabel: { fontSize: 12, color: "#475569", fontWeight: "500" },
//   statDot: { width: 3, height: 3, borderRadius: 2, backgroundColor: "#cbd5e1" },
//   ctaButton: {
//     flexDirection: "row", alignItems: "center",
//     justifyContent: "center", borderRadius: 8, paddingVertical: 9,
//   },
//   ctaActive: { backgroundColor: ACCENT },
//   ctaRetake: { backgroundColor: "#16a34a" },
//   ctaDisabled: { backgroundColor: "#f1f5f9", borderWidth: 1, borderColor: "#e2e8f0" },
//   ctaText: { fontSize: 13, fontWeight: "700", color: "#ffffff", letterSpacing: 0.2 },
//   ctaTextDisabled: { color: "#94a3b8" },
//   centered: {
//     flex: 1, justifyContent: "center", alignItems: "center",
//     gap: 10, paddingHorizontal: 32,
//   },
//   loadingText: { fontSize: 13, color: "#94a3b8" },
//   errorText: { fontSize: 13, color: "#ef4444", textAlign: "center" },
//   retryBtn: { backgroundColor: ACCENT, borderRadius: 8, paddingVertical: 9, paddingHorizontal: 22 },
//   retryText: { color: "#fff", fontWeight: "700", fontSize: 13 },
// });

// import React, { useEffect, useState } from "react";
// import {
//   View, Text, StyleSheet, TouchableOpacity,
//   ScrollView, ActivityIndicator, StatusBar,
// } from "react-native";
// import { useRouter, useLocalSearchParams } from "expo-router";
// import { Ionicons } from "@expo/vector-icons";
// import { useSafeAreaInsets } from "react-native-safe-area-context";
// import { apiRequest } from "../../../services/api";
// import { supabase } from "../../../lib/supabase";
// import AsyncStorage from "@react-native-async-storage/async-storage";

// interface Level {
//   id: number;
//   name: string;
//   display_order: number;
//   color_class: string;
// }

// interface Exam {
//   id: number;
//   level_id: number;
//   duration_minutes: number;
//   passing_score: number;
//   total_marks: number;
//   is_active: boolean;
//   status: string;
//   subcategory_id: number;
// }

// const ACCENT = "#1F4FA3";

// // ── JWT helper — defined here in this file ─────────────────────────────────────
// async function getUserIdFromToken(): Promise<string | null> {
//   try {
//     const token = await AsyncStorage.getItem("token");
//     if (!token) {
//       console.log("No token found in AsyncStorage");
//       return null;
//     }
//     const base64Payload = token.split(".")[1];
//     const decoded = JSON.parse(atob(base64Payload));
//     console.log("JWT decoded in [examId]:", JSON.stringify(decoded));
//     return decoded.sub ?? decoded.id ?? decoded.user_id ?? decoded.userId ?? null;
//   } catch (e) {
//     console.log("JWT decode error in [examId]:", e);
//     return null;
//   }
// }

// function LevelCard({
//   level, exam, onTakeExam, attempted,
// }: {
//   level: Level;
//   exam: Exam | undefined;
//   onTakeExam: (examId: number) => void;
//   attempted: boolean;
// }) {
//   const available = !!exam && exam.is_active === true;

//   return (
//     <View style={[styles.card, !available && styles.cardDisabled]}>
//       <View style={[styles.accentBar, {
//         backgroundColor: attempted ? "#22c55e" : available ? ACCENT : "#cbd5e1"
//       }]} />
//       <View style={styles.cardInner}>
//         <View style={styles.cardHeader}>
//           <Text style={[styles.levelName, !available && styles.textMuted]}>
//             {level.name}
//           </Text>
//           {attempted ? (
//             <View style={styles.takenBadge}>
//               <Ionicons name="checkmark-circle" size={13} color="#22c55e" />
//               <Text style={styles.takenText}>Exam Taken</Text>
//             </View>
//           ) : !available ? (
//             <View style={styles.comingSoonBadge}>
//               <Text style={styles.comingSoonText}>Coming Soon</Text>
//             </View>
//           ) : (
//             <View style={styles.availableBadge}>
//               <Ionicons name="checkmark-circle" size={13} color={ACCENT} />
//               <Text style={styles.availableText}>Available</Text>
//             </View>
//           )}
//         </View>

//         <View style={styles.statsRow}>
//           <View style={styles.statItem}>
//             <Ionicons name="time-outline" size={13} color={available ? ACCENT : "#94a3b8"} />
//             <Text style={[styles.statItemLabel, !available && styles.textMuted]}>
//               {exam ? `${exam.duration_minutes} min` : "-- min"}
//             </Text>
//           </View>
//           <View style={styles.statDot} />
//           <View style={styles.statItem}>
//             <Ionicons name="help-circle-outline" size={13} color={available ? ACCENT : "#94a3b8"} />
//             <Text style={[styles.statItemLabel, !available && styles.textMuted]}>
//               {exam ? `${exam.total_marks} Qs` : "-- Qs"}
//             </Text>
//           </View>
//           <View style={styles.statDot} />
//           <View style={styles.statItem}>
//             <Ionicons name="ribbon-outline" size={13} color={available ? ACCENT : "#94a3b8"} />
//             <Text style={[styles.statItemLabel, !available && styles.textMuted]}>
//               Pass {exam ? `${exam.passing_score}%` : "--%"}
//             </Text>
//           </View>
//         </View>

//         <TouchableOpacity
//           style={[
//             styles.ctaButton,
//             attempted ? styles.ctaRetake :
//             available ? styles.ctaActive : styles.ctaDisabled
//           ]}
//           onPress={() => available && exam && onTakeExam(exam.id)}
//           disabled={!available}
//           activeOpacity={0.75}
//         >
//           {available && (
//             <Ionicons
//               name={attempted ? "refresh-circle-outline" : "play-circle-outline"}
//               size={15} color="#fff" style={{ marginRight: 5 }}
//             />
//           )}
//           <Text style={[styles.ctaText, !available && styles.ctaTextDisabled]}>
//             {attempted ? "Retake Exam" : available ? "Take Exam" : "Coming Soon"}
//           </Text>
//         </TouchableOpacity>
//       </View>
//     </View>
//   );
// }

// export default function ExamLevelsScreen() {
//   const router = useRouter();
//   const insets = useSafeAreaInsets();
//   const { examId, examTitle } = useLocalSearchParams<{ examId: string; examTitle: string }>();

//   const [levels, setLevels] = useState<Level[]>([]);
//   const [exams, setExams] = useState<Exam[]>([]);
//   const [attemptedExamIds, setAttemptedExamIds] = useState<Set<number>>(new Set());
//   const [loading, setLoading] = useState(true);
//   const [error, setError] = useState<string | null>(null);

//   useEffect(() => {
//     if (examId) fetchData();
//   }, [examId]);

//   async function fetchData() {
//     try {
//       setLoading(true);
//       setError(null);

//       const [examsRes, levelsRes] = await Promise.all([
//         apiRequest("/exam-management/exams", "GET"),
//         supabase.from("levels").select("*").order("display_order", { ascending: true }),
//       ]);

//       const allExams: Exam[] = examsRes?.data?.data ?? [];
//       const allLevels: Level[] = levelsRes.data ?? [];

//       const selectedExam = allExams.find((e) => String(e.id) === String(examId));
//       if (!selectedExam) throw new Error("Exam not found.");

//       // ── Debug logs ──
//       console.log("=== LEVEL PAGE DEBUG ===");
//       console.log("examId param:", examId);
//       console.log("selectedExam.id:", selectedExam.id, "type:", typeof selectedExam.id);

//       const userId = await getUserIdFromToken();
//       console.log("userId:", userId);

//       if (userId) {
//         const { data: attempts, error: attemptsError } = await supabase
//           .from("exam_attempts")
//           .select("exam_id")
//           .eq("user_id", userId)
//           .eq("exam_id", selectedExam.id);

//         console.log("attempts result:", JSON.stringify(attempts));
//         console.log("attemptsError:", JSON.stringify(attemptsError));

//         const attemptedIds = new Set<number>(
//           (attempts ?? []).map((a: any) => Number(a.exam_id))
//         );
//         console.log("attemptedIds set:", [...attemptedIds]);
//         console.log("selectedExam.id in set?", attemptedIds.has(selectedExam.id));
//         setAttemptedExamIds(attemptedIds);
//       } else {
//         console.log("userId is null — skipping attempts fetch");
//       }

//       setLevels(allLevels);
//       setExams([selectedExam]);
//     } catch (e: any) {
//       setError(e.message ?? "Failed to load levels.");
//     } finally {
//       setLoading(false);
//     }
//   }

//   function handleTakeExam(targetExamId: number) {
//     router.push({
//       pathname: "/(student)/instructions/[id]",
//       params: { id: targetExamId },
//     });
//   }

//   return (
//     <View style={styles.safe}>
//       <StatusBar barStyle="dark-content" backgroundColor="#f8fafc" />

//       <View style={[styles.header, { paddingTop: insets.top + 10 }]}>
//         <TouchableOpacity
//           style={styles.backBtn}
//           onPress={() => router.back()}
//           hitSlop={{ top: 8, bottom: 8, left: 8, right: 8 }}
//         >
//           <Ionicons name="arrow-back" size={20} color={ACCENT} />
//         </TouchableOpacity>
//         <View style={styles.headerText}>
//           <Text style={styles.title} numberOfLines={1}>
//             {examTitle ?? "Exam Levels"}
//           </Text>
//           <Text style={styles.subtitle}>Select your level and take the exam</Text>
//         </View>
//       </View>

//       <View style={styles.headerDivider} />

//       {loading ? (
//         <View style={styles.centered}>
//           <ActivityIndicator size="large" color={ACCENT} />
//           <Text style={styles.loadingText}>Loading levels…</Text>
//         </View>
//       ) : error ? (
//         <View style={styles.centered}>
//           <Ionicons name="alert-circle-outline" size={36} color="#ef4444" />
//           <Text style={styles.errorText}>{error}</Text>
//           <TouchableOpacity style={styles.retryBtn} onPress={fetchData}>
//             <Text style={styles.retryText}>Retry</Text>
//           </TouchableOpacity>
//         </View>
//       ) : levels.length === 0 ? (
//         <View style={styles.centered}>
//           <Ionicons name="layers-outline" size={36} color="#94a3b8" />
//           <Text style={styles.loadingText}>No levels found.</Text>
//         </View>
//       ) : (
//         <ScrollView
//           contentContainerStyle={styles.scrollContent}
//           showsVerticalScrollIndicator={false}
//         >
//           {levels.map((level) => {
//             const matchedExam = exams.find((e) => e.level_id === level.id);
//             const attempted = matchedExam ? attemptedExamIds.has(matchedExam.id) : false;
//             console.log(`Level ${level.name}: matchedExam=${matchedExam?.id}, attempted=${attempted}`);
//             return (
//               <LevelCard
//                 key={level.id}
//                 level={level}
//                 exam={matchedExam}
//                 onTakeExam={handleTakeExam}
//                 attempted={attempted}
//               />
//             );
//           })}
//         </ScrollView>
//       )}
//     </View>
//   );
// }

// const styles = StyleSheet.create({
//   safe: { flex: 1, backgroundColor: "#f8fafc" },
//   header: {
//     flexDirection: "row", alignItems: "center",
//     paddingHorizontal: 16, paddingBottom: 12, gap: 12, backgroundColor: "#f8fafc",
//   },
//   headerDivider: { height: 1, backgroundColor: "#bfdbfe", marginHorizontal: 16, marginBottom: 10 },
//   backBtn: {
//     width: 36, height: 36, borderRadius: 10, borderWidth: 1,
//     borderColor: "#bfdbfe", backgroundColor: "#fff",
//     alignItems: "center", justifyContent: "center",
//   },
//   headerText: { flex: 1 },
//   title: { fontSize: 18, fontWeight: "700", color: "#222222", letterSpacing: -0.3 },
//   subtitle: { fontSize: 12, color: "#94a3b8", marginTop: 1 },
//   scrollContent: { paddingHorizontal: 16, paddingTop: 6, paddingBottom: 32, gap: 10 },
//   card: {
//     flexDirection: "row", backgroundColor: "#ffffff",
//     borderRadius: 12, borderWidth: 1, borderColor: "#bfdbfe", overflow: "hidden",
//   },
//   cardDisabled: { borderColor: "#e2e8f0", opacity: 0.9 },
//   accentBar: { width: 4 },
//   cardInner: { flex: 1, paddingHorizontal: 14, paddingVertical: 12, gap: 10 },
//   cardHeader: { flexDirection: "row", alignItems: "center", justifyContent: "space-between" },
//   levelName: { fontSize: 15, fontWeight: "700", color: "#222222" },
//   textMuted: { color: "#94a3b8" },
//   takenBadge: {
//     flexDirection: "row", alignItems: "center", gap: 4,
//     backgroundColor: "#f0fdf4", borderRadius: 20,
//     paddingVertical: 3, paddingHorizontal: 9,
//     borderWidth: 1, borderColor: "#bbf7d0",
//   },
//   takenText: { fontSize: 10, fontWeight: "600", color: "#22c55e", letterSpacing: 0.3 },
//   comingSoonBadge: {
//     backgroundColor: "#f1f5f9", borderRadius: 20,
//     paddingVertical: 3, paddingHorizontal: 9,
//     borderWidth: 1, borderColor: "#e2e8f0",
//   },
//   comingSoonText: { fontSize: 10, fontWeight: "600", color: "#94a3b8", letterSpacing: 0.3 },
//   availableBadge: {
//     flexDirection: "row", alignItems: "center", gap: 4,
//     backgroundColor: "#eff6ff", borderRadius: 20,
//     paddingVertical: 3, paddingHorizontal: 9,
//     borderWidth: 1, borderColor: "#bfdbfe",
//   },
//   availableText: { fontSize: 10, fontWeight: "600", color: ACCENT, letterSpacing: 0.3 },
//   statsRow: { flexDirection: "row", alignItems: "center", gap: 8 },
//   statItem: { flexDirection: "row", alignItems: "center", gap: 4 },
//   statItemLabel: { fontSize: 12, color: "#475569", fontWeight: "500" },
//   statDot: { width: 3, height: 3, borderRadius: 2, backgroundColor: "#cbd5e1" },
//   ctaButton: {
//     flexDirection: "row", alignItems: "center",
//     justifyContent: "center", borderRadius: 8, paddingVertical: 9,
//   },
//   ctaActive: { backgroundColor: ACCENT },
//   ctaRetake: { backgroundColor: "#16a34a" },
//   ctaDisabled: { backgroundColor: "#f1f5f9", borderWidth: 1, borderColor: "#e2e8f0" },
//   ctaText: { fontSize: 13, fontWeight: "700", color: "#ffffff", letterSpacing: 0.2 },
//   ctaTextDisabled: { color: "#94a3b8" },
//   centered: {
//     flex: 1, justifyContent: "center", alignItems: "center",
//     gap: 10, paddingHorizontal: 32,
//   },
//   loadingText: { fontSize: 13, color: "#94a3b8" },
//   errorText: { fontSize: 13, color: "#ef4444", textAlign: "center" },
//   retryBtn: { backgroundColor: ACCENT, borderRadius: 8, paddingVertical: 9, paddingHorizontal: 22 },
//   retryText: { color: "#fff", fontWeight: "700", fontSize: 13 },
// });

import React, { useEffect, useState } from "react";
import {
  View, Text, StyleSheet, TouchableOpacity,
  ScrollView, ActivityIndicator, StatusBar,
} from "react-native";
import { useRouter, useLocalSearchParams } from "expo-router";
import { Ionicons } from "@expo/vector-icons";
import { useSafeAreaInsets } from "react-native-safe-area-context";
import { apiRequest } from "../../../services/api";
import { supabase } from "../../../lib/supabase";
import AsyncStorage from "@react-native-async-storage/async-storage";

interface Level {
  id: number;
  name: string;
  display_order: number;
  color_class: string;
}

interface Exam {
  id: number;
  level_id: number;
  duration_minutes: number;
  passing_score: number;
  total_marks: number;
  is_active: boolean;
  status: string;
  subcategory_id: number;
}

const ACCENT = "#1F4FA3";

async function getUserIdFromToken(): Promise<string | null> {
  try {
    const token = await AsyncStorage.getItem("token");
    if (!token) return null;
    const base64Payload = token.split(".")[1];
    const decoded = JSON.parse(atob(base64Payload));
    return decoded.sub ?? decoded.id ?? decoded.user_id ?? decoded.userId ?? null;
  } catch (e) {
    return null;
  }
}

function LevelCard({
  level, exam, onTakeExam, attempted,
}: {
  level: Level;
  exam: Exam | undefined;
  onTakeExam: (examId: number) => void;
  attempted: boolean;
}) {
  const available = !!exam && exam.is_active === true;

  return (
    <View style={[styles.card, !available && styles.cardDisabled]}>
      <View style={[styles.accentBar, {
        backgroundColor: attempted ? "#22c55e" : available ? ACCENT : "#cbd5e1"
      }]} />
      <View style={styles.cardInner}>
        <View style={styles.cardHeader}>
          <Text style={[styles.levelName, !available && styles.textMuted]}>
            {level.name}
          </Text>
          {attempted ? (
            <View style={styles.takenBadge}>
              <Ionicons name="checkmark-circle" size={13} color="#22c55e" />
              <Text style={styles.takenText}>Exam Taken</Text>
            </View>
          ) : !available ? (
            <View style={styles.comingSoonBadge}>
              <Text style={styles.comingSoonText}>Coming Soon</Text>
            </View>
          ) : (
            <View style={styles.availableBadge}>
              <Ionicons name="checkmark-circle" size={13} color={ACCENT} />
              <Text style={styles.availableText}>Available</Text>
            </View>
          )}
        </View>

        <View style={styles.statsRow}>
          <View style={styles.statItem}>
            <Ionicons name="time-outline" size={13} color={available ? ACCENT : "#94a3b8"} />
            <Text style={[styles.statItemLabel, !available && styles.textMuted]}>
              {exam ? `${exam.duration_minutes} min` : "-- min"}
            </Text>
          </View>
          <View style={styles.statDot} />
          <View style={styles.statItem}>
            <Ionicons name="help-circle-outline" size={13} color={available ? ACCENT : "#94a3b8"} />
            <Text style={[styles.statItemLabel, !available && styles.textMuted]}>
              {exam ? `${exam.total_marks} Qs` : "-- Qs"}
            </Text>
          </View>
          <View style={styles.statDot} />
          <View style={styles.statItem}>
            <Ionicons name="ribbon-outline" size={13} color={available ? ACCENT : "#94a3b8"} />
            <Text style={[styles.statItemLabel, !available && styles.textMuted]}>
              Pass {exam ? `${exam.passing_score}%` : "--%"}
            </Text>
          </View>
        </View>

        <TouchableOpacity
          style={[
            styles.ctaButton,
            attempted ? styles.ctaTaken :
            available ? styles.ctaActive : styles.ctaDisabled
          ]}
          onPress={() => !attempted && available && exam && onTakeExam(exam.id)}
          disabled={!available || attempted}
          activeOpacity={attempted ? 1 : 0.75}
        >
          <Ionicons
            name={
              attempted ? "checkmark-circle-outline" :
              available ? "play-circle-outline" : "lock-closed-outline"
            }
            size={15}
            color={attempted ? "#22c55e" : available ? "#fff" : "#94a3b8"}
            style={{ marginRight: 5 }}
          />
          <Text style={[
            styles.ctaText,
            attempted ? styles.ctaTextTaken :
            !available ? styles.ctaTextDisabled : null
          ]}>
            {attempted ? "Exam Already Taken" : available ? "Take Exam" : "Coming Soon"}
          </Text>
        </TouchableOpacity>
      </View>
    </View>
  );
}

export default function ExamLevelsScreen() {
  const router = useRouter();
  const insets = useSafeAreaInsets();
  const { examId, examTitle } = useLocalSearchParams<{ examId: string; examTitle: string }>();

  const [levels, setLevels] = useState<Level[]>([]);
  const [exams, setExams] = useState<Exam[]>([]);
  const [attemptedExamIds, setAttemptedExamIds] = useState<Set<number>>(new Set());
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  useEffect(() => {
    if (examId) fetchData();
  }, [examId]);

  async function fetchData() {
    try {
      setLoading(true);
      setError(null);

      const [examsRes, levelsRes] = await Promise.all([
        apiRequest("/exam-management/exams", "GET"),
        supabase.from("levels").select("*").order("display_order", { ascending: true }),
      ]);

      const allExams: Exam[] = examsRes?.data?.data ?? [];
      const allLevels: Level[] = levelsRes.data ?? [];

      const selectedExam = allExams.find((e) => String(e.id) === String(examId));
      if (!selectedExam) throw new Error("Exam not found.");

      // Use JWT token — NOT supabase.auth.getUser() which returns null on mobile
      const userId = await getUserIdFromToken();

      if (userId) {
        const { data: attempts } = await supabase
          .from("exam_attempts")
          .select("exam_id")
          .eq("user_id", userId)
          .eq("exam_id", selectedExam.id);

        const attemptedIds = new Set<number>(
          (attempts ?? []).map((a: any) => Number(a.exam_id))
        );
        setAttemptedExamIds(attemptedIds);
      }

      setLevels(allLevels);
      setExams([selectedExam]);
    } catch (e: any) {
      setError(e.message ?? "Failed to load levels.");
    } finally {
      setLoading(false);
    }
  }

  function handleTakeExam(targetExamId: number) {
    router.push({
      pathname: "/(student)/instructions/[id]",
      params: { id: targetExamId },
    });
  }

  return (
    <View style={styles.safe}>
      <StatusBar barStyle="dark-content" backgroundColor="#f8fafc" />

      <View style={[styles.header, { paddingTop: insets.top + 10 }]}>
        <TouchableOpacity
          style={styles.backBtn}
          onPress={() => router.back()}
          hitSlop={{ top: 8, bottom: 8, left: 8, right: 8 }}
        >
          <Ionicons name="arrow-back" size={20} color={ACCENT} />
        </TouchableOpacity>
        <View style={styles.headerText}>
          <Text style={styles.title} numberOfLines={1}>
            {examTitle ?? "Exam Levels"}
          </Text>
          <Text style={styles.subtitle}>Select your level and take the exam</Text>
        </View>
      </View>

      <View style={styles.headerDivider} />

      {loading ? (
        <View style={styles.centered}>
          <ActivityIndicator size="large" color={ACCENT} />
          <Text style={styles.loadingText}>Loading levels…</Text>
        </View>
      ) : error ? (
        <View style={styles.centered}>
          <Ionicons name="alert-circle-outline" size={36} color="#ef4444" />
          <Text style={styles.errorText}>{error}</Text>
          <TouchableOpacity style={styles.retryBtn} onPress={fetchData}>
            <Text style={styles.retryText}>Retry</Text>
          </TouchableOpacity>
        </View>
      ) : levels.length === 0 ? (
        <View style={styles.centered}>
          <Ionicons name="layers-outline" size={36} color="#94a3b8" />
          <Text style={styles.loadingText}>No levels found.</Text>
        </View>
      ) : (
        <ScrollView
          contentContainerStyle={styles.scrollContent}
          showsVerticalScrollIndicator={false}
        >
          {levels.map((level) => {
            const matchedExam = exams.find((e) => e.level_id === level.id);
            const attempted = matchedExam ? attemptedExamIds.has(matchedExam.id) : false;
            return (
              <LevelCard
                key={level.id}
                level={level}
                exam={matchedExam}
                onTakeExam={handleTakeExam}
                attempted={attempted}
              />
            );
          })}
        </ScrollView>
      )}
    </View>
  );
}

const styles = StyleSheet.create({
  safe: { flex: 1, backgroundColor: "#f8fafc" },
  header: {
    flexDirection: "row", alignItems: "center",
    paddingHorizontal: 16, paddingBottom: 12, gap: 12, backgroundColor: "#f8fafc",
  },
  headerDivider: { height: 1, backgroundColor: "#bfdbfe", marginHorizontal: 16, marginBottom: 10 },
  backBtn: {
    width: 36, height: 36, borderRadius: 10, borderWidth: 1,
    borderColor: "#bfdbfe", backgroundColor: "#fff",
    alignItems: "center", justifyContent: "center",
  },
  headerText: { flex: 1 },
  title: { fontSize: 18, fontWeight: "700", color: "#222222", letterSpacing: -0.3 },
  subtitle: { fontSize: 12, color: "#94a3b8", marginTop: 1 },
  scrollContent: { paddingHorizontal: 16, paddingTop: 6, paddingBottom: 32, gap: 10 },
  card: {
    flexDirection: "row", backgroundColor: "#ffffff",
    borderRadius: 12, borderWidth: 1, borderColor: "#bfdbfe", overflow: "hidden",
  },
  cardDisabled: { borderColor: "#e2e8f0", opacity: 0.9 },
  accentBar: { width: 4 },
  cardInner: { flex: 1, paddingHorizontal: 14, paddingVertical: 12, gap: 10 },
  cardHeader: { flexDirection: "row", alignItems: "center", justifyContent: "space-between" },
  levelName: { fontSize: 15, fontWeight: "700", color: "#222222" },
  textMuted: { color: "#94a3b8" },
  takenBadge: {
    flexDirection: "row", alignItems: "center", gap: 4,
    backgroundColor: "#f0fdf4", borderRadius: 20,
    paddingVertical: 3, paddingHorizontal: 9,
    borderWidth: 1, borderColor: "#bbf7d0",
  },
  takenText: { fontSize: 10, fontWeight: "600", color: "#22c55e", letterSpacing: 0.3 },
  comingSoonBadge: {
    backgroundColor: "#f1f5f9", borderRadius: 20,
    paddingVertical: 3, paddingHorizontal: 9,
    borderWidth: 1, borderColor: "#e2e8f0",
  },
  comingSoonText: { fontSize: 10, fontWeight: "600", color: "#94a3b8", letterSpacing: 0.3 },
  availableBadge: {
    flexDirection: "row", alignItems: "center", gap: 4,
    backgroundColor: "#eff6ff", borderRadius: 20,
    paddingVertical: 3, paddingHorizontal: 9,
    borderWidth: 1, borderColor: "#bfdbfe",
  },
  availableText: { fontSize: 10, fontWeight: "600", color: ACCENT, letterSpacing: 0.3 },
  statsRow: { flexDirection: "row", alignItems: "center", gap: 8 },
  statItem: { flexDirection: "row", alignItems: "center", gap: 4 },
  statItemLabel: { fontSize: 12, color: "#475569", fontWeight: "500" },
  statDot: { width: 3, height: 3, borderRadius: 2, backgroundColor: "#cbd5e1" },
  ctaButton: {
    flexDirection: "row", alignItems: "center",
    justifyContent: "center", borderRadius: 8, paddingVertical: 9,
  },
  ctaActive: { backgroundColor: ACCENT },
  ctaTaken: {
    backgroundColor: "#f0fdf4",
    borderWidth: 1, borderColor: "#bbf7d0",
  },
  ctaDisabled: { backgroundColor: "#f1f5f9", borderWidth: 1, borderColor: "#e2e8f0" },
  ctaText: { fontSize: 13, fontWeight: "700", color: "#ffffff", letterSpacing: 0.2 },
  ctaTextTaken: { color: "#22c55e" },
  ctaTextDisabled: { color: "#94a3b8" },
  centered: {
    flex: 1, justifyContent: "center", alignItems: "center",
    gap: 10, paddingHorizontal: 32,
  },
  loadingText: { fontSize: 13, color: "#94a3b8" },
  errorText: { fontSize: 13, color: "#ef4444", textAlign: "center" },
  retryBtn: { backgroundColor: ACCENT, borderRadius: 8, paddingVertical: 9, paddingHorizontal: 22 },
  retryText: { color: "#fff", fontWeight: "700", fontSize: 13 },
});