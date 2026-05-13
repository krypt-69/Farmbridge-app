import React, { useState, useEffect } from 'react';
import {
  View,
  Text,
  TextInput,
  TouchableOpacity,
  StyleSheet,
  Alert,
  ActivityIndicator,
  ScrollView,
} from 'react-native';
import { Picker } from '@react-native-picker/picker';
import { getUsers, depositFunds } from '../../api/admin';
import { User } from '../../types/models';

const DepositFundsScreen: React.FC = () => {
  const [users, setUsers] = useState<User[]>([]);
  const [selectedUserId, setSelectedUserId] = useState('');
  const [amountCents, setAmountCents] = useState('');
  const [description, setDescription] = useState('');
  const [loadingUsers, setLoadingUsers] = useState(true);
  const [submitting, setSubmitting] = useState(false);

  useEffect(() => {
    getUsers()
      .then(setUsers)
      .catch(() => Alert.alert('Error', 'Failed to load users.'))
      .finally(() => setLoadingUsers(false));
  }, []);

  const handleDeposit = async () => {
    if (!selectedUserId) {
      Alert.alert('Validation', 'Select a user.');
      return;
    }
    const amount = parseInt(amountCents, 10);
    if (!amount || amount <= 0) {
      Alert.alert('Validation', 'Enter a valid amount (cents).');
      return;
    }
    setSubmitting(true);
    try {
      const wallet = await depositFunds(selectedUserId, amount, description);
      Alert.alert('Success', `Deposited. New balance: ${wallet.available_balance_cents} cents`);
      setAmountCents('');
      setDescription('');
    } catch (error: any) {
      Alert.alert('Error', error.response?.data?.detail || 'Deposit failed.');
    } finally {
      setSubmitting(false);
    }
  };

  if (loadingUsers) {
    return (
      <View style={styles.centered}>
        <ActivityIndicator size="large" color="#2E8B57" />
      </View>
    );
  }

  return (
    <ScrollView contentContainerStyle={styles.container}>
      <Text style={styles.heading}>Deposit Funds</Text>

      <Text style={styles.label}>Select User</Text>
      <View style={styles.pickerContainer}>
        <Picker
          selectedValue={selectedUserId}
          onValueChange={(itemValue: string) => setSelectedUserId(itemValue)}
        >
          <Picker.Item label="-- Choose User --" value="" />
          {users.map((u) => (
            <Picker.Item key={u.id} label={`${u.full_name} (${u.phone})`} value={u.id} />
          ))}
        </Picker>
      </View>

      <Text style={styles.label}>Amount (cents)*</Text>
      <TextInput
        style={styles.input}
        value={amountCents}
        onChangeText={setAmountCents}
        keyboardType="numeric"
        placeholder="e.g. 500000 for KES 5,000"
      />

      <Text style={styles.label}>Description (optional)</Text>
      <TextInput
        style={styles.input}
        value={description}
        onChangeText={setDescription}
      />

      <TouchableOpacity
        style={[styles.button, submitting && styles.buttonDisabled]}
        onPress={handleDeposit}
        disabled={submitting}
      >
        {submitting ? (
          <ActivityIndicator color="#fff" />
        ) : (
          <Text style={styles.buttonText}>Deposit</Text>
        )}
      </TouchableOpacity>
    </ScrollView>
  );
};

const styles = StyleSheet.create({
  centered: { flex: 1, justifyContent: 'center', alignItems: 'center' },
  container: { padding: 20 },
  heading: { fontSize: 24, fontWeight: 'bold', textAlign: 'center', marginBottom: 20, color: '#2E8B57' },
  label: { fontWeight: '600', marginTop: 12, marginBottom: 4 },
  pickerContainer: {
    backgroundColor: '#fff',
    borderRadius: 8,
    borderColor: '#ddd',
    borderWidth: 1,
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
  button: {
    backgroundColor: '#2E8B57',
    padding: 16,
    borderRadius: 8,
    alignItems: 'center',
    marginTop: 24,
  },
  buttonDisabled: { opacity: 0.7 },
  buttonText: { color: '#fff', fontWeight: '600', fontSize: 16 },
});

export default DepositFundsScreen;