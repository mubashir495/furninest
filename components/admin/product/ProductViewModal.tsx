'use client';

import React, { useState } from 'react';
import Link from 'next/link';
import { colors } from '@/config/colors';
import { Product } from '@/Type/products';
import {
  Product as CatalogProduct,
  getProductPriceInfo,
  getTotalStock,
  getVariantFinalPrice,
  isVariantOnSale,
} from '@/Type/product';
import { formatCurrency, formatDate } from '@/utils/validators';
import { ChevronLeft, ChevronRight, ExternalLink, X } from 'lucide-react';

interface ProductViewModalProps {
  isOpen: boolean;
  onClose: () => void;
  product: Product;
}

export default function ProductViewModal({ isOpen, onClose, product }: ProductViewModalProps) {
  const [currentImageIndex, setCurrentImageIndex] = useState(0);

  if (!isOpen) return null;

  const catalog: CatalogProduct = {
    ...(product as unknown as CatalogProduct),
    finalPrice: product.finalPrice ?? product.price,
    thumbnailImage: product.thumbnailImage || '',
    created_date: product.created_date || product.createdAt || '',
    updated_date: product.updated_date || product.updatedAt || '',
    isActive: Boolean(product.isActive),
  };
  const info = getProductPriceInfo(catalog);
  const gallery = product.images?.length ? product.images : product.thumbnailImage ? [product.thumbnailImage] : [];
  const categoryName = typeof product.category === 'object' ? product.category.name : product.category;
  const subCategoryName = typeof product.subCategory === 'object' ? product.subCategory.name : product.subCategory;
  const statusLabel = product.isArchived ? 'Archived' : product.isActive ? 'Published' : 'Unpublished';

  const nextImage = () => {
    if (gallery.length > 0) setCurrentImageIndex((prev) => (prev + 1) % gallery.length);
  };
  const prevImage = () => {
    if (gallery.length > 0) setCurrentImageIndex((prev) => (prev - 1 + gallery.length) % gallery.length);
  };

  const styles = {
    overlay: {
      position: 'fixed' as const,
      inset: 0,
      backgroundColor: 'rgba(0, 0, 0, 0.5)',
      backdropFilter: 'blur(4px)',
      display: 'flex',
      alignItems: 'center',
      justifyContent: 'center',
      zIndex: 1000,
      padding: '1rem',
    },
    modal: {
      backgroundColor: colors.background,
      borderRadius: colors.radius.xl,
      width: '100%',
      maxWidth: '720px',
      maxHeight: '90vh',
      display: 'flex',
      flexDirection: 'column' as const,
      boxShadow: colors.shadow.xl,
      overflow: 'hidden',
    },
    header: {
      padding: '1.5rem 2rem',
      borderBottom: `1px solid ${colors.border}`,
      display: 'flex',
      justifyContent: 'space-between',
      alignItems: 'center',
      backgroundColor: colors.surface,
    },
    body: { padding: '2rem', overflowY: 'auto' as const, flex: 1 },
    detail: {
      display: 'flex',
      justifyContent: 'space-between',
      padding: '0.75rem 0',
      borderBottom: `1px solid ${colors.border}`,
      gap: '1rem',
    },
    label: { color: colors.text.secondary, fontSize: '0.875rem', fontWeight: 500 },
    value: { color: colors.text.primary, fontSize: '0.875rem', textAlign: 'right' as const, maxWidth: '60%', wordBreak: 'break-word' as const },
  };

  return (
    <div style={styles.overlay} onClick={onClose}>
      <div style={styles.modal} onClick={(e) => e.stopPropagation()}>
        <div style={styles.header}>
          <h2 style={{ fontSize: '1.25rem', fontWeight: 600, color: colors.text.primary }}>Product Details</h2>
          <button type="button" onClick={onClose} aria-label="Close" style={{ border: 'none', background: 'transparent', cursor: 'pointer', color: colors.text.secondary }}>
            <X size={20} />
          </button>
        </div>

        <div style={styles.body}>
          {gallery.length > 0 ? (
            <>
              <div style={{ position: 'relative', width: '100%', paddingTop: '60%', backgroundColor: colors.surface, borderRadius: colors.radius.lg, overflow: 'hidden', marginBottom: '1rem' }}>
                {/* eslint-disable-next-line @next/next/no-img-element */}
                <img src={gallery[currentImageIndex]} alt={product.name} style={{ position: 'absolute', inset: 0, width: '100%', height: '100%', objectFit: 'contain' }} />
                {gallery.length > 1 && (
                  <>
                    <button type="button" onClick={prevImage} aria-label="Previous image" style={{ position: 'absolute', left: 8, top: '50%', transform: 'translateY(-50%)', border: 'none', borderRadius: '50%', padding: 8, background: '#fff', cursor: 'pointer' }}>
                      <ChevronLeft size={20} />
                    </button>
                    <button type="button" onClick={nextImage} aria-label="Next image" style={{ position: 'absolute', right: 8, top: '50%', transform: 'translateY(-50%)', border: 'none', borderRadius: '50%', padding: 8, background: '#fff', cursor: 'pointer' }}>
                      <ChevronRight size={20} />
                    </button>
                  </>
                )}
              </div>
              <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fill, minmax(60px, 1fr))', gap: 8, marginBottom: 16 }}>
                {gallery.map((image, index) => (
                  // eslint-disable-next-line @next/next/no-img-element
                  <img
                    key={`${image}-${index}`}
                    src={image}
                    alt=""
                    onClick={() => setCurrentImageIndex(index)}
                    style={{ width: '100%', aspectRatio: '1', objectFit: 'cover', borderRadius: 6, cursor: 'pointer', border: index === currentImageIndex ? `2px solid ${colors.primary[500]}` : '2px solid transparent' }}
                  />
                ))}
              </div>
            </>
          ) : (
            <div style={{ padding: '3rem', textAlign: 'center', color: colors.text.muted, background: colors.surface, borderRadius: colors.radius.lg, marginBottom: 16 }}>
              No images available
            </div>
          )}

          {product.slug && (
            <div style={{ marginBottom: 16 }}>
              <Link href={`/product/${product.slug}`} target="_blank" style={{ color: colors.primary[600], fontSize: 14, display: 'inline-flex', alignItems: 'center', gap: 6 }}>
                Preview on store <ExternalLink size={14} />
              </Link>
            </div>
          )}

          {[
            ['Product Name', product.name],
            ['Slug', product.slug || '—'],
            ['Brand', product.brand || '—'],
            ['SKU', product.sku || '—'],
            ['Category', categoryName || '—'],
            ['Sub Category', subCategoryName || '—'],
            ['Price', info.from ? `From ${formatCurrency(info.price)}` : formatCurrency(info.price)],
            ['Base price', formatCurrency(product.price)],
            ['Discount', product.discount ? `${product.discount}%` : '—'],
            ['Total stock', String(getTotalStock(catalog))],
            ['Status', statusLabel],
            ['Featured', product.isFeatured ? 'Yes' : 'No'],
            ['Material', product.material || '—'],
            ['Dimensions', product.dimensions || '—'],
            ['Care', product.careInstructions || '—'],
            ['SEO title', product.seoTitle || '—'],
            ['SEO description', product.seoDescription || '—'],
            ['Created', product.createdAt || product.created_date ? formatDate(product.createdAt || product.created_date || '') : '—'],
            ['Updated', product.updatedAt || product.updated_date ? formatDate(product.updatedAt || product.updated_date || '') : '—'],
          ].map(([label, value]) => (
            <div key={label} style={styles.detail}>
              <span style={styles.label}>{label}</span>
              <span style={styles.value}>{value}</span>
            </div>
          ))}

          {product.features && product.features.length > 0 && (
            <div style={{ marginTop: 16, padding: 16, background: colors.surface, borderRadius: 8 }}>
              <strong style={{ display: 'block', marginBottom: 8 }}>Features</strong>
              <ul style={{ margin: 0, paddingLeft: 18, color: colors.text.secondary, fontSize: 14 }}>
                {product.features.map((f) => (
                  <li key={f}>{f}</li>
                ))}
              </ul>
            </div>
          )}

          {product.specifications && product.specifications.length > 0 && (
            <div style={{ marginTop: 16, padding: 16, background: colors.surface, borderRadius: 8 }}>
              <strong style={{ display: 'block', marginBottom: 8 }}>Specifications</strong>
              {product.specifications.map((spec) => (
                <div key={`${spec.label}-${spec.value}`} style={{ display: 'flex', justifyContent: 'space-between', fontSize: 14, padding: '4px 0' }}>
                  <span style={{ color: colors.text.secondary }}>{spec.label}</span>
                  <span>{spec.value}</span>
                </div>
              ))}
            </div>
          )}

          {product.shortDescription && (
            <div style={{ marginTop: 16, padding: 16, background: colors.surface, borderRadius: 8, fontSize: 14, color: colors.text.secondary }}>
              <strong style={{ display: 'block', marginBottom: 8, color: colors.text.primary }}>Short Description</strong>
              {product.shortDescription}
            </div>
          )}

          {product.longDescription && (
            <div style={{ marginTop: 16, padding: 16, background: colors.surface, borderRadius: 8, fontSize: 14, color: colors.text.secondary }}>
              <strong style={{ display: 'block', marginBottom: 8, color: colors.text.primary }}>Long Description</strong>
              {product.longDescription}
            </div>
          )}

          <h3 style={{ marginTop: 24, marginBottom: 12, fontSize: 16 }}>Variants ({product.variants?.length ?? 0})</h3>
          {(product.variants ?? []).length === 0 ? (
            <p style={{ color: colors.text.muted, fontSize: 14 }}>No variants yet.</p>
          ) : (
            (product.variants ?? []).map((variant) => (
              <div key={variant._id} style={{ border: `1px solid ${colors.border}`, borderRadius: 10, padding: 16, marginBottom: 12 }}>
                <div style={{ display: 'flex', justifyContent: 'space-between', gap: 12, marginBottom: 8 }}>
                  <strong>
                    {variant.configName}
                    {variant.colorName ? ` — ${variant.colorName}` : ''}
                  </strong>
                  <span style={{ fontSize: 12, color: variant.isActive ? colors.success[700] : colors.text.muted }}>
                    {variant.isActive ? 'Active' : 'Inactive'}
                  </span>
                </div>
                <div style={{ fontSize: 14, color: colors.text.secondary }}>
                  {formatCurrency(getVariantFinalPrice(variant))}
                  {isVariantOnSale(variant) && (
                    <span style={{ marginLeft: 8, textDecoration: 'line-through' }}>{formatCurrency(variant.price)}</span>
                  )}
                  {' · '}
                  {variant.stock} in stock
                  {variant.sku ? ` · SKU ${variant.sku}` : ''}
                </div>
                {variant.images?.length ? (
                  <div style={{ display: 'flex', gap: 8, flexWrap: 'wrap', marginTop: 10 }}>
                    {variant.images.map((url) => (
                      // eslint-disable-next-line @next/next/no-img-element
                      <img key={url} src={url} alt="" style={{ width: 56, height: 56, objectFit: 'cover', borderRadius: 6, border: `1px solid ${colors.border}` }} />
                    ))}
                  </div>
                ) : null}
              </div>
            ))
          )}
        </div>
      </div>
    </div>
  );
}
