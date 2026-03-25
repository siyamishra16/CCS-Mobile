import React, { useState, useEffect } from "react";
import { View, Text, StyleSheet, TextInput, TouchableOpacity, FlatList, Platform, StatusBar, ScrollView, ActivityIndicator } from "react-native";
import { Ionicons } from "@expo/vector-icons";
import { router } from "expo-router";
import AsyncStorage from "@react-native-async-storage/async-storage";
import axios from "axios";
import API_BASE_URL from "../../config/api";

const STATUS_FILTERS = ["Total", "Pending", "Accepted", "Rejected"];

export default function AppliedJobsScreen() {
  const [appliedJobs, setAppliedJobs] = useState<any[]>([]);
  const [loading, setLoading] = useState(true);
  const [activeFilter, setActiveFilter] = useState("Total");
  const [search, setSearch] = useState("");

  useEffect(() => { fetchAppliedJobs(); }, []);

  const fetchAppliedJobs = async () => {
    try {
      setLoading(true);
      const token = await AsyncStorage.getItem("token");
      const res = await axios.get(`${API_BASE_URL}/student/student/applied-jobs`, {
        headers: { Authorization: `Bearer ${token}` },
      });
      setAppliedJobs(res.data?.data || []);
    } catch (error) {
      console.error("Error fetching applied jobs:", error);
    } finally {
      setLoading(false);
    }
  };

  const getFilteredData = () => {
    return appliedJobs.filter(item => {
      const matchesSearch = item.jobTitle?.toLowerCase().includes(search.toLowerCase());
      const matchesStatus = activeFilter === "Total" || item.applicationStatus?.toLowerCase() === activeFilter.toLowerCase();
      return matchesSearch && matchesStatus;
    });
  };

  return (
    <View style={styles.container}>
      <StatusBar barStyle="dark-content" />
      <View style={styles.header}>
        <TouchableOpacity onPress={() => router.replace("/(student)/")} style={{ marginRight: 12 }}>
          <Ionicons name="arrow-back" size={20} color="#222222" />
        </TouchableOpacity>
        <View style={styles.searchBox}>
          <Ionicons name="search-outline" size={16} color="#999" />
          <TextInput
            placeholder="Search applied jobs"
            placeholderTextColor="#999"
            style={styles.input}
            value={search}
            onChangeText={setSearch}
          />
        </View>
      </View>

      <View style={styles.filterWrapper}>
        <ScrollView horizontal showsHorizontalScrollIndicator={false} contentContainerStyle={styles.filterScroll}>
          {STATUS_FILTERS.map((f) => (
            <TouchableOpacity
              key={f}
              style={[styles.filterPill, activeFilter === f && styles.activeFilterPill]}
              onPress={() => setActiveFilter(f)}
            >
              <Text style={[styles.filterText, activeFilter === f && styles.activeFilterText]}>{f}</Text>
            </TouchableOpacity>
          ))}
        </ScrollView>
      </View>

      {loading ? (
        <ActivityIndicator size="small" color="#1F4FA3" style={{ marginTop: 40 }} />
      ) : (
        <FlatList
          data={getFilteredData()}
          renderItem={({ item }) => (
            <View style={styles.jobCard}>
              <Text style={styles.jobTitle}>{item.jobTitle || "Role"}</Text>
              <Text style={styles.companyName}>{item.companyName || "N/A"}</Text>
              <Text style={styles.dateText}>
                {item.appliedAt ? new Date(item.appliedAt).toDateString() : ""}
              </Text>
              <Text style={[
                styles.statusText,
                item.applicationStatus === "accepted" ? styles.statusAccepted :
                item.applicationStatus === "rejected" ? styles.statusRejected :
                styles.statusPending
              ]}>
                {item.applicationStatus
                  ? item.applicationStatus.charAt(0).toUpperCase() + item.applicationStatus.slice(1)
                  : "Pending"}
              </Text>
            </View>
          )}
          keyExtractor={(item) => item.applicationId?.toString()}
          contentContainerStyle={styles.listContent}
          ListEmptyComponent={
            <View style={{ alignItems: "center", marginTop: 60 }}>
              <Ionicons name="document-text-outline" size={48} color="#E2E8F0" />
              <Text style={{ color: "#AAA", marginTop: 12, fontSize: 14 }}>No applications found</Text>
            </View>
          }
        />
      )}
    </View>
  );
}

const styles = StyleSheet.create({
  container: { flex: 1, backgroundColor: "#FFF" },
  header: { flexDirection: "row", alignItems: "center", paddingTop: Platform.OS === "android" ? (StatusBar.currentHeight || 0) + 10 : 55, paddingHorizontal: 15, paddingBottom: 10 },
  searchBox: { flex: 1, flexDirection: "row", alignItems: "center", backgroundColor: "#FFF", borderRadius: 20, paddingHorizontal: 12, height: 40, borderWidth: 1, borderColor: "#E2E8F0" },
  input: { flex: 1, marginLeft: 8, fontSize: 13, color: "#222222" },
  filterWrapper: { marginVertical: 10 },
  filterScroll: { paddingHorizontal: 15 },
  filterPill: { paddingHorizontal: 16, paddingVertical: 6, borderRadius: 16, backgroundColor: "#FFF", borderWidth: 1, borderColor: "#E2E8F0", marginRight: 8 },
  activeFilterPill: { backgroundColor: "#1F4FA3", borderColor: "#1F4FA3" },
  filterText: { color: "#222222", fontSize: 12 },
  activeFilterText: { color: "#FFF", fontSize: 12 },
  listContent: { paddingHorizontal: 15, paddingBottom: 30 },
  jobCard: { backgroundColor: "#FFF", borderRadius: 12, padding: 14, marginBottom: 10, borderWidth: 1, borderColor: "#E2E8F0", elevation: 2 },
  jobTitle: { fontSize: 14, fontWeight: "700", color: "#222222" },
  companyName: { fontSize: 12, color: "#1F4FA3", marginTop: 2 },
  dateText: { fontSize: 11, color: "#AAA", marginTop: 2 },
  statusText: { fontSize: 12, fontWeight: "600", marginTop: 6 },
  statusPending: { color: "#F1C40F" },
  statusAccepted: { color: "#2ECC71" },
  statusRejected: { color: "#E74C3C" },
});