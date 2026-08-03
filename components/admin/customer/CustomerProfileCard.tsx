'use client';

import { User } from '@/Type/user';
import { formatDate } from '@/utils/validators';

interface CustomerProfileCardProps {
  customer: User;
}

export function CustomerProfileCard({ customer }: CustomerProfileCardProps) {
  return (
    <div className="rounded-3xl border border-[#E8E0D8] bg-white p-6 shadow-sm">
      <div className="flex flex-col gap-4 sm:flex-row sm:items-center sm:justify-between">
        <div className="flex items-center gap-4">
          <div className="flex h-16 w-16 items-center justify-center rounded-[1.25rem] bg-[#F5EFE3] text-2xl font-semibold text-[#8B5E34]">
            {customer.fullName?.charAt(0).toUpperCase() ?? 'U'}
          </div>
          <div>
            <h2 className="text-2xl font-semibold text-[#2B2420]">{customer.fullName}</h2>
            <p className="text-sm text-[#8B7B6F]">{customer.email}</p>
          </div>
        </div>

        <div className="space-y-2 rounded-3xl bg-[#FBF7F2] p-4 text-sm text-[#5C5248]">
          <div>
            <p className="font-medium text-[#2B2420]">Joined</p>
            <p>{customer.created_date ? formatDate(customer.created_date) : 'Unknown'}</p>
          </div>
          <div>
            <p className="font-medium text-[#2B2420]">Status</p>
            <span className={`inline-flex rounded-full px-3 py-1 text-xs font-semibold ${customer.isActive ? 'bg-green-100 text-green-700' : 'bg-red-100 text-red-700'}`}>
              {customer.isActive ? 'Active' : 'Blocked'}
            </span>
          </div>
        </div>
      </div>
    </div>
  );
}
