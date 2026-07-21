'use client';

import React, { useEffect, useState } from 'react';
import Link from 'next/link';
import {
  ShoppingBag,
  Clock,
  Package,
  Truck,
  CheckCircle2,
  XCircle,
  LayoutGrid,
  Box,
  BoxIcon,
  ArrowRight,
} from 'lucide-react';
import { getAllOrders } from '@/lib/orderApi';
import { getCategories } from '@/lib/categoryApi';
import { productService } from '@/services/productService';
import { AdminOrder, OrderStatus, ORDER_STATUS_LABELS } from '@/Type/order';
import { Product } from '@/Type/product';
import { Category } from '@/Type/category';

const STATUS_STYLES: Record<OrderStatus, string> = {
  PENDING: 'bg-amber-100 text-amber-700',
  PROCESSING: 'bg-blue-100 text-blue-700',
  SHIPPED: 'bg-indigo-100 text-indigo-700',
  DELIVERED: 'bg-green-100 text-green-700',
  CANCELLED: 'bg-red-100 text-red-700',
};

function customerName(order: AdminOrder) {
  return typeof order.user === 'string' ? order.user : order.user.fullName;
}

export default function AdminDashboardPage() {
  const [orders, setOrders] = useState<AdminOrder[]>([]);
  const [categories, setCategories] = useState<Category[]>([]);
  const [products, setProducts] = useState<Product[]>([]);
  const [isLoading, setIsLoading] = useState(true);

  useEffect(() => {
    let mounted = true;
    (async () => {
      try {
        const [ordersData, categoriesRes, productsData] = await Promise.all([
          getAllOrders(),
          getCategories(),
          productService.getAllProducts(),
        ]);
        if (!mounted) return;
        setOrders(ordersData);
        setCategories(categoriesRes.data ?? []);
        setProducts(productsData);
      } catch {
        // individual sections degrade gracefully to zero state below
      } finally {
        if (mounted) setIsLoading(false);
      }
    })();
    return () => {
      mounted = false;
    };
  }, []);

  const orderCounts: Record<OrderStatus, number> = {
    PENDING: 0,
    PROCESSING: 0,
    SHIPPED: 0,
    DELIVERED: 0,
    CANCELLED: 0,
  };
  orders.forEach((o) => {
    orderCounts[o.status] += 1;
  });

  const activeProducts = products.filter((p) => p.isActive).length;
  const inactiveProducts = products.filter((p) => !p.isActive).length;

  const recentOrders = [...orders]
    .sort((a, b) => new Date(b.created_date).getTime() - new Date(a.created_date).getTime())
    .slice(0, 6);

  return (
    <div>
      <div className="mb-8">
        <h1 className="text-2xl font-semibold text-[#2B2420] mb-1">Dashboard</h1>
        <p className="text-sm text-[#8B7B6F]">Welcome back to the FurniNest admin panel.</p>
      </div>

      {/* Orders overview */}
      <div className="flex items-center justify-between mb-4">
        <h2 className="text-sm font-semibold text-[#8B7B6F] uppercase tracking-wider">Orders</h2>
        <Link href="/dashboard/orders" className="text-sm text-[#8B5E34] font-medium flex items-center gap-1 hover:underline">
          Manage orders <ArrowRight size={14} />
        </Link>
      </div>
      <div className="grid grid-cols-2 md:grid-cols-3 lg:grid-cols-6 gap-4 mb-10">
        <StatCard icon={ShoppingBag} label="Total Orders" value={orders.length} loading={isLoading} accent="bg-[#8B5E34]/10 text-[#8B5E34]" />
        <StatCard icon={Clock} label="Pending" value={orderCounts.PENDING} loading={isLoading} accent="bg-amber-50 text-amber-600" />
        <StatCard icon={Package} label="Processing" value={orderCounts.PROCESSING} loading={isLoading} accent="bg-blue-50 text-blue-600" />
        <StatCard icon={Truck} label="Shipped" value={orderCounts.SHIPPED} loading={isLoading} accent="bg-indigo-50 text-indigo-600" />
        <StatCard icon={CheckCircle2} label="Delivered" value={orderCounts.DELIVERED} loading={isLoading} accent="bg-green-50 text-green-600" />
        <StatCard icon={XCircle} label="Cancelled" value={orderCounts.CANCELLED} loading={isLoading} accent="bg-red-50 text-red-600" />
      </div>

      {/* Catalog overview */}
      <div className="flex items-center justify-between mb-4">
        <h2 className="text-sm font-semibold text-[#8B7B6F] uppercase tracking-wider">Catalog</h2>
      </div>
      <div className="grid grid-cols-2 md:grid-cols-4 gap-4 mb-10">
        <StatCard icon={LayoutGrid} label="Total Categories" value={categories.length} loading={isLoading} accent="bg-[#8B5E34]/10 text-[#8B5E34]" href="/dashboard/category" />
        <StatCard icon={Box} label="Total Products" value={products.length} loading={isLoading} accent="bg-[#8B5E34]/10 text-[#8B5E34]" href="/dashboard/products" />
        <StatCard icon={BoxIcon} label="Active Products" value={activeProducts} loading={isLoading} accent="bg-green-50 text-green-600" href="/dashboard/products" />
        <StatCard icon={BoxIcon} label="Inactive Products" value={inactiveProducts} loading={isLoading} accent="bg-red-50 text-red-600" href="/dashboard/products" />
      </div>

      {/* Recent orders */}
      <div className="bg-white rounded-2xl border border-[#E8E0D8] overflow-hidden">
        <div className="px-5 py-4 border-b border-[#E8E0D8] flex items-center justify-between">
          <h2 className="font-semibold text-[#2B2420]">Recent Orders</h2>
          <Link href="/dashboard/orders" className="text-sm text-[#8B5E34] font-medium hover:underline">
            View all
          </Link>
        </div>
        {isLoading ? (
          <div className="p-10 text-center text-[#8B7B6F]">Loading…</div>
        ) : recentOrders.length === 0 ? (
          <div className="p-10 text-center text-[#8B7B6F]">No orders yet.</div>
        ) : (
          <div className="overflow-x-auto">
            <table className="w-full text-sm">
              <thead>
                <tr className="text-left text-xs font-semibold text-[#8B7B6F] uppercase tracking-wider border-b border-[#E8E0D8]">
                  <th className="px-5 py-3">Order</th>
                  <th className="px-5 py-3">Customer</th>
                  <th className="px-5 py-3">Date</th>
                  <th className="px-5 py-3">Total</th>
                  <th className="px-5 py-3">Status</th>
                </tr>
              </thead>
              <tbody>
                {recentOrders.map((order) => (
                  <tr key={order._id} className="border-b border-[#E8E0D8] last:border-0 hover:bg-[#FBF7F2]">
                    <td className="px-5 py-3.5 font-medium text-[#2B2420]">#{order.orderNumber}</td>
                    <td className="px-5 py-3.5 text-[#5C5248]">{customerName(order)}</td>
                    <td className="px-5 py-3.5 text-[#5C5248]">{new Date(order.created_date).toLocaleDateString()}</td>
                    <td className="px-5 py-3.5 font-semibold text-[#2B2420]">Rs {order.totalAmount.toLocaleString()}</td>
                    <td className="px-5 py-3.5">
                      <span className={`text-xs font-bold px-3 py-1 rounded-full ${STATUS_STYLES[order.status]}`}>
                        {ORDER_STATUS_LABELS[order.status]}
                      </span>
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        )}
      </div>
    </div>
  );
}

function StatCard({
  icon: Icon,
  label,
  value,
  accent,
  loading,
  href,
}: {
  icon: React.ComponentType<{ size?: number; className?: string }>;
  label: string;
  value: number;
  accent: string;
  loading?: boolean;
  href?: string;
}) {
  const content = (
    <div className="bg-white rounded-2xl border border-[#E8E0D8] p-4 h-full transition-transform hover:-translate-y-0.5">
      <div className={`w-9 h-9 rounded-xl flex items-center justify-center mb-3 ${accent}`}>
        <Icon size={18} />
      </div>
      <p className="text-2xl font-bold text-[#2B2420]">{loading ? '—' : value}</p>
      <p className="text-xs text-[#8B7B6F]">{label}</p>
    </div>
  );

  return href ? <Link href={href}>{content}</Link> : content;
}
