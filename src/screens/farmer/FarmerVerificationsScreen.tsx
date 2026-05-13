import React, { useState, useCallback } from 'react';
import {
  View,
  Text,
  FlatList,
  StyleSheet,
  ActivityIndicator,
  Image,
  RefreshControl,
} from 'react-native';
import { getFarmerVerifications } from '../../api/farmer';
import { VerificationReport } from '../../types/models';
import { useFocusEffect } from '@react-navigation/native';

const FarmerVerificationsScreen: React.FC = () => {
  const [reports, setReports] = useState<VerificationReport[]>([]);
  const [loading, setLoading] = useState(true);
  const [refreshing, setRefreshing] = useState(false);

  const fetchReports = useCallback(async (isRefresh = false) => {
    try {
      if (!isRefresh) setLoading(true);
      else setRefreshing(true);
      const data = await getFarmerVerifications();
      setReports(data);
    } catch (error) {
      // silent
    } finally {
      setLoading(false);
      setRefreshing(false);
    }
  }, []);

  useFocusEffect(useCallback(() => { fetchReports(); }, [fetchReports]));

  const renderItem = ({ item }: { item: VerificationReport }) => (
    <View style={styles.card}>
      <Text style={styles.status}>Status: {item.status.toUpperCase()}</Text>
      <Text>Agent ID: {item.agent_id.substring(0, 8)}</Text>
      <Text>Shipment: {item.shipment_id.substring(0, 8)}</Text>
      <Text>Claimed: {item.claimed_quantity_bags} bags</Text>
      {item.actual_quantity_bags != null && <Text>Actual: {item.actual_quantity_bags} bags</Text>}
      {item.quality_notes ? <Text>Notes: {item.quality_notes}</Text> : null}
      {item.gps_latitude != null && (
        <Text style={styles.gps}>
          GPS: {item.gps_latitude.toFixed(4)}, {item.gps_longitude.toFixed(4)}
        </Text>
      )}
      {item.image_urls && item.image_urls.length > 0 && (
        <View style={styles.photoRow}>
          {item.image_urls.map((url, idx) => (
            <Image key={idx} source={{ uri: url }} style={styles.thumbnail} />
          ))}
        </View>
      )}
    </View>
  );

  if (loading) {
    return (
      <View style={styles.centered}>
        <ActivityIndicator size="large" color="#2E8B57" />
      </View>
    );
  }

  return (
    <FlatList
      data={reports}
      keyExtractor={(item) => item.id}
      renderItem={renderItem}
      contentContainerStyle={styles.list}
      ListEmptyComponent={<Text style={styles.empty}>No verification reports yet.</Text>}
      refreshControl={
        <RefreshControl refreshing={refreshing} onRefresh={() => fetchReports(true)} />
      }
    />
  );
};

const styles = StyleSheet.create({
  centered: { flex: 1, justifyContent: 'center', alignItems: 'center' },
  list: { padding: 16 },
  card: {
    backgroundColor: '#fff',
    padding: 16,
    borderRadius: 8,
    marginBottom: 12,
    elevation: 2,
  },
  status: { fontWeight: 'bold', fontSize: 16, marginBottom: 6 },
  gps: { color: '#555', fontSize: 12, marginTop: 4 },
  photoRow: { flexDirection: 'row', marginTop: 8 },
  thumbnail: { width: 60, height: 60, borderRadius: 6, marginRight: 6 },
  empty: { textAlign: 'center', marginTop: 40, fontSize: 16 },
});

export default FarmerVerificationsScreen;