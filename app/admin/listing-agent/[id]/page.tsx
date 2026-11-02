'use client';

import React, { useEffect, useState, useCallback, useRef } from 'react';
import { useParams, useRouter } from 'next/navigation';
import Link from 'next/link';
import Image from 'next/image';
import { useForm, useFieldArray } from 'react-hook-form';
import { zodResolver } from '@hookform/resolvers/zod';
import { toast } from 'sonner';
import {
  ArrowLeft,
  Sparkles,
  Save,
  CheckCircle,
  Send,
  RefreshCw,
  Loader2,
  AlertCircle,
  AlertTriangle,
  X,
  Tag,
  Package,
  Layers,
  ShieldCheck,
} from 'lucide-react';

import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { StatusBadge } from '@/components/admin/listing-agent/StatusBadge';
import { listingAgentService } from '@/services/listingAgentService';
import {
  ListingDraft,
  ListingDraftStatus,
  listingDraftFormSchema,
  ListingDraftFormValues,
} from '@/Type/listing-agent';

const POLL_INTERVAL_MS = 3000;
const POLL_STATUSES: ListingDraftStatus[] = ['queued', 'analyzing'];

function formatDate(iso: string): string {
  return new Date(iso).toLocaleString('en-GB', {
    day: '2-digit',
    month: 'short',
    year: 'numeric',
    hour: '2-digit',
    minute: '2-digit',
  });
}

function ConfidenceBar({ value }: { value: number }) {
  const pct = Math.round(value * 100);
  const color = pct >= 80 ? 'bg-emerald-500' : pct >= 60 ? 'bg-amber-500' : 'bg-rose-500';
  return (
    <div className="flex items-center gap-2">
      <div className="flex-1 h-2 bg-muted rounded-full overflow-hidden">
        <div className={`h-full rounded-full ${color}`} style={{ width: `${pct}%` }} />
      </div>
      <span className="text-xs font-semibold tabular-nums">{pct}%</span>
    </div>
  );
}

function CharCounter({ current, max }: { current: number; max: number }) {
  const over = current > max;
  return (
    <span
      className={`text-xs tabular-nums ${
        over ? 'text-destructive font-semibold' : 'text-muted-foreground'
      }`}
    >
      {current}/{max}
    </span>
  );
}

export default function DraftDetailPage() {
  const params = useParams<{ id: string }>();
  const router = useRouter();
  const id = params.id;

  const [draft, setDraft] = useState<ListingDraft | null>(null);
  const [isLoading, setIsLoading] = useState(true);
  const [loadError, setLoadError] = useState<string | null>(null);
  const [isSaving, setIsSaving] = useState(false);
  const [isApproving, setIsApproving] = useState(false);
  const [isPublishing, setIsPublishing] = useState(false);
  const [isRetrying, setIsRetrying] = useState(false);
  const [newTag, setNewTag] = useState('');

  const pollRef = useRef<ReturnType<typeof setInterval> | null>(null);

  const {
    register,
    control,
    handleSubmit,
    reset,
    watch,
    formState: { errors, isDirty },
  } = useForm<ListingDraftFormValues>({
    resolver: zodResolver(listingDraftFormSchema) as any,
    defaultValues: {
      title: '',
      slug: '',
      metaDescription: '',
      description: '',
      tags: [],
      calculatedPrice: 0,
      compareAtPrice: null,
      fireSafetyLabelConfirmed: false,
      stockLocation: 'UK warehouse',
      variants: [],
    },
  });

  const { fields: tagFields, append: appendTag, remove: removeTag } = useFieldArray({
    control,
    name: 'tags' as any,
  });

  const watchedTitle = watch('title') || '';
  const watchedMeta = watch('metaDescription') || '';
  const watchedTags = watch('tags') || [];

  const loadDraft = useCallback(
    async (silent = false) => {
      if (!silent) setIsLoading(true);
      setLoadError(null);
      try {
        const data = await listingAgentService.getDraft(id);
        setDraft(data);

        if (data.seo || data.pricing || (data.variants && data.variants.length > 0)) {
          reset({
            title: data.seo?.title || '',
            slug: data.seo?.slug || '',
            metaDescription: data.seo?.metaDescription || '',
            description: data.seo?.description || '',
            tags: data.seo?.tags || [],
            calculatedPrice: data.pricing?.calculatedPrice || 0,
            compareAtPrice: data.pricing?.compareAtPrice ?? null,
            fireSafetyLabelConfirmed: data.fireSafetyLabelConfirmed || false,
            stockLocation: data.stockLocation || 'UK warehouse',
            variants: (data.variants || []).map((v) => ({
              _id: v._id,
              configName: v.configName,
              colorName: v.colorName,
              colorHex: v.colorHex || '',
              sku: v.sku,
              price: v.price,
              compareAtPrice: v.compareAtPrice ?? null,
              stock: v.stock,
              dimensions: v.dimensions || '',
              material: v.material || '',
              images: v.images || [],
              needsPhoto: v.needsPhoto || false,
              suggested: v.suggested !== false,
              isActive: v.isActive || false,
            })),
          });
        }
      } catch (err: any) {
        setLoadError(err?.message || 'Failed to load draft.');
      } finally {
        if (!silent) setIsLoading(false);
      }
    },
    [id, reset],
  );

  useEffect(() => {
    loadDraft();
  }, [loadDraft]);

  useEffect(() => {
    if (!draft) return;

    if (POLL_STATUSES.includes(draft.status)) {
      pollRef.current = setInterval(() => {
        loadDraft(true);
      }, POLL_INTERVAL_MS);
    } else {
      if (pollRef.current) {
        clearInterval(pollRef.current);
        pollRef.current = null;
      }
    }

    return () => {
      if (pollRef.current) {
        clearInterval(pollRef.current);
        pollRef.current = null;
      }
    };
  }, [draft?.status, loadDraft]);

  const onSave = async (values: ListingDraftFormValues) => {
    setIsSaving(true);
    try {
      const payload = {
        seo: {
          title: values.title,
          slug: values.slug,
          metaDescription: values.metaDescription,
          description: values.description,
          tags: values.tags,
        },
        pricing: {
          ...(draft?.pricing || {}),
          calculatedPrice: values.calculatedPrice,
          compareAtPrice: values.compareAtPrice,
        },
        fireSafetyLabelConfirmed: values.fireSafetyLabelConfirmed,
        stockLocation: values.stockLocation,
        variants: values.variants,
      };
      const updated = await listingAgentService.updateDraft(id, payload as any);
      setDraft(updated);
      reset(values);
      toast.success('Draft saved successfully.');
    } catch (err: any) {
      toast.error(err?.message || 'Failed to save draft.');
    } finally {
      setIsSaving(false);
    }
  };

  const handleApprove = async () => {
    setIsApproving(true);
    try {
      const updated = await listingAgentService.approveDraft(id);
      setDraft(updated);
      toast.success('Draft approved! Ready to publish.');
    } catch (err: any) {
      toast.error(err?.message || 'Failed to approve draft.');
    } finally {
      setIsApproving(false);
    }
  };

  const handlePublish = async () => {
    setIsPublishing(true);
    try {
      toast.loading('Publishing product to store...', { id: 'publish' });
      await listingAgentService.publishDraft(id);
      toast.success('Product published successfully!', { id: 'publish' });
      router.push('/admin/listing-agent');
    } catch (err: any) {
      toast.error(err?.message || 'Failed to publish product.', { id: 'publish' });
      setIsPublishing(false);
    }
  };

  const handleRetry = async () => {
    setIsRetrying(true);
    try {
      const updated = await listingAgentService.retryDraft(id);
      setDraft(updated);
      toast.success('Draft re-queued for AI processing.');
    } catch (err: any) {
      toast.error(err?.message || 'Failed to retry draft.');
    } finally {
      setIsRetrying(false);
    }
  };

  const handleAddTag = () => {
    const trimmed = newTag.trim().toLowerCase();
    if (trimmed && !watchedTags.includes(trimmed)) {
      appendTag(trimmed as any);
    }
    setNewTag('');
  };

  if (isLoading) {
    return (
      <div className="max-w-5xl mx-auto space-y-6">
        <div className="h-8 bg-muted rounded-xl w-48 animate-pulse" />
        <div className="h-64 bg-muted rounded-3xl animate-pulse" />
        <div className="h-96 bg-muted rounded-3xl animate-pulse" />
      </div>
    );
  }

  if (loadError || !draft) {
    return (
      <div className="max-w-5xl mx-auto">
        <div className="rounded-2xl border border-destructive/20 bg-destructive/5 p-8 text-center space-y-4">
          <AlertCircle className="mx-auto text-destructive" size={36} />
          <p className="text-sm text-destructive font-medium">{loadError || 'Draft not found.'}</p>
          <div className="flex items-center justify-center gap-3">
            <Button variant="outline" onClick={() => loadDraft()} className="rounded-xl gap-2">
              <RefreshCw size={14} /> Try Again
            </Button>
            <Link href="/admin/listing-agent">
              <Button variant="outline" className="rounded-xl gap-2">
                <ArrowLeft size={14} /> Back
              </Button>
            </Link>
          </div>
        </div>
      </div>
    );
  }

  const isProcessing = POLL_STATUSES.includes(draft.status);
  const canEdit = ['pending_approval', 'approved'].includes(draft.status);
  const canApprove = draft.status === 'pending_approval';
  const canPublish = draft.status === 'approved';
  const isFailed = draft.status === 'failed';
  const isPublished = draft.status === 'published';

  const pageTitle = draft.seo?.title || `Draft #${id.slice(-6).toUpperCase()}`;

  return (
    <div className="max-w-5xl mx-auto space-y-6 pb-32">
      {/* Header */}
      <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-4 border-b border-border pb-5">
        <div>
          <Link
            href="/admin/listing-agent"
            className="inline-flex items-center gap-1.5 text-sm text-muted-foreground hover:text-foreground transition-colors mb-2"
          >
            <ArrowLeft size={14} /> Back to Listing Agent
          </Link>
          <div className="flex items-center gap-3 flex-wrap">
            <h1 className="text-xl font-serif font-bold text-foreground truncate max-w-sm">
              {pageTitle}
            </h1>
            <StatusBadge status={draft.status} />
            <span className="text-xs bg-muted text-muted-foreground font-semibold px-2 py-0.5 rounded-md flex items-center gap-1">
              🇬🇧 UK Market (GBP £)
            </span>
            {draft.reviewRequired && (
              <span className="inline-flex items-center gap-1 text-xs font-semibold text-amber-700 bg-amber-50 dark:bg-amber-950/40 px-2 py-0.5 rounded-lg">
                <AlertTriangle size={11} /> Review Required
              </span>
            )}
          </div>
          <p className="text-xs text-muted-foreground mt-1">
            Updated {formatDate(draft.updatedAt)}
          </p>
        </div>

        <div className="flex items-center gap-2 flex-wrap">
          <Button
            variant="outline"
            size="sm"
            onClick={() => loadDraft(true)}
            className="rounded-xl gap-1.5"
          >
            <RefreshCw size={13} /> Refresh
          </Button>
        </div>
      </div>

      {/* Processing State */}
      {isProcessing && (
        <div className="bg-card rounded-3xl border border-border p-10 text-center space-y-4 shadow-xs">
          <div className="mx-auto w-16 h-16 rounded-full bg-accent/15 flex items-center justify-center">
            <Sparkles size={28} className="text-accent animate-pulse" />
          </div>
          <h2 className="text-lg font-semibold text-foreground">
            {draft.status === 'queued' ? 'Queued for Claude AI Processing' : 'Claude AI Analysing & Generating Listing…'}
          </h2>
          <p className="text-sm text-muted-foreground max-w-md mx-auto">
            {draft.status === 'queued'
              ? 'Your draft is queued for background processing.'
              : 'Claude is analysing your product photos, extracting specifications, calculating optimal pricing, and drafting SEO-optimised content.'}
          </p>
          <div className="flex items-center justify-center gap-2 text-xs text-muted-foreground">
            <Loader2 size={13} className="animate-spin" />
            <span>Auto-refreshing every 3 seconds…</span>
          </div>
        </div>
      )}

      {/* Failed State */}
      {isFailed && (
        <div className="bg-card rounded-3xl border border-destructive/30 bg-destructive/5 p-6 space-y-3">
          <div className="flex items-center gap-2 text-destructive font-semibold">
            <AlertCircle size={18} />
            <span>AI Processing Failed</span>
          </div>
          {draft.error && (
            <p className="text-sm text-muted-foreground font-mono bg-muted rounded-xl px-3 py-2 break-all">
              {draft.error}
            </p>
          )}
          <Button
            onClick={handleRetry}
            disabled={isRetrying}
            className="rounded-xl gap-2"
            variant="outline"
          >
            {isRetrying ? <Loader2 size={14} className="animate-spin" /> : <RefreshCw size={14} />}
            Retry AI Processing
          </Button>
        </div>
      )}

      {/* Published Banner */}
      {isPublished && draft.publishedProductId && (
        <div className="bg-emerald-50 dark:bg-emerald-950/30 rounded-3xl border border-emerald-200 dark:border-emerald-800 p-5 flex items-center gap-3">
          <CheckCircle size={20} className="text-emerald-600 shrink-0" />
          <div>
            <p className="text-sm font-semibold text-emerald-800 dark:text-emerald-300">
              Product Published in Catalogue
            </p>
            <p className="text-xs text-muted-foreground">Product ID: {draft.publishedProductId}</p>
          </div>
        </div>
      )}

      {/* Source Images */}
      {draft.sourceImages && draft.sourceImages.length > 0 && (
        <div className="bg-card rounded-3xl border border-border p-5 space-y-3">
          <h2 className="text-sm font-semibold text-foreground flex items-center gap-2">
            Uploaded Photos
            <span className="text-xs font-normal text-muted-foreground">
              ({draft.sourceImages.length})
            </span>
          </h2>
          <div className="grid grid-cols-3 sm:grid-cols-6 gap-2">
            {draft.sourceImages.map((url, idx) => (
              <div
                key={idx}
                className="relative aspect-square rounded-2xl overflow-hidden border border-border bg-muted"
              >
                <Image
                  src={url}
                  alt={`Source photo ${idx + 1}`}
                  fill
                  sizes="120px"
                  className="object-cover"
                />
                {idx === 0 && (
                  <span className="absolute top-1 left-1 text-[9px] font-semibold bg-black/70 text-white px-1.5 py-0.5 rounded">
                    Thumbnail
                  </span>
                )}
              </div>
            ))}
          </div>
        </div>
      )}

      {/* Raw Notes Display */}
      {draft.rawDetails && (
        <div className="bg-card rounded-3xl border border-border p-5 space-y-2">
          <h2 className="text-xs font-semibold text-muted-foreground uppercase tracking-wider">
            Raw Input / Seller Notes
          </h2>
          <p className="text-sm text-foreground bg-muted/40 rounded-xl p-3 whitespace-pre-wrap">
            {draft.rawDetails}
          </p>
        </div>
      )}

      {/* AI Visual Analysis Summary */}
      {draft.analysis && !isProcessing && (
        <div className="bg-card rounded-3xl border border-border p-5 space-y-4">
          <div className="flex items-center justify-between">
            <h2 className="text-sm font-semibold text-foreground flex items-center gap-2">
              <Sparkles size={14} className="text-accent" />
              AI Extracted Attributes & Specifications
            </h2>
            <span className="text-xs text-muted-foreground">Claude Vision + Text</span>
          </div>

          <div className="grid grid-cols-2 sm:grid-cols-4 gap-3">
            {[
              { label: 'Category', value: draft.analysis.category },
              { label: 'Material', value: draft.analysis.material },
              { label: 'Color', value: draft.analysis.color },
              { label: 'Style', value: draft.analysis.style },
            ].map(({ label, value }) => (
              <div key={label} className="bg-muted/50 rounded-2xl p-3">
                <p className="text-[10px] uppercase tracking-wider text-muted-foreground font-medium">
                  {label}
                </p>
                <p className="text-sm font-semibold text-foreground mt-0.5 truncate">{value || '—'}</p>
              </div>
            ))}
          </div>

          {draft.analysis.seating != null && (
            <div className="bg-muted/50 rounded-2xl p-3 inline-flex items-center gap-2">
              <span className="text-[10px] uppercase tracking-wider text-muted-foreground font-medium">
                Seating Capacity
              </span>
              <span className="text-sm font-semibold text-foreground">
                {draft.analysis.seating} Seater
              </span>
            </div>
          )}

          {draft.analysis.features && draft.analysis.features.length > 0 && (
            <div className="space-y-1.5">
              <p className="text-[10px] uppercase tracking-wider text-muted-foreground font-medium">
                Detected Features
              </p>
              <div className="flex flex-wrap gap-1.5">
                {draft.analysis.features.map((f, i) => (
                  <span key={i} className="text-xs bg-muted text-foreground px-2.5 py-1 rounded-xl">
                    {f}
                  </span>
                ))}
              </div>
            </div>
          )}

          {draft.analysis.specifications && draft.analysis.specifications.length > 0 && (
            <div className="space-y-1.5">
              <p className="text-[10px] uppercase tracking-wider text-muted-foreground font-medium">
                Specifications
              </p>
              <div className="grid grid-cols-1 sm:grid-cols-2 gap-2">
                {draft.analysis.specifications.map((spec, i) => (
                  <div
                    key={i}
                    className="flex justify-between items-center text-xs bg-muted/30 px-3 py-1.5 rounded-xl border border-border/50"
                  >
                    <span className="text-muted-foreground font-medium">{spec.label}</span>
                    <span className="text-foreground font-semibold">{spec.value}</span>
                  </div>
                ))}
              </div>
            </div>
          )}

          <div className="space-y-1">
            <p className="text-[10px] uppercase tracking-wider text-muted-foreground font-medium">
              Detection Confidence
            </p>
            <ConfidenceBar value={draft.analysis.confidence} />
          </div>
        </div>
      )}

      {/* Editable Listing Form */}
      {(canEdit || isPublished) && draft.seo && (
        <form onSubmit={handleSubmit(onSave)} className="space-y-5">
          {/* Content Card */}
          <div className="bg-card rounded-3xl border border-border p-5 space-y-5">
            <div className="flex items-center justify-between">
              <h2 className="text-sm font-semibold text-foreground">Listing Copy (Editable)</h2>
              <span className="text-xs text-muted-foreground">
                Output: British English
              </span>
            </div>

            {/* Title */}
            <div className="space-y-1.5">
              <div className="flex items-center justify-between">
                <label className="text-sm font-medium text-foreground">Title</label>
                <CharCounter current={watchedTitle.length} max={60} />
              </div>
              <Input
                {...register('title')}
                placeholder="Product title (max 60 characters)"
                className="rounded-xl h-11"
                disabled={isPublished}
              />
              {errors.title && (
                <p className="text-xs text-destructive">{errors.title.message}</p>
              )}
            </div>

            {/* Slug */}
            <div className="space-y-1.5">
              <label className="text-sm font-medium text-foreground">URL Slug (kebab-case)</label>
              <Input
                {...register('slug')}
                placeholder="url-friendly-slug"
                className="rounded-xl h-11 font-mono text-sm"
                disabled={isPublished}
              />
              {errors.slug && <p className="text-xs text-destructive">{errors.slug.message}</p>}
            </div>

            {/* Meta Description */}
            <div className="space-y-1.5">
              <div className="flex items-center justify-between">
                <label className="text-sm font-medium text-foreground">Meta Description</label>
                <CharCounter current={watchedMeta.length} max={155} />
              </div>
              <textarea
                {...register('metaDescription')}
                rows={2}
                placeholder="SEO meta description (max 155 characters)"
                className="w-full rounded-xl border border-input bg-background px-3 py-2 text-sm placeholder:text-muted-foreground focus:outline-none focus:ring-2 focus:ring-ring resize-none"
                disabled={isPublished}
              />
              {errors.metaDescription && (
                <p className="text-xs text-destructive">{errors.metaDescription.message}</p>
              )}
            </div>

            {/* Full Description */}
            <div className="space-y-1.5">
              <label className="text-sm font-medium text-foreground">Full Description</label>
              <textarea
                {...register('description')}
                rows={7}
                placeholder="Full product description..."
                className="w-full rounded-xl border border-input bg-background px-3 py-2 text-sm placeholder:text-muted-foreground focus:outline-none focus:ring-2 focus:ring-ring resize-y leading-relaxed"
                disabled={isPublished}
              />
              {errors.description && (
                <p className="text-xs text-destructive">{errors.description.message}</p>
              )}
            </div>

            {/* Tags */}
            <div className="space-y-2">
              <label className="text-sm font-medium text-foreground flex items-center gap-1.5">
                <Tag size={13} /> Keyword Tags
              </label>
              <div className="flex flex-wrap gap-1.5 min-h-8">
                {watchedTags.map((tag, idx) => (
                  <span
                    key={idx}
                    className="inline-flex items-center gap-1 text-xs bg-muted text-foreground px-2.5 py-1 rounded-xl"
                  >
                    #{tag}
                    {!isPublished && (
                      <button
                        type="button"
                        onClick={() => removeTag(idx)}
                        className="text-muted-foreground hover:text-destructive transition-colors ml-1"
                      >
                        <X size={10} />
                      </button>
                    )}
                  </span>
                ))}
              </div>
              {!isPublished && (
                <div className="flex gap-2">
                  <Input
                    value={newTag}
                    onChange={(e) => setNewTag(e.target.value)}
                    onKeyDown={(e) => {
                      if (e.key === 'Enter') {
                        e.preventDefault();
                        handleAddTag();
                      }
                    }}
                    placeholder="Add a tag..."
                    className="rounded-xl h-9 text-sm"
                  />
                  <Button
                    type="button"
                    variant="outline"
                    size="sm"
                    onClick={handleAddTag}
                    className="rounded-xl shrink-0"
                    disabled={!newTag.trim()}
                  >
                    Add
                  </Button>
                </div>
              )}
            </div>
          </div>

          {/* Pricing Card */}
          <div className="bg-card rounded-3xl border border-border p-5 space-y-4">
            <h2 className="text-sm font-semibold text-foreground">Pricing & Margin (UK Market - GBP £)</h2>
            <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
              <div className="space-y-1.5">
                <label className="text-sm font-medium text-foreground">Selling Price (£ Inc. VAT)</label>
                <div className="relative">
                  <span className="absolute inset-y-0 left-0 pl-3.5 flex items-center text-sm font-bold text-muted-foreground">
                    £
                  </span>
                  <Input
                    type="number"
                    min="0"
                    step="0.01"
                    {...register('calculatedPrice')}
                    className="pl-8 rounded-xl h-11"
                    disabled={isPublished}
                  />
                </div>
                {errors.calculatedPrice && (
                  <p className="text-xs text-destructive">{errors.calculatedPrice.message}</p>
                )}
              </div>
              <div className="space-y-1.5">
                <label className="text-sm font-medium text-foreground">Compare-at Price (£ Inc. VAT)</label>
                <div className="relative">
                  <span className="absolute inset-y-0 left-0 pl-3.5 flex items-center text-sm font-bold text-muted-foreground">
                    £
                  </span>
                  <Input
                    type="number"
                    min="0"
                    step="0.01"
                    placeholder="Optional crossed-out price"
                    {...register('compareAtPrice')}
                    className="pl-8 rounded-xl h-11"
                    disabled={isPublished}
                  />
                </div>
              </div>
            </div>

            {draft.pricing?.suggestedPriceRange && (
              <div className="bg-muted/40 rounded-xl p-3 text-xs text-muted-foreground flex items-center justify-between">
                <span>AI Suggested Price Range (UK Retail Benchmark):</span>
                <span className="font-semibold text-foreground">
                  £{draft.pricing.suggestedPriceRange.min.toLocaleString('en-GB')} — £{draft.pricing.suggestedPriceRange.max.toLocaleString('en-GB')}
                </span>
              </div>
            )}

            {draft.pricing && (
              <p className="text-xs text-muted-foreground">
                Base Cost: £{draft.pricing.costPrice.toLocaleString('en-GB')} · UK VAT: {Math.round((draft.pricing.vatRate ?? 0.20) * 100)}% · Estimated Margin:{' '}
                {Math.round((draft.pricing.marginRate || 0) * 100)}%
              </p>
            )}
          </div>

          {/* UK Compliance & Warehouse Stock Card */}
          <div className="bg-card rounded-3xl border border-border p-5 space-y-4">
            <h2 className="text-sm font-semibold text-foreground flex items-center gap-2">
              <ShieldCheck size={16} className="text-accent" />
              UK Compliance & Stock Details
            </h2>

            <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
              {/* Stock Location */}
              <div className="space-y-1.5">
                <label className="text-sm font-medium text-foreground">
                  Stock Location (UK)
                </label>
                <Input
                  {...register('stockLocation')}
                  placeholder="e.g. UK warehouse"
                  className="rounded-xl h-11"
                  disabled={isPublished}
                />
                <p className="text-xs text-muted-foreground">
                  Local UK inventory. Never mention lead times or free delivery unless specified in input.
                </p>
              </div>

              {/* Fire Safety Label Confirmation */}
              <div className="space-y-1.5 flex flex-col justify-center">
                <div className="rounded-2xl border border-border bg-muted/20 p-3.5 flex items-start gap-3">
                  <input
                    type="checkbox"
                    id="fireSafetyLabelConfirmed"
                    {...register('fireSafetyLabelConfirmed')}
                    disabled={isPublished}
                    className="mt-1 h-4 w-4 rounded border-border text-primary focus:ring-primary"
                  />
                  <label htmlFor="fireSafetyLabelConfirmed" className="text-xs cursor-pointer text-foreground">
                    <span className="font-semibold block">
                      UK Fire Safety Label Confirmed
                    </span>
                    <span className="text-muted-foreground block mt-0.5">
                      Required for upholstered furniture under Furniture & Furnishings (Fire) (Safety) Regulations 1988 before publishing.
                    </span>
                  </label>
                </div>
              </div>
            </div>
          </div>

          {/* Form Save Button */}
          {!isPublished && isDirty && (
            <div className="flex justify-end">
              <Button
                type="submit"
                disabled={isSaving}
                className="rounded-xl gap-2 bg-primary text-primary-foreground hover:opacity-90"
              >
                {isSaving ? <Loader2 size={14} className="animate-spin" /> : <Save size={14} />}
                Save Changes
              </Button>
            </div>
          )}
        </form>
      )}

      {/* Variants Table */}
      {draft.variants && draft.variants.length > 0 && !isProcessing && (
        <div className="bg-card rounded-3xl border border-border overflow-hidden">
          <div className="p-5 border-b border-border flex items-center gap-2">
            <Package size={14} className="text-accent" />
            <h2 className="text-sm font-semibold text-foreground">
              Generated Variants
              <span className="ml-2 text-xs font-normal text-muted-foreground">
                ({draft.variants.length})
              </span>
            </h2>
          </div>
          <div className="overflow-x-auto">
            <table className="w-full text-sm">
              <thead>
                <tr className="border-b border-border/60 bg-muted/30">
                  {['Configuration', 'Colour', 'SKU', 'Selling Price (£)', 'Compare At (£)', 'Stock', 'Status'].map(
                    (h) => (
                      <th
                        key={h}
                        className="text-left py-3 px-4 text-xs font-semibold text-muted-foreground uppercase tracking-wider whitespace-nowrap"
                      >
                        {h}
                      </th>
                    ),
                  )}
                </tr>
              </thead>
              <tbody className="divide-y divide-border/40">
                {draft.variants.map((v, idx) => (
                  <tr key={v._id || idx} className="hover:bg-muted/20 transition-colors">
                    <td className="py-3 px-4 font-medium text-foreground whitespace-nowrap">
                      {v.configName}
                    </td>
                    <td className="py-3 px-4">
                      <div className="flex items-center gap-2">
                        {v.colorHex && (
                          <span
                            className="w-4 h-4 rounded-full border border-border shrink-0"
                            style={{ backgroundColor: v.colorHex }}
                          />
                        )}
                        <span className="text-muted-foreground text-xs">{v.colorName}</span>
                      </div>
                    </td>
                    <td className="py-3 px-4 font-mono text-xs text-muted-foreground">{v.sku}</td>
                    <td className="py-3 px-4 font-semibold text-foreground">
                      £{v.price.toLocaleString('en-GB')}
                    </td>
                    <td className="py-3 px-4 text-muted-foreground text-xs">
                      {v.compareAtPrice ? `£${v.compareAtPrice.toLocaleString('en-GB')}` : '—'}
                    </td>
                    <td className="py-3 px-4 text-muted-foreground">{v.stock}</td>
                    <td className="py-3 px-4">
                      <span
                        className={`inline-flex items-center px-2 py-0.5 rounded-lg text-xs font-semibold ${
                          v.isActive
                            ? 'bg-emerald-50 text-emerald-700 dark:bg-emerald-950/40 dark:text-emerald-400'
                            : 'bg-muted text-muted-foreground'
                        }`}
                      >
                        {v.isActive ? 'Active' : 'Draft'}
                      </span>
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        </div>
      )}

      {/* Sticky Bottom Bar */}
      {!isProcessing && !isFailed && !isPublished && (
        <div className="fixed bottom-0 left-0 right-0 lg:left-64 z-20 bg-card/95 backdrop-blur border-t border-border px-4 py-3 flex items-center justify-between gap-3 shadow-lg">
          <div className="text-xs text-muted-foreground hidden sm:block">
            {canApprove && 'Review and edit the generated fields, then click Approve Draft.'}
            {canPublish && 'Draft is approved! Publish directly to the Luxa Furniture storefront.'}
          </div>
          <div className="flex items-center gap-2 ml-auto">
            {isDirty && (
              <Button
                onClick={handleSubmit(onSave)}
                disabled={isSaving}
                variant="outline"
                className="rounded-xl gap-2"
              >
                {isSaving ? <Loader2 size={14} className="animate-spin" /> : <Save size={14} />}
                Save
              </Button>
            )}
            {canApprove && (
              <Button
                onClick={handleApprove}
                disabled={isApproving || isDirty}
                className="rounded-xl gap-2 bg-primary text-primary-foreground hover:opacity-90"
              >
                {isApproving ? <Loader2 size={14} className="animate-spin" /> : <CheckCircle size={14} />}
                Approve Draft
              </Button>
            )}
            {canPublish && (
              <Button
                onClick={handlePublish}
                disabled={isPublishing}
                className="rounded-xl gap-2 bg-emerald-600 text-white hover:bg-emerald-700"
              >
                {isPublishing ? <Loader2 size={14} className="animate-spin" /> : <Send size={14} />}
                Publish Product
              </Button>
            )}
          </div>
        </div>
      )}
    </div>
  );
}
