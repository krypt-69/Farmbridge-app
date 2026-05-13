import React, { useState, useCallback } from 'react';
import {
  View,
  Text,
  FlatList,
  StyleSheet,
  ActivityIndicator,
} from 'react-native';
import { getAuditLogs } from '../../api/admin';
import { AuditLog } from '../../types/models';
import { useFocusEffect } from '@react-navigation/native';

const AuditLogsScreen: React.FC = () => {
  const [logs, setLogs] = useState<AuditLog[]>([]);
  const [loading, setLoading] = useState(true);

  const fetchLogs = useCallback(async () => {
    try {
      setLoading(true);
      const data = await getAuditLogs();
      setLogs(data);
    } catch (error) {
      // silent
    } finally {
      setLoading(false);
    }
  }, []);

  useFocusEffect(useCallback(() => { fetchLogs(); }, [fetchLogs]));

  const renderItem = ({ item }: { item: AuditLog }) => (
    <View style={styles.card}>
      <Text style={styles.action}>{item.action}</Text>
      <Text>Entity: {item.entity_type} ({item.entity_id.substring(0, 8)})</Text>
      <Text>{item.details}</Text>
      <Text style={styles.timestamp}>{new Date(item.created_at).toLocaleString()}</Text>
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
      data={logs}
      keyExtractor={(item) => item.id}
      renderItem={renderItem}
      contentContainerStyle={styles.list}
      ListEmptyComponent={<Text style={styles.empty}>No audit logs.</Text>}
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
  action: { fontWeight: 'bold', fontSize: 16, textTransform: 'capitalize' },
  timestamp: { color: '#888', marginTop: 4 },
  empty: { textAlign: 'center', marginTop: 40 },
});

export default AuditLogsScreen;