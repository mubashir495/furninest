// src/components/admin/products/ProductViewModal.tsx

'use client';

import React, { useState } from 'react';
import { colors } from '@/config/colors';
import { Product } from '@/Type/products';
import { formatCurrency, formatDate } from '@/utils/validators';
import { X, ChevronLeft, ChevronRight } from 'lucide-react';

interface ProductViewModalProps {
  isOpen: boolean;
  onClose: () => void;
  product: Product;
}

export default function ProductViewModal({
  isOpen,
  onClose,
  product,
}: ProductViewModalProps) {
  const [currentImageIndex, setCurrentImageIndex] = useState(0);

  if (!isOpen) return null;

  const getStatusColor = (status: string) => {
    return status === 'active' 
      ? { bg: colors.success[50], text: colors.success[700] }
      : { bg: colors.error[50], text: colors.error[700] };
  };

  const statusColors = getStatusColor(product.status);
  const categoryName = typeof product.category === 'object' ? product.category.name : product.category;
  const subCategoryName = typeof product.subCategory === 'object' ? product.subCategory.name : product.subCategory;

  const nextImage = () => {
    if (product.images && product.images.length > 0) {
      setCurrentImageIndex((prev) => (prev + 1) % product.images.length);
    }
  };

  const prevImage = () => {
    if (product.images && product.images.length > 0) {
      setCurrentImageIndex((prev) => (prev - 1 + product.images.length) % product.images.length);
    }
  };

  const styles = {
    overlay: {
      position: 'fixed' as const,
      top: 0,
      left: 0,
      right: 0,
      bottom: 0,
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
      maxWidth: '600px',
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
      flexShrink: 0,
    },
    title: {
      fontSize: '1.25rem',
      fontWeight: 600,
      color: colors.text.primary,
    },
    closeButton: {
      padding: '0.5rem',
      borderRadius: colors.radius.md,
      border: 'none',
      background: 'transparent',
      cursor: 'pointer',
      color: colors.text.secondary,
      transition: 'all 0.2s',
      display: 'flex',
      alignItems: 'center',
      justifyContent: 'center',
    },
    body: {
      padding: '2rem',
      overflowY: 'auto' as const,
      flex: 1,
    },
    imageContainer: {
      position: 'relative' as const,
      width: '100%',
      paddingTop: '75%',
      backgroundColor: colors.surface,
      borderRadius: colors.radius.lg,
      overflow: 'hidden',
      marginBottom: '1.5rem',
    },
    image: {
      position: 'absolute' as const,
      top: 0,
      left: 0,
      width: '100%',
      height: '100%',
      objectFit: 'contain' as const,
    },
    navButton: {
      position: 'absolute' as const,
      top: '50%',
      transform: 'translateY(-50%)',
      padding: '0.5rem',
      backgroundColor: 'rgba(255, 255, 255, 0.9)',
      border: 'none',
      borderRadius: '50%',
      cursor: 'pointer',
      display: 'flex',
      alignItems: 'center',
      justifyContent: 'center',
      boxShadow: colors.shadow.md,
      transition: 'all 0.2s',
    },
    navButtonLeft: {
      left: '0.5rem',
    },
    navButtonRight: {
      right: '0.5rem',
    },
    thumbnailContainer: {
      display: 'grid',
      gridTemplateColumns: 'repeat(auto-fill, minmax(60px, 1fr))',
      gap: '0.5rem',
      marginBottom: '1.5rem',
    },
    thumbnail: {
      width: '100%',
      aspectRatio: '1',
      objectFit: 'cover' as const,
      borderRadius: colors.radius.sm,
      cursor: 'pointer',
      border: `2px solid transparent`,
      transition: 'all 0.2s',
    },
    thumbnailActive: {
      borderColor: colors.primary[500],
    },
    detail: {
      display: 'flex',
      justifyContent: 'space-between',
      padding: '0.75rem 0',
      borderBottom: `1px solid ${colors.border}`,
      alignItems: 'center',
    },
    detailLabel: {
      color: colors.text.secondary,
      fontSize: '0.875rem',
      fontWeight: 500,
    },
    detailValue: {
      color: colors.text.primary,
      fontSize: '0.875rem',
      fontWeight: 400,
      textAlign: 'right' as const,
      wordBreak: 'break-word' as const,
      maxWidth: '60%',
    },
    statusBadge: {
      padding: '0.25rem 0.75rem',
      borderRadius: colors.radius.full,
      fontSize: '0.75rem',
      fontWeight: 500,
      display: 'inline-block',
    },
    description: {
      marginTop: '1rem',
      padding: '1rem',
      backgroundColor: colors.surface,
      borderRadius: colors.radius.md,
      fontSize: '0.875rem',
      color: colors.text.secondary,
      lineHeight: 1.6,
    },
    noImages: {
      display: 'flex',
      alignItems: 'center',
      justifyContent: 'center',
      width: '100%',
      paddingTop: '75%',
      backgroundColor: colors.surface,
      borderRadius: colors.radius.lg,
      marginBottom: '1.5rem',
      color: colors.text.muted,
      fontSize: '0.875rem',
    },
  };

  return (
    <div style={styles.overlay} onClick={onClose}>
      <div style={styles.modal} onClick={(e) => e.stopPropagation()}>
        <div style={styles.header}>
          <h2 style={styles.title}>Product Details</h2>
          <button style={styles.closeButton} onClick={onClose}>
            <X size={20} />
          </button>
        </div>

        <div style={styles.body}>
          {product.images && product.images.length > 0 ? (
            <>
              <div style={styles.imageContainer}>
                <img
                  src={product.images[currentImageIndex]}
                  alt={product.name}
                  style={styles.image}
                />
                {product.images.length > 1 && (
                  <>
                    <button
                      onClick={prevImage}
                      style={{
                        ...styles.navButton,
                        ...styles.navButtonLeft,
                      }}
                    >
                      <ChevronLeft size={20} />
                    </button>
                    <button
                      onClick={nextImage}
                      style={{
                        ...styles.navButton,
                        ...styles.navButtonRight,
                      }}
                    >
                      <ChevronRight size={20} />
                    </button>
                  </>
                )}
              </div>

              <div style={styles.thumbnailContainer}>
                {product.images.map((image: string, index: number) => (
                  <img
                    key={index}
                    src={image}
                    alt={`${product.name} ${index + 1}`}
                    style={{
                      ...styles.thumbnail,
                      ...(index === currentImageIndex ? styles.thumbnailActive : {}),
                    }}
                    onClick={() => setCurrentImageIndex(index)}
                  />
                ))}
              </div>
            </>
          ) : (
            <div style={styles.noImages}>
              No images available
            </div>
          )}

          <div style={styles.detail}>
            <span style={styles.detailLabel}>Product Name</span>
            <span style={styles.detailValue}>{product.name}</span>
          </div>

          <div style={styles.detail}>
            <span style={styles.detailLabel}>Category</span>
            <span style={styles.detailValue}>{categoryName}</span>
          </div>

          <div style={styles.detail}>
            <span style={styles.detailLabel}>Sub Category</span>
            <span style={styles.detailValue}>{subCategoryName}</span>
          </div>

          <div style={styles.detail}>
            <span style={styles.detailLabel}>Price</span>
            <span style={styles.detailValue}>{formatCurrency(product.price)}</span>
          </div>

          {product.discount !== undefined && product.discount > 0 && (
            <div style={styles.detail}>
              <span style={styles.detailLabel}>Discount</span>
              <span style={styles.detailValue}>{product.discount}%</span>
            </div>
          )}

          <div style={styles.detail}>
            <span style={styles.detailLabel}>Final Price</span>
            <span style={{ ...styles.detailValue, fontWeight: 600, color: colors.primary[600] }}>
              {formatCurrency(product.finalPrice)}
            </span>
          </div>

          <div style={styles.detail}>
            <span style={styles.detailLabel}>Stock</span>
            <span style={{
              ...styles.detailValue,
              color: product.stock > 0 ? colors.success[700] : colors.error[700],
              fontWeight: 500,
            }}>
              {product.stock} units
            </span>
          </div>

          <div style={styles.detail}>
            <span style={styles.detailLabel}>Status</span>
            <span style={{
              ...styles.statusBadge,
              backgroundColor: statusColors.bg,
              color: statusColors.text,
            }}>
              {product.status.charAt(0).toUpperCase() + product.status.slice(1)}
            </span>
          </div>

          <div style={styles.detail}>
            <span style={styles.detailLabel}>Created</span>
            <span style={styles.detailValue}>{formatDate(product.createdAt)}</span>
          </div>

          <div style={styles.detail}>
            <span style={styles.detailLabel}>Updated</span>
            <span style={styles.detailValue}>{formatDate(product.updatedAt)}</span>
          </div>

          {product.shortDescription && (
            <div style={styles.description}>
              <strong style={{ display: 'block', marginBottom: '0.5rem', color: colors.text.primary }}>
                Short Description
              </strong>
              {product.shortDescription}
            </div>
          )}

          {product.longDescription && (
            <div style={{ ...styles.description, marginTop: '1rem' }}>
              <strong style={{ display: 'block', marginBottom: '0.5rem', color: colors.text.primary }}>
                Long Description
              </strong>
              {product.longDescription}
            </div>
          )}
        </div>
      </div>
    </div>
  );
}