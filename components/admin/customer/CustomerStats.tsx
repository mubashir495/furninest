'use client';

import { formatCurrency } from '@/utils/validators';

interface CustomerStatsProps {
  totalOrders: number;
  totalSpending: number;
  lastOrderDate?: string;
  averageOrderValue: number;
}

export function CustomerStats({ totalOrders, totalSpending, lastOrderDate, averageOrderValue }: CustomerStatsProps) {
  return (
    <div className="grid gap-4 sm:grid-cols-2 xl:grid-cols-4">
      {[
        { label: 'Total Orders', value: totalOrders.toString() },
        { label: 'Total Spending', value: `${formatCurrency(totalSpending)}` },
        { label: 'Last Order', value: lastOrderDate ?? 'N/A' },
        { label: 'Avg. Order Value', value: `${formatCurrency(averageOrderValue)}` },
      ].map((item) => (
        <div key={item.label} className="rounded-3xl border border-[#E8E0D8] bg-white p-6 shadow-sm">
          <p className="text-xs uppercase tracking-wider text-[#8B7B6F]">{item.label}</p>
          <p className="mt-3 text-2xl font-semibold text-[#2B2420]">{item.value}</p>
        </div>
      ))}
    </div>
  );
}