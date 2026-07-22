// src/app/dashboard/(admin)/products/page.tsx

'use client';

import React, { useState } from 'react';
import { Toaster } from 'react-hot-toast';
import { colors } from '@/config/colors';
import ProductTable from '@/components/admin/product/ProductTable';
import ProductModal from '@/components/admin/product/ProductModal';
import ProductViewModal from '@/components/admin/product/ProductViewModal';
import ProductDeleteModal from '@/components/admin/product/ProductDeleteModal';
import { useProducts } from '@/hooks/useProducts';
import { Product, ProductFormData } from '@/Type/products';


export default function ProductsPage() {
  const {
    products,
    loading,
    page,
    totalPages,
    search,
    setPage,
    setSearch,
    createProduct,
    updateProduct,
    deleteProduct,
  } = useProducts();

  const [selectedProduct, setSelectedProduct] = useState<Product | null>(null);
  const [modalType, setModalType] = useState<'add' | 'edit' | 'view' | 'delete' | null>(null);
  const [modalLoading, setModalLoading] = useState(false);

  const handleAdd = () => {
    setSelectedProduct(null);
    setModalType('add');
  };

  const handleEdit = (product: Product) => {
    setSelectedProduct(product);
    setModalType('edit');
  };

  const handleView = (product: Product) => {
    setSelectedProduct(product);
    setModalType('view');
  };

  const handleDelete = (product: Product) => {
    setSelectedProduct(product);
    setModalType('delete');
  };

  const handleCloseModal = () => {
    setModalType(null);
    setSelectedProduct(null);
  };

  const handleSubmit = async (data: ProductFormData, images: File[], thumbnail: File | null) => {
  setModalLoading(true);
  try {
    if (modalType === 'add') {
      await createProduct(data, images, thumbnail);
    } else if (modalType === 'edit' && selectedProduct) {
      await updateProduct(selectedProduct._id, data, images, thumbnail);
    }
    handleCloseModal();
  } catch (error) {
    console.error('Error submitting form:', error);
  } finally {
    setModalLoading(false);
  }
};

  const handleConfirmDelete = async () => {
    if (selectedProduct) {
      setModalLoading(true);
      try {
        await deleteProduct(selectedProduct._id);
        handleCloseModal();
      } catch (error) {
        console.error('Error deleting product:', error);
      } finally {
        setModalLoading(false);
      }
    }
  };

  const pageStyles = {
    container: {
      padding: '2rem',
      maxWidth: '1400px',
      margin: '0 auto',
    },
    header: {
      marginBottom: '2rem',
    },
    title: {
      fontSize: '1.875rem',
      fontWeight: 700,
      color: colors.text.primary,
      marginBottom: '0.5rem',
    },
    subtitle: {
      color: colors.text.secondary,
      fontSize: '0.875rem',
    },
  };

  return (
    <div style={pageStyles.container}>
      <Toaster
        position="top-right"
        toastOptions={{
          duration: 4000,
          style: {
            background: colors.background,
            color: colors.text.primary,
            border: `1px solid ${colors.border}`,
            borderRadius: colors.radius.md,
            padding: '1rem',
          },
          success: {
            style: {
              background: colors.success[50],
              color: colors.success[700],
              border: `1px solid ${colors.success[500]}`,
            },
          },
          error: {
            style: {
              background: colors.error[50],
              color: colors.error[700],
              border: `1px solid ${colors.error[500]}`,
            },
          },
        }}
      />

      <div style={pageStyles.header}>
        <h1 style={pageStyles.title}>Product Management</h1>
        <p style={pageStyles.subtitle}>
          Manage your product inventory, categories, and pricing
        </p>
      </div>

      <ProductTable
        products={products}
        loading={loading}
        onView={handleView}
        onEdit={handleEdit}
        onDelete={handleDelete}
        onAdd={handleAdd}
        search={search}
        onSearchChange={setSearch}
        page={page}
        totalPages={totalPages}
        onPageChange={setPage}
      />

      {(modalType === 'add' || modalType === 'edit') && (
        <ProductModal
          isOpen={true}
          onClose={handleCloseModal}
          onSubmit={handleSubmit}
          initialData={modalType === 'edit' ? selectedProduct : null}
          loading={modalLoading}
        />
      )}

      {modalType === 'view' && selectedProduct && (
        <ProductViewModal
          isOpen={true}
          onClose={handleCloseModal}
          product={selectedProduct}
        />
      )}

      {modalType === 'delete' && selectedProduct && (
        <ProductDeleteModal
          isOpen={true}
          onClose={handleCloseModal}
          onConfirm={handleConfirmDelete}
          productName={selectedProduct.name}
          loading={modalLoading}
        />
      )}
    </div>
  );
}