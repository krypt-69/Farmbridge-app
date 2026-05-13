import React from 'react';
import { View, Text, StyleSheet } from 'react-native';
import { useAuth } from '../../contexts/AuthContext';

const FarmerProfileScreen: React.FC = () => {
  const { user } = useAuth();

  if (!user) return null;

  return (
    <View style={styles.container}>
      <Text style={styles.heading}>My Profile</Text>
      <View style={styles.card}>
        <InfoRow label="Full Name" value={user.full_name} />
        <InfoRow label="Phone" value={user.phone} />
        <InfoRow label="Role" value={user.role.toUpperCase()} />
        <InfoRow label="Status" value={user.is_active ? 'Active' : 'Inactive'} />
      </View>
    </View>
  );
};

const InfoRow: React.FC<{ label: string; value: string }> = ({ label, value }) => (
  <View style={styles.row}>
    <Text style={styles.label}>{label}:</Text>
    <Text style={styles.value}>{value}</Text>
  </View>
);

const styles = StyleSheet.create({
  container: { flex: 1, padding: 20, backgroundColor: '#f5f5f5' },
  heading: { fontSize: 24, fontWeight: 'bold', marginBottom: 20, textAlign: 'center', color: '#2E8B57' },
  card: { backgroundColor: '#fff', padding: 20, borderRadius: 12, elevation: 2 },
  row: { flexDirection: 'row', marginBottom: 12 },
  label: { fontWeight: '600', width: 100 },
  value: { flex: 1 },
});

export default FarmerProfileScreen;