import api, { getApiErrorMessage } from '@/lib/axios';
import { Product, ProductDetail, ProductFilter } from '@/Type/product';

// NOTE: the backend's GET /products has no search/pagination/filter query
// params — it always returns the full catalog. All filtering, sorting, and
// pagination below happens on the client against that full list.

export const productService = {
  async getAllProducts(): Promise<Product[]> {
    try {
      const { data } = await api.get('/products');
      return data.data ?? [];
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

  // Client-side search across name / shortDescription (backend has no /search route)
  searchProducts(products: Product[], query: string): Product[] {
    const q = query.trim().toLowerCase();
    if (!q) return products;
    return products.filter(
      (p) =>
        p.name.toLowerCase().includes(q) ||
        p.shortDescription.toLowerCase().includes(q),
    );
  },

  applyFilters(products: Product[], filter: ProductFilter): Product[] {
    let result = [...products];

    if (filter.search) {
      result = this.searchProducts(result, filter.search);
    }
    if (filter.categoryId) {
      result = result.filter((p) =>
        typeof p.category === 'string' ? p.category === filter.categoryId : p.category._id === filter.categoryId,
      );
    }
    if (filter.subCategoryId) {
      result = result.filter((p) =>
        typeof p.subCategory === 'string'
          ? p.subCategory === filter.subCategoryId
          : p.subCategory._id === filter.subCategoryId,
      );
    }
    if (filter.minPrice !== undefined) {
      result = result.filter((p) => p.finalPrice >= filter.minPrice!);
    }
    if (filter.maxPrice !== undefined) {
      result = result.filter((p) => p.finalPrice <= filter.maxPrice!);
    }
    if (filter.inStock) {
      result = result.filter((p) => p.stock > 0);
    }
    if (filter.onSale) {
      result = result.filter((p) => p.discount > 0);
    }

    switch (filter.sortBy) {
      case 'price-asc':
        result.sort((a, b) => a.finalPrice - b.finalPrice);
        break;
      case 'price-desc':
        result.sort((a, b) => b.finalPrice - a.finalPrice);
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
};
