import React, { useState, useCallback } from 'react';
import {
  View,
  Text,
  FlatList,
  TouchableOpacity,
  StyleSheet,
  Alert,
  ActivityIndicator,
  RefreshControl,
} from 'react-native';
import { getMyOrders, cancelOrder } from '../../api/orders';
import { Order } from '../../types/models';
import { useFocusEffect } from '@react-navigation/native';

const MyOrdersScreen: React.FC = () => {
  const [orders, setOrders] = useState<Order[]>([]);
  const [loading, setLoading] = useState(true);
  const [refreshing, setRefreshing] = useState(false);

  const fetchOrders = useCallback(async (isRefresh = false) => {
    try {
      if (!isRefresh) setLoading(true);
      else setRefreshing(true);
      const data = await getMyOrders();
      setOrders(data);
    } catch (error) {
      Alert.alert('Error', 'Failed to load orders.');
    } finally {
      setLoading(false);
      setRefreshing(false);
    }
  }, []);

  useFocusEffect(
    useCallback(() => {
      fetchOrders();
    }, [fetchOrders])
  );

  const handleCancel = async (orderId: string) => {
    Alert.alert('Cancel Order', 'Are you sure?', [
      { text: 'No', style: 'cancel' },
      {
        text: 'Yes',
        style: 'destructive',
        onPress: async () => {
          try {
            await cancelOrder(orderId);
            fetchOrders();
          } catch (error: any) {
            Alert.alert('Error', error.response?.data?.detail || 'Cancel failed.');
          }
        },
      },
    ]);
  };

  const renderItem = ({ item }: { item: Order }) => (
    <View style={styles.card}>
      <Text style={styles.orderId}>Order #{item.id.substring(0, 8)}</Text>
      <Text>Status: {item.status.toUpperCase()}</Text>
      <Text>Quantity: {item.quantity_bags} bags</Text>
      <Text>Location: {item.delivery_location}</Text>
      <Text>Crop: {item.crop}</Text>
      {item.price_per_bag ? <Text>Price/bag: {item.price_per_bag} cents</Text> : null}
      {(item.status === 'pending' || item.status === 'reserved') && (
        <TouchableOpacity
          style={styles.cancelButton}
          onPress={() => handleCancel(item.id)}
        >
          <Text style={styles.cancelText}>Cancel Order</Text>
        </TouchableOpacity>
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
      data={orders}
      keyExtractor={(item) => item.id}
      renderItem={renderItem}
      contentContainerStyle={styles.list}
      ListEmptyComponent={<Text style={styles.empty}>No orders found.</Text>}
      refreshControl={
        <RefreshControl refreshing={refreshing} onRefresh={() => fetchOrders(true)} />
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
  orderId: { fontWeight: 'bold', fontSize: 16, marginBottom: 4 },
  cancelButton: {
    marginTop: 10,
    backgroundColor: '#D32F2F',
    padding: 8,
    borderRadius: 6,
    alignItems: 'center',
  },
  cancelText: { color: '#fff', fontWeight: '600' },
  empty: { textAlign: 'center', marginTop: 40, fontSize: 16 },
});

export default MyOrdersScreen;