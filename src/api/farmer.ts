import apiClient from './client';
import { Harvest, VerificationReport } from '../types/models';

export const createHarvest = async (data: {
  crop: string;
  quantity_bags: number;
  region: string;
  expected_harvest_date?: string;
}): Promise<Harvest> => {
  const response = await apiClient.post('/farmers/harvest', data);
  return response.data;
};

export const getMyHarvests = async (): Promise<Harvest[]> => {
  const response = await apiClient.get('/farmers/harvests');
  return response.data;
};

export const getFarmerVerifications = async (): Promise<VerificationReport[]> => {
  const response = await apiClient.get('/farmers/verifications');
  return response.data;
};