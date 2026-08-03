'use client';

import { FormEvent, useState } from 'react';
import Link from 'next/link';
import { Search, ChevronLeft, ChevronRight, User, CheckCircle2, Slash } from 'lucide-react';
import { Button } from '@/components/ui/button';
import { User as UserType } from '@/Type/user';
import { formatDate } from '@/utils/validators';
import { EmptyState } from '@/components/ui/EmptyState';
import { LoadingSkeleton } from '@/components/ui/LoadingSkeleton';

interface CustomerTableProps {
  customers: UserType[];
  loading: boolean;
  error?: string;
  search: string;
  statusFilter: 'ALL' | 'ACTIVE' | 'BLOCKED';
  page: number;
  totalPages: number;
  onSearchChange: (value: string) => void;
  onStatusFilterChange: (value: 'ALL' | 'ACTIVE' | 'BLOCKED') => void;
  onPageChange: (page: number) => void;
  onToggleStatus: (customer: UserType) => void;
}

export default function CustomerTable({
  customers,
  loading,
  error,
  search,
  statusFilter,
  page,
  totalPages,
  onSearchChange,
  onStatusFilterChange,
  onPageChange,
  onToggleStatus,
}: CustomerTableProps) {
  const [searchInput, setSearchInput] = useState(search);

  const handleSearch = (event: FormEvent<HTMLFormElement>) => {
    event.preventDefault();
    onSearchChange(searchInput);
  };

  return (
    <div className="space-y-4">
      <div className="flex flex-col gap-4 md:flex-row md:items-center md:justify-between">
        <form onSubmit={handleSearch} className="flex flex-1 items-center gap-2">
          <div className="relative flex-1">
            <Search className="pointer-events-none absolute left-3 top-1/2 h-4 w-4 -translate-y-1/2 text-[#8B7B6F]" />
            <input
              type="text"
              value={searchInput}
              onChange={(event) => setSearchInput(event.target.value)}
              placeholder="Search by name, email, or order id"
              className="w-full rounded-full border border-[#E8E0D8] bg-white py-2.5 pl-10 pr-4 text-sm text-[#2B2420] outline-none transition focus:border-[#8B5E34] focus:ring-2 focus:ring-[#8B5E34]/20"
            />
          </div>
          <Button type="submit" variant="default" size="sm">
            Search
          </Button>
        </form>

        <div className="inline-flex items-center gap-2 rounded-full border border-[#E8E0D8] bg-white p-1 text-sm text-[#5C5248]">
          <button
            type="button"
            className={`rounded-full px-3 py-2 transition ${statusFilter === 'ALL' ? 'bg-[#8B5E34] text-white' : 'hover:bg-[#F5EFE3]'}`}
            onClick={() => onStatusFilterChange('ALL')}
          >
            All
          </button>
          <button
            type="button"
            className={`rounded-full px-3 py-2 transition ${statusFilter === 'ACTIVE' ? 'bg-[#8B5E34] text-white' : 'hover:bg-[#F5EFE3]'}`}
            onClick={() => onStatusFilterChange('ACTIVE')}
          >
            Active
          </button>
          <button
            type="button"
            className={`rounded-full px-3 py-2 transition ${statusFilter === 'BLOCKED' ? 'bg-[#8B5E34] text-white' : 'hover:bg-[#F5EFE3]'}`}
            onClick={() => onStatusFilterChange('BLOCKED')}
          >
            Blocked
          </button>
        </div>
      </div>

      {error ? (
        <div className="rounded-3xl border border-red-200 bg-red-50 p-6 text-sm text-red-700">
          {error}
        </div>
      ) : loading ? (
        <LoadingSkeleton rows={5} />
      ) : customers.length === 0 ? (
        <EmptyState
          title="No customers found"
          description="Search again or adjust the filters to find customers."
          icon={User}
        />
      ) : (
        <div className="overflow-x-auto rounded-3xl border border-[#E8E0D8] bg-white">
          <table className="min-w-full text-sm text-[#2B2420]">
            <thead className="border-b border-[#E8E0D8] bg-[#FBF7F2] text-left text-xs uppercase tracking-wider text-[#8B7B6F]">
              <tr>
                <th className="px-5 py-3">Customer</th>
                <th className="px-5 py-3">Email</th>
                <th className="px-5 py-3">Phone</th>
                <th className="px-5 py-3">Joined</th>
                <th className="px-5 py-3">Status</th>
                <th className="px-5 py-3 text-right">Actions</th>
              </tr>
            </thead>
            <tbody>
              {customers.map((customer) => (
                <tr key={customer._id ?? customer.id} className="border-b border-[#E8E0D8] last:border-0 hover:bg-[#FBF7F2]">
                  <td className="px-5 py-4">
                    <div className="flex items-center gap-3">
                      <div className="flex h-10 w-10 items-center justify-center rounded-2xl bg-[#F5EFE3] text-[#8B5E34]">
                        {customer.fullName?.charAt(0).toUpperCase() ?? 'U'}
                      </div>
                      <div>
                        <p className="font-medium text-[#2B2420]">{customer.fullName}</p>
                        <p className="text-xs text-[#8B7B6F]">{customer.role.toLowerCase()}</p>
                      </div>
                    </div>
                  </td>
                  <td className="px-5 py-4 text-[#5C5248]">{customer.email}</td>
                  <td className="px-5 py-4 text-[#5C5248]">{customer.phone ?? '—'}</td>
                  <td className="px-5 py-4 text-[#5C5248]">{customer.created_date ? formatDate(customer.created_date) : '—'}</td>
                  <td className="px-5 py-4">
                    <span className={`inline-flex rounded-full px-3 py-1 text-xs font-semibold ${customer.isActive ? 'bg-green-100 text-green-700' : 'bg-red-100 text-red-700'}`}>
                      {customer.isActive ? 'Active' : 'Blocked'}
                    </span>
                  </td>
                  <td className="px-5 py-4 text-right">
                    <div className="flex flex-wrap justify-end gap-2">
                      <Link
                        href={`/dashboard/customers/${customer._id ?? customer.id}`}
                        className="inline-flex items-center rounded-full border border-[#E8E0D8] bg-white px-3 py-2 text-xs font-medium text-[#8B5E34] transition hover:bg-[#F5EFE3]"
                      >
                        View
                      </Link>
                      <button
                        type="button"
                        onClick={() => onToggleStatus(customer)}
                        className="inline-flex items-center gap-1 rounded-full bg-[#8B5E34] px-3 py-2 text-xs font-medium text-white transition hover:bg-[#6E4A29]"
                      >
                        {customer.isActive ? <Slash size={12} /> : <CheckCircle2 size={12} />}
                        {customer.isActive ? 'Block' : 'Activate'}
                      </button>
                    </div>
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      )}

      {customers.length > 0 && (
        <div className="flex flex-col gap-3 rounded-3xl border border-[#E8E0D8] bg-white p-4 md:flex-row md:items-center md:justify-between">
          <div className="text-sm text-[#8B7B6F]">
            Page {page} of {totalPages}
          </div>
          <div className="flex items-center justify-end gap-2">
            <Button
              type="button"
              variant="outline"
              size="sm"
              disabled={page <= 1}
              onClick={() => onPageChange(page - 1)}
            >
              <ChevronLeft size={14} /> Prev
            </Button>
            <Button
              type="button"
              variant="outline"
              size="sm"
              disabled={page >= totalPages}
              onClick={() => onPageChange(page + 1)}
            >
              Next <ChevronRight size={14} />
            </Button>
          </div>
        </div>
      )}
    </div>
  );
}
