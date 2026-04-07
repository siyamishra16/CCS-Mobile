import React, { useEffect, useState } from "react";
import {
  View,
  Text,
  StyleSheet,
  TouchableOpacity,
  ScrollView,
  ActivityIndicator,
  StatusBar,
  Platform,
} from "react-native";
import { useRouter, useLocalSearchParams } from "expo-router";
import { Ionicons } from "@expo/vector-icons";
import { useSafeAreaInsets } from "react-native-safe-area-context";

// Import your existing configured supabase client
import { supabase } from "../../lib/supabase";

interface Job {
  id: string;
  title: string;
  location_type: string;
  location: string;
  timeline: string;
  pay_show_by: string | null;
  pay_min: number | null;
  pay_max: number | null;
  pay_rate: string | null;
  description: string;
  education: string;
  experience_years: number | null;
  experience_type: string;
  certifications: string;
  custom_benefits: string;
}

const ACCENT = "#1F4FA3";

export default function AppliedJobDetails() {
  const router = useRouter();
  const insets = useSafeAreaInsets();
  const params = useLocalSearchParams();
  
  // These come from the 'router.push' params in your list page
  const { jobId, applicationStatus, companyName, appliedAt } = params;

  const [job, setJob] = useState<Job | null>(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  useEffect(() => {
    if (jobId) fetchJobDetails();
  }, [jobId]);

  async function fetchJobDetails() {
    try {
      setLoading(true);
      setError(null);

      // Using your existing 'supabase' import
      const { data, error: supabaseError } = await supabase
        .from("company_jobs")
        .select("*")
        .eq("id", jobId)
        .single();

      if (supabaseError) throw supabaseError;
      setJob(data);
    } catch (err: any) {
      setError(err.message || "Failed to load job details.");
    } finally {
      setLoading(false);
    }
  }

  /* UI Helpers */
  const getStatusColor = () => {
    const s = String(applicationStatus || "").toLowerCase();
    if (s === "accepted") return { bg: "#f0fdf4", text: "#22c55e", border: "#bbf7d0" };
    if (s === "rejected") return { bg: "#fef2f2", text: "#ef4444", border: "#fecaca" };
    return { bg: "#eff6ff", text: ACCENT, border: "#bfdbfe" }; // Pending
  };

  const formatPay = () => {
    if (!job?.pay_show_by) return null;
    const rate = job.pay_rate ? `/${job.pay_rate}` : "";
    if (job.pay_show_by === "range" && job.pay_min && job.pay_max)
      return `₹${job.pay_min.toLocaleString()} - ₹${job.pay_max.toLocaleString()}${rate}`;
    if (job.pay_show_by === "minimum" && job.pay_min)
      return `From ₹${job.pay_min.toLocaleString()}${rate}`;
    return null;
  };

  const colors = getStatusColor();
  const isEmpty = (v: any) => !v || String(v).trim() === "" || String(v).toUpperCase() === "EMPTY";

  return (
    <View style={styles.safe}>
      <StatusBar barStyle="dark-content" backgroundColor="#f8fafc" />

      {/* Header matching your Exam Style */}
      <View style={[styles.header, { paddingTop: insets.top + 10 }]}>
        <TouchableOpacity style={styles.backBtn} onPress={() => router.back()}>
          <Ionicons name="arrow-back" size={20} color={ACCENT} />
        </TouchableOpacity>
        <View style={styles.headerText}>
          <Text style={styles.title}>Application Details</Text>
          <Text style={styles.subtitle}>Review your submitted application</Text>
        </View>
      </View>

      <View style={styles.headerDivider} />

      {loading ? (
        <View style={styles.centered}>
          <ActivityIndicator size="large" color={ACCENT} />
        </View>
      ) : error ? (
        <View style={styles.centered}>
          <Ionicons name="alert-circle-outline" size={36} color="#ef4444" />
          <Text style={styles.errorText}>{error}</Text>
          <TouchableOpacity style={styles.retryBtn} onPress={fetchJobDetails}>
            <Text style={styles.retryText}>Retry</Text>
          </TouchableOpacity>
        </View>
      ) : (
        <ScrollView contentContainerStyle={styles.scrollContent} showsVerticalScrollIndicator={false}>
          
          {/* Main Info Card */}
          <View style={styles.topCard}>
            <View style={styles.cardHeader}>
              <Text style={styles.jobTitle}>{job?.title}</Text>
              <View style={[styles.statusBadge, { backgroundColor: colors.bg, borderColor: colors.border }]}>
                <Text style={[styles.statusText, { color: colors.text }]}>
                  {String(applicationStatus || "Pending").toUpperCase()}
                </Text>
              </View>
            </View>
            
            <Text style={styles.companyName}>{companyName || "Company"}</Text>

            <View style={styles.metaRow}>
              <MetaChip icon="location-outline" label={job?.location_type || "Remote"} />
              {job?.timeline && <MetaChip icon="time-outline" label={job.timeline} />}
            </View>

            {appliedAt && (
              <View style={styles.appliedDateRow}>
                <Ionicons name="calendar-outline" size={12} color="#94a3b8" />
                <Text style={styles.appliedDateText}>
                  Applied on {new Date(appliedAt as string).toDateString()}
                </Text>
              </View>
            )}
          </View>

          {/* Details Sections */}
          <Section title="Compensation" icon="cash-outline">
            <Text style={styles.infoValue}>{formatPay() || "Not disclosed"}</Text>
          </Section>

          <Section title="Requirements" icon="ribbon-outline">
            {job?.experience_years != null && (
              <InfoItem label="Experience" value={`${job.experience_years} Years (${job.experience_type})`} />
            )}
            {!isEmpty(job?.education) && <InfoItem label="Education" value={job?.education} />}
          </Section>

          <Section title="Job Description" icon="document-text-outline">
            <Text style={styles.bodyText}>{job?.description}</Text>
          </Section>

          {!isEmpty(job?.custom_benefits) && (
            <Section title="Benefits" icon="gift-outline">
              <Text style={styles.bodyText}>{job?.custom_benefits}</Text>
            </Section>
          )}

          <View style={{ height: 40 }} />
        </ScrollView>
      )}
    </View>
  );
}

/* Internal Components */
function Section({ title, icon, children }: any) {
  return (
    <View style={styles.section}>
      <View style={styles.sectionHeader}>
        <Ionicons name={icon} size={14} color={ACCENT} />
        <Text style={styles.sectionTitle}>{title}</Text>
      </View>
      <View style={styles.sectionBody}>{children}</View>
    </View>
  );
}

function MetaChip({ icon, label }: any) {
  return (
    <View style={styles.metaChip}>
      <Ionicons name={icon} size={11} color={ACCENT} />
      <Text style={styles.metaChipText}>{label}</Text>
    </View>
  );
}

function InfoItem({ label, value }: any) {
  return (
    <View style={{ marginBottom: 8 }}>
      <Text style={styles.infoLabel}>{label}</Text>
      <Text style={styles.infoValue}>{value}</Text>
    </View>
  );
}

const styles = StyleSheet.create({
  safe: { flex: 1, backgroundColor: "#f8fafc" },
  header: { flexDirection: "row", alignItems: "center", paddingHorizontal: 16, paddingBottom: 12, gap: 12 },
  headerDivider: { height: 1, backgroundColor: "#bfdbfe", marginHorizontal: 16, marginBottom: 10 },
  backBtn: { width: 36, height: 36, borderRadius: 10, borderWidth: 1, borderColor: "#bfdbfe", backgroundColor: "#fff", alignItems: "center", justifyContent: "center" },
  headerText: { flex: 1 },
  title: { fontSize: 18, fontWeight: "700", color: "#222" },
  subtitle: { fontSize: 12, color: "#94a3b8" },
  centered: { flex: 1, justifyContent: "center", alignItems: "center", gap: 10 },
  scrollContent: { paddingHorizontal: 16, gap: 12 },
  topCard: { backgroundColor: "#fff", borderRadius: 12, padding: 16, borderWidth: 1, borderColor: "#bfdbfe" },
  cardHeader: { flexDirection: "row", justifyContent: "space-between", alignItems: "flex-start", gap: 10 },
  jobTitle: { fontSize: 17, fontWeight: "700", color: "#222", flex: 1 },
  companyName: { fontSize: 14, color: ACCENT, fontWeight: "600", marginTop: 2 },
  statusBadge: { paddingVertical: 3, paddingHorizontal: 9, borderRadius: 20, borderWidth: 1 },
  statusText: { fontSize: 10, fontWeight: "700" },
  metaRow: { flexDirection: "row", flexWrap: "wrap", gap: 8, marginTop: 12 },
  metaChip: { flexDirection: "row", alignItems: "center", backgroundColor: "#eff6ff", paddingHorizontal: 10, paddingVertical: 4, borderRadius: 20, gap: 4 },
  metaChipText: { fontSize: 11, color: ACCENT, fontWeight: "600" },
  appliedDateRow: { flexDirection: "row", alignItems: "center", gap: 5, marginTop: 12 },
  appliedDateText: { fontSize: 11, color: "#94a3b8" },
  section: { backgroundColor: "#fff", borderRadius: 12, borderWidth: 1, borderColor: "#bfdbfe", overflow: "hidden" },
  sectionHeader: { flexDirection: "row", alignItems: "center", gap: 6, paddingHorizontal: 14, paddingTop: 12, paddingBottom: 8, borderBottomWidth: 1, borderBottomColor: "#f1f5f9" },
  sectionTitle: { fontSize: 11, fontWeight: "800", color: ACCENT, textTransform: "uppercase", letterSpacing: 0.5 },
  sectionBody: { padding: 14 },
  infoLabel: { fontSize: 11, color: "#94a3b8", marginBottom: 2 },
  infoValue: { fontSize: 13, color: "#334155", fontWeight: "600" },
  bodyText: { fontSize: 13, color: "#475569", lineHeight: 20 },
  errorText: { fontSize: 13, color: "#ef4444" },
  retryBtn: { backgroundColor: ACCENT, borderRadius: 8, paddingVertical: 8, paddingHorizontal: 20, marginTop: 10 },
  retryText: { color: "#fff", fontWeight: "700", fontSize: 13 },
});