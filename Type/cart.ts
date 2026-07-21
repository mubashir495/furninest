export interface CartProductRef {
  _id: string;
  name: string;
  slug: string;
  price: number;
  discount: number;
  thumbnailImage: string;
  stock: number;
  isActive: boolean;
}

export interface CartItem {
  _id: string;
  cart: string;
  product: CartProductRef;
  quantity: number;
  price: number; // unit price snapshot (finalPrice at time of add)
  subtotal: number; // virtual: price * quantity
  created_date: string;
  updated_date: string;
}

export interface Cart {
  cartId: string;
  items: CartItem[];
  totalItems: number;
  totalPrice: number;
}
