'use client';

import React, { useEffect, useState } from 'react';
import { X, Save, Loader2 } from 'lucide-react';
import { colors } from '@/config/colors';
import { Product, ProductFormData, Category, SubCategory } from '@/Type/products';
import ProductImageUpload from './ProductImageUpload';
import { useCategories, useSubCategories } from '@/hooks/useProducts';

interface ProductModalProps {
  isOpen: boolean;
  onClose: () => void;
  onSubmit: (data: ProductFormData, images: File[]) => Promise<void>;
  initialData?: Product | null;
  loading?: boolean;
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
  });

  const [selectedCategory, setSelectedCategory] = useState('');
  const [imageFiles, setImageFiles] = useState<File[]>([]);
  const [existingImages, setExistingImages] = useState<string[]>([]);
  const [errors, setErrors] = useState<Record<string, string>>({});
  const [submitting, setSubmitting] = useState(false);

  const { categories, loading: categoriesLoading } = useCategories();
  const { subCategories, loading: subCategoriesLoading } = useSubCategories(selectedCategory);

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
      });

      setExistingImages(initialData.images || []);
    } else {
      setSelectedCategory('');
      setImageFiles([]);
      setExistingImages([]);
      setErrors({});
      setFormData({
        name: '',
        shortDescription: '',
        longDescription: '',
        subCategory: '',
        price: 0,
        discount: 0,
        stock: 0,
        images: [],
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

    setErrors(newErrors);
    return Object.keys(newErrors).length === 0;
  };

  const handleSubmit = async (e: React.FormEvent<HTMLFormElement>) => {
    e.preventDefault();
    if (!validateForm()) return;

    try {
      setSubmitting(true);
      await onSubmit(formData, imageFiles);
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