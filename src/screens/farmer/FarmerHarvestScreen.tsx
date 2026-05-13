import React, { useState, useCallback } from 'react';
import {
  View,
  Text,
  TextInput,
  TouchableOpacity,
  StyleSheet,
  Alert,
  ActivityIndicator,
  ScrollView,
  RefreshControl,
  FlatList,
  Platform,
} from 'react-native';
import DateTimePicker, { DateTimePickerEvent } from '@react-native-community/datetimepicker';
import { createHarvest, getMyHarvests } from '../../api/farmer';
import { Harvest } from '../../types/models';
import { useFocusEffect } from '@react-navigation/native';

const FarmerHarvestScreen: React.FC = () => {
  const [crop, setCrop] = useState('potatoes');
  const [quantity, setQuantity] = useState('');
  const [region, setRegion] = useState('');
  const [date, setDate] = useState<Date | null>(null);
  const [showDatePicker, setShowDatePicker] = useState(false);
  const [submitting, setSubmitting] = useState(false);
  const [harvests, setHarvests] = useState<Harvest[]>([]);
  const [loadingHarvests, setLoadingHarvests] = useState(true);
  const [refreshing, setRefreshing] = useState(false);

  const fetchHarvests = useCallback(async (isRefresh = false) => {
    try {
      if (!isRefresh) setLoadingHarvests(true);
      else setRefreshing(true);
      const data = await getMyHarvests();
      setHarvests(data);
    } catch (error) {
      Alert.alert('Error', 'Failed to load harvests.');
    } finally {
      setLoadingHarvests(false);
      setRefreshing(false);
    }
  }, []);

  useFocusEffect(useCallback(() => { fetchHarvests(); }, [fetchHarvests]));

  const handleSubmit = async () => {
    const qty = parseInt(quantity, 10);
    if (!qty || qty < 1) {
      Alert.alert('Validation', 'Enter valid quantity (bags).');
      return;
    }
    if (!region.trim()) {
      Alert.alert('Validation', 'Region is required.');
      return;
    }
    setSubmitting(true);
    try {
      const result = await createHarvest({
        crop: crop || 'potatoes',
        quantity_bags: qty,
        region: region.trim(),
        expected_harvest_date: date ? date.toISOString() : undefined,
      });
      Alert.alert('Success', `Harvest announced! ID: ${result.id}`);
      setQuantity('');
      setRegion('');
      setDate(null);
      fetchHarvests();
    } catch (error: any) {
      Alert.alert('Error', error.response?.data?.detail || 'Failed to announce harvest.');
    } finally {
      setSubmitting(false);
    }
  };

  const onDateChange = (event: DateTimePickerEvent, selectedDate?: Date) => {
    setShowDatePicker(Platform.OS === 'ios');
    if (selectedDate) {
      setDate(selectedDate);
    }
  };

  const renderHarvestItem = ({ item }: { item: Harvest }) => (
    <View style={styles.harvestCard}>
      <Text style={styles.harvestCrop}>{item.crop}</Text>
      <Text>Quantity: {item.quantity_bags} bags</Text>
      <Text>Region: {item.region}</Text>
      <Text>Status: {item.status.toUpperCase()}</Text>
      {item.expected_harvest_date && (
        <Text>Expected: {new Date(item.expected_harvest_date).toLocaleDateString()}</Text>
      )}
      <Text style={styles.harvestId}>ID: {item.id.substring(0, 8)}</Text>
    </View>
  );

  return (
    <ScrollView
      contentContainerStyle={styles.container}
      refreshControl={
        <RefreshControl refreshing={refreshing} onRefresh={() => fetchHarvests(true)} />
      }
    >
      <Text style={styles.heading}>Announce Harvest</Text>

      <Text style={styles.label}>Crop</Text>
      <TextInput
        style={styles.input}
        value={crop}
        onChangeText={setCrop}
        placeholder="e.g. potatoes"
      />

      <Text style={styles.label}>Quantity (bags)*</Text>
      <TextInput
        style={styles.input}
        value={quantity}
        onChangeText={setQuantity}
        keyboardType="numeric"
        placeholder="30"
      />

      <Text style={styles.label}>Region*</Text>
      <TextInput
        style={styles.input}
        value={region}
        onChangeText={setRegion}
        placeholder="Nyandarua"
      />

      <Text style={styles.label}>Expected Harvest Date (optional)</Text>
      <TouchableOpacity style={styles.dateButton} onPress={() => setShowDatePicker(true)}>
        <Text style={styles.dateText}>
          {date ? date.toLocaleDateString() : 'Select date'}
        </Text>
      </TouchableOpacity>
      {showDatePicker && (
        <DateTimePicker
          value={date || new Date()}
          mode="date"
          display="default"
          onChange={onDateChange}
          minimumDate={new Date()}
        />
      )}

      <TouchableOpacity
        style={[styles.submitBtn, submitting && styles.disabled]}
        onPress={handleSubmit}
        disabled={submitting}
      >
        {submitting ? (
          <ActivityIndicator color="#fff" />
        ) : (
          <Text style={styles.submitText}>Announce Harvest</Text>
        )}
      </TouchableOpacity>

      <Text style={styles.sectionTitle}>My Harvests</Text>
      {loadingHarvests ? (
        <ActivityIndicator size="large" color="#2E8B57" style={{ marginVertical: 20 }} />
      ) : (
        <FlatList
          data={harvests}
          keyExtractor={(item) => item.id}
          renderItem={renderHarvestItem}
          scrollEnabled={false}
          ListEmptyComponent={<Text style={styles.empty}>No harvests announced yet.</Text>}
        />
      )}
    </ScrollView>
  );
};

const styles = StyleSheet.create({
  container: { padding: 16, paddingBottom: 40 },
  heading: { fontSize: 24, fontWeight: 'bold', textAlign: 'center', marginBottom: 16, color: '#2E8B57' },
  label: { fontWeight: '600', marginTop: 12, marginBottom: 4 },
  input: {
    backgroundColor: '#fff',
    padding: 12,
    borderRadius: 8,
    borderColor: '#ddd',
    borderWidth: 1,
    fontSize: 16,
  },
  dateButton: {
    backgroundColor: '#fff',
    padding: 12,
    borderRadius: 8,
    borderColor: '#ddd',
    borderWidth: 1,
    marginTop: 4,
  },
  dateText: { fontSize: 16, color: '#333' },
  submitBtn: {
    backgroundColor: '#2E8B57',
    padding: 14,
    borderRadius: 8,
    alignItems: 'center',
    marginTop: 20,
  },
  disabled: { opacity: 0.7 },
  submitText: { color: '#fff', fontWeight: '600', fontSize: 16 },
  sectionTitle: { fontSize: 20, fontWeight: 'bold', marginTop: 28, marginBottom: 12, color: '#2E8B57' },
  harvestCard: {
    backgroundColor: '#fff',
    padding: 14,
    borderRadius: 8,
    marginBottom: 10,
    elevation: 1,
  },
  harvestCrop: { fontSize: 16, fontWeight: 'bold', textTransform: 'capitalize' },
  harvestId: { color: '#888', fontSize: 12, marginTop: 4 },
  empty: { textAlign: 'center', marginVertical: 20, color: '#666' },
});

export default FarmerHarvestScreen;