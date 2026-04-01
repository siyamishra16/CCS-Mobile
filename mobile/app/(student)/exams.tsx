import React, { useState, useEffect } from 'react';
import { View, Text, StyleSheet, FlatList, TouchableOpacity, ActivityIndicator, StatusBar, RefreshControl } from 'react-native';
import { SafeAreaView } from 'react-native-safe-area-context';
import { useLocalSearchParams, useRouter } from 'expo-router';
import { Ionicons } from '@expo/vector-icons';
import { apiRequest } from '../../services/api'; 

const PRIMARY_BLUE = "#1F4FA3";
const BORDER_BLUE = "#BFDBFE"; 
const TEXT_DARK = "#222222"; 

export default function ExamsScreen() {
  const { subCategoryId, subCategoryName } = useLocalSearchParams();
  const [exams, setExams] = useState<any[]>([]);
  const [loading, setLoading] = useState(true);
  const [refreshing, setRefreshing] = useState(false);
  const router = useRouter();

  const fetchExams = async () => {
    if (!subCategoryId) return;
    try {
      const response: any = await apiRequest(`/exam-management/exams`, 'GET');
      if (response?.data?.data && Array.isArray(response.data.data)) {
        const filtered = response.data.data.filter((ex: any) => 
          ex.sub_category_id == subCategoryId || ex.subcategory_id == subCategoryId
        );
        setExams(filtered);
      }
    } catch (err) {
      console.error(err);
    } finally {
      setLoading(false);
      setRefreshing(false);
    }
  };

  useEffect(() => { fetchExams(); }, [subCategoryId]);

  const handlePress = (item: any) => {
    router.push({
      pathname: "/(student)/exam-levels/[examId]", // Naya level page
      params: { examId: item.id, examTitle: item.title || item.name }
    });
  };

  return (
    <SafeAreaView style={styles.container}>
      <StatusBar barStyle="dark-content" />
      <View style={styles.header}>
        <TouchableOpacity onPress={() => router.back()} style={styles.backBtn}>
          <Ionicons name="chevron-back" size={22} color={TEXT_DARK} />
        </TouchableOpacity>
        <Text style={styles.title} numberOfLines={1}>{subCategoryName || "Exams"}</Text>
      </View>

      {loading ? (
        <ActivityIndicator color={PRIMARY_BLUE} size="small" style={{ marginTop: 30 }} />
      ) : (
        <FlatList
          data={exams}
          keyExtractor={(item) => item.id.toString()}
          contentContainerStyle={styles.listContainer}
          refreshControl={<RefreshControl refreshing={refreshing} onRefresh={() => {setRefreshing(true); fetchExams();}} tintColor={PRIMARY_BLUE} />}
          renderItem={({ item }) => (
            <TouchableOpacity style={styles.examCard} activeOpacity={0.9} onPress={() => handlePress(item)}>
              <View style={styles.cardHeader}>
                <View style={styles.badge}><Text style={styles.badgeText}>{item.level || 'Practice'}</Text></View>
                <View style={styles.timeRow}>
                  <Ionicons name="time-outline" size={12} color={PRIMARY_BLUE} />
                  <Text style={styles.timeText}>{item.duration || 15}m</Text>
                </View>
              </View>
              <Text style={styles.examTitle}>{item.title || item.name}</Text>
              <View style={styles.footer}>
                <Text style={styles.examInfo}>{item.total_questions || 0} Questions</Text>
                <TouchableOpacity style={styles.startBtn} onPress={() => handlePress(item)}>
                  <Text style={styles.startText}>View Levels</Text>
                  <Ionicons name="chevron-forward" size={12} color="#FFF" />
                </TouchableOpacity>
              </View>
            </TouchableOpacity>
          )}
          ListEmptyComponent={<View style={styles.emptyBox}><Text style={styles.empty}>No exams available.</Text></View>}
        />
      )}
    </SafeAreaView>
  );
}

const styles = StyleSheet.create({
  container: { flex: 1, backgroundColor: '#FFF' },
  header: { flexDirection: 'row', alignItems: 'center', paddingHorizontal: 12, paddingVertical: 10, borderBottomWidth: 1, borderBottomColor: '#F1F5F9' },
  backBtn: { padding: 4 },
  title: { fontSize: 17, fontWeight: '700', marginLeft: 4, color: TEXT_DARK, flex: 1 },
  listContainer: { padding: 14 },
  examCard: { padding: 12, borderRadius: 10, backgroundColor: '#F8FAFC', marginBottom: 12, borderWidth: 1, borderColor: BORDER_BLUE },
  cardHeader: { flexDirection: 'row', justifyContent: 'space-between', marginBottom: 8 },
  badge: { backgroundColor: '#EBF2FF', paddingHorizontal: 8, paddingVertical: 3, borderRadius: 5 },
  badgeText: { color: PRIMARY_BLUE, fontSize: 10, fontWeight: '700', textTransform: 'uppercase' },
  timeRow: { flexDirection: 'row', alignItems: 'center' },
  timeText: { fontSize: 12, color: PRIMARY_BLUE, marginLeft: 3, fontWeight: '600' },
  examTitle: { fontSize: 15, fontWeight: '700', color: TEXT_DARK, marginBottom: 10 },
  footer: { flexDirection: 'row', justifyContent: 'space-between', alignItems: 'center', borderTopWidth: 1, borderTopColor: '#E2E8F0', paddingTop: 10 },
  examInfo: { fontSize: 12, color: '#64748B' },
  startBtn: { flexDirection: 'row', alignItems: 'center', backgroundColor: PRIMARY_BLUE, paddingHorizontal: 14, paddingVertical: 7, borderRadius: 7 },
  startText: { color: '#FFF', fontSize: 12, fontWeight: '600', marginRight: 4 },
  emptyBox: { flex: 1, alignItems: 'center', marginTop: 50 },
  empty: { color: '#94A3B8', fontSize: 14 }
});