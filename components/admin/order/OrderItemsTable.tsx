'use client';

import Image from 'next/image';
import { OrderItem } from '@/Type/order';
import { formatCurrency } from '@/utils/validators';

interface OrderItemsTableProps {
  items: OrderItem[];
}

export function OrderItemsTable({ items }: OrderItemsTableProps) {
  return (
    <div className="overflow-x-auto rounded-3xl border border-[#E8E0D8] bg-white p-4 shadow-sm">
      <table className="min-w-full text-sm text-[#2B2420]">
        <thead className="border-b border-[#E8E0D8] bg-[#FBF7F2] text-left text-xs uppercase tracking-wider text-[#8B7B6F]">
          <tr>
            <th className="px-4 py-3">Product</th>
            <th className="px-4 py-3">SKU</th>
            <th className="px-4 py-3">Quantity</th>
            <th className="px-4 py-3">Unit Price</th>
            <th className="px-4 py-3">Line Total</th>
          </tr>
        </thead>
        <tbody>
          {items.map((item) => (
            <tr key={item._id} className="border-b border-[#E8E0D8] last:border-0 hover:bg-[#FBF7F2]">
              <td className="px-4 py-4">
                <div className="flex items-center gap-3">
                  {item.productThumbnail ? (
                    <div className="relative h-14 w-14 overflow-hidden rounded-2xl bg-[#F5EFE3]">
                      <Image src={item.productThumbnail} alt={item.productName} fill sizes="56px" className="object-cover" />
                    </div>
                  ) : (
                    <div className="flex h-14 w-14 items-center justify-center rounded-2xl bg-[#F5EFE3] text-[#8B5E34]">N/A</div>
                  )}
                  <div>
                    <p className="font-medium text-[#2B2420]">{item.productName}</p>
                  </div>
                </div>
              </td>
              <td className="px-4 py-4 text-[#5C5248]">{item.product || '—'}</td>
              <td className="px-4 py-4 text-[#5C5248]">{item.quantity}</td>
              <td className="px-4 py-4 text-[#5C5248]">{formatCurrency(item.price)}</td>
              <td className="px-4 py-4 font-semibold text-[#2B2420]">{formatCurrency(item.subtotal)}</td>
            </tr>
          ))}
        </tbody>
      </table>
    </div>
  );
}
