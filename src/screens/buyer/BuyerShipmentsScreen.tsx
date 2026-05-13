import React, { useState, useCallback } from 'react';
import {
  View,
  Text,
  FlatList,
  StyleSheet,
  ActivityIndicator,
} from 'react-native';
import { getShipments } from '../../api/shipments';
import { Shipment } from '../../types/models';
import { useFocusEffect } from '@react-navigation/native';

const BuyerShipmentsScreen: React.FC = () => {
  const [shipments, setShipments] = useState<Shipment[]>([]);
  const [loading, setLoading] = useState(true);

  const fetchShipments = useCallback(async () => {
    try {
      setLoading(true);
      // Buyers can see all shipments, no filter required
      const data = await getShipments();
      setShipments(data);
    } catch (error) {
      // handle
    } finally {
      setLoading(false);
    }
  }, []);

  useFocusEffect(
    useCallback(() => {
      fetchShipments();
    }, [fetchShipments])
  );

  const renderItem = ({ item }: { item: Shipment }) => (
    <View style={styles.card}>
      <Text style={styles.region}>{item.region}</Text>
      <Text>Status: {item.status.toUpperCase()}</Text>
      <Text>Crop: {item.crop}</Text>
      <Text>Target: {item.target_quantity_bags} bags</Text>
      {item.actual_quantity_bags != null && (
        <Text>Actual: {item.actual_quantity_bags} bags</Text>
      )}
      <Text style={styles.id}>ID: {item.id.substring(0, 8)}</Text>
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
      data={shipments}
      keyExtractor={(item) => item.id}
      renderItem={renderItem}
      contentContainerStyle={styles.list}
      ListEmptyComponent={<Text style={styles.empty}>No shipments available.</Text>}
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
  region: { fontSize: 18, fontWeight: 'bold', marginBottom: 4 },
  id: { color: '#888', marginTop: 4 },
  empty: { textAlign: 'center', marginTop: 40, fontSize: 16 },
});

export default BuyerShipmentsScreen;