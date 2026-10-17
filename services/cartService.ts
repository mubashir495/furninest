import api, { getApiErrorMessage } from '@/lib/axios';
import { Cart } from '@/Type/cart';

export const cartService = {
  async getCart(): Promise<Cart> {
    try {
      const { data } = await api.get('/cart');
      return data.data;
    } catch (error) {
      throw new Error(getApiErrorMessage(error, 'Could not load your cart.'));
    }
  },

  async addItem(productId: string, quantity = 1, variantId?: string): Promise<void> {
    try {
      await api.post('/cart/items', { productId, quantity, ...(variantId && { variantId }) });
    } catch (error) {
      throw new Error(getApiErrorMessage(error, 'Could not add item to cart.'));
    }
  },

  async updateItem(productId: string, quantity: number, variantId?: string): Promise<void> {
    try {
      await api.patch(`/cart/items/${productId}`, { quantity, ...(variantId && { variantId }) });
    } catch (error) {
      throw new Error(getApiErrorMessage(error, 'Could not update quantity.'));
    }
  },

  async removeItem(productId: string, variantId?: string): Promise<void> {
    try {
      await api.delete(`/cart/items/${productId}`, { data: variantId ? { variantId } : undefined });
    } catch (error) {
      throw new Error(getApiErrorMessage(error, 'Could not remove item.'));
    }
  },

  async clearCart(): Promise<void> {
    try {
      await api.delete('/cart');
    } catch (error) {
      throw new Error(getApiErrorMessage(error, 'Could not clear cart.'));
    }
  },
};
