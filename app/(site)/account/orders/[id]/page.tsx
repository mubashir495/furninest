'use client';

import React, { useEffect, useState } from 'react';
import { useParams, useRouter } from 'next/navigation';
import Link from 'next/link';
import { toast } from 'sonner';
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

export default function OrderDetailPage() {
  const params = useParams<{ id: string }>();
  const router = useRouter();
  const [order, setOrder] = useState<Order | null>(null);
  const [isLoading, setIsLoading] = useState(true);
  const [error, setError] = useState('');
  const [cancelling, setCancelling] = useState(false);

  usePageTitle(order ? `Order #${order.orderNumber}` : 'Order Details');

  function load() {
    if (!params?.id) return;
    setIsLoading(true);
    orderService
      .getOrder(params.id)
      .then(setOrder)
      .catch((err) => setError(err instanceof Error ? err.message : 'Order not found.'))
      .finally(() => setIsLoading(false));
  }

  useEffect(load, [params?.id]);

  async function handleCancel() {
    if (!order || !confirm('Cancel this order?')) return;
    setCancelling(true);
    try {
      const updated = await orderService.cancelOrder(order._id);
      setOrder(updated);
      toast.success('Order cancelled');
    } catch (err) {
      toast.error(err instanceof Error ? err.message : 'Could not cancel order.');
    } finally {
      setCancelling(false);
    }
  }

  if (isLoading) {
    return (
      <div className="py-20 text-center">
        <div className="w-12 h-12 border-4 border-primary border-t-transparent rounded-full animate-spin mx-auto"></div>
      </div>
    );
  }

  if (error || !order) {
    return (
      <div className="py-20 text-center">
        <p className="text-destructive mb-4">{error || 'Order not found.'}</p>
        <Link href="/account/orders" className="text-primary underline">Back to orders</Link>
      </div>
    );
  }

  const canCancel = order.status === 'PENDING' || order.status === 'PROCESSING';

  return (
    <div>
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4 mb-10">
        <div>
          <h1 className="text-3xl font-serif text-primary mb-1">Order #{order.orderNumber}</h1>
          <p className="text-muted-foreground text-sm">Placed on {new Date(order.created_date).toLocaleString()}</p>
        </div>
        <div className="flex flex-col items-start sm:items-end gap-1">
          <span className={`text-sm font-bold px-4 py-2 rounded-full self-start ${STATUS_COLORS[order.status]}`}>
            {ORDER_STATUS_LABELS[order.status]}
          </span>
          {order.status === 'DELIVERED' && order.deliveredAt && (
            <p className="text-xs text-muted-foreground">
              Delivered on {new Date(order.deliveredAt).toLocaleDateString(undefined, { day: 'numeric', month: 'long', year: 'numeric' })}
            </p>
          )}
          {order.status === 'CANCELLED' && order.cancelledAt && (
            <p className="text-xs text-muted-foreground">
              Cancelled on {new Date(order.cancelledAt).toLocaleDateString(undefined, { day: 'numeric', month: 'long', year: 'numeric' })}
            </p>
          )}
        </div>
      </div>

      {order.status !== 'CANCELLED' && (
        <div className="bg-card rounded-3xl soft-shadow p-6 mb-8">
          <DeliveryTracker status={order.status} deliveredAt={order.deliveredAt} />
        </div>
      )}

      <div className="grid lg:grid-cols-3 gap-8">
        <div className="lg:col-span-2 space-y-4">
          <div className="bg-card rounded-3xl soft-shadow p-6">
            <h2 className="text-lg font-serif text-primary mb-4">Items</h2>
            <div className="space-y-4">
              {(order.items ?? []).map((item) => (
                <div key={item._id} className="flex items-center gap-4 pb-4 border-b border-border last:border-0 last:pb-0">
                  {/* eslint-disable-next-line @next/next/no-img-element */}
                  <img src={item.productThumbnail || '/window.svg'} alt={item.productName} className="w-16 h-16 object-cover rounded-xl" />
                  <div className="flex-1">
                    <p className="font-medium text-primary">{item.productName}</p>
                    <p className="text-sm text-muted-foreground">
                      Qty {item.quantity} × Rs {item.price.toLocaleString()}
                    </p>
                  </div>
                  <p className="font-semibold text-primary">Rs {item.subtotal.toLocaleString()}</p>
                </div>
              ))}
            </div>
          </div>

          {order.notes && (
            <div className="bg-card rounded-3xl soft-shadow p-6">
              <h2 className="text-lg font-serif text-primary mb-2">Order Notes</h2>
              <p className="text-sm text-muted-foreground">{order.notes}</p>
            </div>
          )}
        </div>

        <div className="space-y-4">
          <div className="bg-card rounded-3xl soft-shadow p-6">
            <h2 className="text-lg font-serif text-primary mb-4">Shipping Address</h2>
            <p className="text-sm font-medium text-primary">{order.shippingAddress.fullName}</p>
            <p className="text-sm text-muted-foreground">{order.shippingAddress.phone}</p>
            <p className="text-sm text-muted-foreground mt-2">
              {order.shippingAddress.addressLine1}
              {order.shippingAddress.addressLine2 ? `, ${order.shippingAddress.addressLine2}` : ''}
              <br />
              {order.shippingAddress.city}, {order.shippingAddress.state} {order.shippingAddress.postalCode}
              <br />
              {order.shippingAddress.country}
            </p>
          </div>

          <div className="bg-primary text-primary-foreground rounded-3xl p-6">
            <h2 className="text-lg font-serif mb-4">Payment</h2>
            <div className="flex justify-between text-sm text-white/80 mb-2">
              <span>Method</span>
              <span className="text-white font-medium">{order.paymentMethod === 'COD' ? 'Cash on Delivery' : 'Card'}</span>
            </div>
            <div className="flex justify-between text-lg font-bold pt-3 mt-3 border-t border-white/20">
              <span>Total</span>
              <span className="text-accent">Rs {order.totalAmount.toLocaleString()}</span>
            </div>
          </div>

          {canCancel && (
            <button
              onClick={handleCancel}
              disabled={cancelling}
              className="w-full border-2 border-destructive text-destructive py-3 rounded-2xl font-medium hover:bg-destructive hover:text-destructive-foreground transition-colors disabled:opacity-50"
            >
              {cancelling ? 'Cancelling…' : 'Cancel Order'}
            </button>
          )}
        </div>
      </div>
    </div>
  );
}

const STEPS: { status: OrderStatus; label: string }[] = [
  { status: 'PENDING', label: 'Order Placed' },
  { status: 'PROCESSING', label: 'Processing' },
  { status: 'SHIPPED', label: 'Shipped' },
  { status: 'DELIVERED', label: 'Delivered' },
];

function DeliveryTracker({ status, deliveredAt }: { status: OrderStatus; deliveredAt?: string | null }) {
  const currentIndex = STEPS.findIndex((s) => s.status === status);

  return (
    <div>
      <p className="text-xs font-bold uppercase tracking-wider text-muted-foreground mb-6">Delivery Status</p>
      <div className="flex items-center">
        {STEPS.map((step, index) => {
          const isDone = index <= currentIndex;
          const isLast = index === STEPS.length - 1;
          return (
            <React.Fragment key={step.status}>
              <div className="flex flex-col items-center gap-2 shrink-0">
                <div
                  className={`w-9 h-9 rounded-full flex items-center justify-center text-xs font-bold transition-colors ${
                    isDone ? 'bg-primary text-primary-foreground' : 'bg-muted text-muted-foreground'
                  }`}
                >
                  {index + 1}
                </div>
                <span className={`text-xs text-center font-medium ${isDone ? 'text-primary' : 'text-muted-foreground'}`}>
                  {step.label}
                </span>
                {step.status === 'DELIVERED' && deliveredAt && isDone && (
                  <span className="text-[10px] text-muted-foreground">
                    {new Date(deliveredAt).toLocaleDateString()}
                  </span>
                )}
              </div>
              {!isLast && (
                <div className={`flex-1 h-0.5 mx-2 mb-6 transition-colors ${index < currentIndex ? 'bg-primary' : 'bg-muted'}`} />
              )}
            </React.Fragment>
          );
        })}
      </div>
    </div>
  );
}
