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
import { productService } from '@/lib/productService';
import { Product, ProductFormData } from '@/Type/products';

export default function ProductsPage() {
  const {
    products,
    loading,
    page,
    totalPages,
    search,
    archived,
    setPage,
    setSearch,
    setArchived,
    createProduct,
    updateProduct,
    deleteProduct,
    restoreProduct,
    publishProduct,
    unpublishProduct,
  } = useProducts();

  const [selectedProduct, setSelectedProduct] = useState<Product | null>(null);
  const [modalType, setModalType] = useState<'add' | 'edit' | 'view' | 'delete' | 'duplicate' | 'variants' | null>(null);
  const [modalLoading, setModalLoading] = useState(false);
  const [actionLoadingId, setActionLoadingId] = useState<string | null>(null);

  const handleAdd = () => {
    setSelectedProduct(null);
    setModalType('add');
  };

  const handleEdit = (product: Product) => {
    setSelectedProduct(product);
    setModalType('edit');
    productService.getProduct(product._id).then(setSelectedProduct).catch(() => undefined);
  };

  const handleView = (product: Product) => {
    setSelectedProduct(product);
    setModalType('view');
    productService.getProduct(product._id).then(setSelectedProduct).catch(() => undefined);
  };

  const handleDelete = (product: Product) => {
    setSelectedProduct(product);
    setModalType('delete');
  };

  const handleEditVariants = (product: Product) => {
    setSelectedProduct(product);
    setModalType('variants');
    productService.getProduct(product._id).then(setSelectedProduct).catch(() => undefined);
  };

  const handleDuplicate = (product: Product) => {
    // Fetch the full product data then open the modal in "add" mode with prefilled data
    const duplicated: Product = {
      ...product,
      _id: '',
      slug: '',
      name: `${product.name} (Copy)`,
      isActive: false,
      isArchived: false,
      variants: [],
    };
    setSelectedProduct(duplicated);
    setModalType('duplicate');
    // Also fetch the full product details to get all fields (variants excluded for duplicate)
    productService.getProduct(product._id).then((full) => {
      setSelectedProduct({
        ...full,
        _id: '',
        slug: '',
        name: `${full.name} (Copy)`,
        isActive: false,
        isArchived: false,
        variants: [],
      });
    }).catch(() => undefined);
  };

  const handleCloseModal = () => {
    setModalType(null);
    setSelectedProduct(null);
  };

  const handleSubmit = async (data: ProductFormData, images: File[], thumbnail: File | null) => {
    setModalLoading(true);
    try {
      if (modalType === 'add' || modalType === 'duplicate') {
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
        console.error('Error archiving product:', error);
      } finally {
        setModalLoading(false);
      }
    }
  };

  const runRowAction = async (product: Product, action: () => Promise<void>) => {
    setActionLoadingId(product._id);
    try {
      await action();
    } finally {
      setActionLoadingId(null);
    }
  };

  return (
    <div style={{ padding: '2rem', maxWidth: '1400px', margin: '0 auto' }}>
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

      <div style={{ marginBottom: '2rem' }}>
        <h1 style={{ fontSize: '1.875rem', fontWeight: 700, color: colors.text.primary, marginBottom: '0.5rem' }}>
          Product Management
        </h1>
        <p style={{ color: colors.text.secondary, fontSize: '0.875rem' }}>
          Manage your product inventory, categories, and pricing
        </p>
      </div>

      <ProductTable
        products={products}
        loading={loading}
        onView={handleView}
        onEdit={handleEdit}
        onEditVariants={handleEditVariants}
        onDelete={handleDelete}
        onAdd={handleAdd}
        onDuplicate={handleDuplicate}
        onPublish={(product) => runRowAction(product, () => publishProduct(product._id))}
        onUnpublish={(product) => runRowAction(product, () => unpublishProduct(product._id))}
        onRestore={(product) => runRowAction(product, () => restoreProduct(product._id))}
        search={search}
        onSearchChange={setSearch}
        page={page}
        totalPages={totalPages}
        onPageChange={setPage}
        archived={archived}
        onArchivedChange={setArchived}
        actionLoadingId={actionLoadingId}
      />

      {(modalType === 'add' || modalType === 'edit' || modalType === 'duplicate' || modalType === 'variants') && (
        <ProductModal
          isOpen={true}
          onClose={handleCloseModal}
          onSubmit={handleSubmit}
          initialData={modalType === 'edit' || modalType === 'variants' ? selectedProduct : modalType === 'duplicate' ? selectedProduct : null}
          scrollToVariants={modalType === 'variants'}
          loading={modalLoading}
        />
      )}

      {modalType === 'view' && selectedProduct && (
        <ProductViewModal isOpen={true} onClose={handleCloseModal} product={selectedProduct} />
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
