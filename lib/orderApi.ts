import api from './axios';
import { AdminOrder, Order, OrderStatus } from '@/Type/order';

export const getAllOrders = async (status?: OrderStatus): Promise<AdminOrder[]> => {
  const res = await api.get('/orders', { params: status ? { status } : undefined });
  return res.data.data ?? [];
};

export const getOrderById = async (id: string): Promise<Order> => {
  const res = await api.get(`/orders/${id}`);
  return res.data.data;
};

export const updateOrderStatus = async (id: string, status: OrderStatus): Promise<Order> => {
  const res = await api.patch(`/orders/${id}/status`, { status });
  return res.data.data;
};
