'use client';

import React, { useEffect, useState } from 'react';
import { X, Save, Loader2, ImagePlus, Plus, Trash2, ChevronDown, ChevronUp } from 'lucide-react';
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

export default function ProductModal({
  isOpen,
  onClose,
  onSubmit,
  initialData,
  loading = false,
}: ProductModalProps) {
  const [formData, setFormData] = useState<ProductFormData>({
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
  });

  const [selectedCategory, setSelectedCategory] = useState('');
  const [imageFiles, setImageFiles] = useState<File[]>([]);
  const [existingImages, setExistingImages] = useState<string[]>([]);

  // Thumbnail (single, required, kept separate from the gallery images)
  const [thumbnailFile, setThumbnailFile] = useState<File | null>(null);
  const [thumbnailPreview, setThumbnailPreview] = useState<string>('');
  const [existingThumbnail, setExistingThumbnail] = useState<string>('');

  const [errors, setErrors] = useState<Record<string, string>>({});
  const [submitting, setSubmitting] = useState(false);

  const [colorInput, setColorInput] = useState('');
  const [sizeInput, setSizeInput] = useState('');

  // ── Variant management state ─────────────────────────────────────────────
  const [variants, setVariants] = useState<ProductVariant[]>([]);
  const [variantSection, setVariantSection] = useState(false); // collapsed by default
  const [editingVariantId, setEditingVariantId] = useState<string | null>(null);
  const [variantLoading, setVariantLoading] = useState(false);
  const [variantError, setVariantError] = useState('');
  const [variantImageFiles, setVariantImageFiles] = useState<File[]>([]);
  const blankVariantForm = {
    configName: '', colorName: '', colorHex: '#D4A373',
    sku: '', price: '', salePrice: '', stock: '0',
    dimensions: '', material: '', isActive: true,
  };
  const [variantForm, setVariantForm] = useState(blankVariantForm);

  const { categories, loading: categoriesLoading } = useCategories();
  const { subCategories, loading: subCategoriesLoading } = useSubCategories(selectedCategory);
  const { products: suggestionCandidates, loading: suggestionsLoading } = useAllProducts(initialData?._id);

  useEffect(() => {
    setErrors({});

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
      });

      setExistingImages(initialData.images || []);

      // Thumbnail (existing URL, edit mode)
      setThumbnailFile(null);
      setThumbnailPreview('');
      setExistingThumbnail(initialData.thumbnailImage || '');
      // Sync variants
      setVariants((initialData.variants as ProductVariant[] | undefined) ?? []);
      setVariantForm(blankVariantForm);
      setEditingVariantId(null);
      setVariantError('');
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
      setVariantForm(blankVariantForm);
      setEditingVariantId(null);
      setVariantError('');
      setFormData({
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
      });
    }
  }, [initialData]);

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

    setErrors(newErrors);
    return Object.keys(newErrors).length === 0;
  };

  const handleSubmit = async (e: React.FormEvent<HTMLFormElement>) => {
    e.preventDefault();
    if (!validateForm()) return;

    try {
      setSubmitting(true);
      await onSubmit(formData, imageFiles, thumbnailFile);
      onClose();
    } catch (error) {
      console.error(error);
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

  return (
    <div style={modalStyles.overlay} onClick={onClose}>
      <div style={modalStyles.modal} onClick={(e) => e.stopPropagation()}>
        {/* Header */}
        <div style={modalStyles.header}>
          <h2 style={{ fontSize: '22px', fontWeight: 700 }}>
            {initialData ? 'Update Product' : 'Add Product'}
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
            {/* Product Name */}
            <div style={modalStyles.formGroup}>
              <label style={modalStyles.label}>Product Name *</label>
              <input
                type="text"
                value={formData.name}
                onChange={(e) => handleFieldChange('name', e.target.value)}
                placeholder="Product Name"
                style={modalStyles.input}
              />
              {errors.name && <p style={modalStyles.error}>{errors.name}</p>}
            </div>

            {/* Short Description */}
            <div style={modalStyles.formGroup}>
              <label style={modalStyles.label}>Short Description *</label>
              <input
                type="text"
                value={formData.shortDescription}
                onChange={(e) => handleFieldChange('shortDescription', e.target.value)}
                placeholder="Short Description"
                style={modalStyles.input}
              />
              {errors.shortDescription && <p style={modalStyles.error}>{errors.shortDescription}</p>}
            </div>

            {/* Long Description */}
            <div style={modalStyles.formGroup}>
              <label style={modalStyles.label}>Long Description *</label>
              <textarea
                value={formData.longDescription}
                onChange={(e) => handleFieldChange('longDescription', e.target.value)}
                placeholder="Long Description"
                style={modalStyles.textarea}
              />
              {errors.longDescription && <p style={modalStyles.error}>{errors.longDescription}</p>}
            </div>

            {/* Category & Sub Category */}
            <div style={modalStyles.row}>
              <div style={modalStyles.formGroup}>
                <label style={modalStyles.label}>Category *</label>
                <select
                  value={selectedCategory}
                  onChange={(e) => handleCategoryChange(e.target.value)}
                  style={modalStyles.select}
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

              <div style={modalStyles.formGroup}>
                <label style={modalStyles.label}>Sub Category *</label>
                <select
                  value={formData.subCategory}
                  onChange={(e) => handleFieldChange('subCategory', e.target.value)}
                  style={modalStyles.select}
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
              <div style={modalStyles.formGroup}>
                <label style={modalStyles.label}>Price *</label>
                <input
                  type="number"
                  min={0}
                  value={formData.price}
                  onChange={(e) => handleFieldChange('price', Number(e.target.value))}
                  style={modalStyles.input}
                />
                {errors.price && <p style={modalStyles.error}>{errors.price}</p>}
              </div>

              <div style={modalStyles.formGroup}>
                <label style={modalStyles.label}>Discount %</label>
                <input
                  type="number"
                  min={0}
                  max={100}
                  value={formData.discount}
                  onChange={(e) => handleFieldChange('discount', Number(e.target.value))}
                  style={modalStyles.input}
                />
                {errors.discount && <p style={modalStyles.error}>{errors.discount}</p>}
              </div>
            </div>

            {/* Stock */}
            <div style={modalStyles.formGroup}>
              <label style={modalStyles.label}>Stock *</label>
              <input
                type="number"
                min={0}
                value={formData.stock}
                onChange={(e) => handleFieldChange('stock', Number(e.target.value))}
                style={modalStyles.input}
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

            {/* Thumbnail Image */}
            <div style={modalStyles.formGroup}>
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
            <div style={modalStyles.formGroup}>
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

            {/* ── Variants Section (edit mode only — requires saved product _id) ── */}
            {initialData?._id && (
              <div style={{ ...modalStyles.formGroup, border: `1px solid ${colors.border}`, borderRadius: '10px', padding: '16px', marginTop: '8px' }}>
                <div
                  style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', cursor: 'pointer', userSelect: 'none' as const }}
                  onClick={() => setVariantSection(v => !v)}
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
                    {variantError && <p style={{ ...modalStyles.error, marginBottom: '12px' }}>{variantError}</p>}

                    {/* Existing variants */}
                    {variants.length > 0 && (
                      <div style={{ display: 'flex', flexDirection: 'column', gap: '10px', marginBottom: '20px' }}>
                        {variants.map(v => (
                          <div
                            key={v._id}
                            style={{
                              display: 'flex', alignItems: 'center', gap: '12px',
                              padding: '10px 14px', borderRadius: '8px',
                              border: `1px solid ${colors.border}`,
                              background: v.isActive ? colors.surface : '#f3f4f6',
                              opacity: v.isActive ? 1 : 0.6,
                            }}
                          >
                            {v.colorHex && (
                              <div style={{ width: '22px', height: '22px', borderRadius: '50%', background: v.colorHex, border: '1px solid #ccc', flexShrink: 0 }} />
                            )}
                            <div style={{ flex: 1, minWidth: 0 }}>
                              <div style={{ fontWeight: 600, fontSize: '13px', whiteSpace: 'nowrap', overflow: 'hidden', textOverflow: 'ellipsis' }}>
                                {v.configName}{v.colorName ? ` — ${v.colorName}` : ''}
                              </div>
                              <div style={{ fontSize: '12px', color: colors.text.muted, marginTop: '2px' }}>
                                £{v.salePrice != null ? v.salePrice : v.price}
                                {v.salePrice != null && <span style={{ marginLeft: '6px', textDecoration: 'line-through', color: '#bbb' }}>£{v.price}</span>}
                                {' · '}{v.stock} stock{v.sku ? ` · ${v.sku}` : ''}{v.images?.length ? ` · ${v.images.length} img` : ''}
                              </div>
                            </div>
                            <div style={{ display: 'flex', gap: '6px', flexShrink: 0 }}>
                              <button
                                type="button"
                                onClick={() => {
                                  setEditingVariantId(v._id);
                                  setVariantForm({ configName: v.configName, colorName: v.colorName ?? '', colorHex: v.colorHex ?? '#D4A373', sku: v.sku ?? '', price: String(v.price), salePrice: v.salePrice != null ? String(v.salePrice) : '', stock: String(v.stock), dimensions: v.dimensions ?? '', material: v.material ?? '', isActive: v.isActive });
                                  setVariantImageFiles([]); setVariantError('');
                                }}
                                style={{ padding: '4px 10px', fontSize: '12px', borderRadius: '6px', border: `1px solid ${colors.border}`, background: '#fff', cursor: 'pointer' }}
                              >Edit</button>
                              <button
                                type="button"
                                onClick={async () => {
                                  if (!confirm(`Delete "${v.configName}"?`)) return;
                                  setVariantLoading(true); setVariantError('');
                                  try {
                                    await productService.deleteVariant(initialData._id, v._id);
                                    setVariants(prev => prev.filter(x => x._id !== v._id));
                                  } catch (e: any) { setVariantError(e.message); }
                                  finally { setVariantLoading(false); }
                                }}
                                style={{ padding: '4px 8px', borderRadius: '6px', border: '1px solid #fca5a5', background: '#fef2f2', color: '#dc2626', cursor: 'pointer', display: 'flex', alignItems: 'center' }}
                              ><Trash2 size={13} /></button>
                            </div>
                          </div>
                        ))}
                      </div>
                    )}

                    {/* Add / Edit form */}
                    <div style={{ border: `1px dashed ${colors.border}`, borderRadius: '8px', padding: '16px', background: '#fafafa' }}>
                      <p style={{ fontWeight: 600, fontSize: '13px', marginBottom: '12px' }}>
                        {editingVariantId ? '✏️ Edit Variant' : '➕ Add New Variant'}
                      </p>
                      <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: '12px' }}>
                        <div>
                          <label style={modalStyles.label}>Configuration *</label>
                          <input type="text" placeholder="e.g. 3-Seater" value={variantForm.configName} onChange={e => setVariantForm(f => ({ ...f, configName: e.target.value }))} style={modalStyles.input} />
                        </div>
                        <div>
                          <label style={modalStyles.label}>Colour Name</label>
                          <input type="text" placeholder="e.g. Beige" value={variantForm.colorName} onChange={e => setVariantForm(f => ({ ...f, colorName: e.target.value }))} style={modalStyles.input} />
                        </div>
                        <div style={{ display: 'flex', gap: '10px', alignItems: 'flex-end' }}>
                          <div style={{ flex: 1 }}>
                            <label style={modalStyles.label}>Colour Hex</label>
                            <input type="text" placeholder="#D4A373" value={variantForm.colorHex} onChange={e => setVariantForm(f => ({ ...f, colorHex: e.target.value }))} style={modalStyles.input} />
                          </div>
                          <div style={{ width: '40px', height: '40px', borderRadius: '8px', border: '1px solid #ccc', background: variantForm.colorHex, flexShrink: 0, marginBottom: '2px' }} />
                        </div>
                        <div>
                          <label style={modalStyles.label}>SKU</label>
                          <input type="text" placeholder="e.g. SOFA-3S-BEI" value={variantForm.sku} onChange={e => setVariantForm(f => ({ ...f, sku: e.target.value }))} style={modalStyles.input} />
                        </div>
                        <div>
                          <label style={modalStyles.label}>Price (£) *</label>
                          <input type="number" min="0" step="0.01" placeholder="0.00" value={variantForm.price} onChange={e => setVariantForm(f => ({ ...f, price: e.target.value }))} style={modalStyles.input} />
                        </div>
                        <div>
                          <label style={modalStyles.label}>Sale Price (£)</label>
                          <input type="number" min="0" step="0.01" placeholder="Leave blank if no sale" value={variantForm.salePrice} onChange={e => setVariantForm(f => ({ ...f, salePrice: e.target.value }))} style={modalStyles.input} />
                        </div>
                        <div>
                          <label style={modalStyles.label}>Stock</label>
                          <input type="number" min="0" value={variantForm.stock} onChange={e => setVariantForm(f => ({ ...f, stock: e.target.value }))} style={modalStyles.input} />
                        </div>
                        <div style={{ display: 'flex', alignItems: 'center', gap: '10px', paddingTop: '22px' }}>
                          <input type="checkbox" id="variantActiveChk" checked={variantForm.isActive} onChange={e => setVariantForm(f => ({ ...f, isActive: e.target.checked }))} />
                          <label htmlFor="variantActiveChk" style={{ fontSize: '13px', cursor: 'pointer' }}>Active</label>
                        </div>
                        <div>
                          <label style={modalStyles.label}>Dimensions</label>
                          <input type="text" placeholder='W220 × D90 × H85 cm' value={variantForm.dimensions} onChange={e => setVariantForm(f => ({ ...f, dimensions: e.target.value }))} style={modalStyles.input} />
                        </div>
                        <div>
                          <label style={modalStyles.label}>Material</label>
                          <input type="text" placeholder="e.g. Velvet, Linen" value={variantForm.material} onChange={e => setVariantForm(f => ({ ...f, material: e.target.value }))} style={modalStyles.input} />
                        </div>
                      </div>

                      {/* Variant image upload */}
                      <div style={{ marginTop: '12px' }}>
                        <label style={modalStyles.label}>Variant Images</label>
                        <input type="file" accept="image/*" multiple onChange={e => setVariantImageFiles(Array.from(e.target.files ?? []))} style={{ fontSize: '13px' }} />
                        {variantImageFiles.length > 0 && <p style={{ fontSize: '12px', color: colors.text.muted, marginTop: '4px' }}>{variantImageFiles.length} image(s) selected</p>}
                      </div>

                      <div style={{ display: 'flex', gap: '10px', marginTop: '16px' }}>
                        <button
                          type="button"
                          disabled={variantLoading || !variantForm.configName.trim() || !variantForm.price}
                          onClick={async () => {
                            if (!variantForm.configName.trim() || !variantForm.price) { setVariantError('Configuration name and price are required.'); return; }
                            setVariantLoading(true); setVariantError('');
                            try {
                              const payload: Record<string, unknown> = {
                                configName: variantForm.configName.trim(),
                                price: Number(variantForm.price),
                                stock: Number(variantForm.stock),
                                isActive: variantForm.isActive,
                                ...(variantForm.colorName && { colorName: variantForm.colorName }),
                                ...(variantForm.colorHex && { colorHex: variantForm.colorHex }),
                                ...(variantForm.sku && { sku: variantForm.sku }),
                                ...(variantForm.salePrice && { salePrice: Number(variantForm.salePrice) }),
                                ...(variantForm.dimensions && { dimensions: variantForm.dimensions }),
                                ...(variantForm.material && { material: variantForm.material }),
                              };
                              if (editingVariantId) {
                                const res: any = await productService.updateVariant(initialData._id, editingVariantId, payload);
                                if (variantImageFiles.length > 0) await productService.uploadVariantImages(initialData._id, editingVariantId, variantImageFiles);
                                const updatedVariants: ProductVariant[] = res?.data?.variants ?? [];
                                setVariants(updatedVariants.length ? updatedVariants : prev => prev.map(v => v._id === editingVariantId ? { ...v, ...payload } as ProductVariant : v));
                                setEditingVariantId(null);
                              } else {
                                const form = new FormData();
                                Object.entries(payload).forEach(([k, val]) => form.append(k, String(val)));
                                variantImageFiles.forEach(f => form.append('images', f));
                                const res: any = await productService.addVariant(initialData._id, form);
                                const newVariants: ProductVariant[] = res?.data?.variants ?? [];
                                setVariants(newVariants.length ? newVariants : prev => [...prev]);
                              }
                              setVariantForm(blankVariantForm); setVariantImageFiles([]);
                            } catch (e: any) { setVariantError(e.message); }
                            finally { setVariantLoading(false); }
                          }}
                          style={{ display: 'flex', alignItems: 'center', gap: '6px', padding: '8px 16px', fontSize: '13px', fontWeight: 600, borderRadius: '8px', border: 'none', cursor: 'pointer', background: colors.primary[500], color: '#fff', opacity: variantLoading ? 0.6 : 1 }}
                        >
                          {variantLoading ? <Loader2 size={14} style={{ animation: 'spin 1s linear infinite' }} /> : <Plus size={14} />}
                          {editingVariantId ? 'Save Changes' : 'Add Variant'}
                        </button>
                        {editingVariantId && (
                          <button
                            type="button"
                            onClick={() => { setEditingVariantId(null); setVariantForm(blankVariantForm); setVariantImageFiles([]); setVariantError(''); }}
                            style={{ padding: '8px 14px', fontSize: '13px', borderRadius: '8px', border: `1px solid ${colors.border}`, background: '#fff', cursor: 'pointer' }}
                          >Cancel Edit</button>
                        )}
                      </div>
                    </div>
                  </div>
                )}
              </div>
            )}

            {/* Footer */}
            <div style={modalStyles.footer}>
              <button
                type="button"
                onClick={onClose}
                disabled={isSubmitting}
                style={{
                  ...modalStyles.button,
                  ...modalStyles.secondaryButton,
                }}
              >
                Cancel
              </button>
              <button
                type="submit"
                disabled={isSubmitting}
                style={{
                  ...modalStyles.button,
                  ...modalStyles.primaryButton,
                  ...(isSubmitting ? modalStyles.buttonDisabled : {}),
                }}
              >
                {isSubmitting ? (
                  <>
                    <Loader2
                      size={18}
                      style={{ animation: 'spin 1s linear infinite', marginRight: '8px' }}
                    />
                    {initialData ? 'Updating...' : 'Creating...'}
                  </>
                ) : (
                  <>
                    <Save size={18} style={{ marginRight: '8px' }} />
                    {initialData ? 'Update Product' : 'Add Product'}
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