import apiClient from './client';
import { Shipment } from '../types/models';

// List shipments, optional status filter
export const getShipments = async (status?: string): Promise<Shipment[]> => {
  const params = status ? { status } : {};
  const response = await apiClient.get('/shipments/', { params });
  return response.data;
};

// Get one shipment by ID
export const getShipmentById = async (shipmentId: string): Promise<Shipment> => {
  const response = await apiClient.get(`/shipments/${shipmentId}`);
  return response.data;
};

// Admin-only functions (state transition) will be added later in admin module