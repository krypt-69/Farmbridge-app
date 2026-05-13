import React, { useState } from 'react';
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
import { placeOrder } from '../../api/orders';

const PlaceOrderScreen: React.FC = () => {
  const [quantity, setQuantity] = useState('');
  const [location, setLocation] = useState('');
  const [crop, setCrop] = useState('potatoes');
  const [loading, setLoading] = useState(false);

  const handleSubmit = async () => {
    const qty = parseInt(quantity, 10);
    if (!qty || qty < 1) {
      Alert.alert('Validation', 'Please enter a valid quantity (minimum 1 bag).');
      return;
    }
    if (!location.trim()) {
      Alert.alert('Validation', 'Please enter a delivery location.');
      return;
    }
    setLoading(true);
    try {
      const order = await placeOrder({
        quantity_bags: qty,
        delivery_location: location.trim(),
        crop: crop || 'potatoes',
      });
      Alert.alert('Success', `Order placed! ID: ${order.id}\nStatus: ${order.status}`);
      // Reset form
      setQuantity('');
      setLocation('');
      setCrop('potatoes');
    } catch (error: any) {
      const message = error.response?.data?.detail || error.message || 'Failed to place order.';
      Alert.alert('Error', message);
    } finally {
      setLoading(false);
    }
  };

  return (
    <ScrollView contentContainerStyle={styles.container}>
      <Text style={styles.title}>Place New Order</Text>

      <Text style={styles.label}>Quantity (bags)*</Text>
      <TextInput
        style={styles.input}
        value={quantity}
        onChangeText={setQuantity}
        keyboardType="numeric"
        placeholder="e.g. 5"
        editable={!loading}
      />

      <Text style={styles.label}>Delivery Location*</Text>
      <TextInput
        style={styles.input}
        value={location}
        onChangeText={setLocation}
        placeholder="e.g. Kiambu"
        autoCapitalize="words"
        editable={!loading}
      />

      <Text style={styles.label}>Crop (optional, default: potatoes)</Text>
      <TextInput
        style={styles.input}
        value={crop}
        onChangeText={setCrop}
        placeholder="potatoes"
        editable={!loading}
      />

      <TouchableOpacity
        style={[styles.button, loading && styles.buttonDisabled]}
        onPress={handleSubmit}
        disabled={loading}
      >
        {loading ? (
          <ActivityIndicator color="#fff" />
        ) : (
          <Text style={styles.buttonText}>Place Order</Text>
        )}
      </TouchableOpacity>
    </ScrollView>
  );
};

const styles = StyleSheet.create({
  container: {
    padding: 20,
  },
  title: {
    fontSize: 24,
    fontWeight: 'bold',
    marginBottom: 20,
    textAlign: 'center',
    color: '#2E8B57',
  },
  label: {
    fontSize: 16,
    marginBottom: 6,
    fontWeight: '500',
  },
  input: {
    backgroundColor: '#fff',
    padding: 12,
    borderRadius: 8,
    borderColor: '#ddd',
    borderWidth: 1,
    marginBottom: 16,
    fontSize: 16,
  },
  button: {
    backgroundColor: '#2E8B57',
    paddingVertical: 14,
    borderRadius: 8,
    alignItems: 'center',
    marginTop: 10,
  },
  buttonDisabled: {
    opacity: 0.7,
  },
  buttonText: {
    color: '#fff',
    fontSize: 18,
    fontWeight: '600',
  },
});

export default PlaceOrderScreen;