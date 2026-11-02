'use client';

import React, { useEffect, useState, useTransition, use } from 'react';
import Link from 'next/link';
import Image from 'next/image';
import { useRouter } from 'next/navigation';
import { useForm, useFieldArray, Controller } from 'react-hook-form';
import { zodResolver } from '@hookform/resolvers/zod';
import {
  Sparkles,
  ArrowLeft,
  RefreshCw,
  Save,
  CheckCircle2,
  Globe,
  RotateCcw,
  AlertTriangle,
  AlertCircle,
  Layers,
  Plus,
  Trash2,
  Eye,
  Info,
  Clock,
  Loader2,
  Image as ImageIcon,
  Check,
} from 'lucide-react';
import { toast } from 'sonner';

import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { LoadingSkeleton } from '@/components/ui/LoadingSkeleton';
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogFooter,
  DialogHeader,
  DialogTitle,
} from '@/components/ui/dialog';
import { StatusBadge } from '@/components/admin/listing-agent/StatusBadge';
import { listingAgentService } from '@/services/listingAgentService';
import {
  ListingDraft,
  ListingDraftStatus,
  ListingDraftFormValues,
  listingDraftFormSchema,
} from '@/Type/listing-agent';

interface PageProps {
  params: Promise<{ id: string }>;
}

export default function ListingDraftDetailPage({ params }: PageProps) {
  const { id } = use(params);
  const router = useRouter();

  const [draft, setDraft] = useState<ListingDraft | null>(null);
  const [isLoading, setIsLoading] = useState(true);
  const [selectedImageIndex, setSelectedImageIndex] = useState(0);
  const [isSaving, setIsSaving] = useState(false);
  const [isApproving, setIsApproving] = useState(false);
  const [isPublishing, setIsPublishing] = useState(false);
  const [isRetrying, setIsRetrying] = useState(false);
  const [publishDialogOpen, setPublishDialogOpen] = useState(false);
  const [tagInput, setTagInput] = useState('');

  // Setup Form
  const {
    register,
    control,
    handleSubmit,
    reset,
    watch,
    setValue,
    formState: { errors, isDirty, isValid },
  } = useForm<ListingDraftFormValues>({
    resolver: zodResolver(listingDraftFormSchema),
    defaultValues: {
      title: '',
      slug: '',
      metaDescription: '',
      description: '',
      tags: [],
      calculatedPrice: 0,
      compareAtPrice: null,
      variants: [],
    },
    mode: 'onChange',
  });

  const { fields, append, remove } = useFieldArray({
    control,
    name: 'variants',
  });

  // Watch fields for character counters
  const watchedTitle = watch('title') || '';
  const watchedMeta = watch('metaDescription') || '';
  const watchedTags = watch('tags') || [];
  const watchedPrice = watch('calculatedPrice') || 0;
  const watchedVariants = watch('variants') || [];

  // Fetch draft data
  const loadDraft = async (silent = false) => {
    if (!silent) setIsLoading(true);
    try {
      const data = await listingAgentService.getDraft(id);
      setDraft(data);

      // Populate form when data is ready
      reset({
        title: data.seo?.title || '',
        slug: data.seo?.slug || '',
        metaDescription: data.seo?.metaDescription || '',
        description: data.seo?.description || '',
        tags: data.seo?.tags || [],
        calculatedPrice: data.pricing?.calculatedPrice || data.costPrice * 1.4 || 0,
        compareAtPrice: data.pricing?.compareAtPrice || null,
        variants: (data.variants || []).map((v) => ({
          _id: v._id,
          configName: v.configName || 'Standard',
          colorName: v.colorName || 'Default',
          colorHex: v.colorHex || '',
          sku: v.sku || '',
          price: v.price || 0,
          compareAtPrice: v.compareAtPrice || null,
          stock: v.stock !== undefined ? v.stock : 0,
          dimensions: v.dimensions || '',
          material: v.material || '',
          images: v.images || [],
          needsPhoto: !!v.needsPhoto,
          suggested: v.suggested !== undefined ? v.suggested : true,
          isActive: !!v.isActive,
        })),
      });
    } catch (err: any) {
      toast.error(err?.message || 'Failed to load listing draft.');
    } finally {
      if (!silent) setIsLoading(false);
    }
  };

  useEffect(() => {
    loadDraft();
  }, [id]);

  // Polling every 3s while status is queued or analyzing
  useEffect(() => {
    let interval: NodeJS.Timeout | null = null;
    if (draft?.status === 'queued' || draft?.status === 'analyzing') {
      interval = setInterval(() => {
        loadDraft(true);
      }, 3000);
    }
    return () => {
      if (interval) clearInterval(interval);
    };
  }, [draft?.status, id]);

  // Add Tag chip
  const handleAddTag = () => {
    const trimmed = tagInput.trim().toLowerCase();
    if (!trimmed) return;
    if (!watchedTags.includes(trimmed)) {
      setValue('tags', [...watchedTags, trimmed], { shouldDirty: true, shouldValidate: true });
    }
    setTagInput('');
  };

  // Remove Tag chip
  const handleRemoveTag = (tagToRemove: string) => {
    setValue(
      'tags',
      watchedTags.filter((t) => t !== tagToRemove),
      { shouldDirty: true, shouldValidate: true },
    );
  };

  // Save changes (PATCH)
  const onSave = async (data: ListingDraftFormValues) => {
    setIsSaving(true);
    try {
      const updated = await listingAgentService.updateDraft(id, {
        seo: {
          title: data.title,
          slug: data.slug,
          metaDescription: data.metaDescription,
          description: data.description,
          tags: data.tags,
        },
        pricing: {
          costPrice: draft?.costPrice || 0,
          marginRate: draft?.pricing?.marginRate || 0.4,
          calculatedPrice: data.calculatedPrice,
          compareAtPrice: data.compareAtPrice || null,
        },
        variants: data.variants,
      });

      setDraft(updated);
      reset(data); // mark form as pristine
      toast.success('Listing draft changes saved successfully!');
    } catch (err: any) {
      toast.error(err?.message || 'Failed to save draft changes.');
    } finally {
      setIsSaving(false);
    }
  };

  // Approve Draft
  const handleApprove = async () => {
    if (isDirty) {
      toast.warning('Please save your changes before approving the draft.');
      return;
    }
    setIsApproving(true);
    try {
      const updated = await listingAgentService.approveDraft(id);
      setDraft(updated);
      toast.success('Draft approved! Ready to publish to live store.');
    } catch (err: any) {
      toast.error(err?.message || 'Failed to approve draft.');
    } finally {
      setIsApproving(false);
    }
  };

  // Check before opening publish dialog
  const handleOpenPublishDialog = () => {
    // Technical rule: Block Publish if any active variant has stock 0 or price missing
    const activeVariants = watchedVariants.filter((v) => v.isActive);

    if (activeVariants.length === 0) {
      toast.error('Cannot publish: At least one variant must be active (Is Active = ON).');
      return;
    }

    const invalidStockOrPrice = activeVariants.filter(
      (v) => !v.price || v.price <= 0 || v.stock === undefined || v.stock <= 0,
    );

    if (invalidStockOrPrice.length > 0) {
      toast.error(
        `Cannot publish: ${invalidStockOrPrice.length} active variant(s) have Stock of 0 or missing price. Please allocate stock and verify pricing before publishing.`,
        { duration: 5000 },
      );
      return;
    }

    setPublishDialogOpen(true);
  };

  // Publish Draft
  const handleConfirmPublish = async () => {
    setIsPublishing(true);
    try {
      const result = await listingAgentService.publishDraft(id);
      toast.success('Product successfully published to live store!');
      setPublishDialogOpen(false);
      await loadDraft(true);
    } catch (err: any) {
      toast.error(err?.message || 'Failed to publish product.');
    } finally {
      setIsPublishing(false);
    }
  };

  // Retry / Regenerate Draft
  const handleRetry = async () => {
    setIsRetrying(true);
    try {
      const updated = await listingAgentService.retryDraft(id);
      setDraft(updated);
      toast.info('Draft re-queued for AI analysis.');
    } catch (err: any) {
      toast.error(err?.message || 'Failed to retry draft.');
    } finally {
      setIsRetrying(false);
    }
  };

  if (isLoading || !draft) {
    return (
      <div className="max-w-6xl mx-auto space-y-6">
        <div className="flex items-center gap-3">
          <Link href="/admin/listing-agent">
            <Button variant="outline" size="sm" className="rounded-xl">
              <ArrowLeft size={16} />
            </Button>
          </Link>
          <div className="h-6 w-48 bg-muted animate-pulse rounded-md" />
        </div>
        <LoadingSkeleton rows={5} />
      </div>
    );
  }

  const isQueuedOrAnalyzing = draft.status === 'queued' || draft.status === 'analyzing';
  const isFailed = draft.status === 'failed';
  const isApproved = draft.status === 'approved';
  const isPublished = draft.status === 'published';

  return (
    <div className="max-w-6xl mx-auto space-y-6 pb-24">
      {/* Top Bar Navigation & Status */}
      <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-4 border-b border-border pb-4">
        <div className="flex items-center gap-3">
          <Link href="/admin/listing-agent">
            <Button variant="outline" size="sm" className="rounded-xl gap-2">
              <ArrowLeft size={16} />
              Drafts
            </Button>
          </Link>
          <div>
            <div className="flex items-center gap-2.5">
              <h1 className="text-xl font-serif font-bold text-foreground">
                {draft.seo?.title || `${draft.analysis?.category || 'Furniture'} Draft`}
              </h1>
              <StatusBadge status={draft.status} />
            </div>
            <p className="text-xs text-muted-foreground mt-0.5">
              Draft ID: <code className="bg-muted px-1.5 py-0.5 rounded text-[11px]">{draft._id}</code>
            </p>
          </div>
        </div>

        {/* Top Actions */}
        <div className="flex items-center gap-2">
          {isQueuedOrAnalyzing && (
            <div className="flex items-center gap-2 text-xs text-purple-700 dark:text-purple-300 font-medium bg-purple-50 dark:bg-purple-950/40 px-3 py-1.5 rounded-xl border border-purple-200 dark:border-purple-800">
              <Loader2 size={14} className="animate-spin" />
              <span>Polling every 3s...</span>
            </div>
          )}

          <Button
            variant="outline"
            size="sm"
            onClick={() => loadDraft(false)}
            className="rounded-xl gap-1.5"
            title="Refresh Draft"
          >
            <RefreshCw size={14} />
            Refresh
          </Button>

          <Button
            variant="outline"
            size="sm"
            onClick={handleRetry}
            disabled={isRetrying || isQueuedOrAnalyzing}
            className="rounded-xl gap-1.5"
            title="Re-run AI pipeline"
          >
            <RotateCcw size={14} className={isRetrying ? 'animate-spin' : ''} />
            Regenerate
          </Button>
        </div>
      </div>

      {/* Progress State while Queued or Analyzing */}
      {isQueuedOrAnalyzing && (
        <div className="bg-purple-50 dark:bg-purple-950/30 border border-purple-200 dark:border-purple-800 rounded-3xl p-6 text-center space-y-4">
          <div className="mx-auto w-12 h-12 rounded-2xl bg-purple-100 dark:bg-purple-900/50 text-purple-600 dark:text-purple-300 flex items-center justify-center animate-bounce">
            <Sparkles size={24} />
          </div>
          <div>
            <h3 className="text-base font-semibold text-purple-900 dark:text-purple-200">
              {draft.status === 'queued'
                ? 'Draft Queued in Processing Pipeline'
                : 'Gemini Vision AI is Analyzing Your Furniture Photos'}
            </h3>
            <p className="text-xs text-purple-700 dark:text-purple-300 max-w-md mx-auto mt-1">
              Extracting physical features, visible materials, aesthetics, and seating. Pricing,
              SEO descriptions, and configuration variants are being computed in parallel.
            </p>
          </div>
          <div className="w-full max-w-md mx-auto bg-purple-200/60 dark:bg-purple-900/60 h-2 rounded-full overflow-hidden">
            <div className="bg-purple-600 h-full rounded-full animate-pulse w-3/4" />
          </div>
        </div>
      )}

      {/* Error Banner when Failed */}
      {isFailed && (
        <div className="bg-rose-50 dark:bg-rose-950/30 border border-rose-200 dark:border-rose-800 rounded-2xl p-5 flex flex-col sm:flex-row sm:items-center justify-between gap-4">
          <div className="flex items-start gap-3">
            <AlertCircle size={20} className="text-rose-600 shrink-0 mt-0.5" />
            <div>
              <h4 className="text-sm font-semibold text-rose-900 dark:text-rose-200">
                AI Listing Pipeline Failed
              </h4>
              <p className="text-xs text-rose-700 dark:text-rose-300 mt-0.5">
                {draft.error || 'An unexpected error occurred during processing.'}
              </p>
            </div>
          </div>
          <Button
            size="sm"
            onClick={handleRetry}
            disabled={isRetrying}
            className="rounded-xl gap-2 bg-rose-600 hover:bg-rose-700 text-white shrink-0"
          >
            <RotateCcw size={14} className={isRetrying ? 'animate-spin' : ''} />
            Retry Analysis
          </Button>
        </div>
      )}

      {/* Review Required Warning Banner */}
      {draft.reviewRequired && (
        <div className="bg-amber-50 dark:bg-amber-950/30 border border-amber-200 dark:border-amber-800 rounded-2xl p-4 flex items-center gap-3">
          <AlertTriangle size={20} className="text-amber-600 shrink-0" />
          <div className="text-xs text-amber-900 dark:text-amber-200">
            <span className="font-semibold">Review Required:</span> Low AI confidence detected
            (confidence score &lt; 60%). Please review materials, seating, and features carefully
            before approval.
          </div>
        </div>
      )}

      {/* Published Notice */}
      {isPublished && draft.publishedProductId && (
        <div className="bg-blue-50 dark:bg-blue-950/30 border border-blue-200 dark:border-blue-800 rounded-2xl p-4 flex items-center justify-between gap-4">
          <div className="flex items-center gap-2.5 text-xs text-blue-900 dark:text-blue-200 font-medium">
            <CheckCircle2 size={18} className="text-blue-600" />
            <span>This listing is live in the product catalog.</span>
          </div>
          <Link
            href={`/dashboard/products`}
            className="text-xs font-semibold text-blue-700 dark:text-blue-300 hover:underline flex items-center gap-1"
          >
            <span>View in Products</span>
            <Globe size={13} />
          </Link>
        </div>
      )}

      {/* Grid: Left Column (Gallery & Analysis) | Right Column (Editable Form) */}
      <div className="grid grid-cols-1 lg:grid-cols-12 gap-6">
        {/* Left Column: Photos & Read-Only AI Analysis (4 cols) */}
        <div className="lg:col-span-5 space-y-6">
          {/* Source Images Gallery */}
          <div className="bg-card rounded-3xl border border-border p-5 shadow-xs">
            <div className="flex items-center justify-between mb-3">
              <h2 className="text-sm font-semibold text-foreground flex items-center gap-2">
                <ImageIcon size={16} className="text-accent" />
                Source Photos ({draft.sourceImages?.length || 0})
              </h2>
              <span className="text-[11px] text-muted-foreground">Original upload</span>
            </div>

            {/* Main Preview */}
            <div className="relative aspect-4/3 rounded-2xl overflow-hidden bg-muted border border-border mb-3">
              {draft.sourceImages?.[selectedImageIndex] ? (
                <Image
                  src={draft.sourceImages[selectedImageIndex]}
                  alt="Product view"
                  fill
                  sizes="(max-width: 768px) 100vw, 400px"
                  className="object-cover"
                />
              ) : (
                <div className="h-full w-full flex items-center justify-center text-muted-foreground">
                  No image available
                </div>
              )}
            </div>

            {/* Thumbnails */}
            {draft.sourceImages && draft.sourceImages.length > 1 && (
              <div className="flex items-center gap-2 overflow-x-auto pb-1">
                {draft.sourceImages.map((img, idx) => (
                  <button
                    key={idx}
                    type="button"
                    onClick={() => setSelectedImageIndex(idx)}
                    className={`relative h-14 w-14 shrink-0 rounded-xl overflow-hidden border-2 transition-all ${
                      selectedImageIndex === idx
                        ? 'border-accent shadow-xs scale-95'
                        : 'border-border/60 opacity-70 hover:opacity-100'
                    }`}
                  >
                    <Image src={img} alt={`Thumb ${idx + 1}`} fill className="object-cover" />
                  </button>
                ))}
              </div>
            )}
          </div>

          {/* Read-Only AI Analysis Panel */}
          <div className="bg-card rounded-3xl border border-border p-5 shadow-xs space-y-4">
            <div className="flex items-center justify-between border-b border-border pb-3">
              <h2 className="text-sm font-semibold text-foreground flex items-center gap-2">
                <Sparkles size={16} className="text-accent" />
                AI Visual Analysis
              </h2>
              {draft.analysis?.confidence !== undefined && (
                <div className="flex items-center gap-1.5 text-xs font-semibold">
                  <span className="text-muted-foreground">Confidence:</span>
                  <span
                    className={
                      draft.analysis.confidence >= 0.8
                        ? 'text-emerald-600'
                        : draft.analysis.confidence >= 0.6
                        ? 'text-amber-600'
                        : 'text-rose-600'
                    }
                  >
                    {(draft.analysis.confidence * 100).toFixed(0)}%
                  </span>
                </div>
              )}
            </div>

            {draft.analysis ? (
              <div className="space-y-3 text-xs">
                <div className="grid grid-cols-2 gap-2.5">
                  <div className="bg-muted/40 p-2.5 rounded-xl">
                    <span className="text-muted-foreground block text-[11px]">Category</span>
                    <span className="font-semibold text-foreground">
                      {draft.analysis.category || '—'}
                    </span>
                  </div>
                  <div className="bg-muted/40 p-2.5 rounded-xl">
                    <span className="text-muted-foreground block text-[11px]">Aesthetic Style</span>
                    <span className="font-semibold text-foreground">
                      {draft.analysis.style || '—'}
                    </span>
                  </div>
                  <div className="bg-muted/40 p-2.5 rounded-xl">
                    <span className="text-muted-foreground block text-[11px]">Visible Color</span>
                    <span className="font-semibold text-foreground">
                      {draft.analysis.color || '—'}
                    </span>
                  </div>
                  <div className="bg-muted/40 p-2.5 rounded-xl">
                    <span className="text-muted-foreground block text-[11px]">Detected Seating</span>
                    <span className="font-semibold text-foreground">
                      {draft.analysis.seating != null ? `${draft.analysis.seating} Seats` : 'N/A'}
                    </span>
                  </div>
                </div>

                <div className="bg-muted/40 p-2.5 rounded-xl">
                  <span className="text-muted-foreground block text-[11px] mb-1">
                    Primary Material
                  </span>
                  <span className="font-medium text-foreground">
                    {draft.analysis.material || '—'}
                  </span>
                </div>

                {draft.analysis.features && draft.analysis.features.length > 0 && (
                  <div>
                    <span className="text-muted-foreground block text-[11px] mb-1.5 font-medium">
                      Visible Physical Features (Verified in photos):
                    </span>
                    <div className="flex flex-wrap gap-1.5">
                      {draft.analysis.features.map((feat, i) => (
                        <span
                          key={i}
                          className="bg-accent/10 text-accent font-medium text-[11px] px-2 py-0.5 rounded-lg border border-accent/20"
                        >
                          {feat}
                        </span>
                      ))}
                    </div>
                  </div>
                )}
              </div>
            ) : (
              <p className="text-xs text-muted-foreground italic">
                Analysis will appear once processing completes.
              </p>
            )}
          </div>
        </div>

        {/* Right Column: Editable Product Listing Form (7 cols) */}
        <div className="lg:col-span-7 space-y-6">
          <form onSubmit={handleSubmit(onSave)} className="space-y-6">
            {/* SEO Content Card */}
            <div className="bg-card rounded-3xl border border-border p-6 shadow-xs space-y-5">
              <div className="flex items-center justify-between border-b border-border pb-3">
                <h2 className="text-sm font-semibold text-foreground">Product Information & SEO</h2>
                <span className="text-xs text-muted-foreground">Editable Form</span>
              </div>

              {/* Title with Counter */}
              <div>
                <div className="flex items-center justify-between mb-1.5">
                  <label className="text-xs font-semibold text-foreground">
                    Product Title <span className="text-destructive">*</span>
                  </label>
                  <span
                    className={`text-[11px] font-mono ${
                      watchedTitle.length > 60
                        ? 'text-destructive font-bold'
                        : watchedTitle.length > 50
                        ? 'text-amber-600'
                        : 'text-muted-foreground'
                    }`}
                  >
                    {watchedTitle.length} / 60
                  </span>
                </div>
                <Input
                  {...register('title')}
                  placeholder="e.g. Monaco Velvet 3-Seater Sofa"
                  className="rounded-xl"
                />
                {errors.title && (
                  <p className="text-xs text-destructive mt-1">{errors.title.message}</p>
                )}
              </div>

              {/* Slug */}
              <div>
                <label className="block text-xs font-semibold text-foreground mb-1.5">
                  URL Slug <span className="text-destructive">*</span>
                </label>
                <div className="relative">
                  <span className="absolute inset-y-0 left-0 pl-3 flex items-center text-xs text-muted-foreground">
                    /products/
                  </span>
                  <Input
                    {...register('slug')}
                    placeholder="monaco-velvet-3-seater-sofa"
                    className="pl-22 rounded-xl text-xs font-mono"
                  />
                </div>
                {errors.slug && (
                  <p className="text-xs text-destructive mt-1">{errors.slug.message}</p>
                )}
              </div>

              {/* Meta Description with Counter */}
              <div>
                <div className="flex items-center justify-between mb-1.5">
                  <label className="text-xs font-semibold text-foreground">
                    Meta Description <span className="text-destructive">*</span>
                  </label>
                  <span
                    className={`text-[11px] font-mono ${
                      watchedMeta.length > 155
                        ? 'text-destructive font-bold'
                        : watchedMeta.length > 140
                        ? 'text-amber-600'
                        : 'text-muted-foreground'
                    }`}
                  >
                    {watchedMeta.length} / 155
                  </span>
                </div>
                <textarea
                  {...register('metaDescription')}
                  rows={2}
                  placeholder="Compelling 1-2 sentence search summary..."
                  className="w-full text-xs rounded-xl border border-input bg-transparent p-3 focus:outline-none focus:ring-1 focus:ring-ring transition-colors"
                />
                {errors.metaDescription && (
                  <p className="text-xs text-destructive mt-1">{errors.metaDescription.message}</p>
                )}
              </div>

              {/* Full Description */}
              <div>
                <label className="block text-xs font-semibold text-foreground mb-1.5">
                  Full Catalog Description <span className="text-destructive">*</span>
                </label>
                <textarea
                  {...register('description')}
                  rows={5}
                  placeholder="Rich 2-3 paragraph product description..."
                  className="w-full text-xs rounded-xl border border-input bg-transparent p-3 focus:outline-none focus:ring-1 focus:ring-ring transition-colors leading-relaxed"
                />
                {errors.description && (
                  <p className="text-xs text-destructive mt-1">{errors.description.message}</p>
                )}
              </div>

              {/* Tags (Chip Input) */}
              <div>
                <label className="block text-xs font-semibold text-foreground mb-1.5">
                  Search Tags ({watchedTags.length})
                </label>
                <div className="flex flex-wrap gap-1.5 p-2 rounded-xl border border-input bg-muted/20 min-h-12 items-center">
                  {watchedTags.map((tag) => (
                    <span
                      key={tag}
                      className="inline-flex items-center gap-1 text-xs bg-muted text-foreground px-2.5 py-1 rounded-lg border border-border"
                    >
                      <span>{tag}</span>
                      <button
                        type="button"
                        onClick={() => handleRemoveTag(tag)}
                        className="text-muted-foreground hover:text-destructive"
                      >
                        ×
                      </button>
                    </span>
                  ))}
                  <input
                    type="text"
                    value={tagInput}
                    onChange={(e) => setTagInput(e.target.value)}
                    onKeyDown={(e) => {
                      if (e.key === 'Enter' || e.key === ',') {
                        e.preventDefault();
                        handleAddTag();
                      }
                    }}
                    placeholder={watchedTags.length === 0 ? 'Type tag and press Enter...' : '+ add...'}
                    className="text-xs bg-transparent focus:outline-none px-2 py-1 flex-1 min-w-28 text-foreground"
                  />
                </div>
                {errors.tags && (
                  <p className="text-xs text-destructive mt-1">{errors.tags.message}</p>
                )}
              </div>
            </div>

            {/* Base Pricing Card */}
            <div className="bg-card rounded-3xl border border-border p-6 shadow-xs space-y-4">
              <div className="flex items-center justify-between border-b border-border pb-3">
                <h2 className="text-sm font-semibold text-foreground">Base Catalog Pricing</h2>
                <span className="text-xs bg-accent/15 text-accent font-semibold px-2 py-0.5 rounded-md">
                  Ends in 999
                </span>
              </div>

              <div className="grid grid-cols-1 sm:grid-cols-3 gap-4">
                <div>
                  <label className="block text-xs font-medium text-muted-foreground mb-1">
                    Cost Price (Wholesale)
                  </label>
                  <div className="h-10 px-3 flex items-center bg-muted/50 rounded-xl text-sm font-semibold text-foreground border border-border/50">
                    Rs. {draft.costPrice.toLocaleString()}
                  </div>
                </div>

                <div>
                  <label className="block text-xs font-semibold text-foreground mb-1">
                    Calculated Selling Price <span className="text-destructive">*</span>
                  </label>
                  <Input
                    type="number"
                    {...register('calculatedPrice')}
                    className="rounded-xl h-10 font-semibold"
                  />
                  {errors.calculatedPrice && (
                    <p className="text-xs text-destructive mt-1">
                      {errors.calculatedPrice.message}
                    </p>
                  )}
                </div>

                <div>
                  <label className="block text-xs font-medium text-foreground mb-1">
                    Compare At Price (Sale / MSRP)
                  </label>
                  <Input
                    type="number"
                    {...register('compareAtPrice')}
                    placeholder="Optional"
                    className="rounded-xl h-10"
                  />
                </div>
              </div>
            </div>

            {/* Variants Editor Card */}
            <div className="bg-card rounded-3xl border border-border p-6 shadow-xs space-y-4">
              <div className="flex items-center justify-between border-b border-border pb-3">
                <div>
                  <h2 className="text-sm font-semibold text-foreground">
                    Product Variants ({fields.length})
                  </h2>
                  <p className="text-xs text-muted-foreground mt-0.5">
                    Configure sizes, colors, inventory stock, and availability.
                  </p>
                </div>

                <Button
                  type="button"
                  variant="outline"
                  size="sm"
                  onClick={() =>
                    append({
                      configName: 'Standard',
                      colorName: draft.analysis?.color || 'Custom',
                      colorHex: '',
                      sku: `LX-${Date.now().toString().slice(-6)}`,
                      price: watchedPrice || 0,
                      compareAtPrice: null,
                      stock: 0,
                      dimensions: '',
                      material: draft.analysis?.material || '',
                      images: [],
                      needsPhoto: true,
                      suggested: false,
                      isActive: false,
                    })
                  }
                  className="rounded-xl gap-1.5 text-xs"
                >
                  <Plus size={14} />
                  Add Variant
                </Button>
              </div>

              {errors.variants && (
                <p className="text-xs text-destructive">{errors.variants.message}</p>
              )}

              <div className="space-y-4">
                {fields.map((field, index) => {
                  const variant = watchedVariants[index];
                  const hasPhoto = variant?.images && variant.images.length > 0;
                  const needsPhoto = variant?.needsPhoto;
                  const isSuggested = variant?.suggested;

                  return (
                    <div
                      key={field.id}
                      className={`p-4 rounded-2xl border transition-colors ${
                        variant?.isActive
                          ? 'border-border bg-card'
                          : 'border-border/60 bg-muted/20 opacity-90'
                      }`}
                    >
                      {/* Variant Card Header */}
                      <div className="flex items-center justify-between pb-3 border-b border-border/60 mb-3">
                        <div className="flex items-center gap-2 flex-wrap">
                          <span className="font-semibold text-xs text-foreground">
                            Variant #{index + 1}:
                          </span>

                          {/* Suggested Badge */}
                          {isSuggested && (
                            <span className="inline-flex items-center gap-1 text-[10px] font-semibold bg-accent/15 text-accent border border-accent/20 px-2 py-0.5 rounded-full">
                              <Sparkles size={10} />
                              AI-suggested, verify
                            </span>
                          )}

                          {/* Needs Photo Badge */}
                          {needsPhoto && (
                            <span className="inline-flex items-center gap-1 text-[10px] font-semibold bg-amber-50 text-amber-800 dark:bg-amber-950/40 dark:text-amber-300 border border-amber-200 dark:border-amber-800 px-2 py-0.5 rounded-full">
                              <AlertTriangle size={10} />
                              Needs Photo
                            </span>
                          )}

                          {hasPhoto && (
                            <span className="inline-flex items-center gap-1 text-[10px] font-medium text-muted-foreground bg-muted px-2 py-0.5 rounded-full">
                              <ImageIcon size={10} />
                              {variant.images.length} photo(s)
                            </span>
                          )}
                        </div>

                        <div className="flex items-center gap-3">
                          {/* Active Toggle */}
                          <label className="flex items-center gap-1.5 cursor-pointer text-xs font-medium text-foreground select-none">
                            <input
                              type="checkbox"
                              {...register(`variants.${index}.isActive`)}
                              className="h-4 w-4 rounded accent-primary cursor-pointer"
                            />
                            <span>Active</span>
                          </label>

                          {/* Remove */}
                          {fields.length > 1 && (
                            <button
                              type="button"
                              onClick={() => remove(index)}
                              className="text-muted-foreground hover:text-destructive p-1 rounded-md transition-colors"
                              title="Delete variant"
                            >
                              <Trash2 size={14} />
                            </button>
                          )}
                        </div>
                      </div>

                      {/* Variant Inputs Grid */}
                      <div className="grid grid-cols-1 sm:grid-cols-2 md:grid-cols-4 gap-3 text-xs">
                        {/* Config Name */}
                        <div>
                          <label className="block text-[11px] font-medium text-muted-foreground mb-1">
                            Configuration / Size <span className="text-destructive">*</span>
                          </label>
                          <Input
                            {...register(`variants.${index}.configName`)}
                            placeholder="e.g. 3-Seater"
                            className="h-9 text-xs rounded-xl"
                          />
                        </div>

                        {/* Color Name */}
                        <div>
                          <label className="block text-[11px] font-medium text-muted-foreground mb-1">
                            Color <span className="text-destructive">*</span>
                          </label>
                          <Input
                            {...register(`variants.${index}.colorName`)}
                            placeholder="e.g. Charcoal Grey"
                            className="h-9 text-xs rounded-xl"
                          />
                        </div>

                        {/* SKU */}
                        <div>
                          <label className="block text-[11px] font-medium text-muted-foreground mb-1">
                            SKU <span className="text-destructive">*</span>
                          </label>
                          <Input
                            {...register(`variants.${index}.sku`)}
                            placeholder="SKU"
                            className="h-9 text-xs rounded-xl font-mono"
                          />
                        </div>

                        {/* Price */}
                        <div>
                          <label className="block text-[11px] font-semibold text-foreground mb-1">
                            Price (Rs.) <span className="text-destructive">*</span>
                          </label>
                          <Input
                            type="number"
                            {...register(`variants.${index}.price`)}
                            className="h-9 text-xs rounded-xl font-semibold"
                          />
                        </div>

                        {/* Compare At Price */}
                        <div>
                          <label className="block text-[11px] font-medium text-muted-foreground mb-1">
                            Compare At Price
                          </label>
                          <Input
                            type="number"
                            {...register(`variants.${index}.compareAtPrice`)}
                            placeholder="Optional"
                            className="h-9 text-xs rounded-xl"
                          />
                        </div>

                        {/* Stock */}
                        <div>
                          <label className="block text-[11px] font-semibold text-foreground mb-1">
                            Stock Quantity <span className="text-destructive">*</span>
                          </label>
                          <Input
                            type="number"
                            min="0"
                            {...register(`variants.${index}.stock`)}
                            className={`h-9 text-xs rounded-xl ${
                              variant?.isActive && (!variant?.stock || variant.stock === 0)
                                ? 'border-amber-500 bg-amber-50/50 dark:bg-amber-950/20'
                                : ''
                            }`}
                          />
                          {variant?.isActive && (!variant?.stock || variant.stock === 0) && (
                            <p className="text-[10px] text-amber-700 dark:text-amber-400 mt-0.5">
                              Stock 0 blocks publishing
                            </p>
                          )}
                        </div>

                        {/* Dimensions */}
                        <div>
                          <label className="block text-[11px] font-medium text-muted-foreground mb-1">
                            Dimensions
                          </label>
                          <Input
                            {...register(`variants.${index}.dimensions`)}
                            placeholder="e.g. 210 x 95 x 85 cm"
                            className="h-9 text-xs rounded-xl"
                          />
                        </div>

                        {/* Material */}
                        <div>
                          <label className="block text-[11px] font-medium text-muted-foreground mb-1">
                            Material
                          </label>
                          <Input
                            {...register(`variants.${index}.material`)}
                            placeholder="e.g. Luxury Velvet"
                            className="h-9 text-xs rounded-xl"
                          />
                        </div>
                      </div>
                    </div>
                  );
                })}
              </div>
            </div>

            {/* Bottom Action Bar (Fixed or Sticky) */}
            <div className="sticky bottom-4 z-20 bg-card/95 backdrop-blur-md border border-border p-4 rounded-2xl shadow-lg flex flex-col sm:flex-row sm:items-center justify-between gap-3">
              <div className="flex items-center gap-2 text-xs">
                {isDirty ? (
                  <span className="text-amber-600 font-semibold flex items-center gap-1.5">
                    <AlertCircle size={14} />
                    Unsaved changes
                  </span>
                ) : (
                  <span className="text-muted-foreground flex items-center gap-1.5">
                    <Check size={14} className="text-emerald-600" />
                    All changes saved
                  </span>
                )}
              </div>

              <div className="flex items-center gap-2 flex-wrap justify-end">
                {/* Save Button */}
                <Button
                  type="submit"
                  disabled={isSaving || isQueuedOrAnalyzing}
                  className="rounded-xl gap-2 bg-primary text-primary-foreground hover:opacity-90"
                >
                  {isSaving ? <Loader2 size={15} className="animate-spin" /> : <Save size={15} />}
                  <span>Save Changes</span>
                </Button>

                {/* Approve Button */}
                {!isApproved && !isPublished && (
                  <Button
                    type="button"
                    variant="outline"
                    onClick={handleApprove}
                    disabled={isApproving || isDirty || !isValid || isQueuedOrAnalyzing}
                    className="rounded-xl gap-1.5 text-emerald-700 dark:text-emerald-300 border-emerald-300 dark:border-emerald-800 hover:bg-emerald-50 dark:hover:bg-emerald-950/40"
                    title={
                      isDirty
                        ? 'Save changes before approving'
                        : 'Approve draft for live store publication'
                    }
                  >
                    {isApproving ? (
                      <Loader2 size={15} className="animate-spin" />
                    ) : (
                      <CheckCircle2 size={15} />
                    )}
                    <span>Approve Draft</span>
                  </Button>
                )}

                {/* Publish Button (Only visible when status === 'approved') */}
                {isApproved && (
                  <Button
                    type="button"
                    onClick={handleOpenPublishDialog}
                    disabled={isPublishing}
                    className="rounded-xl gap-2 bg-emerald-600 hover:bg-emerald-700 text-white font-semibold shadow-xs"
                  >
                    <Globe size={15} />
                    <span>Publish to Live Store</span>
                  </Button>
                )}

                {/* Generate Images Button (Disabled placeholder for Phase d) */}
                <div className="relative group inline-block">
                  <Button
                    type="button"
                    variant="outline"
                    disabled
                    className="rounded-xl gap-1.5 text-xs opacity-60 cursor-not-allowed"
                  >
                    <Sparkles size={14} />
                    <span>Generate AI Images</span>
                  </Button>
                  <div className="absolute bottom-full mb-1.5 left-1/2 -translate-x-1/2 hidden group-hover:block bg-black text-white text-[10px] font-medium px-2 py-1 rounded shadow-md whitespace-nowrap z-30">
                    Coming soon in Phase (d)
                  </div>
                </div>
              </div>
            </div>
          </form>
        </div>
      </div>

      {/* Confirmation Modal Dialog for Publishing */}
      <Dialog open={publishDialogOpen} onOpenChange={setPublishDialogOpen}>
        <DialogContent className="sm:max-w-md rounded-2xl">
          <DialogHeader>
            <DialogTitle className="flex items-center gap-2 text-foreground font-serif text-lg">
              <Globe size={20} className="text-emerald-600" />
              Publish Product to Live Store?
            </DialogTitle>
            <DialogDescription className="text-xs text-muted-foreground pt-1.5">
              This will create a permanent live Product entry on Luxa Furniture with your approved
              title, pricing, description, and variants. It will also trigger instant ISR
              revalidation on the customer storefront.
            </DialogDescription>
          </DialogHeader>

          <div className="p-3 bg-muted/40 rounded-xl space-y-2 text-xs">
            <div className="flex justify-between">
              <span className="text-muted-foreground">Product Title:</span>
              <span className="font-semibold text-foreground truncate max-w-xs">{watchedTitle}</span>
            </div>
            <div className="flex justify-between">
              <span className="text-muted-foreground">Active Variants:</span>
              <span className="font-semibold text-foreground">
                {watchedVariants.filter((v) => v.isActive).length} variant(s)
              </span>
            </div>
            <div className="flex justify-between">
              <span className="text-muted-foreground">Base Selling Price:</span>
              <span className="font-semibold text-emerald-600">
                Rs. {Number(watchedPrice).toLocaleString()}
              </span>
            </div>
          </div>

          <DialogFooter className="gap-2 sm:gap-0 pt-2">
            <Button
              type="button"
              variant="outline"
              onClick={() => setPublishDialogOpen(false)}
              className="rounded-xl"
            >
              Cancel
            </Button>
            <Button
              type="button"
              onClick={handleConfirmPublish}
              disabled={isPublishing}
              className="rounded-xl gap-2 bg-emerald-600 hover:bg-emerald-700 text-white"
            >
              {isPublishing ? (
                <>
                  <Loader2 size={15} className="animate-spin" />
                  <span>Publishing...</span>
                </>
              ) : (
                <>
                  <Check size={15} />
                  <span>Confirm & Publish</span>
                </>
              )}
            </Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>
    </div>
  );
}
