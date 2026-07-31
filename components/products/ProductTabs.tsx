'use client';
import { useState } from 'react';

export function ProductTabs({
  description,
  categoryName,
  stock,
}: {
  description: string;
  categoryName?: string;
  stock: number;
}) {
  const [activeTab, setActiveTab] = useState<'desc' | 'details'>('desc');

  return (
    <div className="mb-24">
      <div className="flex border-b border-border mb-8 overflow-x-auto hide-scrollbar">
        {(['desc', 'details'] as const).map((id) => (
          <button
            key={id}
            onClick={() => setActiveTab(id)}
            className={`px-8 py-4 font-serif text-xl transition-all whitespace-nowrap border-b-2 ${
              activeTab === id ? 'border-primary text-primary font-bold' : 'border-transparent text-muted-foreground hover:text-primary'
            }`}
          >
            {id === 'desc' ? 'Description' : 'Details'}
          </button>
        ))}
      </div>

      <div className="max-w-4xl">
        {activeTab === 'desc' ? (
          <p className="prose prose-lg text-muted-foreground whitespace-pre-line">{description}</p>
        ) : (
          <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
            <div className="flex justify-between p-4 bg-muted/30 rounded-2xl">
              <span className="font-bold text-primary">Category</span>
              <span className="text-muted-foreground text-sm">{categoryName || '—'}</span>
            </div>
            <div className="flex justify-between p-4 bg-muted/30 rounded-2xl">
              <span className="font-bold text-primary">Availability</span>
              <span className="text-muted-foreground text-sm">{stock > 0 ? `${stock} in stock` : 'Out of stock'}</span>
            </div>
          </div>
        )}
      </div>
    </div>
  );
}