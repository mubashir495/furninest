import { z } from 'zod';

export type ListingDraftStatus =
  | 'queued'
  | 'analyzing'
  | 'pending_approval'
  | 'approved'
  | 'published'
  | 'failed';

export interface SpecificationItem {
  label: string;
  value: string;
}

export interface AnalysisData {
  category: string;
  material: string;
  color: string;
  style: string;
  seating?: number | null;
  features: string[];
  specifications?: SpecificationItem[];
  confidence: number;
  raw?: Record<string, any>;
}

export interface SeoData {
  title: string;
  slug: string;
  metaDescription: string;
  description: string;
  tags: string[];
}

export interface SuggestedPriceRange {
  min: number;
  max: number;
}

export interface PricingData {
  costPrice: number;
  marginRate: number;
  vatRate?: number;
  currency?: string;
  calculatedPrice: number;
  compareAtPrice: number | null;
  suggestedPriceRange?: SuggestedPriceRange | null;
}

export interface DraftVariant {
  _id?: string;
  configName: string;
  colorName: string;
  colorHex?: string;
  sku: string;
  price: number;
  compareAtPrice?: number | null;
  stock: number;
  dimensions?: string;
  material?: string;
  images: string[];
  needsPhoto?: boolean;
  suggested?: boolean;
  isActive: boolean;
}

export interface GeneratedImage {
  url: string;
  prompt: string;
  type: 'cleanup' | 'lifestyle' | 'other';
  isAiGenerated: boolean;
}

export interface ListingDraft {
  _id: string;
  sourceImages: string[];
  costPrice: number;
  status: ListingDraftStatus;
  analysis?: AnalysisData;
  seo?: SeoData;
  variants: DraftVariant[];
  pricing?: PricingData;
  generatedImages?: GeneratedImage[];
  reviewRequired: boolean;
  error?: string | null;
  publishedProductId?: string | null;
  categoryId?: string | null;
  subCategoryId?: string | null;
  language?: string;
  rawDetails?: string | null;
  fireSafetyLabelConfirmed?: boolean;
  stockLocation?: string;
  createdAt: string;
  updatedAt: string;
}

export interface ListingDraftsResponse {
  drafts: ListingDraft[];
  total: number;
  page: number;
  limit: number;
  totalPages: number;
}

export interface CreateDraftResponse {
  draftId: string;
  draft: ListingDraft;
}

export interface PublishDraftResponse {
  success: boolean;
  message: string;
  productId: string;
  product?: any;
}

// ── Zod Schema for Draft Form Editing ──────────────────────────────────────────

export const draftVariantSchema = z.object({
  _id: z.string().optional(),
  configName: z.string().min(1, 'Configuration name is required'),
  colorName: z.string().min(1, 'Colour name is required'),
  colorHex: z.string().optional().default(''),
  sku: z.string().min(1, 'SKU is required'),
  price: z.coerce.number().min(0, 'Price must be positive'),
  compareAtPrice: z.coerce.number().nullable().optional(),
  stock: z.coerce.number().int().min(0, 'Stock cannot be negative'),
  dimensions: z.string().optional().default(''),
  material: z.string().optional().default(''),
  images: z.array(z.string()).default([]),
  needsPhoto: z.boolean().default(false),
  suggested: z.boolean().default(true),
  isActive: z.boolean().default(false),
});

export const listingDraftFormSchema = z.object({
  title: z
    .string()
    .min(1, 'Title is required')
    .max(60, 'Title cannot exceed 60 characters'),
  slug: z
    .string()
    .min(1, 'Slug is required')
    .regex(/^[a-z0-9]+(?:-[a-z0-9]+)*$/, 'Slug must be valid kebab-case'),
  metaDescription: z
    .string()
    .min(1, 'Meta description is required')
    .max(155, 'Meta description cannot exceed 155 characters'),
  description: z.string().min(1, 'Description is required'),
  tags: z.array(z.string()).min(1, 'At least one tag is required'),
  calculatedPrice: z.coerce.number().min(0, 'Price must be positive'),
  compareAtPrice: z.coerce.number().nullable().optional(),
  fireSafetyLabelConfirmed: z
    .preprocess(
      (val) => (typeof val === 'string' ? val === 'true' : Boolean(val)),
      z.boolean(),
    )
    .default(false),
  stockLocation: z.string().default('UK warehouse'),
  variants: z.array(draftVariantSchema).min(1, 'At least one variant is required'),
});

export type ListingDraftFormValues = z.infer<typeof listingDraftFormSchema>;
