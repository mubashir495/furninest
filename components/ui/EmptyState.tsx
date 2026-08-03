import { LucideIcon } from 'lucide-react';
import { Button } from './button';

interface EmptyStateProps {
  title: string;
  description: string;
  icon: LucideIcon;
  actionLabel?: string;
  onAction?: () => void;
}

export function EmptyState({ title, description, icon: Icon, actionLabel, onAction }: EmptyStateProps) {
  return (
    <div className="flex flex-col items-center justify-center rounded-3xl border border-dashed border-neutral-200 bg-white p-10 text-center">
      <div className="mb-4 flex h-14 w-14 items-center justify-center rounded-2xl bg-[#F5EFE3] text-[#8B5E34]">
        <Icon size={28} />
      </div>
      <h3 className="text-lg font-semibold text-[#2B2420]">{title}</h3>
      <p className="mt-2 text-sm text-[#8B7B6F] max-w-sm">{description}</p>
      {actionLabel && onAction && (
        <Button type="button" variant="default" className="mt-6" onClick={onAction}>
          {actionLabel}
        </Button>
      )}
    </div>
  );
}
