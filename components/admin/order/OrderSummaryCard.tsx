'use client';

import { AdminOrder, Order } from '@/Type/order';
import { formatCurrency } from '@/utils/validators';

interface OrderSummaryCardProps {
  order: Order | AdminOrder;
}

export function OrderSummaryCard({ order }: OrderSummaryCardProps) {
  const subtotal = order.items?.reduce((sum, item) => sum + item.subtotal, 0) ?? 0;
  const shipping = 0;
  const discount = 0;
  const tax = Math.round((order.totalAmount - subtotal) * 0.2) || 0;

  return (
    <div className="rounded-3xl border border-[#E8E0D8] bg-white p-6 shadow-sm">
      <h2 className="text-lg font-semibold text-[#2B2420] mb-4">Order Summary</h2>
      <div className="space-y-3 text-sm text-[#5C5248]">
        <div className="flex items-center justify-between">
          <span>Subtotal</span>
          <span>{formatCurrency(subtotal)}</span>
        </div>
        <div className="flex items-center justify-between">
          <span>Shipping</span>
          <span>{formatCurrency(shipping)}</span>
        </div>
        <div className="flex items-center justify-between">
          <span>Discount</span>
          <span>{formatCurrency(discount)}</span>
        </div>
        <div className="flex items-center justify-between">
          <span>Tax</span>
          <span>{formatCurrency(tax)}</span>
        </div>
      </div>
      <div className="mt-6 flex items-center justify-between border-t border-[#E8E0D8] pt-4 text-base font-semibold text-[#2B2420]">
        <span>Total</span>
        <span>{formatCurrency(order.totalAmount)}</span>
      </div>
    </div>
  );
}
