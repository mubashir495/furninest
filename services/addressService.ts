import api, { getApiErrorMessage } from '@/lib/axios';
import { ShippingAddress, ShippingAddressInput } from '@/Type/address';

export const addressService = {
  async getAddresses(): Promise<ShippingAddress[]> {
    try {
      const { data } = await api.get('/shipping-addresses');
      return data.data ?? [];
    } catch (error) {
      throw new Error(getApiErrorMessage(error, 'Could not load your addresses.'));
    }
  },

  async getAddress(id: string): Promise<ShippingAddress> {
    const { data } = await api.get(`/shipping-addresses/${id}`);
    return data.data;
  },

  async createAddress(payload: ShippingAddressInput): Promise<ShippingAddress> {
    try {
      const { data } = await api.post('/shipping-addresses', payload);
      return data.data;
    } catch (error) {
      throw new Error(getApiErrorMessage(error, 'Could not save address.'));
    }
  },

  async updateAddress(id: string, payload: Partial<ShippingAddressInput>): Promise<ShippingAddress> {
    try {
      const { data } = await api.patch(`/shipping-addresses/${id}`, payload);
      return data.data;
    } catch (error) {
      throw new Error(getApiErrorMessage(error, 'Could not update address.'));
    }
  },

  async setDefault(id: string): Promise<ShippingAddress> {
    try {
      const { data } = await api.patch(`/shipping-addresses/${id}/set-default`);
      return data.data;
    } catch (error) {
      throw new Error(getApiErrorMessage(error, 'Could not set default address.'));
    }
  },

  async deleteAddress(id: string): Promise<void> {
    try {
      await api.delete(`/shipping-addresses/${id}`);
    } catch (error) {
      throw new Error(getApiErrorMessage(error, 'Could not delete address.'));
    }
  },
};
