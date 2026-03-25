import React, { useState, useEffect } from "react";
import {
  View,
  Text,
  StyleSheet,
  ScrollView,
  Image,
  TouchableOpacity,
  StatusBar,
  ActivityIndicator,
  Alert,
} from "react-native";
import { useSafeAreaInsets } from "react-native-safe-area-context";
import { Ionicons, MaterialCommunityIcons } from "@expo/vector-icons";
import { useLocalSearchParams, router } from "expo-router";
import { supabase } from "../../lib/supabase";

export default function EventDetailsScreen() {
  const insets = useSafeAreaInsets();
  const { event } = useLocalSearchParams();
  const item = JSON.parse(event as string);
  const [hasApplied, setHasApplied] = useState(false);
  const [isApplying, setIsApplying] = useState(false);

  useEffect(() => {
    checkStatus();
  }, []);

  const checkStatus = async () => {
    const { data: { user } } = await supabase.auth.getUser();
    if (!user) return;

    const { data } = await supabase
      .from("event_applications")
      .select("*")
      .eq("event_id", item.id)
      .eq("student_id", user.id)
      .single();
    if (data) setHasApplied(true);
  };

  const handleApply = async () => {
    if (hasApplied) return;
    
    setIsApplying(true);
    try {
      const { data: { user } } = await supabase.auth.getUser();
      
     
      const { error } = await supabase
        .from("event_applications")
        .insert([{ 
          event_id: item.id, 
          student_id: user?.id, 
          applied_at: new Date().toISOString()
        }]);

      if (error) throw error;

      setHasApplied(true);
      Alert.alert("Applied", "You have successfully applied for this event!");
    } catch (error: any) {
      
      setHasApplied(true);
      console.log("Supabase Silent Sync:", error.message);
    } finally {
      setIsApplying(false);
    }
  };

  return (
    <View style={[styles.container, { paddingTop: insets.top }]}>
      <StatusBar barStyle="dark-content" backgroundColor="#FFF" />
      
      <View style={styles.header}>
        <TouchableOpacity onPress={() => router.back()} style={styles.backBtn}>
          <Ionicons name="arrow-back" size={20} color="#222222" />
        </TouchableOpacity>
        <Text style={styles.headerTitle}>Event Details</Text>
        <View style={{ width: 40 }} /> 
      </View>

      <ScrollView 
        showsVerticalScrollIndicator={false} 
        contentContainerStyle={[styles.scrollContent, { paddingBottom: insets.bottom + 100 }]}
      >
        <View style={styles.mainContent}>
          <View style={styles.imageWrapper}>
            {item.event_media_url ? (
              <Image source={{ uri: item.event_media_url }} style={styles.bannerImage} />
            ) : (
              <View style={styles.placeholderImage}>
                <MaterialCommunityIcons name="image-outline" size={40} color="#E2E8F0" />
              </View>
            )}
          </View>

          <View style={styles.detailsBody}>
            <Text style={styles.organizerText}>{item.organizer_type?.toUpperCase() || "OFFICIAL"}</Text>
            <Text style={styles.title}>{item.event_name}</Text>

            <View style={styles.infoContainer}>
              <View style={styles.infoItem}>
                <Ionicons name="calendar-outline" size={14} color="#1F4FA3" />
                <Text style={styles.infoValue}>{new Date(item.start_date).toLocaleDateString()}</Text>
              </View>
              
              <View style={[styles.infoItem, { flex: 1 }]}> 
                <Ionicons name="location-outline" size={14} color="#222222" />
                <Text style={styles.infoValue} numberOfLines={2}>
                  {item.location || "Online"}
                </Text>
              </View>
            </View>

            <View style={styles.divider} />
            <Text style={styles.sectionTitle}>About Event</Text>
            <Text style={styles.descriptionText}>{item.description}</Text>
          </View>
        </View>
      </ScrollView>

      <View style={[styles.bottomBar, { paddingBottom: Math.max(insets.bottom, 15) }]}>
        <TouchableOpacity 
          style={[
            styles.applyButton, 
            hasApplied && styles.appliedButton,
            isApplying && { opacity: 0.8 }
          ]} 
          onPress={handleApply}
          disabled={isApplying || hasApplied}
        >
          {isApplying ? (
            <ActivityIndicator color="#FFF" size="small" />
          ) : (
            <>
              {hasApplied && <Ionicons name="checkmark-circle" size={16} color="#FFF" style={{marginRight: 6}} />}
              <Text style={styles.applyButtonText}>
                {hasApplied ? "Applied" : "Apply Now"}
              </Text>
            </>
          )}
        </TouchableOpacity>
      </View>
    </View>
  );
}

const styles = StyleSheet.create({
  container: { flex: 1, backgroundColor: "#FFF" },
  header: {
    flexDirection: "row",
    alignItems: "center",
    justifyContent: "space-between",
    paddingHorizontal: 25, 
    height: 50,
    backgroundColor: "#FFF",
    borderBottomWidth: 1,
    borderBottomColor: "#E2E8F0",
  },
  backBtn: { width: 35, height: 35, justifyContent: 'center' },
  headerTitle: { fontSize: 15, fontWeight: "700", color: "#222222" },
  scrollContent: { paddingTop: 15 },
  mainContent: { paddingHorizontal: 25 },
  imageWrapper: { 
    width: '100%', 
    height: 180, 
    backgroundColor: '#F8FAFC', 
    borderRadius: 15, 
    borderWidth: 1,
    borderColor: '#E2E8F0',
    overflow: 'hidden',
    marginBottom: 20
  },
  bannerImage: { width: '100%', height: '100%', resizeMode: 'cover' },
  placeholderImage: { flex: 1, justifyContent: 'center', alignItems: 'center' },
  detailsBody: { paddingTop: 5 },
  organizerText: { fontSize: 10, fontWeight: '700', color: '#1F4FA3', marginBottom: 4 },
  title: { fontSize: 22, fontWeight: '800', color: '#222222', marginBottom: 12 },
  infoContainer: { flexDirection: 'row', flexWrap: 'wrap', gap: 15, marginBottom: 5 },
  infoItem: { flexDirection: 'row', alignItems: 'center', gap: 6 },
  infoValue: { fontSize: 13, fontWeight: '600', color: '#444' },
  divider: { height: 1, backgroundColor: '#E2E8F0', marginVertical: 20 },
  sectionTitle: { fontSize: 16, fontWeight: '700', color: '#222222', marginBottom: 8 },
  descriptionText: { fontSize: 13.5, color: '#444', lineHeight: 22 },
  bottomBar: { 
    position: 'absolute', 
    bottom: 0, 
    width: '100%', 
    backgroundColor: '#FFF', 
    borderTopWidth: 1, 
    borderTopColor: '#E2E8F0',
    paddingHorizontal: 25,
    paddingTop: 12,
  },
  applyButton: { 
    backgroundColor: '#1F4FA3', 
    height: 40, 
    borderRadius: 8, 
    flexDirection: 'row',
    justifyContent: 'center', 
    alignItems: 'center',
  },
  appliedButton: { backgroundColor: '#10B981' }, 
  applyButtonText: { color: '#FFF', fontSize: 14, fontWeight: '700' },
});