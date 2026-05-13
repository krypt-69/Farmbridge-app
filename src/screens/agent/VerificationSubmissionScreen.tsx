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
  Image,
} from 'react-native';
import { Picker } from '@react-native-picker/picker';
import * as ImagePicker from 'expo-image-picker';
import * as Location from 'expo-location';
import { getStorage, ref, uploadBytesResumable, getDownloadURL } from 'firebase/storage';
import * as Crypto from 'expo-crypto';
import { getFarmers } from '../../api/agents';
import { submitVerification } from '../../api/verifications';
import { Farmer } from '../../types/models';
import { useRoute, useNavigation } from '@react-navigation/native';

const VerificationSubmissionScreen: React.FC = () => {
  const route = useRoute<any>();
  const navigation = useNavigation<any>();
  const shipmentId: string = route.params?.shipmentId || '';

  const [farmers, setFarmers] = useState<Farmer[]>([]);
  const [selectedFarmerId, setSelectedFarmerId] = useState<string>('');
  const [claimedQty, setClaimedQty] = useState('');
  const [actualQty, setActualQty] = useState('');
  const [status, setStatus] = useState<'pending' | 'approved' | 'adjusted' | 'rejected'>('approved');
  const [qualityNotes, setQualityNotes] = useState('');
  const [images, setImages] = useState<string[]>([]);
  const [uploadedUrls, setUploadedUrls] = useState<string[]>([]);
  const [gps, setGps] = useState<{ latitude: number; longitude: number } | null>(null);
  const [loading, setLoading] = useState(false);
  const [operationId] = useState(Crypto.randomUUID());

  useEffect(() => {
    (async () => {
      const { status } = await Location.requestForegroundPermissionsAsync();
      if (status !== 'granted') {
        Alert.alert('Permission', 'Location permission is required for GPS tag.');
        return;
      }
      const loc = await Location.getCurrentPositionAsync({});
      setGps({ latitude: loc.coords.latitude, longitude: loc.coords.longitude });
    })();

    getFarmers().then(setFarmers).catch(() => Alert.alert('Error', 'Failed to load farmers.'));
  }, []);

  // Photo selection and upload
  const pickImage = async () => {
    const result = await ImagePicker.launchCameraAsync({
      mediaTypes: ImagePicker.MediaTypeOptions.Images,
      quality: 0.8,
    });
    if (!result.canceled && result.assets) {
      setImages((prev) => [...prev, result.assets[0].uri]);
    }
  };

  const uploadImages = async (): Promise<string[]> => {
    const urls: string[] = [];
    for (const uri of images) {
      const response = await fetch(uri);
      const blob = await response.blob();
      const storage = getStorage();
      const fileName = `verifications/${shipmentId}/${Crypto.randomUUID()}.jpg`;
      const storageRef = ref(storage, fileName);
      await uploadBytesResumable(storageRef, blob);
      const downloadUrl = await getDownloadURL(storageRef);
      urls.push(downloadUrl);
    }
    return urls;
  };

  const handleSubmit = async () => {
    if (!selectedFarmerId) {
      Alert.alert('Validation', 'Please select a farmer.');
      return;
    }
    const qty = parseInt(claimedQty, 10);
    if (!qty || qty < 1) {
      Alert.alert('Validation', 'Enter valid claimed quantity.');
      return;
    }
    if (!gps) {
      Alert.alert('GPS', 'GPS location not available.');
      return;
    }

    setLoading(true);
    try {
      const urls = await uploadImages();
      setUploadedUrls(urls);

      const actual = actualQty ? parseInt(actualQty, 10) : undefined;

      const report = await submitVerification({
        shipment_id: shipmentId,
        farmer_id: selectedFarmerId,
        operation_id: operationId,
        claimed_quantity_bags: qty,
        actual_quantity_bags: actual,
        status: status,
        quality_notes: qualityNotes,
        image_urls: urls,
        gps_latitude: gps.latitude,
        gps_longitude: gps.longitude,
      });

      Alert.alert('Success', `Report submitted (${report.status}). ID: ${report.id}`);
      navigation.goBack();
    } catch (error: any) {
      if (error.response?.status === 409) {
        Alert.alert('Info', 'Duplicate report. The previous report is already recorded.');
      } else {
        Alert.alert('Error', error.response?.data?.detail || 'Submission failed.');
      }
    } finally {
      setLoading(false);
    }
  };

  return (
    <ScrollView contentContainerStyle={styles.container}>
      <Text style={styles.heading}>Verify Farmer for Shipment</Text>

      <Text style={styles.label}>Select Farmer</Text>
      <View style={styles.pickerContainer}>
        <Picker
          selectedValue={selectedFarmerId}
          onValueChange={(itemValue: string) => setSelectedFarmerId(itemValue)}
        >
          <Picker.Item label="-- Choose Farmer --" value="" />
          {farmers.map((f) => (
            <Picker.Item key={f.id} label={`${f.full_name} (${f.phone})`} value={f.id} />
          ))}
        </Picker>
      </View>

      <Text style={styles.label}>Claimed Quantity (bags)*</Text>
      <TextInput style={styles.input} value={claimedQty} onChangeText={setClaimedQty} keyboardType="numeric" />

      <Text style={styles.label}>Actual Quantity (bags, leave empty if same)</Text>
      <TextInput style={styles.input} value={actualQty} onChangeText={setActualQty} keyboardType="numeric" />

      <Text style={styles.label}>Status</Text>
      <View style={styles.pickerContainer}>
        <Picker selectedValue={status} onValueChange={(itemValue: any) => setStatus(itemValue)}>
          <Picker.Item label="Approved" value="approved" />
          <Picker.Item label="Adjusted" value="adjusted" />
          <Picker.Item label="Rejected" value="rejected" />
          <Picker.Item label="Pending" value="pending" />
        </Picker>
      </View>

      <Text style={styles.label}>Quality Notes</Text>
      <TextInput
        style={[styles.input, { height: 80 }]}
        value={qualityNotes}
        onChangeText={setQualityNotes}
        multiline
      />

      <Text style={styles.label}>Photos</Text>
      <View style={styles.photoRow}>
        {images.map((uri, idx) => (
          <Image key={idx} source={{ uri }} style={styles.thumbnail} />
        ))}
      </View>
      <TouchableOpacity style={styles.cameraButton} onPress={pickImage}>
        <Text style={styles.buttonText}>Take Photo</Text>
      </TouchableOpacity>

      {gps && (
        <Text style={styles.gpsText}>
          GPS: {gps.latitude.toFixed(4)}, {gps.longitude.toFixed(4)}
        </Text>
      )}

      <TouchableOpacity
        style={[styles.submitButton, loading && styles.buttonDisabled]}
        onPress={handleSubmit}
        disabled={loading}
      >
        {loading ? (
          <ActivityIndicator color="#fff" />
        ) : (
          <Text style={styles.buttonText}>Submit Verification</Text>
        )}
      </TouchableOpacity>
    </ScrollView>
  );
};

const styles = StyleSheet.create({
  container: { padding: 20 },
  heading: { fontSize: 20, fontWeight: 'bold', marginBottom: 20, textAlign: 'center', color: '#2E8B57' },
  label: { fontWeight: '600', marginBottom: 4, marginTop: 12 },
  input: {
    backgroundColor: '#fff',
    padding: 12,
    borderRadius: 8,
    borderColor: '#ddd',
    borderWidth: 1,
    fontSize: 16,
  },
  pickerContainer: {
    backgroundColor: '#fff',
    borderRadius: 8,
    borderColor: '#ddd',
    borderWidth: 1,
    marginBottom: 8,
  },
  photoRow: { flexDirection: 'row', flexWrap: 'wrap', marginBottom: 10 },
  thumbnail: { width: 80, height: 80, marginRight: 8, borderRadius: 8 },
  cameraButton: {
    backgroundColor: '#4682B4',
    padding: 12,
    borderRadius: 8,
    alignItems: 'center',
    marginVertical: 8,
  },
  submitButton: {
    backgroundColor: '#2E8B57',
    padding: 16,
    borderRadius: 8,
    alignItems: 'center',
    marginTop: 20,
  },
  buttonDisabled: { opacity: 0.7 },
  buttonText: { color: '#fff', fontWeight: '600', fontSize: 16 },
  gpsText: { marginTop: 8, color: '#555' },
});

export default VerificationSubmissionScreen;