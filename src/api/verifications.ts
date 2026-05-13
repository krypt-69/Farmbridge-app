import apiClient from './client';
import { VerificationReport } from '../types/models';

// Submit a verification report
export const submitVerification = async (data: {
  shipment_id: string;
  farmer_id: string;
  operation_id: string;
  claimed_quantity_bags: number;
  actual_quantity_bags?: number;
  status: 'pending' | 'approved' | 'adjusted' | 'rejected';
  quality_notes?: string;
  image_urls?: string[];
  gps_latitude: number;
  gps_longitude: number;
}): Promise<VerificationReport> => {
  const response = await apiClient.post('/verifications/submit', data);
  return response.data;
};

// List verifications (optionally filtered by shipment_id)
export const getVerifications = async (shipmentId?: string): Promise<VerificationReport[]> => {
  const params = shipmentId ? { shipment_id: shipmentId } : {};
  const response = await apiClient.get('/verifications/', { params });
  return response.data;
};

// Get a single report
export const getVerificationById = async (reportId: string): Promise<VerificationReport> => {
  const response = await apiClient.get(`/verifications/${reportId}`);
  return response.data;
};