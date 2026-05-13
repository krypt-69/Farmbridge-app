import React, { useState, useCallback } from 'react';
import {
  View,
  Text,
  FlatList,
  TouchableOpacity,
  StyleSheet,
  Alert,
  ActivityIndicator,
  Modal,
} from 'react-native';
import { Picker } from '@react-native-picker/picker';
import { getUsers, changeUserRole } from '../../api/admin';
import { User } from '../../types/models';
import { useFocusEffect } from '@react-navigation/native';

const ROLES = ['buyer', 'farmer', 'agent', 'admin'];

const ManageUsersScreen: React.FC = () => {
  const [users, setUsers] = useState<User[]>([]);
  const [loading, setLoading] = useState(true);
  const [selectedUser, setSelectedUser] = useState<User | null>(null);
  const [newRole, setNewRole] = useState<string>('');
  const [modalVisible, setModalVisible] = useState(false);
  const [updating, setUpdating] = useState(false);

  const fetchUsers = useCallback(async () => {
    try {
      setLoading(true);
      const data = await getUsers();
      setUsers(data);
    } catch (error) {
      Alert.alert('Error', 'Failed to load users.');
    } finally {
      setLoading(false);
    }
  }, []);

  useFocusEffect(useCallback(() => { fetchUsers(); }, [fetchUsers]));

  const openRoleModal = (user: User) => {
    setSelectedUser(user);
    setNewRole(user.role);
    setModalVisible(true);
  };

  const handleRoleUpdate = async () => {
    if (!selectedUser || !newRole || newRole === selectedUser.role) {
      setModalVisible(false);
      return;
    }
    setUpdating(true);
    try {
      await changeUserRole(selectedUser.id, newRole);
      Alert.alert('Success', `Role updated to ${newRole}.`);
      fetchUsers();
      setModalVisible(false);
    } catch (error: any) {
      Alert.alert('Error', error.response?.data?.detail || 'Failed to change role.');
    } finally {
      setUpdating(false);
    }
  };

  const renderItem = ({ item }: { item: User }) => (
    <TouchableOpacity style={styles.card} onPress={() => openRoleModal(item)}>
      <Text style={styles.name}>{item.full_name}</Text>
      <Text>Phone: {item.phone}</Text>
      <Text>Role: {item.role.toUpperCase()}</Text>
      <Text>Active: {item.is_active ? 'Yes' : 'No'}</Text>
      <Text style={styles.tapHint}>Tap to change role</Text>
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
    <View style={styles.container}>
      <FlatList
        data={users}
        keyExtractor={(item) => item.id}
        renderItem={renderItem}
        contentContainerStyle={styles.list}
        ListEmptyComponent={<Text style={styles.empty}>No users found.</Text>}
      />

      <Modal visible={modalVisible} transparent animationType="slide">
        <View style={styles.modalOverlay}>
          <View style={styles.modalContent}>
            <Text style={styles.modalTitle}>Change Role for {selectedUser?.full_name}</Text>
            <View style={styles.pickerContainer}>
              <Picker selectedValue={newRole} onValueChange={(v) => setNewRole(v)}>
                {ROLES.map((r) => (
                  <Picker.Item key={r} label={r.toUpperCase()} value={r} />
                ))}
              </Picker>
            </View>
            <View style={styles.modalButtons}>
              <TouchableOpacity
                style={[styles.modalButton, styles.cancelButton]}
                onPress={() => setModalVisible(false)}
              >
                <Text style={styles.buttonText}>Cancel</Text>
              </TouchableOpacity>
              <TouchableOpacity
                style={[styles.modalButton, styles.confirmButton]}
                onPress={handleRoleUpdate}
                disabled={updating}
              >
                {updating ? (
                  <ActivityIndicator color="#fff" />
                ) : (
                  <Text style={styles.buttonText}>Update</Text>
                )}
              </TouchableOpacity>
            </View>
          </View>
        </View>
      </Modal>
    </View>
  );
};

const styles = StyleSheet.create({
  centered: { flex: 1, justifyContent: 'center', alignItems: 'center' },
  container: { flex: 1 },
  list: { padding: 16 },
  card: {
    backgroundColor: '#fff',
    padding: 16,
    borderRadius: 8,
    marginBottom: 12,
    elevation: 2,
  },
  name: { fontSize: 16, fontWeight: 'bold' },
  tapHint: { color: '#2E8B57', marginTop: 8 },
  empty: { textAlign: 'center', marginTop: 40 },
  modalOverlay: {
    flex: 1,
    backgroundColor: 'rgba(0,0,0,0.5)',
    justifyContent: 'center',
    alignItems: 'center',
  },
  modalContent: {
    backgroundColor: '#fff',
    borderRadius: 12,
    padding: 24,
    width: '80%',
  },
  modalTitle: { fontSize: 18, fontWeight: 'bold', marginBottom: 16 },
  pickerContainer: {
    backgroundColor: '#f0f0f0',
    borderRadius: 8,
    marginBottom: 16,
  },
  modalButtons: { flexDirection: 'row', justifyContent: 'space-between' },
  modalButton: { padding: 12, borderRadius: 8, flex: 1, marginHorizontal: 4, alignItems: 'center' },
  cancelButton: { backgroundColor: '#aaa' },
  confirmButton: { backgroundColor: '#2E8B57' },
  buttonText: { color: '#fff', fontWeight: '600' },
});

export default ManageUsersScreen;