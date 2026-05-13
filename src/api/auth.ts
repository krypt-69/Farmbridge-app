import apiClient from './client';
import { User } from '../types/models';

export const getCurrentUser = async (): Promise<User> => {
  const response = await apiClient.get('/auth/me');
  return response.data;
};