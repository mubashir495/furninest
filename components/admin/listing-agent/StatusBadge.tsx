import React from 'react';
import {
  Clock,
  Loader2,
  AlertCircle,
  CheckCircle2,
  Globe,
  XCircle,
} from 'lucide-react';
import { ListingDraftStatus } from '@/Type/listing-agent';

interface StatusBadgeProps {
  status: ListingDraftStatus;
  size?: 'sm' | 'md' | 'lg';
  className?: string;
}

const statusConfig: Record<
  ListingDraftStatus,
  { label: string; bg: string; text: string; border: string; icon: React.ElementType; animate?: boolean }
> = {
  queued: {
    label: 'Queued',
    bg: 'bg-neutral-100 dark:bg-neutral-800',
    text: 'text-neutral-700 dark:text-neutral-300',
    border: 'border-neutral-200 dark:border-neutral-700',
    icon: Clock,
  },
  analyzing: {
    label: 'AI Analyzing',
    bg: 'bg-purple-50 dark:bg-purple-950/40',
    text: 'text-purple-700 dark:text-purple-300',
    border: 'border-purple-200 dark:border-purple-800',
    icon: Loader2,
    animate: true,
  },
  pending_approval: {
    label: 'Pending Approval',
    bg: 'bg-amber-50 dark:bg-amber-950/40',
    text: 'text-amber-800 dark:text-amber-300',
    border: 'border-amber-200 dark:border-amber-800',
    icon: AlertCircle,
  },
  approved: {
    label: 'Approved',
    bg: 'bg-emerald-50 dark:bg-emerald-950/40',
    text: 'text-emerald-700 dark:text-emerald-300',
    border: 'border-emerald-200 dark:border-emerald-800',
    icon: CheckCircle2,
  },
  published: {
    label: 'Published',
    bg: 'bg-blue-50 dark:bg-blue-950/40',
    text: 'text-blue-700 dark:text-blue-300',
    border: 'border-blue-200 dark:border-blue-800',
    icon: Globe,
  },
  failed: {
    label: 'Failed',
    bg: 'bg-rose-50 dark:bg-rose-950/40',
    text: 'text-rose-700 dark:text-rose-300',
    border: 'border-rose-200 dark:border-rose-800',
    icon: XCircle,
  },
};

export function StatusBadge({ status, size = 'md', className = '' }: StatusBadgeProps) {
  const config = statusConfig[status] || statusConfig.queued;
  const Icon = config.icon;

  const sizeClasses = {
    sm: 'text-xs px-2 py-0.5 gap-1',
    md: 'text-xs font-medium px-2.5 py-1 gap-1.5',
    lg: 'text-sm font-semibold px-3 py-1.5 gap-2',
  }[size];

  const iconSizes = {
    sm: 12,
    md: 14,
    lg: 16,
  }[size];

  return (
    <span
      className={`inline-flex items-center rounded-full border ${config.bg} ${config.text} ${config.border} ${sizeClasses} ${className}`}
    >
      <Icon
        size={iconSizes}
        className={config.animate ? 'animate-spin shrink-0' : 'shrink-0'}
      />
      <span>{config.label}</span>
    </span>
  );
}
