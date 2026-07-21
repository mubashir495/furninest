import api, { getApiErrorMessage } from '@/lib/axios';
import { Category, SubCategory, CatalogCategory } from '@/Type/category';

export const categoryService = {
  async getCategories(): Promise<Category[]> {
    try {
      const { data } = await api.get('/categories');
      return data.data ?? [];
    } catch (error) {
      throw new Error(getApiErrorMessage(error, 'Could not load categories.'));
    }
  },

  async getCategoryBySlug(slug: string): Promise<Category> {
    try {
      const { data } = await api.get(`/categories/slug/${slug}`);
      return data.data;
    } catch (error) {
      throw new Error(getApiErrorMessage(error, 'Category not found.'));
    }
  },

  async getCategoryById(id: string): Promise<Category> {
    const { data } = await api.get(`/categories/${id}`);
    return data.data;
  },

  async getSubCategories(): Promise<SubCategory[]> {
    try {
      const { data } = await api.get('/subcategories');
      return data.data ?? [];
    } catch (error) {
      throw new Error(getApiErrorMessage(error, 'Could not load subcategories.'));
    }
  },

  async getSubCategoriesByCategory(categoryId: string): Promise<SubCategory[]> {
    try {
      const { data } = await api.get(`/subcategories/category/${categoryId}`);
      return data.data ?? [];
    } catch (error) {
      throw new Error(getApiErrorMessage(error));
    }
  },

  async getSubCategoryBySlug(slug: string): Promise<SubCategory> {
    try {
      const { data } = await api.get(`/subcategories/slug/${slug}`);
      return data.data;
    } catch (error) {
      throw new Error(getApiErrorMessage(error, 'Subcategory not found.'));
    }
  },

  // Full category → subcategory → product tree in one call (used for mega-menus, home page)
  async getCatalogTree(): Promise<CatalogCategory[]> {
    try {
      const { data } = await api.get('/products/catalog-tree');
      return data.data ?? [];
    } catch (error) {
      throw new Error(getApiErrorMessage(error, 'Could not load catalog.'));
    }
  },
};
