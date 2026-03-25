

import React, { useState, useEffect } from "react";
import {
  View,
  Text,
  StyleSheet,
  TextInput,
  TouchableOpacity,
  FlatList,
  Platform,
  StatusBar,
  ScrollView,
  ActivityIndicator,
  Modal,
} from "react-native";
import { Ionicons, MaterialCommunityIcons } from "@expo/vector-icons";
import { router } from "expo-router";
import { useSafeAreaInsets } from "react-native-safe-area-context";
import { supabase } from "../../lib/supabase";

const TOP_FILTERS = [
  { icon: "code-tags", label: "Developer" },
  { icon: "clipboard-list-outline", label: "Product" },
  { icon: "chart-bar", label: "Analytics" },
  { icon: "bullhorn-outline", label: "Marketing" },
];

const LOCATION_OPTIONS = ["Remote", "In Person", "Hybrid"];
const ROLE_OPTIONS = ["Full Time", "Part Time", "Contract", "Internship"];
const TYPE_OPTIONS = ["Full Time", "Part Time", "Contract", "Internship"];

export default function JobsScreen() {
  const [jobs, setJobs] = useState<any[]>([]);
  const [loading, setLoading] = useState(true);
  const [search, setSearch] = useState("");

  const [activeCategories, setActiveCategories] = useState<string[]>([]);
  const [activeType, setActiveType] = useState<string[]>([]);
  const [activeLocation, setActiveLocation] = useState<string[]>([]);
  const [activeRoles, setActiveRoles] = useState<string[]>([]);

  const [openModal, setOpenModal] = useState<"Type" | "Location" | "Roles" | "All" | null>(null);

  const insets = useSafeAreaInsets();

  useEffect(() => {
    fetchJobs();
  }, []);

  const fetchJobs = async () => {
    try {
      setLoading(true);
      const { data, error } = await supabase
        .from("company_jobs")
        .select("*")
        .order("created_at", { ascending: false });
      if (error) throw error;
      setJobs(data || []);
    } catch (error) {
      console.error("Error fetching jobs:", error);
    } finally {
      setLoading(false);
    }
  };

  const toggleCategory = (label: string) => {
    setActiveCategories((prev) =>
      prev.includes(label) ? [] : [label]
    );
  };

  const toggleOption = (
    value: string,
    current: string[],
    setter: (v: string[]) => void
  ) => {
    setter(
      current.includes(value)
        ? current.filter((v) => v !== value)
        : [...current, value]
    );
  };

  const clearAll = () => {
    setActiveType([]);
    setActiveLocation([]);
    setActiveRoles([]);
    setActiveCategories([]);
  };

  const totalActiveFilters =
    activeType.length + activeLocation.length + activeRoles.length;

  const filteredJobs = jobs.filter((j) => {
    const matchesSearch = j.title?.toLowerCase().includes(search.toLowerCase());
    const matchesType =
      activeType.length === 0 ||
      activeType.some((t) => j.employment_type?.toLowerCase() === t.toLowerCase());
    const matchesLocation =
      activeLocation.length === 0 ||
      activeLocation.some((l) => j.location_type?.toLowerCase() === l.toLowerCase());
    return matchesSearch && matchesType && matchesLocation;
  });

  const bottomBarHeight = 64 + insets.bottom;

  const renderJobCard = ({ item }: { item: any }) => (
    <TouchableOpacity 
      style={styles.jobCard} 
      activeOpacity={0.7}
      onPress={() => router.push({
        pathname: "/(student)/job-details",
        params: { job: JSON.stringify(item) } 
      })}
    >
      <View style={styles.cardHeader}>
        <View style={styles.textContainer}>
          <Text style={styles.jobTitle} numberOfLines={1}>
            {item.title || "Untitled Role"}
          </Text>
          <Text style={styles.companyName}>Company Name</Text>
        </View>
      </View>

      <View style={styles.infoRow}>
        <Ionicons name="location-outline" size={13} color="#1F4FA3" />
        <Text style={styles.infoText}>
          {item.location_type || "Remote"} | {item.location || "N/A"}
        </Text>
      </View>

      <View style={styles.infoRow}>
        <Text style={styles.salaryText}>
          ₹ {item.pay_min || "-"} - ₹ {item.pay_max || "-"} /{" "}
          {item.pay_rate || "month"}
        </Text>
      </View>

      <View style={styles.tagRow}>
        <View style={styles.tagPill}>
          <Text style={styles.tagText}>Client Servicing</Text>
        </View>
        <View style={styles.morePill}>
          <Text style={styles.moreText}>+3</Text>
        </View>
      </View>

      <View style={styles.cardFooter}>
        <Text style={styles.dateText}>
          {item.created_at
            ? new Date(item.created_at).toLocaleDateString("en-US", {
                month: "short",
                day: "numeric",
                year: "numeric",
              })
            : "Recent"}
        </Text>
        <TouchableOpacity 
          onPress={(e) => {
            e.stopPropagation(); 
            console.log("Saved!");
          }}
        >
          <Ionicons name="heart-outline" size={18} color="#1F4FA3" />
        </TouchableOpacity>
      </View>
    </TouchableOpacity>
  );

  const renderModal = (
    title: string,
    options: string[],
    selected: string[],
    setter: (v: string[]) => void
  ) => (
    <Modal
      visible={openModal === title}
      transparent
      animationType="slide"
      onRequestClose={() => setOpenModal(null)}
    >
      <TouchableOpacity
        style={styles.modalOverlay}
        activeOpacity={1}
        onPress={() => setOpenModal(null)}
      >
        <View
          style={[styles.modalSheet, { paddingBottom: insets.bottom + 16 }]}
          onStartShouldSetResponder={() => true}
        >
          <View style={styles.modalHandle} />
          <View style={styles.modalHeader}>
            <Text style={styles.modalTitle}>{title}</Text>
            {selected.length > 0 && (
              <TouchableOpacity onPress={() => setter([])}>
                <Text style={styles.clearText}>Clear</Text>
              </TouchableOpacity>
            )}
          </View>
          <View style={styles.optionGrid}>
            {options.map((opt) => {
              const active = selected.includes(opt);
              return (
                <TouchableOpacity
                  key={opt}
                  style={[styles.optionChip, active && styles.optionChipActive]}
                  onPress={() => toggleOption(opt, selected, setter)}
                >
                  {active && (
                    <Ionicons
                      name="checkmark"
                      size={13}
                      color="#FFF"
                      style={{ marginRight: 4 }}
                    />
                  )}
                  <Text
                    style={[
                      styles.optionChipText,
                      active && styles.optionChipTextActive,
                    ]}
                  >
                    {opt}
                  </Text>
                </TouchableOpacity>
              );
            })}
          </View>
          <TouchableOpacity
            style={styles.applyBtn}
            onPress={() => setOpenModal(null)}
          >
            <Text style={styles.applyBtnText}>Apply</Text>
          </TouchableOpacity>
        </View>
      </TouchableOpacity>
    </Modal>
  );

  const renderAllFiltersModal = () => (
    <Modal
      visible={openModal === "All"}
      transparent
      animationType="slide"
      onRequestClose={() => setOpenModal(null)}
    >
      <TouchableOpacity
        style={styles.modalOverlay}
        activeOpacity={1}
        onPress={() => setOpenModal(null)}
      >
        <View
          style={[styles.modalSheet, { paddingBottom: insets.bottom + 16 }]}
          onStartShouldSetResponder={() => true}
        >
          <View style={styles.modalHandle} />
          <View style={styles.modalHeader}>
            <Text style={styles.modalTitle}>All Filters</Text>
            {totalActiveFilters > 0 && (
              <TouchableOpacity onPress={clearAll}>
                <Text style={styles.clearText}>Clear All</Text>
              </TouchableOpacity>
            )}
          </View>

          <Text style={styles.sectionLabel}>Type</Text>
          <View style={styles.optionGrid}>
            {TYPE_OPTIONS.map((opt) => {
              const active = activeType.includes(opt);
              return (
                <TouchableOpacity
                  key={opt}
                  style={[styles.optionChip, active && styles.optionChipActive]}
                  onPress={() => toggleOption(opt, activeType, setActiveType)}
                >
                  {active && (
                    <Ionicons name="checkmark" size={13} color="#FFF" style={{ marginRight: 4 }} />
                  )}
                  <Text style={[styles.optionChipText, active && styles.optionChipTextActive]}>{opt}</Text>
                </TouchableOpacity>
              );
            })}
          </View>

          <Text style={styles.sectionLabel}>Location</Text>
          <View style={styles.optionGrid}>
            {LOCATION_OPTIONS.map((opt) => {
              const active = activeLocation.includes(opt);
              return (
                <TouchableOpacity
                  key={opt}
                  style={[styles.optionChip, active && styles.optionChipActive]}
                  onPress={() => toggleOption(opt, activeLocation, setActiveLocation)}
                >
                  {active && (
                    <Ionicons name="checkmark" size={13} color="#FFF" style={{ marginRight: 4 }} />
                  )}
                  <Text style={[styles.optionChipText, active && styles.optionChipTextActive]}>{opt}</Text>
                </TouchableOpacity>
              );
            })}
          </View>

          <Text style={styles.sectionLabel}>Roles</Text>
          <View style={styles.optionGrid}>
            {ROLE_OPTIONS.map((opt) => {
              const active = activeRoles.includes(opt);
              return (
                <TouchableOpacity
                  key={opt}
                  style={[styles.optionChip, active && styles.optionChipActive]}
                  onPress={() => toggleOption(opt, activeRoles, setActiveRoles)}
                >
                  {active && (
                    <Ionicons name="checkmark" size={13} color="#FFF" style={{ marginRight: 4 }} />
                  )}
                  <Text style={[styles.optionChipText, active && styles.optionChipTextActive]}>{opt}</Text>
                </TouchableOpacity>
              );
            })}
          </View>

          <TouchableOpacity
            style={styles.applyBtn}
            onPress={() => setOpenModal(null)}
          >
            <Text style={styles.applyBtnText}>Apply Filters</Text>
          </TouchableOpacity>
        </View>
      </TouchableOpacity>
    </Modal>
  );

  return (
    <View style={styles.container}>
      <StatusBar barStyle="dark-content" backgroundColor="#FFF" translucent={true} />

      <View style={styles.headerWrapper}>
        <View style={styles.searchContainer}>
          <TouchableOpacity onPress={() => router.back()} style={styles.backBtn}>
            <Ionicons name="arrow-back" size={22} color="#222222" />
          </TouchableOpacity>
          <View style={styles.searchBox}>
            <Ionicons name="search-outline" size={18} color="#999" />
            <TextInput
              placeholder="Search Jobs"
              placeholderTextColor="#999"
              style={styles.input}
              value={search}
              onChangeText={setSearch}
            />
            {search.length > 0 && (
              <TouchableOpacity onPress={() => setSearch("")}>
                <Ionicons name="close-circle" size={16} color="#999" />
              </TouchableOpacity>
            )}
          </View>
        </View>

        <View style={styles.topFilterScroll}>
          <ScrollView
            horizontal
            showsHorizontalScrollIndicator={false}
            contentContainerStyle={{ paddingHorizontal: 15 }}
          >
            {TOP_FILTERS.map(({ icon, label }) => {
              const active = activeCategories.includes(label);
              return (
                <TouchableOpacity
                  key={label}
                  style={[styles.pill, active && styles.activePill]}
                  onPress={() => toggleCategory(label)}
                >
                  <MaterialCommunityIcons
                    name={icon as any}
                    size={16}
                    color={active ? "#FFF" : "#222222"}
                  />
                  <Text style={[styles.pillText, active && styles.activePillText]}>
                    {label}
                  </Text>
                </TouchableOpacity>
              );
            })}
          </ScrollView>
        </View>
      </View>

      {loading ? (
        <ActivityIndicator size="small" color="#1F4FA3" style={{ marginTop: 50 }} />
      ) : (
        <FlatList
          data={filteredJobs}
          renderItem={renderJobCard}
          keyExtractor={(item) => item.id.toString()}
          contentContainerStyle={[
            styles.listContent,
            { paddingBottom: bottomBarHeight + 16 },
          ]}
          showsVerticalScrollIndicator={false}
          ListEmptyComponent={
            <View style={styles.emptyState}>
              <MaterialCommunityIcons name="briefcase-search-outline" size={48} color="#CCC" />
              <Text style={styles.emptyText}>No jobs match your filters</Text>
              <TouchableOpacity onPress={clearAll}>
                <Text style={styles.emptyLink}>Clear all filters</Text>
              </TouchableOpacity>
            </View>
          }
        />
      )}

      <View style={[styles.bottomFilterBar, { paddingBottom: insets.bottom || 12 }]}>
        <TouchableOpacity
          style={[styles.bottomBtn, activeType.length > 0 && styles.activeBottomBtn]}
          onPress={() => setOpenModal("Type")}
        >
          <Text style={[styles.bottomBtnText, activeType.length > 0 && styles.activeBottomBtnText]}>
            {activeType.length > 0 ? `Type (${activeType.length})` : "Type"}
          </Text>
          <Ionicons
            name="chevron-down"
            size={14}
            color={activeType.length > 0 ? "#FFF" : "#222222"}
          />
        </TouchableOpacity>

        <TouchableOpacity
          style={[styles.bottomBtn, activeLocation.length > 0 && styles.activeBottomBtn]}
          onPress={() => setOpenModal("Location")}
        >
          <Text style={[styles.bottomBtnText, activeLocation.length > 0 && styles.activeBottomBtnText]}>
            {activeLocation.length > 0 ? `Location (${activeLocation.length})` : "Location"}
          </Text>
          {activeLocation.length > 0 && (
            <Ionicons name="chevron-down" size={14} color="#FFF" />
          )}
        </TouchableOpacity>

        <TouchableOpacity
          style={[styles.bottomBtn, activeRoles.length > 0 && styles.activeBottomBtn]}
          onPress={() => setOpenModal("Roles")}
        >
          <Text style={[styles.bottomBtnText, activeRoles.length > 0 && styles.activeBottomBtnText]}>
            {activeRoles.length > 0 ? `Roles (${activeRoles.length})` : "Roles"}
          </Text>
          {activeRoles.length > 0 && (
            <Ionicons name="chevron-down" size={14} color="#FFF" />
          )}
        </TouchableOpacity>

        <TouchableOpacity
          style={[styles.filterIconBtn, totalActiveFilters > 0 && styles.filterIconBtnActive]}
          onPress={() => setOpenModal("All")}
        >
          <MaterialCommunityIcons name="filter-variant" size={20} color="#FFF" />
          {totalActiveFilters > 0 && (
            <View style={styles.filterBadge}>
              <Text style={styles.filterBadgeText}>{totalActiveFilters}</Text>
            </View>
          )}
        </TouchableOpacity>
      </View>

      {renderModal("Type", TYPE_OPTIONS, activeType, setActiveType)}
      {renderModal("Location", LOCATION_OPTIONS, activeLocation, setActiveLocation)}
      {renderModal("Roles", ROLE_OPTIONS, activeRoles, setActiveRoles)}
      {renderAllFiltersModal()}
    </View>
  );
}

const styles = StyleSheet.create({
  container: { flex: 1, backgroundColor: "#FFF" },
  headerWrapper: {
    paddingTop: Platform.OS === "android" ? (StatusBar.currentHeight || 0) + 15 : 60,
    backgroundColor: "#FFF",
    borderBottomWidth: 1,
    borderBottomColor: "#E2E8F0",
    paddingBottom: 5,
  },
  searchContainer: {
    flexDirection: "row",
    alignItems: "center",
    paddingHorizontal: 15,
    marginBottom: 10,
  },
  backBtn: { marginRight: 10 },
  searchBox: {
    flex: 1,
    flexDirection: "row",
    alignItems: "center",
    backgroundColor: "#F7F7F7",
    borderRadius: 12,
    paddingHorizontal: 12,
    height: 40,
  },
  input: { flex: 1, marginLeft: 8, fontSize: 14, color: "#222222" },
  topFilterScroll: { marginBottom: 10 },
  pill: {
    flexDirection: "row",
    alignItems: "center",
    paddingHorizontal: 10,
    paddingVertical: 6,
    borderRadius: 8,
    borderWidth: 1,
    borderColor: "#E2E8F0",
    marginRight: 8,
    backgroundColor: "#FFF",
  },
  activePill: { backgroundColor: "#1F4FA3", borderColor: "#1F4FA3" },
  pillText: { marginLeft: 6, fontSize: 12, fontWeight: "500", color: "#222222" },
  activePillText: { color: "#FFF" },
  listContent: { paddingHorizontal: 15, paddingTop: 15 },
  jobCard: {
    backgroundColor: "#FFF",
    borderRadius: 12,
    padding: 12,
    marginBottom: 12,
    borderWidth: 1,
    borderColor: "#E2E8F0",
    elevation: 2,
    shadowColor: "#000",
    shadowOffset: { width: 0, height: 1 },
    shadowOpacity: 0.1,
    shadowRadius: 2,
  },
  cardHeader: { flexDirection: "row", marginBottom: 4 },
  textContainer: { flex: 1 },
  jobTitle: { fontSize: 15, fontWeight: "700", color: "#222222" },
  companyName: { fontSize: 12, color: "#888" },
  infoRow: { flexDirection: "row", alignItems: "center", marginTop: 4 },
  infoText: { marginLeft: 5, color: "#666", fontSize: 12 },
  salaryText: { color: "#222222", fontWeight: "600", fontSize: 12, marginTop: 4 },
  tagRow: { flexDirection: "row", marginTop: 12 },
  tagPill: {
    backgroundColor: "#F2F2F2",
    paddingHorizontal: 8,
    paddingVertical: 4,
    borderRadius: 12,
    borderWidth: 1,
    borderColor: "#E2E8F0",
  },
  tagText: { color: "#222222", fontSize: 10, fontWeight: "600" },
  morePill: {
    backgroundColor: "#F0F9F0",
    paddingHorizontal: 6,
    paddingVertical: 4,
    borderRadius: 12,
    marginLeft: 6,
    borderWidth: 1,
    borderColor: "#E2E8F0",
  },
  moreText: { color: "#1F4FA3", fontSize: 10, fontWeight: "700" },
  cardFooter: {
    flexDirection: "row",
    justifyContent: "space-between",
    alignItems: "center",
    marginTop: 12,
    borderTopWidth: 1,
    borderTopColor: "#E2E8F0",
    paddingTop: 10,
  },
  dateText: { color: "#1F4FA3", fontWeight: "500", fontSize: 11 },
  emptyState: { alignItems: "center", marginTop: 60, gap: 10 },
  emptyText: { color: "#999", fontSize: 14 },
  emptyLink: { color: "#1F4FA3", fontSize: 13, fontWeight: "600" },

  bottomFilterBar: {
    position: "absolute",
    bottom: 0,
    left: 0,
    right: 0,
    flexDirection: "row",
    alignItems: "center",
    justifyContent: "space-around",
    paddingHorizontal: 20,
    paddingTop: 12,
    backgroundColor: "#FFF",
    borderTopWidth: 1,
    borderTopColor: "#E2E8F0",
    zIndex: 999,
  },
  bottomBtn: {
    backgroundColor: "#FFF",
    paddingHorizontal: 14,
    paddingVertical: 9,
    borderRadius: 20,
    borderWidth: 1,
    borderColor: "#E2E8F0",
    flexDirection: "row",
    alignItems: "center",
    gap: 4,
  },
  activeBottomBtn: { backgroundColor: "#1F4FA3", borderColor: "#1F4FA3" },
  activeBottomBtnText: { color: "#FFF", fontWeight: "600", fontSize: 12 },
  bottomBtnText: { color: "#222222", fontWeight: "600", fontSize: 12 },
  filterIconBtn: {
    backgroundColor: "#222222",
    padding: 11,
    borderRadius: 20,
  },
  filterIconBtnActive: { backgroundColor: "#1F4FA3" },
  filterBadge: {
    position: "absolute",
    top: -4,
    right: -4,
    backgroundColor: "#EF4444",
    borderRadius: 8,
    width: 16,
    height: 16,
    alignItems: "center",
    justifyContent: "center",
  },
  filterBadgeText: { color: "#FFF", fontSize: 9, fontWeight: "700" },

  modalOverlay: {
    flex: 1,
    backgroundColor: "rgba(0,0,0,0.4)",
    justifyContent: "flex-end",
  },
  modalSheet: {
    backgroundColor: "#FFF",
    borderTopLeftRadius: 20,
    borderTopRightRadius: 20,
    paddingHorizontal: 20,
    paddingTop: 12,
  },
  modalHandle: {
    width: 36,
    height: 4,
    backgroundColor: "#E2E8F0",
    borderRadius: 2,
    alignSelf: "center",
    marginBottom: 16,
  },
  modalHeader: {
    flexDirection: "row",
    justifyContent: "space-between",
    alignItems: "center",
    marginBottom: 20,
  },
  modalTitle: { fontSize: 16, fontWeight: "700", color: "#222222" },
  clearText: { fontSize: 13, color: "#1F4FA3", fontWeight: "600" },
  sectionLabel: {
    fontSize: 13,
    fontWeight: "700",
    color: "#555",
    marginBottom: 10,
    marginTop: 8,
  },
  optionGrid: { flexDirection: "row", flexWrap: "wrap", gap: 10, marginBottom: 8 },
  optionChip: {
    flexDirection: "row",
    alignItems: "center",
    paddingHorizontal: 14,
    paddingVertical: 8,
    borderRadius: 20,
    borderWidth: 1,
    borderColor: "#E2E8F0",
    backgroundColor: "#FFF",
  },
  optionChipActive: { backgroundColor: "#1F4FA3", borderColor: "#1F4FA3" },
  optionChipText: { fontSize: 13, color: "#222222", fontWeight: "500" },
  optionChipTextActive: { color: "#FFF" },
  applyBtn: {
    backgroundColor: "#1F4FA3",
    borderRadius: 12,
    paddingVertical: 14,
    alignItems: "center",
    marginTop: 20,
  },
  applyBtnText: { color: "#FFF", fontWeight: "700", fontSize: 15 },
});