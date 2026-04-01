import React, { useEffect } from "react";
import {
  View, Text, StyleSheet, TouchableOpacity,
  ScrollView, StatusBar, BackHandler,
} from "react-native";
import { useRouter, useLocalSearchParams } from "expo-router";
import { Ionicons } from "@expo/vector-icons";
import { useSafeAreaInsets } from "react-native-safe-area-context";

const ACCENT = "#1F4FA3";

export default function ResultScreen() {
  const router = useRouter();
  const insets = useSafeAreaInsets();
  const { examTitle, score, totalMarks, totalQuestions, percentage } =
    useLocalSearchParams<{
      examTitle: string; score: string; totalMarks: string;
      totalQuestions: string; percentage: string;
    }>();

  const pct = Number(percentage ?? 0);
  const sc = Number(score ?? 0);
  const tm = Number(totalMarks ?? 0);
  const tq = Number(totalQuestions ?? 0);
  const passed = pct >= 40;
  const wrongAnswers = Math.max(0, tq - sc);

  useEffect(() => {
    const sub = BackHandler.addEventListener("hardwareBackPress", () => true);
    return () => sub.remove();
  }, []);

  const getPerformanceMessage = () => {
    if (pct === 100) return { title: "Outstanding Performance!", sub: "Excellent work! You have a strong grasp of the material." };
    if (pct >= 80) return { title: "Great Job!", sub: "You performed really well. Keep it up!" };
    if (pct >= 40) return { title: "Well Done!", sub: "You passed the exam. Keep practicing to improve further." };
    return { title: "Keep Practicing!", sub: "Don't be discouraged. Review the material and try again." };
  };

  const perf = getPerformanceMessage();

  return (
    <View style={styles.safe}>
      <StatusBar barStyle="light-content" backgroundColor={ACCENT} />

      <View style={[styles.header, { paddingTop: insets.top + 10 }]}>
        <Text style={styles.headerTitle}>{examTitle ?? "Exam"}</Text>
        <Text style={styles.headerSub}>Skill Test Results</Text>
      </View>

      <ScrollView contentContainerStyle={styles.scrollContent} showsVerticalScrollIndicator={false}>

        <View style={styles.statsCard}>
          <View style={styles.statBox}>
            <Text style={styles.statLabel}>Score</Text>
            <Text style={styles.statValue}>{sc}/{tm}</Text>
          </View>
          <View style={styles.statDivider} />
          <View style={styles.statBox}>
            <Text style={styles.statLabel}>Percentage</Text>
            <Text style={styles.statValue}>{pct}%</Text>
          </View>
          <View style={styles.statDivider} />
          <View style={styles.statBox}>
            <Text style={styles.statLabel}>Pass Mark</Text>
            <Text style={styles.statValue}>40%</Text>
          </View>
          <View style={styles.statDivider} />
          <View style={styles.statBox}>
            <Text style={styles.statLabel}>Status</Text>
            <Text style={[styles.statValue, passed ? styles.passedText : styles.failedText]}>
              {passed ? "Passed" : "Failed"}
            </Text>
          </View>
        </View>

        <View style={styles.passInfoCard}>
          <View style={styles.passInfoBar} />
          <Text style={styles.passInfoText}>Pass Percentage: 40%</Text>
        </View>

        <View style={styles.detailCard}>
          <View style={styles.detailBox}>
            <Text style={[styles.detailNumber, { color: ACCENT }]}>{tq}</Text>
            <Text style={styles.detailLabel}>Total Questions</Text>
          </View>
          <View style={styles.detailDivider} />
          <View style={styles.detailBox}>
            <Text style={[styles.detailNumber, { color: ACCENT }]}>{sc}</Text>
            <Text style={styles.detailLabel}>Correct Answers</Text>
          </View>
          <View style={styles.detailDivider} />
          <View style={styles.detailBox}>
            <Text style={[styles.detailNumber, { color: "#ef4444" }]}>{wrongAnswers}</Text>
            <Text style={styles.detailLabel}>Wrong Answers</Text>
          </View>
        </View>

        <View style={[styles.perfCard, passed ? styles.perfCardPass : styles.perfCardFail]}>
          <Ionicons
            name={passed ? "ribbon-outline" : "refresh-circle-outline"}
            size={28}
            color={passed ? ACCENT : "#ef4444"}
          />
          <View style={{ flex: 1 }}>
            <Text style={[styles.perfTitle, { color: passed ? ACCENT : "#ef4444" }]}>
              {perf.title}
            </Text>
            <Text style={styles.perfSub}>{perf.sub}</Text>
          </View>
        </View>

        {passed && (
          <View style={styles.certCard}>
            <Ionicons name="medal-outline" size={16} color={ACCENT} />
            <Text style={styles.certText}>
              Your certificate is being generated and will appear automatically.
            </Text>
          </View>
        )}

        <TouchableOpacity
          style={styles.backBtn}
          onPress={() => router.replace("/(student)/skill-tests")}
          activeOpacity={0.85}
        >
          <Ionicons name="home-outline" size={18} color="#fff" style={{ marginRight: 6 }} />
          <Text style={styles.backBtnText}>Back to Skill Tests</Text>
        </TouchableOpacity>

        <View style={{ height: 30 }} />
      </ScrollView>
    </View>
  );
}

const styles = StyleSheet.create({
  safe: { flex: 1, backgroundColor: "#f8fafc" },
  header: { backgroundColor: ACCENT, paddingHorizontal: 20, paddingBottom: 20 },
  headerTitle: { fontSize: 22, fontWeight: "700", color: "#fff" },
  headerSub: { fontSize: 13, color: "rgba(255,255,255,0.75)", marginTop: 2 },
  scrollContent: { padding: 16, gap: 12 },
  statsCard: {
    backgroundColor: "#fff", borderRadius: 12,
    borderWidth: 1, borderColor: "#bfdbfe",
    flexDirection: "row", overflow: "hidden",
  },
  statBox: { flex: 1, alignItems: "center", paddingVertical: 16, gap: 4 },
  statDivider: { width: 1, backgroundColor: "#bfdbfe" },
  statLabel: { fontSize: 11, color: "#64748b" },
  statValue: { fontSize: 15, fontWeight: "700", color: "#222222" },
  passedText: { color: ACCENT },
  failedText: { color: "#ef4444" },
  passInfoCard: {
    backgroundColor: "#fff", borderRadius: 12,
    borderWidth: 1, borderColor: "#bfdbfe",
    flexDirection: "row", alignItems: "center",
    paddingVertical: 14, paddingHorizontal: 16, gap: 10,
  },
  passInfoBar: { width: 4, height: 20, backgroundColor: ACCENT, borderRadius: 2 },
  passInfoText: { fontSize: 14, color: ACCENT, fontWeight: "600" },
  detailCard: {
    backgroundColor: "#fff", borderRadius: 12,
    borderWidth: 1, borderColor: "#bfdbfe",
    flexDirection: "row", overflow: "hidden",
  },
  detailBox: { flex: 1, alignItems: "center", paddingVertical: 20, gap: 6 },
  detailDivider: { width: 1, backgroundColor: "#bfdbfe" },
  detailNumber: { fontSize: 28, fontWeight: "800" },
  detailLabel: { fontSize: 11, color: "#64748b", textAlign: "center" },
  perfCard: {
    borderRadius: 12, borderWidth: 1, padding: 16,
    flexDirection: "row", alignItems: "flex-start", gap: 12,
  },
  perfCardPass: { backgroundColor: "#eff6ff", borderColor: "#bfdbfe" },
  perfCardFail: { backgroundColor: "#fef2f2", borderColor: "#fca5a5" },
  perfTitle: { fontSize: 16, fontWeight: "700" },
  perfSub: { fontSize: 13, color: "#64748b", marginTop: 3, lineHeight: 18 },
  certCard: {
    backgroundColor: "#fff", borderRadius: 12,
    borderWidth: 1, borderColor: "#bfdbfe",
    padding: 14, flexDirection: "row", alignItems: "center", gap: 10,
  },
  certText: { flex: 1, fontSize: 13, color: "#475569", lineHeight: 18 },
  backBtn: {
    backgroundColor: ACCENT, flexDirection: "row",
    alignItems: "center", justifyContent: "center",
    paddingVertical: 15, borderRadius: 12, marginTop: 4,
  },
  backBtnText: { color: "#fff", fontSize: 15, fontWeight: "700" },
});