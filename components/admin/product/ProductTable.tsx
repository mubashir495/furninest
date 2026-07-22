// src/components/admin/products/ProductTable.tsx

'use client';

import React, { useState } from 'react';
import { colors } from '@/config/colors';
import { Product } from '@/Type/products';
import { formatCurrency, formatDate } from '@/utils/validators';
import { Eye, Edit2, Trash2, Search, Plus } from 'lucide-react';

interface ProductTableProps {
  products: Product[];
  loading: boolean;
  onView: (product: Product) => void;
  onEdit: (product: Product) => void;
  onDelete: (product: Product) => void;
  onAdd: () => void;
  search: string;
  onSearchChange: (value: string) => void;
  page: number;
  totalPages: number;
  onPageChange: (page: number) => void;
}

export default function ProductTable({
  products = [],
  loading,
  onView,
  onEdit,
  onDelete,
  onAdd,
  search,
  onSearchChange,
  page,
  totalPages,
  onPageChange,
}: ProductTableProps) {
  const [searchInput, setSearchInput] = useState(search);

  const handleSearch = (e: React.FormEvent) => {
    e.preventDefault();
    onSearchChange(searchInput);
  };

  const getStatusColor = (status: string) => {
    return status === 'active'
      ? { bg: colors.success[50], text: colors.success[700] }
      : { bg: colors.error[50], text: colors.error[700] };
  };

  const getCategoryName = (category: any): string => {
    if (!category) return 'N/A';
    if (typeof category === 'object' && category.name) {
      return category.name;
    }
    return category || 'N/A';
  };

  const getSubCategoryName = (subCategory: any): string => {
    if (!subCategory) return 'N/A';
    if (typeof subCategory === 'object' && subCategory.name) {
      return subCategory.name;
    }
    return subCategory || 'N/A';
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
    transition: 'all 0.2s',
  };

  const tableStyle: React.CSSProperties = {
    width: '100%',
    borderCollapse: 'collapse' as const,
  };

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
    cursor: 'pointer',
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

  const tagBadgeStyle: React.CSSProperties = {
    display: 'inline-block',
    padding: '0.15rem 0.5rem',
    borderRadius: colors.radius.full,
    fontSize: '0.7rem',
    fontWeight: 500,
    backgroundColor: colors.surface,
    border: `1px solid ${colors.border}`,
    color: colors.text.secondary,
    marginRight: '4px',
    marginBottom: '4px',
  };

  const actionsStyle: React.CSSProperties = {
    display: 'flex',
    gap: '0.5rem',
  };

  const actionButtonStyle: React.CSSProperties = {
    padding: '0.375rem',
    borderRadius: colors.radius.md,
    border: 'none',
    background: 'transparent',
    cursor: 'pointer',
    transition: 'all 0.2s',
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
    transition: 'all 0.2s',
    color: colors.text.primary,
  };

  const paginationButtonDisabledStyle: React.CSSProperties = {
    ...paginationButtonStyle,
    opacity: 0.5,
    cursor: 'not-allowed',
  };

  const loadingOverlayStyle: React.CSSProperties = {
    padding: '3rem',
    textAlign: 'center',
    color: colors.text.secondary,
  };

  const emptyStateStyle: React.CSSProperties = {
    padding: '4rem',
    textAlign: 'center',
    color: colors.text.secondary,
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
    transition: 'all 0.2s',
  };

  const productsArray = Array.isArray(products) ? products : [];

  return (
    <div style={wrapperStyle}>
      <div style={searchContainerStyle}>
        <form onSubmit={handleSearch} style={{ display: 'flex', gap: '0.75rem' }}>
          <input
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
              transition: 'all 0.2s',
            }}
          >
            <Search size={18} />
            Search
          </button>
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
              <th style={headerCellStyle}>Final Price</th>
              <th style={headerCellStyle}>Stock</th>
              <th style={headerCellStyle}>Colors</th>
              <th style={headerCellStyle}>Sizes</th>
              <th style={headerCellStyle}>Status</th>
              <th style={headerCellStyle}>Created</th>
              <th style={headerCellStyle}>Actions</th>
            </tr>
          </thead>
          <tbody>
            {loading ? (
              <tr>
                <td colSpan={11} style={loadingOverlayStyle}>
                  <div>Loading products...</div>
                </td>
              </tr>
            ) : productsArray.length === 0 ? (
              <tr>
                <td colSpan={11} style={emptyStateStyle}>
                  <div>
                    <p style={{ fontSize: '1.125rem', fontWeight: 500, marginBottom: '0.5rem' }}>
                      No products found
                    </p>
                    <p style={{ color: colors.text.muted }}>
                      {search ? 'Try adjusting your search' : 'Create your first product'}
                    </p>
                  </div>
                </td>
              </tr>
            ) : (
              productsArray.map((product, index) => {
                const statusColors = getStatusColor(product.status || 'inactive');
                const rowBgColor = index % 2 === 0 ? colors.background : colors.surface;

                return (
                  <tr
                    key={product._id || index}
                    style={{
                      ...rowStyle,
                      backgroundColor: rowBgColor,
                    }}
                    onMouseEnter={(e) => {
                      e.currentTarget.style.backgroundColor = colors.surface;
                    }}
                    onMouseLeave={(e) => {
                      e.currentTarget.style.backgroundColor = rowBgColor;
                    }}
                  >
                    <td style={cellStyle}>
                      {product.images && product.images.length > 0 ? (
                        <img
                          src={product.images[0]}
                          alt={product.name || 'Product'}
                          style={thumbnailStyle}
                          onError={(e) => {
                            (e.target as HTMLImageElement).style.display = 'none';
                          }}
                        />
                      ) : (
                        <div style={{
                          width: 48,
                          height: 48,
                          borderRadius: colors.radius.md,
                          backgroundColor: colors.surface,
                          display: 'flex',
                          alignItems: 'center',
                          justifyContent: 'center',
                          color: colors.text.muted,
                          fontSize: '10px',
                        }}>
                          No img
                        </div>
                      )}
                    </td>
                    <td style={{ ...cellStyle, fontWeight: 500 }}>{product.name || 'Unnamed'}</td>
                    <td style={cellStyle}>{getCategoryName(product.category)}</td>
                    <td style={cellStyle}>{formatCurrency(product.price || 0)}</td>
                    <td style={{ ...cellStyle, fontWeight: 600, color: colors.primary[600] }}>
                      {formatCurrency(product.finalPrice || product.price || 0)}
                    </td>
                    <td style={cellStyle}>
                      <span style={{
                        color: (product.stock || 0) > 0 ? colors.success[700] : colors.error[700],
                        fontWeight: 500,
                      }}>
                        {product.stock || 0}
                      </span>
                    </td>
                    <td style={{ ...cellStyle, maxWidth: '160px' }}>
                      {product.color && product.color.length > 0 ? (
                        <div style={{ display: 'flex', flexWrap: 'wrap' }}>
                          {product.color.map((c, i) => (
                            <span key={i} style={tagBadgeStyle}>{c}</span>
                          ))}
                        </div>
                      ) : (
                        <span style={{ color: colors.text.muted }}>N/A</span>
                      )}
                    </td>
                    <td style={{ ...cellStyle, maxWidth: '160px' }}>
                      {product.size && product.size.length > 0 ? (
                        <div style={{ display: 'flex', flexWrap: 'wrap' }}>
                          {product.size.map((s, i) => (
                            <span key={i} style={tagBadgeStyle}>{s}</span>
                          ))}
                        </div>
                      ) : (
                        <span style={{ color: colors.text.muted }}>N/A</span>
                      )}
                    </td>
                    <td style={cellStyle}>
                      <span style={{
                        ...statusBadgeStyle,
                        backgroundColor: statusColors.bg,
                        color: statusColors.text,
                      }}>
                        {product.status ? product.status.charAt(0).toUpperCase() + product.status.slice(1) : 'Inactive'}
                      </span>
                    </td>
                    <td style={cellStyle}>{product.createdAt ? formatDate(product.createdAt) : 'N/A'}</td>
                    <td style={cellStyle}>
                      <div style={actionsStyle}>
                        <button
                          onClick={() => onView(product)}
                          style={{
                            ...actionButtonStyle,
                            color: colors.info[500],
                          }}
                          title="View product"
                        >
                          <Eye size={18} />
                        </button>
                        <button
                          onClick={() => onEdit(product)}
                          style={{
                            ...actionButtonStyle,
                            color: colors.primary[500],
                          }}
                          title="Edit product"
                        >
                          <Edit2 size={18} />
                        </button>
                        <button
                          onClick={() => onDelete(product)}
                          style={{
                            ...actionButtonStyle,
                            color: colors.error[500],
                          }}
                          title="Delete product"
                        >
                          <Trash2 size={18} />
                        </button>
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
          <div>
            <span style={{ color: colors.text.secondary, fontSize: '0.875rem' }}>
              Page {page} of {totalPages}
            </span>
          </div>
          <div style={{ display: 'flex', gap: '0.5rem' }}>
            <button
              onClick={() => onPageChange(page - 1)}
              disabled={page === 1}
              style={page === 1 ? paginationButtonDisabledStyle : paginationButtonStyle}
            >
              Previous
            </button>
            <button
              onClick={() => onPageChange(page + 1)}
              disabled={page === totalPages}
              style={page === totalPages ? paginationButtonDisabledStyle : paginationButtonStyle}
            >
              Next
            </button>
          </div>
        </div>
      )}
    </div>
  );
}