import apiClient from './client';
import { Farmer } from '../types/models';

// GET /api/v1/agents/farmers (Agent or Admin)
export const getFarmers = async (): Promise<Farmer[]> => {
  const response = await apiClient.get('/agents/farmers');
  return response.data;
};