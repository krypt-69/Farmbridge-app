import React, { useState, useCallback } from 'react';
import {
  View,
  Text,
  FlatList,
  TouchableOpacity,
  StyleSheet,
  ActivityIndicator,
  Alert,
} from 'react-native';
import { getShipments } from '../../api/shipments';
import { Shipment } from '../../types/models';
import { useFocusEffect } from '@react-navigation/native';

const AssignedShipmentsScreen: React.FC<{ navigation: any }> = ({ navigation }) => {
  const [shipments, setShipments] = useState<Shipment[]>([]);
  const [loading, setLoading] = useState(true);

  const fetch = useCallback(async () => {
    try {
      setLoading(true);
      // Only shipments in VERIFYING status
      const data = await getShipments('verifying');
      setShipments(data);
    } catch (error) {
      Alert.alert('Error', 'Failed to load shipments.');
    } finally {
      setLoading(false);
    }
  }, []);

  useFocusEffect(useCallback(() => { fetch(); }, [fetch]));

  const renderItem = ({ item }: { item: Shipment }) => (
    <TouchableOpacity
      style={styles.card}
      onPress={() => navigation.navigate('Verify', { shipmentId: item.id })}
    >
      <Text style={styles.region}>{item.region}</Text>
      <Text>Status: {item.status.toUpperCase()}</Text>
      <Text>Crop: {item.crop}</Text>
      <Text>Target: {item.target_quantity_bags} bags</Text>
      {item.actual_quantity_bags != null && (
        <Text>Actual: {item.actual_quantity_bags} bags</Text>
      )}
      <Text style={styles.tapHint}>Tap to verify farmers</Text>
    </TouchableOpacity>
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
      ListEmptyComponent={<Text style={styles.empty}>No shipments in verifying state.</Text>}
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
  tapHint: { color: '#2E8B57', marginTop: 8 },
  empty: { textAlign: 'center', marginTop: 40, fontSize: 16 },
});

export default AssignedShipmentsScreen;