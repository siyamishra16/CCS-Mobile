import React, { useState, useEffect } from 'react';
import { View, Text, StyleSheet, FlatList, TouchableOpacity, TextInput, StatusBar, ActivityIndicator, RefreshControl } from 'react-native';
import { SafeAreaView } from 'react-native-safe-area-context';
import { Ionicons } from '@expo/vector-icons';
import { useRouter } from 'expo-router';
import { apiRequest } from '../../services/api'; 

const PRIMARY_BLUE = "#1F4FA3";
const BORDER_BLUE = "#BFDBFE"; 
const TEXT_DARK = "#222222"; 

export default function SkillTestsScreen() {
  const router = useRouter();
  const [categories, setCategories] = useState<any[]>([]);
  const [loading, setLoading] = useState(true);
  const [search, setSearch] = useState('');

  const loadCategories = async () => {
    try {
      const response: any = await apiRequest('/exam-management/categories', 'GET'); 
      if (response?.data?.data) setCategories(response.data.data);
    } catch (error) { console.error(error); }
    finally { setLoading(false); }
  };

  useEffect(() => { loadCategories(); }, []);

  const filteredData = categories.filter(item => item?.name?.toLowerCase().includes(search.toLowerCase()));

  return (
    <SafeAreaView style={styles.container}>
      <StatusBar barStyle="dark-content" />
      <View style={styles.header}>
        <TouchableOpacity onPress={() => router.back()}>
          <Ionicons name="chevron-back" size={22} color={TEXT_DARK} />
        </TouchableOpacity>
        <Text style={styles.headerTitle}>Skill Tests</Text>
      </View>

      <View style={styles.searchWrapper}>
        <View style={styles.searchBox}>
          <Ionicons name="search-outline" size={18} color="#94A3B8" style={{ marginLeft: 10 }} />
          <TextInput 
            style={styles.searchInput} 
            placeholder="Search..." 
            value={search} 
            onChangeText={setSearch} 
            placeholderTextColor="#94A3B8" 
          />
        </View>
      </View>

      {loading ? (
        <ActivityIndicator color={PRIMARY_BLUE} style={{ marginTop: 40 }} />
      ) : (
        <FlatList
          data={filteredData}
          keyExtractor={(item) => item.id.toString()}
          contentContainerStyle={styles.list}
          renderItem={({ item }) => (
            <TouchableOpacity 
              style={styles.card} 
              onPress={() => router.push({
                pathname: "/(student)/[categoryId]",
                params: { categoryId: item.id, categoryName: item.name }
              })}
            >
              <View style={styles.iconBox}>
                <Text style={styles.iconText}>{item.name.charAt(0).toUpperCase()}</Text>
              </View>
              <View style={{ flex: 1, marginLeft: 12 }}>
                <Text style={styles.catName}>{item.name}</Text>
                <Text style={styles.catDesc} numberOfLines={1}>
                  {item.short_description || "Assess your skills"}
                </Text>
              </View>
              <Ionicons name="chevron-forward" size={14} color={PRIMARY_BLUE} />
            </TouchableOpacity>
          )}
        />
      )}
    </SafeAreaView>
  );
}

const styles = StyleSheet.create({
  container: { flex: 1, backgroundColor: '#FFF' },
  header: { flexDirection: 'row', alignItems: 'center', padding: 16 },
  headerTitle: { fontSize: 18, fontWeight: '700', color: TEXT_DARK, marginLeft: 8 },
  searchWrapper: { paddingHorizontal: 16, marginBottom: 12 },
  searchBox: { 
    flexDirection: 'row', 
    alignItems: 'center', 
    backgroundColor: '#F8FAFC', 
    borderRadius: 10, 
    height: 44,
    borderWidth: 1,
    borderColor: BORDER_BLUE 
  },
  searchInput: { flex: 1, paddingHorizontal: 10, fontSize: 15, color: TEXT_DARK },
  list: { paddingHorizontal: 16 },
  card: { 
    flexDirection: 'row', 
    alignItems: 'center', 
    padding: 12, 
    borderRadius: 12,
    backgroundColor: '#FFF',
    marginBottom: 10,
    borderWidth: 1, 
    borderColor: BORDER_BLUE 
  },
  iconBox: { 
    width: 40, 
    height: 40, 
    borderRadius: 8, 
    backgroundColor: '#EBF2FF', 
    justifyContent: 'center', 
    alignItems: 'center' 
  },
  iconText: { color: PRIMARY_BLUE, fontWeight: 'bold', fontSize: 16 },
  catName: { fontSize: 15, fontWeight: '600', color: TEXT_DARK },
  catDesc: { fontSize: 12, color: '#64748B', marginTop: 2 }
});