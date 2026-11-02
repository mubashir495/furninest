'use client';

import React, { useEffect, useState, useCallback } from 'react';
import Link from 'next/link';
import Image from 'next/image';
import {
  Sparkles,
  Plus,
  RefreshCw,
  ArrowRight,
  AlertTriangle,
  ChevronLeft,
  ChevronRight,
  Calendar,
  Layers,
} from 'lucide-react';
import { Button } from '@/components/ui/button';
import { EmptyState } from '@/components/ui/EmptyState';
import { LoadingSkeleton } from '@/components/ui/LoadingSkeleton';
import { StatusBadge } from '@/components/admin/listing-agent/StatusBadge';
import { listingAgentService } from '@/services/listingAgentService';
import { ListingDraft, ListingDraftStatus } from '@/Type/listing-agent';

const TABS: { label: string; value: string; countKey?: ListingDraftStatus }[] = [
  { label: 'All Drafts', value: 'all' },
  { label: 'Pending Approval', value: 'pending_approval' },
  { label: 'In Progress', value: 'analyzing' },
  { label: 'Approved', value: 'approved' },
  { label: 'Published', value: 'published' },
  { label: 'Failed', value: 'failed' },
];

export default function ListingAgentIndexPage() {
  const [drafts, setDrafts] = useState<ListingDraft[]>([]);
  const [total, setTotal] = useState(0);
  const [totalPages, setTotalPages] = useState(1);
  const [page, setPage] = useState(1);
  const [statusFilter, setStatusFilter] = useState('all');
  const [isLoading, setIsLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  const fetchDrafts = useCallback(async () => {
    setIsLoading(true);
    setError(null);
    try {
      const response = await listingAgentService.listDrafts({
        page,
        limit: 12,
        status: statusFilter === 'all' ? undefined : statusFilter,
      });
      setDrafts(response.drafts || []);
      setTotal(response.total || 0);
      setTotalPages(response.totalPages || 1);
    } catch (err: any) {
      setError(err?.message || 'Failed to load listing drafts.');
    } finally {
      setIsLoading(false);
    }
  }, [page, statusFilter]);

  useEffect(() => {
    fetchDrafts();
  }, [fetchDrafts]);

  const handleTabChange = (val: string) => {
    setStatusFilter(val);
    setPage(1);
  };

  return (
    <div className="space-y-6 max-w-7xl mx-auto">
      {/* Header */}
      <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-4 border-b border-border pb-5">
        <div>
          <div className="flex items-center gap-2.5">
            <div className="h-9 w-9 rounded-xl bg-accent/15 text-accent flex items-center justify-center">
              <Sparkles size={20} />
            </div>
            <h1 className="text-2xl font-serif font-bold text-foreground">
              AI Listing Agent
            </h1>
          </div>
          <p className="text-sm text-muted-foreground mt-1">
            Upload product photos to generate AI-assisted descriptions, SEO, variants, and pricing.
          </p>
        </div>

        <div className="flex items-center gap-3">
          <Button
            variant="outline"
            size="sm"
            onClick={() => fetchDrafts()}
            disabled={isLoading}
            className="rounded-xl gap-2"
          >
            <RefreshCw size={14} className={isLoading ? 'animate-spin' : ''} />
            Refresh
          </Button>

          <Link href="/admin/listing-agent/new">
            <Button className="rounded-xl gap-2 bg-primary text-primary-foreground hover:opacity-90">
              <Plus size={16} />
              New Listing
            </Button>
          </Link>
        </div>
      </div>

      {/* Filter Tabs */}
      <div className="flex items-center gap-2 overflow-x-auto pb-2 border-b border-border/60">
        {TABS.map((tab) => {
          const isActive = statusFilter === tab.value;
          return (
            <button
              key={tab.value}
              onClick={() => handleTabChange(tab.value)}
              className={`px-3.5 py-1.5 rounded-xl text-xs font-medium whitespace-nowrap transition-colors ${
                isActive
                  ? 'bg-primary text-primary-foreground shadow-xs'
                  : 'text-muted-foreground hover:bg-muted hover:text-foreground'
              }`}
            >
              {tab.label}
            </button>
          );
        })}
      </div>

      {/* Content */}
      {isLoading ? (
        <LoadingSkeleton rows={4} />
      ) : error ? (
        <div className="rounded-2xl border border-destructive/20 bg-destructive/5 p-6 text-center">
          <p className="text-sm text-destructive font-medium mb-3">{error}</p>
          <Button size="sm" variant="outline" onClick={() => fetchDrafts()}>
            Try Again
          </Button>
        </div>
      ) : drafts.length === 0 ? (
        <EmptyState
          icon={Sparkles}
          title="No listing drafts found"
          description={
            statusFilter === 'all'
              ? 'You have not created any listing drafts yet. Upload 1-6 photos to generate your first product draft.'
              : `No drafts currently match the filter "${statusFilter}".`
          }
          actionLabel="Create New Listing"
          onAction={() => {
            window.location.href = '/admin/listing-agent/new';
          }}
        />
      ) : (
        <>
          {/* Drafts Table (Desktop) / Cards (Mobile) */}
          <div className="bg-card rounded-2xl border border-border shadow-xs overflow-hidden">
            <div className="overflow-x-auto">
              <table className="w-full text-left text-sm">
                <thead className="bg-muted/50 border-b border-border text-xs uppercase text-muted-foreground font-semibold">
                  <tr>
                    <th className="py-3.5 px-4">Item</th>
                    <th className="py-3.5 px-4">Status</th>
                    <th className="py-3.5 px-4">Selling Price (£)</th>
                    <th className="py-3.5 px-4">Cost Price (£)</th>
                    <th className="py-3.5 px-4">Variants</th>
                    <th className="py-3.5 px-4">Created</th>
                    <th className="py-3.5 px-4 text-right">Actions</th>
                  </tr>
                </thead>
                <tbody className="divide-y divide-border">
                  {drafts.map((draft) => {
                    const thumbnail = draft.sourceImages?.[0];
                    const title =
                      draft.seo?.title ||
                      (draft.analysis?.category
                        ? `${draft.analysis.color || ''} ${draft.analysis.category}`.trim()
                        : 'Untitled Listing Draft');

                    const price =
                      draft.pricing?.calculatedPrice ||
                      draft.variants?.[0]?.price ||
                      null;

                    const formattedDate = new Date(draft.createdAt).toLocaleDateString(
                      'en-GB',
                      {
                        day: 'numeric',
                        month: 'short',
                        year: 'numeric',
                      },
                    );

                    return (
                      <tr
                        key={draft._id}
                        className="hover:bg-muted/30 transition-colors group"
                      >
                        {/* Item Details */}
                        <td className="py-4 px-4">
                          <div className="flex items-center gap-3">
                            <div className="h-14 w-14 shrink-0 rounded-xl overflow-hidden bg-muted border border-border relative">
                              {thumbnail ? (
                                <Image
                                  src={thumbnail}
                                  alt={title}
                                  fill
                                  sizes="56px"
                                  className="object-cover"
                                />
                              ) : (
                                <div className="h-full w-full flex items-center justify-center text-muted-foreground">
                                  <Layers size={18} />
                                </div>
                              )}
                            </div>
                            <div className="min-w-0 max-w-xs">
                              <Link
                                href={`/admin/listing-agent/${draft._id}`}
                                className="font-medium text-foreground hover:text-accent truncate block"
                              >
                                {title}
                              </Link>
                              <div className="flex items-center gap-1.5 mt-1 text-xs text-muted-foreground">
                                <span>{draft.analysis?.category || 'Draft'}</span>
                                {draft.analysis?.material && (
                                  <>
                                    <span>•</span>
                                    <span className="truncate">
                                      {draft.analysis.material}
                                    </span>
                                  </>
                                )}
                              </div>
                              {draft.reviewRequired && (
                                <span className="inline-flex items-center gap-1 mt-1 text-[11px] font-semibold text-amber-700 bg-amber-50 dark:bg-amber-950/40 px-1.5 py-0.5 rounded">
                                  <AlertTriangle size={11} />
                                  Review Required
                                </span>
                              )}
                            </div>
                          </div>
                        </td>

                        {/* Status */}
                        <td className="py-4 px-4">
                          <StatusBadge status={draft.status} />
                        </td>

                        {/* Selling Price */}
                        <td className="py-4 px-4 font-semibold text-foreground">
                          {price != null ? `£${price.toLocaleString('en-GB')}` : '—'}
                        </td>

                        {/* Cost Price */}
                        <td className="py-4 px-4 text-muted-foreground">
                          £{draft.costPrice.toLocaleString('en-GB')}
                        </td>

                        {/* Variants Count */}
                        <td className="py-4 px-4">
                          <span className="inline-flex items-center gap-1 text-xs text-muted-foreground bg-muted px-2 py-0.5 rounded-lg">
                            {draft.variants?.length || 0} configs
                          </span>
                        </td>

                        {/* Created Date */}
                        <td className="py-4 px-4 text-xs text-muted-foreground">
                          <div className="flex items-center gap-1">
                            <Calendar size={13} />
                            <span>{formattedDate}</span>
                          </div>
                        </td>

                        {/* Actions */}
                        <td className="py-4 px-4 text-right">
                          <Link href={`/admin/listing-agent/${draft._id}`}>
                            <Button
                              variant="outline"
                              size="sm"
                              className="rounded-xl gap-1.5 hover:bg-accent/10 hover:text-accent hover:border-accent/30"
                            >
                              <span>Review</span>
                              <ArrowRight size={14} />
                            </Button>
                          </Link>
                        </td>
                      </tr>
                    );
                  })}
                </tbody>
              </table>
            </div>

            {/* Pagination */}
            {totalPages > 1 && (
              <div className="p-4 border-t border-border flex items-center justify-between text-xs text-muted-foreground">
                <div>
                  Showing {drafts.length} of {total} drafts
                </div>
                <div className="flex items-center gap-2">
                  <Button
                    variant="outline"
                    size="sm"
                    onClick={() => setPage((p) => Math.max(1, p - 1))}
                    disabled={page <= 1}
                    className="h-8 px-2.5 rounded-lg"
                  >
                    <ChevronLeft size={14} />
                  </Button>
                  <span className="font-medium text-foreground px-2">
                    Page {page} of {totalPages}
                  </span>
                  <Button
                    variant="outline"
                    size="sm"
                    onClick={() => setPage((p) => Math.min(totalPages, p + 1))}
                    disabled={page >= totalPages}
                    className="h-8 px-2.5 rounded-lg"
                  >
                    <ChevronRight size={14} />
                  </Button>
                </div>
              </div>
            )}
          </div>
        </>
      )}
    </div>
  );
}
