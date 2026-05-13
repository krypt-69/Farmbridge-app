import apiClient from './client';
import { Wallet, LedgerEntry } from '../types/models';

// Get wallet balance
export const getWallet = async (): Promise<Wallet> => {
  const response = await apiClient.get('/wallet/');
  return response.data;
};

// Get ledger entries
export const getLedger = async (limit = 20, offset = 0): Promise<LedgerEntry[]> => {
  const response = await apiClient.get('/wallet/ledger', {
    params: { limit, offset },
  });
  return response.data;
};