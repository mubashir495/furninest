import React from 'react';
import { Minus, Plus } from 'lucide-react';
import { Button } from './button';

interface QuantitySelectorProps {
  quantity: number;
  onIncrease: () => void;
  onDecrease: () => void;
  min?: number;
  max?: number;
  className?: string;
}

export function QuantitySelector({
  quantity,
  onIncrease,
  onDecrease,
  min = 1,
  max = 99,
  className = '',
}: QuantitySelectorProps) {
  return (
    <div className={`flex items-center border border-border rounded-md ${className}`}>
      <Button
        type="button"
        variant="ghost"
        size="icon"
        className="h-8 w-8 rounded-none rounded-l-md border-r border-border hover:bg-muted"
        onClick={onDecrease}
        disabled={quantity <= min}
        aria-label="Decrease quantity"
      >
        <Minus className="h-3 w-3" />
      </Button>
      <div className="flex-1 min-w-[3rem] text-center text-sm font-medium">
        {quantity}
      </div>
      <Button
        type="button"
        variant="ghost"
        size="icon"
        className="h-8 w-8 rounded-none rounded-r-md border-l border-border hover:bg-muted"
        onClick={onIncrease}
        disabled={quantity >= max}
        aria-label="Increase quantity"
      >
        <Plus className="h-3 w-3" />
      </Button>
    </div>
  );
}
