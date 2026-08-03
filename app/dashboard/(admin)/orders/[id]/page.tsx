'use client';

import React, { useEffect, useState } from 'react';
import { useParams, useRouter } from 'next/navigation';
import Link from 'next/link';
import { ArrowLeft, Printer, ArrowRight } from 'lucide-react';
import { toast } from 'sonner';
import { getOrderById, updateOrderStatus } from '@/lib/orderApi';
import { userService } from '@/services/userService';
import { AdminOrder, ORDER_STATUS_LABELS, OrderStatus } from '@/Type/order';
import { OrderStatusBadge } from '@/components/admin/order/OrderStatusBadge';
import { OrderItemsTable } from '@/components/admin/order/OrderItemsTable';
import { OrderSummaryCard } from '@/components/admin/order/OrderSummaryCard';
import { formatDate, formatCurrency } from '@/utils/validators';

const STATUS_TRANSITIONS: Record<OrderStatus, OrderStatus[]> = {
  PENDING: ['PROCESSING', 'CANCELLED'],
  PROCESSING: ['SHIPPED', 'CANCELLED'],
  SHIPPED: ['DELIVERED'],
  DELIVERED: [],
  CANCELLED: [],
};

export default function AdminOrderDetailPage() {
  const params = useParams();
  const router = useRouter();
  const [order, setOrder] = useState<AdminOrder | null>(null);
  const [customer, setCustomer] = useState<{ fullName: string; email: string } | null>(null);
  const [isLoading, setIsLoading] = useState(true);
  const [isUpdating, setIsUpdating] = useState(false);
  const [error, setError] = useState('');

  const orderId = Array.isArray(params?.id) ? params.id[0] : params?.id;

  useEffect(() => {
    async function load() {
      if (!orderId) return;
      setIsLoading(true);
      setError('');
      try {
        const fetchedOrder = await getOrderById(orderId);
        setOrder(fetchedOrder);

        if (typeof fetchedOrder.user === 'string') {
          const found = await userService.findUserById(fetchedOrder.user);
          if (found) {
            setCustomer({ fullName: found.fullName, email: found.email });
          }
        } else {
          setCustomer({ fullName: fetchedOrder.user.fullName, email: fetchedOrder.user.email });
        }
      } catch (err) {
        setError(err instanceof Error ? err.message : 'Could not load order.');
      } finally {
        setIsLoading(false);
      }
    }

    load();
  }, [orderId]);

  const handleStatusChange = async (status: OrderStatus) => {
    if (!order) return;
    setIsUpdating(true);
    try {
      const updated = await updateOrderStatus(order._id, status);
      setOrder(updated);
      toast.success(`Order status updated to ${ORDER_STATUS_LABELS[status]}`);
    } catch (err) {
      toast.error(err instanceof Error ? err.message : 'Could not update order status.');
    } finally {
      setIsUpdating(false);
    }
  };

  const printInvoice = () => {
    window.print();
  };

  if (isLoading) {
    return (
      <div className="py-20 text-center">
        <div className="mx-auto h-12 w-12 animate-spin rounded-full border-4 border-[#8B5E34] border-t-transparent" />
      </div>
    );
  }

  if (error || !order) {
    return (
      <div className="py-20 text-center">
        <p className="text-sm text-[#8B5E34] mb-4">{error || 'Order not found.'}</p>
        <Link href="/dashboard/orders" className="inline-flex items-center gap-2 rounded-full border border-[#E8E0D8] bg-white px-4 py-2 text-sm font-medium text-[#8B5E34] hover:bg-[#F5EFE3]">
          <ArrowLeft size={16} /> Back to orders
        </Link>
      </div>
    );
  }

  const paymentStatus = order.paymentMethod === 'COD' ? 'Pay on Delivery' : 'Paid';
  const customerFullName = customer?.fullName ?? (typeof order.user === 'string' ? 'Customer' : order.user.fullName);
  const customerEmail = customer?.email ?? (typeof order.user === 'string' ? '—' : order.user.email);
  const orderDate = formatDate(order.created_date);

  return (
    <div className="space-y-6">
      <div className="flex flex-col gap-4 md:flex-row md:items-center md:justify-between">
        <div>
          <p className="text-sm font-semibold uppercase tracking-wider text-[#8B7B6F]">Order details</p>
          <h1 className="text-3xl font-semibold text-[#2B2420]">Order #{order.orderNumber}</h1>
          <p className="mt-2 text-sm text-[#5C5248]">Placed on {orderDate}</p>
        </div>
        <div className="flex flex-wrap gap-3">
          <button type="button" onClick={() => router.push('/dashboard/orders')} className="inline-flex items-center gap-2 rounded-full border border-[#E8E0D8] bg-white px-4 py-2 text-sm font-medium text-[#8B5E34] hover:bg-[#F5EFE3]">
            <ArrowLeft size={16} /> Back to orders
          </button>
          <button type="button" onClick={printInvoice} className="inline-flex items-center gap-2 rounded-full bg-[#8B5E34] px-4 py-2 text-sm font-medium text-white hover:bg-[#6E4A29]">
            <Printer size={16} /> Print Invoice
          </button>
        </div>
      </div>

      <div className="grid gap-4 xl:grid-cols-[1.5fr_0.9fr]">
        <div className="space-y-4">
          <div className="rounded-3xl border border-[#E8E0D8] bg-white p-6 shadow-sm">
            <div className="grid gap-4 sm:grid-cols-2">
              <div className="space-y-2">
                <p className="text-xs uppercase tracking-wider text-[#8B7B6F]">Order ID</p>
                <p className="font-semibold text-[#2B2420]">{order._id}</p>
              </div>
              <div className="space-y-2">
                <p className="text-xs uppercase tracking-wider text-[#8B7B6F]">Payment method</p>
                <p className="font-semibold text-[#2B2420]">{order.paymentMethod === 'COD' ? 'Cash on Delivery' : 'Card'}</p>
              </div>
              <div className="space-y-2">
                <p className="text-xs uppercase tracking-wider text-[#8B7B6F]">Order status</p>
                <OrderStatusBadge status={order.status} />
              </div>
              <div className="space-y-2">
                <p className="text-xs uppercase tracking-wider text-[#8B7B6F]">Payment status</p>
                <p className="font-semibold text-[#2B2420]">{paymentStatus}</p>
              </div>
            </div>
          </div>

          <div className="rounded-3xl border border-[#E8E0D8] bg-white p-6 shadow-sm">
            <h2 className="text-lg font-semibold text-[#2B2420] mb-4">Customer information</h2>
            <div className="grid gap-4 sm:grid-cols-2">
              <div>
                <p className="text-xs uppercase tracking-wider text-[#8B7B6F]">Name</p>
                <p className="mt-1 text-sm font-semibold text-[#2B2420]">{customerFullName}</p>
              </div>
              <div>
                <p className="text-xs uppercase tracking-wider text-[#8B7B6F]">Email</p>
                <p className="mt-1 text-sm text-[#2B2420]">{customerEmail}</p>
              </div>
              <div>
                <p className="text-xs uppercase tracking-wider text-[#8B7B6F]">Phone</p>
                <p className="mt-1 text-sm text-[#2B2420]">{order.shippingAddress.phone}</p>
              </div>
            </div>
          </div>

          <div className="rounded-3xl border border-[#E8E0D8] bg-white p-6 shadow-sm">
            <h2 className="text-lg font-semibold text-[#2B2420] mb-4">Shipping address</h2>
            <p className="text-sm font-semibold text-[#2B2420]">{order.shippingAddress.fullName}</p>
            <p className="mt-1 text-sm text-[#5C5248]">{order.shippingAddress.phone}</p>
            <p className="mt-3 text-sm text-[#5C5248]">
              {order.shippingAddress.addressLine1}
              {order.shippingAddress.addressLine2 ? `, ${order.shippingAddress.addressLine2}` : ''}
              <br />
              {order.shippingAddress.city}, {order.shippingAddress.state} {order.shippingAddress.postalCode}
              <br />
              {order.shippingAddress.country}
            </p>
          </div>

          <div className="rounded-3xl border border-[#E8E0D8] bg-white p-6 shadow-sm">
            <div className="flex flex-col gap-3 sm:flex-row sm:items-center sm:justify-between">
              <div>
                <h2 className="text-lg font-semibold text-[#2B2420]">Order items</h2>
                <p className="text-sm text-[#8B7B6F]">{order.items?.length ?? 0} items</p>
              </div>
              {STATUS_TRANSITIONS[order.status].length > 0 && (
                <div className="flex flex-wrap gap-2">
                  {STATUS_TRANSITIONS[order.status].map((statusOption) => (
                    <button
                      key={statusOption}
                      type="button"
                      disabled={isUpdating}
                      onClick={() => handleStatusChange(statusOption)}
                      className="inline-flex items-center rounded-full bg-[#8B5E34] px-4 py-2 text-sm font-medium text-white hover:bg-[#6E4A29] disabled:opacity-50"
                    >
                      Update status to {ORDER_STATUS_LABELS[statusOption]}
                    </button>
                  ))}
                </div>
              )}
            </div>
          </div>

          <OrderItemsTable items={order.items ?? []} />
        </div>

        <div className="space-y-4">
          <OrderSummaryCard order={order} />
        </div>
      </div>
    </div>
  );
}
