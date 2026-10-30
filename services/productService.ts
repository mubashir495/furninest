import api, { getApiErrorMessage } from '@/lib/axios';
import {
  Product,
  ProductDetail,
  ProductFilter,
  getProductInStock,
  getProductPriceInfo,
} from '@/Type/product';

export interface ProductListQuery {
  page?: number;
  limit?: number;
  search?: string;
  category?: string;
  subCategory?: string;
  minPrice?: number;
  maxPrice?: number;
  sort?: 'newest' | 'price_asc' | 'price_desc' | 'name';
  inStock?: boolean;
  featured?: boolean;
}

export interface ProductListMeta {
  page: number;
  limit: number;
  total: number;
  totalPages: number;
}

// GET /products with no query returns the full catalog (legacy behaviour) and the
// shop page filters it client-side with applyFilters. GET /products also supports
// page/limit/search/sort/... — use getProductsPage() for real server-side paging.

export const productService = {
  async getAllProducts(): Promise<Product[]> {
    try {
      const { data } = await api.get('/products');
      return data.data ?? [];
    } catch (error) {
      throw new Error(getApiErrorMessage(error, 'Could not load products.'));
    }
  },

  /** Server-side search / filter / sort / pagination. */
  async getProductsPage(query: ProductListQuery): Promise<{ data: Product[]; meta: ProductListMeta }> {
    try {
      const { data } = await api.get('/products', { params: query });
      return {
        data: data.data ?? [],
        meta: data.meta ?? { page: 1, limit: data.data?.length ?? 0, total: data.data?.length ?? 0, totalPages: 1 },
      };
    } catch (error) {
      throw new Error(getApiErrorMessage(error, 'Could not load products.'));
    }
  },

  async getProductsByCategory(categoryId: string): Promise<Product[]> {
    try {
      const { data } = await api.get(`/products/category/${categoryId}`);
      return data.data ?? [];
    } catch (error) {
      throw new Error(getApiErrorMessage(error));
    }
  },

  async getProductsBySubCategory(subCategoryId: string): Promise<Product[]> {
    try {
      const { data } = await api.get(`/products/subcategory/${subCategoryId}`);
      return data.data ?? [];
    } catch (error) {
      throw new Error(getApiErrorMessage(error));
    }
  },

  async getProductBySlug(slug: string): Promise<ProductDetail> {
    try {
      const { data } = await api.get(`/products/slug/${slug}`);
      return data.data;
    } catch (error) {
      throw new Error(getApiErrorMessage(error, 'Product not found.'));
    }
  },

  async getProductById(id: string): Promise<ProductDetail> {
    try {
      const { data } = await api.get(`/products/${id}`);
      return data.data;
    } catch (error) {
      throw new Error(getApiErrorMessage(error, 'Product not found.'));
    }
  },

  searchProducts(products: Product[], query: string): Product[] {
    const q = query.trim().toLowerCase();
    if (!q) return products;
    return products.filter(
      (p) =>
        p.name.toLowerCase().includes(q) ||
        (p.shortDescription ?? '').toLowerCase().includes(q) ||
        (p.brand ?? '').toLowerCase().includes(q),
    );
  },

  applyFilters(products: Product[], filter: ProductFilter): Product[] {
    let result = Array.isArray(products) ? [...products].filter((p): p is Product => Boolean(p && p._id)) : [];

    if (filter.search) {
      result = this.searchProducts(result, filter.search);
    }
    if (filter.categoryId) {
      result = result.filter((p) => {
        if (!p.category) return false;
        const catId = typeof p.category === 'string' ? p.category : (p.category as any)?._id || (p.category as any)?.id;
        return catId && String(catId) === String(filter.categoryId);
      });
    }
    if (filter.subCategoryId) {
      result = result.filter((p) => {
        if (!p.subCategory) return false;
        const subId = typeof p.subCategory === 'string' ? p.subCategory : (p.subCategory as any)?._id || (p.subCategory as any)?.id;
        return subId && String(subId) === String(filter.subCategoryId);
      });
    }
    // Prices / stock / sale are variant-aware (cheapest active variant for variant products)
    if (filter.minPrice !== undefined) {
      result = result.filter((p) => getProductPriceInfo(p).max >= filter.minPrice!);
    }
    if (filter.maxPrice !== undefined) {
      result = result.filter((p) => getProductPriceInfo(p).price <= filter.maxPrice!);
    }
    if (filter.inStock) {
      result = result.filter((p) => getProductInStock(p));
    }
    if (filter.onSale) {
      result = result.filter((p) => getProductPriceInfo(p).original !== null);
    }

    switch (filter.sortBy) {
      case 'price-asc':
        result.sort((a, b) => getProductPriceInfo(a).price - getProductPriceInfo(b).price);
        break;
      case 'price-desc':
        result.sort((a, b) => getProductPriceInfo(b).price - getProductPriceInfo(a).price);
        break;
      case 'newest':
        result.sort((a, b) => new Date(b.created_date).getTime() - new Date(a.created_date).getTime());
        break;
      case 'name-asc':
        result.sort((a, b) => a.name.localeCompare(b.name));
        break;
      default:
        break; // 'featured' — keep backend order
    }

    return result;
  },

  // ── Admin: product state ───────────────────────────────────────────────────

  async archiveProduct(productId: string): Promise<unknown> {
    try {
      const { data } = await api.patch(`/products/${productId}/archive`);
      return data;
    } catch (error) {
      throw new Error(getApiErrorMessage(error, 'Could not archive product.'));
    }
  },

  async restoreProduct(productId: string): Promise<unknown> {
    try {
      const { data } = await api.patch(`/products/${productId}/restore`);
      return data;
    } catch (error) {
      throw new Error(getApiErrorMessage(error, 'Could not restore product.'));
    }
  },

  async setPublished(productId: string, published: boolean): Promise<unknown> {
    try {
      const { data } = await api.patch(`/products/${productId}/${published ? 'publish' : 'unpublish'}`);
      return data;
    } catch (error) {
      throw new Error(getApiErrorMessage(error, 'Could not update publish status.'));
    }
  },

  // ── Admin: variants ────────────────────────────────────────────────────────

  async addVariant(productId: string, data: FormData): Promise<unknown> {
    try {
      const { data: res } = await api.post(`/products/${productId}/variants`, data, {
        headers: { 'Content-Type': 'multipart/form-data' },
      });
      return res;
    } catch (error) {
      throw new Error(getApiErrorMessage(error, 'Could not add variant.'));
    }
  },

  async updateVariant(productId: string, variantId: string, data: Record<string, unknown>): Promise<unknown> {
    try {
      const { data: res } = await api.patch(`/products/${productId}/variants/${variantId}`, data);
      return res;
    } catch (error) {
      throw new Error(getApiErrorMessage(error, 'Could not update variant.'));
    }
  },

  async adjustVariantStock(
    productId: string,
    variantId: string,
    payload: { stock: number } | { delta: number },
  ): Promise<unknown> {
    try {
      const { data: res } = await api.patch(`/products/${productId}/variants/${variantId}/stock`, payload);
      return res;
    } catch (error) {
      throw new Error(getApiErrorMessage(error, 'Could not update stock.'));
    }
  },

  async deleteVariant(productId: string, variantId: string): Promise<void> {
    try {
      await api.delete(`/products/${productId}/variants/${variantId}`);
    } catch (error) {
      throw new Error(getApiErrorMessage(error, 'Could not delete variant.'));
    }
  },

  async uploadVariantImages(productId: string, variantId: string, images: File[]): Promise<unknown> {
    try {
      const form = new FormData();
      images.forEach((f) => form.append('images', f));
      const { data: res } = await api.post(`/products/${productId}/variants/${variantId}/images`, form, {
        headers: { 'Content-Type': 'multipart/form-data' },
      });
      return res;
    } catch (error) {
      throw new Error(getApiErrorMessage(error, 'Could not upload variant images.'));
    }
  },

  async removeVariantImage(productId: string, variantId: string, url: string): Promise<unknown> {
    try {
      const { data: res } = await api.post(`/products/${productId}/variants/${variantId}/images/remove`, { url });
      return res;
    } catch (error) {
      throw new Error(getApiErrorMessage(error, 'Could not remove image.'));
    }
  },

  /** `images` = every current image URL of the variant, in the new order. */
  async reorderVariantImages(productId: string, variantId: string, images: string[]): Promise<unknown> {
    try {
      const { data: res } = await api.patch(`/products/${productId}/variants/${variantId}/images/order`, { images });
      return res;
    } catch (error) {
      throw new Error(getApiErrorMessage(error, 'Could not reorder images.'));
    }
  },

  async setPrimaryVariantImage(productId: string, variantId: string, url: string): Promise<unknown> {
    try {
      const { data: res } = await api.patch(`/products/${productId}/variants/${variantId}/images/primary`, { url });
      return res;
    } catch (error) {
      throw new Error(getApiErrorMessage(error, 'Could not set primary image.'));
    }
  },
};
