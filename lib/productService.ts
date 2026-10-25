// src/services/productService.ts

import api from '@/lib/axios';
import { Product, Category, SubCategory, PaginatedResponse, ApiResponse } from '@/Type/products';

class ProductService {
  private handleResponse<T>(response: { data: T }): T {
    return response.data;
  }

  private handleError(error: unknown): never {
    const err = error as {
      response?: { status?: number; data?: { message?: string; error?: string } };
      request?: unknown;
      message?: string;
    };
    if (err.response) {
      const status = err.response.status;
      const message = err.response.data?.message || err.response.data?.error || 'An error occurred';

      if (status === 401 || status === 403) {
        throw new Error('Session expired. Please login again.');
      }

      throw new Error(message);
    } else if (err.request) {
      throw new Error('No response from server. Please check your connection.');
    } else {
      throw new Error(err.message || 'An unexpected error occurred');
    }
  }

  private mapProduct(item: Record<string, unknown>): Product {
    return {
      _id: String(item._id || item.id || ''),
      name: String(item.name || ''),
      slug: String(item.slug || ''),
      shortDescription: String(item.shortDescription || ''),
      longDescription: String(item.longDescription || ''),
      category: (item.category as Product['category']) || '',
      subCategory: (item.subCategory as Product['subCategory']) || '',
      price: Number(item.price || 0),
      discount: Number(item.discount || 0),
      finalPrice: Number(item.finalPrice || item.price || 0),
      stock: Number(item.stock || 0),
      thumbnailImage: String(item.thumbnailImage || ''),
      images: (item.images as string[]) || [],
      color: (item.color as string[]) || [],
      size: (item.size as string[]) || [],
      suggestionItems: (item.suggestionItems as string[]) || [],
      sku: item.sku as string | undefined,
      brand: item.brand as string | undefined,
      material: item.material as string | undefined,
      dimensions: item.dimensions as string | undefined,
      careInstructions: item.careInstructions as string | undefined,
      seoTitle: item.seoTitle as string | undefined,
      seoDescription: item.seoDescription as string | undefined,
      features: (item.features as string[]) || [],
      specifications: (item.specifications as Product['specifications']) || [],
      isFeatured: Boolean(item.isFeatured),
      isArchived: Boolean(item.isArchived),
      isActive: Boolean(item.isActive),
      status: item.isActive ? 'active' : 'inactive',
      variants: (item.variants as Product['variants']) || [],
      created_date: String(item.created_date || item.createdAt || ''),
      updated_date: String(item.updated_date || item.updatedAt || ''),
      createdAt: String(item.created_date || item.createdAt || ''),
      updatedAt: String(item.updated_date || item.updatedAt || ''),
    };
  }

  async getProducts(
    page = 1,
    limit = 10,
    search = '',
    archived?: boolean,
  ): Promise<PaginatedResponse<Product>> {
    try {
      const response = await api.get('/products/admin', {
        params: {
          page,
          limit,
          search: search || undefined,
          archived,
        },
      });

      const payload = response.data;
      const productsData: Record<string, unknown>[] = Array.isArray(payload?.data) ? payload.data : [];
      const meta = payload?.meta ?? payload?.pagination ?? {};
      const total = Number(meta.total ?? productsData.length);
      const resolvedPage = Number(meta.page ?? page);
      const resolvedLimit = Number(meta.limit ?? limit);
      const totalPages = Number(meta.totalPages ?? (Math.ceil(total / resolvedLimit) || 1));

      return {
        products: productsData.map((item) => this.mapProduct(item)),
        total,
        page: resolvedPage,
        limit: resolvedLimit,
        totalPages,
      };
    } catch (error) {
      return this.handleError(error);
    }
  }

  async getProduct(id: string): Promise<Product> {
    try {
      const response = await api.get(`/products/admin/${id}`);
      const data = this.handleResponse<ApiResponse<Product>>(response);
      return this.mapProduct(data.data as unknown as Record<string, unknown>);
    } catch (error) {
      return this.handleError(error);
    }
  }

  async createProduct(data: FormData): Promise<Product> {
    try {
      const response = await api.post('/products', data);
      const result = this.handleResponse<ApiResponse<Product>>(response);
      return result.data;
    } catch (error) {
      return this.handleError(error);
    }
  }

  async updateProduct(id: string, data: FormData): Promise<Product> {
    try {
      const response = await api.patch(`/products/${id}`, data);
      const result = this.handleResponse<ApiResponse<Product>>(response);
      return result.data;
    } catch (error) {
      return this.handleError(error);
    }
  }

  /** Kept for existing callers — archives instead of hard-deleting. */
  async deleteProduct(id: string): Promise<void> {
    await this.archiveProduct(id);
  }

  async archiveProduct(id: string): Promise<void> {
    try {
      await api.patch(`/products/${id}/archive`);
    } catch (error) {
      return this.handleError(error);
    }
  }

  async restoreProduct(id: string): Promise<void> {
    try {
      await api.patch(`/products/${id}/restore`);
    } catch (error) {
      return this.handleError(error);
    }
  }

  async setPublished(id: string, published: boolean): Promise<void> {
    try {
      await api.patch(`/products/${id}/${published ? 'publish' : 'unpublish'}`);
    } catch (error) {
      return this.handleError(error);
    }
  }

  async getCategories(): Promise<Category[]> {
    try {
      const response = await api.get('/categories');
      const data = this.handleResponse<ApiResponse<Category[]>>(response);
      return data.data || [];
    } catch (error) {
      console.error('Error fetching categories:', error);
      return [];
    }
  }

  async getSubCategories(): Promise<SubCategory[]> {
    try {
      const response = await api.get('/subcategories');
      const data = this.handleResponse<ApiResponse<SubCategory[]>>(response);
      return data.data || [];
    } catch (error) {
      console.error('Error fetching subcategories:', error);
      return [];
    }
  }

  async getSubCategoriesByCategory(categoryId: string): Promise<SubCategory[]> {
    try {
      const allSubCategories = await this.getSubCategories();
      return allSubCategories.filter((sub) =>
        typeof sub.category === 'string'
          ? sub.category === categoryId
          : (sub.category as Category)._id === categoryId,
      );
    } catch (error) {
      console.error('Error fetching subcategories by category:', error);
      return [];
    }
  }

  async uploadImage(file: File): Promise<string> {
    try {
      const formData = new FormData();
      formData.append('image', file);

      const response = await api.post('/upload', formData, {
        headers: {
          'Content-Type': 'multipart/form-data',
        },
      });

      const data = this.handleResponse<{ url: string }>(response);
      return data.url;
    } catch (error) {
      return this.handleError(error);
    }
  }

  async addVariant(productId: string, data: FormData): Promise<unknown> {
    try {
      const response = await api.post(`/products/${productId}/variants`, data);
      return response.data;
    } catch (error) {
      return this.handleError(error);
    }
  }

  async updateVariant(productId: string, variantId: string, data: Record<string, unknown>): Promise<unknown> {
    try {
      const response = await api.patch(`/products/${productId}/variants/${variantId}`, data);
      return response.data;
    } catch (error) {
      return this.handleError(error);
    }
  }

  async deleteVariant(productId: string, variantId: string): Promise<void> {
    try {
      await api.delete(`/products/${productId}/variants/${variantId}`);
    } catch (error) {
      return this.handleError(error);
    }
  }

  async adjustVariantStock(
    productId: string,
    variantId: string,
    payload: { stock: number } | { delta: number },
  ): Promise<unknown> {
    try {
      const response = await api.patch(`/products/${productId}/variants/${variantId}/stock`, payload);
      return response.data;
    } catch (error) {
      return this.handleError(error);
    }
  }

  async uploadVariantImages(productId: string, variantId: string, images: File[]): Promise<unknown> {
    try {
      const form = new FormData();
      images.forEach((file) => form.append('images', file));
      const response = await api.post(`/products/${productId}/variants/${variantId}/images`, form);
      return response.data;
    } catch (error) {
      return this.handleError(error);
    }
  }

  async removeVariantImage(productId: string, variantId: string, url: string): Promise<unknown> {
    try {
      const response = await api.post(`/products/${productId}/variants/${variantId}/images/remove`, { url });
      return response.data;
    } catch (error) {
      return this.handleError(error);
    }
  }

  async reorderVariantImages(productId: string, variantId: string, images: string[]): Promise<unknown> {
    try {
      const response = await api.patch(`/products/${productId}/variants/${variantId}/images/order`, { images });
      return response.data;
    } catch (error) {
      return this.handleError(error);
    }
  }

  async setPrimaryVariantImage(productId: string, variantId: string, url: string): Promise<unknown> {
    try {
      const response = await api.patch(`/products/${productId}/variants/${variantId}/images/primary`, { url });
      return response.data;
    } catch (error) {
      return this.handleError(error);
    }
  }
}

export const productService = new ProductService();
