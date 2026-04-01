import React, { useEffect, useState } from "react";
import {
  View,
  Text,
  StyleSheet,
  TouchableOpacity,
  ScrollView,
  ActivityIndicator,
  StatusBar,
} from "react-native";
import { useRouter, useLocalSearchParams } from "expo-router";
import { Ionicons } from "@expo/vector-icons";
import { useSafeAreaInsets } from "react-native-safe-area-context";
import { apiRequest } from "../../../services/api";

interface ExamDetails {
  id: number;
  title: string;
  duration_minutes: number;
  total_marks: number;
  passing_score: number;
  exam_type: string;
  subcategory_id: number;
}

interface ExamModule {
  id: number;
  exam_id: number;
  module_type: string;
  title: string;
  display_order: number;
  is_active: boolean;
}

const ACCENT = "#1F4FA3";

export default function InstructionScreen() {
  const router = useRouter();
  const insets = useSafeAreaInsets();
  const { id } = useLocalSearchParams<{ id: string }>();

  const [exam, setExam] = useState<ExamDetails | null>(null);
  const [modules, setModules] = useState<ExamModule[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [isChecked, setIsChecked] = useState(false);

  useEffect(() => {
    if (id) fetchData();
  }, [id]);

  async function fetchData() {
    try {
      setLoading(true);
      setError(null);

      // Fetch all exams + all modules in parallel
      const [examsRes, modulesRes]: any[] = await Promise.all([
        apiRequest("/exam-management/exams", "GET"),
        apiRequest("/exam-management/exam-modules", "GET"),
      ]);

      const allExams: ExamDetails[] = examsRes?.data?.data ?? [];
      const allModules: ExamModule[] = modulesRes?.data?.data ?? [];

      // Find exact exam by id
      const found = allExams.find((e) => String(e.id) === String(id));
      if (!found) throw new Error("Exam not found.");

      // Filter modules for this exam, only active ones, sorted by display_order
      const examModules = allModules
        .filter((m) => String(m.exam_id) === String(id) && m.is_active)
        .sort((a, b) => a.display_order - b.display_order);

      setExam(found);
      setModules(examModules);
    } catch (e: any) {
      setError(e.message ?? "Failed to load instructions.");
    } finally {
      setLoading(false);
    }
  }

  const handleStartTest = () => {
    if (isChecked && exam) {
      // TODO: Navigate to take exam screen once created
      router.push({
        pathname: "/(student)/take-exam/[id]",
        params: { id: exam.id },
      });
    }
  };

  if (loading) {
    return (
      <View style={styles.centered}>
        <ActivityIndicator size="large" color={ACCENT} />
        <Text style={styles.loadingText}>Loading instructions…</Text>
      </View>
    );
  }

  if (error || !exam) {
    return (
      <View style={styles.centered}>
        <Ionicons name="alert-circle-outline" size={36} color="#ef4444" />
        <Text style={styles.errorText}>{error ?? "Exam not found."}</Text>
        <TouchableOpacity style={styles.retryBtn} onPress={fetchData}>
          <Text style={styles.retryText}>Retry</Text>
        </TouchableOpacity>
      </View>
    );
  }

  return (
    <View style={styles.safe}>
      <StatusBar barStyle="dark-content" backgroundColor="#f8fafc" />

      {/* Header */}
      <View style={[styles.header, { paddingTop: insets.top + 10 }]}>
        <TouchableOpacity
          style={styles.backBtn}
          onPress={() => router.back()}
          hitSlop={{ top: 8, bottom: 8, left: 8, right: 8 }}
        >
          <Ionicons name="arrow-back" size={20} color={ACCENT} />
        </TouchableOpacity>
        <View style={styles.headerText}>
          <Text style={styles.headerTitle}>Exam Instructions</Text>
          <Text style={styles.headerSub}>Read carefully before starting</Text>
        </View>
      </View>

      <View style={styles.headerDivider} />

      <ScrollView
        contentContainerStyle={styles.scrollContent}
        showsVerticalScrollIndicator={false}
      >
        {/* Main Info Card */}
        <View style={styles.card}>

          {/* Exam type badge */}
          <View style={styles.badge}>
            <Text style={styles.badgeText}>{exam.exam_type ?? "MCQs"}</Text>
          </View>

          {/* Exam Title */}
          <Text style={styles.examTitle}>{exam.title}</Text>

          <View style={styles.divider} />

          {/* Stats Row */}
          <View style={styles.statsRow}>
            <View style={styles.statBox}>
              <Ionicons name="time-outline" size={16} color={ACCENT} />
              <Text style={styles.statLabel}>Duration</Text>
              <Text style={styles.statValue}>{exam.duration_minutes} Min</Text>
            </View>

            <View style={styles.statSeparator} />

            <View style={styles.statBox}>
              <Ionicons name="help-circle-outline" size={16} color={ACCENT} />
              <Text style={styles.statLabel}>Questions</Text>
              <Text style={styles.statValue}>{exam.total_marks} Qs</Text>
            </View>

            <View style={styles.statSeparator} />

            <View style={styles.statBox}>
              <Ionicons name="ribbon-outline" size={16} color={ACCENT} />
              <Text style={styles.statLabel}>Total Marks</Text>
              <Text style={styles.statValue}>{exam.total_marks}</Text>
            </View>
          </View>
        </View>

        {/* Question Types Card */}
        {modules.length > 0 && (
          <View style={styles.card}>
            <View style={styles.sectionHeader}>
              <Ionicons name="layers-outline" size={16} color={ACCENT} />
              <Text style={styles.sectionTitle}>Question Types</Text>
            </View>

            {modules.map((mod, index) => (
              <View
                key={mod.id}
                style={[
                  styles.moduleRow,
                  index < modules.length - 1 && styles.moduleRowBorder,
                ]}
              >
                <View style={styles.moduleLeft}>
                  <View style={styles.moduleDot} />
                  <Text style={styles.moduleTitle}>{mod.title}</Text>
                </View>
                <View style={styles.moduleTypeBadge}>
                  <Text style={styles.moduleTypeText}>{mod.module_type}</Text>
                </View>
              </View>
            ))}
          </View>
        )}

        {/* Instructions Card */}
        <View style={styles.card}>
          <View style={styles.sectionHeader}>
            <Ionicons name="document-text-outline" size={16} color={ACCENT} />
            <Text style={styles.sectionTitle}>Exam Instructions</Text>
          </View>

          {[
            `Total duration of the exam is ${exam.duration_minutes} minutes.`,
            `The exam contains ${exam.total_marks} questions.`,
            `Minimum passing percentage is ${exam.passing_score}%.`,
            "Do not close the app or switch tabs during the exam.",
            "Each question must be answered before moving to the next.",
            "Once submitted, answers cannot be changed.",
          ].map((text, i) => (
            <View key={i} style={styles.instructionRow}>
              <View style={styles.bullet} />
              <Text style={styles.instructionText}>{text}</Text>
            </View>
          ))}
        </View>

        {/* Consent + Start Card */}
        <View style={styles.card}>
          <TouchableOpacity
            style={styles.checkboxRow}
            onPress={() => setIsChecked(!isChecked)}
            activeOpacity={0.8}
          >
            <View style={[styles.checkbox, isChecked && styles.checkboxChecked]}>
              {isChecked && <Ionicons name="checkmark" size={14} color="#fff" />}
            </View>
            <Text style={styles.consentText}>
              I've read all the instructions carefully and have understood them.
            </Text>
          </TouchableOpacity>

          <TouchableOpacity
            style={[styles.startBtn, !isChecked && styles.startBtnDisabled]}
            disabled={!isChecked}
            onPress={handleStartTest}
            activeOpacity={0.85}
          >
            {isChecked && (
              <Ionicons name="play-circle-outline" size={18} color="#fff" style={{ marginRight: 6 }} />
            )}
            <Text style={[styles.startBtnText, !isChecked && styles.startBtnTextDisabled]}>
              Start Test
            </Text>
          </TouchableOpacity>
        </View>

        <View style={{ height: 20 }} />
      </ScrollView>
    </View>
  );
}

const styles = StyleSheet.create({
  safe: { flex: 1, backgroundColor: "#f8fafc" },
  centered: {
    flex: 1,
    justifyContent: "center",
    alignItems: "center",
    gap: 10,
    paddingHorizontal: 32,
  },
  loadingText: { fontSize: 13, color: "#94a3b8" },
  errorText: { fontSize: 13, color: "#ef4444", textAlign: "center" },
  retryBtn: {
    backgroundColor: ACCENT,
    borderRadius: 8,
    paddingVertical: 9,
    paddingHorizontal: 22,
  },
  retryText: { color: "#fff", fontWeight: "700", fontSize: 13 },

  // Header
  header: {
    flexDirection: "row",
    alignItems: "center",
    paddingHorizontal: 16,
    paddingBottom: 12,
    gap: 12,
    backgroundColor: "#f8fafc",
  },
  headerDivider: {
    height: 1,
    backgroundColor: "#bfdbfe",
    marginHorizontal: 16,
    marginBottom: 10,
  },
  backBtn: {
    width: 36,
    height: 36,
    borderRadius: 10,
    borderWidth: 1,
    borderColor: "#bfdbfe",
    backgroundColor: "#fff",
    alignItems: "center",
    justifyContent: "center",
  },
  headerText: { flex: 1 },
  headerTitle: { fontSize: 18, fontWeight: "700", color: "#222222", letterSpacing: -0.3 },
  headerSub: { fontSize: 12, color: "#94a3b8", marginTop: 1 },

  // Scroll
  scrollContent: { padding: 16, gap: 12 },

  // Card
  card: {
    backgroundColor: "#fff",
    borderRadius: 12,
    padding: 16,
    borderWidth: 1,
    borderColor: "#bfdbfe",
    gap: 12,
  },

  // Badge
  badge: {
    alignSelf: "flex-start",
    backgroundColor: "#eff6ff",
    paddingHorizontal: 10,
    paddingVertical: 4,
    borderRadius: 20,
    borderWidth: 1,
    borderColor: "#bfdbfe",
  },
  badgeText: { color: ACCENT, fontSize: 11, fontWeight: "700", letterSpacing: 0.3 },

  examTitle: { fontSize: 20, fontWeight: "700", color: "#222222", letterSpacing: -0.3 },

  divider: { height: 1, backgroundColor: "#eff6ff" },

  // Stats
  statsRow: {
    flexDirection: "row",
    alignItems: "center",
    justifyContent: "space-between",
  },
  statBox: { flex: 1, alignItems: "center", gap: 4 },
  statSeparator: { width: 1, height: 40, backgroundColor: "#bfdbfe" },
  statLabel: { fontSize: 11, color: "#64748b", fontWeight: "500" },
  statValue: { fontSize: 15, fontWeight: "700", color: "#222222" },

  // Section header
  sectionHeader: { flexDirection: "row", alignItems: "center", gap: 6 },
  sectionTitle: { fontSize: 15, fontWeight: "700", color: "#222222" },

  // Modules
  moduleRow: {
    flexDirection: "row",
    alignItems: "center",
    justifyContent: "space-between",
    paddingVertical: 10,
  },
  moduleRowBorder: { borderBottomWidth: 1, borderBottomColor: "#eff6ff" },
  moduleLeft: { flexDirection: "row", alignItems: "center", gap: 8 },
  moduleDot: { width: 6, height: 6, borderRadius: 3, backgroundColor: ACCENT },
  moduleTitle: { fontSize: 14, color: "#334155", fontWeight: "500" },
  moduleTypeBadge: {
    backgroundColor: "#eff6ff",
    paddingHorizontal: 8,
    paddingVertical: 3,
    borderRadius: 6,
    borderWidth: 1,
    borderColor: "#bfdbfe",
  },
  moduleTypeText: { fontSize: 11, color: ACCENT, fontWeight: "600" },

  // Instructions
  instructionRow: { flexDirection: "row", alignItems: "flex-start", gap: 10 },
  bullet: {
    width: 6,
    height: 6,
    borderRadius: 3,
    backgroundColor: ACCENT,
    marginTop: 6,
  },
  instructionText: { flex: 1, fontSize: 13, color: "#475569", lineHeight: 20 },

  // Consent
  checkboxRow: { flexDirection: "row", alignItems: "flex-start", gap: 12 },
  checkbox: {
    width: 22,
    height: 22,
    borderRadius: 5,
    borderWidth: 2,
    borderColor: "#bfdbfe",
    justifyContent: "center",
    alignItems: "center",
    marginTop: 1,
  },
  checkboxChecked: { backgroundColor: ACCENT, borderColor: ACCENT },
  consentText: { flex: 1, fontSize: 13, color: "#475569", lineHeight: 20 },

  // Start button
  startBtn: {
    flexDirection: "row",
    backgroundColor: ACCENT,
    paddingVertical: 14,
    borderRadius: 10,
    alignItems: "center",
    justifyContent: "center",
  },
  startBtnDisabled: { backgroundColor: "#e2e8f0" },
  startBtnText: { color: "#fff", fontWeight: "700", fontSize: 15 },
  startBtnTextDisabled: { color: "#94a3b8" },
});