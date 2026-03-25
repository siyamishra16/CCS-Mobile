
import React, { useState, useEffect } from 'react';
import { 
  View, Text, StyleSheet, FlatList, TouchableOpacity, 
  ActivityIndicator, StatusBar, RefreshControl 
} from 'react-native';
import { SafeAreaView } from 'react-native-safe-area-context';
import { useLocalSearchParams, useRouter } from 'expo-router';
import { Ionicons } from '@expo/vector-icons';
import { apiRequest } from '../../services/api'; 

const PRIMARY_BLUE = "#1F4FA3";
const BORDER_BLUE = "#BFDBFE"; 
const TEXT_DARK = "#222222"; 

export default function SubCategoriesScreen() {
  const { categoryId, categoryName } = useLocalSearchParams();
  const [subs, setSubs] = useState<any[]>([]);
  const [loading, setLoading] = useState(true);
  const [refreshing, setRefreshing] = useState(false);
  const router = useRouter();

  const fetchSubs = async () => {
    try {
      const response: any = await apiRequest(`/exam-management/subcategories?category_id=${categoryId}`, 'GET');
      if (response?.data?.data && Array.isArray(response.data.data)) {
        setSubs(response.data.data);
      } else {
        setSubs([]);
      }
    } catch (err) {
      console.error("Sub-fetch failed", err);
      setSubs([]);
    } finally {
      setLoading(false);
      setRefreshing(false);
    }
  };

  useEffect(() => {
    if (categoryId) fetchSubs();
  }, [categoryId]);

  return (
    <SafeAreaView style={styles.container}>
      <StatusBar barStyle="dark-content" />
      <View style={styles.header}>
        <TouchableOpacity onPress={() => router.back()} style={styles.backBtn}>
          <Ionicons name="chevron-back" size={22} color={TEXT_DARK} />
        </TouchableOpacity>
        <View style={{ marginLeft: 8 }}>
          <Text style={styles.title}>{categoryName || "Topics"}</Text>
          <Text style={styles.subtitle}>Select a module to practice</Text>
        </View>
      </View>

      {loading ? (
        <View style={styles.center}><ActivityIndicator color={PRIMARY_BLUE} size="large" /></View>
      ) : (
        <FlatList
          data={subs}
          keyExtractor={(item) => item.id.toString()}
          contentContainerStyle={styles.list}
          refreshControl={<RefreshControl refreshing={refreshing} onRefresh={() => {setRefreshing(true); fetchSubs();}} tintColor={PRIMARY_BLUE} />}
          renderItem={({ item }) => (
            <TouchableOpacity 
              style={styles.row}
              activeOpacity={0.7}
              onPress={() => router.push({
                pathname: "/(student)/exams", 
                params: { subCategoryId: item.id, subCategoryName: item.name }
              })}
            >
              <View style={styles.textContent}>
                <Text style={styles.subTitle}>{item.name}</Text>
                <Text style={styles.subInfo} numberOfLines={1}>
                  {item.short_description || "Detailed skill assessment"}
                </Text>
              </View>
              <View style={styles.playIconBox}>
                <Ionicons name="play" size={10} color="#FFF" style={{ marginLeft: 2 }} />
              </View>
            </TouchableOpacity>
          )}
          ListEmptyComponent={<Text style={styles.emptyText}>No modules available.</Text>}
        />
      )}
    </SafeAreaView>
  );
}

const styles = StyleSheet.create({
  container: { flex: 1, backgroundColor: '#FFFFFF' },
  header: { flexDirection: 'row', alignItems: 'center', paddingHorizontal: 16, paddingVertical: 12, borderBottomWidth: 1, borderBottomColor: '#F1F5F9' },
  backBtn: { padding: 4 },
  title: { fontSize: 18, fontWeight: '700', color: TEXT_DARK },
  subtitle: { fontSize: 11, color: '#94A3B8', marginTop: -2 },
  list: { padding: 16 },
  row: { 
    flexDirection: 'row', 
    alignItems: 'center', 
    padding: 14, 
    backgroundColor: '#F8FAFC', 
    borderRadius: 12, 
    marginBottom: 10, 
    borderWidth: 1, 
    borderColor: BORDER_BLUE 
  },
  textContent: { flex: 1 },
  subTitle: { fontSize: 15, fontWeight: '600', color: TEXT_DARK },
  subInfo: { fontSize: 12, color: '#64748B', marginTop: 4 },
  playIconBox: { 
    width: 24, 
    height: 24, 
    borderRadius: 12, 
    backgroundColor: PRIMARY_BLUE, 
    justifyContent: 'center', 
    alignItems: 'center' 
  },
  center: { flex: 1, justifyContent: 'center', alignItems: 'center', marginTop: 40 },
  emptyText: { textAlign: 'center', color: '#94A3B8', marginTop: 20 }
});