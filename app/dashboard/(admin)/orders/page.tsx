'use client';

import React, { useEffect, useMemo, useState } from 'react';
import Link from 'next/link';
import { Package, Eye, Truck, CheckCircle2, Clock, XCircle } from 'lucide-react';
import { toast } from 'sonner';
import { getAllOrders } from '@/lib/orderApi';
import { AdminOrder, OrderStatus, ORDER_STATUS_LABELS } from '@/Type/order';

const STATUS_TABS: { id: OrderStatus | 'ALL'; label: string }[] = [
  { id: 'ALL', label: 'All' },
  { id: 'PENDING', label: 'Pending' },
  { id: 'PROCESSING', label: 'Processing' },
  { id: 'SHIPPED', label: 'Shipped' },
  { id: 'DELIVERED', label: 'Delivered' },
  { id: 'CANCELLED', label: 'Cancelled' },
];

const STATUS_STYLES: Record<OrderStatus, string> = {
  PENDING: 'bg-amber-100 text-amber-700',
  PROCESSING: 'bg-blue-100 text-blue-700',
  SHIPPED: 'bg-indigo-100 text-indigo-700',
  DELIVERED: 'bg-green-100 text-green-700',
  CANCELLED: 'bg-red-100 text-red-700',
};

// Which statuses an order can be moved to from its current status
const NEXT_STATUSES: Record<OrderStatus, OrderStatus[]> = {
  PENDING: ['PROCESSING', 'CANCELLED'],
  PROCESSING: ['SHIPPED', 'CANCELLED'],
  SHIPPED: ['DELIVERED'],
  DELIVERED: [],
  CANCELLED: [],
};

function customerName(order: AdminOrder) {
  return typeof order.user === 'string' ? order.user : order.user.fullName;
}

function customerEmail(order: AdminOrder) {
  return typeof order.user === 'string' ? '' : order.user.email;
}

export default function AdminOrdersPage() {
  const [orders, setOrders] = useState<AdminOrder[]>([]);
  const [isLoading, setIsLoading] = useState(true);
  const [activeTab, setActiveTab] = useState<OrderStatus | 'ALL'>('ALL');

  function load() {
    setIsLoading(true);
    getAllOrders()
      .then(setOrders)
      .catch((err) => toast.error(err instanceof Error ? err.message : 'Could not load orders.'))
      .finally(() => setIsLoading(false));
  }

  useEffect(load, []);

  const counts = useMemo(() => {
    const base: Record<OrderStatus, number> = {
      PENDING: 0,
      PROCESSING: 0,
      SHIPPED: 0,
      DELIVERED: 0,
      CANCELLED: 0,
    };
    orders.forEach((o) => {
      base[o.status] += 1;
    });
    return base;
  }, [orders]);

  const filteredOrders = activeTab === 'ALL' ? orders : orders.filter((o) => o.status === activeTab);

  return (
    <div>
      <div className="flex items-center justify-between mb-6">
        <div>
          <h1 className="text-2xl font-semibold text-[#2B2420] mb-1">Orders</h1>
          <p className="text-sm text-[#8B7B6F]">View and manage customer orders.</p>
        </div>
      </div>

      {/* Summary cards */}
      <div className="grid grid-cols-2 md:grid-cols-5 gap-4 mb-8">
        <SummaryCard icon={Clock} label="Pending" value={counts.PENDING} color="text-amber-600 bg-amber-50" />
        <SummaryCard icon={Package} label="Processing" value={counts.PROCESSING} color="text-blue-600 bg-blue-50" />
        <SummaryCard icon={Truck} label="Shipped" value={counts.SHIPPED} color="text-indigo-600 bg-indigo-50" />
        <SummaryCard icon={CheckCircle2} label="Delivered" value={counts.DELIVERED} color="text-green-600 bg-green-50" />
        <SummaryCard icon={XCircle} label="Cancelled" value={counts.CANCELLED} color="text-red-600 bg-red-50" />
      </div>

      {/* Tabs */}
      <div className="flex flex-wrap gap-2 mb-6">
        {STATUS_TABS.map((tab) => (
          <button
            key={tab.id}
            onClick={() => setActiveTab(tab.id)}
            className={`px-4 py-2 rounded-full text-sm font-medium transition-colors ${
              activeTab === tab.id ? 'bg-[#8B5E34] text-white' : 'bg-white text-[#5C5248] border border-[#E8E0D8] hover:bg-[#F5EFE3]'
            }`}
          >
            {tab.label}
            {tab.id !== 'ALL' && <span className="ml-1.5 opacity-70">({counts[tab.id as OrderStatus]})</span>}
          </button>
        ))}
      </div>

      {/* Table */}
      <div className="bg-white rounded-2xl border border-[#E8E0D8] overflow-hidden">
        {isLoading ? (
          <div className="p-10 text-center text-[#8B7B6F]">Loading orders…</div>
        ) : filteredOrders.length === 0 ? (
          <div className="p-10 text-center text-[#8B7B6F]">No orders in this category.</div>
        ) : (
          <div className="overflow-x-auto">
            <table className="w-full text-sm">
              <thead>
                <tr className="border-b border-[#E8E0D8] text-left text-xs font-semibold text-[#8B7B6F] uppercase tracking-wider">
                  <th className="px-5 py-3">Order</th>
                  <th className="px-5 py-3">Customer</th>
                  <th className="px-5 py-3">Date</th>
                  <th className="px-5 py-3">Items</th>
                  <th className="px-5 py-3">Total</th>
                  <th className="px-5 py-3">Status</th>
                  <th className="px-5 py-3"></th>
                </tr>
              </thead>
              <tbody>
                {filteredOrders.map((order) => (
                  <tr key={order._id} className="border-b border-[#E8E0D8] last:border-0 hover:bg-[#FBF7F2]">
                    <td className="px-5 py-4 font-medium text-[#2B2420]">#{order.orderNumber}</td>
                    <td className="px-5 py-4">
                      <div className="text-[#2B2420]">{customerName(order)}</div>
                      <div className="text-xs text-[#8B7B6F]">{customerEmail(order)}</div>
                    </td>
                    <td className="px-5 py-4 text-[#5C5248]">{new Date(order.created_date).toLocaleDateString()}</td>
                    <td className="px-5 py-4 text-[#5C5248]">{order.totalItems}</td>
                    <td className="px-5 py-4 font-semibold text-[#2B2420]">Rs {order.totalAmount.toLocaleString()}</td>
                    <td className="px-5 py-4">
                      <span className={`text-xs font-bold px-3 py-1.5 rounded-full ${STATUS_STYLES[order.status]}`}>
                        {ORDER_STATUS_LABELS[order.status]}
                      </span>
                    </td>
                    <td className="px-5 py-4 text-right">
                      <Link
                        href={`/dashboard/orders/${order._id ?? order.id}`}
                        className="inline-flex items-center gap-1.5 text-[#8B5E34] hover:underline text-sm font-medium"
                      >
                        <Eye size={15} /> View
                      </Link>
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        )}
      </div>

      {/* Detail / status update modal */}
    </div>
  );
}

function SummaryCard({
  icon: Icon,
  label,
  value,
  color,
}: {
  icon: React.ComponentType<{ size?: number; className?: string }>;
  label: string;
  value: number;
  color: string;
}) {
  return (
    <div className="bg-white rounded-2xl border border-[#E8E0D8] p-4">
      <div className={`w-9 h-9 rounded-xl flex items-center justify-center mb-3 ${color}`}>
        <Icon size={18} />
      </div>
      <p className="text-2xl font-bold text-[#2B2420]">{value}</p>
      <p className="text-xs text-[#8B7B6F]">{label}</p>
    </div>
  );
}
