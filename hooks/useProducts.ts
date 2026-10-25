import { useState, useEffect, useCallback } from 'react';
import { Product, Category, SubCategory, ProductFormData } from '@/Type/products';
import { productService } from '@/lib/productService';
import { toast } from 'react-hot-toast';

function appendProductForm(formData: FormData, data: ProductFormData) {
  formData.append('name', data.name);
  formData.append('shortDescription', data.shortDescription);
  formData.append('longDescription', data.longDescription);
  formData.append('subCategory', data.subCategory);
  formData.append('price', data.price.toString());
  formData.append('discount', data.discount.toString());
  formData.append('stock', data.stock.toString());
  formData.append('color', JSON.stringify(data.color || []));
  formData.append('size', JSON.stringify(data.size || []));

  if (data.suggestionItems) {
    formData.append('suggestionItems', JSON.stringify(data.suggestionItems));
  }
  if (data.brand !== undefined) formData.append('brand', data.brand);
  if (data.material !== undefined) formData.append('material', data.material);
  if (data.dimensions !== undefined) formData.append('dimensions', data.dimensions);
  if (data.careInstructions !== undefined) formData.append('careInstructions', data.careInstructions);
  if (data.seoTitle !== undefined) formData.append('seoTitle', data.seoTitle);
  if (data.seoDescription !== undefined) formData.append('seoDescription', data.seoDescription);
  if (data.features) formData.append('features', JSON.stringify(data.features));
  if (data.specifications) formData.append('specifications', JSON.stringify(data.specifications));
  if (data.isFeatured !== undefined) formData.append('isFeatured', String(data.isFeatured));
  if (data.isActive !== undefined) formData.append('isActive', String(data.isActive));
}

function notifyAuthError(errorMessage: string, fallback: string) {
  if (errorMessage.includes('Session expired') || errorMessage.includes('login again')) {
    toast.error('Session expired. Please login again.');
  } else {
    // Surface the real backend/server error so the user can act on it
    // (e.g. a Supabase upload failure or a validation 400). Only fall back to
    // the generic label when we genuinely have no message.
    toast.error(errorMessage || fallback);
  }
}

export function useProducts() {
  const [products, setProducts] = useState<Product[]>([]);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [page, setPage] = useState(1);
  const [totalPages, setTotalPages] = useState(1);
  const [search, setSearch] = useState('');
  const [total, setTotal] = useState(0);
  const [archived, setArchived] = useState(false);

  const fetchProducts = useCallback(async () => {
    setLoading(true);
    setError(null);
    try {
      const response = await productService.getProducts(page, 10, search, archived);

      const anyRes = response as PaginatedLike<Product>;
      const productsData: Product[] = Array.isArray(response)
        ? response
        : Array.isArray(anyRes?.products)
          ? anyRes.products
          : Array.isArray(anyRes?.data)
            ? anyRes.data
            : [];

      const meta = anyRes?.meta ?? anyRes?.pagination;
      setProducts(productsData);
      setTotalPages(meta?.totalPages || anyRes?.totalPages || 1);
      setTotal(meta?.total || anyRes?.total || productsData.length);
    } catch (err) {
      const errorMessage = err instanceof Error ? err.message : 'Failed to fetch products';
      setError(errorMessage);
      setProducts([]);
      notifyAuthError(errorMessage, 'Failed to load products');
    } finally {
      setLoading(false);
    }
  }, [page, search, archived]);

  useEffect(() => {
    fetchProducts();
  }, [fetchProducts]);

  const createProduct = async (
    data: ProductFormData,
    images: File[],
    thumbnail: File | null,
  ) => {
    const formData = new FormData();
    appendProductForm(formData, data);
    images.forEach((image) => formData.append('images', image));
    if (thumbnail) formData.append('thumbnail', thumbnail);

    try {
      const product = await productService.createProduct(formData);
      toast.success('Product created successfully');
      await fetchProducts();
      return product;
    } catch (err) {
      const errorMessage = err instanceof Error ? err.message : 'Failed to create product';
      notifyAuthError(errorMessage, 'Failed to create product');
      throw err;
    }
  };

  const updateProduct = async (
    id: string,
    data: ProductFormData,
    images: File[],
    thumbnail: File | null,
  ) => {
    const formData = new FormData();
    appendProductForm(formData, data);
    images.forEach((image) => formData.append('images', image));
    if (thumbnail) formData.append('thumbnail', thumbnail);

    try {
      const product = await productService.updateProduct(id, formData);
      toast.success('Product updated successfully');
      await fetchProducts();
      return product;
    } catch (err) {
      const errorMessage = err instanceof Error ? err.message : 'Failed to update product';
      notifyAuthError(errorMessage, 'Failed to update product');
      throw err;
    }
  };

  const deleteProduct = async (id: string) => {
    try {
      await productService.archiveProduct(id);
      toast.success('Product archived');
      await fetchProducts();
    } catch (err) {
      const errorMessage = err instanceof Error ? err.message : 'Failed to archive product';
      notifyAuthError(errorMessage, 'Failed to archive product');
      throw err;
    }
  };

  const archiveProduct = deleteProduct;

  const restoreProduct = async (id: string) => {
    try {
      await productService.restoreProduct(id);
      toast.success('Product restored (unpublished)');
      await fetchProducts();
    } catch (err) {
      const errorMessage = err instanceof Error ? err.message : 'Failed to restore product';
      notifyAuthError(errorMessage, 'Failed to restore product');
      throw err;
    }
  };

  const publishProduct = async (id: string) => {
    try {
      await productService.setPublished(id, true);
      toast.success('Product published');
      await fetchProducts();
    } catch (err) {
      const errorMessage = err instanceof Error ? err.message : 'Failed to publish product';
      notifyAuthError(errorMessage, 'Failed to publish product');
      throw err;
    }
  };

  const unpublishProduct = async (id: string) => {
    try {
      await productService.setPublished(id, false);
      toast.success('Product unpublished');
      await fetchProducts();
    } catch (err) {
      const errorMessage = err instanceof Error ? err.message : 'Failed to unpublish product';
      notifyAuthError(errorMessage, 'Failed to unpublish product');
      throw err;
    }
  };

  return {
    products,
    loading,
    error,
    page,
    totalPages,
    total,
    search,
    archived,
    setPage,
    setSearch: (value: string) => {
      setSearch(value);
      setPage(1);
    },
    setArchived: (value: boolean) => {
      setArchived(value);
      setPage(1);
    },
    fetchProducts,
    createProduct,
    updateProduct,
    deleteProduct,
    archiveProduct,
    restoreProduct,
    publishProduct,
    unpublishProduct,
  };
}

interface PaginatedLike<T> {
  products?: T[];
  data?: T[];
  total?: number;
  totalPages?: number;
  meta?: { total?: number; totalPages?: number };
  pagination?: { total?: number; totalPages?: number };
}

export function useAllProducts(excludeId?: string) {
  const [allProducts, setAllProducts] = useState<Product[]>([]);
  const [loading, setLoading] = useState(false);

  const fetchAllProducts = useCallback(async () => {
    setLoading(true);
    try {
      const response = await productService.getProducts(1, 50, '', false);
      const anyRes = response as PaginatedLike<Product>;
      let productsData: Product[] = [];
      if (Array.isArray(response)) {
        productsData = response;
      } else if (Array.isArray(anyRes?.products)) {
        productsData = anyRes.products;
      } else if (Array.isArray(anyRes?.data)) {
        productsData = anyRes.data;
      }
      setAllProducts(productsData);
    } catch {
      setAllProducts([]);
    } finally {
      setLoading(false);
    }
  }, []);

  useEffect(() => {
    fetchAllProducts();
  }, [fetchAllProducts]);

  const selectableProducts = excludeId
    ? allProducts.filter((p) => p._id !== excludeId)
    : allProducts;

  return { products: selectableProducts, loading, fetchAllProducts };
}

export function useCategories() {
  const [categories, setCategories] = useState<Category[]>([]);
  const [loading, setLoading] = useState(false);

  const fetchCategories = useCallback(async () => {
    setLoading(true);
    try {
      const data = await productService.getCategories();
      setCategories(data || []);
    } catch (err) {
      const errorMessage = err instanceof Error ? err.message : 'Failed to load categories';
      notifyAuthError(errorMessage, 'Failed to load categories');
      setCategories([]);
    } finally {
      setLoading(false);
    }
  }, []);

  useEffect(() => {
    fetchCategories();
  }, [fetchCategories]);

  return { categories, loading, fetchCategories };
}

export function useSubCategories(categoryId?: string) {
  const [subCategories, setSubCategories] = useState<SubCategory[]>([]);
  const [loading, setLoading] = useState(false);
  const [allSubCategories, setAllSubCategories] = useState<SubCategory[]>([]);

  const fetchAllSubCategories = useCallback(async () => {
    setLoading(true);
    try {
      const data = await productService.getSubCategories();
      setAllSubCategories(data || []);
    } catch (err) {
      const errorMessage = err instanceof Error ? err.message : 'Failed to load subcategories';
      notifyAuthError(errorMessage, 'Failed to load subcategories');
      setAllSubCategories([]);
    } finally {
      setLoading(false);
    }
  }, []);

  useEffect(() => {
    fetchAllSubCategories();
  }, [fetchAllSubCategories]);

  useEffect(() => {
    if (categoryId && allSubCategories.length > 0) {
      const filtered = allSubCategories.filter((sub) =>
        typeof sub.category === 'string'
          ? sub.category === categoryId
          : (sub.category as Category)._id === categoryId,
      );
      setSubCategories(filtered);
    } else {
      setSubCategories([]);
    }
  }, [categoryId, allSubCategories]);

  return { subCategories, loading, allSubCategories, fetchAllSubCategories };
}
