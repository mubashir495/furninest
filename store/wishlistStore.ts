import { create } from 'zustand';
import { wishlistService } from '@/services/wishlistService';
import { WishlistItem } from '@/Type/wishlist';
import { getApiErrorMessage } from '@/lib/axios';

interface WishlistStore {
  items: WishlistItem[];
  isLoading: boolean;
  error: string | null;
  hasLoaded: boolean;

  fetchWishlist: () => Promise<void>;
  toggle: (productId: string) => Promise<boolean>;
  remove: (productId: string) => Promise<void>;
  clear: () => Promise<void>;
  isInWishlist: (productId: string) => boolean;
  reset: () => void;
}

export const useWishlistStore = create<WishlistStore>((set, get) => ({
  items: [],
  isLoading: false,
  error: null,
  hasLoaded: false,

  fetchWishlist: async () => {
    set({ isLoading: true, error: null });
    try {
      const items = await wishlistService.getWishlist();
      set({ items, isLoading: false, hasLoaded: true });
    } catch (error) {
      set({ error: getApiErrorMessage(error), isLoading: false, hasLoaded: true });
    }
  },

  toggle: async (productId) => {
    set({ error: null });
    try {
      const wishlisted = await wishlistService.toggle(productId);
      await get().fetchWishlist();
      return wishlisted;
    } catch (error) {
      set({ error: getApiErrorMessage(error) });
      throw error;
    }
  },

  remove: async (productId) => {
    set({ error: null });
    try {
      await wishlistService.remove(productId);
      set((state) => ({ items: state.items.filter((i) => i.product._id !== productId) }));
    } catch (error) {
      set({ error: getApiErrorMessage(error) });
      throw error;
    }
  },

  clear: async () => {
    set({ error: null });
    try {
      await wishlistService.clear();
      set({ items: [] });
    } catch (error) {
      set({ error: getApiErrorMessage(error) });
      throw error;
    }
  },

  isInWishlist: (productId) => get().items.some((i) => i.product._id === productId),

  reset: () => set({ items: [], isLoading: false, error: null, hasLoaded: false }),
}));
