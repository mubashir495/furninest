import { create } from 'zustand';
import { cartService } from '@/services/cartService';
import { Cart } from '@/Type/cart';
import { getApiErrorMessage } from '@/lib/axios';

interface CartStore {
  cart: Cart | null;
  isLoading: boolean;
  error: string | null;
  hasLoaded: boolean;

  fetchCart: () => Promise<void>;
  addItem: (productId: string, quantity?: number) => Promise<void>;
  updateItem: (productId: string, quantity: number) => Promise<void>;
  removeItem: (productId: string) => Promise<void>;
  clearCart: () => Promise<void>;
  reset: () => void;
}

const emptyCart: Cart = { cartId: '', items: [], totalItems: 0, totalPrice: 0 };

export const useCartStore = create<CartStore>((set, get) => ({
  cart: null,
  isLoading: false,
  error: null,
  hasLoaded: false,

  fetchCart: async () => {
    set({ isLoading: true, error: null });
    try {
      const cart = await cartService.getCart();
      set({ cart, isLoading: false, hasLoaded: true });
    } catch (error) {
      set({ error: getApiErrorMessage(error), isLoading: false, hasLoaded: true });
    }
  },

  addItem: async (productId, quantity = 1) => {
    set({ error: null });
    try {
      await cartService.addItem(productId, quantity);
      await get().fetchCart();
    } catch (error) {
      set({ error: getApiErrorMessage(error) });
      throw error;
    }
  },

  updateItem: async (productId, quantity) => {
    set({ error: null });
    const previous = get().cart;
    try {
      await cartService.updateItem(productId, quantity);
      await get().fetchCart();
    } catch (error) {
      set({ error: getApiErrorMessage(error), cart: previous });
      throw error;
    }
  },

  removeItem: async (productId) => {
    set({ error: null });
    try {
      await cartService.removeItem(productId);
      await get().fetchCart();
    } catch (error) {
      set({ error: getApiErrorMessage(error) });
      throw error;
    }
  },

  clearCart: async () => {
    set({ error: null });
    try {
      await cartService.clearCart();
      set({ cart: emptyCart });
    } catch (error) {
      set({ error: getApiErrorMessage(error) });
      throw error;
    }
  },

  reset: () => set({ cart: null, isLoading: false, error: null, hasLoaded: false }),
}));
