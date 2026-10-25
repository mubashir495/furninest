'use client';

import React, { useState } from 'react';
import { colors } from '@/config/colors';
import { Product } from '@/Type/products';
import {
  Product as CatalogProduct,
  getProductPriceInfo,
  getTotalStock,
  hasVariants,
} from '@/Type/product';
import { formatCurrency } from '@/utils/validators';
import { Archive, Eye, Edit2, Loader2, Plus, RotateCcw, Search, Upload, Ban } from 'lucide-react';

interface ProductTableProps {
  products: Product[];
  loading: boolean;
  onView: (product: Product) => void;
  onEdit: (product: Product) => void;
  onDelete: (product: Product) => void;
  onAdd: () => void;
  onPublish?: (product: Product) => Promise<void> | void;
  onUnpublish?: (product: Product) => Promise<void> | void;
  onRestore?: (product: Product) => Promise<void> | void;
  search: string;
  onSearchChange: (value: string) => void;
  page: number;
  totalPages: number;
  onPageChange: (page: number) => void;
  archived?: boolean;
  onArchivedChange?: (value: boolean) => void;
  actionLoadingId?: string | null;
}

function asCatalog(product: Product): CatalogProduct {
  return {
    ...(product as unknown as CatalogProduct),
    finalPrice: product.finalPrice ?? product.price,
    thumbnailImage: product.thumbnailImage || '',
    created_date: product.created_date || product.createdAt || '',
    updated_date: product.updated_date || product.updatedAt || '',
    isActive: Boolean(product.isActive),
  };
}

function statusMeta(product: Product) {
  if (product.isArchived) {
    return { label: 'Archived', bg: colors.warning[50], text: colors.warning[700] };
  }
  if (product.isActive) {
    return { label: 'Published', bg: colors.success[50], text: colors.success[700] };
  }
  return { label: 'Unpublished', bg: colors.error[50], text: colors.error[700] };
}

export default function ProductTable({
  products = [],
  loading,
  onView,
  onEdit,
  onDelete,
  onAdd,
  onPublish,
  onUnpublish,
  onRestore,
  search,
  onSearchChange,
  page,
  totalPages,
  onPageChange,
  archived = false,
  onArchivedChange,
  actionLoadingId = null,
}: ProductTableProps) {
  const [searchInput, setSearchInput] = useState(search);

  const handleSearch = (e: React.FormEvent) => {
    e.preventDefault();
    onSearchChange(searchInput);
  };

  const getCategoryName = (category: Product['category']): string => {
    if (!category) return 'N/A';
    if (typeof category === 'object' && category.name) return category.name;
    return 'N/A';
  };

  const wrapperStyle: React.CSSProperties = {
    backgroundColor: colors.background,
    borderRadius: colors.radius.lg,
    boxShadow: colors.shadow.md,
    overflow: 'hidden',
  };

  const searchContainerStyle: React.CSSProperties = {
    padding: '1.5rem',
    borderBottom: `1px solid ${colors.border}`,
    display: 'flex',
    justifyContent: 'space-between',
    alignItems: 'center',
    flexWrap: 'wrap',
    gap: '1rem',
  };

  const searchInputStyle: React.CSSProperties = {
    padding: '0.625rem 1rem',
    border: `1px solid ${colors.border}`,
    borderRadius: colors.radius.md,
    fontSize: '0.875rem',
    outline: 'none',
    width: '300px',
  };

  const tableStyle: React.CSSProperties = { width: '100%', borderCollapse: 'collapse' };
  const headerStyle: React.CSSProperties = {
    backgroundColor: colors.surface,
    borderBottom: `2px solid ${colors.border}`,
  };
  const headerCellStyle: React.CSSProperties = {
    padding: '1rem 1.5rem',
    textAlign: 'left',
    fontSize: '0.75rem',
    fontWeight: 600,
    textTransform: 'uppercase',
    letterSpacing: '0.05em',
    color: colors.text.secondary,
  };
  const rowStyle: React.CSSProperties = {
    borderBottom: `1px solid ${colors.border}`,
    transition: 'background-color 0.2s',
  };
  const cellStyle: React.CSSProperties = {
    padding: '1rem 1.5rem',
    fontSize: '0.875rem',
    color: colors.text.primary,
  };
  const thumbnailStyle: React.CSSProperties = {
    width: 48,
    height: 48,
    borderRadius: colors.radius.md,
    objectFit: 'cover',
  };
  const statusBadgeStyle: React.CSSProperties = {
    padding: '0.25rem 0.75rem',
    borderRadius: colors.radius.full,
    fontSize: '0.75rem',
    fontWeight: 500,
    display: 'inline-block',
  };
  const actionButtonStyle: React.CSSProperties = {
    padding: '0.375rem',
    borderRadius: colors.radius.md,
    border: 'none',
    background: 'transparent',
    cursor: 'pointer',
    display: 'flex',
    alignItems: 'center',
    justifyContent: 'center',
  };
  const paginationStyle: React.CSSProperties = {
    padding: '1rem 1.5rem',
    borderTop: `1px solid ${colors.border}`,
    display: 'flex',
    justifyContent: 'space-between',
    alignItems: 'center',
    flexWrap: 'wrap',
    gap: '1rem',
  };
  const paginationButtonStyle: React.CSSProperties = {
    padding: '0.5rem 1rem',
    border: `1px solid ${colors.border}`,
    borderRadius: colors.radius.md,
    background: colors.background,
    cursor: 'pointer',
    color: colors.text.primary,
  };
  const addButtonStyle: React.CSSProperties = {
    padding: '0.625rem 1.5rem',
    backgroundColor: colors.primary[500],
    color: 'white',
    border: 'none',
    borderRadius: colors.radius.md,
    cursor: 'pointer',
    display: 'flex',
    alignItems: 'center',
    gap: '0.5rem',
    fontWeight: 500,
  };

  const productsArray = Array.isArray(products) ? products : [];

  return (
    <div style={wrapperStyle}>
      <div style={searchContainerStyle}>
        <form onSubmit={handleSearch} style={{ display: 'flex', gap: '0.75rem', flexWrap: 'wrap', alignItems: 'center' }}>
          <label htmlFor="admin-product-search" className="sr-only">Search products</label>
          <input
            id="admin-product-search"
            type="text"
            placeholder="Search products by name..."
            value={searchInput}
            onChange={(e) => setSearchInput(e.target.value)}
            style={searchInputStyle}
          />
          <button
            type="submit"
            style={{
              padding: '0.625rem 1.5rem',
              backgroundColor: colors.primary[500],
              color: 'white',
              border: 'none',
              borderRadius: colors.radius.md,
              cursor: 'pointer',
              display: 'flex',
              alignItems: 'center',
              gap: '0.5rem',
              fontWeight: 500,
            }}
          >
            <Search size={18} />
            Search
          </button>
          <label style={{ display: 'flex', alignItems: 'center', gap: '8px', fontSize: '0.875rem', color: colors.text.secondary }}>
            <input
              type="checkbox"
              checked={archived}
              onChange={(e) => onArchivedChange?.(e.target.checked)}
            />
            Archived
          </label>
        </form>
        <button onClick={onAdd} style={addButtonStyle}>
          <Plus size={18} />
          Add Product
        </button>
      </div>

      <div style={{ overflowX: 'auto' }}>
        <table style={tableStyle}>
          <thead>
            <tr style={headerStyle}>
              <th style={headerCellStyle}>Image</th>
              <th style={headerCellStyle}>Name</th>
              <th style={headerCellStyle}>Category</th>
              <th style={headerCellStyle}>Price</th>
              <th style={headerCellStyle}>Stock</th>
              <th style={headerCellStyle}>Variants</th>
              <th style={headerCellStyle}>Status</th>
              <th style={headerCellStyle}>Actions</th>
            </tr>
          </thead>
          <tbody>
            {loading ? (
              <tr>
                <td colSpan={8} style={{ padding: '3rem', textAlign: 'center', color: colors.text.secondary }}>
                  Loading products...
                </td>
              </tr>
            ) : productsArray.length === 0 ? (
              <tr>
                <td colSpan={8} style={{ padding: '4rem', textAlign: 'center', color: colors.text.secondary }}>
                  <p style={{ fontSize: '1.125rem', fontWeight: 500, marginBottom: '0.5rem' }}>No products found</p>
                  <p style={{ color: colors.text.muted }}>
                    {search || archived ? 'Try adjusting your search or filter' : 'Create your first product'}
                  </p>
                </td>
              </tr>
            ) : (
              productsArray.map((product, index) => {
                const catalog = asCatalog(product);
                const info = getProductPriceInfo(catalog);
                const status = statusMeta(product);
                const thumbnail = product.thumbnailImage || product.images?.[0] || '';
                const variantCount = product.variants?.length ?? 0;
                const stock = getTotalStock(catalog);
                const busy = actionLoadingId === product._id;
                const rowBgColor = index % 2 === 0 ? colors.background : colors.surface;

                return (
                  <tr key={product._id || index} style={{ ...rowStyle, backgroundColor: rowBgColor }}>
                    <td style={cellStyle}>
                      {thumbnail ? (
                        // eslint-disable-next-line @next/next/no-img-element
                        <img src={thumbnail} alt={product.name || 'Product'} style={thumbnailStyle} />
                      ) : (
                        <div style={{ width: 48, height: 48, borderRadius: colors.radius.md, backgroundColor: colors.surface, color: colors.text.muted, fontSize: 10, display: 'flex', alignItems: 'center', justifyContent: 'center' }}>
                          No img
                        </div>
                      )}
                    </td>
                    <td style={{ ...cellStyle, fontWeight: 500 }}>{product.name || 'Unnamed'}</td>
                    <td style={cellStyle}>{getCategoryName(product.category)}</td>
                    <td style={{ ...cellStyle, fontWeight: 600, color: colors.primary[600] }}>
                      {info.from || hasVariants(catalog) ? `From ${formatCurrency(info.price)}` : formatCurrency(info.price)}
                    </td>
                    <td style={cellStyle}>
                      <span style={{ color: stock > 0 ? colors.success[700] : colors.error[700], fontWeight: 500 }}>
                        {stock}
                      </span>
                    </td>
                    <td style={cellStyle}>{variantCount}</td>
                    <td style={cellStyle}>
                      <span style={{ ...statusBadgeStyle, backgroundColor: status.bg, color: status.text }}>
                        {status.label}
                      </span>
                    </td>
                    <td style={cellStyle}>
                      <div style={{ display: 'flex', gap: '0.25rem', flexWrap: 'wrap' }}>
                        <button type="button" onClick={() => onView(product)} style={{ ...actionButtonStyle, color: colors.info[500] }} title="View product" aria-label={`View ${product.name}`}>
                          <Eye size={18} />
                        </button>
                        <button type="button" onClick={() => onEdit(product)} style={{ ...actionButtonStyle, color: colors.primary[500] }} title="Edit product" aria-label={`Edit ${product.name}`}>
                          <Edit2 size={18} />
                        </button>
                        {product.isArchived ? (
                          <button
                            type="button"
                            onClick={() => onRestore?.(product)}
                            disabled={busy}
                            style={{ ...actionButtonStyle, color: colors.success[700], opacity: busy ? 0.6 : 1 }}
                            title="Restore product"
                            aria-label={`Restore ${product.name}`}
                          >
                            {busy ? <Loader2 size={18} /> : <RotateCcw size={18} />}
                          </button>
                        ) : (
                          <>
                            {product.isActive ? (
                              <button
                                type="button"
                                onClick={() => onUnpublish?.(product)}
                                disabled={busy}
                                style={{ ...actionButtonStyle, color: colors.warning[700], opacity: busy ? 0.6 : 1 }}
                                title="Unpublish"
                                aria-label={`Unpublish ${product.name}`}
                              >
                                {busy ? <Loader2 size={18} /> : <Ban size={18} />}
                              </button>
                            ) : (
                              <button
                                type="button"
                                onClick={() => onPublish?.(product)}
                                disabled={busy}
                                style={{ ...actionButtonStyle, color: colors.success[700], opacity: busy ? 0.6 : 1 }}
                                title="Publish"
                                aria-label={`Publish ${product.name}`}
                              >
                                {busy ? <Loader2 size={18} /> : <Upload size={18} />}
                              </button>
                            )}
                            <button
                              type="button"
                              onClick={() => onDelete(product)}
                              disabled={busy}
                              style={{ ...actionButtonStyle, color: colors.error[500], opacity: busy ? 0.6 : 1 }}
                              title="Archive product"
                              aria-label={`Archive ${product.name}`}
                            >
                              <Archive size={18} />
                            </button>
                          </>
                        )}
                      </div>
                    </td>
                  </tr>
                );
              })
            )}
          </tbody>
        </table>
      </div>

      {totalPages > 1 && (
        <div style={paginationStyle}>
          <span style={{ color: colors.text.secondary, fontSize: '0.875rem' }}>
            Page {page} of {totalPages}
          </span>
          <div style={{ display: 'flex', gap: '0.5rem' }}>
            <button
              type="button"
              onClick={() => onPageChange(page - 1)}
              disabled={page === 1}
              style={{ ...paginationButtonStyle, opacity: page === 1 ? 0.5 : 1, cursor: page === 1 ? 'not-allowed' : 'pointer' }}
            >
              Previous
            </button>
            <button
              type="button"
              onClick={() => onPageChange(page + 1)}
              disabled={page === totalPages}
              style={{ ...paginationButtonStyle, opacity: page === totalPages ? 0.5 : 1, cursor: page === totalPages ? 'not-allowed' : 'pointer' }}
            >
              Next
            </button>
          </div>
        </div>
      )}
    </div>
  );
}
