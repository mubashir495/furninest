import api, { getApiErrorMessage } from '@/lib/axios';
import { WishlistItem } from '@/Type/wishlist';

export const wishlistService = {
  async getWishlist(): Promise<WishlistItem[]> {
    try {
      const { data } = await api.get('/wishlist');
      return data.data ?? [];
    } catch (error) {
      throw new Error(getApiErrorMessage(error, 'Could not load your wishlist.'));
    }
  },

  async isWishlisted(productId: string): Promise<boolean> {
    try {
      const { data } = await api.get(`/wishlist/check/${productId}`);
      return !!data.data?.wishlisted;
    } catch {
      return false;
    }
  },

  async add(productId: string): Promise<void> {
    try {
      await api.post('/wishlist', { productId });
    } catch (error) {
      throw new Error(getApiErrorMessage(error, 'Could not add to wishlist.'));
    }
  },

  // Returns the new wishlisted state
  async toggle(productId: string): Promise<boolean> {
    try {
      const { data } = await api.post('/wishlist/toggle', { productId });
      return !!data.data?.wishlisted;
    } catch (error) {
      throw new Error(getApiErrorMessage(error, 'Could not update wishlist.'));
    }
  },

  async remove(productId: string): Promise<void> {
    try {
      await api.delete(`/wishlist/${productId}`);
    } catch (error) {
      throw new Error(getApiErrorMessage(error, 'Could not remove from wishlist.'));
    }
  },

  async clear(): Promise<void> {
    try {
      await api.delete('/wishlist/clear');
    } catch (error) {
      throw new Error(getApiErrorMessage(error, 'Could not clear wishlist.'));
    }
  },
};
