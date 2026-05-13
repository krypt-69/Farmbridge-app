import React, { useState, useCallback } from 'react';
import {
  View,
  Text,
  FlatList,
  StyleSheet,
  ActivityIndicator,
  Alert,
} from 'react-native';
import { getVerifications } from '../../api/verifications';
import { VerificationReport } from '../../types/models';
import { useFocusEffect } from '@react-navigation/native';

const VerificationHistoryScreen: React.FC = () => {
  const [reports, setReports] = useState<VerificationReport[]>([]);
  const [loading, setLoading] = useState(true);

  const fetch = useCallback(async () => {
    try {
      setLoading(true);
      // Fetch all verifications (no shipment_id filter, so it returns agent's own reports? 
      // The backend should return only reports submitted by the current agent – as per spec the /verifications/ endpoint likely filters by agent. 
      // If not, we can rely on the agent_id being the current user. But the spec says "list verification reports" for agent – it will be filtered.
      const data = await getVerifications();
      setReports(data);
    } catch (error) {
      Alert.alert('Error', 'Failed to load history.');
    } finally {
      setLoading(false);
    }
  }, []);

  useFocusEffect(useCallback(() => { fetch(); }, [fetch]));

  const renderItem = ({ item }: { item: VerificationReport }) => (
  <View style={styles.card}>
    <Text style={styles.operation}>Op ID: {item.operation_id.substring(0, 8)}</Text>
    <Text>Shipment: {item.shipment_id.substring(0, 8)}</Text>
    <Text>Farmer: {item.farmer_id.substring(0, 8)}</Text>
    <Text>Status: {item.status.toUpperCase()}</Text>
    <Text>Claimed: {item.claimed_quantity_bags} bags</Text>
    {item.actual_quantity_bags != null && <Text>Actual: {item.actual_quantity_bags} bags</Text>}
    <Text>Images: {item.image_urls?.length ?? 0} uploaded</Text>
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
      ListEmptyComponent={<Text style={styles.empty}>No verifications submitted yet.</Text>}
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
  operation: { fontWeight: 'bold', marginBottom: 4 },
  empty: { textAlign: 'center', marginTop: 40, fontSize: 16 },
});

export default VerificationHistoryScreen;