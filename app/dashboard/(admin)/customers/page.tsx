'use client';

import React, { useEffect, useMemo, useState } from 'react';
import { Button } from '@/components/ui/button';
import CustomerTable from '@/components/admin/customer/CustomerTable';
import { userService } from '@/services/userService';
import { User } from '@/Type/user';

const PAGE_LIMIT = 20;

export default function CustomersPage() {
  const [customers, setCustomers] = useState<User[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState('');
  const [search, setSearch] = useState('');
  const [statusFilter, setStatusFilter] = useState<'ALL' | 'ACTIVE' | 'BLOCKED'>('ALL');
  const [page, setPage] = useState(1);
  const [totalPages, setTotalPages] = useState(1);

  useEffect(() => {
    loadCustomers(page, search);
  }, [page, search]);

  async function loadCustomers(pageNumber: number, query: string) {
    setLoading(true);
    setError('');

    try {
      const { data, meta } = await userService.getUsers(pageNumber, PAGE_LIMIT, query);
      setCustomers(data);
      setTotalPages(meta.totalPages);
    } catch (err) {
      setError(err instanceof Error ? err.message : 'Could not load customers.');
    } finally {
      setLoading(false);
    }
  }

  const filteredCustomers = useMemo(() => {
    if (statusFilter === 'ALL') return customers;
    return customers.filter((customer) => (statusFilter === 'ACTIVE' ? customer.isActive : !customer.isActive));
  }, [customers, statusFilter]);

  const handleSearchChange = (value: string) => {
    setSearch(value);
    setPage(1);
  };

  const handleToggleStatus = async (customer: User) => {
    const nextState = !customer.isActive;
    const confirmText = nextState ? 'Activate this customer?' : 'Block this customer?';
    if (!window.confirm(confirmText)) return;

    try {
      setLoading(true);
      await userService.updateUserStatus(customer._id ?? customer.id, nextState);
      setCustomers((prev) => prev.map((item) => (item._id === customer._id ? { ...item, isActive: nextState } : item)));
    } catch (err) {
      setError(err instanceof Error ? err.message : 'Could not change customer status.');
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="space-y-6">
      <div className="flex flex-col gap-3 md:flex-row md:items-center md:justify-between">
        <div>
          <h1 className="text-2xl font-semibold text-[#2B2420]">Customers</h1>
          <p className="text-sm text-[#8B7B6F]">Manage your customer accounts and statuses.</p>
        </div>
        <div className="rounded-3xl bg-[#FBF7F2] p-4 text-sm text-[#5C5248]">
          Showing {filteredCustomers.length} of {customers.length} customers
        </div>
      </div>

      <CustomerTable
        customers={filteredCustomers}
        loading={loading}
        error={error}
        search={search}
        statusFilter={statusFilter}
        page={page}
        totalPages={totalPages}
        onSearchChange={handleSearchChange}
        onStatusFilterChange={setStatusFilter}
        onPageChange={setPage}
        onToggleStatus={handleToggleStatus}
      />
    </div>
  );
}
