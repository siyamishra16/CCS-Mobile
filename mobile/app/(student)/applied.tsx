import React, { useState, useEffect } from "react";
import { View, Text, StyleSheet, TextInput, TouchableOpacity, FlatList, Platform, StatusBar, ScrollView, ActivityIndicator } from "react-native";
import { Ionicons } from "@expo/vector-icons";
import { supabase } from "../../lib/supabase";
import { router } from "expo-router";

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
      const { data, error } = await supabase.from('job_applications').select('id, job_title, company, status, created_at').order('created_at', { ascending: false });
      if (error) throw error;
      setAppliedJobs(data || []);
    } catch (error) { console.error("Error:", error); } 
    finally { setLoading(false); }
  };

  const getFilteredData = () => {
    return appliedJobs.filter(item => {
      const matchesSearch = item.job_title?.toLowerCase().includes(search.toLowerCase());
      const matchesStatus = activeFilter === "Total" || item.status?.toLowerCase() === activeFilter.toLowerCase();
      return matchesSearch && matchesStatus;
    });
  };

  return (
    <View style={styles.container}>
      <StatusBar barStyle="dark-content" />
      <View style={styles.header}>
        <TouchableOpacity onPress={() => router.replace("/(student)/")} style={{marginRight: 12}}>
          <Ionicons name="arrow-back" size={20} color="#333" />
        </TouchableOpacity>
        <View style={styles.searchBox}>
          <Ionicons name="search-outline" size={16} color="#999" />
          <TextInput placeholder="Search applied jobs" placeholderTextColor="#999" style={styles.input} value={search} onChangeText={setSearch} />
        </View>
      </View>

      <View style={styles.filterWrapper}>
        <ScrollView horizontal showsHorizontalScrollIndicator={false} contentContainerStyle={styles.filterScroll}>
          {STATUS_FILTERS.map((f) => (
            <TouchableOpacity key={f} style={[styles.filterPill, activeFilter === f && styles.activeFilterPill]} onPress={() => setActiveFilter(f)}>
              <Text style={[styles.filterText, activeFilter === f && styles.activeFilterText]}>{f}</Text>
            </TouchableOpacity>
          ))}
        </ScrollView>
      </View>

      {loading ? <ActivityIndicator size="small" color="#4285F4" style={{marginTop: 40}} /> : (
        <FlatList
          data={getFilteredData()}
          renderItem={({ item }) => (
            <View style={styles.jobCard}>
              <Text style={styles.jobTitle}>{item.job_title || "Role"}</Text>
              <Text style={styles.companyName}>{item.company || "N/A"}</Text> 
              <Text style={styles.dateText}>{item.created_at ? new Date(item.created_at).toDateString() : ""}</Text>
              <Text style={[styles.statusText, item.status === 'accepted' ? styles.statusAccepted : styles.statusPending]}>
                {item.status ? item.status.charAt(0).toUpperCase() + item.status.slice(1) : "Pending"}
              </Text>
            </View>
          )}
          keyExtractor={(item) => item.id.toString()}
          contentContainerStyle={styles.listContent}
        />
      )}
    </View>
  );
}

const styles = StyleSheet.create({
  container: { flex: 1, backgroundColor: "#FFF" },
  header: { flexDirection: 'row', alignItems: 'center', paddingTop: Platform.OS === 'android' ? (StatusBar.currentHeight || 0) + 10 : 55, paddingHorizontal: 15, paddingBottom: 10 },
  searchBox: { flex: 1, flexDirection: 'row', alignItems: 'center', backgroundColor: '#FFF', borderRadius: 20, paddingHorizontal: 12, height: 40, borderWidth: 1, borderColor: '#EEE' },
  input: { flex: 1, marginLeft: 8, fontSize: 13, color: '#333' },
  filterWrapper: { marginVertical: 10 },
  filterScroll: { paddingHorizontal: 15 },
  filterPill: { paddingHorizontal: 16, paddingVertical: 6, borderRadius: 16, backgroundColor: '#FFF', borderWidth: 1, borderColor: '#EEE', marginRight: 8 },
  activeFilterPill: { backgroundColor: '#4285F4', borderColor: '#4285F4' },
  filterText: { color: '#666', fontSize: 12 },
  activeFilterText: { color: '#FFF', fontSize: 12 },
  listContent: { paddingHorizontal: 15, paddingBottom: 30 },
  jobCard: { backgroundColor: '#FFF', borderRadius: 12, padding: 14, marginBottom: 10, borderWidth: 1, borderColor: '#F0F0F0', elevation: 2 },
  jobTitle: { fontSize: 14, fontWeight: '700', color: '#1A1A1A' },
  companyName: { fontSize: 12, color: '#888', marginTop: 2 },
  dateText: { fontSize: 11, color: '#AAA', marginTop: 2 },
  statusText: { fontSize: 12, fontWeight: '600', marginTop: 6 },
  statusPending: { color: '#F1C40F' },
  statusAccepted: { color: '#2ECC71' },
});