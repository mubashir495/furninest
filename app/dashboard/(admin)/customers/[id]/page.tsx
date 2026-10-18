'use client';

import React, { useEffect, useMemo, useState } from 'react';
import { useParams } from 'next/navigation';
import Link from 'next/link';
import { ArrowLeft, ArrowRight } from 'lucide-react';
import { getAllOrders } from '@/lib/orderApi';
import { userService } from '@/services/userService';
import { CustomerProfileCard } from '@/components/admin/customer/CustomerProfileCard';
import { CustomerStats } from '@/components/admin/customer/CustomerStats';
import { EmptyState } from '@/components/ui/EmptyState';
import { OrderStatusBadge } from '@/components/admin/order/OrderStatusBadge';
import { Order } from '@/Type/order';
import { User } from '@/Type/user';
import { formatDate, formatCurrency } from '@/utils/validators';

export default function CustomerDetailPage() {
  const params = useParams();
  const [customer, setCustomer] = useState<User | null>(null);
  const [orders, setOrders] = useState<Order[]>([]);
  const [isLoading, setIsLoading] = useState(true);
  const [error, setError] = useState('');

  const rawId = params?.id ?? '';
  const customerId = Array.isArray(rawId) ? rawId[0] : rawId;

  useEffect(() => {
    async function load() {
      setIsLoading(true);
      setError('');

      try {
        const [foundCustomer, allOrders] = await Promise.all([userService.findUserById(customerId), getAllOrders()]);

        if (!foundCustomer) {
          throw new Error('Customer not found.');
        }

        setCustomer(foundCustomer);

        const matchingOrders = allOrders.filter((order) => {
          if (typeof order.user === 'string') {
            return order.user === customerId;
          }
          return order.user._id === customerId || order.user._id === foundCustomer._id;
        });

        // AdminOrder is a superset of Order — safe to cast
        setOrders(matchingOrders as unknown as Order[]);
      } catch (err) {

        setError(err instanceof Error ? err.message : 'Could not load customer details.');
      } finally {
        setIsLoading(false);
      }
    }

    if (customerId) {
      load();
    }
  }, [customerId]);

  const totalSpending = useMemo(() => orders.reduce((sum, order) => sum + order.totalAmount, 0), [orders]);
  const lastOrder = useMemo(() => orders.sort((a, b) => new Date(b.created_date).getTime() - new Date(a.created_date).getTime())[0], [orders]);
  const averageOrderValue = orders.length ? Math.round(totalSpending / orders.length) : 0;
  const uniqueAddresses = useMemo(() => {
    const addresses = new Map<string, Order['shippingAddress']>();

    orders.forEach((order) => {
      addresses.set(order.shippingAddress._id, order.shippingAddress);
    });

    return Array.from(addresses.values());
  }, [orders]);

  if (isLoading) {
    return (
      <div className="py-20 text-center">
        <div className="mx-auto h-12 w-12 animate-spin rounded-full border-4 border-[#8B5E34] border-t-transparent" />
      </div>
    );
  }

  if (error || !customer) {
    return (
      <div className="py-20 text-center space-y-4">
        <p className="text-sm text-[#8B5E34]">{error || 'Customer not found.'}</p>
        <Link href="/dashboard/customers" className="inline-flex items-center gap-2 rounded-full border border-[#E8E0D8] bg-white px-4 py-2 text-sm font-medium text-[#8B5E34] hover:bg-[#F5EFE3]">
          <ArrowLeft size={16} /> Back to customers
        </Link>
      </div>
    );
  }

  return (
    <div className="space-y-6">
      <div className="flex flex-col gap-4 md:flex-row md:items-center md:justify-between">
        <div>
          <h1 className="text-2xl font-semibold text-[#2B2420]">{customer.fullName}</h1>
          <p className="text-sm text-[#8B7B6F]">Customer profile and order history.</p>
        </div>
        <Link href="/dashboard/customers" className="inline-flex items-center gap-2 rounded-full border border-[#E8E0D8] bg-white px-4 py-2 text-sm font-medium text-[#8B5E34] hover:bg-[#F5EFE3]">
          <ArrowLeft size={16} /> Back to customers
        </Link>
      </div>

      <div className="grid gap-4 xl:grid-cols-[1.4fr_0.9fr]">
        <div className="space-y-4">
          <CustomerProfileCard customer={customer} />
          <div className="rounded-3xl border border-[#E8E0D8] bg-white p-6 shadow-sm">
            <h2 className="text-lg font-semibold text-[#2B2420] mb-4">Addresses</h2>
            {uniqueAddresses.length === 0 ? (
              <EmptyState
                title="No shipping addresses"
                description="This customer has no orders with a stored shipping address yet."
                icon={ArrowRight}
              />
            ) : (
              <div className="space-y-4">
                {uniqueAddresses.map((address) => (
                  <div key={address._id} className="rounded-3xl border border-[#E8E0D8] bg-[#FBF7F2] p-4">
                    <p className="font-semibold text-[#2B2420]">{address.fullName}</p>
                    <p className="text-sm text-[#5C5248]">{address.phone}</p>
                    <p className="mt-2 text-sm text-[#5C5248]">
                      {address.addressLine1}
                      {address.addressLine2 ? `, ${address.addressLine2}` : ''}
                      <br />
                      {address.city}, {address.state} {address.postalCode}
                      <br />
                      {address.country}
                    </p>
                  </div>
                ))}
              </div>
            )}
          </div>
        </div>

        <div className="space-y-4">
          <CustomerStats
            totalOrders={orders.length}
            totalSpending={totalSpending}
            lastOrderDate={lastOrder?.created_date ? formatDate(lastOrder.created_date) : undefined}
            averageOrderValue={averageOrderValue}
          />

          <div className="rounded-3xl border border-[#E8E0D8] bg-white p-6 shadow-sm">
            <h2 className="text-lg font-semibold text-[#2B2420] mb-4">Order history</h2>
            {orders.length === 0 ? (
              <EmptyState
                title="No orders yet"
                description="This customer has not placed any orders."
                icon={ArrowRight}
              />
            ) : (
              <div className="overflow-x-auto">
                <table className="min-w-full text-sm text-[#2B2420]">
                  <thead className="border-b border-[#E8E0D8] bg-[#FBF7F2] text-left text-xs uppercase tracking-wider text-[#8B7B6F]">
                    <tr>
                      <th className="px-4 py-3">Order</th>
                      <th className="px-4 py-3">Date</th>
                      <th className="px-4 py-3">Status</th>
                      <th className="px-4 py-3">Total</th>
                      <th className="px-4 py-3"></th>
                    </tr>
                  </thead>
                  <tbody>
                    {orders.map((order) => (
                      <tr key={order._id} className="border-b border-[#E8E0D8] last:border-0 hover:bg-[#FBF7F2]">
                        <td className="px-4 py-4 font-medium text-[#2B2420]">#{order.orderNumber}</td>
                        <td className="px-4 py-4 text-[#5C5248]">{formatDate(order.created_date)}</td>
                        <td className="px-4 py-4">
                          <OrderStatusBadge status={order.status} />
                        </td>
                        <td className="px-4 py-4 font-semibold text-[#2B2420]">Rs {formatCurrency(order.totalAmount)}</td>
                        <td className="px-4 py-4 text-right">
                          <Link href={`/dashboard/orders/${order._id}`} className="inline-flex items-center rounded-full bg-[#8B5E34] px-3 py-2 text-xs font-medium text-white hover:bg-[#6E4A29]">
                            View
                          </Link>
                        </td>
                      </tr>
                    ))}
                  </tbody>
                </table>
              </div>
            )}
          </div>
        </div>
      </div>
    </div>
  );
}
