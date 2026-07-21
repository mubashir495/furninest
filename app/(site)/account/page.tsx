'use client';

import React, { useEffect, useState } from 'react';
import Link from 'next/link';
import { Package, MapPin, Heart, ShoppingBag, ArrowRight } from 'lucide-react';
import { useAuth } from '@/context/AuthContext';
import { useCartStore } from '@/store/cartStore';
import { useWishlistStore } from '@/store/wishlistStore';
import { orderService } from '@/services/orderService';
import { Order, ORDER_STATUS_LABELS } from '@/Type/order';
import { usePageTitle } from '@/hooks/usePageTitle';

export default function AccountOverviewPage() {
  usePageTitle('My Account');
  const { user } = useAuth();
  const { cart, hasLoaded: cartLoaded, fetchCart } = useCartStore();
  const { items: wishlistItems, hasLoaded: wishlistLoaded, fetchWishlist } = useWishlistStore();
  const [recentOrders, setRecentOrders] = useState<Order[]>([]);
  const [isLoadingOrders, setIsLoadingOrders] = useState(true);

  useEffect(() => {
    if (!cartLoaded) fetchCart();
    if (!wishlistLoaded) fetchWishlist();
    orderService
      .getMyOrders()
      .then((orders) => setRecentOrders(orders.slice(0, 3)))
      .catch(() => setRecentOrders([]))
      .finally(() => setIsLoadingOrders(false));
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, []);

  const stats = [
    { label: 'Cart Items', value: cart?.totalItems ?? 0, icon: ShoppingBag, href: '/cart' },
    { label: 'Wishlist', value: wishlistItems.length, icon: Heart, href: '/wishlist' },
    { label: 'Total Orders', value: recentOrders.length, icon: Package, href: '/account/orders' },
    { label: 'Saved Addresses', value: '—', icon: MapPin, href: '/account/addresses' },
  ];

  return (
    <div>
      <h1 className="text-3xl md:text-4xl font-serif text-primary mb-2">Welcome back, {user?.fullName?.split(' ')[0]}</h1>
      <p className="text-muted-foreground mb-10">Here&apos;s a quick look at your account.</p>

      <div className="grid grid-cols-2 lg:grid-cols-4 gap-4 mb-10">
        {stats.map((stat) => (
          <Link key={stat.label} href={stat.href} className="bg-card p-6 rounded-3xl soft-shadow hover:-translate-y-1 transition-transform">
            <stat.icon size={22} className="text-accent mb-3" />
            <div className="text-2xl font-bold text-primary">{stat.value}</div>
            <div className="text-sm text-muted-foreground">{stat.label}</div>
          </Link>
        ))}
      </div>

      <div className="bg-card rounded-3xl soft-shadow p-6">
        <div className="flex items-center justify-between mb-6">
          <h2 className="text-xl font-serif text-primary">Recent Orders</h2>
          <Link href="/account/orders" className="text-sm text-accent font-medium flex items-center gap-1 hover:underline">
            View all <ArrowRight size={14} />
          </Link>
        </div>

        {isLoadingOrders ? (
          <div className="space-y-3">
            {[1, 2].map((i) => (
              <div key={i} className="h-16 bg-muted animate-pulse rounded-2xl"></div>
            ))}
          </div>
        ) : recentOrders.length === 0 ? (
          <p className="text-muted-foreground text-sm py-8 text-center">
            No orders yet.{' '}
            <Link href="/shop" className="text-accent hover:underline">
              Start shopping
            </Link>
          </p>
        ) : (
          <div className="space-y-3">
            {recentOrders.map((order) => (
              <Link
                key={order._id}
                href={`/account/orders/${order._id}`}
                className="flex items-center justify-between p-4 bg-muted/30 rounded-2xl hover:bg-muted/60 transition-colors"
              >
                <div>
                  <p className="font-medium text-primary">#{order.orderNumber}</p>
                  <p className="text-xs text-muted-foreground">{new Date(order.created_date).toLocaleDateString()}</p>
                </div>
                <div className="text-right">
                  <p className="font-semibold text-primary">Rs {order.totalAmount.toLocaleString()}</p>
                  <p className="text-xs text-muted-foreground">{ORDER_STATUS_LABELS[order.status]}</p>
                </div>
              </Link>
            ))}
          </div>
        )}
      </div>
    </div>
  );
}
