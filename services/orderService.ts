import api, { getApiErrorMessage } from '@/lib/axios';
import { Order, CreateOrderPayload } from '@/Type/order';

export const orderService = {
  async checkout(payload: CreateOrderPayload): Promise<Order> {
    try {
      const { data } = await api.post('/orders', payload);
      return data.data;
    } catch (error) {
      throw new Error(getApiErrorMessage(error, 'Could not place your order.'));
    }
  },

  async getMyOrders(): Promise<Order[]> {
    try {
      const { data } = await api.get('/orders/my-orders');
      return data.data ?? [];
    } catch (error) {
      throw new Error(getApiErrorMessage(error, 'Could not load your orders.'));
    }
  },

  async getOrder(id: string): Promise<Order> {
    try {
      const { data } = await api.get(`/orders/${id}`);
      return data.data;
    } catch (error) {
      throw new Error(getApiErrorMessage(error, 'Order not found.'));
    }
  },

  async cancelOrder(id: string): Promise<Order> {
    try {
      const { data } = await api.patch(`/orders/${id}/cancel`);
      return data.data;
    } catch (error) {
      throw new Error(getApiErrorMessage(error, 'Could not cancel this order.'));
    }
  },
};
