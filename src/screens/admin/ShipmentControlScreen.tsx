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
  TextInput,
} from 'react-native';
import { Picker } from '@react-native-picker/picker';
import { getShipments } from '../../api/shipments';
import { triggerShipmentState } from '../../api/admin';
import { Shipment } from '../../types/models';
import { useFocusEffect } from '@react-navigation/native';

const STATE_ACTIONS = [
  'lock',
  'start_verification',
  'start_loading',
  'depart',
  'arrive_urban',
  'deliver',
  'fail',
];

const ShipmentControlScreen: React.FC = () => {
  const [shipments, setShipments] = useState<Shipment[]>([]);
  const [loading, setLoading] = useState(true);
  const [selectedShipment, setSelectedShipment] = useState<Shipment | null>(null);
  const [action, setAction] = useState<string>('lock');
  const [override, setOverride] = useState(false);
  const [failureCategory, setFailureCategory] = useState('');
  const [modalVisible, setModalVisible] = useState(false);
  const [submitting, setSubmitting] = useState(false);

  const fetchShipments = useCallback(async () => {
    try {
      setLoading(true);
      const data = await getShipments();
      setShipments(data);
    } catch (error) {
      Alert.alert('Error', 'Failed to load shipments.');
    } finally {
      setLoading(false);
    }
  }, []);

  useFocusEffect(useCallback(() => { fetchShipments(); }, [fetchShipments]));

  const openModal = (shipment: Shipment) => {
    setSelectedShipment(shipment);
    setAction('lock');
    setOverride(false);
    setFailureCategory('');
    setModalVisible(true);
  };

  const handleStateChange = async () => {
    if (!selectedShipment) return;
    setSubmitting(true);
    try {
      const result = await triggerShipmentState(
        selectedShipment.id,
        action,
        action === 'fail' ? failureCategory : undefined,
        override
      );
      Alert.alert('Success', `Shipment is now ${result.status}`);
      fetchShipments();
      setModalVisible(false);
    } catch (error: any) {
      Alert.alert('Error', error.response?.data?.detail || 'State change failed.');
    } finally {
      setSubmitting(false);
    }
  };

  const renderItem = ({ item }: { item: Shipment }) => (
    <TouchableOpacity style={styles.card} onPress={() => openModal(item)}>
      <Text style={styles.region}>{item.region}</Text>
      <Text>Status: {item.status.toUpperCase()}</Text>
      <Text>Crop: {item.crop}</Text>
      <Text>Target: {item.target_quantity_bags} bags</Text>
      {item.actual_quantity_bags != null && <Text>Actual: {item.actual_quantity_bags} bags</Text>}
      <Text style={styles.id}>ID: {item.id.substring(0, 8)}</Text>
      <Text style={styles.tapHint}>Tap to change state</Text>
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
        data={shipments}
        keyExtractor={(item) => item.id}
        renderItem={renderItem}
        contentContainerStyle={styles.list}
        ListEmptyComponent={<Text style={styles.empty}>No shipments found.</Text>}
      />

      <Modal visible={modalVisible} transparent animationType="slide">
        <View style={styles.modalOverlay}>
          <View style={styles.modalContent}>
            <Text style={styles.modalTitle}>
              Shipment: {selectedShipment?.id.substring(0, 8)}
            </Text>
            <Text style={styles.currentStatus}>
              Current: {selectedShipment?.status.toUpperCase()}
            </Text>

            <Text style={styles.label}>Action</Text>
            <View style={styles.pickerContainer}>
              <Picker selectedValue={action} onValueChange={(v) => setAction(v)}>
                {STATE_ACTIONS.map((a) => (
                  <Picker.Item key={a} label={a.replace('_', ' ').toUpperCase()} value={a} />
                ))}
              </Picker>
            </View>

            {action === 'fail' && (
              <>
                <Text style={styles.label}>Failure Category (required)</Text>
                <TextInput
                  style={styles.input}
                  value={failureCategory}
                  onChangeText={setFailureCategory}
                  placeholder="e.g. timeout, insufficient_supply"
                />
              </>
            )}

            <TouchableOpacity
              style={styles.checkboxRow}
              onPress={() => setOverride(!override)}
            >
              <Text style={styles.checkbox}>{override ? '☑' : '☐'} Override (force state)</Text>
            </TouchableOpacity>

            <View style={styles.modalButtons}>
              <TouchableOpacity
                style={[styles.modalButton, styles.cancelButton]}
                onPress={() => setModalVisible(false)}
              >
                <Text style={styles.buttonText}>Cancel</Text>
              </TouchableOpacity>
              <TouchableOpacity
                style={[styles.modalButton, styles.confirmButton]}
                onPress={handleStateChange}
                disabled={submitting}
              >
                {submitting ? (
                  <ActivityIndicator color="#fff" />
                ) : (
                  <Text style={styles.buttonText}>Execute</Text>
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
  region: { fontSize: 18, fontWeight: 'bold', marginBottom: 4 },
  id: { color: '#888', marginTop: 4 },
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
    width: '85%',
  },
  modalTitle: { fontSize: 18, fontWeight: 'bold', marginBottom: 8 },
  currentStatus: { marginBottom: 12 },
  label: { fontWeight: '600', marginTop: 8, marginBottom: 4 },
  pickerContainer: {
    backgroundColor: '#f0f0f0',
    borderRadius: 8,
    marginBottom: 8,
  },
  input: {
    backgroundColor: '#fff',
    padding: 12,
    borderRadius: 8,
    borderColor: '#ddd',
    borderWidth: 1,
    fontSize: 16,
  },
  checkboxRow: { paddingVertical: 12 },
  checkbox: { fontSize: 16 },
  modalButtons: { flexDirection: 'row', justifyContent: 'space-between', marginTop: 12 },
  modalButton: { padding: 12, borderRadius: 8, flex: 1, marginHorizontal: 4, alignItems: 'center' },
  cancelButton: { backgroundColor: '#aaa' },
  confirmButton: { backgroundColor: '#2E8B57' },
  buttonText: { color: '#fff', fontWeight: '600' },
});

export default ShipmentControlScreen;