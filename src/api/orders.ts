import apiClient from './client';
import { Order } from '../types/models';

// Place a new order (buyer or admin)
export const placeOrder = async (data: {
  quantity_bags: number;
  delivery_location: string;
  crop?: string;
}): Promise<Order> => {
  const response = await apiClient.post('/orders/', data);
  return response.data;
};

// Get orders for the current user (buyer)
export const getMyOrders = async (): Promise<Order[]> => {
  const response = await apiClient.get('/orders/');
  return response.data;
};

// Get all orders (admin only) – we'll include it, but it won't be used by buyer screens
export const getAllOrders = async (): Promise<Order[]> => {
  const response = await apiClient.get('/orders/all');
  return response.data;
};

// Cancel an order
export const cancelOrder = async (orderId: string): Promise<{ message: string }> => {
  const response = await apiClient.post(`/orders/${orderId}/cancel`);
  return response.data;
};