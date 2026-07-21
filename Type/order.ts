import { ShippingAddress } from './address';

export type OrderStatus = 'PENDING' | 'PROCESSING' | 'SHIPPED' | 'DELIVERED' | 'CANCELLED';
export type PaymentMethod = 'COD' | 'CARD';

export interface OrderItem {
  _id: string;
  order: string;
  product: string;
  productName: string;
  productThumbnail?: string;
  price: number;
  quantity: number;
  subtotal: number;
  created_date: string;
}

export interface Order {
  _id: string;
  user: string;
  orderNumber: string;
  shippingAddress: ShippingAddress;
  paymentMethod: PaymentMethod;
  status: OrderStatus;
  totalAmount: number;
  totalItems: number;
  notes?: string;
  cancelledAt?: string | null;
  deliveredAt?: string | null;
  created_date: string;
  updated_date: string;
  items?: OrderItem[]; // present on GET /orders/:id
}

export interface CreateOrderPayload {
  shippingAddressId?: string;
  shippingAddress?: {
    label?: string;
    fullName: string;
    phone: string;
    addressLine1: string;
    addressLine2?: string;
    city: string;
    state: string;
    postalCode: string;
    country?: string;
  };
  paymentMethod?: PaymentMethod;
  notes?: string;
}

export const ORDER_STATUS_LABELS: Record<OrderStatus, string> = {
  PENDING: 'Pending',
  PROCESSING: 'Processing',
  SHIPPED: 'Shipped',
  DELIVERED: 'Delivered',
  CANCELLED: 'Cancelled',
};

// Admin's GET /orders populates `user` with fullName/email instead of leaving it as an id
export interface AdminOrder extends Omit<Order, 'user'> {
  user: { _id: string; fullName: string; email: string } | string;
}
