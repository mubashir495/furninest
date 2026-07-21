'use client';

import React, { useEffect, useState } from 'react';
import Link from 'next/link';
import { useRouter } from 'next/navigation';
import { Check, Plus } from 'lucide-react';
import { toast } from 'sonner';
import { useAuth } from '@/context/AuthContext';
import { useCartStore } from '@/store/cartStore';
import { addressService } from '@/services/addressService';
import { orderService } from '@/services/orderService';
import { ShippingAddress, ShippingAddressInput } from '@/Type/address';
import { PaymentMethod } from '@/Type/order';
import { usePageTitle } from '@/hooks/usePageTitle';

const emptyAddressForm: ShippingAddressInput = {
  label: 'Home',
  fullName: '',
  phone: '',
  addressLine1: '',
  addressLine2: '',
  city: '',
  state: '',
  postalCode: '',
  country: 'Pakistan',
};

export default function CheckoutPage() {
  usePageTitle('Checkout');
  const router = useRouter();
  const { isAuthenticated, isLoading: authLoading } = useAuth();
  const { cart, hasLoaded, fetchCart, clearCart } = useCartStore();

  const [addresses, setAddresses] = useState<ShippingAddress[]>([]);
  const [selectedAddressId, setSelectedAddressId] = useState<string | null>(null);
  const [showNewAddressForm, setShowNewAddressForm] = useState(false);
  const [newAddress, setNewAddress] = useState<ShippingAddressInput>(emptyAddressForm);
  const [paymentMethod, setPaymentMethod] = useState<PaymentMethod>('COD');
  const [notes, setNotes] = useState('');
  const [isLoadingAddresses, setIsLoadingAddresses] = useState(true);
  const [isPlacing, setIsPlacing] = useState(false);

  useEffect(() => {
    if (isAuthenticated && !hasLoaded) fetchCart();
  }, [isAuthenticated, hasLoaded, fetchCart]);

  useEffect(() => {
    if (!isAuthenticated) return;
    addressService
      .getAddresses()
      .then((addrs) => {
        setAddresses(addrs);
        const def = addrs.find((a) => a.isDefault) ?? addrs[0];
        if (def) setSelectedAddressId(def._id);
        else setShowNewAddressForm(true);
      })
      .catch((err) => toast.error(err instanceof Error ? err.message : 'Could not load addresses.'))
      .finally(() => setIsLoadingAddresses(false));
  }, [isAuthenticated]);

  if (authLoading) return null;

  if (!isAuthenticated) {
    return (
      <div className="min-h-[60vh] flex flex-col items-center justify-center text-center px-6">
        <h1 className="text-3xl font-serif text-primary mb-4">Log in to check out</h1>
        <Link href="/auth/login" className="bg-primary text-primary-foreground px-10 py-4 rounded-2xl font-bold uppercase tracking-wider hover:bg-accent hover:text-accent-foreground transition-colors">
          Log In
        </Link>
      </div>
    );
  }

  const items = cart?.items ?? [];

  if (hasLoaded && items.length === 0) {
    return (
      <div className="min-h-[60vh] flex flex-col items-center justify-center text-center px-6">
        <h1 className="text-3xl font-serif text-primary mb-4">Your bag is empty</h1>
        <Link href="/shop" className="bg-primary text-primary-foreground px-10 py-4 rounded-2xl font-bold uppercase tracking-wider hover:bg-accent hover:text-accent-foreground transition-colors">
          Continue Shopping
        </Link>
      </div>
    );
  }

  async function handlePlaceOrder() {
    if (!selectedAddressId && !showNewAddressForm) {
      toast.error('Please select or add a shipping address.');
      return;
    }
    if (showNewAddressForm) {
      const required = [
        newAddress.fullName,
        newAddress.phone,
        newAddress.addressLine1,
        newAddress.city,
        newAddress.state,
        newAddress.postalCode,
      ];
      if (required.some((f) => !f?.trim())) {
        toast.error('Please fill in all required address fields.');
        return;
      }
    }

    setIsPlacing(true);
    try {
      const order = await orderService.checkout({
        ...(showNewAddressForm
          ? { shippingAddress: { ...newAddress, label: newAddress.label || 'Home' } }
          : { shippingAddressId: selectedAddressId! }),
        paymentMethod,
        notes: notes || undefined,
      });
      await clearCart();
      toast.success('Order placed successfully!');
      router.push(`/order-success?orderId=${order._id}`);
    } catch (err) {
      toast.error(err instanceof Error ? err.message : 'Could not place your order.');
    } finally {
      setIsPlacing(false);
    }
  }

  return (
    <div className="pt-12 pb-24 container mx-auto px-6">
      <h1 className="text-4xl md:text-5xl font-serif text-primary mb-12">Checkout</h1>

      <div className="flex flex-col lg:flex-row gap-12">
        <div className="w-full lg:w-2/3 space-y-8">
          {/* Shipping Address */}
          <div className="bg-card rounded-3xl soft-shadow p-6">
            <div className="flex items-center justify-between mb-6">
              <h2 className="text-xl font-serif text-primary">Shipping Address</h2>
              <button
                onClick={() => setShowNewAddressForm(!showNewAddressForm)}
                className="flex items-center gap-1 text-sm text-accent font-medium hover:underline"
              >
                <Plus size={14} /> {showNewAddressForm ? 'Use existing address' : 'Add new address'}
              </button>
            </div>

            {isLoadingAddresses ? (
              <div className="h-24 bg-muted animate-pulse rounded-2xl"></div>
            ) : showNewAddressForm ? (
              <div className="grid sm:grid-cols-2 gap-4">
                <AField label="Full Name" value={newAddress.fullName} onChange={(v) => setNewAddress({ ...newAddress, fullName: v })} required />
                <AField label="Phone" value={newAddress.phone} onChange={(v) => setNewAddress({ ...newAddress, phone: v })} required />
                <div className="sm:col-span-2">
                  <AField label="Address Line 1" value={newAddress.addressLine1} onChange={(v) => setNewAddress({ ...newAddress, addressLine1: v })} required />
                </div>
                <div className="sm:col-span-2">
                  <AField label="Address Line 2 (optional)" value={newAddress.addressLine2 ?? ''} onChange={(v) => setNewAddress({ ...newAddress, addressLine2: v })} />
                </div>
                <AField label="City" value={newAddress.city} onChange={(v) => setNewAddress({ ...newAddress, city: v })} required />
                <AField label="State" value={newAddress.state} onChange={(v) => setNewAddress({ ...newAddress, state: v })} required />
                <AField label="Postal Code" value={newAddress.postalCode} onChange={(v) => setNewAddress({ ...newAddress, postalCode: v })} required />
                <AField label="Country" value={newAddress.country} onChange={(v) => setNewAddress({ ...newAddress, country: v })} required />
              </div>
            ) : addresses.length === 0 ? (
              <p className="text-sm text-muted-foreground">No saved addresses. Add one to continue.</p>
            ) : (
              <div className="grid sm:grid-cols-2 gap-4">
                {addresses.map((addr) => (
                  <button
                    key={addr._id}
                    onClick={() => setSelectedAddressId(addr._id)}
                    className={`text-left p-4 rounded-2xl border-2 transition-colors ${
                      selectedAddressId === addr._id ? 'border-primary bg-primary/5' : 'border-border hover:border-primary/40'
                    }`}
                  >
                    <div className="flex items-center justify-between mb-1">
                      <span className="font-bold text-primary text-sm">{addr.label}</span>
                      {selectedAddressId === addr._id && <Check size={16} className="text-primary" />}
                    </div>
                    <p className="text-sm text-muted-foreground">{addr.fullName} · {addr.phone}</p>
                    <p className="text-xs text-muted-foreground mt-1">
                      {addr.addressLine1}, {addr.city}, {addr.state} {addr.postalCode}
                    </p>
                  </button>
                ))}
              </div>
            )}
          </div>

          {/* Payment Method */}
          <div className="bg-card rounded-3xl soft-shadow p-6">
            <h2 className="text-xl font-serif text-primary mb-6">Payment Method</h2>
            <div className="grid grid-cols-2 gap-4">
              {(['COD', 'CARD'] as PaymentMethod[]).map((method) => (
                <button
                  key={method}
                  onClick={() => setPaymentMethod(method)}
                  className={`p-4 rounded-2xl border-2 font-medium text-sm transition-colors ${
                    paymentMethod === method ? 'border-primary bg-primary/5 text-primary' : 'border-border text-muted-foreground hover:border-primary/40'
                  }`}
                >
                  {method === 'COD' ? 'Cash on Delivery' : 'Credit / Debit Card'}
                </button>
              ))}
            </div>
          </div>

          {/* Notes */}
          <div className="bg-card rounded-3xl soft-shadow p-6">
            <h2 className="text-xl font-serif text-primary mb-4">Order Notes (optional)</h2>
            <textarea
              value={notes}
              onChange={(e) => setNotes(e.target.value)}
              rows={3}
              placeholder="Delivery instructions, preferred time, etc."
              className="w-full bg-muted/40 border border-border rounded-xl px-4 py-3 focus:outline-none focus:border-primary transition-colors text-sm resize-none"
            />
          </div>
        </div>

        {/* Summary */}
        <div className="w-full lg:w-1/3">
          <div className="bg-primary text-primary-foreground p-8 rounded-3xl sticky top-32">
            <h2 className="text-2xl font-serif mb-8">Order Summary</h2>

            <div className="space-y-3 mb-6 max-h-64 overflow-y-auto pr-1">
              {items.map((item) => (
                <div key={item._id} className="flex justify-between text-sm text-white/80">
                  <span>{item.product.name} × {item.quantity}</span>
                  <span className="text-white font-medium">Rs {item.subtotal.toLocaleString()}</span>
                </div>
              ))}
            </div>

            <div className="border-t border-white/20 pt-6 mb-8 flex justify-between items-end">
              <span className="text-lg">Total</span>
              <span className="text-4xl font-bold font-serif text-accent">Rs {(cart?.totalPrice ?? 0).toLocaleString()}</span>
            </div>

            <button
              onClick={handlePlaceOrder}
              disabled={isPlacing || items.length === 0}
              className="w-full bg-accent text-accent-foreground py-4 rounded-2xl font-bold uppercase tracking-wider hover:bg-white transition-colors disabled:opacity-50"
            >
              {isPlacing ? 'Placing Order…' : 'Place Order'}
            </button>
          </div>
        </div>
      </div>
    </div>
  );
}

function AField({
  label,
  value,
  onChange,
  required,
}: {
  label: string;
  value: string;
  onChange: (v: string) => void;
  required?: boolean;
}) {
  return (
    <div>
      <label className="text-sm font-medium text-primary mb-1.5 block">{label}</label>
      <input
        type="text"
        required={required}
        value={value}
        onChange={(e) => onChange(e.target.value)}
        className="w-full bg-muted/40 border border-border rounded-xl px-4 py-2.5 focus:outline-none focus:border-primary transition-colors text-sm"
      />
    </div>
  );
}
