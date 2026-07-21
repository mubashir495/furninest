'use client';

import React, { useEffect, useState } from 'react';
import { Plus, Pencil, Trash2, Star, X } from 'lucide-react';
import { toast } from 'sonner';
import { addressService } from '@/services/addressService';
import { ShippingAddress, ShippingAddressInput } from '@/Type/address';
import { usePageTitle } from '@/hooks/usePageTitle';

const emptyForm: ShippingAddressInput = {
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

export default function AddressesPage() {
  usePageTitle('My Addresses');
  const [addresses, setAddresses] = useState<ShippingAddress[]>([]);
  const [isLoading, setIsLoading] = useState(true);
  const [isFormOpen, setIsFormOpen] = useState(false);
  const [editingId, setEditingId] = useState<string | null>(null);
  const [form, setForm] = useState<ShippingAddressInput>(emptyForm);
  const [saving, setSaving] = useState(false);

  function load() {
    setIsLoading(true);
    addressService
      .getAddresses()
      .then(setAddresses)
      .catch((err) => toast.error(err instanceof Error ? err.message : 'Could not load addresses.'))
      .finally(() => setIsLoading(false));
  }

  useEffect(load, []);

  function openCreate() {
    setEditingId(null);
    setForm(emptyForm);
    setIsFormOpen(true);
  }

  function openEdit(addr: ShippingAddress) {
    setEditingId(addr._id);
    setForm({
      label: addr.label,
      fullName: addr.fullName,
      phone: addr.phone,
      addressLine1: addr.addressLine1,
      addressLine2: addr.addressLine2 ?? '',
      city: addr.city,
      state: addr.state,
      postalCode: addr.postalCode,
      country: addr.country,
    });
    setIsFormOpen(true);
  }

  async function handleSubmit(e: React.FormEvent) {
    e.preventDefault();
    setSaving(true);
    try {
      if (editingId) {
        await addressService.updateAddress(editingId, form);
        toast.success('Address updated');
      } else {
        await addressService.createAddress(form);
        toast.success('Address added');
      }
      setIsFormOpen(false);
      load();
    } catch (err) {
      toast.error(err instanceof Error ? err.message : 'Could not save address.');
    } finally {
      setSaving(false);
    }
  }

  async function handleDelete(id: string) {
    if (!confirm('Delete this address?')) return;
    try {
      await addressService.deleteAddress(id);
      toast.success('Address deleted');
      load();
    } catch (err) {
      toast.error(err instanceof Error ? err.message : 'Could not delete address.');
    }
  }

  async function handleSetDefault(id: string) {
    try {
      await addressService.setDefault(id);
      toast.success('Default address updated');
      load();
    } catch (err) {
      toast.error(err instanceof Error ? err.message : 'Could not set default.');
    }
  }

  return (
    <div>
      <div className="flex items-center justify-between mb-10">
        <div>
          <h1 className="text-3xl font-serif text-primary mb-2">My Addresses</h1>
          <p className="text-muted-foreground">Manage your shipping addresses.</p>
        </div>
        <button
          onClick={openCreate}
          className="flex items-center gap-2 bg-primary text-primary-foreground px-5 py-2.5 rounded-2xl font-medium hover:bg-accent hover:text-accent-foreground transition-colors"
        >
          <Plus size={18} /> Add Address
        </button>
      </div>

      {isLoading ? (
        <div className="grid sm:grid-cols-2 gap-4">
          {[1, 2].map((i) => (
            <div key={i} className="h-40 bg-muted animate-pulse rounded-3xl"></div>
          ))}
        </div>
      ) : addresses.length === 0 ? (
        <div className="bg-card rounded-3xl soft-shadow p-12 text-center text-muted-foreground">
          No addresses saved yet.
        </div>
      ) : (
        <div className="grid sm:grid-cols-2 gap-4">
          {addresses.map((addr) => (
            <div key={addr._id} className="bg-card rounded-3xl soft-shadow p-6 relative">
              {addr.isDefault && (
                <span className="absolute top-4 right-4 bg-accent text-accent-foreground text-xs font-bold px-3 py-1 rounded-full flex items-center gap-1">
                  <Star size={10} className="fill-primary" /> Default
                </span>
              )}
              <p className="font-bold text-primary mb-1">{addr.label}</p>
              <p className="text-sm text-muted-foreground">{addr.fullName}</p>
              <p className="text-sm text-muted-foreground">{addr.phone}</p>
              <p className="text-sm text-muted-foreground mt-2">
                {addr.addressLine1}
                {addr.addressLine2 ? `, ${addr.addressLine2}` : ''}
                <br />
                {addr.city}, {addr.state} {addr.postalCode}
                <br />
                {addr.country}
              </p>
              <div className="flex gap-2 mt-4">
                <button onClick={() => openEdit(addr)} className="flex items-center gap-1 text-sm text-primary hover:underline">
                  <Pencil size={14} /> Edit
                </button>
                <button onClick={() => handleDelete(addr._id)} className="flex items-center gap-1 text-sm text-destructive hover:underline">
                  <Trash2 size={14} /> Delete
                </button>
                {!addr.isDefault && (
                  <button onClick={() => handleSetDefault(addr._id)} className="flex items-center gap-1 text-sm text-accent hover:underline ml-auto">
                    Set Default
                  </button>
                )}
              </div>
            </div>
          ))}
        </div>
      )}

      {isFormOpen && (
        <div className="fixed inset-0 bg-black/50 z-50 flex items-center justify-center p-6" onClick={() => setIsFormOpen(false)}>
          <div className="bg-card rounded-3xl p-8 max-w-lg w-full max-h-[85vh] overflow-y-auto" onClick={(e) => e.stopPropagation()}>
            <div className="flex items-center justify-between mb-6">
              <h2 className="text-2xl font-serif text-primary">{editingId ? 'Edit Address' : 'Add Address'}</h2>
              <button onClick={() => setIsFormOpen(false)} className="p-2 hover:bg-muted rounded-full">
                <X size={20} />
              </button>
            </div>

            <form onSubmit={handleSubmit} className="space-y-4">
              <div className="grid grid-cols-2 gap-4">
                <Field label="Label" value={form.label} onChange={(v) => setForm({ ...form, label: v })} placeholder="Home, Office…" />
                <Field label="Full Name" value={form.fullName} onChange={(v) => setForm({ ...form, fullName: v })} required />
              </div>
              <Field label="Phone" value={form.phone} onChange={(v) => setForm({ ...form, phone: v })} required />
              <Field label="Address Line 1" value={form.addressLine1} onChange={(v) => setForm({ ...form, addressLine1: v })} required />
              <Field label="Address Line 2 (optional)" value={form.addressLine2 ?? ''} onChange={(v) => setForm({ ...form, addressLine2: v })} />
              <div className="grid grid-cols-2 gap-4">
                <Field label="City" value={form.city} onChange={(v) => setForm({ ...form, city: v })} required />
                <Field label="State" value={form.state} onChange={(v) => setForm({ ...form, state: v })} required />
              </div>
              <div className="grid grid-cols-2 gap-4">
                <Field label="Postal Code" value={form.postalCode} onChange={(v) => setForm({ ...form, postalCode: v })} required />
                <Field label="Country" value={form.country} onChange={(v) => setForm({ ...form, country: v })} required />
              </div>

              <button
                type="submit"
                disabled={saving}
                className="w-full bg-primary text-primary-foreground py-3.5 rounded-2xl font-bold uppercase tracking-wider hover:bg-accent hover:text-accent-foreground transition-colors disabled:opacity-50 mt-4"
              >
                {saving ? 'Saving…' : editingId ? 'Update Address' : 'Save Address'}
              </button>
            </form>
          </div>
        </div>
      )}
    </div>
  );
}

function Field({
  label,
  value,
  onChange,
  required,
  placeholder,
}: {
  label: string;
  value: string;
  onChange: (v: string) => void;
  required?: boolean;
  placeholder?: string;
}) {
  return (
    <div>
      <label className="text-sm font-medium text-primary mb-1.5 block">{label}</label>
      <input
        type="text"
        required={required}
        placeholder={placeholder}
        value={value}
        onChange={(e) => onChange(e.target.value)}
        className="w-full bg-muted/40 border border-border rounded-xl px-4 py-2.5 focus:outline-none focus:border-primary transition-colors text-sm"
      />
    </div>
  );
}
