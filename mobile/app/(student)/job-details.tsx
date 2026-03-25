
import React, { useState } from "react";
import { View, Text, StyleSheet, ScrollView, TouchableOpacity } from "react-native";
import { SafeAreaView } from "react-native-safe-area-context";
import { useLocalSearchParams, router } from "expo-router";
import { Ionicons } from "@expo/vector-icons";

export default function JobDetails() {
  const { job } = useLocalSearchParams();
  const jobData = JSON.parse(job as string);
  const [isSaved, setIsSaved] = useState(false);

  const companyInitial = (jobData.company || "C").charAt(0).toUpperCase();

  return (
    <SafeAreaView style={styles.container}>
      {/* Header */}
      <View style={styles.header}>
        <TouchableOpacity style={styles.iconBtn} onPress={() => router.back()}>
          <Ionicons name="arrow-back" size={20} color="#222222" />
        </TouchableOpacity>
        <Text style={styles.headerTitle}>Job Details</Text>
        <TouchableOpacity style={styles.iconBtn} onPress={() => setIsSaved(!isSaved)}>
          <Ionicons 
            name={isSaved ? "bookmark" : "bookmark-outline"} 
            size={20} 
            color={isSaved ? "#1F4FA3" : "#222222"} 
          />
        </TouchableOpacity>
      </View>

      <ScrollView contentContainerStyle={styles.content} showsVerticalScrollIndicator={false}>

        {/* Company Logo + Title */}
        <View style={styles.heroCard}>
          <View style={styles.logoBox}>
            <Text style={styles.logoText}>{companyInitial}</Text>
          </View>
          <Text style={styles.title}>{jobData.title}</Text>
          <Text style={styles.company}>{jobData.company || "Company Name"}</Text>

          {/* Tags */}
          <View style={styles.tagsRow}>
            {jobData.location_type && (
              <View style={styles.tag}>
                <Ionicons name="globe-outline" size={11} color="#1F4FA3" />
                <Text style={styles.tagText}>{jobData.location_type}</Text>
              </View>
            )}
            {jobData.employment_type && (
              <View style={styles.tag}>
                <Ionicons name="briefcase-outline" size={11} color="#1F4FA3" />
                <Text style={styles.tagText}>{jobData.employment_type}</Text>
              </View>
            )}
            {jobData.location && (
              <View style={styles.tag}>
                <Ionicons name="location-outline" size={11} color="#1F4FA3" />
                <Text style={styles.tagText}>{jobData.location}</Text>
              </View>
            )}
          </View>
        </View>

        <View style={styles.divider} />

        {/* Description */}
        <Text style={styles.sectionTitle}>Job Description</Text>
        <Text style={styles.description}>{jobData.description || "No description provided."}</Text>

        {/* Employment Type */}
        <Text style={styles.sectionTitle}>Employment Type</Text>
        <Text style={styles.description}>{jobData.employment_type || "Not specified"}</Text>

        {/* Posted Date */}
        {jobData.posted_date && (
          <>
            <Text style={styles.sectionTitle}>Posted On</Text>
            <Text style={styles.description}>{new Date(jobData.posted_date).toLocaleDateString()}</Text>
          </>
        )}

        <View style={{ height: 80 }} />
      </ScrollView>

      {/* Apply Button */}
      <TouchableOpacity
        style={styles.applyBtn}
        activeOpacity={0.85}
        onPress={() => router.push({
          pathname: "/(student)/apply-job",
          params: { jobId: jobData.id, jobTitle: jobData.title }
        })}
      >
        <Ionicons name="send-outline" size={16} color="#FFF" />
        <Text style={styles.applyBtnText}>Apply Now</Text>
      </TouchableOpacity>
    </SafeAreaView>
  );
}

const styles = StyleSheet.create({
  container: { flex: 1, backgroundColor: "#FFF" },
  header: { 
    flexDirection: "row", 
    justifyContent: "space-between", 
    paddingHorizontal: 14, 
    paddingVertical: 10, 
    alignItems: "center", 
    borderBottomWidth: 1, 
    borderBottomColor: "#E2E8F0", 
    backgroundColor: "#FFF" 
  },
  headerTitle: { fontSize: 16, fontWeight: "700", color: "#222222" },
  iconBtn: { 
    width: 34, 
    height: 34, 
    borderRadius: 17, 
    backgroundColor: "#F8FAFC", 
    justifyContent: "center", 
    alignItems: "center" 
  },
  content: { padding: 16 },
  heroCard: { 
    backgroundColor: "#FFF", 
    borderRadius: 14, 
    padding: 16, 
    alignItems: "center", 
    borderWidth: 1, 
    borderColor: "#E2E8F0", 
    marginBottom: 16 
  },
  logoBox: { 
    width: 52, 
    height: 52, 
    borderRadius: 12, 
    backgroundColor: "#1F4FA3", 
    justifyContent: "center", 
    alignItems: "center", 
    marginBottom: 10 
  },
  logoText: { fontSize: 22, fontWeight: "800", color: "#FFF" },
  title: { fontSize: 18, fontWeight: "800", color: "#222222", textAlign: "center", marginBottom: 4 },
  company: { fontSize: 14, color: "#1F4FA3", fontWeight: "600", marginBottom: 12 },
  tagsRow: { flexDirection: "row", flexWrap: "wrap", justifyContent: "center", gap: 6 },
  tag: { 
    flexDirection: "row", 
    alignItems: "center", 
    backgroundColor: "#F1F5F9", 
    paddingHorizontal: 8, 
    paddingVertical: 4, 
    borderRadius: 20, 
    gap: 3, 
    borderWidth: 1, 
    borderColor: "#E2E8F0" 
  },
  tagText: { fontSize: 11, color: "#1F4FA3", fontWeight: "600" },
  divider: { height: 1, backgroundColor: "#E2E8F0", marginBottom: 16 },
  sectionTitle: { fontSize: 15, fontWeight: "700", color: "#222222", marginBottom: 6 },
  description: { fontSize: 13, color: "#444", lineHeight: 20, marginBottom: 16 },
  applyBtn: { 
    flexDirection: "row", 
    alignItems: "center", 
    justifyContent: "center", 
    gap: 6, 
    backgroundColor: "#1F4FA3", 
    margin: 16, 
    padding: 14, 
    borderRadius: 12 
  },
  applyBtnText: { color: "#FFF", fontSize: 15, fontWeight: "700" },
});