import { useState, useEffect, useCallback } from 'react';
import { Product, Category, SubCategory, ProductFormData } from '@/Type/products';
import { productService } from '@/lib/productService';
import { toast } from 'react-hot-toast';

export function useProducts() {
  const [products, setProducts] = useState<Product[]>([]);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [page, setPage] = useState(1);
  const [totalPages, setTotalPages] = useState(1);
  const [search, setSearch] = useState('');
  const [total, setTotal] = useState(0);

  const fetchProducts = useCallback(async () => {
    setLoading(true);
    setError(null);
    try {
      const response = await productService.getProducts(page, 10, search);
      setProducts(response.data || []);
      setTotalPages(response.pagination?.totalPages || 1);
      setTotal(response.pagination?.total || 0);
    } catch (err) {
      const errorMessage = err instanceof Error ? err.message : 'Failed to fetch products';
      setError(errorMessage);
      setProducts([]);

      if (errorMessage.includes('Session expired') || errorMessage.includes('login again')) {
        toast.error('Session expired. Please login again.');
      } else {
        toast.error('Failed to load products');
      }
    } finally {
      setLoading(false);
    }
  }, [page, search]);

  useEffect(() => {
    fetchProducts();
  }, [fetchProducts]);

  const createProduct = async (
    data: ProductFormData,
    images: File[],
    thumbnail: File | null,
  ) => {
    const formData = new FormData();

    formData.append('name', data.name);
    formData.append('shortDescription', data.shortDescription);
    formData.append('longDescription', data.longDescription);
    formData.append('subCategory', data.subCategory);
    formData.append('price', data.price.toString());
    formData.append('discount', data.discount.toString());
    formData.append('stock', data.stock.toString());

    (data.color || []).forEach((c) => formData.append('color', c));
    (data.size || []).forEach((s) => formData.append('size', s));

    // Gallery images (multiple)
    images.forEach((image) => {
      formData.append('images', image);
    });

    // Thumbnail (single, separate field key)
    if (thumbnail) {
      formData.append('thumbnail', thumbnail);
    }

    try {
      const product = await productService.createProduct(formData);
      toast.success('Product created successfully');
      await fetchProducts();
      return product;
    } catch (err) {
      const errorMessage = err instanceof Error ? err.message : 'Failed to create product';

      if (errorMessage.includes('Session expired') || errorMessage.includes('login again')) {
        toast.error('Session expired. Please login again.');
      } else {
        toast.error('Failed to create product');
      }
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

    formData.append('name', data.name);
    formData.append('shortDescription', data.shortDescription);
    formData.append('longDescription', data.longDescription);
    formData.append('subCategory', data.subCategory);
    formData.append('price', data.price.toString());
    formData.append('discount', data.discount.toString());
    formData.append('stock', data.stock.toString());

    (data.color || []).forEach((c) => formData.append('color', c));
    (data.size || []).forEach((s) => formData.append('size', s));

    images.forEach((image) => {
      formData.append('images', image);
    });

    if (thumbnail) {
      formData.append('thumbnail', thumbnail);
    }

    try {
      const product = await productService.updateProduct(id, formData);
      toast.success('Product updated successfully');
      await fetchProducts();
      return product;
    } catch (err) {
      const errorMessage = err instanceof Error ? err.message : 'Failed to update product';

      if (errorMessage.includes('Session expired') || errorMessage.includes('login again')) {
        toast.error('Session expired. Please login again.');
      } else {
        toast.error('Failed to update product');
      }
      throw err;
    }
  };

  const deleteProduct = async (id: string) => {
    try {
      await productService.deleteProduct(id);
      toast.success('Product deleted successfully');
      await fetchProducts();
    } catch (err) {
      const errorMessage = err instanceof Error ? err.message : 'Failed to delete product';

      if (errorMessage.includes('Session expired') || errorMessage.includes('login again')) {
        toast.error('Session expired. Please login again.');
      } else {
        toast.error('Failed to delete product');
      }
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
    setPage,
    setSearch,
    fetchProducts,
    createProduct,
    updateProduct,
    deleteProduct,
  };
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

      if (errorMessage.includes('Session expired') || errorMessage.includes('login again')) {
        toast.error('Session expired. Please login again.');
      } else {
        toast.error('Failed to load categories');
      }
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

      if (errorMessage.includes('Session expired') || errorMessage.includes('login again')) {
        toast.error('Session expired. Please login again.');
      } else {
        toast.error('Failed to load subcategories');
      }
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
      const filtered = allSubCategories.filter(
        sub => typeof sub.category === 'string'
          ? sub.category === categoryId
          : (sub.category as Category)._id === categoryId
      );
      setSubCategories(filtered);
    } else {
      setSubCategories([]);
    }
  }, [categoryId, allSubCategories]);

  return { subCategories, loading, allSubCategories, fetchAllSubCategories };
}