'use client';

import React, { useState, useRef } from 'react';
import { useRouter } from 'next/navigation';
import Link from 'next/link';
import Image from 'next/image';
import {
  UploadCloud,
  X,
  Sparkles,
  ArrowLeft,
  Loader2,
  AlertCircle,
  FileText,
  ShieldCheck,
} from 'lucide-react';
import { toast } from 'sonner';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { listingAgentService } from '@/services/listingAgentService';

const MAX_IMAGES = 6;
const MAX_FILE_SIZE_BYTES = 5 * 1024 * 1024; // 5MB
const ALLOWED_MIME_TYPES = ['image/jpeg', 'image/png', 'image/webp'];

interface UploadFileItem {
  file: File;
  previewUrl: string;
}

export default function NewListingDraftPage() {
  const router = useRouter();
  const fileInputRef = useRef<HTMLInputElement>(null);

  const [files, setFiles] = useState<UploadFileItem[]>([]);
  const [costPrice, setCostPrice] = useState<string>('');
  const [stockLocation, setStockLocation] = useState<string>('UK warehouse');
  const [rawDetails, setRawDetails] = useState<string>('');
  const [fireSafetyConfirmed, setFireSafetyConfirmed] = useState<boolean>(false);
  const [isDragging, setIsDragging] = useState(false);
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [errorMessage, setErrorMessage] = useState<string | null>(null);

  const handleFilesAdded = (incomingFiles: FileList | File[]) => {
    setErrorMessage(null);
    const validItems: UploadFileItem[] = [];

    for (let i = 0; i < incomingFiles.length; i++) {
      const file = incomingFiles[i];

      if (!ALLOWED_MIME_TYPES.includes(file.type)) {
        toast.error(`"${file.name}" is not a supported image (JPG, PNG, or WEBP only).`);
        continue;
      }

      if (file.size > MAX_FILE_SIZE_BYTES) {
        toast.error(`"${file.name}" exceeds the 5MB size limit.`);
        continue;
      }

      if (files.length + validItems.length >= MAX_IMAGES) {
        toast.warning(`Maximum ${MAX_IMAGES} photos allowed.`);
        break;
      }

      validItems.push({
        file,
        previewUrl: URL.createObjectURL(file),
      });
    }

    if (validItems.length > 0) {
      setFiles((prev) => [...prev, ...validItems]);
    }
  };

  const handleDragOver = (e: React.DragEvent) => {
    e.preventDefault();
    setIsDragging(true);
  };

  const handleDragLeave = (e: React.DragEvent) => {
    e.preventDefault();
    setIsDragging(false);
  };

  const handleDrop = (e: React.DragEvent) => {
    e.preventDefault();
    setIsDragging(false);
    if (e.dataTransfer.files && e.dataTransfer.files.length > 0) {
      handleFilesAdded(e.dataTransfer.files);
    }
  };

  const handleRemoveFile = (index: number) => {
    setFiles((prev) => {
      const next = [...prev];
      URL.revokeObjectURL(next[index].previewUrl);
      next.splice(index, 1);
      return next;
    });
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setErrorMessage(null);

    const hasPhotos = files.length > 0;
    const hasText = rawDetails.trim().length > 0;

    if (!hasPhotos && !hasText) {
      const msg = 'Please provide either product photos or raw description notes (or both).';
      setErrorMessage(msg);
      toast.error(msg);
      return;
    }

    const costNum = costPrice ? Number(costPrice) : 0;
    if (costPrice && (isNaN(costNum) || costNum < 0)) {
      setErrorMessage('Please enter a valid cost price in GBP (£).');
      toast.error('Invalid cost price.');
      return;
    }

    setIsSubmitting(true);
    const formData = new FormData();
    if (costNum > 0) {
      formData.append('costPrice', costNum.toString());
    }
    formData.append('language', 'en'); // Output is always British English
    if (stockLocation.trim()) {
      formData.append('stockLocation', stockLocation.trim());
    }
    if (hasText) {
      formData.append('rawDetails', rawDetails.trim());
    }
    formData.append('fireSafetyLabelConfirmed', fireSafetyConfirmed ? 'true' : 'false');

    files.forEach((item) => {
      formData.append('images', item.file);
    });

    try {
      toast.loading('Analysing input with Claude AI & generating UK listing draft...', {
        id: 'create-draft',
      });
      const response = await listingAgentService.createDraft(formData);

      toast.success('Draft created! Processing UK catalogue listing...', {
        id: 'create-draft',
      });
      router.push(`/admin/listing-agent/${response.draftId}`);
    } catch (err: any) {
      const msg = err?.message || 'Failed to create listing draft.';
      setErrorMessage(msg);
      toast.error(msg, { id: 'create-draft' });
      setIsSubmitting(false);
    }
  };

  return (
    <div className="max-w-4xl mx-auto space-y-6">
      {/* Top Bar */}
      <div className="flex items-center justify-between border-b border-border pb-4">
        <Link
          href="/admin/listing-agent"
          className="inline-flex items-center gap-2 text-sm text-muted-foreground hover:text-foreground transition-colors"
        >
          <ArrowLeft size={16} />
          Back to Listing Agent
        </Link>
        <span className="text-xs bg-accent/15 text-accent font-semibold px-2.5 py-1 rounded-full flex items-center gap-1.5">
          <Sparkles size={13} />
          UK AI Listing Generator (Claude Sonnet)
        </span>
      </div>

      {/* Main Card */}
      <div className="bg-card rounded-3xl border border-border p-6 sm:p-8 shadow-xs">
        <div className="mb-6">
          <h1 className="text-2xl font-serif font-bold text-foreground">
            Create AI Listing Draft (UK Market)
          </h1>
          <p className="text-sm text-muted-foreground mt-1">
            Provide product photos and/or raw notes (in English, Urdu, or Roman Urdu).
            Claude AI will generate a ready-to-publish British English listing with VAT-inclusive pricing in GBP (£).
          </p>
        </div>

        {errorMessage && (
          <div className="mb-6 rounded-2xl border border-destructive/20 bg-destructive/5 p-4 flex items-center gap-3 text-destructive text-sm">
            <AlertCircle size={18} className="shrink-0" />
            <span>{errorMessage}</span>
          </div>
        )}

        <form onSubmit={handleSubmit} className="space-y-6">
          {/* Drag & Drop Photos Zone */}
          <div>
            <div className="flex items-center justify-between mb-2">
              <label className="text-sm font-medium text-foreground">
                Product Photos ({files.length} of {MAX_IMAGES})
              </label>
              <span className="text-xs text-muted-foreground">Optional if raw notes provided</span>
            </div>

            <div
              onDragOver={handleDragOver}
              onDragLeave={handleDragLeave}
              onDrop={handleDrop}
              onClick={() => fileInputRef.current?.click()}
              className={`border-2 border-dashed rounded-3xl p-8 text-center cursor-pointer transition-all ${
                isDragging
                  ? 'border-accent bg-accent/5'
                  : 'border-border hover:border-accent/50 hover:bg-muted/30'
              }`}
            >
              <input
                ref={fileInputRef}
                type="file"
                multiple
                accept="image/jpeg,image/png,image/webp"
                className="hidden"
                onChange={(e) => {
                  if (e.target.files) handleFilesAdded(e.target.files);
                  e.target.value = '';
                }}
              />

              <div className="mx-auto w-12 h-12 rounded-2xl bg-accent/15 text-accent flex items-center justify-center mb-3">
                <UploadCloud size={24} />
              </div>
              <p className="text-sm font-semibold text-foreground">
                Drag & drop product photos here, or{' '}
                <span className="text-accent underline">browse files</span>
              </p>
              <p className="text-xs text-muted-foreground mt-1">
                Upload 1 to 6 photos in JPG, PNG, or WEBP (Max 5MB each).
              </p>
            </div>

            {/* Previews Grid */}
            {files.length > 0 && (
              <div className="mt-4 grid grid-cols-2 sm:grid-cols-3 md:grid-cols-6 gap-3">
                {files.map((item, index) => (
                  <div
                    key={index}
                    className="relative group rounded-2xl overflow-hidden border border-border bg-muted aspect-square"
                  >
                    <Image
                      src={item.previewUrl}
                      alt={`Upload preview ${index + 1}`}
                      fill
                      sizes="(max-width: 768px) 50vw, 120px"
                      className="object-cover"
                    />

                    {index === 0 && (
                      <span className="absolute top-1.5 left-1.5 bg-black/70 text-white text-[10px] font-semibold px-1.5 py-0.5 rounded-md backdrop-blur-xs">
                        Main
                      </span>
                    )}

                    <button
                      type="button"
                      onClick={(e) => {
                        e.stopPropagation();
                        handleRemoveFile(index);
                      }}
                      className="absolute top-1.5 right-1.5 h-6 w-6 rounded-full bg-black/70 text-white flex items-center justify-center hover:bg-destructive transition-colors"
                      title="Remove image"
                    >
                      <X size={13} />
                    </button>

                    <div className="absolute bottom-0 inset-x-0 bg-gradient-to-t from-black/80 to-transparent p-1.5 text-[10px] text-white truncate">
                      {(item.file.size / (1024 * 1024)).toFixed(1)} MB
                    </div>
                  </div>
                ))}
              </div>
            )}
          </div>

          {/* Raw Text Details (Accepts Urdu, Roman Urdu, or English) */}
          <div className="space-y-1.5">
            <div className="flex items-center justify-between">
              <label className="text-sm font-medium text-foreground flex items-center gap-1.5">
                <FileText size={14} className="text-accent" />
                Raw Details / Seller Notes (English, Urdu, or Roman Urdu)
              </label>
              <span className="text-xs text-muted-foreground">Optional</span>
            </div>
            <textarea
              rows={3}
              placeholder="e.g. 3 seater velvet sofa in charcoal grey, oak legs. bohot achi condition me hai, perfect for modern living room. W 215cm x D 90cm..."
              value={rawDetails}
              onChange={(e) => setRawDetails(e.target.value)}
              className="w-full rounded-2xl border border-input bg-background px-3.5 py-2.5 text-sm placeholder:text-muted-foreground focus:outline-none focus:ring-2 focus:ring-ring resize-y leading-relaxed"
            />
            <p className="text-xs text-muted-foreground">
              You can write details in English, Urdu, or Roman Urdu. Claude translates and structures all content into British English.
            </p>
          </div>

          <div className="grid grid-cols-1 sm:grid-cols-3 gap-4">
            {/* Cost Price Input in GBP */}
            <div className="space-y-1.5">
              <label className="text-sm font-medium text-foreground">
                Cost price (£)
                <span className="text-xs text-muted-foreground ml-1.5">(Optional)</span>
              </label>
              <div className="relative">
                <span className="absolute inset-y-0 left-0 pl-3.5 flex items-center text-sm font-bold text-muted-foreground">
                  £
                </span>
                <Input
                  type="number"
                  min="0"
                  step="0.01"
                  placeholder="e.g. 250"
                  value={costPrice}
                  onChange={(e) => setCostPrice(e.target.value)}
                  className="pl-8 rounded-xl h-11"
                />
              </div>
              <p className="text-xs text-muted-foreground">
                Calculated with category margin + 20% UK VAT.
              </p>
            </div>

            {/* Stock Location */}
            <div className="space-y-1.5">
              <label className="text-sm font-medium text-foreground">
                Stock Location (UK)
              </label>
              <Input
                type="text"
                placeholder="e.g. UK warehouse"
                value={stockLocation}
                onChange={(e) => setStockLocation(e.target.value)}
                className="rounded-xl h-11"
              />
              <p className="text-xs text-muted-foreground">
                Stock is held in the UK. Mentioned in copy only if specified in notes.
              </p>
            </div>

            {/* Market Info */}
            <div className="space-y-1.5">
              <label className="text-sm font-medium text-foreground">
                Target Market & Language
              </label>
              <div className="rounded-xl border border-border bg-muted/40 p-3 text-xs text-muted-foreground flex items-center gap-2">
                <span className="text-base">🇬🇧</span>
                <div>
                  <p className="font-semibold text-foreground">United Kingdom (British English)</p>
                  <p className="text-[11px]">VAT-inclusive GBP (£) · UK furniture sizing (cm)</p>
                </div>
              </div>
            </div>
          </div>

          {/* UK Compliance Rail: Fire Safety Checkbox */}
          <div className="rounded-2xl border border-border bg-muted/20 p-4 space-y-2">
            <div className="flex items-start gap-3">
              <input
                type="checkbox"
                id="fireSafetyCheck"
                checked={fireSafetyConfirmed}
                onChange={(e) => setFireSafetyConfirmed(e.target.checked)}
                className="mt-1 h-4 w-4 rounded border-border text-primary focus:ring-primary"
              />
              <label htmlFor="fireSafetyCheck" className="text-xs cursor-pointer text-foreground">
                <span className="font-semibold block flex items-center gap-1.5">
                  <ShieldCheck size={14} className="text-accent" />
                  UK Fire Safety Label Confirmed (Permanent label present on item)
                </span>
                <span className="text-muted-foreground block mt-0.5">
                  Check this box if the physical UK fire safety compliance label (Furniture and Furnishings (Fire) (Safety) Regulations 1988) is present on upholstered items. Required before publishing to store.
                </span>
              </label>
            </div>
          </div>

          {/* Submit */}
          <div className="pt-4 border-t border-border flex items-center justify-end gap-3">
            <Link href="/admin/listing-agent">
              <Button type="button" variant="outline" className="rounded-xl">
                Cancel
              </Button>
            </Link>

            <Button
              type="submit"
              disabled={isSubmitting || (files.length === 0 && !rawDetails.trim())}
              className="rounded-xl gap-2 bg-primary text-primary-foreground hover:opacity-90 min-w-36"
            >
              {isSubmitting ? (
                <>
                  <Loader2 size={16} className="animate-spin" />
                  <span>Processing...</span>
                </>
              ) : (
                <>
                  <Sparkles size={16} />
                  <span>Generate Listing</span>
                </>
              )}
            </Button>
          </div>
        </form>
      </div>
    </div>
  );
}
