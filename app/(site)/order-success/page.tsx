'use client';

import React, { Suspense, useEffect, useState } from 'react';
import { useSearchParams } from 'next/navigation';
import Link from 'next/link';
import { CheckCircle2 } from 'lucide-react';
import { orderService } from '@/services/orderService';
import { Order } from '@/Type/order';
import { usePageTitle } from '@/hooks/usePageTitle';

function OrderSuccessContent() {
  usePageTitle('Order Confirmed');
  const searchParams = useSearchParams();
  const orderId = searchParams.get('orderId');

  const [order, setOrder] = useState<Order | null>(null);
  const [isLoading, setIsLoading] = useState(true);

  useEffect(() => {
    if (!orderId) {
      setIsLoading(false);
      return;
    }
    orderService
      .getOrder(orderId)
      .then(setOrder)
      .catch(() => setOrder(null))
      .finally(() => setIsLoading(false));
  }, [orderId]);

  return (
    <div className="min-h-[70vh] flex flex-col items-center justify-center text-center px-6 py-16">
      <div className="w-24 h-24 bg-green-100 rounded-full flex items-center justify-center mb-8">
        <CheckCircle2 size={48} className="text-green-600" />
      </div>
      <h1 className="text-4xl md:text-5xl font-serif text-primary mb-4">Order Confirmed!</h1>
      <p className="text-muted-foreground text-lg mb-8 max-w-md">
        Thank you for your purchase. We&apos;ll notify you as your order progresses.
      </p>

      {!isLoading && order && (
        <div className="bg-card rounded-3xl soft-shadow p-8 max-w-md w-full mb-10 text-left">
          <div className="flex justify-between mb-3">
            <span className="text-sm text-muted-foreground">Order Number</span>
            <span className="font-bold text-primary">#{order.orderNumber}</span>
          </div>
          <div className="flex justify-between mb-3">
            <span className="text-sm text-muted-foreground">Items</span>
            <span className="font-medium text-primary">{order.totalItems}</span>
          </div>
          <div className="flex justify-between pt-3 border-t border-border">
            <span className="text-sm text-muted-foreground">Total</span>
            <span className="text-xl font-bold text-primary">Rs {order.totalAmount.toLocaleString()}</span>
          </div>
        </div>
      )}

      <div className="flex flex-col sm:flex-row gap-4">
        {order && (
          <Link href={`/account/orders/${order._id}`} className="bg-primary text-primary-foreground px-8 py-3.5 rounded-2xl font-bold uppercase tracking-wider text-sm hover:bg-accent hover:text-accent-foreground transition-colors">
            View Order
          </Link>
        )}
        <Link href="/shop" className="border-2 border-primary text-primary px-8 py-3.5 rounded-2xl font-bold uppercase tracking-wider text-sm hover:bg-primary hover:text-primary-foreground transition-colors">
          Continue Shopping
        </Link>
      </div>
    </div>
  );
}

export default function OrderSuccessPage() {
  return (
    <Suspense fallback={<div className="py-32 text-center text-muted-foreground">Loading…</div>}>
      <OrderSuccessContent />
    </Suspense>
  );
}
