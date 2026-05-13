import apiClient from './client';
import { User, Shipment, AuditLog, Wallet } from '../types/models';

// --- User Management ---
export const getUsers = async (role?: string): Promise<User[]> => {
  const params = role ? { role } : {};
  const response = await apiClient.get('/admin/users', { params });
  return response.data;
};

export const changeUserRole = async (userId: string, newRole: string): Promise<User> => {
  const response = await apiClient.put(`/admin/users/${userId}/role`, null, {
    params: { new_role: newRole },
  });
  return response.data;
};

// --- Shipment Control ---
export const triggerShipmentState = async (
  shipmentId: string,
  action: string,
  failureCategory?: string,
  override?: boolean
): Promise<Shipment> => {
  const params: any = { action };
  if (failureCategory) params.failure_category = failureCategory;
  if (override) params.override = override;
  const response = await apiClient.post(`/shipments/${shipmentId}/state`, null, { params });
  return response.data;
};

// --- Deposit Funds ---
export const depositFunds = async (
  userId: string,
  amountCents: number,
  description?: string
): Promise<Wallet> => {
  const params: any = { user_id: userId, amount_cents: amountCents };
  if (description) params.description = description;
  const response = await apiClient.post('/wallet/admin/deposit', null, { params });
  return response.data;
};

// --- Audit Logs ---
export const getAuditLogs = async (
  entityType?: string,
  limit = 50,
  offset = 0
): Promise<AuditLog[]> => {
  const params: any = { limit, offset };
  if (entityType) params.entity_type = entityType;
  const response = await apiClient.get('/admin/audit', { params });
  return response.data;
};