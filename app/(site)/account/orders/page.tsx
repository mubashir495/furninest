'use client';

import React, { useEffect, useState } from 'react';
import Link from 'next/link';
import { Package } from 'lucide-react';
import { orderService } from '@/services/orderService';
import { Order, ORDER_STATUS_LABELS, OrderStatus } from '@/Type/order';
import { usePageTitle } from '@/hooks/usePageTitle';

const STATUS_COLORS: Record<OrderStatus, string> = {
  PENDING: 'bg-amber-100 text-amber-700',
  PROCESSING: 'bg-blue-100 text-blue-700',
  SHIPPED: 'bg-indigo-100 text-indigo-700',
  DELIVERED: 'bg-green-100 text-green-700',
  CANCELLED: 'bg-red-100 text-red-700',
};

export default function OrdersPage() {
  usePageTitle('My Orders');
  const [orders, setOrders] = useState<Order[]>([]);
  const [isLoading, setIsLoading] = useState(true);
  const [error, setError] = useState('');

  useEffect(() => {
    orderService
      .getMyOrders()
      .then(setOrders)
      .catch((err) => setError(err instanceof Error ? err.message : 'Could not load orders.'))
      .finally(() => setIsLoading(false));
  }, []);

  return (
    <div>
      <h1 className="text-3xl font-serif text-primary mb-2">My Orders</h1>
      <p className="text-muted-foreground mb-10">Track and review your past orders.</p>

      {error && <p className="text-destructive mb-6">{error}</p>}

      {isLoading ? (
        <div className="space-y-4">
          {[1, 2, 3].map((i) => (
            <div key={i} className="h-24 bg-muted animate-pulse rounded-3xl"></div>
          ))}
        </div>
      ) : orders.length === 0 ? (
        <div className="bg-card rounded-3xl soft-shadow p-16 text-center">
          <Package size={40} className="text-muted-foreground mx-auto mb-4" />
          <p className="text-muted-foreground mb-6">You haven&apos;t placed any orders yet.</p>
          <Link href="/shop" className="bg-primary text-primary-foreground px-8 py-3 rounded-2xl font-medium hover:bg-accent hover:text-accent-foreground transition-colors">
            Start Shopping
          </Link>
        </div>
      ) : (
        <div className="space-y-4">
          {orders.map((order) => (
            <Link
              key={order._id}
              href={`/account/orders/${order._id}`}
              className="flex flex-col sm:flex-row sm:items-center justify-between gap-4 bg-card rounded-3xl soft-shadow p-6 hover:-translate-y-0.5 transition-transform"
            >
              <div>
                <p className="font-bold text-primary">#{order.orderNumber}</p>
                <p className="text-sm text-muted-foreground">
                  Placed on {new Date(order.created_date).toLocaleDateString()} · {order.totalItems} item{order.totalItems !== 1 ? 's' : ''}
                </p>
                {order.status === 'DELIVERED' && order.deliveredAt && (
                  <p className="text-xs text-muted-foreground mt-0.5">
                    Delivered on {new Date(order.deliveredAt).toLocaleDateString()}
                  </p>
                )}
              </div>
              <div className="flex items-center gap-4">
                <span className={`text-xs font-bold px-3 py-1.5 rounded-full ${STATUS_COLORS[order.status]}`}>
                  {ORDER_STATUS_LABELS[order.status]}
                </span>
                <span className="text-lg font-bold text-primary">Rs {order.totalAmount.toLocaleString()}</span>
              </div>
            </Link>
          ))}
        </div>
      )}
    </div>
  );
}
