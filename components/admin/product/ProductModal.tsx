'use client';

import React, { useEffect, useState, useRef } from 'react';
import { X, Save, Loader2, ImagePlus, Plus, Trash2, ChevronDown, ChevronUp, ChevronLeft, ChevronRight, Star } from 'lucide-react';
import { colors } from '@/config/colors';
import { Product, ProductFormData, Category, SubCategory } from '@/Type/products';
import { ProductVariant } from '@/Type/product';
import { productService } from '@/services/productService';
import ProductImageUpload from './ProductImageUpload';
import { useCategories, useSubCategories, useAllProducts } from '@/hooks/useProducts';


interface ProductModalProps {
  isOpen: boolean;
  onClose: () => void;
  onSubmit: (data: ProductFormData, images: File[], thumbnail: File | null) => Promise<void>;
  initialData?: Product | null;
  loading?: boolean;
  scrollToVariants?: boolean;
}

// Pulls a plain string id out of a value that may be a populated object or already an id
const toId = (value: unknown): string => {
  if (!value) return '';
  if (typeof value === 'string') return value;
  if (typeof value === 'object' && value !== null && '_id' in (value as any)) {
    return String((value as any)._id);
  }
  return String(value);
};

const HEX_RE = /^#([0-9A-Fa-f]{6})$/;
const VARIANT_IMAGE_TYPES = ['image/jpeg', 'image/png', 'image/webp'];
const MAX_VARIANT_IMAGE_BYTES = 5 * 1024 * 1024;

function emptyProductForm(): ProductFormData {
  return {
    name: '',
    shortDescription: '',
    longDescription: '',
    subCategory: '',
    price: 0,
    discount: 0,
    stock: 0,
    images: [],
    color: [],
    size: [],
    suggestionItems: [],
    brand: '',
    material: '',
    dimensions: '',
    careInstructions: '',
    seoTitle: '',
    seoDescription: '',
    features: [],
    specifications: [{ label: '', value: '' }],
    isFeatured: false,
    isActive: true,
  };
}

function variantsFromRes(res: unknown, fallback: ProductVariant[]): ProductVariant[] {
  const root = res as { data?: unknown } | null;
  const first = (root && typeof root === 'object' && 'data' in root ? root.data : root) as
    | { data?: unknown; variants?: ProductVariant[] }
    | undefined;
  if (Array.isArray(first?.variants)) return first.variants;
  const nested = first?.data as { variants?: ProductVariant[] } | undefined;
  if (Array.isArray(nested?.variants)) return nested.variants;
  return fallback;
}

function validateVariantImageFiles(files: File[]): string | null {
  for (const file of files) {
    if (!VARIANT_IMAGE_TYPES.includes(file.type)) return `${file.name}: only JPEG, PNG or WEBP allowed.`;
    if (file.size > MAX_VARIANT_IMAGE_BYTES) return `${file.name}: must be 5MB or smaller.`;
  }
  return null;
}

type VariantDraft = {
  configName: string;
  colorName: string;
  colorHex: string;
  sku: string;
  price: string;
  salePrice: string;
  stock: string;
  dimensions: string;
  material: string;
  weight: string;
  isActive: boolean;
};

function draftFromVariant(v: ProductVariant): VariantDraft {
  return {
    configName: v.configName,
    colorName: v.colorName ?? '',
    colorHex: v.colorHex ?? '#D4A373',
    sku: v.sku ?? '',
    price: String(v.price),
    salePrice: v.salePrice != null ? String(v.salePrice) : '',
    stock: String(v.stock),
    dimensions: v.dimensions ?? '',
    material: v.material ?? '',
    weight: v.weight != null ? String(v.weight) : '',
    isActive: v.isActive,
  };
}

const blankVariantForm: VariantDraft = {
  configName: '',
  colorName: '',
  colorHex: '#D4A373',
  sku: '',
  price: '',
  salePrice: '',
  stock: '0',
  dimensions: '',
  material: '',
  weight: '',
  isActive: true,
};

function validateVariantDraft(draft: VariantDraft, siblings: ProductVariant[], exceptId?: string): string | null {
  if (!draft.configName.trim()) return 'Configuration name is required.';
  const price = Number(draft.price);
  const stock = Number(draft.stock);
  if (!Number.isFinite(price) || price < 0) return 'Price must be 0 or greater.';
  if (!Number.isInteger(stock) || stock < 0) return 'Stock must be a whole number of 0 or greater.';
  if (draft.colorHex && !HEX_RE.test(draft.colorHex)) return 'Colour hex must be in #RRGGBB format.';
  if (draft.salePrice !== '') {
    const sale = Number(draft.salePrice);
    if (!Number.isFinite(sale) || sale < 0) return 'Sale price must be 0 or greater.';
    if (sale >= price) return 'Sale price must be lower than price.';
  }
  const combo = `${draft.configName.trim().toLowerCase()}|${draft.colorName.trim().toLowerCase()}`;
  const duplicate = siblings.some(
    (v) =>
      v._id !== exceptId &&
      `${v.configName.trim().toLowerCase()}|${(v.colorName ?? '').trim().toLowerCase()}` === combo,
  );
  if (duplicate) return 'This configuration + colour combination already exists.';
  return null;
}

function draftToAddForm(draft: VariantDraft, files: File[]): FormData {
  const form = new FormData();
  form.append('configName', draft.configName.trim());
  form.append('colorName', draft.colorName.trim());
  if (draft.colorHex) form.append('colorHex', draft.colorHex);
  if (draft.sku.trim()) form.append('sku', draft.sku.trim());
  form.append('price', String(Number(draft.price)));
  if (draft.salePrice !== '') form.append('salePrice', draft.salePrice);
  form.append('stock', String(Number(draft.stock)));
  if (draft.dimensions) form.append('dimensions', draft.dimensions);
  if (draft.material) form.append('material', draft.material);
  if (draft.weight !== '') form.append('weight', draft.weight);
  form.append('isActive', String(draft.isActive));
  files.forEach((file) => form.append('images', file));
  return form;
}

function changedVariantPayload(original: ProductVariant, draft: VariantDraft): Record<string, unknown> {
  const payload: Record<string, unknown> = {};
  if (draft.configName.trim() !== original.configName) payload.configName = draft.configName.trim();
  if (draft.colorName.trim() !== (original.colorName ?? '')) payload.colorName = draft.colorName.trim();
  if ((draft.colorHex || '') !== (original.colorHex ?? '')) payload.colorHex = draft.colorHex;
  if (draft.sku.trim() !== (original.sku ?? '')) payload.sku = draft.sku.trim();
  const price = Number(draft.price);
  if (price !== original.price) payload.price = price;
  const sale = draft.salePrice === '' ? null : Number(draft.salePrice);
  const origSale = original.salePrice ?? null;
  if (sale !== origSale) payload.salePrice = sale;
  if (draft.dimensions !== (original.dimensions ?? '')) payload.dimensions = draft.dimensions;
  if (draft.material !== (original.material ?? '')) payload.material = draft.material;
  const weight = draft.weight === '' ? null : Number(draft.weight);
  const origWeight = original.weight ?? null;
  if (weight !== origWeight) payload.weight = weight;
  if (draft.isActive !== original.isActive) payload.isActive = draft.isActive;
  return payload;
}

const modalStyles = {
  overlay: {
    position: 'fixed' as const,
    inset: 0,
    background: 'rgba(0,0,0,.55)',
    display: 'flex',
    justifyContent: 'center',
    alignItems: 'center',
    zIndex: 999,
    padding: '20px',
  },
  modal: {
    width: '100%',
    maxWidth: '1200px',
    maxHeight: '90vh',
    overflowY: 'auto' as const,
    background: colors.background,
    borderRadius: colors.radius.xl,
    boxShadow: colors.shadow.xl,
    transformOrigin: 'center',
    transform: 'scaleX(1)',
    transition: 'transform 0.2s ease, opacity 0.2s ease',
  },
  header: {
    display: 'flex',
    justifyContent: 'space-between',
    alignItems: 'center',
    padding: '20px',
    borderBottom: `1px solid ${colors.border}`,
  },
  body: {
    padding: '20px',
  },
  footer: {
    display: 'flex',
    justifyContent: 'flex-end',
    gap: '12px',
    padding: '20px',
    borderTop: `1px solid ${colors.border}`,
  },
  formGroup: {
    marginBottom: '18px',
  },
  row: {
    display: 'grid',
    gridTemplateColumns: '1fr 1fr',
    gap: '20px',
  },
  input: {
    width: '100%',
    padding: '10px 14px',
    border: `1px solid ${colors.border}`,
    borderRadius: colors.radius.md,
    outline: 'none',
    fontSize: '14px',
    background: '#fff',
  },
  textarea: {
    width: '100%',
    minHeight: '120px',
    padding: '12px',
    border: `1px solid ${colors.border}`,
    borderRadius: colors.radius.md,
    resize: 'vertical' as const,
    background: '#fff',
  },
  select: {
    width: '100%',
    padding: '10px 14px',
    border: `1px solid ${colors.border}`,
    borderRadius: colors.radius.md,
    background: '#fff',
  },
  label: {
    display: 'block',
    marginBottom: '6px',
    fontWeight: 600,
    fontSize: '14px',
  },
  error: {
    color: 'red',
    fontSize: '13px',
    marginTop: '5px',
  },
  button: {
    padding: '10px 18px',
    border: 'none',
    borderRadius: colors.radius.md,
    cursor: 'pointer',
    fontSize: '14px',
    fontWeight: 500,
  },
  primaryButton: {
    background: colors.primary[500],
    color: '#fff',
  },
  secondaryButton: {
    background: '#e5e7eb',
    color: '#333',
  },
  buttonDisabled: {
    opacity: 0.6,
    cursor: 'not-allowed',
  },
  thumbnailWrap: {
    display: 'flex',
    alignItems: 'center',
    gap: '16px',
  },
  thumbnailPreview: {
    width: '110px',
    height: '110px',
    borderRadius: colors.radius.md,
    objectFit: 'cover' as const,
    border: `1px solid ${colors.border}`,
    background: colors.surface,
  },
  thumbnailDropzone: {
    width: '110px',
    height: '110px',
    borderRadius: colors.radius.md,
    border: `2px dashed ${colors.border}`,
    background: colors.surface,
    display: 'flex',
    flexDirection: 'column' as const,
    alignItems: 'center',
    justifyContent: 'center',
    cursor: 'pointer',
    color: colors.text.muted,
    gap: '4px',
    textAlign: 'center' as const,
    fontSize: '11px',
    padding: '8px',
  },
  suggestionsBox: {
    border: `1px solid ${colors.border}`,
    borderRadius: colors.radius.md,
    maxHeight: '220px',
    overflowY: 'auto' as const,
    padding: '8px',
    background: colors.surface,
  },
  suggestionRow: {
    display: 'flex',
    alignItems: 'center',
    gap: '10px',
    padding: '6px 8px',
    borderRadius: colors.radius.sm,
    cursor: 'pointer',
  },
  suggestionThumb: {
    width: '32px',
    height: '32px',
    borderRadius: colors.radius.sm,
    objectFit: 'cover' as const,
    border: `1px solid ${colors.border}`,
    background: '#fff',
    flexShrink: 0,
  },
};

function VariantFields({
  draft,
  onChange,
  idPrefix,
}: {
  draft: VariantDraft;
  onChange: (patch: Partial<VariantDraft>) => void;
  idPrefix: string;
}) {
  const pickerHex = HEX_RE.test(draft.colorHex) ? draft.colorHex : '#D4A373';
  return (
    <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: '12px' }}>
      <div>
        <label style={modalStyles.label} htmlFor={`${idPrefix}-config`}>Configuration *</label>
        <input
          id={`${idPrefix}-config`}
          type="text"
          placeholder="e.g. 3-Seater, 5-Seater, Single Chair…"
          value={draft.configName}
          onChange={(e) => onChange({ configName: e.target.value })}
          style={modalStyles.input}
        />
      </div>
      <div>
        <label style={modalStyles.label} htmlFor={`${idPrefix}-color-name`}>Colour name</label>
        <input
          id={`${idPrefix}-color-name`}
          type="text"
          placeholder="e.g. Beige"
          value={draft.colorName}
          onChange={(e) => onChange({ colorName: e.target.value })}
          style={modalStyles.input}
        />
      </div>
      <div>
        <label style={modalStyles.label} htmlFor={`${idPrefix}-color-hex`}>Colour hex</label>
        <div style={{ display: 'flex', gap: '8px', alignItems: 'center' }}>
          <input
            type="color"
            aria-label="Colour picker"
            value={pickerHex}
            onChange={(e) => onChange({ colorHex: e.target.value.toUpperCase() })}
            style={{ width: '40px', height: '40px', padding: 0, border: `1px solid ${colors.border}`, background: 'transparent', cursor: 'pointer' }}
          />
          <input
            id={`${idPrefix}-color-hex`}
            type="text"
            placeholder="#D4A373"
            value={draft.colorHex}
            onChange={(e) => onChange({ colorHex: e.target.value })}
            style={modalStyles.input}
          />
        </div>
      </div>
      <div>
        <label style={modalStyles.label} htmlFor={`${idPrefix}-sku`}>SKU</label>
        <input
          id={`${idPrefix}-sku`}
          type="text"
          placeholder="e.g. SOFA-3S-BEI"
          value={draft.sku}
          onChange={(e) => onChange({ sku: e.target.value })}
          style={modalStyles.input}
        />
      </div>
      <div>
        <label style={modalStyles.label} htmlFor={`${idPrefix}-price`}>Price *</label>
        <input
          id={`${idPrefix}-price`}
          type="number"
          min={0}
          step="0.01"
          value={draft.price}
          onChange={(e) => onChange({ price: e.target.value })}
          style={modalStyles.input}
        />
      </div>
      <div>
        <label style={modalStyles.label} htmlFor={`${idPrefix}-sale`}>Sale price (empty = no sale)</label>
        <input
          id={`${idPrefix}-sale`}
          type="number"
          min={0}
          step="0.01"
          placeholder="Leave blank to clear"
          value={draft.salePrice}
          onChange={(e) => onChange({ salePrice: e.target.value })}
          style={modalStyles.input}
        />
      </div>
      <div>
        <label style={modalStyles.label} htmlFor={`${idPrefix}-stock`}>Stock</label>
        <input
          id={`${idPrefix}-stock`}
          type="number"
          min={0}
          step={1}
          value={draft.stock}
          onChange={(e) => onChange({ stock: e.target.value })}
          style={modalStyles.input}
        />
      </div>
      <div>
        <label style={modalStyles.label} htmlFor={`${idPrefix}-weight`}>Weight</label>
        <input
          id={`${idPrefix}-weight`}
          type="number"
          min={0}
          step="0.01"
          value={draft.weight}
          onChange={(e) => onChange({ weight: e.target.value })}
          style={modalStyles.input}
        />
      </div>
      <div>
        <label style={modalStyles.label} htmlFor={`${idPrefix}-dimensions`}>Dimensions</label>
        <input
          id={`${idPrefix}-dimensions`}
          type="text"
          placeholder="W220 × D90 × H85 cm"
          value={draft.dimensions}
          onChange={(e) => onChange({ dimensions: e.target.value })}
          style={modalStyles.input}
        />
      </div>
      <div>
        <label style={modalStyles.label} htmlFor={`${idPrefix}-material`}>Material</label>
        <input
          id={`${idPrefix}-material`}
          type="text"
          placeholder="e.g. Velvet, Linen"
          value={draft.material}
          onChange={(e) => onChange({ material: e.target.value })}
          style={modalStyles.input}
        />
      </div>
      <div style={{ display: 'flex', alignItems: 'center', gap: '10px', paddingTop: '22px' }}>
        <input
          type="checkbox"
          id={`${idPrefix}-active`}
          checked={draft.isActive}
          onChange={(e) => onChange({ isActive: e.target.checked })}
        />
        <label htmlFor={`${idPrefix}-active`} style={{ fontSize: '13px', cursor: 'pointer' }}>Active</label>
      </div>
    </div>
  );
}

export default function ProductModal({
  isOpen,
  onClose,
  onSubmit,
  initialData,
  loading = false,
  scrollToVariants = false,
}: ProductModalProps) {
  const [formData, setFormData] = useState<ProductFormData>(emptyProductForm());
  const [featureInput, setFeatureInput] = useState('');

  const [selectedCategory, setSelectedCategory] = useState('');
  const [imageFiles, setImageFiles] = useState<File[]>([]);
  const [existingImages, setExistingImages] = useState<string[]>([]);

  // Thumbnail (single, required, kept separate from the gallery images)
  const [thumbnailFile, setThumbnailFile] = useState<File | null>(null);
  const [thumbnailPreview, setThumbnailPreview] = useState<string>('');
  const [existingThumbnail, setExistingThumbnail] = useState<string>('');

  const [errors, setErrors] = useState<Record<string, string>>({});
  const [submitError, setSubmitError] = useState<string>('');
  const [submitting, setSubmitting] = useState(false);
  const [submitMode, setSubmitMode] = useState<'draft' | 'publish'>('publish');

  const [colorInput, setColorInput] = useState('');
  const [sizeInput, setSizeInput] = useState('');

  // ── Variant management state ─────────────────────────────────────────────
  const [variants, setVariants] = useState<ProductVariant[]>([]);
  const [variantSection, setVariantSection] = useState(false); // collapsed by default
  const [editingVariantId, setEditingVariantId] = useState<string | null>(null);
  const [variantLoading, setVariantLoading] = useState(false);
  const [variantError, setVariantError] = useState('');
  const [variantImageFiles, setVariantImageFiles] = useState<File[]>([]);
  const [variantBusyId, setVariantBusyId] = useState<string | null>(null);
  const [variantDrafts, setVariantDrafts] = useState<Record<string, VariantDraft>>({});
  const [variantForm, setVariantForm] = useState<VariantDraft>(blankVariantForm);

  const { categories, loading: categoriesLoading } = useCategories();
  const { subCategories, loading: subCategoriesLoading } = useSubCategories(selectedCategory);
  const { products: suggestionCandidates, loading: suggestionsLoading } = useAllProducts(initialData?._id);

  // Tracks whether the last submit was "draft" or "publish"
  const submitModeRef = useRef<'draft' | 'publish'>('publish');

  useEffect(() => {
    setErrors({});
    setSubmitError('');

    if (initialData) {
      const categoryId = typeof initialData.category === 'object'
        ? (initialData.category as Category)._id
        : initialData.category;

      const subCategoryId = typeof initialData.subCategory === 'object'
        ? (initialData.subCategory as SubCategory)._id
        : initialData.subCategory;

      setSelectedCategory(categoryId);

      setFormData({
        name: initialData.name,
        shortDescription: initialData.shortDescription || '',
        longDescription: initialData.longDescription || '',
        subCategory: subCategoryId,
        price: initialData.price,
        discount: initialData.discount || 0,
        stock: initialData.stock,
        images: initialData.images || [],
        color: initialData.color || [],
        size: initialData.size || [],
        suggestionItems: (initialData.suggestionItems || []).map(toId),
        brand: initialData.brand || '',
        material: initialData.material || '',
        dimensions: initialData.dimensions || '',
        careInstructions: initialData.careInstructions || '',
        seoTitle: initialData.seoTitle || '',
        seoDescription: initialData.seoDescription || '',
        features: initialData.features || [],
        specifications: initialData.specifications?.length ? initialData.specifications : [{ label: '', value: '' }],
        isFeatured: Boolean(initialData.isFeatured),
        isActive: initialData.isActive !== false,
      });

      setExistingImages(initialData.images || []);

      // Thumbnail (existing URL, edit mode)
      setThumbnailFile(null);
      setThumbnailPreview('');
      setExistingThumbnail(initialData.thumbnailImage || '');
      // Sync variants
      const loadedVariants = (initialData.variants as ProductVariant[] | undefined) ?? [];
      setVariants(loadedVariants);
      setVariantDrafts(Object.fromEntries(loadedVariants.map((v) => [v._id, draftFromVariant(v)])));
      setVariantForm(blankVariantForm);
      setEditingVariantId(null);
      setVariantError('');
      setFeatureInput('');
      setVariantSection(true);
    } else {
      setSelectedCategory('');
      setImageFiles([]);
      setExistingImages([]);
      setErrors({});
      setColorInput('');
      setSizeInput('');
      setThumbnailFile(null);
      setThumbnailPreview('');
      setExistingThumbnail('');
      setVariants([]);
      setVariantDrafts({});
      setVariantForm(blankVariantForm);
      setEditingVariantId(null);
      setVariantError('');
      setFeatureInput('');
      setVariantSection(false);
      setFormData(emptyProductForm());
    }
  }, [initialData]);

  // Auto-scroll to variants section when opened via "Manage Variants" button
  useEffect(() => {
    if (isOpen && scrollToVariants && initialData?._id) {
      setTimeout(() => {
        const el = document.getElementById('variant-section-anchor');
        if (el) el.scrollIntoView({ behavior: 'smooth', block: 'start' });
      }, 300);
    }
  }, [isOpen, scrollToVariants, initialData?._id]);

  if (!isOpen) return null;

  const validateForm = (): boolean => {
    const newErrors: Record<string, string> = {};

    if (!formData.name.trim()) {
      newErrors.name = 'Product name is required';
    }

    if (!selectedCategory) {
      newErrors.category = 'Category is required';
    }

    if (!formData.subCategory) {
      newErrors.subCategory = 'Sub Category is required';
    }

    if (!formData.shortDescription.trim()) {
      newErrors.shortDescription = 'Short description is required';
    }

    if (!formData.longDescription.trim()) {
      newErrors.longDescription = 'Long description is required';
    }

    if (formData.price <= 0) {
      newErrors.price = 'Price must be greater than 0';
    }

    if (formData.discount < 0) {
      newErrors.discount = 'Discount cannot be negative';
    }

    if (formData.discount > 100) {
      newErrors.discount = 'Discount cannot exceed 100';
    }

    if (formData.stock < 0) {
      newErrors.stock = 'Stock cannot be negative';
    }

    if (imageFiles.length === 0 && existingImages.length === 0) {
      newErrors.images = 'At least one product image is required';
    }

    if (!thumbnailFile && !existingThumbnail) {
      newErrors.thumbnail = 'Thumbnail image is required';
    }

    if ((formData.seoTitle || '').length > 70) {
      newErrors.seoTitle = 'SEO title must be 70 characters or fewer';
    }
    if ((formData.seoDescription || '').length > 170) {
      newErrors.seoDescription = 'SEO description must be 170 characters or fewer';
    }

    setErrors(newErrors);

    // Scroll to the first error field
    const hasErrors = Object.keys(newErrors).length > 0;
    if (hasErrors) {
      const firstKey = Object.keys(newErrors)[0];
      // field id mapping
      const idMap: Record<string, string> = {
        name: 'field-name',
        category: 'field-category',
        subCategory: 'field-subCategory',
        shortDescription: 'field-shortDescription',
        longDescription: 'field-longDescription',
        price: 'field-price',
        discount: 'field-discount',
        stock: 'field-stock',
        images: 'field-images',
        thumbnail: 'field-thumbnail',
        seoTitle: 'field-seoTitle',
        seoDescription: 'field-seoDescription',
      };
      const targetId = idMap[firstKey];
      if (targetId) {
        setTimeout(() => {
          const el = document.getElementById(targetId);
          if (el) el.scrollIntoView({ behavior: 'smooth', block: 'center' });
        }, 50);
      }
    }

    return !hasErrors;
  };

  const handleSubmit = async (e: React.FormEvent<HTMLFormElement>) => {
    e.preventDefault();
    setSubmitError('');
    if (!validateForm()) return;

    const isDraft = submitModeRef.current === 'draft';

    try {
      setSubmitting(true);
      const payload: ProductFormData = {
        ...formData,
        // Draft → force isActive false; Publish → honour form value (default true)
        isActive: isDraft ? false : (formData.isActive !== false ? true : formData.isActive),
        features: (formData.features || []).map((f) => f.trim()).filter(Boolean),
        specifications: (formData.specifications || []).filter((s) => s.label.trim() && s.value.trim()),
      };
      await onSubmit(payload, imageFiles, thumbnailFile);
      onClose();
    } catch (error) {
      const msg =
        error instanceof Error
          ? error.message
          : typeof (error as any)?.response?.data?.message === 'string'
            ? (error as any).response.data.message
            : 'Something went wrong. Please try again.';
      setSubmitError(msg);
      // Scroll to top of modal so the error banner is visible
      setTimeout(() => {
        const el = document.getElementById('product-modal-scroll');
        if (el) el.scrollTo({ top: 0, behavior: 'smooth' });
      }, 50);
    } finally {
      setSubmitting(false);
    }
  };

  const handleFieldChange = (field: keyof ProductFormData, value: any) => {
    setFormData((prev) => ({
      ...prev,
      [field]: value,
    }));

    if (errors[field as string]) {
      setErrors((prev) => ({
        ...prev,
        [field]: '',
      }));
    }
    // Clear server-level submit error on any user edit
    if (submitError) setSubmitError('');
  };

  const handleCategoryChange = (categoryId: string) => {
    setSelectedCategory(categoryId);
    setFormData((prev) => ({
      ...prev,
      subCategory: '',
    }));
  };

  const handleRemoveExistingImage = (index: number) => {
    setExistingImages((prev) => prev.filter((_, i) => i !== index));
  };

  const handleThumbnailSelect = (file: File | null) => {
    if (!file) return;
    setThumbnailFile(file);
    setThumbnailPreview(URL.createObjectURL(file));
    setExistingThumbnail('');
    if (errors.thumbnail) {
      setErrors((prev) => ({ ...prev, thumbnail: '' }));
    }
  };

  const handleRemoveThumbnail = () => {
    setThumbnailFile(null);
    setThumbnailPreview('');
    setExistingThumbnail('');
  };

  const handleToggleSuggestion = (productId: string) => {
    setFormData((prev) => {
      const current = prev.suggestionItems || [];
      const next = current.includes(productId)
        ? current.filter((id) => id !== productId)
        : [...current, productId];
      return { ...prev, suggestionItems: next };
    });
  };

  const handleAddColor = () => {
    const trimmed = colorInput.trim();
    if (!trimmed) {
      setErrors((prev) => ({ ...prev, color: 'Please enter a color' }));
      return;
    }
    const normalized = trimmed.toLowerCase();
    if ((formData.color || []).some((item) => item.toLowerCase() === normalized)) {
      setErrors((prev) => ({ ...prev, color: 'This color is already added' }));
      return;
    }
    setFormData((prev) => ({
      ...prev,
      color: [...(prev.color || []), trimmed],
    }));
    setColorInput('');
    setErrors((prev) => ({ ...prev, color: '' }));
  };

  const handleRemoveColor = (index: number) => {
    setFormData((prev) => ({
      ...prev,
      color: (prev.color || []).filter((_, i) => i !== index),
    }));
  };

  const handleAddSize = () => {
    const trimmed = sizeInput.trim();
    if (!trimmed) {
      setErrors((prev) => ({ ...prev, size: 'Please enter a size' }));
      return;
    }
    const normalized = trimmed.toLowerCase();
    if ((formData.size || []).some((item) => item.toLowerCase() === normalized)) {
      setErrors((prev) => ({ ...prev, size: 'This size is already added' }));
      return;
    }
    setFormData((prev) => ({
      ...prev,
      size: [...(prev.size || []), trimmed],
    }));
    setSizeInput('');
    setErrors((prev) => ({ ...prev, size: '' }));
  };

  const handleRemoveSize = (index: number) => {
    setFormData((prev) => ({
      ...prev,
      size: (prev.size || []).filter((_, i) => i !== index),
    }));
  };

  const isSubmitting = submitting || loading;
  const variantBusy = variantLoading || Boolean(variantBusyId);

  const applyVariantResponse = (res: unknown, fallback: ProductVariant[], refreshId?: string) => {
    const next = variantsFromRes(res, fallback);
    setVariants(next);
    setVariantDrafts((prev) => {
      const nextDrafts: Record<string, VariantDraft> = {};
      for (const item of next) {
        nextDrafts[item._id] =
          refreshId === item._id ? draftFromVariant(item) : (prev[item._id] ?? draftFromVariant(item));
      }
      return nextDrafts;
    });
  };

  const runVariantAction = async (busyKey: string, action: () => Promise<void>) => {
    setVariantBusyId(busyKey);
    setVariantError('');
    try {
      await action();
    } catch (err) {
      setVariantError(err instanceof Error ? err.message : 'Variant action failed.');
    } finally {
      setVariantBusyId(null);
    }
  };

  return (
    <div
      style={modalStyles.overlay}
      onClick={() => {
        if (!isSubmitting && !variantLoading && !variantBusyId) onClose();
      }}
    >
      <div style={modalStyles.modal} id="product-modal-scroll" onClick={(e) => e.stopPropagation()}>
        {/* Header */}
        <div style={modalStyles.header}>
          <h2 style={{ fontSize: '22px', fontWeight: 700 }}>
            {initialData
              ? initialData._id
                ? 'Update Product'
                : 'Duplicate Product'
              : 'Add Product'}
          </h2>
          <button
            onClick={onClose}
            style={{
              border: 'none',
              background: 'transparent',
              cursor: 'pointer',
            }}
          >
            <X size={22} />
          </button>
        </div>

        {/* Body */}
        <div style={modalStyles.body}>
          <form onSubmit={handleSubmit}>
            {/* Submit error banner */}
            {submitError && (
              <div
                style={{
                  marginBottom: '16px',
                  padding: '12px 16px',
                  background: '#fef2f2',
                  border: '1px solid #fca5a5',
                  borderRadius: '8px',
                  color: '#b91c1c',
                  fontSize: '14px',
                  display: 'flex',
                  alignItems: 'center',
                  gap: '8px',
                }}
              >
                <span style={{ fontWeight: 600 }}>⚠</span>
                {submitError}
              </div>
            )}

            {/* Validation summary – shown only when errors exist */}
            {Object.keys(errors).length > 0 && (
              <div
                style={{
                  marginBottom: '16px',
                  padding: '12px 16px',
                  background: '#fffbeb',
                  border: '1px solid #fcd34d',
                  borderRadius: '8px',
                  color: '#92400e',
                  fontSize: '13px',
                }}
              >
                <p style={{ fontWeight: 600, marginBottom: '6px' }}>Please fix the following before saving:</p>
                <ul style={{ margin: 0, paddingLeft: '18px' }}>
                  {Object.values(errors).filter(Boolean).map((msg, i) => (
                    <li key={i}>{msg}</li>
                  ))}
                </ul>
              </div>
            )}
            {/* Product Name */}
            <div id="field-name" style={modalStyles.formGroup}>
              <label style={modalStyles.label}>Product Name *</label>
              <input
                type="text"
                value={formData.name}
                onChange={(e) => handleFieldChange('name', e.target.value)}
                placeholder="Product Name"
                style={{
                  ...modalStyles.input,
                  ...(errors.name ? { borderColor: '#ef4444' } : {}),
                }}
              />
              {errors.name && <p style={modalStyles.error}>{errors.name}</p>}
            </div>

            {/* Short Description */}
            <div id="field-shortDescription" style={modalStyles.formGroup}>
              <label style={modalStyles.label}>Short Description *</label>
              <input
                type="text"
                value={formData.shortDescription}
                onChange={(e) => handleFieldChange('shortDescription', e.target.value)}
                placeholder="Short Description"
                style={{
                  ...modalStyles.input,
                  ...(errors.shortDescription ? { borderColor: '#ef4444' } : {}),
                }}
              />
              {errors.shortDescription && <p style={modalStyles.error}>{errors.shortDescription}</p>}
            </div>

            {/* Long Description */}
            <div id="field-longDescription" style={modalStyles.formGroup}>
              <label style={modalStyles.label}>Long Description *</label>
              <textarea
                value={formData.longDescription}
                onChange={(e) => handleFieldChange('longDescription', e.target.value)}
                placeholder="Long Description"
                style={{
                  ...modalStyles.textarea,
                  ...(errors.longDescription ? { borderColor: '#ef4444' } : {}),
                }}
              />
              {errors.longDescription && <p style={modalStyles.error}>{errors.longDescription}</p>}
            </div>

            {/* Category & Sub Category */}
            <div style={modalStyles.row}>
              <div id="field-category" style={modalStyles.formGroup}>
                <label style={modalStyles.label}>Category *</label>
                <select
                  value={selectedCategory}
                  onChange={(e) => handleCategoryChange(e.target.value)}
                  style={{
                    ...modalStyles.select,
                    ...(errors.category ? { borderColor: '#ef4444' } : {}),
                  }}
                  disabled={categoriesLoading}
                >
                  <option value="">Select Category</option>
                  {categories.map((category) => (
                    <option key={category._id} value={category._id}>
                      {category.name}
                    </option>
                  ))}
                </select>
                {errors.category && <p style={modalStyles.error}>{errors.category}</p>}
              </div>

              <div id="field-subCategory" style={modalStyles.formGroup}>
                <label style={modalStyles.label}>Sub Category *</label>
                <select
                  value={formData.subCategory}
                  onChange={(e) => handleFieldChange('subCategory', e.target.value)}
                  style={{
                    ...modalStyles.select,
                    ...(errors.subCategory ? { borderColor: '#ef4444' } : {}),
                  }}
                  disabled={!selectedCategory || subCategoriesLoading}
                >
                  <option value="">Select Sub Category</option>
                  {subCategories.map((sub) => (
                    <option key={sub._id} value={sub._id}>
                      {sub.name}
                    </option>
                  ))}
                </select>
                {errors.subCategory && <p style={modalStyles.error}>{errors.subCategory}</p>}
              </div>
            </div>

            {/* Price & Discount */}
            <div style={modalStyles.row}>
              <div id="field-price" style={modalStyles.formGroup}>
                <label style={modalStyles.label}>Price *</label>
                <input
                  type="number"
                  min={0}
                  value={formData.price}
                  onChange={(e) => handleFieldChange('price', Number(e.target.value))}
                  style={{
                    ...modalStyles.input,
                    ...(errors.price ? { borderColor: '#ef4444' } : {}),
                  }}
                />
                {errors.price && <p style={modalStyles.error}>{errors.price}</p>}
              </div>

              <div id="field-discount" style={modalStyles.formGroup}>
                <label style={modalStyles.label}>Discount %</label>
                <input
                  type="number"
                  min={0}
                  max={100}
                  value={formData.discount}
                  onChange={(e) => handleFieldChange('discount', Number(e.target.value))}
                  style={{
                    ...modalStyles.input,
                    ...(errors.discount ? { borderColor: '#ef4444' } : {}),
                  }}
                />
                {errors.discount && <p style={modalStyles.error}>{errors.discount}</p>}
              </div>
            </div>

            {/* Stock */}
            <div id="field-stock" style={modalStyles.formGroup}>
              <label style={modalStyles.label}>Stock *</label>
              <input
                type="number"
                min={0}
                value={formData.stock}
                onChange={(e) => handleFieldChange('stock', Number(e.target.value))}
                style={{
                  ...modalStyles.input,
                  ...(errors.stock ? { borderColor: '#ef4444' } : {}),
                }}
              />
              {errors.stock && <p style={modalStyles.error}>{errors.stock}</p>}
            </div>

            {/* Colors & Sizes */}
            <div style={modalStyles.row}>
              {/* Colors */}
              <div style={modalStyles.formGroup}>
                <label style={modalStyles.label}>Colors</label>
                <div style={{ display: 'flex', gap: '8px' }}>
                  <input
                    type="text"
                    value={colorInput}
                    onChange={(e) => {
                      setColorInput(e.target.value);
                      if (errors.color) {
                        setErrors((prev) => ({ ...prev, color: '' }));
                      }
                    }}
                    onKeyDown={(e) => {
                      if (e.key === 'Enter') {
                        e.preventDefault();
                        handleAddColor();
                      }
                    }}
                    placeholder="e.g. Red"
                    style={modalStyles.input}
                  />
                  <button
                    type="button"
                    onClick={handleAddColor}
                    style={{
                      ...modalStyles.button,
                      ...modalStyles.secondaryButton,
                      whiteSpace: 'nowrap',
                    }}
                  >
                    + Add
                  </button>
                </div>
                {errors.color && <p style={modalStyles.error}>{errors.color}</p>}
                <div style={{ display: 'flex', flexWrap: 'wrap', gap: '8px', marginTop: '10px' }}>
                  {(formData.color || []).map((c, i) => (
                    <span
                      key={i}
                      style={{
                        display: 'flex',
                        alignItems: 'center',
                        gap: '6px',
                        padding: '4px 10px',
                        borderRadius: colors.radius.full,
                        background: colors.surface,
                        border: `1px solid ${colors.border}`,
                        fontSize: '13px',
                      }}
                    >
                      {c}
                      <X
                        size={14}
                        style={{ cursor: 'pointer' }}
                        onClick={() => handleRemoveColor(i)}
                      />
                    </span>
                  ))}
                </div>
              </div>

              {/* Sizes */}
              <div style={modalStyles.formGroup}>
                <label style={modalStyles.label}>Sizes</label>
                <div style={{ display: 'flex', gap: '8px' }}>
                  <input
                    type="text"
                    value={sizeInput}
                    onChange={(e) => {
                      setSizeInput(e.target.value);
                      if (errors.size) {
                        setErrors((prev) => ({ ...prev, size: '' }));
                      }
                    }}
                    onKeyDown={(e) => {
                      if (e.key === 'Enter') {
                        e.preventDefault();
                        handleAddSize();
                      }
                    }}
                    placeholder="e.g. M, L, XL"
                    style={modalStyles.input}
                  />
                  <button
                    type="button"
                    onClick={handleAddSize}
                    style={{
                      ...modalStyles.button,
                      ...modalStyles.secondaryButton,
                      whiteSpace: 'nowrap',
                    }}
                  >
                    + Add
                  </button>
                </div>
                {errors.size && <p style={modalStyles.error}>{errors.size}</p>}
                <div style={{ display: 'flex', flexWrap: 'wrap', gap: '8px', marginTop: '10px' }}>
                  {(formData.size || []).map((s, i) => (
                    <span
                      key={i}
                      style={{
                        display: 'flex',
                        alignItems: 'center',
                        gap: '6px',
                        padding: '4px 10px',
                        borderRadius: colors.radius.full,
                        background: colors.surface,
                        border: `1px solid ${colors.border}`,
                        fontSize: '13px',
                      }}
                    >
                      {s}
                      <X
                        size={14}
                        style={{ cursor: 'pointer' }}
                        onClick={() => handleRemoveSize(i)}
                      />
                    </span>
                  ))}
                </div>
              </div>
            </div>

            {/* Brand, flags, details, SEO */}
            <div style={modalStyles.row}>
              <div style={modalStyles.formGroup}>
                <label style={modalStyles.label} htmlFor="product-brand">Brand</label>
                <input
                  id="product-brand"
                  type="text"
                  value={formData.brand || ''}
                  onChange={(e) => handleFieldChange('brand', e.target.value)}
                  placeholder="Brand"
                  style={modalStyles.input}
                />
              </div>
              <div style={{ ...modalStyles.formGroup, display: 'flex', gap: '24px', alignItems: 'center', paddingTop: '28px' }}>
                <label htmlFor="product-featured" style={{ display: 'flex', alignItems: 'center', gap: '8px', fontSize: '14px', cursor: 'pointer' }}>
                  <input
                    id="product-featured"
                    type="checkbox"
                    checked={Boolean(formData.isFeatured)}
                    onChange={(e) => handleFieldChange('isFeatured', e.target.checked)}
                  />
                  Featured
                </label>
                <label htmlFor="product-active" style={{ display: 'flex', alignItems: 'center', gap: '8px', fontSize: '14px', cursor: 'pointer' }}>
                  <input
                    id="product-active"
                    type="checkbox"
                    checked={formData.isActive !== false}
                    onChange={(e) => handleFieldChange('isActive', e.target.checked)}
                  />
                  Published (isActive)
                </label>
              </div>
            </div>

            <div style={modalStyles.row}>
              <div style={modalStyles.formGroup}>
                <label style={modalStyles.label} htmlFor="product-material">Material</label>
                <input
                  id="product-material"
                  type="text"
                  value={formData.material || ''}
                  onChange={(e) => handleFieldChange('material', e.target.value)}
                  placeholder="e.g. Solid oak, linen"
                  style={modalStyles.input}
                />
              </div>
              <div style={modalStyles.formGroup}>
                <label style={modalStyles.label} htmlFor="product-dimensions">Dimensions</label>
                <input
                  id="product-dimensions"
                  type="text"
                  value={formData.dimensions || ''}
                  onChange={(e) => handleFieldChange('dimensions', e.target.value)}
                  placeholder="W220 × D90 × H85 cm"
                  style={modalStyles.input}
                />
              </div>
            </div>

            <div style={modalStyles.formGroup}>
              <label style={modalStyles.label} htmlFor="product-care">Care instructions</label>
              <textarea
                id="product-care"
                value={formData.careInstructions || ''}
                onChange={(e) => handleFieldChange('careInstructions', e.target.value)}
                placeholder="How to care for this piece"
                style={{ ...modalStyles.textarea, minHeight: '80px' }}
              />
            </div>

            <div style={modalStyles.formGroup}>
              <label style={modalStyles.label}>Features</label>
              <div style={{ display: 'flex', gap: '8px' }}>
                <input
                  type="text"
                  value={featureInput}
                  onChange={(e) => setFeatureInput(e.target.value)}
                  onKeyDown={(e) => {
                    if (e.key === 'Enter') {
                      e.preventDefault();
                      const trimmed = featureInput.trim();
                      if (!trimmed) return;
                      handleFieldChange('features', [...(formData.features || []), trimmed]);
                      setFeatureInput('');
                    }
                  }}
                  placeholder="Add a feature and press Enter"
                  style={modalStyles.input}
                  aria-label="New feature"
                />
                <button
                  type="button"
                  onClick={() => {
                    const trimmed = featureInput.trim();
                    if (!trimmed) return;
                    handleFieldChange('features', [...(formData.features || []), trimmed]);
                    setFeatureInput('');
                  }}
                  style={{ ...modalStyles.button, ...modalStyles.secondaryButton, whiteSpace: 'nowrap' }}
                >
                  + Add
                </button>
              </div>
              <div style={{ display: 'flex', flexWrap: 'wrap', gap: '8px', marginTop: '10px' }}>
                {(formData.features || []).map((feature, index) => (
                  <span
                    key={`${feature}-${index}`}
                    style={{
                      display: 'flex',
                      alignItems: 'center',
                      gap: '6px',
                      padding: '4px 10px',
                      borderRadius: colors.radius.full,
                      background: colors.surface,
                      border: `1px solid ${colors.border}`,
                      fontSize: '13px',
                    }}
                  >
                    {feature}
                    <button
                      type="button"
                      aria-label={`Remove ${feature}`}
                      onClick={() =>
                        handleFieldChange(
                          'features',
                          (formData.features || []).filter((_, i) => i !== index),
                        )
                      }
                      style={{ border: 'none', background: 'transparent', cursor: 'pointer', padding: 0 }}
                    >
                      <X size={14} />
                    </button>
                  </span>
                ))}
              </div>
            </div>

            <div style={modalStyles.formGroup}>
              <label style={modalStyles.label}>Specifications</label>
              {(formData.specifications || []).map((row, index) => (
                <div key={index} style={{ display: 'grid', gridTemplateColumns: '1fr 1fr auto', gap: '8px', marginBottom: '8px' }}>
                  <input
                    type="text"
                    aria-label={`Specification ${index + 1} label`}
                    placeholder="Label"
                    value={row.label}
                    onChange={(e) => {
                      const next = [...(formData.specifications || [])];
                      next[index] = { ...next[index], label: e.target.value };
                      handleFieldChange('specifications', next);
                    }}
                    style={modalStyles.input}
                  />
                  <input
                    type="text"
                    aria-label={`Specification ${index + 1} value`}
                    placeholder="Value"
                    value={row.value}
                    onChange={(e) => {
                      const next = [...(formData.specifications || [])];
                      next[index] = { ...next[index], value: e.target.value };
                      handleFieldChange('specifications', next);
                    }}
                    style={modalStyles.input}
                  />
                  <button
                    type="button"
                    aria-label={`Remove specification ${index + 1}`}
                    onClick={() =>
                      handleFieldChange(
                        'specifications',
                        (formData.specifications || []).filter((_, i) => i !== index),
                      )
                    }
                    style={{ ...modalStyles.button, ...modalStyles.secondaryButton }}
                  >
                    <Trash2 size={14} />
                  </button>
                </div>
              ))}
              <button
                type="button"
                onClick={() =>
                  handleFieldChange('specifications', [...(formData.specifications || []), { label: '', value: '' }])
                }
                style={{ ...modalStyles.button, ...modalStyles.secondaryButton }}
              >
                + Add specification
              </button>
            </div>

            <div id="field-seoTitle" style={modalStyles.formGroup}>
              <label style={modalStyles.label} htmlFor="product-seo-title">
                SEO title{' '}
                <span style={{ fontWeight: 400, color: colors.text.muted }}>
                  ({(formData.seoTitle || '').length}/70)
                </span>
              </label>
              <input
                id="product-seo-title"
                type="text"
                maxLength={70}
                value={formData.seoTitle || ''}
                onChange={(e) => handleFieldChange('seoTitle', e.target.value)}
                placeholder="Shown in search results"
                style={{
                  ...modalStyles.input,
                  ...(errors.seoTitle ? { borderColor: '#ef4444' } : {}),
                }}
              />
              {errors.seoTitle && <p style={modalStyles.error}>{errors.seoTitle}</p>}
            </div>

            <div id="field-seoDescription" style={modalStyles.formGroup}>
              <label style={modalStyles.label} htmlFor="product-seo-description">
                SEO description{' '}
                <span style={{ fontWeight: 400, color: colors.text.muted }}>
                  ({(formData.seoDescription || '').length}/170)
                </span>
              </label>
              <textarea
                id="product-seo-description"
                maxLength={170}
                value={formData.seoDescription || ''}
                onChange={(e) => handleFieldChange('seoDescription', e.target.value)}
                placeholder="Meta description"
                style={{
                  ...modalStyles.textarea,
                  minHeight: '80px',
                  ...(errors.seoDescription ? { borderColor: '#ef4444' } : {}),
                }}
              />
              {errors.seoDescription && <p style={modalStyles.error}>{errors.seoDescription}</p>}
            </div>

            {/* Thumbnail Image */}
            <div id="field-thumbnail" style={modalStyles.formGroup}>
              <label style={modalStyles.label}>Thumbnail Image *</label>
              <div style={modalStyles.thumbnailWrap}>
                {thumbnailPreview || existingThumbnail ? (
                  <div style={{ position: 'relative' }}>
                    {/* eslint-disable-next-line @next/next/no-img-element */}
                    <img
                      src={thumbnailPreview || existingThumbnail}
                      alt="Thumbnail preview"
                      style={modalStyles.thumbnailPreview}
                    />
                    <button
                      type="button"
                      onClick={handleRemoveThumbnail}
                      style={{
                        position: 'absolute',
                        top: '-8px',
                        right: '-8px',
                        background: colors.error[500],
                        color: '#fff',
                        border: 'none',
                        borderRadius: '999px',
                        width: '22px',
                        height: '22px',
                        display: 'flex',
                        alignItems: 'center',
                        justifyContent: 'center',
                        cursor: 'pointer',
                      }}
                    >
                      <X size={13} />
                    </button>
                  </div>
                ) : (
                  <label style={modalStyles.thumbnailDropzone}>
                    <ImagePlus size={22} />
                    <span>Upload thumbnail</span>
                    <input
                      type="file"
                      accept="image/*"
                      style={{ display: 'none' }}
                      onChange={(e) => handleThumbnailSelect(e.target.files?.[0] || null)}
                    />
                  </label>
                )}
                <p style={{ fontSize: '13px', color: colors.text.muted, margin: 0 }}>
                  A single image used as the main product card / listing image.
                  This is separate from the product gallery images below.
                </p>
              </div>
              {errors.thumbnail && <p style={modalStyles.error}>{errors.thumbnail}</p>}
            </div>

            {/* Product Images */}
            <div id="field-images" style={modalStyles.formGroup}>
              <label style={modalStyles.label}>Product Images *</label>
              <ProductImageUpload
                onImagesChange={setImageFiles}
                existingImages={existingImages}
                onRemoveExisting={handleRemoveExistingImage}
                maxImages={10}
              />
              {errors.images && <p style={modalStyles.error}>{errors.images}</p>}
            </div>

            {/* Suggested Products */}
            <div style={modalStyles.formGroup}>
              <label style={modalStyles.label}>Suggested Products</label>
              <p style={{ fontSize: '13px', color: colors.text.muted, marginTop: '-4px', marginBottom: '8px' }}>
                Pick existing products to recommend alongside this one. Optional — if left empty,
                other products from the same sub category are suggested automatically.
              </p>
              <div style={modalStyles.suggestionsBox}>
                {suggestionsLoading ? (
                  <p style={{ fontSize: '13px', color: colors.text.muted, padding: '8px' }}>
                    Loading products...
                  </p>
                ) : suggestionCandidates.length === 0 ? (
                  <p style={{ fontSize: '13px', color: colors.text.muted, padding: '8px' }}>
                    No other products available yet.
                  </p>
                ) : (
                  suggestionCandidates.map((p) => {
                    const checked = (formData.suggestionItems || []).includes(p._id);
                    return (
                      <label
                        key={p._id}
                        style={{
                          ...modalStyles.suggestionRow,
                          background: checked ? colors.primary[50] : 'transparent',
                        }}
                      >
                        <input
                          type="checkbox"
                          checked={checked}
                          onChange={() => handleToggleSuggestion(p._id)}
                        />
                        {p.thumbnailImage || p.images?.[0] ? (
                          // eslint-disable-next-line @next/next/no-img-element
                          <img src={p.thumbnailImage || p.images[0]} alt={p.name} style={modalStyles.suggestionThumb} />
                        ) : (
                          <div style={modalStyles.suggestionThumb} />
                        )}
                        <span style={{ fontSize: '13px' }}>{p.name}</span>
                      </label>
                    );
                  })
                )}
              </div>
            </div>

            {/* ── Variants ── */}
            <div id="variant-section-anchor" style={{ ...modalStyles.formGroup, border: `1px solid ${colors.border}`, borderRadius: '10px', padding: '16px', marginTop: '8px' }}>
              <div
                style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', cursor: 'pointer', userSelect: 'none' as const }}
                onClick={() => setVariantSection((v) => !v)}
                onKeyDown={(e) => {
                  if (e.key === 'Enter' || e.key === ' ') {
                    e.preventDefault();
                    setVariantSection((v) => !v);
                  }
                }}
                role="button"
                tabIndex={0}
                aria-expanded={variantSection}
              >
                <label style={{ ...modalStyles.label, margin: 0, cursor: 'pointer' }}>
                  Variants ({variants.length})
                </label>
                <div style={{ display: 'flex', alignItems: 'center', gap: '8px' }}>
                  <span style={{ fontSize: '12px', color: colors.text.muted }}>Configs, colours &amp; pricing</span>
                  {variantSection ? <ChevronUp size={16} /> : <ChevronDown size={16} />}
                </div>
              </div>

              {variantSection && (
                <div style={{ marginTop: '16px' }}>
                  {!initialData?._id ? (
                    <p style={{ fontSize: '14px', color: colors.text.muted, margin: 0 }}>
                      Save the product first, then add variants.
                    </p>
                  ) : (
                    <>
                      {variantError && <p style={{ ...modalStyles.error, marginBottom: '12px' }}>{variantError}</p>}

                      <div style={{ display: 'flex', flexDirection: 'column', gap: '16px', marginBottom: '20px' }}>
                        {variants.map((variant) => {
                          const draft = variantDrafts[variant._id] ?? draftFromVariant(variant);
                          const images = variant.images ?? [];
                          const saveBusy = variantBusyId === `${variant._id}:save`;
                          const stockBusy = variantBusyId === `${variant._id}:stock`;
                          const imageBusy = variantBusyId?.startsWith(`${variant._id}:img`);
                          const deleteBusy = variantBusyId === `${variant._id}:delete`;

                          return (
                            <div
                              key={variant._id}
                              style={{
                                border: `1px solid ${colors.border}`,
                                borderRadius: '10px',
                                padding: '16px',
                                background: variant.isActive ? '#fff' : '#f8f8f8',
                              }}
                            >
                              <div style={{ display: 'flex', justifyContent: 'space-between', gap: '12px', marginBottom: '12px' }}>
                                <strong style={{ fontSize: '14px' }}>
                                  {variant.configName}
                                  {variant.colorName ? ` — ${variant.colorName}` : ''}
                                </strong>
                                <span style={{ fontSize: '12px', color: variant.isActive ? colors.text.muted : '#b45309' }}>
                                  {variant.isActive ? 'Active' : 'Inactive'}
                                </span>
                              </div>

                              <VariantFields
                                draft={draft}
                                idPrefix={variant._id}
                                onChange={(patch) =>
                                  setVariantDrafts((prev) => ({
                                    ...prev,
                                    [variant._id]: { ...(prev[variant._id] ?? draft), ...patch },
                                  }))
                                }
                              />

                              <div style={{ display: 'flex', alignItems: 'center', gap: '8px', marginTop: '12px', flexWrap: 'wrap' }}>
                                <span style={{ fontSize: '13px', fontWeight: 600 }}>Quick stock ({variant.stock})</span>
                                <button
                                  type="button"
                                  disabled={variantBusy || variant.stock <= 0}
                                  aria-label="Decrease stock by 1"
                                  onClick={() =>
                                    runVariantAction(`${variant._id}:stock`, async () => {
                                      const res = await productService.adjustVariantStock(initialData._id, variant._id, { delta: -1 });
                                      applyVariantResponse(res, variants, variant._id);
                                    })
                                  }
                                  style={{ ...modalStyles.button, ...modalStyles.secondaryButton, opacity: stockBusy ? 0.6 : 1 }}
                                >
                                  {stockBusy ? <Loader2 size={14} /> : '-1'}
                                </button>
                                <button
                                  type="button"
                                  disabled={variantBusy}
                                  aria-label="Increase stock by 1"
                                  onClick={() =>
                                    runVariantAction(`${variant._id}:stock`, async () => {
                                      const res = await productService.adjustVariantStock(initialData._id, variant._id, { delta: 1 });
                                      applyVariantResponse(res, variants, variant._id);
                                    })
                                  }
                                  style={{ ...modalStyles.button, ...modalStyles.secondaryButton, opacity: stockBusy ? 0.6 : 1 }}
                                >
                                  {stockBusy ? <Loader2 size={14} /> : '+1'}
                                </button>
                              </div>

                              <div style={{ marginTop: '14px' }}>
                                <label style={modalStyles.label}>Variant images</label>
                                <div style={{ display: 'flex', flexWrap: 'wrap', gap: '10px' }}>
                                  {images.map((url, index) => (
                                    <div key={url} style={{ width: 92, textAlign: 'center' }}>
                                      {/* eslint-disable-next-line @next/next/no-img-element */}
                                      <img
                                        src={url}
                                        alt=""
                                        style={{ width: 92, height: 92, objectFit: 'cover', borderRadius: 8, border: index === 0 ? `2px solid ${colors.primary[500]}` : `1px solid ${colors.border}` }}
                                      />
                                      <div style={{ display: 'flex', justifyContent: 'center', gap: 4, marginTop: 4 }}>
                                        <button
                                          type="button"
                                          disabled={variantBusy || index === 0}
                                          aria-label="Move image up"
                                          onClick={() => {
                                            const next = [...images];
                                            [next[index - 1], next[index]] = [next[index], next[index - 1]];
                                            runVariantAction(`${variant._id}:img-order`, async () => {
                                              const res = await productService.reorderVariantImages(initialData._id, variant._id, next);
                                              applyVariantResponse(res, variants);
                                            });
                                          }}
                                          style={{ border: 'none', background: 'transparent', cursor: 'pointer' }}
                                        >
                                          <ChevronLeft size={14} />
                                        </button>
                                        <button
                                          type="button"
                                          disabled={variantBusy || index === images.length - 1}
                                          aria-label="Move image down"
                                          onClick={() => {
                                            const next = [...images];
                                            [next[index + 1], next[index]] = [next[index], next[index + 1]];
                                            runVariantAction(`${variant._id}:img-order`, async () => {
                                              const res = await productService.reorderVariantImages(initialData._id, variant._id, next);
                                              applyVariantResponse(res, variants);
                                            });
                                          }}
                                          style={{ border: 'none', background: 'transparent', cursor: 'pointer' }}
                                        >
                                          <ChevronRight size={14} />
                                        </button>
                                      </div>
                                      <button
                                        type="button"
                                        disabled={variantBusy || index === 0}
                                        onClick={() =>
                                          runVariantAction(`${variant._id}:img-primary`, async () => {
                                            const res = await productService.setPrimaryVariantImage(initialData._id, variant._id, url);
                                            applyVariantResponse(res, variants);
                                          })
                                        }
                                        style={{ ...modalStyles.button, ...modalStyles.secondaryButton, fontSize: 11, padding: '4px 6px', width: '100%', marginTop: 4, display: 'flex', alignItems: 'center', justifyContent: 'center', gap: 4 }}
                                      >
                                        <Star size={12} /> {index === 0 ? 'Primary' : 'Set primary'}
                                      </button>
                                      <button
                                        type="button"
                                        disabled={variantBusy}
                                        onClick={() => {
                                          if (!confirm('Remove this image?')) return;
                                          runVariantAction(`${variant._id}:img-del`, async () => {
                                            const res = await productService.removeVariantImage(initialData._id, variant._id, url);
                                            applyVariantResponse(res, variants);
                                          });
                                        }}
                                        style={{ ...modalStyles.button, fontSize: 11, padding: '4px 6px', width: '100%', marginTop: 4, background: '#fef2f2', color: '#dc2626' }}
                                      >
                                        Delete
                                      </button>
                                    </div>
                                  ))}
                                </div>
                                <input
                                  type="file"
                                  accept="image/jpeg,image/png,image/webp"
                                  multiple
                                  disabled={variantBusy}
                                  aria-label={`Upload images for ${variant.configName}`}
                                  onChange={(e) => {
                                    const files = Array.from(e.target.files ?? []);
                                    e.target.value = '';
                                    if (!files.length) return;
                                    const invalid = validateVariantImageFiles(files);
                                    if (invalid) {
                                      setVariantError(invalid);
                                      return;
                                    }
                                    runVariantAction(`${variant._id}:img-up`, async () => {
                                      const res = await productService.uploadVariantImages(initialData._id, variant._id, files);
                                      applyVariantResponse(res, variants);
                                    });
                                  }}
                                  style={{ fontSize: '13px', marginTop: '8px' }}
                                />
                                {imageBusy && <p style={{ fontSize: 12, color: colors.text.muted }}>Updating images…</p>}
                              </div>

                              <div style={{ display: 'flex', gap: '8px', marginTop: '14px', flexWrap: 'wrap' }}>
                                <button
                                  type="button"
                                  disabled={variantBusy}
                                  onClick={() =>
                                    runVariantAction(`${variant._id}:save`, async () => {
                                      const err = validateVariantDraft(draft, variants, variant._id);
                                      if (err) throw new Error(err);
                                      const payload = changedVariantPayload(variant, draft);
                                      const stockChanged = Number(draft.stock) !== variant.stock;
                                      if (!Object.keys(payload).length && !stockChanged) {
                                        throw new Error('No changes to save.');
                                      }
                                      if (Object.keys(payload).length) {
                                        const res = await productService.updateVariant(initialData._id, variant._id, payload);
                                        applyVariantResponse(res, variants, variant._id);
                                      }
                                      if (stockChanged) {
                                        const res = await productService.adjustVariantStock(initialData._id, variant._id, {
                                          stock: Number(draft.stock),
                                        });
                                        applyVariantResponse(res, variants, variant._id);
                                      }
                                    })
                                  }
                                  style={{ ...modalStyles.button, ...modalStyles.primaryButton, display: 'flex', alignItems: 'center', gap: 6, opacity: saveBusy ? 0.6 : 1 }}
                                >
                                  {saveBusy ? <Loader2 size={14} style={{ animation: 'spin 1s linear infinite' }} /> : <Save size={14} />}
                                  Save variant
                                </button>
                                <button
                                  type="button"
                                  disabled={variantBusy}
                                  onClick={() => {
                                    if (!confirm(`Delete "${variant.configName}"? This cannot be undone.`)) return;
                                    runVariantAction(`${variant._id}:delete`, async () => {
                                      await productService.deleteVariant(initialData._id, variant._id);
                                      setVariants((prev) => prev.filter((item) => item._id !== variant._id));
                                      setVariantDrafts((prev) => {
                                        const next = { ...prev };
                                        delete next[variant._id];
                                        return next;
                                      });
                                    });
                                  }}
                                  style={{ ...modalStyles.button, background: '#fef2f2', color: '#dc2626', display: 'flex', alignItems: 'center', gap: 6, opacity: deleteBusy ? 0.6 : 1 }}
                                >
                                  {deleteBusy ? <Loader2 size={14} /> : <Trash2 size={14} />}
                                  Delete
                                </button>
                              </div>
                            </div>
                          );
                        })}
                      </div>

                      <div style={{ border: `1px dashed ${colors.border}`, borderRadius: '8px', padding: '16px', background: '#fafafa' }}>
                        <p style={{ fontWeight: 600, fontSize: '13px', marginBottom: '12px' }}>Add new variant</p>
                        <VariantFields
                          draft={variantForm}
                          idPrefix="new-variant"
                          onChange={(patch) => setVariantForm((prev) => ({ ...prev, ...patch }))}
                        />
                        <div style={{ marginTop: '12px' }}>
                          <label style={modalStyles.label} htmlFor="new-variant-images">Images</label>
                          <input
                            id="new-variant-images"
                            type="file"
                            accept="image/jpeg,image/png,image/webp"
                            multiple
                            onChange={(e) => {
                              const files = Array.from(e.target.files ?? []);
                              const invalid = validateVariantImageFiles(files);
                              if (invalid) {
                                setVariantError(invalid);
                                setVariantImageFiles([]);
                                e.target.value = '';
                                return;
                              }
                              setVariantError('');
                              setVariantImageFiles(files);
                            }}
                            style={{ fontSize: '13px' }}
                          />
                          {variantImageFiles.length > 0 && (
                            <div style={{ display: 'flex', gap: 8, flexWrap: 'wrap', marginTop: 8 }}>
                              {variantImageFiles.map((file) => (
                                // eslint-disable-next-line @next/next/no-img-element
                                <img
                                  key={file.name + file.size}
                                  src={URL.createObjectURL(file)}
                                  alt={file.name}
                                  style={{ width: 64, height: 64, objectFit: 'cover', borderRadius: 8 }}
                                />
                              ))}
                            </div>
                          )}
                        </div>
                        <button
                          type="button"
                          disabled={variantBusy}
                          onClick={() =>
                            runVariantAction('add', async () => {
                              const err = validateVariantDraft(variantForm, variants);
                              if (err) throw new Error(err);
                              const res = await productService.addVariant(initialData._id, draftToAddForm(variantForm, variantImageFiles));
                              applyVariantResponse(res, variants);
                              setVariantForm(blankVariantForm);
                              setVariantImageFiles([]);
                            })
                          }
                          style={{
                            ...modalStyles.button,
                            ...modalStyles.primaryButton,
                            marginTop: 14,
                            display: 'flex',
                            alignItems: 'center',
                            gap: 6,
                            opacity: variantBusyId === 'add' ? 0.6 : 1,
                          }}
                        >
                          {variantBusyId === 'add' ? <Loader2 size={14} style={{ animation: 'spin 1s linear infinite' }} /> : <Plus size={14} />}
                          Add variant
                        </button>
                      </div>
                    </>
                  )}
                </div>
              )}
            </div>

            {/* Footer */}
            <div style={modalStyles.footer}>
              <button
                type="button"
                onClick={onClose}
                disabled={isSubmitting || variantBusy}
                style={{
                  ...modalStyles.button,
                  ...modalStyles.secondaryButton,
                }}
              >
                Cancel
              </button>

              {/* Save as Draft — always visible, forces isActive=false */}
              <button
                type="submit"
                disabled={isSubmitting || variantBusy}
                onClick={() => { submitModeRef.current = 'draft'; }}
                style={{
                  ...modalStyles.button,
                  background: '#f3f4f6',
                  color: '#374151',
                  border: '1px solid #d1d5db',
                  display: 'flex',
                  alignItems: 'center',
                  gap: '6px',
                  ...(isSubmitting || variantBusy ? modalStyles.buttonDisabled : {}),
                }}
              >
                {isSubmitting && submitModeRef.current === 'draft' ? (
                  <Loader2 size={16} style={{ animation: 'spin 1s linear infinite' }} />
                ) : (
                  <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
                    <path d="M14 2H6a2 2 0 0 0-2 2v16a2 2 0 0 0 2 2h12a2 2 0 0 0 2-2V8z"/>
                    <polyline points="14 2 14 8 20 8"/>
                    <line x1="16" y1="13" x2="8" y2="13"/>
                    <line x1="16" y1="17" x2="8" y2="17"/>
                    <polyline points="10 9 9 9 8 9"/>
                  </svg>
                )}
                Save as Draft
              </button>

              {/* Publish / Update — sets isActive=true */}
              <button
                type="submit"
                disabled={isSubmitting || variantBusy}
                onClick={() => { submitModeRef.current = 'publish'; }}
                style={{
                  ...modalStyles.button,
                  ...modalStyles.primaryButton,
                  display: 'flex',
                  alignItems: 'center',
                  gap: '6px',
                  ...(isSubmitting || variantBusy ? modalStyles.buttonDisabled : {}),
                }}
              >
                {isSubmitting && submitModeRef.current === 'publish' ? (
                  <>
                    <Loader2
                      size={18}
                      style={{ animation: 'spin 1s linear infinite' }}
                    />
                    {initialData?._id ? 'Updating...' : 'Publishing...'}
                  </>
                ) : (
                  <>
                    <Save size={18} />
                    {initialData?._id ? 'Update Product' : 'Publish Product'}
                  </>
                )}
              </button>
            </div>
          </form>
        </div>
      </div>
    </div>
  );
}