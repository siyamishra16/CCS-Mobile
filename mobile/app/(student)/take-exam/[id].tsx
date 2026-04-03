// import React, { useEffect, useState, useRef, useCallback } from "react";
// import {
//   View,
//   Text,
//   StyleSheet,
//   TouchableOpacity,
//   ScrollView,
//   ActivityIndicator,
//   StatusBar,
//   Alert,
//   Modal,
//   BackHandler,
// } from "react-native";
// import { useRouter, useLocalSearchParams } from "expo-router";
// import { Ionicons } from "@expo/vector-icons";
// import { useSafeAreaInsets } from "react-native-safe-area-context";
// import { apiRequest } from "../../../services/api";
// import { supabase } from "../../../lib/supabase";

// interface Question {
//   id: number;
//   exam_id: number;
//   module_id: number;
//   question_text: string;
//   marks: number;
//   difficulty: string;
//   display_order: number;
//   question_data: {
//     options?: string[];
//     correct_index?: number;
//     correct_answer?: string;
//     answers?: string[];
//   };
// }

// type QuestionStatus = "not_visited" | "answered" | "not_answered" | "marked" | "answered_marked";

// interface QuestionState {
//   status: QuestionStatus;
//   selectedOption: number | null;
// }

// const ACCENT = "#1F4FA3";
// const COLORS = {
//   answered: "#1F4FA3",
//   not_answered: "#ef4444",
//   marked: "#f59e0b",
//   answered_marked: "#1F4FA3",
//   not_visited: "#94a3b8",
// };

// function formatTime(seconds: number) {
//   const m = Math.floor(seconds / 60).toString().padStart(2, "0");
//   const s = (seconds % 60).toString().padStart(2, "0");
//   return `${m}:${s}`;
// }

// function PaletteModal({
//   visible, questions, states, currentIndex, onJump, onClose, onFinish,
// }: {
//   visible: boolean;
//   questions: Question[];
//   states: QuestionState[];
//   currentIndex: number;
//   onJump: (i: number) => void;
//   onClose: () => void;
//   onFinish: () => void;
// }) {
//   const counts = {
//     answered: states.filter((s) => s.status === "answered" || s.status === "answered_marked").length,
//     not_answered: states.filter((s) => s.status === "not_answered").length,
//     marked: states.filter((s) => s.status === "marked").length,
//     answered_marked: states.filter((s) => s.status === "answered_marked").length,
//     not_visited: states.filter((s) => s.status === "not_visited").length,
//   };

//   return (
//     <Modal visible={visible} animationType="slide" transparent>
//       <View style={pm.overlay}>
//         <View style={pm.sheet}>
//           <View style={pm.sheetHeader}>
//             <Text style={pm.sheetTitle}>Question Palette</Text>
//             <TouchableOpacity onPress={onClose} style={pm.closeBtn}>
//               <Ionicons name="close" size={20} color="#64748b" />
//             </TouchableOpacity>
//           </View>

//           <View style={pm.legend}>
//             {(["answered", "not_answered", "marked", "answered_marked", "not_visited"] as QuestionStatus[]).map((s) => (
//               <View key={s} style={pm.legendItem}>
//                 <View style={[pm.legendDot, { backgroundColor: COLORS[s] }]} />
//                 <Text style={pm.legendLabel}>
//                   {s === "answered" ? "Answered" :
//                    s === "not_answered" ? "Not Answered" :
//                    s === "marked" ? "Marked for Review" :
//                    s === "answered_marked" ? "Answered & Marked" : "Not Visited"}
//                 </Text>
//                 <Text style={pm.legendCount}>{counts[s]}</Text>
//               </View>
//             ))}
//           </View>

//           <View style={pm.divider} />

//           <ScrollView contentContainerStyle={pm.grid}>
//             {questions.map((q, i) => (
//               <TouchableOpacity
//                 key={q.id}
//                 style={[
//                   pm.gridBtn,
//                   { backgroundColor: COLORS[states[i]?.status ?? "not_visited"] },
//                   i === currentIndex && pm.gridBtnActive,
//                 ]}
//                 onPress={() => { onJump(i); onClose(); }}
//               >
//                 <Text style={pm.gridBtnText}>{i + 1}</Text>
//               </TouchableOpacity>
//             ))}
//           </ScrollView>

//           <TouchableOpacity style={pm.finishBtn} onPress={onFinish}>
//             <Ionicons name="paper-plane-outline" size={16} color="#fff" style={{ marginRight: 6 }} />
//             <Text style={pm.finishBtnText}>Finish Test</Text>
//           </TouchableOpacity>
//         </View>
//       </View>
//     </Modal>
//   );
// }

// export default function TakeExamScreen() {
//   const router = useRouter();
//   const insets = useSafeAreaInsets();
//   const { id } = useLocalSearchParams<{ id: string }>();

//   const [questions, setQuestions] = useState<Question[]>([]);
//   const [states, setStates] = useState<QuestionState[]>([]);
//   const [currentIndex, setCurrentIndex] = useState(0);
//   const [timeLeft, setTimeLeft] = useState(0);
//   const [examTitle, setExamTitle] = useState("Exam");
//   const [loading, setLoading] = useState(true);
//   const [submitting, setSubmitting] = useState(false);
//   const [paletteVisible, setPaletteVisible] = useState(false);
//   const timerRef = useRef<ReturnType<typeof setInterval> | null>(null);

//   useEffect(() => {
//     if (id) fetchData();
//     return () => { if (timerRef.current) clearInterval(timerRef.current); };
//   }, [id]);

//   useEffect(() => {
//     const sub = BackHandler.addEventListener("hardwareBackPress", () => {
//       confirmExit();
//       return true;
//     });
//     return () => sub.remove();
//   }, []);

//   async function fetchData() {
//     try {
//       setLoading(true);
//       const [examsRes, questionsRes]: any[] = await Promise.all([
//         apiRequest("/exam-management/exams", "GET"),
//         apiRequest("/exam-management/exam-questions", "GET"),
//       ]);

//       const allExams = examsRes?.data?.data ?? [];
//       const allQuestions: Question[] = questionsRes?.data?.data ?? [];

//       const exam = allExams.find((e: any) => String(e.id) === String(id));
//       if (!exam) throw new Error("Exam not found");

//       const examQs = allQuestions
//         .filter((q) => String(q.exam_id) === String(id))
//         .sort((a, b) => a.display_order - b.display_order);

//       setExamTitle(exam.title ?? "Exam");
//       setQuestions(examQs);
//       setStates(examQs.map(() => ({ status: "not_visited", selectedOption: null })));
//       setTimeLeft((exam.duration_minutes ?? 5) * 60);

//       timerRef.current = setInterval(() => {
//         setTimeLeft((prev) => {
//           if (prev <= 1) {
//             clearInterval(timerRef.current!);
//             handleAutoSubmit();
//             return 0;
//           }
//           return prev - 1;
//         });
//       }, 1000);
//     } catch (e: any) {
//       Alert.alert("Error", e.message ?? "Failed to load exam.");
//       router.back();
//     } finally {
//       setLoading(false);
//     }
//   }

//   const markVisited = useCallback((index: number, currentStates: QuestionState[]) => {
//     const s = currentStates[index];
//     if (s.status === "not_visited") {
//       const updated = [...currentStates];
//       updated[index] = { ...s, status: "not_answered" };
//       return updated;
//     }
//     return currentStates;
//   }, []);

//   useEffect(() => {
//     if (questions.length > 0 && states.length > 0) {
//       setStates((prev) => markVisited(0, prev));
//     }
//   }, [questions.length]);

//   function selectOption(optionIndex: number) {
//     setStates((prev) => {
//       const updated = [...prev];
//       const cur = updated[currentIndex];
//       const alreadySelected = cur.selectedOption === optionIndex;
//       updated[currentIndex] = {
//         selectedOption: alreadySelected ? null : optionIndex,
//         status: alreadySelected
//           ? "not_answered"
//           : cur.status === "marked" || cur.status === "answered_marked"
//           ? "answered_marked"
//           : "answered",
//       };
//       return updated;
//     });
//   }

//   function clearAnswer() {
//     setStates((prev) => {
//       const updated = [...prev];
//       updated[currentIndex] = { selectedOption: null, status: "not_answered" };
//       return updated;
//     });
//   }

//   function toggleMarkForReview() {
//     setStates((prev) => {
//       const updated = [...prev];
//       const cur = updated[currentIndex];
//       const hasAnswer = cur.selectedOption !== null;
//       updated[currentIndex] = {
//         ...cur,
//         status:
//           cur.status === "marked" || cur.status === "answered_marked"
//             ? hasAnswer ? "answered" : "not_answered"
//             : hasAnswer ? "answered_marked" : "marked",
//       };
//       return updated;
//     });
//   }

//   function goTo(index: number) {
//     setStates((prev) => markVisited(index, prev));
//     setCurrentIndex(index);
//   }

//   function goNext() {
//     if (currentIndex < questions.length - 1) goTo(currentIndex + 1);
//   }

//   function goPrev() {
//     if (currentIndex > 0) goTo(currentIndex - 1);
//   }

//   async function handleAutoSubmit() {
//     await submitExam(true);
//   }

//   function confirmFinish() {
//     const unanswered = states.filter(
//       (s) => s.status === "not_answered" || s.status === "not_visited" || s.status === "marked"
//     ).length;
//     Alert.alert(
//       "Finish Test",
//       unanswered > 0
//         ? `You have ${unanswered} unanswered question(s). Are you sure you want to submit?`
//         : "Are you sure you want to submit the test?",
//       [
//         { text: "Cancel", style: "cancel" },
//         { text: "Submit", style: "destructive", onPress: () => submitExam(false) },
//       ]
//     );
//   }

//   function confirmExit() {
//     Alert.alert(
//       "Exit Exam",
//       "Are you sure you want to exit? Your progress will be lost.",
//       [
//         { text: "Stay", style: "cancel" },
//         { text: "Exit", style: "destructive", onPress: () => router.back() },
//       ]
//     );
//   }

//   async function submitExam(auto: boolean) {
//     if (timerRef.current) clearInterval(timerRef.current);
//     setSubmitting(true);

//     try {
//       let score = 0;
//       questions.forEach((q, i) => {
//         const s = states[i];
//         if (s.selectedOption === null) return;
//         const cd = q.question_data;
//         const correct =
//           cd.correct_index !== undefined
//             ? s.selectedOption === cd.correct_index
//             : cd.correct_answer !== undefined
//             ? cd.options?.[s.selectedOption] === cd.correct_answer
//             : false;
//         if (correct) score += q.marks ?? 1;
//       });

//       const totalMarks = questions.reduce((sum, q) => sum + (q.marks ?? 1), 0);
//       const percentage = totalMarks > 0 ? Math.round((score / totalMarks) * 100) : 0;

//       const payload = {
//         exam_id: Number(id),
//         score,
//         total_questions: questions.length,
//         percentage,
//       };

//       let attemptId: number | null = null;
//       const res: any = await apiRequest("/exam-management/attempts", "POST", payload);
//       if (res?.data?.data?.id) {
//         attemptId = res.data.data.id;
//       } else {
//         const { data: { user } } = await supabase.auth.getUser();
//         const { data: inserted } = await supabase
//           .from("exam_attempts")
//           .insert({
//             exam_id: Number(id),
//             user_id: user?.id,
//             score,
//             total_questions: questions.length,
//             percentage,
//             result_status: percentage >= 40 ? "PASSED" : "FAILED",
//           })
//           .select("id")
//           .single();
//         attemptId = inserted?.id ?? null;
//       }

//       router.replace({
//         pathname: "/(student)/result/[id]",
//         params: {
//           id: attemptId ?? 0,
//           examId: id,
//           score,
//           totalMarks,
//           totalQuestions: questions.length,
//           percentage,
//           examTitle,
//         },
//       });
//     } catch (e: any) {
//       Alert.alert("Error", "Failed to submit exam. Please try again.");
//       setSubmitting(false);
//     }
//   }

//   if (loading) {
//     return (
//       <View style={styles.centered}>
//         <ActivityIndicator size="large" color={ACCENT} />
//         <Text style={styles.loadingText}>Loading exam…</Text>
//       </View>
//     );
//   }

//   if (submitting) {
//     return (
//       <View style={styles.centered}>
//         <ActivityIndicator size="large" color={ACCENT} />
//         <Text style={styles.loadingText}>Submitting exam…</Text>
//       </View>
//     );
//   }

//   const q = questions[currentIndex];
//   const qState = states[currentIndex];
//   const options = q?.question_data?.options ?? [];
//   const isMarked = qState?.status === "marked" || qState?.status === "answered_marked";
//   const isLowTime = timeLeft <= 60;

//   return (
//     <View style={styles.safe}>
//       <StatusBar barStyle="light-content" backgroundColor={ACCENT} />

//       <View style={[styles.header, { paddingTop: insets.top + 6 }]}>
//         <View style={styles.headerLeft}>
//           <Text style={styles.headerTitle} numberOfLines={1}>{examTitle}</Text>
//           <Text style={styles.headerSub}>Skill Assessment Test</Text>
//         </View>
//         <TouchableOpacity style={styles.exitBtn} onPress={confirmExit}>
//           <Ionicons name="close" size={18} color="#fff" />
//         </TouchableOpacity>
//         <View style={[styles.timerBox, isLowTime && styles.timerBoxRed]}>
//           <Ionicons name="time-outline" size={13} color={isLowTime ? "#ef4444" : ACCENT} />
//           <Text style={[styles.timerText, isLowTime && styles.timerTextRed]}>
//             {formatTime(timeLeft)}
//           </Text>
//         </View>
//       </View>

//       <ScrollView contentContainerStyle={styles.scrollContent} showsVerticalScrollIndicator={false}>
//         <View style={styles.card}>
//           <View style={styles.qTopRow}>
//             <View style={styles.qBadge}>
//               <Text style={styles.qBadgeText}>Q {currentIndex + 1} of {questions.length}</Text>
//             </View>
//             <TouchableOpacity
//               style={[styles.reviewBtn, isMarked && styles.reviewBtnActive]}
//               onPress={toggleMarkForReview}
//             >
//               <Ionicons
//                 name={isMarked ? "bookmark" : "bookmark-outline"}
//                 size={14}
//                 color={isMarked ? "#f59e0b" : "#64748b"}
//               />
//               <Text style={[styles.reviewBtnText, isMarked && styles.reviewBtnTextActive]}>
//                 {isMarked ? "Marked" : "Mark for Review"}
//               </Text>
//             </TouchableOpacity>
//           </View>

//           <View style={styles.moduleBadge}>
//             <Text style={styles.moduleBadgeText}>MCQs</Text>
//           </View>

//           <Text style={styles.qText}>{q?.question_text}</Text>

//           <View style={styles.optionsContainer}>
//             {options.map((opt, i) => {
//               const selected = qState?.selectedOption === i;
//               return (
//                 <TouchableOpacity
//                   key={i}
//                   style={[styles.optionRow, selected && styles.optionRowSelected]}
//                   onPress={() => selectOption(i)}
//                   activeOpacity={0.8}
//                 >
//                   <View style={[styles.optionLetter, selected && styles.optionLetterSelected]}>
//                     <Text style={[styles.optionLetterText, selected && styles.optionLetterTextSelected]}>
//                       {String.fromCharCode(65 + i)}
//                     </Text>
//                   </View>
//                   <Text style={[styles.optionText, selected && styles.optionTextSelected]}>
//                     {opt}
//                   </Text>
//                 </TouchableOpacity>
//               );
//             })}
//           </View>

//           <View style={styles.qBottom}>
//             <TouchableOpacity style={styles.clearBtn} onPress={clearAnswer}>
//               <Ionicons name="close" size={13} color="#94a3b8" />
//               <Text style={styles.clearBtnText}>Clear Answer</Text>
//             </TouchableOpacity>
//             <View style={styles.navBtns}>
//               <TouchableOpacity
//                 style={[styles.navBtn, currentIndex === 0 && styles.navBtnDisabled]}
//                 onPress={goPrev}
//                 disabled={currentIndex === 0}
//               >
//                 <Ionicons name="chevron-back" size={16} color={currentIndex === 0 ? "#cbd5e1" : ACCENT} />
//                 <Text style={[styles.navBtnText, currentIndex === 0 && styles.navBtnTextDisabled]}>
//                   Previous
//                 </Text>
//               </TouchableOpacity>
//               <TouchableOpacity style={styles.saveNextBtn} onPress={goNext}>
//                 <Text style={styles.saveNextText}>
//                   {currentIndex === questions.length - 1 ? "Save" : "Save & Next"}
//                 </Text>
//                 {currentIndex < questions.length - 1 && (
//                   <Ionicons name="chevron-forward" size={16} color="#fff" />
//                 )}
//               </TouchableOpacity>
//             </View>
//           </View>
//         </View>

//         <View style={styles.summaryCard}>
//           <View style={styles.summaryRow}>
//             {(["answered", "not_answered", "marked", "not_visited"] as QuestionStatus[]).map((s) => (
//               <View key={s} style={styles.summaryItem}>
//                 <View style={[styles.summaryDot, { backgroundColor: COLORS[s] }]} />
//                 <Text style={styles.summaryCount}>
//                   {states.filter((st) =>
//                     st.status === s || (s === "answered" && st.status === "answered_marked")
//                   ).length}
//                 </Text>
//                 <Text style={styles.summaryLabel}>
//                   {s === "answered" ? "Done" :
//                    s === "not_answered" ? "Skipped" :
//                    s === "marked" ? "Review" : "Unseen"}
//                 </Text>
//               </View>
//             ))}
//           </View>
//         </View>

//         <View style={styles.actionRow}>
//           <TouchableOpacity style={styles.paletteBtn} onPress={() => setPaletteVisible(true)}>
//             <Ionicons name="grid-outline" size={16} color={ACCENT} />
//             <Text style={styles.paletteBtnText}>Question Palette</Text>
//           </TouchableOpacity>
//           <TouchableOpacity style={styles.finishBtn} onPress={confirmFinish}>
//             <Ionicons name="paper-plane-outline" size={16} color="#fff" style={{ marginRight: 4 }} />
//             <Text style={styles.finishBtnText}>Finish Test</Text>
//           </TouchableOpacity>
//         </View>

//         <View style={{ height: 20 }} />
//       </ScrollView>

//       <PaletteModal
//         visible={paletteVisible}
//         questions={questions}
//         states={states}
//         currentIndex={currentIndex}
//         onJump={goTo}
//         onClose={() => setPaletteVisible(false)}
//         onFinish={() => { setPaletteVisible(false); confirmFinish(); }}
//       />
//     </View>
//   );
// }

// const styles = StyleSheet.create({
//   safe: { flex: 1, backgroundColor: "#f8fafc" },
//   centered: { flex: 1, justifyContent: "center", alignItems: "center", gap: 10 },
//   loadingText: { fontSize: 13, color: "#94a3b8" },
//   header: {
//     backgroundColor: ACCENT,
//     flexDirection: "row",
//     alignItems: "center",
//     paddingHorizontal: 16,
//     paddingBottom: 12,
//     gap: 10,
//   },
//   headerLeft: { flex: 1 },
//   headerTitle: { fontSize: 16, fontWeight: "700", color: "#fff" },
//   headerSub: { fontSize: 11, color: "rgba(255,255,255,0.7)", marginTop: 1 },
//   exitBtn: {
//     width: 32, height: 32, borderRadius: 16,
//     backgroundColor: "rgba(255,255,255,0.2)",
//     justifyContent: "center", alignItems: "center",
//   },
//   timerBox: {
//     flexDirection: "row", alignItems: "center",
//     backgroundColor: "#fff", paddingHorizontal: 10,
//     paddingVertical: 6, borderRadius: 8, gap: 4,
//   },
//   timerBoxRed: { backgroundColor: "#fef2f2", borderWidth: 1, borderColor: "#fca5a5" },
//   timerText: { fontSize: 14, fontWeight: "700", color: ACCENT },
//   timerTextRed: { color: "#ef4444" },
//   scrollContent: { padding: 14, gap: 12 },
//   card: {
//     backgroundColor: "#fff", borderRadius: 12,
//     padding: 16, borderWidth: 1, borderColor: "#bfdbfe", gap: 14,
//   },
//   qTopRow: { flexDirection: "row", justifyContent: "space-between", alignItems: "center" },
//   qBadge: { backgroundColor: ACCENT, paddingHorizontal: 10, paddingVertical: 4, borderRadius: 6 },
//   qBadgeText: { color: "#fff", fontSize: 12, fontWeight: "700" },
//   reviewBtn: {
//     flexDirection: "row", alignItems: "center", gap: 5,
//     paddingHorizontal: 10, paddingVertical: 5, borderRadius: 8,
//     borderWidth: 1, borderColor: "#e2e8f0", backgroundColor: "#f8fafc",
//   },
//   reviewBtnActive: { borderColor: "#fde68a", backgroundColor: "#fffbeb" },
//   reviewBtnText: { fontSize: 12, color: "#64748b", fontWeight: "500" },
//   reviewBtnTextActive: { color: "#f59e0b" },
//   moduleBadge: {
//     alignSelf: "flex-start", backgroundColor: "#f1f5f9",
//     paddingHorizontal: 10, paddingVertical: 4,
//     borderRadius: 6, borderWidth: 1, borderColor: "#e2e8f0",
//   },
//   moduleBadgeText: { fontSize: 11, color: "#64748b", fontWeight: "600" },
//   qText: { fontSize: 15, fontWeight: "600", color: "#222222", lineHeight: 22 },
//   optionsContainer: { gap: 10 },
//   optionRow: {
//     flexDirection: "row", alignItems: "center", gap: 12,
//     padding: 12, borderRadius: 10, borderWidth: 1,
//     borderColor: "#e2e8f0", backgroundColor: "#f8fafc",
//   },
//   optionRowSelected: { borderColor: ACCENT, backgroundColor: "#eff6ff" },
//   optionLetter: {
//     width: 32, height: 32, borderRadius: 16,
//     borderWidth: 1.5, borderColor: "#cbd5e1",
//     justifyContent: "center", alignItems: "center", backgroundColor: "#fff",
//   },
//   optionLetterSelected: { backgroundColor: ACCENT, borderColor: ACCENT },
//   optionLetterText: { fontSize: 13, fontWeight: "700", color: "#475569" },
//   optionLetterTextSelected: { color: "#fff" },
//   optionText: { flex: 1, fontSize: 14, color: "#334155", fontWeight: "500" },
//   optionTextSelected: { color: ACCENT, fontWeight: "600" },
//   qBottom: {
//     flexDirection: "row", justifyContent: "space-between", alignItems: "center",
//     borderTopWidth: 1, borderTopColor: "#f1f5f9", paddingTop: 12,
//   },
//   clearBtn: { flexDirection: "row", alignItems: "center", gap: 4 },
//   clearBtnText: { fontSize: 13, color: "#94a3b8" },
//   navBtns: { flexDirection: "row", gap: 8 },
//   navBtn: {
//     flexDirection: "row", alignItems: "center", gap: 4,
//     paddingHorizontal: 12, paddingVertical: 8, borderRadius: 8,
//     borderWidth: 1, borderColor: "#bfdbfe", backgroundColor: "#fff",
//   },
//   navBtnDisabled: { borderColor: "#e2e8f0", backgroundColor: "#f8fafc" },
//   navBtnText: { fontSize: 13, color: ACCENT, fontWeight: "600" },
//   navBtnTextDisabled: { color: "#cbd5e1" },
//   saveNextBtn: {
//     flexDirection: "row", alignItems: "center", gap: 4,
//     paddingHorizontal: 14, paddingVertical: 8,
//     borderRadius: 8, backgroundColor: ACCENT,
//   },
//   saveNextText: { fontSize: 13, color: "#fff", fontWeight: "700" },
//   summaryCard: {
//     backgroundColor: "#fff", borderRadius: 12,
//     padding: 14, borderWidth: 1, borderColor: "#bfdbfe",
//   },
//   summaryRow: { flexDirection: "row", justifyContent: "space-around" },
//   summaryItem: { alignItems: "center", gap: 4 },
//   summaryDot: { width: 10, height: 10, borderRadius: 5 },
//   summaryCount: { fontSize: 16, fontWeight: "700", color: "#222222" },
//   summaryLabel: { fontSize: 10, color: "#94a3b8", fontWeight: "500" },
//   actionRow: { flexDirection: "row", gap: 10 },
//   paletteBtn: {
//     flex: 1, flexDirection: "row", alignItems: "center",
//     justifyContent: "center", gap: 6, paddingVertical: 12,
//     borderRadius: 10, borderWidth: 1, borderColor: "#bfdbfe", backgroundColor: "#fff",
//   },
//   paletteBtnText: { fontSize: 13, color: ACCENT, fontWeight: "600" },
//   finishBtn: {
//     flex: 1, flexDirection: "row", alignItems: "center",
//     justifyContent: "center", paddingVertical: 12,
//     borderRadius: 10, backgroundColor: ACCENT,
//   },
//   finishBtnText: { fontSize: 13, color: "#fff", fontWeight: "700" },
// });

// const pm = StyleSheet.create({
//   overlay: { flex: 1, backgroundColor: "rgba(0,0,0,0.4)", justifyContent: "flex-end" },
//   sheet: {
//     backgroundColor: "#fff", borderTopLeftRadius: 20,
//     borderTopRightRadius: 20, padding: 20, maxHeight: "80%",
//   },
//   sheetHeader: {
//     flexDirection: "row", justifyContent: "space-between",
//     alignItems: "center", marginBottom: 16,
//   },
//   sheetTitle: { fontSize: 16, fontWeight: "700", color: "#222222" },
//   closeBtn: {
//     width: 32, height: 32, borderRadius: 16,
//     backgroundColor: "#f1f5f9", justifyContent: "center", alignItems: "center",
//   },
//   legend: { gap: 8, marginBottom: 14 },
//   legendItem: { flexDirection: "row", alignItems: "center", gap: 8 },
//   legendDot: { width: 12, height: 12, borderRadius: 6 },
//   legendLabel: { flex: 1, fontSize: 13, color: "#475569" },
//   legendCount: { fontSize: 13, fontWeight: "700", color: "#222222" },
//   divider: { height: 1, backgroundColor: "#f1f5f9", marginBottom: 14 },
//   grid: { flexDirection: "row", flexWrap: "wrap", gap: 10, paddingBottom: 16 },
//   gridBtn: { width: 40, height: 40, borderRadius: 8, justifyContent: "center", alignItems: "center" },
//   gridBtnActive: { borderWidth: 2, borderColor: "#222222" },
//   gridBtnText: { color: "#fff", fontWeight: "700", fontSize: 13 },
//   finishBtn: {
//     flexDirection: "row", alignItems: "center", justifyContent: "center",
//     backgroundColor: ACCENT, paddingVertical: 14, borderRadius: 10, marginTop: 8,
//   },
//   finishBtnText: { color: "#fff", fontWeight: "700", fontSize: 14 },
// });


import React, { useEffect, useState, useRef, useCallback } from "react";
import {
  View, Text, StyleSheet, TouchableOpacity, ScrollView,
  ActivityIndicator, StatusBar, Alert, Modal, BackHandler,
} from "react-native";
import { useRouter, useLocalSearchParams } from "expo-router";
import { Ionicons } from "@expo/vector-icons";
import { useSafeAreaInsets } from "react-native-safe-area-context";
import { supabase } from "../../../lib/supabase";

interface Question {
  id: number;
  exam_id: number;
  module_id: number;
  question_text: string;
  marks: number;
  difficulty: string;
  display_order: number;
  question_data: {
    options?: string[];
    correct_index?: number;
    correct_answer?: string;
    answers?: string[];
  };
}

type QuestionStatus = "not_visited" | "answered" | "not_answered" | "marked" | "answered_marked";

interface QuestionState {
  status: QuestionStatus;
  selectedOption: number | null;
}

const ACCENT = "#1F4FA3";
const COLORS: Record<QuestionStatus, string> = {
  answered: "#1F4FA3",
  not_answered: "#ef4444",
  marked: "#f59e0b",
  answered_marked: "#1F4FA3",
  not_visited: "#94a3b8",
};

function formatTime(seconds: number) {
  const m = Math.floor(seconds / 60).toString().padStart(2, "0");
  const s = (seconds % 60).toString().padStart(2, "0");
  return `${m}:${s}`;
}

function PaletteModal({
  visible, questions, states, currentIndex, onJump, onClose, onFinish,
}: {
  visible: boolean;
  questions: Question[];
  states: QuestionState[];
  currentIndex: number;
  onJump: (i: number) => void;
  onClose: () => void;
  onFinish: () => void;
}) {
  const counts = {
    answered: states.filter((s) => s.status === "answered" || s.status === "answered_marked").length,
    not_answered: states.filter((s) => s.status === "not_answered").length,
    marked: states.filter((s) => s.status === "marked").length,
    answered_marked: states.filter((s) => s.status === "answered_marked").length,
    not_visited: states.filter((s) => s.status === "not_visited").length,
  };

  return (
    <Modal visible={visible} animationType="slide" transparent>
      <View style={pm.overlay}>
        <View style={pm.sheet}>
          <View style={pm.sheetHeader}>
            <Text style={pm.sheetTitle}>Question Palette</Text>
            <TouchableOpacity onPress={onClose} style={pm.closeBtn}>
              <Ionicons name="close" size={20} color="#64748b" />
            </TouchableOpacity>
          </View>

          <View style={pm.legend}>
            {(["answered","not_answered","marked","answered_marked","not_visited"] as QuestionStatus[]).map((s) => (
              <View key={s} style={pm.legendItem}>
                <View style={[pm.legendDot, { backgroundColor: COLORS[s] }]} />
                <Text style={pm.legendLabel}>
                  {s === "answered" ? "Answered" :
                   s === "not_answered" ? "Not Answered" :
                   s === "marked" ? "Marked for Review" :
                   s === "answered_marked" ? "Answered & Marked" : "Not Visited"}
                </Text>
                <Text style={pm.legendCount}>{counts[s]}</Text>
              </View>
            ))}
          </View>

          <View style={pm.divider} />

          <ScrollView contentContainerStyle={pm.grid}>
            {questions.map((q, i) => (
              <TouchableOpacity
                key={q.id}
                style={[
                  pm.gridBtn,
                  { backgroundColor: COLORS[states[i]?.status ?? "not_visited"] },
                  i === currentIndex && pm.gridBtnActive,
                ]}
                onPress={() => { onJump(i); onClose(); }}
              >
                <Text style={pm.gridBtnText}>{i + 1}</Text>
              </TouchableOpacity>
            ))}
          </ScrollView>

          <TouchableOpacity style={pm.finishBtn} onPress={onFinish}>
            <Ionicons name="paper-plane-outline" size={16} color="#fff" style={{ marginRight: 6 }} />
            <Text style={pm.finishBtnText}>Finish Test</Text>
          </TouchableOpacity>
        </View>
      </View>
    </Modal>
  );
}

export default function TakeExamScreen() {
  const router = useRouter();
  const insets = useSafeAreaInsets();
  const { id } = useLocalSearchParams<{ id: string }>();

  const [questions, setQuestions] = useState<Question[]>([]);
  const [states, setStates] = useState<QuestionState[]>([]);
  const [currentIndex, setCurrentIndex] = useState(0);
  const [timeLeft, setTimeLeft] = useState(0);
  const [examTitle, setExamTitle] = useState("Exam");
  const [passingScore, setPassingScore] = useState(40);
  const [loading, setLoading] = useState(true);
  const [submitting, setSubmitting] = useState(false);
  const [paletteVisible, setPaletteVisible] = useState(false);
  const timerRef = useRef<ReturnType<typeof setInterval> | null>(null);
  const submitCalledRef = useRef(false);

  useEffect(() => {
    if (id) fetchData();
    return () => { if (timerRef.current) clearInterval(timerRef.current); };
  }, [id]);

  useEffect(() => {
    const sub = BackHandler.addEventListener("hardwareBackPress", () => {
      confirmExit();
      return true;
    });
    return () => sub.remove();
  }, []);

  async function fetchData() {
    try {
      setLoading(true);

      // Fetch exam details + questions from Supabase directly
      const [examRes, questionsRes] = await Promise.all([
        supabase.from("exams").select("*").eq("id", id).single(),
        supabase
          .from("exam_questions")
          .select("*")
          .eq("exam_id", id)
          .eq("is_active", true)
          .eq("is_deleted", false)
          .order("display_order", { ascending: true }),
      ]);

      if (examRes.error) throw examRes.error;
      if (questionsRes.error) throw questionsRes.error;

      const exam = examRes.data;
      const examQs: Question[] = questionsRes.data ?? [];

      if (examQs.length === 0) {
        Alert.alert("No Questions", "This exam has no questions yet.");
        router.back();
        return;
      }

      setExamTitle(exam.title ?? "Exam");
      setPassingScore(Number(exam.passing_score) ?? 40);
      setQuestions(examQs);
      setStates(examQs.map(() => ({ status: "not_visited", selectedOption: null })));

      const totalSeconds = (exam.duration_minutes ?? 5) * 60;
      setTimeLeft(totalSeconds);

      // Mark first question as visited
      setStates((prev) => {
        const updated = [...prev];
        updated[0] = { ...updated[0], status: "not_answered" };
        return updated;
      });

      // Start timer
      timerRef.current = setInterval(() => {
        setTimeLeft((prev) => {
          if (prev <= 1) {
            clearInterval(timerRef.current!);
            submitExam(true);
            return 0;
          }
          return prev - 1;
        });
      }, 1000);
    } catch (e: any) {
      Alert.alert("Error", e.message ?? "Failed to load exam.");
      router.back();
    } finally {
      setLoading(false);
    }
  }

  function selectOption(optionIndex: number) {
    setStates((prev) => {
      const updated = [...prev];
      const cur = updated[currentIndex];
      const alreadySelected = cur.selectedOption === optionIndex;
      updated[currentIndex] = {
        selectedOption: alreadySelected ? null : optionIndex,
        status: alreadySelected
          ? "not_answered"
          : cur.status === "marked" || cur.status === "answered_marked"
          ? "answered_marked"
          : "answered",
      };
      return updated;
    });
  }

  function clearAnswer() {
    setStates((prev) => {
      const updated = [...prev];
      updated[currentIndex] = { selectedOption: null, status: "not_answered" };
      return updated;
    });
  }

  function toggleMarkForReview() {
    setStates((prev) => {
      const updated = [...prev];
      const cur = updated[currentIndex];
      const hasAnswer = cur.selectedOption !== null;
      updated[currentIndex] = {
        ...cur,
        status:
          cur.status === "marked" || cur.status === "answered_marked"
            ? hasAnswer ? "answered" : "not_answered"
            : hasAnswer ? "answered_marked" : "marked",
      };
      return updated;
    });
  }

  function goTo(index: number) {
    setStates((prev) => {
      const updated = [...prev];
      if (updated[index].status === "not_visited") {
        updated[index] = { ...updated[index], status: "not_answered" };
      }
      return updated;
    });
    setCurrentIndex(index);
  }

  function goNext() {
    if (currentIndex < questions.length - 1) goTo(currentIndex + 1);
  }

  function goPrev() {
    if (currentIndex > 0) goTo(currentIndex - 1);
  }

  function confirmFinish() {
    const unanswered = states.filter(
      (s) => s.status === "not_answered" || s.status === "not_visited" || s.status === "marked"
    ).length;
    Alert.alert(
      "Finish Test",
      unanswered > 0
        ? `You have ${unanswered} unanswered question(s). Submit anyway?`
        : "Are you sure you want to submit?",
      [
        { text: "Cancel", style: "cancel" },
        { text: "Submit", style: "destructive", onPress: () => submitExam(false) },
      ]
    );
  }

  function confirmExit() {
    Alert.alert(
      "Exit Exam",
      "Are you sure you want to exit? Your progress will be lost.",
      [
        { text: "Stay", style: "cancel" },
        { text: "Exit", style: "destructive", onPress: () => {
          if (timerRef.current) clearInterval(timerRef.current);
          router.back();
        }},
      ]
    );
  }

  // Use ref to capture latest states for timer-triggered submit
  const statesRef = useRef(states);
  useEffect(() => { statesRef.current = states; }, [states]);
  const questionsRef = useRef(questions);
  useEffect(() => { questionsRef.current = questions; }, [questions]);

  async function submitExam(auto: boolean) {
    if (submitCalledRef.current) return;
    submitCalledRef.current = true;
    if (timerRef.current) clearInterval(timerRef.current);
    setSubmitting(true);

    try {
      const currentStates = statesRef.current;
      const currentQuestions = questionsRef.current;

      // Calculate score
      let score = 0;
      currentQuestions.forEach((q, i) => {
        const s = currentStates[i];
        if (s?.selectedOption === null || s?.selectedOption === undefined) return;
        const cd = q.question_data;
        let correct = false;
        if (cd.correct_index !== undefined) {
          correct = s.selectedOption === cd.correct_index;
        } else if (cd.correct_answer !== undefined) {
          correct = cd.options?.[s.selectedOption] === cd.correct_answer;
        } else if (cd.answers !== undefined) {
          correct = cd.answers.includes(cd.options?.[s.selectedOption] ?? "");
        }
        if (correct) score += q.marks ?? 1;
      });

      const totalMarks = currentQuestions.reduce((sum, q) => sum + (q.marks ?? 1), 0);
      const percentage = totalMarks > 0 ? Math.round((score / totalMarks) * 100) : 0;
      const resultStatus = percentage >= passingScore ? "PASSED" : "FAILED";

      // Get current user
      const { data: { user } } = await supabase.auth.getUser();

      // Save attempt to Supabase
      const { data: inserted, error: insertError } = await supabase
        .from("exam_attempts")
        .insert({
          exam_id: Number(id),
          user_id: user?.id,
          score,
          total_questions: currentQuestions.length,
          percentage,
          result_status: resultStatus,
        })
        .select("id")
        .single();

      if (insertError) throw insertError;

      router.replace({
        pathname: "/(student)/result/[id]",
        params: {
          id: inserted?.id ?? 0,
          examId: id,
          score: String(score),
          totalMarks: String(totalMarks),
          totalQuestions: String(currentQuestions.length),
          percentage: String(percentage),
          examTitle,
          passingScore: String(passingScore),
        },
      });
    } catch (e: any) {
      Alert.alert("Error", "Failed to submit exam. Please try again.");
      submitCalledRef.current = false;
      setSubmitting(false);
    }
  }

  if (loading) {
    return (
      <View style={styles.centered}>
        <ActivityIndicator size="large" color={ACCENT} />
        <Text style={styles.loadingText}>Loading exam…</Text>
      </View>
    );
  }

  if (submitting) {
    return (
      <View style={styles.centered}>
        <ActivityIndicator size="large" color={ACCENT} />
        <Text style={styles.loadingText}>Submitting exam…</Text>
      </View>
    );
  }

  const q = questions[currentIndex];
  const qState = states[currentIndex];
  const options = q?.question_data?.options ?? [];
  const isMarked = qState?.status === "marked" || qState?.status === "answered_marked";
  const isLowTime = timeLeft <= 60;

  return (
    <View style={styles.safe}>
      <StatusBar barStyle="light-content" backgroundColor={ACCENT} />

      {/* Header */}
      <View style={[styles.header, { paddingTop: insets.top + 6 }]}>
        <View style={styles.headerLeft}>
          <Text style={styles.headerTitle} numberOfLines={1}>{examTitle}</Text>
          <Text style={styles.headerSub}>Skill Assessment Test</Text>
        </View>
        <TouchableOpacity style={styles.exitBtn} onPress={confirmExit}>
          <Ionicons name="close" size={18} color="#fff" />
        </TouchableOpacity>
        <View style={[styles.timerBox, isLowTime && styles.timerBoxRed]}>
          <Ionicons name="time-outline" size={13} color={isLowTime ? "#ef4444" : ACCENT} />
          <Text style={[styles.timerText, isLowTime && styles.timerTextRed]}>
            {formatTime(timeLeft)}
          </Text>
        </View>
      </View>

      <ScrollView contentContainerStyle={styles.scrollContent} showsVerticalScrollIndicator={false}>

        {/* Question Card */}
        <View style={styles.card}>
          <View style={styles.qTopRow}>
            <View style={styles.qBadge}>
              <Text style={styles.qBadgeText}>Q {currentIndex + 1} of {questions.length}</Text>
            </View>
            <TouchableOpacity
              style={[styles.reviewBtn, isMarked && styles.reviewBtnActive]}
              onPress={toggleMarkForReview}
            >
              <Ionicons
                name={isMarked ? "bookmark" : "bookmark-outline"}
                size={14}
                color={isMarked ? "#f59e0b" : "#64748b"}
              />
              <Text style={[styles.reviewBtnText, isMarked && styles.reviewBtnTextActive]}>
                {isMarked ? "Marked" : "Mark for Review"}
              </Text>
            </TouchableOpacity>
          </View>

          <View style={styles.difficultyRow}>
            <View style={styles.moduleBadge}>
              <Text style={styles.moduleBadgeText}>MCQs</Text>
            </View>
            <View style={[
              styles.diffBadge,
              q?.difficulty === "Easy" ? styles.diffEasy :
              q?.difficulty === "Hard" ? styles.diffHard : styles.diffMedium
            ]}>
              <Text style={styles.diffBadgeText}>{q?.difficulty ?? "Medium"}</Text>
            </View>
          </View>

          <Text style={styles.qText}>{q?.question_text}</Text>

          <View style={styles.optionsContainer}>
            {options.map((opt, i) => {
              const selected = qState?.selectedOption === i;
              return (
                <TouchableOpacity
                  key={i}
                  style={[styles.optionRow, selected && styles.optionRowSelected]}
                  onPress={() => selectOption(i)}
                  activeOpacity={0.8}
                >
                  <View style={[styles.optionLetter, selected && styles.optionLetterSelected]}>
                    <Text style={[styles.optionLetterText, selected && styles.optionLetterTextSelected]}>
                      {String.fromCharCode(65 + i)}
                    </Text>
                  </View>
                  <Text style={[styles.optionText, selected && styles.optionTextSelected]}>
                    {opt}
                  </Text>
                </TouchableOpacity>
              );
            })}
          </View>

          {/* Bottom nav */}
          <View style={styles.qBottom}>
            <TouchableOpacity style={styles.clearBtn} onPress={clearAnswer}>
              <Ionicons name="close" size={13} color="#94a3b8" />
              <Text style={styles.clearBtnText}>Clear Answer</Text>
            </TouchableOpacity>
            <View style={styles.navBtns}>
              <TouchableOpacity
                style={[styles.navBtn, currentIndex === 0 && styles.navBtnDisabled]}
                onPress={goPrev}
                disabled={currentIndex === 0}
              >
                <Ionicons name="chevron-back" size={16} color={currentIndex === 0 ? "#cbd5e1" : ACCENT} />
                <Text style={[styles.navBtnText, currentIndex === 0 && styles.navBtnTextDisabled]}>
                  Previous
                </Text>
              </TouchableOpacity>
              <TouchableOpacity style={styles.saveNextBtn} onPress={goNext}>
                <Text style={styles.saveNextText}>
                  {currentIndex === questions.length - 1 ? "Save" : "Save & Next"}
                </Text>
                {currentIndex < questions.length - 1 && (
                  <Ionicons name="chevron-forward" size={16} color="#fff" />
                )}
              </TouchableOpacity>
            </View>
          </View>
        </View>

        {/* Status Summary */}
        <View style={styles.summaryCard}>
          <View style={styles.summaryRow}>
            {(["answered","not_answered","marked","not_visited"] as QuestionStatus[]).map((s) => (
              <View key={s} style={styles.summaryItem}>
                <View style={[styles.summaryDot, { backgroundColor: COLORS[s] }]} />
                <Text style={styles.summaryCount}>
                  {states.filter((st) =>
                    st.status === s || (s === "answered" && st.status === "answered_marked")
                  ).length}
                </Text>
                <Text style={styles.summaryLabel}>
                  {s === "answered" ? "Done" :
                   s === "not_answered" ? "Skipped" :
                   s === "marked" ? "Review" : "Unseen"}
                </Text>
              </View>
            ))}
          </View>
        </View>

        {/* Action Buttons */}
        <View style={styles.actionRow}>
          <TouchableOpacity style={styles.paletteBtn} onPress={() => setPaletteVisible(true)}>
            <Ionicons name="grid-outline" size={16} color={ACCENT} />
            <Text style={styles.paletteBtnText}>Question Palette</Text>
          </TouchableOpacity>
          <TouchableOpacity style={styles.finishBtn} onPress={confirmFinish}>
            <Ionicons name="paper-plane-outline" size={16} color="#fff" style={{ marginRight: 4 }} />
            <Text style={styles.finishBtnText}>Finish Test</Text>
          </TouchableOpacity>
        </View>

        <View style={{ height: 20 }} />
      </ScrollView>

      <PaletteModal
        visible={paletteVisible}
        questions={questions}
        states={states}
        currentIndex={currentIndex}
        onJump={goTo}
        onClose={() => setPaletteVisible(false)}
        onFinish={() => { setPaletteVisible(false); confirmFinish(); }}
      />
    </View>
  );
}

const styles = StyleSheet.create({
  safe: { flex: 1, backgroundColor: "#f8fafc" },
  centered: { flex: 1, justifyContent: "center", alignItems: "center", gap: 10 },
  loadingText: { fontSize: 13, color: "#94a3b8" },
  header: {
    backgroundColor: ACCENT, flexDirection: "row",
    alignItems: "center", paddingHorizontal: 16, paddingBottom: 12, gap: 10,
  },
  headerLeft: { flex: 1 },
  headerTitle: { fontSize: 16, fontWeight: "700", color: "#fff" },
  headerSub: { fontSize: 11, color: "rgba(255,255,255,0.7)", marginTop: 1 },
  exitBtn: {
    width: 32, height: 32, borderRadius: 16,
    backgroundColor: "rgba(255,255,255,0.2)",
    justifyContent: "center", alignItems: "center",
  },
  timerBox: {
    flexDirection: "row", alignItems: "center", backgroundColor: "#fff",
    paddingHorizontal: 10, paddingVertical: 6, borderRadius: 8, gap: 4,
  },
  timerBoxRed: { backgroundColor: "#fef2f2", borderWidth: 1, borderColor: "#fca5a5" },
  timerText: { fontSize: 14, fontWeight: "700", color: ACCENT },
  timerTextRed: { color: "#ef4444" },
  scrollContent: { padding: 14, gap: 12 },
  card: {
    backgroundColor: "#fff", borderRadius: 12,
    padding: 16, borderWidth: 1, borderColor: "#bfdbfe", gap: 14,
  },
  qTopRow: { flexDirection: "row", justifyContent: "space-between", alignItems: "center" },
  qBadge: { backgroundColor: ACCENT, paddingHorizontal: 10, paddingVertical: 4, borderRadius: 6 },
  qBadgeText: { color: "#fff", fontSize: 12, fontWeight: "700" },
  reviewBtn: {
    flexDirection: "row", alignItems: "center", gap: 5,
    paddingHorizontal: 10, paddingVertical: 5, borderRadius: 8,
    borderWidth: 1, borderColor: "#e2e8f0", backgroundColor: "#f8fafc",
  },
  reviewBtnActive: { borderColor: "#fde68a", backgroundColor: "#fffbeb" },
  reviewBtnText: { fontSize: 12, color: "#64748b", fontWeight: "500" },
  reviewBtnTextActive: { color: "#f59e0b" },
  difficultyRow: { flexDirection: "row", gap: 8 },
  moduleBadge: {
    alignSelf: "flex-start", backgroundColor: "#f1f5f9",
    paddingHorizontal: 10, paddingVertical: 4,
    borderRadius: 6, borderWidth: 1, borderColor: "#e2e8f0",
  },
  moduleBadgeText: { fontSize: 11, color: "#64748b", fontWeight: "600" },
  diffBadge: {
    alignSelf: "flex-start", paddingHorizontal: 10,
    paddingVertical: 4, borderRadius: 6, borderWidth: 1,
  },
  diffEasy: { backgroundColor: "#f0fdf4", borderColor: "#bbf7d0" },
  diffMedium: { backgroundColor: "#fffbeb", borderColor: "#fde68a" },
  diffHard: { backgroundColor: "#fef2f2", borderColor: "#fca5a5" },
  diffBadgeText: { fontSize: 11, color: "#64748b", fontWeight: "600" },
  qText: { fontSize: 15, fontWeight: "600", color: "#222222", lineHeight: 22 },
  optionsContainer: { gap: 10 },
  optionRow: {
    flexDirection: "row", alignItems: "center", gap: 12,
    padding: 12, borderRadius: 10, borderWidth: 1,
    borderColor: "#e2e8f0", backgroundColor: "#f8fafc",
  },
  optionRowSelected: { borderColor: ACCENT, backgroundColor: "#eff6ff" },
  optionLetter: {
    width: 32, height: 32, borderRadius: 16, borderWidth: 1.5,
    borderColor: "#cbd5e1", justifyContent: "center",
    alignItems: "center", backgroundColor: "#fff",
  },
  optionLetterSelected: { backgroundColor: ACCENT, borderColor: ACCENT },
  optionLetterText: { fontSize: 13, fontWeight: "700", color: "#475569" },
  optionLetterTextSelected: { color: "#fff" },
  optionText: { flex: 1, fontSize: 14, color: "#334155", fontWeight: "500" },
  optionTextSelected: { color: ACCENT, fontWeight: "600" },
  qBottom: {
    flexDirection: "row", justifyContent: "space-between", alignItems: "center",
    borderTopWidth: 1, borderTopColor: "#f1f5f9", paddingTop: 12,
  },
  clearBtn: { flexDirection: "row", alignItems: "center", gap: 4 },
  clearBtnText: { fontSize: 13, color: "#94a3b8" },
  navBtns: { flexDirection: "row", gap: 8 },
  navBtn: {
    flexDirection: "row", alignItems: "center", gap: 4,
    paddingHorizontal: 12, paddingVertical: 8, borderRadius: 8,
    borderWidth: 1, borderColor: "#bfdbfe", backgroundColor: "#fff",
  },
  navBtnDisabled: { borderColor: "#e2e8f0", backgroundColor: "#f8fafc" },
  navBtnText: { fontSize: 13, color: ACCENT, fontWeight: "600" },
  navBtnTextDisabled: { color: "#cbd5e1" },
  saveNextBtn: {
    flexDirection: "row", alignItems: "center", gap: 4,
    paddingHorizontal: 14, paddingVertical: 8, borderRadius: 8, backgroundColor: ACCENT,
  },
  saveNextText: { fontSize: 13, color: "#fff", fontWeight: "700" },
  summaryCard: {
    backgroundColor: "#fff", borderRadius: 12,
    padding: 14, borderWidth: 1, borderColor: "#bfdbfe",
  },
  summaryRow: { flexDirection: "row", justifyContent: "space-around" },
  summaryItem: { alignItems: "center", gap: 4 },
  summaryDot: { width: 10, height: 10, borderRadius: 5 },
  summaryCount: { fontSize: 16, fontWeight: "700", color: "#222222" },
  summaryLabel: { fontSize: 10, color: "#94a3b8", fontWeight: "500" },
  actionRow: { flexDirection: "row", gap: 10 },
  paletteBtn: {
    flex: 1, flexDirection: "row", alignItems: "center",
    justifyContent: "center", gap: 6, paddingVertical: 12,
    borderRadius: 10, borderWidth: 1, borderColor: "#bfdbfe", backgroundColor: "#fff",
  },
  paletteBtnText: { fontSize: 13, color: ACCENT, fontWeight: "600" },
  finishBtn: {
    flex: 1, flexDirection: "row", alignItems: "center",
    justifyContent: "center", paddingVertical: 12, borderRadius: 10, backgroundColor: ACCENT,
  },
  finishBtnText: { fontSize: 13, color: "#fff", fontWeight: "700" },
});

const pm = StyleSheet.create({
  overlay: { flex: 1, backgroundColor: "rgba(0,0,0,0.4)", justifyContent: "flex-end" },
  sheet: {
    backgroundColor: "#fff", borderTopLeftRadius: 20,
    borderTopRightRadius: 20, padding: 20, maxHeight: "80%",
  },
  sheetHeader: {
    flexDirection: "row", justifyContent: "space-between",
    alignItems: "center", marginBottom: 16,
  },
  sheetTitle: { fontSize: 16, fontWeight: "700", color: "#222222" },
  closeBtn: {
    width: 32, height: 32, borderRadius: 16,
    backgroundColor: "#f1f5f9", justifyContent: "center", alignItems: "center",
  },
  legend: { gap: 8, marginBottom: 14 },
  legendItem: { flexDirection: "row", alignItems: "center", gap: 8 },
  legendDot: { width: 12, height: 12, borderRadius: 6 },
  legendLabel: { flex: 1, fontSize: 13, color: "#475569" },
  legendCount: { fontSize: 13, fontWeight: "700", color: "#222222" },
  divider: { height: 1, backgroundColor: "#f1f5f9", marginBottom: 14 },
  grid: { flexDirection: "row", flexWrap: "wrap", gap: 10, paddingBottom: 16 },
  gridBtn: { width: 40, height: 40, borderRadius: 8, justifyContent: "center", alignItems: "center" },
  gridBtnActive: { borderWidth: 2.5, borderColor: "#222222" },
  gridBtnText: { color: "#fff", fontWeight: "700", fontSize: 13 },
  finishBtn: {
    flexDirection: "row", alignItems: "center", justifyContent: "center",
    backgroundColor: ACCENT, paddingVertical: 14, borderRadius: 10, marginTop: 8,
  },
  finishBtnText: { color: "#fff", fontWeight: "700", fontSize: 14 },
});