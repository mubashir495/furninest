'use client';

import React, { useEffect, useState } from 'react';
import { X, Save, Loader2, ImagePlus } from 'lucide-react';
import { colors } from '@/config/colors';
import { Product, ProductFormData, Category, SubCategory } from '@/Type/products';
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
    maxWidth: '900px',
    maxHeight: '90vh',
    overflowY: 'auto' as const,
    background: colors.background,
    borderRadius: colors.radius.xl,
    boxShadow: colors.shadow.xl,
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

  const { categories, loading: categoriesLoading } = useCategories();
  const { subCategories, loading: subCategoriesLoading } = useSubCategories(selectedCategory);
  const { products: suggestionCandidates, loading: suggestionsLoading } = useAllProducts(initialData?._id);

  useEffect(() => {
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
    if (trimmed && !(formData.color || []).includes(trimmed)) {
      setFormData((prev) => ({
        ...prev,
        color: [...(prev.color || []), trimmed],
      }));
      setColorInput('');
    }
  };

  const handleRemoveColor = (index: number) => {
    setFormData((prev) => ({
      ...prev,
      color: (prev.color || []).filter((_, i) => i !== index),
    }));
  };

  const handleAddSize = () => {
    const trimmed = sizeInput.trim();
    if (trimmed && !(formData.size || []).includes(trimmed)) {
      setFormData((prev) => ({
        ...prev,
        size: [...(prev.size || []), trimmed],
      }));
      setSizeInput('');
    }
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
                    onChange={(e) => setColorInput(e.target.value)}
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
                    onChange={(e) => setSizeInput(e.target.value)}
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