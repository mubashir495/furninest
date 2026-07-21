import { CartProductRef } from './cart';

export interface WishlistItem {
  _id: string;
  user: string;
  product: CartProductRef & { images?: string[] };
  created_date: string;
  updated_date: string;
}
